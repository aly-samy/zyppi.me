/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import type { RetrievedRegistryState } from "@zyppi/contracts";
import { verifyEvidenceBundle, canonicalizeJcs } from "@zyppi/domain";
import { FrozenRegistryRepository } from "@zyppi/testing";
import { ObjectStorageEvidencePayloadProvider } from "./objectStorageEvidencePayloadProvider.js";
import { RegistryEvidenceResolver } from "../registry/evidenceResolver.js";
import crypto from "crypto";

// A realistic, concrete implementation of ObjectStorageClient for integration testing
class LocalMemoryObjectStorageClient {
  private readonly dataStore: Record<string, string>;

  constructor(dataStore: Record<string, string>) {
    this.dataStore = { ...dataStore };
  }

  async getObject(storageRef: string): Promise<string | null> {
    // Simulate slight asynchronous I/O delay
    await new Promise((resolve) => setTimeout(resolve, 5));
    return this.dataStore[storageRef] ?? null;
  }
}

// Define the integration payload values
const PAYLOAD_1 = {
  verified: true,
  score: 95,
  metadata: { source: "Aura Labs" },
};

const PAYLOAD_2 = {
  authorizedBy: "TrustRoot-Alpha",
  capabilities: ["IT-0601", "IT-0702"],
};

// Compute correct registered hashes dynamically to avoid manual mismatch
const jcs1 = canonicalizeJcs(PAYLOAD_1);
const jcs2 = canonicalizeJcs(PAYLOAD_2);

const HASH_1 =
  "sha256:" + crypto.createHash("sha256").update(jcs1, "utf8").digest("hex");
const HASH_2 =
  "sha256:" + crypto.createHash("sha256").update(jcs2, "utf8").digest("hex");

const EVIDENCE_RECORD_1 = {
  evidenceId: "ev-001",
  identityId: "identity-abc-123",
  evidenceType: "compliance-report",
  hash: HASH_1,
  storageRef: "r2://compliance/records/ev-001.json",
  retrievedAt: "2026-07-28T14:30:00Z",
};

const EVIDENCE_RECORD_2 = {
  evidenceId: "ev-002",
  identityId: "identity-abc-123",
  evidenceType: "compliance-report",
  hash: HASH_2,
  storageRef: "r2://compliance/records/ev-002.json",
  retrievedAt: "2026-07-28T14:30:00Z",
};

const TEST_REGISTRY_SNAPSHOT: Record<string, RetrievedRegistryState> = {
  "state-valid": {
    identity: {
      identityId: "identity-abc-123",
      identityType: "product",
      canonicalReference: "state-valid",
      referentId: null,
      status: "active",
      createdAt: "2026-07-28T12:00:00Z",
      updatedAt: "2026-07-28T12:00:00Z",
    },
    relationships: [],
    standings: [],
    authorities: [],
    capabilities: [],
    evidenceReferences: [EVIDENCE_RECORD_1, EVIDENCE_RECORD_2],
    applicablePolicies: [],
  },
};

