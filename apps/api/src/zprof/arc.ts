import { canonicalizeJcs } from "@zyppi/domain";
import { validateEvaluationCoordinatePayload } from "./ec.js";
import { validateParticipantCollection } from "./participant.js";
import { validateTopologyGraph } from "./topology.js";
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
import {
  deepFreezePlainData,
  validateIsoTimestamp,
  validatePinnedStateReference,
  validateSha256Digest,
} from "./validation.js";

const CLOSED_OPERATIONS: readonly PrimitiveOperation[] = [
  "NEW_COMPOSITION",
  "NEW_EVALUATION",
  "HISTORICAL_RECONSTRUCTION",
  "RECEIPT_VERIFICATION",
];

/**
 * Validates Target × OP compatibility AND target payload structure per CORR-0860-B-1 §3 / CORR-0860-B-2 §1-§2.
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
    case "NEW_COMPOSITION": {
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
      const compDef = target.compositionDefinition;
      if (!compDef || typeof compDef !== "object") {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message:
              "CompositionAuthoringTarget contains malformed or ungoverned compositionDefinition.",
          },
        };
      }

      if (!Array.isArray(compDef.participants)) {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message:
              "CompositionAuthoringTarget.participants must be an array.",
          },
        };
      }

      // Reuse AMS-0858 governed participant validation per CORR-0860-B-2 §2
      const partRes = validateParticipantCollection(compDef.participants);
      if (!partRes.ok) {
        return partRes;
      }
      const validParticipants = partRes.participants;

      if (!Array.isArray(compDef.bindingEdges)) {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message:
              "CompositionAuthoringTarget.bindingEdges must be an array.",
          },
        };
      }

      const rawBindingEdges = compDef.bindingEdges.map((e) => {
        const edge = e as {
          sourceId?: string;
          sourceRef?: string;
          targetId?: string;
          targetRef?: string;
          dependencyKind?: string;
        };
        return {
          sourceId: edge.sourceId || edge.sourceRef || "",
          targetId: edge.targetId || edge.targetRef || "",
          dependencyKind: edge.dependencyKind || "REQUIRES",
        };
      });

      // Reuse AMS-0858 governed topology validation per CORR-0860-B-2 §2
      const topoRes = validateTopologyGraph(
        validParticipants,
        [],
        rawBindingEdges,
      );
      if (!topoRes.ok) {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message: topoRes.error.message,
          },
        };
      }

      break;
    }

    case "NEW_EVALUATION": {
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
      const ecRes = validateEvaluationCoordinatePayload(
        target.coordinate,
        "target.coordinate",
      );
      if (!ecRes.ok) return ecRes;
      break;
    }

    case "HISTORICAL_RECONSTRUCTION": {
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
      if (
        !target.ref ||
        typeof target.ref !== "string" ||
        target.ref.trim().length === 0
      ) {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message:
              "HistoricalEvaluationCoordinateTarget.ref must be a non-empty string.",
          },
        };
      }
      if (target.coordinate !== undefined) {
        const histEcRes = validateEvaluationCoordinatePayload(
          target.coordinate,
          "target.coordinate",
        );
        if (!histEcRes.ok) return histEcRes;
      }
      break;
    }

    case "RECEIPT_VERIFICATION": {
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
      if (
        !target.receiptRef ||
        typeof target.receiptRef !== "string" ||
        target.receiptRef.trim().length === 0
      ) {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message:
              "ExecutionReceiptTarget.receiptRef must be a non-empty string.",
          },
        };
      }
      if (target.receiptDigest !== undefined) {
        const digestRes = validateSha256Digest(
          target.receiptDigest,
          "target.receiptDigest",
        );
        if (!digestRes.ok) return digestRes;
      }
      break;
    }
  }

  return { ok: true };
}

/**
 * Builds an AssessmentRequestCoordinate (ARC) per AMS-0860-B §22-§28 / CORR-0860-B-1 / CORR-0860-B-2.
 * Enforces closed OP vocabulary, Target × OP matrix, structural target payload validation,
 * explicit pinnedAssessmentStateRef with zero fallback, and explicit T_trust.
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

  const tTrustIsoRes = validateIsoTimestamp(input.tTrust, "tTrust");
  if (!tTrustIsoRes.ok) {
    return { ok: false, error: tTrustIsoRes.error };
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
 * Establishes the non-authoritative historical reconstruction boundary per AMS-0860-B §29-§31 / CORR-0860-B-1 §1-§2.
 * Produces a NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION result without executing Runtime, fabricating temporal facts, or taking caller booleans as authority.
 */
export function evaluateHistoricalReconstructionBoundary(
  target: AssessmentTarget,
): HistoricalReconstructionBoundaryResult {
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

  if (
    !target.ref ||
    typeof target.ref !== "string" ||
    target.ref.trim().length === 0
  ) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          "HistoricalEvaluationCoordinateTarget.ref must be a non-empty string.",
      },
    };
  }

  const result: HistoricalReconstructionResult = Object.freeze({
    status: "NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION",
    targetRef: target.ref,
    ...(target.coordinate ? { historicalCoordinate: target.coordinate } : {}),
  });

  return {
    ok: true,
    result,
  };
}
