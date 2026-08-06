import type {
  ValidationResult,
  NormalizedGs1DigitalLink,
} from "@zyppi/domain";
import {
  createValidatedCanonicalIdentifier,
  type RetrievedRegistryState,
  type RegistryRepository,
} from "./registry.js";

export type GS1ResolutionErrorCode =
  | "INVALID_NORMALIZED_INPUT"
  | "REFERENT_NOT_FOUND"
  | "REGISTRY_FAILURE";

export interface GS1ResolutionError {
  readonly code: GS1ResolutionErrorCode;
  readonly message: string;
}

export interface ResolvedGs1DigitalLink {
  readonly normalizedCarrier: NormalizedGs1DigitalLink;
  readonly registryState: RetrievedRegistryState;
}

/**
 * Resolves a canonical normalized identifier into an existing Registry Referent.
 * Performs defensive contract assertions on the input without repeating GS1 validation.
 * Uses only the canonical identifier for lookup.
 * Returns a ValidationResult.
 */
export async function resolveGs1DigitalLink(
  normalizedCarrier: NormalizedGs1DigitalLink,
  repository: RegistryRepository,
): Promise<ValidationResult<ResolvedGs1DigitalLink, GS1ResolutionError>> {
  // 1. Defensive Contract Assertions
  if (!normalizedCarrier || typeof normalizedCarrier !== "object") {
    return {
      ok: false,
      error: {
        code: "INVALID_NORMALIZED_INPUT",
        message: "The supplied NormalizedGs1DigitalLink is missing or invalid.",
      },
    };
  }

  const k1 = normalizedCarrier.k1;
  if (typeof k1 !== "string" || k1.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_NORMALIZED_INPUT",
        message: "The canonical identifier (k1) must be a non-empty string.",
      },
    };
  }

  // Construct a ValidatedCanonicalIdentifier using the existing M05 contract
  const canonicalIdResult = createValidatedCanonicalIdentifier(k1);
  if (!canonicalIdResult.ok) {
    return {
      ok: false,
      error: {
        code: "INVALID_NORMALIZED_INPUT",
        message: `The canonical identifier failed contract validation: ${canonicalIdResult.error}`,
      },
    };
  }

  const validatedId = canonicalIdResult.value;

  // 2. Resolve Identity
  // Invoke the constitutional Registry Repository lookup exactly once using only the canonical identifier
  let lookupResult;
  try {
    lookupResult = await repository.lookup(validatedId);
  } catch (error: unknown) {
    const errorWithMessage = error as { message?: string };
    return {
      ok: false,
      error: {
        code: "REGISTRY_FAILURE",
        message: `An unexpected error occurred during Registry lookup: ${errorWithMessage?.message || String(error)}`,
      },
    };
  }

  // 3. Handle Lookup Outcome
  if (!lookupResult.ok) {
    return {
      ok: false,
      error: {
        code: "REGISTRY_FAILURE",
        message: `Registry lookup failed. Original error: ${JSON.stringify(lookupResult.error)}`,
      },
    };
  }

  const state = lookupResult.value;
  if (state === null) {
    return {
      ok: false,
      error: {
        code: "REFERENT_NOT_FOUND",
        message: `No Referent exists in the Registry for canonical identifier: ${k1}`,
      },
    };
  }

  // 4. Return Resolution (with freezing of the newly created wrapper object to guarantee immutability)
  const resolved: ResolvedGs1DigitalLink = {
    normalizedCarrier,
    registryState: state,
  };

  Object.freeze(resolved);

  return {
    ok: true,
    value: resolved,
  };
}
