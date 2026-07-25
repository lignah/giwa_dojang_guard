/**
 * CLI lookup: contract address → latest audit attestation + badge.
 *
 * Usage:
 *   pnpm attest:lookup 0x1111...
 */
import "dotenv/config";
import { isAddress, type Address } from "viem";
import { evaluateBadge } from "../src/lib/badge";
import { findDemoAttestation } from "../src/lib/demo-data";
import {
  findLatestAuditForContract,
  getPublicClient,
} from "../src/lib/eas";
import { SCHEMA_UID } from "../src/lib/config";
import { getDojangVerifiedAddress } from "../src/lib/dojang";

async function main() {
  const input = process.argv[2];
  if (!input || !isAddress(input)) {
    console.error("Usage: pnpm attest:lookup <contractAddress>");
    process.exit(1);
  }
  const address = input as Address;

  console.log(`Looking up audit for ${address}...\n`);

  const publicClient = getPublicClient();
  let att = null;

  if (SCHEMA_UID) {
    att = await findLatestAuditForContract({
      publicClient,
      contractAddress: address,
    });
  }

  if (!att) {
    att = findDemoAttestation(address);
    if (att) {
      console.log("(using demo/local data — set SCHEMA_UID for on-chain)\n");
    }
  }

  if (!att) {
    console.log("No audit attestation found.");
    process.exit(0);
  }

  const badge = evaluateBadge(att.data, {
    isRevoked: att.isRevoked,
    isExpired: att.isExpired,
  });

  console.log("── Audit Result ──────────────────────");
  console.log(`  UID        : ${att.uid}`);
  console.log(`  Contract   : ${att.data.contractAddress}`);
  console.log(`  Score      : ${att.data.score}/100`);
  console.log(`  Risk       : ${att.data.riskLevel}`);
  console.log(`  Passed     : ${att.data.isPassed}`);
  console.log(`  Auditor    : ${att.data.auditorName} (${att.data.auditor})`);
  console.log(`  Attester   : ${att.attester}`);
  console.log(
    `  Audited at : ${new Date(Number(att.data.auditedAt) * 1000).toISOString()}`
  );
  console.log(`  Report     : ${att.data.reportURI}`);
  console.log(`  Version    : ${att.data.version}`);
  console.log(
    `  Badge      : ${badge.eligible ? "✅ " + badge.name : "❌ not eligible"}`
  );
  console.log(`  Reason     : ${badge.reason}`);

  try {
    const dojang = await getDojangVerifiedAddress(publicClient, address);
    console.log("\n── Dojang Verified Address ───────────");
    console.log(`  Verified   : ${dojang.isVerified ? "Yes" : "No"}`);
    if (dojang.attestationUid) {
      console.log(`  UID        : ${dojang.attestationUid}`);
    }
  } catch (e) {
    console.log("\n(Dojang lookup skipped)", e);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
