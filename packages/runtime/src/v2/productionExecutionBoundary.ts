import { type ExecutionRequestV2 } from "@zyppi/domain";
import {
  validateExecutionEnvelopeCompatibilityV2,
  type ExecutionEnvelopeCompatibilityV2Failure,
} from "./executionEnvelopeCompatibility.js";

export interface ProductionExecutionFrameV2 {
  readonly kind: "PRODUCTION_EXECUTION_V2";
  readonly executionRequest: ExecutionRequestV2;
  readonly wholeRequestDigestCandidate: string;
}

export type ProductionExecutionPreparationV2Success = {
  readonly ok: true;
  readonly frame: ProductionExecutionFrameV2;
};

export type ProductionExecutionIsolationV2ErrorCode =
  | "SNAPSHOT_CREATION_FAILED"
  | "SNAPSHOT_REVALIDATION_FAILED"
  | "SNAPSHOT_DIGEST_MISMATCH";

export type ProductionExecutionIsolationV2Failure = {
  readonly ok: false;
  readonly stage: "PRODUCTION_ISOLATION";
  readonly error: {
    readonly code: ProductionExecutionIsolationV2ErrorCode;
    readonly message: string;
  };
};

export type ProductionExecutionPreparationV2Result =
  | ProductionExecutionPreparationV2Success
  | ExecutionEnvelopeCompatibilityV2Failure
  | ProductionExecutionIsolationV2Failure;

/**
 * Recursive strict-data copier for V2 requests.
 * Preserves strict JSON values (including negative zero) and own data keys
 * (such as "__proto__", "constructor", "prototype") as own data properties
 * without invoking prototype setters or inheriting caller prototypes.
 */
function cloneStrictData<T>(val: T): T {
  if (val === null || typeof val !== "object") {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((item) => cloneStrictData(item)) as unknown as T;
  }
  const proto = Object.getPrototypeOf(val as object);
  const result = (proto === null ? Object.create(null) : {}) as Record<
    string,
    unknown
  >;
  const keys = Object.keys(val as Record<string, unknown>);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    Object.defineProperty(result, key, {
      value: cloneStrictData((val as Record<string, unknown>)[key]),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  return result as T;
}

/**
 * Recursively freezes an object graph in-place.
 */
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  const keys = Reflect.ownKeys(obj as object);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = Reflect.get(obj as object, key);
    if (val !== null && typeof val === "object") {
      deepFreeze(val);
    }
  }
  return obj;
}

/**
 * Native V2 production preparation capability.
 * Consumes an untrusted candidate through V2-05 envelope compatibility,
 * creates a fresh data-only Runtime-owned snapshot, re-validates the snapshot,
 * proves digest continuity, deep-freezes the production frame, and returns
 * the prepared frame.
 */
export function prepareProductionExecutionV2(
  input: unknown,
): ProductionExecutionPreparationV2Result {
  // Step 1 — V2-05 initial validation
  const firstPassResult = validateExecutionEnvelopeCompatibilityV2(input);
  if (!firstPassResult.ok) {
    return firstPassResult;
  }

  // Step 2 — Fresh strict-data snapshot construction
  let snapshot: ExecutionRequestV2;
  try {
    snapshot = cloneStrictData(firstPassResult.executionRequest);
  } catch {
    return {
      ok: false,
      stage: "PRODUCTION_ISOLATION",
      error: {
        code: "SNAPSHOT_CREATION_FAILED",
        message: "Failed to construct fresh Runtime execution snapshot",
      },
    };
  }

  // Step 3 — Snapshot re-validation
  const secondPassResult = validateExecutionEnvelopeCompatibilityV2(snapshot);
  if (!secondPassResult.ok) {
    return {
      ok: false,
      stage: "PRODUCTION_ISOLATION",
      error: {
        code: "SNAPSHOT_REVALIDATION_FAILED",
        message: "Runtime execution snapshot failed V2-05 re-validation",
      },
    };
  }

  // Step 4 — Digest continuity proof
  const d1 = firstPassResult.wholeRequestDigestCandidate;
  const d2 = secondPassResult.wholeRequestDigestCandidate;
  if (d1 !== d2) {
    return {
      ok: false,
      stage: "PRODUCTION_ISOLATION",
      error: {
        code: "SNAPSHOT_DIGEST_MISMATCH",
        message: `Runtime execution snapshot digest mismatch: expected '${d1}', derived '${d2}'`,
      },
    };
  }

  // Step 5 — Deep freeze snapshot & frame
  deepFreeze(snapshot);

  const frame: ProductionExecutionFrameV2 = deepFreeze({
    kind: "PRODUCTION_EXECUTION_V2",
    executionRequest: snapshot,
    wholeRequestDigestCandidate: d1,
  });

  // Step 6 — Return immutable success wrapper
  return deepFreeze({
    ok: true,
    frame,
  });
}
