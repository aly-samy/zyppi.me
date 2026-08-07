import { describe, it, expect } from "vitest";
import { FrozenRegistryRepository } from "@zyppi/testing";
import {
  type EvidenceBundle,
  verifyEvidenceBundle,
  canonicalizeJcs,
} from "@zyppi/domain";
import { RegistryEvidenceResolver } from "./evidenceResolver.js";
import crypto from "crypto";

describe("Evidence Hash Verification Integration — IT-0703", () => {
  // Define real structured payloads
  const docPayload = {
    documentType: "passport",
    country: "US",
    nested: { expired: false },
  };
  const sealPayload = {
    sealStatus: "intact",
    location: "Aura Labs Warehouse",
  };

  // Canonical JCS strings
  const docJcs = canonicalizeJcs(docPayload);
  const sealJcs = canonicalizeJcs(sealPayload);

  // Compute registered hashes
  const docHashHex = crypto
    .createHash("sha256")
    .update(docJcs, "utf8")
    .digest("hex");
  const sealHashHex = crypto
    .createHash("sha256")
    .update(sealJcs, "utf8")
    .digest("hex");

  // Snapshots for the Registry DB
  const TEST_SNAPSHOT = {
    "identity-1": {
      identity: {
        identityId: "id-abc",
        identityType: "product",
        canonicalReference: "identity-1",
        referentId: null,
        status: "active" as const,
        createdAt: "2026-07-28T12:00:00Z",
        updatedAt: "2026-07-28T12:00:00Z",
      },
      relationships: [],
      standings: [],
      authorities: [],
      capabilities: [],
      evidenceReferences: [
        {
          evidenceId: "ev-doc",
          identityId: "id-abc",
          evidenceType: "document_verification",
          hash: `sha256:${docHashHex}`,
          storageRef: "r2://bucket/doc.json",
          retrievedAt: "2026-07-28T12:00:00Z",
        },
        {
          evidenceId: "ev-seal",
          identityId: "id-abc",
          evidenceType: "seal_check",
          hash: `sha256:${sealHashHex}`,
          storageRef: "r2://bucket/seal.json",
          retrievedAt: "2026-07-28T12:00:00Z",
        },
      ],
      applicablePolicies: [],
    },
  };

  it("successfully demonstrates end-to-end integration flow from Resolver to Verification", async () => {
    // 1. Initialize Registry Repository and RegistryEvidenceResolver (IT-0702)
    const repository = new FrozenRegistryRepository(TEST_SNAPSHOT);
    const resolver = new RegistryEvidenceResolver(repository);

    // 2. Resolve references to produce a validated and frozen EvidenceBundle
    const resolveResult = await resolver.resolve(["ev-doc", "ev-seal"]);
    expect(resolveResult.ok).toBe(true);

    if (resolveResult.ok) {
      const bundle: EvidenceBundle = resolveResult.value;
      expect(bundle.evidenceRecords).toHaveLength(2);

      // 3. Prepare payload map (orchestrated by the application layer)
      const payloads = new Map<string, unknown>([
        ["ev-doc", docPayload],
        ["ev-seal", sealPayload],
      ]);

      // 4. Verify Evidence Bundle deterministic integrity (IT-0703)
      const report = verifyEvidenceBundle(bundle, payloads);

      // 5. Assert overall bundle validity and verification report properties
      expect(report.isValid).toBe(true);
      expect(report.aggregateBundleDigest).toBeDefined();
      expect(report.aggregateBundleDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(report.errorCode).toBeUndefined();

      expect(report.records).toHaveLength(2);
      expect(report.records[0]).toEqual({
        evidenceId: "ev-doc",
        valid: true,
        computedHash: `sha256:${docHashHex}`,
        registeredHash: `sha256:${docHashHex}`,
      });
      expect(report.records[1]).toEqual({
        evidenceId: "ev-seal",
        valid: true,
        computedHash: `sha256:${sealHashHex}`,
        registeredHash: `sha256:${sealHashHex}`,
      });

      // Verify aggregate digest uniqueness/determinism manually
      const expectedHashes = [`sha256:${docHashHex}`, `sha256:${sealHashHex}`];
      // Sort as ev-doc comes before ev-seal alphabetically, already correct
      const expectedCanonicalArray = canonicalizeJcs(expectedHashes);
      const expectedHex = crypto
        .createHash("sha256")
        .update(expectedCanonicalArray, "utf8")
        .digest("hex");
      expect(report.aggregateBundleDigest).toBe(`sha256:${expectedHex}`);
    }
  });

  it("correctly identifies payload corruption/mismatches in the integration flow", async () => {
    const repository = new FrozenRegistryRepository(TEST_SNAPSHOT);
    const resolver = new RegistryEvidenceResolver(repository);

    const resolveResult = await resolver.resolve(["ev-doc"]);
    expect(resolveResult.ok).toBe(true);

    if (resolveResult.ok) {
      const bundle = resolveResult.value;

      // Provide a corrupted payload for ev-doc
      const corruptedDocPayload = {
        ...docPayload,
        nested: { expired: true }, // mutated boolean
      };

      const payloads = new Map<string, unknown>([
        ["ev-doc", corruptedDocPayload],
      ]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(false);
      expect(report.aggregateBundleDigest).toBeUndefined();
      expect(report.records[0].valid).toBe(false);
      expect(report.records[0].errorCode).toBe("HASH_MISMATCH");
      expect(report.records[0].computedHash).toBeDefined();
      expect(report.records[0].computedHash).not.toBe(`sha256:${docHashHex}`);
    }
  });
});
