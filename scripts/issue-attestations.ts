/**
 * Issue mock security audit attestations on GIWA Sepolia EAS.
 *
 * Usage:
 *   export PRIVATE_KEY=0x...
 *   export SCHEMA_UID=0x...   # from schema:register
 *   pnpm attest:issue
 *
 * Issues 3 mock audits (Low/Medium/Critical) for demo contracts.
 */
import "dotenv/config";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isAddress, isHex, type Hex } from "viem";
import {
  AUDITOR_ADDRESS,
  AUDITOR_NAME,
  CHAIN_ID,
  EAS_ADDRESS,
  SCHEMA_UID as ENV_SCHEMA_UID,
  SCHEMA_VERSION,
  REPORT_URIS,
} from "../src/lib/config";
import {
  getPublicClient,
  getWalletClient,
  issueAttestation,
} from "../src/lib/eas";
import type { AuditAttestationData, IssuedAttestationRecord } from "../src/lib/types";

function loadSchemaUid(): Hex {
  if (ENV_SCHEMA_UID && isHex(ENV_SCHEMA_UID) && ENV_SCHEMA_UID.length === 66) {
    return ENV_SCHEMA_UID;
  }
  const path = resolve(process.cwd(), "deployments/schema.json");
  if (existsSync(path)) {
    const j = JSON.parse(readFileSync(path, "utf8"));
    if (j.schemaUID && isHex(j.schemaUID)) return j.schemaUID as Hex;
  }
  throw new Error(
    "SCHEMA_UID not set. Run `pnpm schema:register` first, or set SCHEMA_UID in .env"
  );
}

function mockAudits(now: bigint): AuditAttestationData[] {
  return [
    {
      contractAddress: "0x1111111111111111111111111111111111111111",
      auditor: AUDITOR_ADDRESS,
      auditorName: AUDITOR_NAME,
      score: 92,
      riskLevel: "Low",
      isPassed: true,
      // App-relative so Next serves text/html (not jsDelivr text/plain)
      reportURI: REPORT_URIS.safe,
      auditedAt: now - 86400n,
      version: SCHEMA_VERSION,
    },
    {
      contractAddress: "0x2222222222222222222222222222222222222222",
      auditor: AUDITOR_ADDRESS,
      auditorName: AUDITOR_NAME,
      score: 78,
      riskLevel: "Medium",
      isPassed: true,
      reportURI: REPORT_URIS.medium,
      auditedAt: now - 3600n,
      version: SCHEMA_VERSION,
    },
    {
      contractAddress: "0x3333333333333333333333333333333333333333",
      auditor: AUDITOR_ADDRESS,
      auditorName: AUDITOR_NAME,
      score: 34,
      riskLevel: "Critical",
      isPassed: false,
      reportURI: REPORT_URIS.critical,
      auditedAt: now - 7200n,
      version: SCHEMA_VERSION,
    },
  ];
}

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk || !isHex(pk)) {
    console.error("❌ Set PRIVATE_KEY (0x-prefixed hex) in .env");
    process.exit(1);
  }

  const schemaUID = loadSchemaUid();
  const publicClient = getPublicClient();
  const { account, wallet } = getWalletClient(pk as Hex);
  const now = BigInt(Math.floor(Date.now() / 1000));
  const audits = mockAudits(now);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Dojang Guard — Issue Attestations");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Chain ID   : ${CHAIN_ID}`);
  console.log(`  EAS        : ${EAS_ADDRESS}`);
  console.log(`  Schema UID : ${schemaUID}`);
  console.log(`  Attester   : ${account.address}`);
  console.log(`  Count      : ${audits.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (account.address.toLowerCase() !== AUDITOR_ADDRESS.toLowerCase()) {
    console.warn(
      `⚠️  Signer ${account.address} != configured auditor ${AUDITOR_ADDRESS}`
    );
    console.warn(
      "   Attestations will still be issued; attester on-chain = signer.\n"
    );
  }

  const records: IssuedAttestationRecord[] = [];

  for (const [i, data] of audits.entries()) {
    if (!isAddress(data.contractAddress)) {
      throw new Error(`Invalid contract: ${data.contractAddress}`);
    }
    console.log(
      `[${i + 1}/${audits.length}] ${data.contractAddress}` +
        `  score=${data.score} risk=${data.riskLevel} passed=${data.isPassed}`
    );

    const { uid, txHash } = await issueAttestation({
      wallet,
      account,
      publicClient,
      schemaUID,
      data,
      recipient: data.contractAddress,
    });

    console.log(`     uid=${uid}`);
    console.log(`     tx =${txHash}\n`);

    records.push({
      uid,
      txHash,
      recipient: data.contractAddress,
      data: {
        ...data,
        auditedAt: data.auditedAt.toString(),
      },
    });
  }

  const outDir = resolve(process.cwd(), "deployments");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "attestations.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        schemaUID,
        chainId: CHAIN_ID,
        attester: account.address,
        issuedAt: new Date().toISOString(),
        attestations: records,
      },
      null,
      2
    ) + "\n"
  );

  console.log("✅ All mock attestations issued.");
  console.log(`   Saved to ${outPath}`);
  console.log("\nDemo contracts to search in the UI:");
  for (const r of records) {
    console.log(
      `  ${r.data.contractAddress}  →  ${r.data.riskLevel} / score ${r.data.score}`
    );
  }
}

main().catch((err) => {
  console.error("\n❌ issue-attestations failed:", err);
  process.exit(1);
});
