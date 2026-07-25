import { parseAbi } from "viem";

export const schemaRegistryAbi = parseAbi([
  "function register(string schema, address resolver, bool revocable) external returns (bytes32)",
  "function getSchema(bytes32 uid) external view returns ((bytes32 uid, address resolver, bool revocable, string schema))",
  "event Registered(bytes32 indexed uid, address indexed registerer, (bytes32 uid, address resolver, bool revocable, string schema) schema)",
]);

export const easAbi = parseAbi([
  "function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data) request) external payable returns (bytes32)",
  "function getAttestation(bytes32 uid) external view returns ((bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address recipient, address attester, bool revocable, bytes data))",
  "function isAttestationValid(bytes32 uid) external view returns (bool)",
  "function getSchemaRegistry() external pure returns (address)",
  "function version() external view returns (string)",
  "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)",
  "event Revoked(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)",
]);

export const dojangScrollAbi = parseAbi([
  "function isVerified(address addr, bytes32 attesterId) external view returns (bool)",
  "function getVerifiedAddressAttestationUid(address addr, bytes32 attesterId) external view returns (bytes32)",
]);
