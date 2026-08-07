/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import type {
  ObjectStorageClient,
  EvidencePayloadProvider,
} from "@zyppi/contracts";
import type { EvidenceBundle, EvidenceRecord } from "@zyppi/domain";
import { ObjectStorageEvidencePayloadProvider } from "./objectStorageEvidencePayloadProvider.js";

class MockObjectStorageClient implements ObjectStorageClient {
  private readonly store = new Map<string, string>();
  private throwQueue: Array<(() => Promise<never>) | null> = [];

  constructor(initialData?: Record<string, string>) {
    if (initialData) {
      for (const [key, value] of Object.entries(initialData)) {
        this.store.set(key, value);
      }
    }
  }

  setObject(storageRef: string, content: string): void {
    this.store.set(storageRef, content);
  }

  queueThrow(fn: () => Promise<never>): void {
    this.throwQueue.push(fn);
  }

  async getObject(storageRef: string): Promise<string | null> {
    if (this.throwQueue.length > 0) {
      const nextThrow = this.throwQueue.shift();
      if (nextThrow) {
        await nextThrow();
      }
    }
    const result = this.store.get(storageRef);
    return result ?? null;
  }
}

// Helper to create a dummy EvidenceRecord
function makeRecord(id: string, ref: string): EvidenceRecord {
  return {
    evidenceId: id,
    identityId: "identity-123",
    evidenceType: "document",
    hash: "sha256-hash",
    storageRef: ref,
    retrievedAt: "2026-07-28T14:30:00Z",
  };
}

describe("ObjectStorageEvidencePayloadProvider Unit Tests — AMS-0704", () => {
  it("successfully loads, parses, and deep-freezes payloads", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar", "nested": {"num": 42}}',
      "r2://bucket/doc2": '{"hello": "world", "arr": [1, 2, 3]}',
    });

    const provider: EvidencePayloadProvider =
      new ObjectStorageEvidencePayloadProvider(client, { delayMs: 1 });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeRecord("evidence-1", "r2://bucket/doc1"),
        makeRecord("evidence-2", "r2://bucket/doc2"),
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const map = result.value;
      expect(map.size).toBe(2);
      expect(map.has("evidence-1")).toBe(true);
      expect(map.has("evidence-2")).toBe(true);

      const payload1 = map.get("evidence-1") as any;
      const payload2 = map.get("evidence-2") as any;

      expect(payload1).toEqual({ foo: "bar", nested: { num: 42 } });
      expect(payload2).toEqual({ hello: "world", arr: [1, 2, 3] });

      // Verify Deep Immutability
      expect(Object.isFrozen(payload1)).toBe(true);
      expect(Object.isFrozen(payload1.nested)).toBe(true);
      expect(Object.isFrozen(payload2)).toBe(true);
      expect(Object.isFrozen(payload2.arr)).toBe(true);
      expect(Object.isFrozen(map)).toBe(true);

      expect(() => {
        payload1.foo = "new-value";
      }).toThrow();

      expect(() => {
        payload1.nested.num = 100;
      }).toThrow();
    }
  });

  it("handles payload-not-found cleanly with atomic fail-fast", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 1,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeRecord("evidence-1", "r2://bucket/doc1"),
        makeRecord("evidence-2", "r2://bucket/doc2"), // Not in storage, client returns null
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        kind: "PAYLOAD_NOT_FOUND",
        evidenceId: "evidence-2",
      });
    }
  });

  it("handles malformed JSON payload with atomic fail-fast and no retry", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
      "r2://bucket/doc2": '{"invalid-json: malformed',
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 1,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeRecord("evidence-1", "r2://bucket/doc1"),
        makeRecord("evidence-2", "r2://bucket/doc2"),
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("INVALID_PAYLOAD");
      if (result.error.kind === "INVALID_PAYLOAD") {
        expect(result.error.evidenceId).toBe("evidence-2");
        expect(result.error.reason).toContain("Failed to parse JSON");
      }
    }
  });

  it("retries on transient errors and succeeds if transient failure clears within 3 attempts", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
    });

    // Queue 2 transient errors
    client.queueThrow(() => {
      const err = new Error("timeout");
      (err as any).code = "ETIMEDOUT";
      return Promise.reject(err);
    });
    client.queueThrow(() => {
      const err = new Error("Connection reset");
      (err as any).code = "ECONNRESET";
      return Promise.reject(err);
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 1,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.get("evidence-1")).toEqual({ foo: "bar" });
    }
  });

  it("aborts and returns STORAGE_FAILURE if transient failure is not resolved after 3 attempts", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
    });

    // Queue 3 transient errors
    client.queueThrow(() => Promise.reject(new Error("network timeout")));
    client.queueThrow(() => Promise.reject(new Error("network timeout")));
    client.queueThrow(() => Promise.reject(new Error("network timeout")));

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 1,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("STORAGE_FAILURE");
      if (result.error.kind === "STORAGE_FAILURE") {
        expect(result.error.cause).toContain("failed after 3 attempts");
        expect(result.error.cause).toContain("network timeout");
      }
    }
  });

  it("does not retry non-transient storage errors and immediately fails", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
    });

    // Queue a non-transient authorization error
    client.queueThrow(() => {
      const err = new Error("Forbidden access");
      (err as any).status = 403;
      return Promise.reject(err);
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 1,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("STORAGE_FAILURE");
      if (result.error.kind === "STORAGE_FAILURE") {
        expect(result.error.cause).toContain("failed after 1 attempts");
        expect(result.error.cause).toContain("Forbidden access");
      }
    }
  });

  it("returns an empty map for an empty evidence bundle", async () => {
    const client = new MockObjectStorageClient();
    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 1,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.size).toBe(0);
      expect(Object.isFrozen(result.value)).toBe(true);
    }
  });
});
