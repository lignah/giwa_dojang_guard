export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface AuditAttestationData {
  contractAddress: `0x${string}`;
  auditor: `0x${string}`;
  auditorName: string;
  score: number;
  riskLevel: RiskLevel;
  isPassed: boolean;
  reportURI: string;
  auditedAt: bigint;
  version: string;
}

export interface DecodedAuditAttestation {
  uid: `0x${string}`;
  schema: `0x${string}`;
  time: bigint;
  expirationTime: bigint;
  revocationTime: bigint;
  recipient: `0x${string}`;
  attester: `0x${string}`;
  revocable: boolean;
  data: AuditAttestationData;
  isRevoked: boolean;
  isExpired: boolean;
}

export interface IssuedAttestationRecord {
  uid: `0x${string}`;
  txHash: `0x${string}`;
  recipient: `0x${string}`;
  data: {
    contractAddress: `0x${string}`;
    auditor: `0x${string}`;
    auditorName: string;
    score: number;
    riskLevel: RiskLevel;
    isPassed: boolean;
    reportURI: string;
    auditedAt: string;
    version: string;
  };
}

export interface SchemaDeployment {
  schemaUID: `0x${string}`;
  schema: string;
  resolver: `0x${string}`;
  revocable: boolean;
  txHash: `0x${string}`;
  registeredAt: string;
  chainId: number;
}
