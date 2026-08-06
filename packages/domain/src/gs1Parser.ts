import { type ValidationResult } from "./index.js";

export type Gs1DigitalLinkComponentSource = "path" | "query";

export interface ParsedGs1DigitalLinkComponent {
  readonly ai: string;
  readonly value: string;
  readonly source: Gs1DigitalLinkComponentSource;
}

export interface ParsedGs1DigitalLink {
  readonly originalInput: string;
  readonly parsedUri: string;
  readonly scheme: string;
  readonly host: string;
  readonly applicationIdentifiers: readonly ParsedGs1DigitalLinkComponent[];
}

export type GS1ParseErrorCode =
  | "UNSUPPORTED_CARRIER_FORM"
  | "MALFORMED_CARRIER_STRUCTURE"
  | "MALFORMED_AI_STRUCTURE"
  | "MISSING_REQUIRED_STRUCTURE";

export interface GS1ParseError {
  readonly code: GS1ParseErrorCode;
  readonly message: string;
}

/**
 * Checks if a string is a parseable GS1 Application Identifier (AI) code.
 * Under GS1 standards, AI codes consist of exactly 2, 3, or 4 numeric digits.
 */
function isParseableAiCode(ai: string): boolean {
  return /^\d{2,4}$/.test(ai);
}

/**
 * Decodes a percent-encoded URI component exactly once.
 * Returns a ValidationResult with the decoded string or a MALFORMED_CARRIER_STRUCTURE error.
 */
function safeDecode(val: string): ValidationResult<string, GS1ParseError> {
  try {
    return { ok: true, value: decodeURIComponent(val) };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "MALFORMED_CARRIER_STRUCTURE",
        message: "Malformed percent-encoding in URI component.",
      },
    };
  }
}

/**
 * Parses a candidate external GS1 Digital Link carrier string.
 * Decomposes it structurally into Application Identifier/value components
 * while keeping original inputs and source origins (path vs query) distinct.
 * Purely deterministic, side-effect free, and performs no semantic validation or normalization.
 */
export function parseGs1DigitalLink(
  input: string,
): ValidationResult<ParsedGs1DigitalLink, GS1ParseError> {
  if (typeof input !== "string" || input === "") {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED_CARRIER_FORM",
        message:
          "Input must be a non-empty string representing an absolute HTTP(S) URI.",
      },
    };
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch (err) {
    // If it starts with http:// or https:// but fails URL parsing, it has a malformed carrier structure
    const isHttpOrHttps = /^https?:\/\//i.test(input);
    if (isHttpOrHttps) {
      return {
        ok: false,
        error: {
          code: "MALFORMED_CARRIER_STRUCTURE",
          message: "Failed to parse absolute HTTP(S) URI structure.",
        },
      };
    } else {
      return {
        ok: false,
        error: {
          code: "UNSUPPORTED_CARRIER_FORM",
          message: "Input is not a valid absolute HTTP(S) URI.",
        },
      };
    }
  }

  // Reject unsupported protocols
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED_CARRIER_FORM",
        message: "Only http and https URI schemes are supported.",
      },
    };
  }

  // Path segments parsing
  let pathname = url.pathname;
  if (pathname.startsWith("/")) {
    pathname = pathname.slice(1);
  }
  if (pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const segments = pathname === "" ? [] : pathname.split("/");

  // Missing required structure check: path must have at least one AI/value pair
  if (segments.length === 0) {
    return {
      ok: false,
      error: {
        code: "MISSING_REQUIRED_STRUCTURE",
        message:
          "The URI path contains no parseable GS1 Application Identifier structure.",
      },
    };
  }

  // Check if first segment is a parseable AI code (e.g. /products/widget is missing required structure)
  if (!isParseableAiCode(segments[0])) {
    return {
      ok: false,
      error: {
        code: "MISSING_REQUIRED_STRUCTURE",
        message:
          "The URI path does not begin with a parseable GS1 Application Identifier structure.",
      },
    };
  }

  // If there's an odd number of segments, it is a malformed AI structure
  if (segments.length % 2 !== 0) {
    return {
      ok: false,
      error: {
        code: "MALFORMED_AI_STRUCTURE",
        message: "Path components must occur in alternating AI/value pairs.",
      },
    };
  }

  const pathComponents: ParsedGs1DigitalLinkComponent[] = [];

  for (let i = 0; i < segments.length; i += 2) {
    const rawAi = segments[i];
    const rawValue = segments[i + 1];

    const aiDecodeRes = safeDecode(rawAi);
    if (!aiDecodeRes.ok) {
      return aiDecodeRes;
    }
    const valueDecodeRes = safeDecode(rawValue);
    if (!valueDecodeRes.ok) {
      return valueDecodeRes;
    }

    const ai = aiDecodeRes.value;
    const value = valueDecodeRes.value;

    if (!isParseableAiCode(ai)) {
      return {
        ok: false,
        error: {
          code: "MALFORMED_AI_STRUCTURE",
          message: `The segment '${ai}' in the path is not a valid GS1 Application Identifier.`,
        },
      };
    }

    pathComponents.push({
      ai,
      value,
      source: "path",
    });
  }

  // Query parameter parsing
  const queryComponents: ParsedGs1DigitalLinkComponent[] = [];

  if (url.search && url.search.length > 1) {
    const queryString = url.search.slice(1);
    const pairs = queryString.split("&");
    for (const pair of pairs) {
      if (pair === "") {
        continue;
      }
      const eqIndex = pair.indexOf("=");
      let rawKey: string;
      let rawValue: string;
      if (eqIndex === -1) {
        rawKey = pair;
        rawValue = "";
      } else {
        rawKey = pair.slice(0, eqIndex);
        rawValue = pair.slice(eqIndex + 1);
      }

      const keyDecodeRes = safeDecode(rawKey);
      if (!keyDecodeRes.ok) {
        return keyDecodeRes;
      }
      const valDecodeRes = safeDecode(rawValue);
      if (!valDecodeRes.ok) {
        return valDecodeRes;
      }

      const key = keyDecodeRes.value;
      const value = valDecodeRes.value;

      if (isParseableAiCode(key)) {
        queryComponents.push({
          ai: key,
          value,
          source: "query",
        });
      }
    }
  }

  const applicationIdentifiers = [...pathComponents, ...queryComponents];

  const result: ParsedGs1DigitalLink = {
    originalInput: input,
    parsedUri: url.toString(),
    scheme: url.protocol.slice(0, -1),
    host: url.host,
    applicationIdentifiers,
  };

  // Deeply freeze output to maintain absolute immutability-by-value
  applicationIdentifiers.forEach((item) => Object.freeze(item));
  Object.freeze(applicationIdentifiers);
  Object.freeze(result);

  return {
    ok: true,
    value: result,
  };
}
