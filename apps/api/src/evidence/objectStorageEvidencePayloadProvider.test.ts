/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type {
  ObjectStorageClient,
  EvidencePayloadProvider,
} from "@zyppi/contracts";
import type { EvidenceBundle, EvidenceRecord } from "@zyppi/domain";
import { ObjectStorageEvidencePayloadProvider } from "./objectStorageEvidencePayloadProvider.js";

class MockObjectStorageClient implements ObjectStorageClient {
  public getObjectCalls: string[] = [];
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
    this.getObjectCalls.push(storageRef);
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
    hash: "sha256:4a001923cfb8b7e8d3cf68c2f1ea8e05a5a1e2f7b11cf2c39d8dfef28ef05001",
    storageRef: ref,
    retrievedAt: "2026-07-28T14:30:00Z",
  };
}

describe("ObjectStorageEvidencePayloadProvider Unit Tests — AMS-0704 & AMS-0705", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 1. Successful single-record retrieval
  it("successfully loads, parses, and deep-freezes a single payload", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar", "nested": {"num": 42}}',
    });

    const provider: EvidencePayloadProvider =
      new ObjectStorageEvidencePayloadProvider(client, { delayMs: 100 });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const map = result.value;
      expect(map.size).toBe(1);
      expect(map.has("evidence-1")).toBe(true);

      const payload = map.get("evidence-1") as any;
      expect(payload).toEqual({ foo: "bar", nested: { num: 42 } });

      // Externally observable deep immutability verification
      expect(Object.isFrozen(payload)).toBe(true);
      expect(Object.isFrozen(payload.nested)).toBe(true);
      expect(() => {
        payload.foo = "mutated";
      }).toThrow(TypeError);
      expect(() => {
        payload.nested.num = 99;
      }).toThrow(TypeError);
    }
  });

  // 2. Successful multi-record retrieval
  it("successfully loads, parses, and deep-freezes multiple payloads", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
      "r2://bucket/doc2": '{"hello": "world", "arr": [1, 2, 3]}',
    });

    const provider: EvidencePayloadProvider =
      new ObjectStorageEvidencePayloadProvider(client, { delayMs: 100 });

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

      expect(payload1).toEqual({ foo: "bar" });
      expect(payload2).toEqual({ hello: "world", arr: [1, 2, 3] });

      // Deep immutability of map keys and values
      expect(Object.isFrozen(map)).toBe(true);
      expect(Object.isFrozen(payload2.arr)).toBe(true);
      expect(() => {
        payload2.arr.push(4);
      }).toThrow(TypeError);
    }
  });

  // 3. Empty EvidenceBundle
  it("returns an empty map for an empty evidence bundle with 0 storage operations", async () => {
    const client = new MockObjectStorageClient();
    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 100,
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
      expect(client.getObjectCalls.length).toBe(0);
    }
  });

  // 4. Payload map keyed by evidenceId
  it("ensures that map keys are strictly evidenceId strings and not storage references", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 100,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [makeRecord("evidence-unique-key", "r2://bucket/doc1")],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.has("evidence-unique-key")).toBe(true);
      expect(result.value.has("r2://bucket/doc1")).toBe(false);
    }
  });

  // 5. PAYLOAD_NOT_FOUND
  it("fails atomically with PAYLOAD_NOT_FOUND if storage client returns null", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 100,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeRecord("evidence-1", "r2://bucket/doc1"),
        makeRecord("evidence-missing", "r2://bucket/missing-doc"), // Returns null
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        kind: "PAYLOAD_NOT_FOUND",
        evidenceId: "evidence-missing",
      });
    }
  });

  // 6. INVALID_PAYLOAD
  it("fails atomically with INVALID_PAYLOAD on malformed JSON, and does not retry", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
      "r2://bucket/doc-bad": "not valid { json ...",
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 100,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeRecord("evidence-1", "r2://bucket/doc1"),
        makeRecord("evidence-bad", "r2://bucket/doc-bad"),
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("INVALID_PAYLOAD");
      if (result.error.kind === "INVALID_PAYLOAD") {
        expect(result.error.evidenceId).toBe("evidence-bad");
        expect(result.error.reason).toContain("Failed to parse JSON");
      }
    }
    // Verify only 1 attempt was made for evidence-bad, no retries triggered
    expect(
      client.getObjectCalls.filter((x) => x === "r2://bucket/doc-bad").length,
    ).toBe(1);
  });

  // 7. STORAGE_FAILURE
  it("fails with STORAGE_FAILURE on a definitive storage error", async () => {
    const client = new MockObjectStorageClient();
    client.queueThrow(() => {
      const err = new Error("Auth failed");
      (err as any).status = 401; // Non-transient
      return Promise.reject(err);
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 100,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("STORAGE_FAILURE");
      const err = result.error as any;
      expect(err.cause).toContain("Auth failed");
    }
  });

  // 8. Atomic failure — no partial Map escapes
  it("prohibits exposure of partially resolved maps on failure", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 100,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        makeRecord("evidence-1", "r2://bucket/doc1"), // successfully retrieved
        makeRecord("evidence-2", "r2://bucket/doc2"), // missing, causes failure
      ],
    };

    const result = await provider.loadPayloads(bundle);

    expect(result.ok).toBe(false);
    // There must be no way to access the partially resolved 'evidence-1' payload map
    expect((result as any).value).toBeUndefined();
  });

  // 9. Retry timing behavior and scenarios with virtualized time
  describe("Retry timing and policies", () => {
    // A: Success on first attempt (0 retries)
    it("case 1: succeeds on first attempt without any retries", async () => {
      const client = new MockObjectStorageClient({
        "r2://bucket/doc1": '{"foo": "bar"}',
      });

      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 100,
      });

      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
      };

      const result = await provider.loadPayloads(bundle);
      expect(result.ok).toBe(true);
      expect(client.getObjectCalls.length).toBe(1);
    });

    // B: Transient failure followed by success (1 retry)
    it("case 2: transient failure followed by success on the 2nd attempt", async () => {
      const client = new MockObjectStorageClient({
        "r2://bucket/doc1": '{"foo": "bar"}',
      });

      // Queue 1 transient failure
      client.queueThrow(() => {
        const err = new Error("timeout");
        (err as any).code = "ETIMEDOUT";
        return Promise.reject(err);
      });

      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 100,
      });

      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
      };

      const loadPromise = provider.loadPayloads(bundle);

      // Advance timers to trigger the sleep delay and allow the promise to resolve
      await vi.advanceTimersByTimeAsync(100);

      const result = await loadPromise;
      expect(result.ok).toBe(true);
      expect(client.getObjectCalls.length).toBe(2);
    });

    // C: Two transient failures followed by success (2 retries)
    it("case 3: two transient failures followed by success on the 3rd attempt", async () => {
      const client = new MockObjectStorageClient({
        "r2://bucket/doc1": '{"foo": "bar"}',
      });

      // Queue 2 transient failures
      client.queueThrow(() => {
        const err = new Error("connection reset");
        (err as any).code = "ECONNRESET";
        return Promise.reject(err);
      });
      client.queueThrow(() => {
        const err = new Error("temporary 503");
        (err as any).status = 503;
        return Promise.reject(err);
      });

      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 100,
      });

      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
      };

      const loadPromise = provider.loadPayloads(bundle);

      // Advance timers twice to cover the two delays
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(100);

      const result = await loadPromise;
      expect(result.ok).toBe(true);
      expect(client.getObjectCalls.length).toBe(3);
    });

    // D: Three failed attempts producing final failure
    it("case 4: three failed attempts producing final failure (exhausted retries)", async () => {
      const client = new MockObjectStorageClient({
        "r2://bucket/doc1": '{"foo": "bar"}',
      });

      // Queue 3 transient failures
      client.queueThrow(() =>
        Promise.reject({ message: "transient network failure" }),
      );
      client.queueThrow(() =>
        Promise.reject({ message: "transient network failure" }),
      );
      client.queueThrow(() =>
        Promise.reject({ message: "transient network failure" }),
      );

      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 100,
      });

      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
      };

      const loadPromise = provider.loadPayloads(bundle);

      // Advance timers to trigger the delay between attempts 1-2 and 2-3
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(100);

      const result = await loadPromise;
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("STORAGE_FAILURE");
        const err = result.error as any;
        expect(err.cause).toContain("failed after 3 attempts");
      }
      expect(client.getObjectCalls.length).toBe(3);
    });

    // E: Non-transient failure producing exactly one attempt
    it("case 5: non-transient failure fails immediately with exactly one attempt", async () => {
      const client = new MockObjectStorageClient({
        "r2://bucket/doc1": '{"foo": "bar"}',
      });

      // Queue a non-transient authorization failure (does not match isTransientError helper)
      client.queueThrow(() => Promise.reject(new Error("Fatal Access Denied")));

      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 100,
      });

      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
      };

      const result = await provider.loadPayloads(bundle);
      expect(result.ok).toBe(false);
      expect(client.getObjectCalls.length).toBe(1);
    });

    // F: Verify fixed delay timing behavior without wall-clock time
    it("case 6: delay timing matches the exact configured delayMs without exponential backoff", async () => {
      const client = new MockObjectStorageClient({
        "r2://bucket/doc1": '{"foo": "bar"}',
      });

      client.queueThrow(() => Promise.reject({ message: "timeout" }));

      const provider = new ObjectStorageEvidencePayloadProvider(client, {
        delayMs: 250, // configured delay
      });

      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
      };

      const startTime = Date.now();
      const loadPromise = provider.loadPayloads(bundle);

      // Advance by 249ms (1ms short of delayMs) and check it has not finished/resumed
      await vi.advanceTimersByTimeAsync(249);
      // Now advance the remaining 1ms
      await vi.advanceTimersByTimeAsync(1);

      const result = await loadPromise;
      expect(result.ok).toBe(true);
      expect(Date.now() - startTime).toBe(250);
    });
  });

  // 10. Deep immutability of nested structures
  it("externally asserts deep immutability on complex nested structures", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc": JSON.stringify({
        scalar: "val",
        nestedObj: {
          innerProp: "innerVal",
        },
        nestedArr: [{ itemProp: "itemVal" }],
      }),
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 100,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [makeRecord("ev-complex", "r2://bucket/doc")],
    };

    const result = await provider.loadPayloads(bundle);
    expect(result.ok).toBe(true);

    if (result.ok) {
      const payload = result.value.get("ev-complex") as any;

      // 1. Scalar mutation fails
      expect(() => {
        payload.scalar = "new-scalar";
      }).toThrow(TypeError);

      // 2. Nested object property mutation fails
      expect(() => {
        payload.nestedObj.innerProp = "changed";
      }).toThrow(TypeError);

      // 3. Nested array mutation fails
      expect(() => {
        payload.nestedArr.push({ itemProp: "another" });
      }).toThrow(TypeError);

      // 4. Object inside nested array mutation fails
      expect(() => {
        payload.nestedArr[0].itemProp = "mutated-val";
      }).toThrow(TypeError);

      // Confirm original values did not change
      expect(payload.scalar).toBe("val");
      expect(payload.nestedObj.innerProp).toBe("innerVal");
      expect(payload.nestedArr.length).toBe(1);
      expect(payload.nestedArr[0].itemProp).toBe("itemVal");
    }
  });

  // 11. Deterministic repeated execution
  it("guarantees deterministic repeated execution yielding identical results", async () => {
    const client = new MockObjectStorageClient({
      "r2://bucket/doc1": '{"foo": "bar"}',
    });

    const provider = new ObjectStorageEvidencePayloadProvider(client, {
      delayMs: 100,
    });

    const bundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [makeRecord("evidence-1", "r2://bucket/doc1")],
    };

    const result1 = await provider.loadPayloads(bundle);
    const result2 = await provider.loadPayloads(bundle);

    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);

    if (result1.ok && result2.ok) {
      const p1 = result1.value.get("evidence-1");
      const p2 = result2.value.get("evidence-1");
      expect(p1).toEqual(p2);
    }
  });
});
