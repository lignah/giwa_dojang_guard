import type { Address } from "viem";
import { zeroHash } from "viem";
import { dojangScrollAbi, easAbi } from "./abis";
import {
  DOJANG_ATTESTER_ID_UPBIT,
  DOJANG_SCROLL_ADDRESS,
  EAS_ADDRESS,
} from "./config";
import type { GiwaPublicClient } from "./eas";

export interface DojangVerifiedResult {
  isVerified: boolean;
  attesterId: `0x${string}`;
  attestationUid?: `0x${string}`;
  expirationTime?: bigint;
  time?: bigint;
  attester?: Address;
}

/**
 * Query Dojang Verified Address (KYC) via DojangScroll + EAS.
 * Optional enhancement for the MVP demo.
 */
export async function getDojangVerifiedAddress(
  publicClient: GiwaPublicClient,
  address: Address,
  attesterId: `0x${string}` = DOJANG_ATTESTER_ID_UPBIT
): Promise<DojangVerifiedResult> {
  const isVerified = await publicClient.readContract({
    address: DOJANG_SCROLL_ADDRESS,
    abi: dojangScrollAbi,
    functionName: "isVerified",
    args: [address, attesterId],
  });

  if (!isVerified) {
    return { isVerified: false, attesterId };
  }

  const attestationUid = await publicClient.readContract({
    address: DOJANG_SCROLL_ADDRESS,
    abi: dojangScrollAbi,
    functionName: "getVerifiedAddressAttestationUid",
    args: [address, attesterId],
  });

  if (!attestationUid || attestationUid === zeroHash) {
    return { isVerified: true, attesterId, attestationUid };
  }

  try {
    const att = await publicClient.readContract({
      address: EAS_ADDRESS,
      abi: easAbi,
      functionName: "getAttestation",
      args: [attestationUid],
    });
    return {
      isVerified: true,
      attesterId,
      attestationUid,
      expirationTime: att.expirationTime,
      time: att.time,
      attester: att.attester,
    };
  } catch {
    return { isVerified: true, attesterId, attestationUid };
  }
}
