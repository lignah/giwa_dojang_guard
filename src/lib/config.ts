import { defineChain } from "viem";
import { giwaSepolia as viemGiwaSepolia } from "viem/chains";

/** Prefer viem built-in GIWA Sepolia; fall back to explicit definition. */
export const giwaSepolia =
  viemGiwaSepolia ??
  defineChain({
    id: 91342,
    name: "GIWA Sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://sepolia-rpc.giwa.io"] },
    },
    blockExplorers: {
      default: {
        name: "GIWA Explorer",
        url: "https://sepolia-explorer.giwa.io",
      },
    },
    testnet: true,
  });

export const CHAIN_ID = 91342;
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ??
  process.env.RPC_URL ??
  "https://sepolia-rpc.giwa.io";
export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ??
  "https://sepolia-explorer.giwa.io";

/** Predeployed EAS on GIWA (Optimism-style predeploys). */
export const SCHEMA_REGISTRY_ADDRESS =
  "0x4200000000000000000000000000000000000020" as const;
export const EAS_ADDRESS =
  "0x4200000000000000000000000000000000000021" as const;

/** Dojang Guard official auditor / attester. */
export const AUDITOR_ADDRESS =
  "0xa59C77f05A10719a374b7667DAbcfd2f9b1C2549" as const;
export const AUDITOR_NAME = "Dojang Guard Auditor";

export const BADGE_NAME = "GIWA Verified Secure";
export const PROJECT_NAME = "Dojang Guard";
export const SCHEMA_VERSION = "v1.0";

/**
 * EAS schema string (must match registration exactly).
 * Field order is part of the schema identity.
 */
export const AUDIT_SCHEMA =
  "address contractAddress,address auditor,string auditorName,uint8 score,string riskLevel,bool isPassed,string reportURI,uint64 auditedAt,string version";

/** Optional: set after running `pnpm schema:register`. */
export const SCHEMA_UID = (process.env.NEXT_PUBLIC_SCHEMA_UID ??
  process.env.SCHEMA_UID ??
  "") as `0x${string}` | "";

/** Dojang Verified Address (KYC) integration. */
export const DOJANG_SCROLL_ADDRESS =
  "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9" as const;

/** keccak256("dojang.dojangattesterids.upbitkorea") */
export const DOJANG_ATTESTER_ID_UPBIT =
  "0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034" as const;

/** Badge eligibility thresholds. */
export const BADGE_MIN_SCORE = 70;
export const BADGE_ALLOWED_RISKS = ["Low", "Medium"] as const;

/**
 * reportURI targets (HTML under /public/reports → served as /reports/*.html).
 *
 * IMPORTANT: Do NOT use raw.githubusercontent.com or jsDelivr for HTML —
 * they serve Content-Type: text/plain, so browsers show source instead of
 * rendering the page. Prefer app-relative paths (works on localhost + Vercel).
 */
export const GITHUB_REPO = "lignah/giwa_dojang_guard";
export const REPORT_URIS = {
  safe: "/reports/safe-v1.html",
  medium: "/reports/medium-v1.html",
  critical: "/reports/critical-v1.html",
  /** @deprecated alias — same as top-level keys */
  local: {
    safe: "/reports/safe-v1.html",
    medium: "/reports/medium-v1.html",
    critical: "/reports/critical-v1.html",
  },
} as const;

/**
 * Turn stored reportURI into a browser URL that actually *renders* HTML.
 * - /reports/foo.html → {origin}/reports/foo.html
 * - jsDelivr / GitHub raw / blob URLs → rewrite to same-origin /reports/foo.html
 */
export function resolveReportURI(uri: string, origin?: string): string {
  if (!uri) return uri;

  const fileMatch = uri.match(
    /(?:\/reports\/|public\/reports\/)([\w.-]+\.html)/i
  );
  if (fileMatch) {
    const path = `/reports/${fileMatch[1]}`;
    if (origin) return `${origin.replace(/\/$/, "")}${path}`;
    return path;
  }

  if (uri.startsWith("/")) {
    if (origin) return `${origin.replace(/\/$/, "")}${uri}`;
    return uri;
  }

  return uri;
}

export function explorerAddress(address: string) {
  return `${EXPLORER_URL}/address/${address}`;
}

export function explorerTx(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function explorerAttestation(uid: string) {
  // GIWA explorer may not have EAS UI; link to EAS getAttestation via address page fallback
  return `${EXPLORER_URL}/tx/${uid}`;
}