describe("Evidence Composition & Integration Tests — AMS-0705", () => {
  // --- AMS-0702 -> AMS-0704 Composition Tests ---
  describe("AMS-0702 -> AMS-0704 Composition (Reference Resolver to Payload Provider)", () => {
    it("should successfully compose reference resolution and payload loading without a live Postgres DB", async () => {
      // 1. Initialize repository with frozen registry snapshot and Resolver
      const repo = new FrozenRegistryRepository(TEST_REGISTRY_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      // 2. Initialize in-memory storage client and Payload Provider
      const dataStore: Record<string, string> = {
        "r2://compliance/records/ev-001.json": JSON.stringify(PAYLOAD_1),
        "r2://compliance/records/ev-002.json": JSON.stringify(PAYLOAD_2),
      };
      const client = new LocalMemoryObjectStorageClient(dataStore);
      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 1,
      });

      // 3. Resolve evidence references to obtain an EvidenceBundle
      const resolutionResult = await resolver.resolve(["ev-001", "ev-002"]);
      expect(resolutionResult.ok).toBe(true);

      if (resolutionResult.ok) {
        const bundle = resolutionResult.value;
        expect(bundle.schemaVersion).toBe("1.0");
        expect(bundle.evidenceRecords).toHaveLength(2);

        // 4. Pass the bundle directly into the payload provider
        const payloadResult = await provider.loadPayloads(bundle);
        expect(payloadResult.ok).toBe(true);

        if (payloadResult.ok) {
          const payloadMap = payloadResult.value;
          expect(payloadMap.size).toBe(2);

          // Confirm correct keying and storage references mapped
          expect(payloadMap.has("ev-001")).toBe(true);
          expect(payloadMap.has("ev-002")).toBe(true);

          const p1 = payloadMap.get("ev-001") as any;
          expect(p1.metadata.source).toBe("Aura Labs");
          expect(p1.verified).toBe(true);

          const p2 = payloadMap.get("ev-002") as any;
          expect(p2.authorizedBy).toBe("TrustRoot-Alpha");
        }
      }
    });

    it("should fail resolution composably if reference resolver cannot locate metadata", async () => {
      const repo = new FrozenRegistryRepository(TEST_REGISTRY_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const resolutionResult = await resolver.resolve([
        "ev-001",
        "ev-non-existent",
      ]);
      expect(resolutionResult.ok).toBe(false);
      if (!resolutionResult.ok) {
        expect(resolutionResult.error.code).toBe("REFERENCE_NOT_FOUND");
      }
    });
  });

  // --- AMS-0702 -> AMS-0704 -> AMS-0703 Composition Tests ---
  describe("AMS-0702 -> AMS-0704 -> AMS-0703 Composition (Reference Resolution -> Retrieval -> Verification)", () => {
    it("should verify successfully when all retrieved payloads match their registered hashes", async () => {
      const repo = new FrozenRegistryRepository(TEST_REGISTRY_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const dataStore: Record<string, string> = {
        "r2://compliance/records/ev-001.json": JSON.stringify(PAYLOAD_1),
        "r2://compliance/records/ev-002.json": JSON.stringify(PAYLOAD_2),
      };
      const client = new LocalMemoryObjectStorageClient(dataStore);
      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 1,
      });

      // Step 1: Resolve
      const resolutionResult = await resolver.resolve(["ev-001", "ev-002"]);
      expect(resolutionResult.ok).toBe(true);

      if (resolutionResult.ok) {
        const bundle = resolutionResult.value;

        // Step 2: Retrieve
        const payloadResult = await provider.loadPayloads(bundle);
        expect(payloadResult.ok).toBe(true);

        if (payloadResult.ok) {
          const payloadMap = payloadResult.value;

          // Step 3: Verify
          const verificationReport = verifyEvidenceBundle(bundle, payloadMap);

          expect(verificationReport.isValid).toBe(true);
          expect(verificationReport.aggregateBundleDigest).toBeDefined();
          expect(verificationReport.aggregateBundleDigest).toMatch(
            /^sha256:[a-f0-9]{64}$/,
          );
          expect(verificationReport.records).toHaveLength(2);
          expect(verificationReport.records[0].valid).toBe(true);
          expect(verificationReport.records[1].valid).toBe(true);
        }
      }
    });

    it("should return isValid === false when any retrieved payload has been corrupted/tampered with", async () => {
      const repo = new FrozenRegistryRepository(TEST_REGISTRY_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      // Mutate payload1 so its JCS hash no longer matches the registered hash
      const corruptedDataStore: Record<string, string> = {
        "r2://compliance/records/ev-001.json": JSON.stringify({
          verified: true,
          score: 0, // Changed score from 95 to 0 (corrupted)
          metadata: { source: "Aura Labs" },
        }),
        "r2://compliance/records/ev-002.json": JSON.stringify(PAYLOAD_2),
      };
      const client = new LocalMemoryObjectStorageClient(corruptedDataStore);
      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 1,
      });

      // Step 1: Resolve
      const resolutionResult = await resolver.resolve(["ev-001", "ev-002"]);
      expect(resolutionResult.ok).toBe(true);

      if (resolutionResult.ok) {
        const bundle = resolutionResult.value;

        // Step 2: Retrieve
        const payloadResult = await provider.loadPayloads(bundle);
        expect(payloadResult.ok).toBe(true);

        if (payloadResult.ok) {
          const payloadMap = payloadResult.value;

          // Step 3: Verify
          const verificationReport = verifyEvidenceBundle(bundle, payloadMap);

          expect(verificationReport.isValid).toBe(false);
          expect(verificationReport.aggregateBundleDigest).toBeUndefined(); // Must be omitted for failed bundles
          expect(verificationReport.records).toHaveLength(2);

          const r1 = verificationReport.records.find(
            (r) => r.evidenceId === "ev-001",
          );
          const r2 = verificationReport.records.find(
            (r) => r.evidenceId === "ev-002",
          );

          expect(r1?.valid).toBe(false);
          expect(r1?.errorCode).toBe("HASH_MISMATCH");
          expect(r2?.valid).toBe(true);
        }
      }
    });

    it("should produce deterministic outputs repeatedly when identical composition path runs", async () => {
      const repo = new FrozenRegistryRepository(TEST_REGISTRY_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const dataStore: Record<string, string> = {
        "r2://compliance/records/ev-001.json": JSON.stringify(PAYLOAD_1),
        "r2://compliance/records/ev-002.json": JSON.stringify(PAYLOAD_2),
      };
      const client = new LocalMemoryObjectStorageClient(dataStore);
      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 1,
      });

      const runComposition = async () => {
        const res = await resolver.resolve(["ev-001", "ev-002"]);
        if (!res.ok) throw new Error("Resolve failed");
        const payloads = await provider.loadPayloads(res.value);
        if (!payloads.ok) throw new Error("Payload load failed");
        return verifyEvidenceBundle(res.value, payloads.value);
      };

      const report1 = await runComposition();
      const report2 = await runComposition();

      expect(report1.isValid).toBe(true);
      expect(report1.aggregateBundleDigest).toBe(report2.aggregateBundleDigest);
      expect(report1.records).toEqual(report2.records);
    });
  });
});
