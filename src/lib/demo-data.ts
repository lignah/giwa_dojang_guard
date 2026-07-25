/**
 * Local demo attestations for UI / demo video when chain writes
 * have not been run yet (or SCHEMA_UID is unset).
 *
 * Replace with on-chain data after:
 *   pnpm schema:register
 *   pnpm attest:issue
 */
import type { DecodedAuditAttestation } from "./types";
import { AUDITOR_ADDRESS, AUDITOR_NAME, REPORT_URIS } from "./config";

const now = BigInt(Math.floor(Date.now() / 1000));

export const DEMO_CONTRACTS = {
  /** Passed — shows GIWA Verified Secure badge */
  safe: "0x1111111111111111111111111111111111111111" as const,
  /** Borderline pass — Medium risk, still badge-eligible */
  medium: "0x2222222222222222222222222222222222222222" as const,
  /** Failed — Critical, no badge */
  critical: "0x3333333333333333333333333333333333333333" as const,
};

export const DEMO_ATTESTATIONS: DecodedAuditAttestation[] = [
  {
    uid: "0xdemo000000000000000000000000000000000000000000000000000000000001",
    schema: "0xdemoSchema0000000000000000000000000000000000000000000000000001",
    time: now - 86400n,
    expirationTime: 0n,
    revocationTime: 0n,
    recipient: DEMO_CONTRACTS.safe,
    attester: AUDITOR_ADDRESS,
    revocable: true,
    isRevoked: false,
    isExpired: false,
    data: {
      contractAddress: DEMO_CONTRACTS.safe,
      auditor: AUDITOR_ADDRESS,
      auditorName: AUDITOR_NAME,
      score: 92,
      riskLevel: "Low",
      isPassed: true,
      reportURI: REPORT_URIS.local.safe,
      auditedAt: now - 86400n,
      version: "v1.0",
    },
  },
  {
    uid: "0xdemo000000000000000000000000000000000000000000000000000000000002",
    schema: "0xdemoSchema0000000000000000000000000000000000000000000000000001",
    time: now - 3600n,
    expirationTime: 0n,
    revocationTime: 0n,
    recipient: DEMO_CONTRACTS.medium,
    attester: AUDITOR_ADDRESS,
    revocable: true,
    isRevoked: false,
    isExpired: false,
    data: {
      contractAddress: DEMO_CONTRACTS.medium,
      auditor: AUDITOR_ADDRESS,
      auditorName: AUDITOR_NAME,
      score: 78,
      riskLevel: "Medium",
      isPassed: true,
      reportURI: REPORT_URIS.local.medium,
      auditedAt: now - 3600n,
      version: "v1.0",
    },
  },
  {
    uid: "0xdemo000000000000000000000000000000000000000000000000000000000003",
    schema: "0xdemoSchema0000000000000000000000000000000000000000000000000001",
    time: now - 7200n,
    expirationTime: 0n,
    revocationTime: 0n,
    recipient: DEMO_CONTRACTS.critical,
    attester: AUDITOR_ADDRESS,
    revocable: true,
    isRevoked: false,
    isExpired: false,
    data: {
      contractAddress: DEMO_CONTRACTS.critical,
      auditor: AUDITOR_ADDRESS,
      auditorName: "Dojang Guard Auditor",
      score: 34,
      riskLevel: "Critical",
      isPassed: false,
      reportURI: REPORT_URIS.local.critical,
      auditedAt: now - 7200n,
      version: "v1.0",
    },
  },
];

export function findDemoAttestation(
  address: string
): DecodedAuditAttestation | null {
  const lower = address.toLowerCase();
  const matches = DEMO_ATTESTATIONS.filter(
    (a) => a.data.contractAddress.toLowerCase() === lower
  );
  return matches[matches.length - 1] ?? null;
}
