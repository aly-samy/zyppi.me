import type {
  EvidencePayloadProvider,
  ObjectStorageClient,
  PayloadProviderResult,
} from "@zyppi/contracts";
import type { EvidenceBundle } from "@zyppi/domain";

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    const val = (obj as Record<string | symbol, unknown>)[key];
    if (val !== null && typeof val === "object") {
      deepFreeze(val);
    }
  }
  return obj;
}

function isTransientError(err: unknown): boolean {
  if (!err) {
    return false;
  }
  if (typeof err === "object") {
    const errorObj = err as Record<string, unknown>;
    if (errorObj.isTransient === true) {
      return true;
    }
    const message = String(errorObj.message || "").toLowerCase();
    const code = String(errorObj.code || "").toLowerCase();
    const status = errorObj.status;

    if (
      message.includes("timeout") ||
      message.includes("connection reset") ||
      message.includes("econnreset") ||
      message.includes("network") ||
      message.includes("503") ||
      message.includes("temporary") ||
      message.includes("transient") ||
      message.includes("socket") ||
      code.includes("timeout") ||
      code.includes("econnreset") ||
      code.includes("etimedout") ||
      status === 503 ||
      status === "503"
    ) {
      return true;
    }
  }
  return false;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ObjectStorageEvidencePayloadProvider implements EvidencePayloadProvider {
  private readonly client: ObjectStorageClient;
  private readonly delayMs: number;

  constructor(
    client: ObjectStorageClient,
    config?: { readonly delayMs?: number },
  ) {
    if (!client) {
      throw new Error("ObjectStorageClient is required");
    }
    this.client = client;
    this.delayMs = config?.delayMs ?? 100;
  }

  async loadPayloads(bundle: EvidenceBundle): Promise<PayloadProviderResult> {
    const payloads = new Map<string, unknown>();

    for (const record of bundle.evidenceRecords) {
      const { evidenceId, storageRef } = record;
      let rawContent: string | null = null;
      let lastError: unknown = null;
      let attempts = 0;

      while (attempts < 3) {
        attempts++;
        try {
          rawContent = await this.client.getObject(storageRef);
          lastError = null;
          break; // Succeeded, break retry loop
        } catch (err: unknown) {
          lastError = err;
          // Determine if we should retry (only on transient failures and if we have attempts left)
          if (isTransientError(err) && attempts < 3) {
            if (this.delayMs > 0) {
              await sleep(this.delayMs);
            }
            continue;
          }
          break; // Stop retry on non-transient error or max attempts reached
        }
      }

      if (lastError !== null) {
        // If it was transient and we exhausted retries, or if it was a non-transient storage error
        const cause =
          lastError instanceof Error ? lastError.message : String(lastError);
        return {
          ok: false,
          error: {
            kind: "STORAGE_FAILURE",
            cause: `Storage client failed after ${attempts} attempts: ${cause}`,
          },
        };
      }

      if (rawContent === null) {
        // Payload not found in storage
        return {
          ok: false,
          error: {
            kind: "PAYLOAD_NOT_FOUND",
            evidenceId,
          },
        };
      }

      // Successful retrieval, now parse JSON
      let parsedPayload: unknown;
      try {
        parsedPayload = JSON.parse(rawContent);
      } catch (err: unknown) {
        const reason = err instanceof Error ? err.message : String(err);
        return {
          ok: false,
          error: {
            kind: "INVALID_PAYLOAD",
            evidenceId,
            reason: `Failed to parse JSON payload: ${reason}`,
          },
        };
      }

      // Deep freeze the parsed payload
      deepFreeze(parsedPayload);

      // Store in the map keyed by evidenceId
      payloads.set(evidenceId, parsedPayload);
    }

    // Freeze the ReadonlyMap itself to ensure total deep immutability
    Object.freeze(payloads);

    return {
      ok: true,
      value: payloads,
    };
  }
}
