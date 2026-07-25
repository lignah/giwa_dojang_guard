import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  http,
  type Account,
  type Address,
  type Hex,
  type Log,
  zeroAddress,
  zeroHash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { easAbi, schemaRegistryAbi } from "./abis";
import {
  AUDIT_SCHEMA,
  EAS_ADDRESS,
  giwaSepolia,
  RPC_URL,
  SCHEMA_REGISTRY_ADDRESS,
  SCHEMA_UID,
} from "./config";
import { decodeAuditData, encodeAuditData } from "./schema";
import type {
  AuditAttestationData,
  DecodedAuditAttestation,
} from "./types";

/** GIWA public client (inferred; avoid exporting rigid PublicClient generics). */
export type GiwaPublicClient = ReturnType<typeof getPublicClient>;
export type GiwaWalletClient = ReturnType<typeof getWalletClient>["wallet"];

export function getPublicClient() {
  return createPublicClient({
    chain: giwaSepolia,
    transport: http(RPC_URL),
  });
}

export function getWalletClient(privateKey: Hex) {
  const account = privateKeyToAccount(privateKey);
  const wallet = createWalletClient({
    account,
    chain: giwaSepolia,
    transport: http(RPC_URL),
  });
  return { account, wallet };
}

export async function registerSchema(params: {
  wallet: GiwaWalletClient;
  account: Account;
  publicClient: GiwaPublicClient;
  schema?: string;
  resolver?: Address;
  revocable?: boolean;
}): Promise<{ schemaUID: Hex; txHash: Hex }> {
  const {
    wallet,
    account,
    publicClient,
    schema = AUDIT_SCHEMA,
    resolver = zeroAddress,
    revocable = true,
  } = params;

  const hash = await wallet.writeContract({
    address: SCHEMA_REGISTRY_ADDRESS,
    abi: schemaRegistryAbi,
    functionName: "register",
    args: [schema, resolver, revocable],
    account,
    chain: giwaSepolia,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`Schema registration failed: ${hash}`);
  }

  const schemaUID = parseRegisteredSchemaUid(receipt.logs);
  if (!schemaUID) {
    throw new Error(
      `Could not parse schema UID from receipt ${hash}. Check explorer.`
    );
  }

  return { schemaUID, txHash: hash };
}

/** Decode SchemaRegistry Registered event from tx receipt logs. */
function parseRegisteredSchemaUid(logs: Log[]): Hex | null {
  for (const log of logs) {
    if (log.address.toLowerCase() !== SCHEMA_REGISTRY_ADDRESS.toLowerCase()) {
      continue;
    }
    try {
      const decoded = decodeEventLog({
        abi: schemaRegistryAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "Registered" && decoded.args?.uid) {
        return decoded.args.uid as Hex;
      }
    } catch {
      // not this event
    }
  }
  // Fallback: indexed uid is topics[1] for Registered(bytes32 indexed uid, ...)
  for (const log of logs) {
    if (
      log.address.toLowerCase() === SCHEMA_REGISTRY_ADDRESS.toLowerCase() &&
      log.topics?.[1] &&
      log.topics[1].length === 66
    ) {
      return log.topics[1] as Hex;
    }
  }
  return null;
}

export async function issueAttestation(params: {
  wallet: GiwaWalletClient;
  account: Account;
  publicClient: GiwaPublicClient;
  schemaUID: Hex;
  data: AuditAttestationData;
  recipient?: Address;
  revocable?: boolean;
  expirationTime?: bigint;
}): Promise<{ uid: Hex; txHash: Hex }> {
  const {
    wallet,
    account,
    publicClient,
    schemaUID,
    data,
    recipient = data.contractAddress,
    revocable = true,
    expirationTime = 0n,
  } = params;

  const encoded = encodeAuditData(data);

  const hash = await wallet.writeContract({
    address: EAS_ADDRESS,
    abi: easAbi,
    functionName: "attest",
    args: [
      {
        schema: schemaUID,
        data: {
          recipient,
          expirationTime,
          revocable,
          refUID: zeroHash,
          data: encoded,
          value: 0n,
        },
      },
    ],
    account,
    chain: giwaSepolia,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`Attestation failed: ${hash}`);
  }

  const uid = parseAttestedUid(receipt.logs);
  if (!uid) {
    throw new Error(`Could not parse attestation UID from tx ${hash}`);
  }

  return { uid, txHash: hash };
}

function parseAttestedUid(logs: Log[]): Hex | null {
  for (const log of logs) {
    if (log.address.toLowerCase() !== EAS_ADDRESS.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: easAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "Attested" && decoded.args?.uid) {
        return decoded.args.uid as Hex;
      }
    } catch {
      // continue
    }
  }
  return null;
}

export async function getAttestationByUid(
  publicClient: GiwaPublicClient,
  uid: Hex
): Promise<DecodedAuditAttestation | null> {
  const raw = await publicClient.readContract({
    address: EAS_ADDRESS,
    abi: easAbi,
    functionName: "getAttestation",
    args: [uid],
  });

  if (!raw.uid || raw.uid === zeroHash) {
    return null;
  }

  const now = BigInt(Math.floor(Date.now() / 1000));
  const data = decodeAuditData(raw.data as Hex);

  return {
    uid: raw.uid,
    schema: raw.schema,
    time: raw.time,
    expirationTime: raw.expirationTime,
    revocationTime: raw.revocationTime,
    recipient: raw.recipient,
    attester: raw.attester,
    revocable: raw.revocable,
    data,
    isRevoked: raw.revocationTime > 0n,
    isExpired: raw.expirationTime > 0n && raw.expirationTime < now,
  };
}

/**
 * Find the latest non-revoked audit attestation for a contract address.
 * Scans Attested events for our schema where recipient == contract.
 */
export async function findLatestAuditForContract(params: {
  publicClient: GiwaPublicClient;
  contractAddress: Address;
  schemaUID?: Hex;
  fromBlock?: bigint;
  maxBlocks?: bigint;
}): Promise<DecodedAuditAttestation | null> {
  const {
    publicClient,
    contractAddress,
    schemaUID = SCHEMA_UID || undefined,
    fromBlock,
    maxBlocks = 500_000n,
  } = params;

  if (!schemaUID) {
    return null;
  }

  const latest = await publicClient.getBlockNumber();
  const start =
    fromBlock ?? (latest > maxBlocks ? latest - maxBlocks : 0n);

  const chunkSize = 10_000n;
  const uids: Hex[] = [];

  for (let from = start; from <= latest; from += chunkSize) {
    const to = from + chunkSize - 1n > latest ? latest : from + chunkSize - 1n;
    try {
      const logs = await publicClient.getContractEvents({
        address: EAS_ADDRESS,
        abi: easAbi,
        eventName: "Attested",
        args: {
          recipient: contractAddress,
          schema: schemaUID,
        },
        fromBlock: from,
        toBlock: to,
      });
      for (const log of logs) {
        if (log.args.uid) uids.push(log.args.uid as Hex);
      }
    } catch {
      // Some RPCs reject large ranges; skip chunk and continue
    }
  }

  if (uids.length === 0) {
    return null;
  }

  for (let i = uids.length - 1; i >= 0; i--) {
    const att = await getAttestationByUid(publicClient, uids[i]);
    if (att && !att.isRevoked) {
      if (
        att.data.contractAddress.toLowerCase() ===
        contractAddress.toLowerCase()
      ) {
        return att;
      }
      if (att.recipient.toLowerCase() === contractAddress.toLowerCase()) {
        return att;
      }
    }
  }

  return null;
}
