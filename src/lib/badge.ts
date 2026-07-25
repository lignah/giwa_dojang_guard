import {
  BADGE_ALLOWED_RISKS,
  BADGE_MIN_SCORE,
  BADGE_NAME,
} from "./config";
import type { AuditAttestationData, RiskLevel } from "./types";

export interface BadgeResult {
  eligible: boolean;
  name: string;
  reason: string;
}

/**
 * GIWA Verified Secure badge rules (MVP):
 * - isPassed === true
 * - score >= 70
 * - riskLevel is Low or Medium
 * - attestation not revoked / expired (checked by caller)
 */
export function evaluateBadge(
  data: Pick<AuditAttestationData, "isPassed" | "score" | "riskLevel">,
  opts?: { isRevoked?: boolean; isExpired?: boolean }
): BadgeResult {
  if (opts?.isRevoked) {
    return {
      eligible: false,
      name: BADGE_NAME,
      reason: "Attestation has been revoked",
    };
  }
  if (opts?.isExpired) {
    return {
      eligible: false,
      name: BADGE_NAME,
      reason: "Attestation has expired",
    };
  }
  if (!data.isPassed) {
    return {
      eligible: false,
      name: BADGE_NAME,
      reason: "Audit did not pass",
    };
  }
  if (data.score < BADGE_MIN_SCORE) {
    return {
      eligible: false,
      name: BADGE_NAME,
      reason: `Score ${data.score} is below minimum ${BADGE_MIN_SCORE}`,
    };
  }
  if (!BADGE_ALLOWED_RISKS.includes(data.riskLevel as (typeof BADGE_ALLOWED_RISKS)[number])) {
    return {
      eligible: false,
      name: BADGE_NAME,
      reason: `Risk level "${data.riskLevel}" is not eligible (need Low or Medium)`,
    };
  }
  return {
    eligible: true,
    name: BADGE_NAME,
    reason: "Passed security audit with acceptable risk",
  };
}

export function riskTone(risk: RiskLevel): "good" | "warn" | "bad" | "critical" {
  switch (risk) {
    case "Low":
      return "good";
    case "Medium":
      return "warn";
    case "High":
      return "bad";
    case "Critical":
      return "critical";
  }
}
