import {
  validateExecutionRequest,
  validateExecutionRequestV2,
  type ExecutionRequest,
  type ExecutionRequestValidationError,
  type ExecutionRequestV2,
  type ExecutionRequestV2ValidationError,
} from "@zyppi/domain";
import { checkRawJsonDuplicateKeys } from "./rawJsonDuplicateKeyGuard.js";
import {
  materializeExecutionRequestV2,
  type ExecutionRequestV2MaterializationFailure,
  type ExecutionRequestV2MaterializationInput,
} from "./v2ExecutionMaterialization.js";

/**
 * Closed stage discriminators for execution generation boundary failures per CCP-RI-V2-04.
 */
export type ExecutionGenerationBoundaryFailureStage =
  | "RAW_JSON"
  | "GENERATION_CLASSIFICATION"
  | "V1_VALIDATION"
  | "V2_VALIDATION"
  | "V2_MATERIALIZATION";

/**
 * Closed error codes for raw boundary and generation classification failures per CCP-RI-V2-04.
 */
export type ExecutionGenerationBoundaryErrorCode =
  | "INVALID_RAW_JSON"
  | "DUPLICATE_JSON_KEY"
  | "INVALID_ROOT"
  | "UNSUPPORTED_EXPLICIT_GENERATION"
  | "MISSING_V2_GENERATION_MARKER";

/**
 * Closed list of top-level section keys exclusive to ExecutionRequestV2 per CCP-RI-V2-04.
 */
const V2_EXCLUSIVE_MARKERS = [
  "participation",
  "intent",
  "requestedAction",
  "constitutionalState",
  "evidenceState",
  "policyUniverse",
  "evaluationContext",
] as const;

/**
 * Successful execution request generation dispatch outcome preserving generation discriminant per CCP-RI-V2-04.
 */
export type ExecutionGenerationDispatchSuccess =
  | {
      readonly ok: true;
      readonly generation: "v1";
      readonly executionRequest: ExecutionRequest;
    }
  | {
      readonly ok: true;
      readonly generation: "v2";
      readonly executionRequest: ExecutionRequestV2;
      readonly wholeRequestDigestCandidate: string;
    };

/**
 * Discriminated failure outcome for raw boundary, generation classification, or generation-specific validation/materialization per CCP-RI-V2-04.
 */
export type ExecutionGenerationDispatchFailure =
  | {
      readonly ok: false;
      readonly stage: "RAW_JSON";
      readonly code: ExecutionGenerationBoundaryErrorCode;
      readonly message: string;
    }
  | {
      readonly ok: false;
      readonly stage: "GENERATION_CLASSIFICATION";
      readonly code: ExecutionGenerationBoundaryErrorCode;
      readonly message: string;
    }
  | {
      readonly ok: false;
      readonly stage: "V1_VALIDATION";
      readonly error: ExecutionRequestValidationError;
    }
  | {
      readonly ok: false;
      readonly stage: "V2_VALIDATION";
      readonly error: ExecutionRequestV2ValidationError;
    }
  | {
      readonly ok: false;
      readonly stage: "V2_MATERIALIZATION";
      readonly error: ExecutionRequestV2MaterializationFailure;
    };

/**
 * Typed, non-throwing result of raw execution request dispatch per CCP-RI-V2-04.
 */
export type ExecutionGenerationDispatchResult =
  ExecutionGenerationDispatchSuccess | ExecutionGenerationDispatchFailure;

/**
 * Application-owned capability that receives raw JSON execution request text,
 * enforces raw JSON syntax integrity and duplicate object-key rejection across all nesting levels,
 * deterministically classifies the execution request generation (historical V1 vs explicit V2),
 * and routes strictly to generation-specific validation and materialization capabilities per CCP-RI-V2-04.
 *
 * Performs zero Runtime execution and never falls back across generations upon failure.
 */
function hasOwn(obj: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function dispatchRawExecutionRequest(
  rawJson: string,
): ExecutionGenerationDispatchResult {
  // 1. Raw JSON integrity & duplicate key rejection before trusted parsing
  const guardResult = checkRawJsonDuplicateKeys(rawJson);
  if (!guardResult.ok) {
    return {
      ok: false,
      stage: "RAW_JSON",
      code: guardResult.code,
      message: guardResult.message,
    };
  }

  // 2. Standard JSON parsing into JavaScript representation
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    return {
      ok: false,
      stage: "RAW_JSON",
      code: "INVALID_RAW_JSON",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  // 3. Execution envelope root validation
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      stage: "GENERATION_CLASSIFICATION",
      code: "INVALID_ROOT",
      message: "Execution request root must be a non-null JSON object",
    };
  }

  const rootObj = parsed as Record<string, unknown>;

  // 4. Generation classification
  if (hasOwn(rootObj, "contractVersion")) {
    const cv = rootObj.contractVersion;
    if (cv === "v2") {
      // Explicit V2 path
      const structRes = validateExecutionRequestV2(rootObj);
      if (!structRes.ok) {
        return {
          ok: false,
          stage: "V2_VALIDATION",
          error: structRes.error,
        };
      }

      const matInput = { ...structRes.value } as Record<string, unknown>;
      delete matInput.contractVersion;
      const matRes = materializeExecutionRequestV2(
        matInput as unknown as ExecutionRequestV2MaterializationInput,
      );
      if (!matRes.ok) {
        return {
          ok: false,
          stage: "V2_MATERIALIZATION",
          error: matRes,
        };
      }

      return {
        ok: true,
        generation: "v2",
        executionRequest: matRes.executionRequest,
        wholeRequestDigestCandidate: matRes.wholeRequestDigestCandidate,
      };
    }

    return {
      ok: false,
      stage: "GENERATION_CLASSIFICATION",
      code: "UNSUPPORTED_EXPLICIT_GENERATION",
      message: `Unsupported explicit contractVersion: ${JSON.stringify(cv)}`,
    };
  }

  // contractVersion is absent
  const hasV2Marker = V2_EXCLUSIVE_MARKERS.some((marker) =>
    hasOwn(rootObj, marker),
  );
  if (hasV2Marker) {
    return {
      ok: false,
      stage: "GENERATION_CLASSIFICATION",
      code: "MISSING_V2_GENERATION_MARKER",
      message:
        "Request contains V2-exclusive top-level sections but omits explicit contractVersion: 'v2'",
    };
  }

  // Historical markerless V1 path
  const v1Res = validateExecutionRequest(rootObj);
  if (!v1Res.ok) {
    return {
      ok: false,
      stage: "V1_VALIDATION",
      error: v1Res.error,
    };
  }

  return {
    ok: true,
    generation: "v1",
    executionRequest: v1Res.value,
  };
}
