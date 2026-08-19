import { canonicalizeJcs } from "@zyppi/domain";
import { deepFreezePlainData, validatePinnedStateReference } from "./ec.js";
import type {
  AssessmentRequestCoordinate,
  AssessmentRequestCoordinateInput,
  AssessmentRequestCoordinateResult,
  AssessmentTarget,
  CompositionError,
  HistoricalReconstructionBoundaryResult,
  HistoricalReconstructionResult,
  PinnedStateReference,
  PrimitiveOperation,
} from "./types.js";

const CLOSED_OPERATIONS: readonly PrimitiveOperation[] = [
  "NEW_COMPOSITION",
  "NEW_EVALUATION",
  "HISTORICAL_RECONSTRUCTION",
  "RECEIPT_VERIFICATION",
];

/**
 * Validates Target × OP compatibility per AMS-0860-B §24 using strict target.kind discriminator.
 */
export function validateTargetOperationCompatibility(
  target: AssessmentTarget,
  operation: PrimitiveOperation,
):
  | { readonly ok: true }
  | { readonly ok: false; readonly error: CompositionError } {
  if (!CLOSED_OPERATIONS.includes(operation)) {
    return {
      ok: false,
      error: {
        code: "unsupported",
        category: "Composition Failure",
        message: `Unknown or unratified operation '${operation}'. Closed operation vocabulary enforced.`,
      },
    };
  }

  if (!target || typeof target !== "object" || !("kind" in target)) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          "Assessment target must be a valid discriminated AssessmentTarget structure with an explicit 'kind' property.",
      },
    };
  }

  switch (operation) {
    case "NEW_COMPOSITION":
      if (target.kind !== "COMPOSITION_AUTHORING") {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message: `Incompatible Target × OP matrix pair: Operation '${operation}' requires Target kind 'COMPOSITION_AUTHORING', received '${target.kind}'.`,
          },
        };
      }
      break;

    case "NEW_EVALUATION":
      if (target.kind !== "EVALUATION_COORDINATE") {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message: `Incompatible Target × OP matrix pair: Operation '${operation}' requires Target kind 'EVALUATION_COORDINATE', received '${target.kind}'.`,
          },
        };
      }
      break;

    case "HISTORICAL_RECONSTRUCTION":
      if (target.kind !== "HISTORICAL_EVALUATION_COORDINATE") {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message: `Incompatible Target × OP matrix pair: Operation '${operation}' requires Target kind 'HISTORICAL_EVALUATION_COORDINATE', received '${target.kind}'.`,
          },
        };
      }
      break;

    case "RECEIPT_VERIFICATION":
      if (target.kind !== "EXECUTION_RECEIPT") {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message: `Incompatible Target × OP matrix pair: Operation '${operation}' requires Target kind 'EXECUTION_RECEIPT', received '${target.kind}'.`,
          },
        };
      }
      break;
  }

  return { ok: true };
}

/**
 * Builds an AssessmentRequestCoordinate (ARC) per AMS-0860-B §22-§28.
 * Enforces closed OP vocabulary, Target × OP matrix, explicit pinnedAssessmentStateRef with zero fallback,
 * and explicit T_trust.
 */
export function buildAssessmentRequestCoordinate(
  input: AssessmentRequestCoordinateInput,
): AssessmentRequestCoordinateResult {
  const opTargetRes = validateTargetOperationCompatibility(
    input.target,
    input.operation,
  );
  if (!opTargetRes.ok) {
    return { ok: false, error: opTargetRes.error };
  }

  const pinRes = validatePinnedStateReference(
    input.pinnedAssessmentStateRef,
    "pinnedAssessmentStateRef",
  );
  if (!pinRes.ok) {
    return { ok: false, error: pinRes.error };
  }

  if (
    !input.tTrust ||
    typeof input.tTrust !== "string" ||
    input.tTrust.trim().length === 0
  ) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "Required assessment trust temporal coordinate 'tTrust' is absent.",
      },
    };
  }

  const validatedRules: PinnedStateReference[] = [];
  if (input.applicableAssessmentRules) {
    if (!Array.isArray(input.applicableAssessmentRules)) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message:
            "applicableAssessmentRules, when supplied, must be an array.",
        },
      };
    }

    for (let i = 0; i < input.applicableAssessmentRules.length; i++) {
      const rule = input.applicableAssessmentRules[i]!;
      const ruleRes = validatePinnedStateReference(
        rule,
        `applicableAssessmentRules[${i}]`,
      );
      if (!ruleRes.ok) {
        return { ok: false, error: ruleRes.error };
      }
      validatedRules.push(rule);
    }
  }

  try {
    const frozenTarget = deepFreezePlainData(input.target, "target");
    const frozenPinnedAssessmentStateRef = deepFreezePlainData(
      input.pinnedAssessmentStateRef,
      "pinnedAssessmentStateRef",
    );
    const sortedRules = [...validatedRules]
      .map((r) => deepFreezePlainData(r))
      .sort((a, b) => canonicalizeJcs(a).localeCompare(canonicalizeJcs(b)));
    const frozenRules =
      sortedRules.length > 0 ? Object.freeze(sortedRules) : undefined;

    const coordinate: AssessmentRequestCoordinate = Object.freeze({
      target: frozenTarget,
      operation: input.operation,
      pinnedAssessmentStateRef: frozenPinnedAssessmentStateRef,
      tTrust: input.tTrust,
      ...(frozenRules ? { applicableAssessmentRules: frozenRules } : {}),
    });

    return {
      ok: true,
      coordinate,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          err instanceof Error
            ? err.message
            : "Failed to deep-freeze assessment request coordinate data.",
      },
    };
  }
}

/**
 * Establishes the non-authoritative historical reconstruction boundary per AMS-0860-B §29-§31.
 * Produces a NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION result without executing Runtime or creating authority.
 */
export function evaluateHistoricalReconstructionBoundary(
  target: AssessmentTarget,
  prohibitHistoricalReconstruction?: boolean,
): HistoricalReconstructionBoundaryResult {
  if (prohibitHistoricalReconstruction) {
    return {
      ok: false,
      error: {
        code: "unauthorized",
        category: "Composition Failure",
        message:
          "Historical reconstruction is prohibited by explicitly bound sovereign rule.",
      },
    };
  }

  if (target.kind !== "HISTORICAL_EVALUATION_COORDINATE") {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Historical reconstruction boundary evaluation requires Target kind 'HISTORICAL_EVALUATION_COORDINATE', received '${target.kind}'.`,
      },
    };
  }

  const result: HistoricalReconstructionResult = Object.freeze({
    status: "NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION",
    targetRef: target.ref,
    ...(target.coordinate ? { historicalCoordinate: target.coordinate } : {}),
    reconstructionTimestamp: "1970-01-01T00:00:00.000Z", // fixed deterministic boundary epoch representation
  });

  return {
    ok: true,
    result,
  };
}
