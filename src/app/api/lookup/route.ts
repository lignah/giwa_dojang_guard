import { NextRequest, NextResponse } from "next/server";
import { isAddress, type Address, type Hex } from "viem";
import { evaluateBadge } from "@/lib/badge";
import { SCHEMA_UID } from "@/lib/config";
import { findDemoAttestation } from "@/lib/demo-data";
import { getDojangVerifiedAddress } from "@/lib/dojang";
import {
  findLatestAuditForContract,
  getAttestationByUid,
  getPublicClient,
} from "@/lib/eas";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { IssuedAttestationRecord } from "@/lib/types";

function serializeAttestation(
  att: NonNullable<Awaited<ReturnType<typeof getAttestationByUid>>>,
  extra?: { source?: "onchain" | "local"; txHash?: string }
) {
  const badge = evaluateBadge(att.data, {
    isRevoked: att.isRevoked,
    isExpired: att.isExpired,
  });
  return {
    uid: att.uid,
    schema: att.schema,
    time: att.time.toString(),
    expirationTime: att.expirationTime.toString(),
    revocationTime: att.revocationTime.toString(),
    recipient: att.recipient,
    attester: att.attester,
    revocable: att.revocable,
    isRevoked: att.isRevoked,
    isExpired: att.isExpired,
    source: extra?.source ?? ("onchain" as const),
    txHash: extra?.txHash,
    data: {
      ...att.data,
      auditedAt: att.data.auditedAt.toString(),
    },
    badge,
  };
}

function loadLocalIssued(address: string): IssuedAttestationRecord | null {
  try {
    const path = resolve(process.cwd(), "deployments/attestations.json");
    if (!existsSync(path)) return null;
    const j = JSON.parse(readFileSync(path, "utf8")) as {
      attestations: IssuedAttestationRecord[];
    };
    const list = (j.attestations ?? []).filter(
      (a) => a.recipient.toLowerCase() === address.toLowerCase()
    );
    return list[list.length - 1] ?? null;
  } catch {
    return null;
  }
}

async function optionalDojang(publicClient: ReturnType<typeof getPublicClient>, contract: Address) {
  try {
    const d = await getDojangVerifiedAddress(publicClient, contract);
    return {
      ...d,
      expirationTime: d.expirationTime?.toString(),
      time: d.time?.toString(),
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const uidParam = req.nextUrl.searchParams.get("uid");

  if (uidParam && uidParam.startsWith("0x") && uidParam.length === 66) {
    try {
      const client = getPublicClient();
      const att = await getAttestationByUid(client, uidParam as Hex);
      if (!att) {
        return NextResponse.json(
          { error: "Attestation not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ attestation: serializeAttestation(att) });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Lookup failed" },
        { status: 500 }
      );
    }
  }

  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: "Valid address query param required" },
      { status: 400 }
    );
  }

  const contract = address as Address;
  const publicClient = getPublicClient();

  // 1) Fast path: known UID from deployments/attestations.json → getAttestation
  //    (avoids multi-minute log scans that feel like "tap does nothing" on mobile)
  const local = loadLocalIssued(contract);
  if (local?.uid && local.uid.startsWith("0x") && local.uid.length === 66) {
    try {
      const att = await getAttestationByUid(publicClient, local.uid as Hex);
      if (att) {
        return NextResponse.json({
          attestation: serializeAttestation(att, {
            source: "onchain",
            txHash: local.txHash,
          }),
          dojang: await optionalDojang(publicClient, contract),
        });
      }
    } catch (e) {
      console.warn("uid lookup failed, falling back", e);
    }

    // Local file still has the payload even if RPC fails
    const badge = evaluateBadge(
      {
        isPassed: local.data.isPassed,
        score: local.data.score,
        riskLevel: local.data.riskLevel,
      },
      {}
    );
    return NextResponse.json({
      attestation: {
        uid: local.uid,
        schema: SCHEMA_UID || "0x",
        time: local.data.auditedAt,
        expirationTime: "0",
        revocationTime: "0",
        recipient: local.recipient,
        attester: local.data.auditor,
        revocable: true,
        isRevoked: false,
        isExpired: false,
        source: "local" as const,
        data: local.data,
        badge,
        txHash: local.txHash,
      },
      dojang: await optionalDojang(publicClient, contract),
    });
  }

  // 2) Shallow recent-block log scan only (not full history)
  if (SCHEMA_UID) {
    try {
      const att = await findLatestAuditForContract({
        publicClient,
        contractAddress: contract,
        schemaUID: SCHEMA_UID as Hex,
        maxBlocks: 20_000n,
      });
      if (att) {
        return NextResponse.json({
          attestation: serializeAttestation(att),
          dojang: await optionalDojang(publicClient, contract),
        });
      }
    } catch (e) {
      console.warn("on-chain lookup failed", e);
    }
  }

  // 3) Built-in demo data
  const demo = findDemoAttestation(contract);
  if (demo) {
    const badge = evaluateBadge(demo.data, {
      isRevoked: demo.isRevoked,
      isExpired: demo.isExpired,
    });
    return NextResponse.json({
      attestation: {
        uid: demo.uid,
        schema: demo.schema,
        time: demo.time.toString(),
        expirationTime: demo.expirationTime.toString(),
        revocationTime: demo.revocationTime.toString(),
        recipient: demo.recipient,
        attester: demo.attester,
        revocable: demo.revocable,
        isRevoked: demo.isRevoked,
        isExpired: demo.isExpired,
        source: "demo" as const,
        data: {
          ...demo.data,
          auditedAt: demo.data.auditedAt.toString(),
        },
        badge,
      },
      dojang: await optionalDojang(publicClient, contract),
    });
  }

  return NextResponse.json(
    {
      error: "No audit attestation found for this address",
      attestation: null,
      dojang: await optionalDojang(publicClient, contract),
    },
    { status: 404 }
  );
}
