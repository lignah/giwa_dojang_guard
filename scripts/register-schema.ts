/**
 * Register Dojang Guard audit schema on GIWA Sepolia SchemaRegistry.
 *
 * Usage:
 *   export PRIVATE_KEY=0x...
 *   pnpm schema:register
 *
 * Output: deployments/schema.json + prints SCHEMA_UID for .env
 */
import "dotenv/config";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isHex, type Hex } from "viem";
import {
  AUDIT_SCHEMA,
  CHAIN_ID,
  SCHEMA_REGISTRY_ADDRESS,
} from "../src/lib/config";
import {
  getPublicClient,
  getWalletClient,
  registerSchema,
} from "../src/lib/eas";

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk || !isHex(pk)) {
    console.error(
      "❌ Set PRIVATE_KEY (0x-prefixed hex) in .env or environment."
    );
    console.error("   Example: PRIVATE_KEY=0xabc... pnpm schema:register");
    process.exit(1);
  }

  const publicClient = getPublicClient();
  const { account, wallet } = getWalletClient(pk as Hex);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Dojang Guard — Schema Registration");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Chain ID   : ${CHAIN_ID} (GIWA Sepolia)`);
  console.log(`  Registry   : ${SCHEMA_REGISTRY_ADDRESS}`);
  console.log(`  Registerer : ${account.address}`);
  console.log(`  Schema     : ${AUDIT_SCHEMA}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`  Balance    : ${Number(balance) / 1e18} ETH`);
  if (balance === 0n) {
    console.warn(
      "⚠️  Wallet has 0 ETH. Get GIWA Sepolia faucet gas before continuing."
    );
  }

  const { schemaUID, txHash } = await registerSchema({
    wallet,
    account,
    publicClient,
    schema: AUDIT_SCHEMA,
    revocable: true,
  });

  const deployment = {
    schemaUID,
    schema: AUDIT_SCHEMA,
    resolver: "0x0000000000000000000000000000000000000000",
    revocable: true,
    txHash,
    registeredAt: new Date().toISOString(),
    chainId: CHAIN_ID,
    registerer: account.address,
  };

  const outDir = resolve(process.cwd(), "deployments");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "schema.json");
  writeFileSync(outPath, JSON.stringify(deployment, null, 2) + "\n");

  // Merge into .env.local hints
  const envHint = [
    "",
    "# --- Dojang Guard (auto from schema:register) ---",
    `SCHEMA_UID=${schemaUID}`,
    `NEXT_PUBLIC_SCHEMA_UID=${schemaUID}`,
    "",
  ].join("\n");

  console.log("\n✅ Schema registered successfully!\n");
  console.log(`  Schema UID : ${schemaUID}`);
  console.log(`  Tx Hash    : ${txHash}`);
  console.log(`  Saved to   : ${outPath}`);
  console.log("\nAdd to your .env / .env.local:\n");
  console.log(envHint);

  // Append to .env.local if present
  try {
    const envLocal = resolve(process.cwd(), ".env.local");
    let existing = "";
    if (existsSync(envLocal)) existing = readFileSync(envLocal, "utf8");
    if (!existing.includes(schemaUID)) {
      writeFileSync(envLocal, existing + envHint);
      console.log("  Appended SCHEMA_UID to .env.local");
    }
  } catch {
    /* ignore */
  }
}

main().catch((err) => {
  console.error("\n❌ register-schema failed:", err);
  process.exit(1);
});
