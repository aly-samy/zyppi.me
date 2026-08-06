import { type ValidationResult } from "./index.js";
import { type ParsedGs1DigitalLinkComponent } from "./gs1Parser.js";
import { type ValidatedGs1DigitalLink } from "./gs1Validator.js";

export type GS1NormalizationErrorCode = "INVALID_VALIDATED_INPUT";

export interface GS1NormalizationError {
  readonly code: GS1NormalizationErrorCode;
  readonly message: string;
}

export interface NormalizedGs1DigitalLink {
  readonly k1: string;
  readonly primaryIdentifier: ParsedGs1DigitalLinkComponent;
  readonly supportedQualifiers: readonly ParsedGs1DigitalLinkComponent[];
  readonly unsupportedContext: readonly ParsedGs1DigitalLinkComponent[];
}

/**
 * Defensive assertion check for exactly 14 decimal digits.
 */
function isExactly14Digits(val: string): boolean {
  return /^[0-9]{14}$/.test(val);
}

/**
 * Consumes a successfully validated Digital Link and produces a canonical immutable representation
 * suitable for deterministic Registry Resolution.
 */
export function normalizeGs1DigitalLink(
  validated: ValidatedGs1DigitalLink,
): ValidationResult<NormalizedGs1DigitalLink, GS1NormalizationError> {
  // Defensive Contract Assertion
  if (
    !validated ||
    typeof validated !== "object" ||
    !validated.primaryIdentifier ||
    validated.primaryIdentifier.ai !== "01" ||
    typeof validated.primaryIdentifier.value !== "string" ||
    !isExactly14Digits(validated.primaryIdentifier.value)
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALIDATED_INPUT",
        message:
          "The supplied ValidatedGs1DigitalLink violates contract invariants.",
      },
    };
  }

  // 1. Produce the canonical Registry identifier ("K1")
  const k1 = validated.primaryIdentifier.value;

  // 2. Preserve primaryIdentifier exactly
  const primaryIdentifier = validated.primaryIdentifier;

  // 3. Produce deterministic supported qualifier ordering: 10, then 17, then 21.
  const supportedAisOrder = ["10", "17", "21"];
  const supportedQualifiers: ParsedGs1DigitalLinkComponent[] = [];

  for (const ai of supportedAisOrder) {
    const comp = validated.supportedQualifiers.find((c) => c.ai === ai);
    if (comp) {
      supportedQualifiers.push(comp);
    }
  }

  // Freeze the newly constructed array to guarantee immutability
  Object.freeze(supportedQualifiers);

  // 4. Preserve unsupportedContext exactly as received
  const unsupportedContext = validated.unsupportedContext;

  const normalized: NormalizedGs1DigitalLink = {
    k1,
    primaryIdentifier,
    supportedQualifiers,
    unsupportedContext,
  };

  // Freeze the final returned object
  Object.freeze(normalized);

  return {
    ok: true,
    value: normalized,
  };
}
