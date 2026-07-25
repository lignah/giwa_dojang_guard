import {
  decodeAbiParameters,
  encodeAbiParameters,
  parseAbiParameters,
  type Hex,
} from "viem";
import { AUDIT_SCHEMA } from "./config";
import type { AuditAttestationData, RiskLevel } from "./types";

export const schemaParams = parseAbiParameters(AUDIT_SCHEMA);

export function encodeAuditData(data: AuditAttestationData): Hex {
  return encodeAbiParameters(schemaParams, [
    data.contractAddress,
    data.auditor,
    data.auditorName,
    data.score,
    data.riskLevel,
    data.isPassed,
    data.reportURI,
    data.auditedAt,
    data.version,
  ]);
}

export function decodeAuditData(data: Hex): AuditAttestationData {
  const decoded = decodeAbiParameters(schemaParams, data);
  return {
    contractAddress: decoded[0],
    auditor: decoded[1],
    auditorName: decoded[2],
    score: Number(decoded[3]),
    riskLevel: decoded[4] as RiskLevel,
    isPassed: decoded[5],
    reportURI: decoded[6],
    auditedAt: decoded[7],
    version: decoded[8],
  };
}

export function isRiskLevel(value: string): value is RiskLevel {
  return ["Low", "Medium", "High", "Critical"].includes(value);
}
