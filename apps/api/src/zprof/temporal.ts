import { validateIsoTimestamp } from "./validation.js";
import type {
  CompositionError,
  EvaluationTemporalCoordinates,
  TemporalRequirements,
} from "./types.js";

export type BuildTemporalCoordinatesResult =
  | {
      readonly ok: true;
      readonly temporalCoordinates: EvaluationTemporalCoordinates;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
    };

/**
 * Validates temporal requirement constraints against supplied temporal coordinates per AMS-0860-B §18-§21 / CORR-0860-B-1 §5 / CORR-0860-B-2 §3.
 * Enforces strict ISO-8601 timestamp format validation when temporal coordinates are present.
 * Governed rule requirements consume explicit declarations; does not infer applicability or consult ambient clocks.
 */
export function validateTemporalRequirements(
  temporalCoordinates?: EvaluationTemporalCoordinates,
  temporalRequirements?: TemporalRequirements,
): BuildTemporalCoordinatesResult {
  if (temporalCoordinates?.tValid !== undefined) {
    const tValidRes = validateIsoTimestamp(
      temporalCoordinates.tValid,
      "tValid",
    );
    if (!tValidRes.ok) {
      return tValidRes;
    }
  }

  if (temporalCoordinates?.tObservation !== undefined) {
    const tObsRes = validateIsoTimestamp(
      temporalCoordinates.tObservation,
      "tObservation",
    );
    if (!tObsRes.ok) {
      return tObsRes;
    }
  }

  if (temporalCoordinates?.tEInput !== undefined) {
    const tERes = validateIsoTimestamp(temporalCoordinates.tEInput, "tEInput");
    if (!tERes.ok) {
      return tERes;
    }
  }

  const coords: EvaluationTemporalCoordinates = {
    ...(temporalCoordinates?.tValid
      ? { tValid: temporalCoordinates.tValid }
      : {}),
    ...(temporalCoordinates?.tObservation
      ? { tObservation: temporalCoordinates.tObservation }
      : {}),
    ...(temporalCoordinates?.tEInput
      ? { tEInput: temporalCoordinates.tEInput }
      : {}),
  };

  if (temporalRequirements?.requiresTValid && !coords.tValid) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "Governed temporal requirements specify mandatory Valid Time (T_v), but tValid was absent.",
      },
    };
  }

  if (temporalRequirements?.requiresTObservation && !coords.tObservation) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "Governed temporal requirements specify mandatory Evidence Observation Time (T_o), but tObservation was absent.",
      },
    };
  }

  if (temporalRequirements?.requiresTEInput && !coords.tEInput) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "Governed temporal requirements specify mandatory Execution Time Input (T_e_input), but tEInput was absent.",
      },
    };
  }

  return {
    ok: true,
    temporalCoordinates: Object.freeze(coords),
  };
}
