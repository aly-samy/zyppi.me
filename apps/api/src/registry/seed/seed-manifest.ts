import type {
  ReferentRecord,
  IdentityRecord,
  EvidenceRecord,
  PolicyRecord,
  AuthorityRecord,
  CapabilityRecord,
  StandingRecord,
} from "@zyppi/domain";

export interface SeedManifestRecords {
  readonly referents: readonly ReferentRecord[];
  readonly identities: readonly IdentityRecord[];
  readonly evidence: readonly EvidenceRecord[];
  readonly policies: readonly PolicyRecord[];
  readonly authorities: readonly AuthorityRecord[];
  readonly capabilities: readonly CapabilityRecord[];
  readonly standings: readonly StandingRecord[];
}

export interface SeedManifest {
  readonly manifestId: string;
  readonly manifestVersion: "1.0.0";
  readonly authorityReference: string;
  readonly keyId: string;
  readonly integrityAlgorithm: "SHA-256";
  readonly integrityDigest: string;
  readonly signatureAlgorithm: "Ed25519";
  readonly signature: string;
  readonly records: SeedManifestRecords;
}
