import { type ValidationResult } from "./index.js";
import {
  type ParsedGs1DigitalLink,
  type ParsedGs1DigitalLinkComponent,
} from "./gs1Parser.js";

export type GS1ValidationErrorCode =
  | "MISSING_PRIMARY_IDENTIFIER"
  | "DUPLICATE_PRIMARY_IDENTIFIER"
  | "INVALID_AI_CONFLICT"
  | "INVALID_PRIMARY_IDENTIFIER"
  | "INVALID_AI_LENGTH"
  | "INVALID_CHECK_DIGIT"
  | "INVALID_AI_CHARACTER_SET"
  | "INVALID_CARDINALITY"
  | "INVALID_AI_VALUE";

export interface GS1ValidationError {
  readonly code: GS1ValidationErrorCode;
  readonly message: string;
}

export interface ValidatedGs1DigitalLink {
  readonly parsedCarrier: ParsedGs1DigitalLink;
  readonly primaryIdentifier: ParsedGs1DigitalLinkComponent;
  readonly supportedQualifiers: readonly ParsedGs1DigitalLinkComponent[];
  readonly unsupportedContext: readonly ParsedGs1DigitalLinkComponent[];
}

/**
 * Checks if a character sequence is composed of permitted characters under GS1 Character Set 82.
 * Validates only ASCII characters according to the frozen specifications.
 */
function isValidGs1CharacterSet(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const ok =
      code === 33 || // !
      code === 34 || // "
      (code >= 37 && code <= 63) || // % & ' ( ) * + , - . / 0-9 : ; < = > ?
      (code >= 65 && code <= 90) || // A-Z
      code === 95 || // _
      (code >= 97 && code <= 122); // a-z
    if (!ok) {
      return false;
    }
  }
  return true;
}

/**
 * Validates the check digit of a 14-digit GTIN using right-anchored modulo-10 algorithm.
 */
function isValidGtinCheckDigit(gtin: string): boolean {
  if (gtin.length !== 14) {
    return false;
  }
  const digits = gtin.split("").map((c) => parseInt(c, 10));
  const suppliedCheckDigit = digits[13];

  let sum = 0;
  let weight = 3;
  // Index 0 to 12 correspond to positions N1 to N13.
  // Weight alternates leftward starting with 3 on N13 (index 12).
  for (let i = 12; i >= 0; i--) {
    sum += digits[i] * weight;
    weight = weight === 3 ? 1 : 3;
  }

  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  return suppliedCheckDigit === expectedCheckDigit;
}

/**
 * Semantically validates the parsed GS1 Digital Link components.
 * Pure, deterministic, side-effect-free domain function.
 */
