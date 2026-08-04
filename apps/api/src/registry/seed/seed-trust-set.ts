export interface SeedTrustKeyEntry {
  readonly keyId: string;
  readonly algorithm: "Ed25519";
  readonly publicKey: string; // Base64-encoded raw Ed25519 public key (32 bytes)
  readonly status: "active" | "revoked";
}

/**
 * BINDING DETERMINATION: Production trust set is empty.
 * No production signing authority or seed corpus is ratified.
 */
export const PRODUCTION_TRUST_SET: readonly SeedTrustKeyEntry[] = [];
