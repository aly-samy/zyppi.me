import { canonicalizeJcs } from "@zyppi/domain";
import { validateTemporalRequirements } from "./temporal.js";
import type {
  CompositionError,
  EvaluationCoordinate,
  EvaluationCoordinateInput,
  EvaluationCoordinateResult,
  EvidenceIntegrityCoordinate,
  PinnedStateReference,
} from "./types.js";

/**
 * Validates structural presence and format of PinnedStateReference.
 */
export function validatePinnedStateReference(
  ref: PinnedStateReference,
  roleName: string,
): { readonly ok: true } | { readonly ok: false; readonly error: CompositionError } {
  if (!ref || typeof ref !== "object" || Array.isArray(ref)) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `${roleName} must be an object with an explicit 'ref' property.`,
      },
    };
  }

  if (!ref.ref || typeof ref.ref !== "string" || ref.ref.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: `${roleName}.ref must be an explicit non-empty string reference identifier.`,
      },
    };
  }

  if (ref.version !== undefined && (typeof ref.version !== "string" || ref.version.trim().length === 0)) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `${roleName}.version, when supplied, must be an explicit non-empty string.`,
      },
    };
  }

  if (ref.digest !== undefined) {
    if (typeof ref.digest !== "string" || ref.digest.trim().length === 0) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `${roleName}.digest, when supplied, must be an explicit non-empty string.`,
        },
      };
    }
  }

  return { ok: true };
}

/**
 * Deeply clones and freezes a plain data object, ensuring no executable functions,
 * promises, getters, or classes with behavior exist.
 */
export function deepFreezePlainData<T>(val: T, path = "input"): T {
  if (val === null || val === undefined) {
    return val;
  }

  const type = typeof val;
  if (type === "function" || type === "symbol") {
    throw new Error(`Non-serializable/executable value at ${path} is prohibited.`);
  }

  if (type !== "object") {
    return val;
  }

  if (val instanceof Promise || val instanceof Map || val instanceof Set || val instanceof Date) {
    throw new Error(`Class instance or non-plain data structure at ${path} is prohibited.`);
  }

  if (Array.isArray(val)) {
    const frozenArray = val.map((item, idx) => deepFreezePlainData(item, `${path}[${idx}]`));
    return Object.freeze(frozenArray) as unknown as T;
  }

  const obj = val as Record<string, unknown>;
  const frozenObj: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const propDesc = Object.getOwnPropertyDescriptor(obj, key);
    if (propDesc && (propDesc.get || propDesc.set)) {
      throw new Error(`Getter or setter property at ${path}.${key} is prohibited.`);
    }
    frozenObj[key] = deepFreezePlainData(obj[key], `${path}.${key}`);
  }

  return Object.freeze(frozenObj) as unknown as T;
}

/**
 * Builds an EvaluationCoordinate (EC) per AMS-0860-B §10-§21.
 * Consumes pre-computed sccId and bcgId from AMS-0860-A without recomputing them.
 * Guarantees OP ∉ EC, PinnedAssessmentState ∉ EC, T_trust ∉ EC, ExecutionReceipt ∉ EC, T_e_observed ∉ EC.
 */
export function buildEvaluationCoordinate(
  input: EvaluationCoordinateInput,
): EvaluationCoordinateResult {
  if (!input.sccId || typeof input.sccId !== "string" || input.sccId.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Required sccId from AMS-0860-A is absent.",
      },
    };
  }

  if (!input.bcgId || typeof input.bcgId !== "string" || input.bcgId.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Required bcgId from AMS-0860-A is absent.",
      },
    };
  }

  const pinRes = validatePinnedStateReference(input.pinnedSemanticStateRef, "pinnedSemanticStateRef");
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
    if (!item || typeof item !== "object" || !item.evidenceRef || !item.digest) {
      return {
        ok: false,
        error: {
          code: "unverified",
          category: "Composition Failure",
          message: `Evidence integrity coordinate at index ${i} is structurally malformed or incomplete.`,
        },
      };
    }
    validatedEvidenceCoords.push({
      evidenceRef: item.evidenceRef,
      digest: item.digest,
    });
  }

  // Validate temporal requirements
  const temporalRes = validateTemporalRequirements(input.temporalCoordinates, input.temporalRequirements);
  if (!temporalRes.ok) {
    return { ok: false, error: temporalRes.error };
  }

  try {
    const frozenPinnedStateRef = deepFreezePlainData(input.pinnedSemanticStateRef, "pinnedSemanticStateRef");
    const frozenBoundContext = deepFreezePlainData(input.boundContext, "boundContext");
    const sortedEvidenceCoords = [...validatedEvidenceCoords]
      .map((e) => deepFreezePlainData(e))
      .sort((a, b) => canonicalizeJcs(a).localeCompare(canonicalizeJcs(b)));
    const frozenEvidenceCoords = Object.freeze(sortedEvidenceCoords);
    const frozenAuthorizedInputs = deepFreezePlainData(input.authorizedInputs ?? {}, "authorizedInputs");
    const frozenEvaluationParams = deepFreezePlainData(input.evaluationParameters ?? {}, "evaluationParameters");

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
        message: err instanceof Error ? err.message : "Failed to deep-freeze evaluation coordinate data.",
      },
    };
  }
}