export function validateGs1DigitalLink(
  parsedCarrier: ParsedGs1DigitalLink,
): ValidationResult<ValidatedGs1DigitalLink, GS1ValidationError> {
  const components = parsedCarrier.applicationIdentifiers;

  // 1. Missing primary identifier (AI 01)
  const primaryComponents = components.filter((c) => c.ai === "01");
  if (primaryComponents.length === 0) {
    return {
      ok: false,
      error: {
        code: "MISSING_PRIMARY_IDENTIFIER",
        message: "The GS1 Digital Link lacks a primary identifier (AI 01).",
      },
    };
  }

  // 2. Path / Query conflicts (Check this before DUPLICATE_PRIMARY_IDENTIFIER if conflict exists)
  // Any AI appearing in both the path and the query is an immediate INVALID_AI_CONFLICT.
  // This applies to all AIs (supported or unsupported).
  const pathAis = new Set<string>();
  const queryAis = new Set<string>();
  for (const c of components) {
    if (c.source === "path") {
      pathAis.add(c.ai);
    } else if (c.source === "query") {
      queryAis.add(c.ai);
    }
  }

  for (const ai of pathAis) {
    if (queryAis.has(ai)) {
      return {
        ok: false,
        error: {
          code: "INVALID_AI_CONFLICT",
          message: `The AI '${ai}' is present in both path and query locations.`,
        },
      };
    }
  }

  // 3. Duplicate primary identifier (AI 01)
  // Since we already checked path/query conflicts, any duplicate AI 01s must be in the same location.
  if (primaryComponents.length > 1) {
    return {
      ok: false,
      error: {
        code: "DUPLICATE_PRIMARY_IDENTIFIER",
        message:
          "The GS1 Digital Link contains multiple primary identifiers (AI 01).",
      },
    };
  }

  const primaryComponent = primaryComponents[0];

  // 4. Cardinality
  // Duplicate AIs within the same location (path-only or query-only) are INVALID_CARDINALITY.
  // This applies to all AIs (supported or unsupported).
  const pathSeen = new Set<string>();
  const querySeen = new Set<string>();
  for (const c of components) {
    if (c.source === "path") {
      if (pathSeen.has(c.ai)) {
        return {
          ok: false,
          error: {
            code: "INVALID_CARDINALITY",
            message: `Duplicate AI '${c.ai}' in path components.`,
          },
        };
      }
      pathSeen.add(c.ai);
    } else if (c.source === "query") {
      if (querySeen.has(c.ai)) {
        return {
          ok: false,
          error: {
            code: "INVALID_CARDINALITY",
            message: `Duplicate AI '${c.ai}' in query components.`,
          },
        };
      }
      querySeen.add(c.ai);
    }
  }

  // 5. Primary identifier character validation (AI 01)
  if (/[^\d]/.test(primaryComponent.value)) {
    return {
      ok: false,
      error: {
        code: "INVALID_PRIMARY_IDENTIFIER",
        message: "The primary identifier (AI 01) must contain only digits.",
      },
    };
  }

  // 6. Primary identifier length validation (AI 01)
  if (primaryComponent.value.length !== 14) {
    return {
      ok: false,
      error: {
        code: "INVALID_AI_LENGTH",
        message: "The primary identifier (AI 01) must be exactly 14 digits.",
      },
    };
  }

  // 7. Primary identifier check digit validation (AI 01)
  if (!isValidGtinCheckDigit(primaryComponent.value)) {
    return {
      ok: false,
      error: {
        code: "INVALID_CHECK_DIGIT",
        message:
          "The primary identifier (AI 01) has an invalid modulo-10 check digit.",
      },
    };
  }

  // 8. Individual qualifier / data attribute validation (AI 10, AI 17, AI 21)
  // Check AI 10 if present
  const comp10 = components.find((c) => c.ai === "10");
  if (comp10) {
    if (comp10.value.length < 1 || comp10.value.length > 20) {
      return {
        ok: false,
        error: {
          code: "INVALID_AI_LENGTH",
          message:
            "AI 10 batch or lot number must be between 1 and 20 characters.",
        },
      };
    }
    if (!isValidGs1CharacterSet(comp10.value)) {
      return {
        ok: false,
        error: {
          code: "INVALID_AI_CHARACTER_SET",
          message: "AI 10 batch or lot number contains invalid characters.",
        },
      };
    }
  }

  // Check AI 17 if present
  const comp17 = components.find((c) => c.ai === "17");
  if (comp17) {
    // Validate order: digits only, exactly six digits, month/day validation
    if (/[^\d]/.test(comp17.value)) {
      return {
        ok: false,
        error: {
          code: "INVALID_AI_CHARACTER_SET",
          message: "AI 17 expiration date must contain only digits.",
        },
      };
    }
    if (comp17.value.length !== 6) {
      return {
        ok: false,
        error: {
          code: "INVALID_AI_LENGTH",
          message: "AI 17 expiration date must be exactly six digits.",
        },
      };
    }
    const mm = parseInt(comp17.value.slice(2, 4), 10);
    const dd = parseInt(comp17.value.slice(4, 6), 10);
    if (mm < 1 || mm > 12 || dd < 0 || dd > 31) {
      return {
        ok: false,
        error: {
          code: "INVALID_AI_VALUE",
          message: "AI 17 expiration date has invalid month or day range.",
        },
      };
    }
  }

  // Check AI 21 if present
  const comp21 = components.find((c) => c.ai === "21");
  if (comp21) {
    if (comp21.value.length < 1 || comp21.value.length > 20) {
      return {
        ok: false,
        error: {
          code: "INVALID_AI_LENGTH",
          message: "AI 21 serial number must be between 1 and 20 characters.",
        },
      };
    }
    if (!isValidGs1CharacterSet(comp21.value)) {
      return {
        ok: false,
        error: {
          code: "INVALID_AI_CHARACTER_SET",
          message: "AI 21 serial number contains invalid characters.",
        },
      };
    }
  }

  // 9. Construct ValidatedGs1DigitalLink
  const supportedQualifiers = components.filter(
    (c) => c.ai === "10" || c.ai === "17" || c.ai === "21",
  );
  const unsupportedContext = components.filter(
    (c) => c.ai !== "01" && c.ai !== "10" && c.ai !== "17" && c.ai !== "21",
  );

  const value: ValidatedGs1DigitalLink = {
    parsedCarrier,
    primaryIdentifier: primaryComponent,
    supportedQualifiers: Object.freeze([...supportedQualifiers]),
    unsupportedContext: Object.freeze([...unsupportedContext]),
  };

  Object.freeze(value);

  return {
    ok: true,
    value,
  };
}
