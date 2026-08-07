/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import type {
  ObjectStorageClient,
  EvidencePayloadProvider,
} from "@zyppi/contracts";
import type { EvidenceBundle, EvidenceRecord } from "@zyppi/domain";
import { ObjectStorageEvidencePayloadProvider } from "./objectStorageEvidencePayloadProvider.js";

// A realistic, concrete implementation of ObjectStorageClient for integration testing
class LocalMemoryObjectStorageClient implements ObjectStorageClient {
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

function makeEvidenceRecord(id: string, storageRef: string): EvidenceRecord {
  return {
    evidenceId: id,
    identityId: "identity-abc-123",
    evidenceType: "compliance-report",
    hash: "sha256:7f83b1657ff1fc53b92bdf221e5e548231ef6c27f31ef00c7d42cf38fdf29a7d",
    storageRef,
    retrievedAt: "2026-07-28T14:30:00Z",
  };
}

describe("ObjectStorageEvidencePayloadProvider Integration Tests — AMS-0704", () => {
  it("should successfully retrieve and parse multiple valid payloads end-to-end", async () => {
    const dataStore: Record<string, string> = {
      "r2://compliance/records/ev-001.json": JSON.stringify({
        verified: true,
        score: 95,
        metadata: { source: "Aura Labs" },
      }),
      "r2://compliance/records/ev-002.json": JSON.stringify({
        authorizedBy: "TrustRoot-Alpha",
        capabilities: ["IT-0601", "IT-0702"],
      }),
    };

    const client = new LocalMemoryObjectStorageClient(dataStore);
    const provider: EvidencePayloadProvider =
      new ObjectStorageEvidencePayloadProvider(client, { delayMs: 1 });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeEvidenceRecord("ev-001", "r2://compliance/records/ev-001.json"),
        makeEvidenceRecord("ev-002", "r2://compliance/records/ev-002.json"),
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const payloadMap = result.value;
      expect(payloadMap.size).toBe(2);

      const p1 = payloadMap.get("ev-001") as any;
      const p2 = payloadMap.get("ev-002") as any;

      expect(p1.verified).toBe(true);
      expect(p1.metadata.source).toBe("Aura Labs");
      expect(p2.capabilities).toContain("IT-0601");

      // Verify that map values are deeply frozen
      expect(Object.isFrozen(p1)).toBe(true);
      expect(Object.isFrozen(p1.metadata)).toBe(true);
      expect(Object.isFrozen(p2)).toBe(true);
      expect(Object.isFrozen(p2.capabilities)).toBe(true);
    }
  });

  it("should fail atomically with PAYLOAD_NOT_FOUND if any requested payload is absent", async () => {
    const dataStore: Record<string, string> = {
      "r2://compliance/records/ev-001.json": JSON.stringify({ foo: "bar" }),
    };

    const client = new LocalMemoryObjectStorageClient(dataStore);
    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 1,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeEvidenceRecord("ev-001", "r2://compliance/records/ev-001.json"),
        makeEvidenceRecord("ev-999", "r2://compliance/records/missing.json"),
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        kind: "PAYLOAD_NOT_FOUND",
        evidenceId: "ev-999",
      });
    }
  });

  it("should fail atomically with INVALID_PAYLOAD if any payload is malformed JSON", async () => {
    const dataStore: Record<string, string> = {
      "r2://compliance/records/ev-001.json": JSON.stringify({ foo: "bar" }),
      "r2://compliance/records/ev-002.json": "{ malformed json...",
    };

    const client = new LocalMemoryObjectStorageClient(dataStore);
    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 1,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeEvidenceRecord("ev-001", "r2://compliance/records/ev-001.json"),
        makeEvidenceRecord("ev-002", "r2://compliance/records/ev-002.json"),
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("INVALID_PAYLOAD");
      if (result.error.kind === "INVALID_PAYLOAD") {
        expect(result.error.evidenceId).toBe("ev-002");
        expect(result.error.reason).toContain("Failed to parse JSON");
      }
    }
  });
});
