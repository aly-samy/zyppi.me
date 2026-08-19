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
 * Validates temporal requirement constraints against supplied temporal coordinates per AMS-0860-B §18-§21.
 * Governed rule requirements consume explicit declarations; does not infer applicability or consult ambient clocks.
 */
export function validateTemporalRequirements(
  temporalCoordinates?: EvaluationTemporalCoordinates,
  temporalRequirements?: TemporalRequirements,
): BuildTemporalCoordinatesResult {
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
