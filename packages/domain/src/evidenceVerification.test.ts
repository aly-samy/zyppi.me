import { describe, it, expect } from "vitest";
import {
  type EvidenceBundle,
  type EvidenceRecord,
  verifyEvidenceBundle,
} from "./index.js";
import crypto from "crypto";
import { canonicalizeJcs } from "./seed-helpers.js";

describe("Evidence Hash Verification — AMS-0703", () => {
  // Setup standard valid inputs
  const payload1 = { name: "Payload One", value: 42 };
  const payload2 = { name: "Payload Two", tags: ["a", "b"] };

  const serialized1 = canonicalizeJcs(payload1);
  const serialized2 = canonicalizeJcs(payload2);

  const hash1Hex = crypto
    .createHash("sha256")
    .update(serialized1, "utf8")
    .digest("hex");
  const hash2Hex = crypto
    .createHash("sha256")
    .update(serialized2, "utf8")
    .digest("hex");

  const validRecord1: EvidenceRecord = {
    evidenceId: "ev-001",
    identityId: "id-123",
    evidenceType: "doc_verification",
    hash: `sha256:${hash1Hex}`,
    storageRef: "r2://bucket/doc1.json",
    retrievedAt: "2026-07-28T12:00:00Z",
  };

  const validRecord2: EvidenceRecord = {
    evidenceId: "ev-002",
    identityId: "id-123",
    evidenceType: "seal_check",
    hash: `sha256:${hash2Hex}`,
    storageRef: "r2://bucket/doc2.json",
    retrievedAt: "2026-07-28T12:00:00Z",
  };

  describe("Successful Verification", () => {
    it("verifies a bundle with all valid records and generates aggregate digest", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord1, validRecord2],
      };

      const payloads = new Map<string, unknown>([
        ["ev-001", payload1],
        ["ev-002", payload2],
      ]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(true);
      expect(report.errorCode).toBeUndefined();
      expect(report.records).toHaveLength(2);

      expect(report.records[0]).toEqual({
        evidenceId: "ev-001",
        valid: true,
        computedHash: `sha256:${hash1Hex}`,
        registeredHash: `sha256:${hash1Hex}`,
      });

      expect(report.records[1]).toEqual({
        evidenceId: "ev-002",
        valid: true,
        computedHash: `sha256:${hash2Hex}`,
        registeredHash: `sha256:${hash2Hex}`,
      });

      // Verify that aggregate digest is generated
      expect(report.aggregateBundleDigest).toBeDefined();
      expect(report.aggregateBundleDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it("verifies correctly when payloads are provided as a plain JavaScript object", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord1],
      };

      const payloads = {
        "ev-001": payload1,
      };

      const report = verifyEvidenceBundle(bundle, payloads);
      expect(report.isValid).toBe(true);
      expect(report.records[0].valid).toBe(true);
    });
  });

  describe("Payload Missing", () => {
    it("reports PAYLOAD_MISSING if a payload is not supplied for an evidence record", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord1, validRecord2],
      };

      const payloads = new Map<string, unknown>([["ev-001", payload1]]); // ev-002 missing

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(false);
      expect(report.aggregateBundleDigest).toBeUndefined();
      expect(report.records).toHaveLength(2);
      expect(report.records[0].valid).toBe(true);
      expect(report.records[1]).toEqual({
        evidenceId: "ev-002",
        valid: false,
        registeredHash: `sha256:${hash2Hex}`,
        errorCode: "PAYLOAD_MISSING",
      });
    });
  });

  describe("Hash Mismatch", () => {
    it("reports HASH_MISMATCH when computed hash does not equal registered hash", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [
          {
            ...validRecord1,
            hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // empty hash instead of real
          },
        ],
      };

      const payloads = new Map<string, unknown>([["ev-001", payload1]]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(false);
      expect(report.aggregateBundleDigest).toBeUndefined();
      expect(report.records[0].valid).toBe(false);
      expect(report.records[0].errorCode).toBe("HASH_MISMATCH");
      expect(report.records[0].computedHash).toBe(`sha256:${hash1Hex}`);
    });
  });

  describe("Unsupported Algorithm", () => {
    it("reports UNSUPPORTED_HASH_ALGORITHM if algorithm prefix is not sha256", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [
          {
            ...validRecord1,
            hash: "sha512:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          },
        ],
      };

      const payloads = new Map<string, unknown>([["ev-001", payload1]]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(false);
      expect(report.records[0].valid).toBe(false);
      expect(report.records[0].errorCode).toBe("UNSUPPORTED_HASH_ALGORITHM");
    });
  });

  describe("Invalid Hash Format", () => {
    it("reports INVALID_HASH_FORMAT if there is no explicit algorithm prefix separator", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [
          {
            ...validRecord1,
            hash: "sha256_no_colon_1234567890abcdef1234567890abcdef1234567890abcdef12345678",
          },
        ],
      };

      const payloads = new Map<string, unknown>([["ev-001", payload1]]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(false);
      expect(report.records[0].valid).toBe(false);
      expect(report.records[0].errorCode).toBe("INVALID_HASH_FORMAT");
    });

    it("reports INVALID_HASH_FORMAT if hex length is not exactly 64", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [
          {
            ...validRecord1,
            hash: "sha256:12345", // too short
          },
        ],
      };

      const payloads = new Map<string, unknown>([["ev-001", payload1]]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(false);
      expect(report.records[0].valid).toBe(false);
      expect(report.records[0].errorCode).toBe("INVALID_HASH_FORMAT");
    });

    it("reports INVALID_HASH_FORMAT if non-hex characters are present in the digest portion", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [
          {
            ...validRecord1,
            hash: "sha256:zzzzzzzz98fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          },
        ],
      };

      const payloads = new Map<string, unknown>([["ev-001", payload1]]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(false);
      expect(report.records[0].valid).toBe(false);
      expect(report.records[0].errorCode).toBe("INVALID_HASH_FORMAT");
    });
  });

  describe("Preconditions & Canonical Payload Size Limits", () => {
    it("measures size of present payloads and fails with BUNDLE_LIMIT_EXCEEDED if aggregate size exceeds limit", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord1, validRecord2],
      };

      const payloads = new Map<string, unknown>([
        ["ev-001", payload1],
        ["ev-002", payload2],
      ]);

      // Calculate the size of serialized payloads
      const size1 = new TextEncoder().encode(serialized1).length;
      const size2 = new TextEncoder().encode(serialized2).length;
      const totalSize = size1 + size2;

      // Set maxBundleSize to be exactly totalSize - 1 (should fail)
      const report = verifyEvidenceBundle(bundle, payloads, {
        maxBundleSize: totalSize - 1,
      });

      expect(report.isValid).toBe(false);
      expect(report.errorCode).toBe("BUNDLE_LIMIT_EXCEEDED");
      expect(report.records).toHaveLength(0); // Omitted/empty records on precondition failure
    });

    it("passes precondition validation if aggregate size is within the limit", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord1],
      };

      const payloads = new Map<string, unknown>([["ev-001", payload1]]);

      const size1 = new TextEncoder().encode(serialized1).length;

      const report = verifyEvidenceBundle(bundle, payloads, {
        maxBundleSize: size1,
      });

      expect(report.isValid).toBe(true);
      expect(report.errorCode).toBeUndefined();
    });
  });

  describe("Deterministic Behavior & Immutability", () => {
    it("guarantees byte-identical outputs across repeated evaluations", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord1, validRecord2],
      };

      const payloads = new Map<string, unknown>([
        ["ev-001", payload1],
        ["ev-002", payload2],
      ]);

      const report1 = verifyEvidenceBundle(bundle, payloads);
      const report2 = verifyEvidenceBundle(bundle, payloads);

      expect(JSON.stringify(report1)).toBe(JSON.stringify(report2));
      expect(report1.aggregateBundleDigest).toBe(report2.aggregateBundleDigest);
    });

    it("deeply freezes all report and result objects", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord1],
      };

      const payloads = new Map<string, unknown>([["ev-001", payload1]]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(Object.isFrozen(report)).toBe(true);
      expect(Object.isFrozen(report.records)).toBe(true);
      expect(Object.isFrozen(report.records[0])).toBe(true);
    });
  });

  describe("Aggregate Digest Generation & Ordering Independence", () => {
    it("sorts records lexically by evidenceId when computing the aggregate digest, ensuring ordering independence", () => {
      // Create two bundles with different record orderings
      const bundleOrderA: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord1, validRecord2], // ev-001, then ev-002
      };

      const bundleOrderB: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validRecord2, validRecord1], // ev-002, then ev-001
      };

      const payloads = new Map<string, unknown>([
        ["ev-001", payload1],
        ["ev-002", payload2],
      ]);

      const reportA = verifyEvidenceBundle(bundleOrderA, payloads);
      const reportB = verifyEvidenceBundle(bundleOrderB, payloads);

      // The reports' `records` lists reflect input ordering, but aggregateBundleDigest must be identical
      expect(reportA.isValid).toBe(true);
      expect(reportB.isValid).toBe(true);
      expect(reportA.aggregateBundleDigest).toBe(reportB.aggregateBundleDigest);

      // Verify digest correctness by reconstructing the expected hash manually
      const orderedHashes = [
        `sha256:${hash1Hex}`, // ev-001
        `sha256:${hash2Hex}`, // ev-002
      ];
      const canonicalHashesStr = canonicalizeJcs(orderedHashes);
      const expectedAggregateHex = crypto
        .createHash("sha256")
        .update(canonicalHashesStr, "utf8")
        .digest("hex");
      const expectedAggregateDigest = "sha256:" + expectedAggregateHex;

      expect(reportA.aggregateBundleDigest).toBe(expectedAggregateDigest);
    });

    it("omits the aggregate digest if any record fails verification", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [
          validRecord1,
          { ...validRecord2, hash: "sha256:mismatch" },
        ],
      };

      const payloads = new Map<string, unknown>([
        ["ev-001", payload1],
        ["ev-002", payload2],
      ]);

      const report = verifyEvidenceBundle(bundle, payloads);

      expect(report.isValid).toBe(false);
      expect(report.aggregateBundleDigest).toBeUndefined();
    });
  });

  describe("Canonical Payload Serialization Determinism", () => {
    it("ensures that key order in payloads does not affect computed hash or verification success", () => {
      const payloadA = { z: 1, a: 2, m: { nestedZ: "z", nestedA: "a" } };
      const payloadB = { a: 2, z: 1, m: { nestedA: "a", nestedZ: "z" } };

      const serialized = canonicalizeJcs(payloadA);
      const hashHex = crypto
        .createHash("sha256")
        .update(serialized, "utf8")
        .digest("hex");

      const record: EvidenceRecord = {
        evidenceId: "ev-001",
        identityId: "id-123",
        evidenceType: "test",
        hash: `sha256:${hashHex}`,
        storageRef: "r2://bucket/ref",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [record],
      };

      // Verify with payloadA (first key ordering)
      const reportA = verifyEvidenceBundle(
        bundle,
        new Map([["ev-001", payloadA]]),
      );
      expect(reportA.isValid).toBe(true);

      // Verify with payloadB (second key ordering)
      const reportB = verifyEvidenceBundle(
        bundle,
        new Map([["ev-001", payloadB]]),
      );
      expect(reportB.isValid).toBe(true);
      expect(reportA.aggregateBundleDigest).toBe(reportB.aggregateBundleDigest);
    });
  });
});
