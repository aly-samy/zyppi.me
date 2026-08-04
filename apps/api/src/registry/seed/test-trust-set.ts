import type { SeedTrustKeyEntry } from "./seed-trust-set.js";

/**
 * Isolated test trust set containing test public keys only.
 * No private keys or signing material is committed to the repository.
 */
export const TEST_TRUST_SET: readonly SeedTrustKeyEntry[] = [
  {
    keyId: "zyppi-seed-ed25519-2026-v1",
    algorithm: "Ed25519",
    publicKey: "JOQaatYCnfSsVwzAPFB6+RTBg4fvEswA6KlMOQjqfSE=",
    status: "active",
  },
  {
    keyId: "zyppi-seed-ed25519-2026-revoked",
    algorithm: "Ed25519",
    publicKey: "JOQaatYCnfSsVwzAPFB6+RTBg4fvEswA6KlMOQjqfSE=",
    status: "revoked",
  },
];
