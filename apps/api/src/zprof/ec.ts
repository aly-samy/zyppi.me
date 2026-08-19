import { canonicalizeJcs } from "@zyppi/domain";
import { validateTemporalRequirements } from "./temporal.js";
import type {
  CompositionError,
  EvaluationCoordinate,
  EvaluationCoordinateInput,
  EvaluationCoordinateResult,
  EvidenceIntegrityCoordinate,
} from "./types.js";
import {
  deepFreezePlainData,
  validateIsoTimestamp,
  validatePinnedStateReference,
  validateSha256Digest,
} from "./validation.js";

/**
 * Completely and deeply validates an EvaluationCoordinate payload per CORR-0860-B-2 §1.
 * Validates sccId, bcgId, pinnedSemanticStateRef, boundContext plain-data legality,
 * every EvidenceIntegrityCoordinate's evidenceRef & SHA-256 digest, every supplied temporal coordinate,
 * and authorizedInputs/evaluationParameters plain-data legality.
 */
export function validateEvaluationCoordinatePayload(
  coord: unknown,
  label = "coordinate",
):
  | { readonly ok: true }
  | { readonly ok: false; readonly error: CompositionError } {
  if (!coord || typeof coord !== "object") {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `${label} must be a valid EvaluationCoordinate object.`,
      },
    };
  }

  const ec = coord as Partial<EvaluationCoordinate>;

  if (
    !ec.sccId ||
    typeof ec.sccId !== "string" ||
    ec.sccId.trim().length === 0
  ) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: `${label}.sccId is absent or empty.`,
      },
    };
  }
  const sccRes = validateSha256Digest(ec.sccId, `${label}.sccId`);
  if (!sccRes.ok) return sccRes;

  if (
    !ec.bcgId ||
    typeof ec.bcgId !== "string" ||
    ec.bcgId.trim().length === 0
  ) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: `${label}.bcgId is absent or empty.`,
      },
    };
  }
  const bcgRes = validateSha256Digest(ec.bcgId, `${label}.bcgId`);
  if (!bcgRes.ok) return bcgRes;

  if (!ec.pinnedSemanticStateRef) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: `${label}.pinnedSemanticStateRef is absent.`,
      },
    };
  }
  const pinRes = validatePinnedStateReference(
    ec.pinnedSemanticStateRef,
    `${label}.pinnedSemanticStateRef`,
  );
  if (!pinRes.ok) return pinRes;

  if (!ec.boundContext || typeof ec.boundContext !== "object") {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: `${label}.boundContext must be an object.`,
      },
    };
  }
  try {
    deepFreezePlainData(ec.boundContext, `${label}.boundContext`);
  } catch (err: unknown) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          err instanceof Error
            ? err.message
            : "boundContext contains non-plain data.",
      },
    };
  }

  if (!Array.isArray(ec.evidenceIntegrityCoordinates)) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: `${label}.evidenceIntegrityCoordinates must be an array.`,
      },
    };
  }

  for (let i = 0; i < ec.evidenceIntegrityCoordinates.length; i++) {
    const item = ec.evidenceIntegrityCoordinates[i];
    if (
      !item ||
      typeof item !== "object" ||
      !item.evidenceRef ||
      typeof item.evidenceRef !== "string" ||
      item.evidenceRef.trim().length === 0
    ) {
      return {
        ok: false,
        error: {
          code: "unverified",
          category: "Composition Failure",
          message: `${label}.evidenceIntegrityCoordinates[${i}].evidenceRef is absent or empty.`,
        },
      };
    }

    const digestRes = validateSha256Digest(
      item.digest,
      `${label}.evidenceIntegrityCoordinates[${i}].digest`,
    );
    if (!digestRes.ok) {
      return {
        ok: false,
        error: {
          code: "unverified",
          category: "Composition Failure",
          message: digestRes.error.message,
        },
      };
    }
  }

  if (ec.temporalCoordinates !== undefined) {
    if (
      typeof ec.temporalCoordinates !== "object" ||
      ec.temporalCoordinates === null
    ) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `${label}.temporalCoordinates must be an object.`,
        },
      };
    }
    const temp = ec.temporalCoordinates;
    if (temp.tValid !== undefined) {
      const res = validateIsoTimestamp(
        temp.tValid,
        `${label}.temporalCoordinates.tValid`,
      );
      if (!res.ok) return res;
    }
    if (temp.tObservation !== undefined) {
      const res = validateIsoTimestamp(
        temp.tObservation,
        `${label}.temporalCoordinates.tObservation`,
      );
      if (!res.ok) return res;
    }
    if (temp.tEInput !== undefined) {
      const res = validateIsoTimestamp(
        temp.tEInput,
        `${label}.temporalCoordinates.tEInput`,
      );
      if (!res.ok) return res;
    }
  }

  if (ec.authorizedInputs !== undefined) {
    try {
      deepFreezePlainData(ec.authorizedInputs, `${label}.authorizedInputs`);
    } catch (err: unknown) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message:
            err instanceof Error
              ? err.message
              : "authorizedInputs contains non-plain data.",
        },
      };
    }
  }

  if (ec.evaluationParameters !== undefined) {
    try {
      deepFreezePlainData(
        ec.evaluationParameters,
        `${label}.evaluationParameters`,
      );
    } catch (err: unknown) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message:
            err instanceof Error
              ? err.message
              : "evaluationParameters contains non-plain data.",
        },
      };
    }
  }

  return { ok: true };
}

/**
 * Builds an EvaluationCoordinate (EC) per AMS-0860-B §10-§21 / CORR-0860-B-1 / CORR-0860-B-2.
 * Consumes pre-computed sccId and bcgId from AMS-0860-A without recomputing them.
 * Guarantees OP ∉ EC, PinnedAssessmentState ∉ EC, T_trust ∉ EC, ExecutionReceipt ∉ EC, T_e_observed ∉ EC.
 */
export function buildEvaluationCoordinate(
  input: EvaluationCoordinateInput,
): EvaluationCoordinateResult {
  if (
    !input.sccId ||
    typeof input.sccId !== "string" ||
    input.sccId.trim().length === 0
  ) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Required sccId from AMS-0860-A is absent.",
      },
    };
  }

  const sccDigestRes = validateSha256Digest(input.sccId, "sccId");
  if (!sccDigestRes.ok) {
    return { ok: false, error: sccDigestRes.error };
  }

  if (
    !input.bcgId ||
    typeof input.bcgId !== "string" ||
    input.bcgId.trim().length === 0
  ) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Required bcgId from AMS-0860-A is absent.",
      },
    };
  }

  const bcgDigestRes = validateSha256Digest(input.bcgId, "bcgId");
  if (!bcgDigestRes.ok) {
    return { ok: false, error: bcgDigestRes.error };
  }

  const pinRes = validatePinnedStateReference(
    input.pinnedSemanticStateRef,
    "pinnedSemanticStateRef",
  );
  if (!pinRes.ok) {
    return { ok: false, error: pinRes.error };
  }

  if (!input.boundContext || typeof input.boundContext !== "object") {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Required boundContext is absent.",
      },
    };
  }

  if (!Array.isArray(input.evidenceIntegrityCoordinates)) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Required evidenceIntegrityCoordinates list is absent.",
      },
    };
  }

  const validatedEvidenceCoords: EvidenceIntegrityCoordinate[] = [];
  for (let i = 0; i < input.evidenceIntegrityCoordinates.length; i++) {
    const item = input.evidenceIntegrityCoordinates[i]!;
    if (
      !item ||
      typeof item !== "object" ||
      !item.evidenceRef ||
      typeof item.evidenceRef !== "string" ||
      item.evidenceRef.trim().length === 0
    ) {
      return {
        ok: false,
        error: {
          code: "unverified",
          category: "Composition Failure",
          message: `Evidence integrity coordinate at index ${i} is structurally malformed or incomplete.`,
        },
      };
    }

    const evDigestRes = validateSha256Digest(
      item.digest,
      `evidenceIntegrityCoordinates[${i}].digest`,
    );
    if (!evDigestRes.ok) {
      return {
        ok: false,
        error: {
          code: "unverified",
          category: "Composition Failure",
          message: evDigestRes.error.message,
        },
      };
    }

    validatedEvidenceCoords.push({
      evidenceRef: item.evidenceRef,
      digest: item.digest,
    });
  }

  // Validate temporal requirements and strict ISO-8601 timestamp formats
  const temporalRes = validateTemporalRequirements(
    input.temporalCoordinates,
    input.temporalRequirements,
  );
  if (!temporalRes.ok) {
    return { ok: false, error: temporalRes.error };
  }

  try {
    const frozenPinnedStateRef = deepFreezePlainData(
      input.pinnedSemanticStateRef,
      "pinnedSemanticStateRef",
    );
    const frozenBoundContext = deepFreezePlainData(
      input.boundContext,
      "boundContext",
    );
    const sortedEvidenceCoords = [...validatedEvidenceCoords]
      .map((e) => deepFreezePlainData(e))
      .sort((a, b) => canonicalizeJcs(a).localeCompare(canonicalizeJcs(b)));
    const frozenEvidenceCoords = Object.freeze(sortedEvidenceCoords);
    const frozenAuthorizedInputs = deepFreezePlainData(
      input.authorizedInputs ?? {},
      "authorizedInputs",
    );
    const frozenEvaluationParams = deepFreezePlainData(
      input.evaluationParameters ?? {},
      "evaluationParameters",
    );

    const coordinate: EvaluationCoordinate = Object.freeze({
      sccId: input.sccId,
      bcgId: input.bcgId,
      pinnedSemanticStateRef: frozenPinnedStateRef,
      boundContext: frozenBoundContext,
      evidenceIntegrityCoordinates: frozenEvidenceCoords,
      authorizedInputs: frozenAuthorizedInputs,
      evaluationParameters: frozenEvaluationParams,
      temporalCoordinates: temporalRes.temporalCoordinates,
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
            : "Failed to deep-freeze evaluation coordinate data.",
      },
    };
  }
}
