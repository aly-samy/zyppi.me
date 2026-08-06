import type { ReplayCorpus } from "./replayTypes.js";
import { FROZEN_REGISTRY_SNAPSHOT } from "./replaySnapshot.js";

export const FROZEN_REPLAY_CORPUS: ReplayCorpus = {
  version: "1.0.0",
  cases: [
    // Case 1: Valid GS1 -> successful resolution
    {
      caseId: "CASE-01-SUCCESS",
      description:
        "Valid GS1 Digital Link representing GTIN resolves to an active identity",
      inputCarrier: "https://id.gs1.org/01/09506000134352",
      expectedOutput: {
        status: "RESOLVED",
        primaryIdentifier: {
          ai: "01",
          value: "09506000134352",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
        registryState: FROZEN_REGISTRY_SNAPSHOT["09506000134352"],
      },
    },

    // Case 2: Valid GS1 + qualifiers
    {
      caseId: "CASE-02-QUALIFIERS",
      description:
        "Valid GS1 Digital Link with qualifiers (AI 10, 17, 21) resolves and preserves qualifiers",
      inputCarrier:
        "https://id.gs1.org/01/09506000134307/10/LOT-789?17=260831&21=SER-999",
      expectedOutput: {
        status: "RESOLVED",
        primaryIdentifier: {
          ai: "01",
          value: "09506000134307",
          source: "path",
        },
        supportedQualifiers: [
          { ai: "10", value: "LOT-789", source: "path" },
          { ai: "17", value: "260831", source: "query" },
          { ai: "21", value: "SER-999", source: "query" },
        ],
        unsupportedContext: [],
        registryState: FROZEN_REGISTRY_SNAPSHOT["09506000134307"],
      },
    },

    // Case 3: Unsupported AI preservation
    {
      caseId: "CASE-03-UNSUPPORTED-AI",
      description:
        "Valid GS1 Digital Link with recognized but unsupported AIs preserves them in unsupportedContext",
      inputCarrier: "https://id.gs1.org/01/09506000134314/99/ABC?98=DEF",
      expectedOutput: {
        status: "RESOLVED",
        primaryIdentifier: {
          ai: "01",
          value: "09506000134314",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [
          { ai: "99", value: "ABC", source: "path" },
          { ai: "98", value: "DEF", source: "query" },
        ],
        registryState: FROZEN_REGISTRY_SNAPSHOT["09506000134314"],
      },
    },

    // Case 4: Registry NOT_FOUND
    {
      caseId: "CASE-04-NOT-FOUND",
      description:
        "Valid GS1 Digital Link where the parsed GTIN is valid but does not exist in the Registry",
      inputCarrier: "https://id.gs1.org/01/09506000134376",
      expectedOutput: {
        status: "NOT_FOUND",
        primaryIdentifier: {
          ai: "01",
          value: "09506000134376",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
        registryState: null,
      },
    },

    // Case 5: Parser failure (malformed carrier)
    {
      caseId: "CASE-05-PARSE-FAILURE",
      description:
        "Malformed GS1 Digital Link structure fails pure parsing stage with stabilized error",
      inputCarrier: "https://invalid.zyppi.org/products/widget",
      expectedOutput: {
        status: "INVALID_INPUT",
        error: {
          errorCode: "MISSING_REQUIRED_STRUCTURE",
          errorCategory: "PARSER_ERROR",
          errorReason:
            "The URI path does not begin with a parseable GS1 Application Identifier structure.",
        },
      },
    },

    // Case 6: Validator failure
    {
      caseId: "CASE-06-VALIDATION-FAILURE",
      description:
        "Syntactically parsed GS1 Digital Link with invalid characters in batch (AI 10) fails semantic validation",
      inputCarrier: "https://id.gs1.org/01/09506000134352/10/LOT%23123",
      expectedOutput: {
        status: "INVALID_INPUT",
        error: {
          errorCode: "INVALID_AI_CHARACTER_SET",
          errorCategory: "VALIDATION_ERROR",
          errorReason: "AI 10 batch or lot number contains invalid characters.",
        },
      },
    },

    // Case 7: Resolver failure (simulated database offline)
    {
      caseId: "CASE-07-REGISTRY-FAILURE",
      description:
        "Valid GS1 Digital Link fails to lookup due to infrastructure unavailable",
      inputCarrier: "https://id.gs1.org/01/09506000134352", // Repo will simulate failure for lookup when configured
      expectedOutput: {
        status: "REGISTRY_FAILURE",
        error: {
          errorCode: "REGISTRY_FAILURE",
          errorCategory: "RESOLVER_ERROR",
          errorReason:
            "An unexpected error occurred during Registry lookup: Postgres connection failed",
        },
      },
    },

    // Case 8: Incomplete constitutional state
    {
      caseId: "CASE-08-INCOMPLETE-STATE",
      description:
        "Valid GS1 Digital Link resolves to an identity that has incomplete constitutional state (missing referent)",
      inputCarrier: "https://id.gs1.org/01/09506000134345",
      expectedOutput: {
        status: "INCOMPLETE_CONSTITUTIONAL_STATE",
        primaryIdentifier: {
          ai: "01",
          value: "09506000134345",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
        registryState: FROZEN_REGISTRY_SNAPSHOT["09506000134345"],
      },
    },
  ],
};

// Deeply freeze the replay corpus to prevent any runtime modification
Object.freeze(FROZEN_REPLAY_CORPUS);
FROZEN_REPLAY_CORPUS.cases.forEach((c) => {
  Object.freeze(c.expectedOutput);
  if (c.expectedOutput.primaryIdentifier) {
    Object.freeze(c.expectedOutput.primaryIdentifier);
  }
  if (c.expectedOutput.supportedQualifiers) {
    c.expectedOutput.supportedQualifiers.forEach(Object.freeze);
    Object.freeze(c.expectedOutput.supportedQualifiers);
  }
  if (c.expectedOutput.unsupportedContext) {
    c.expectedOutput.unsupportedContext.forEach(Object.freeze);
    Object.freeze(c.expectedOutput.unsupportedContext);
  }
  if (c.expectedOutput.error) {
    Object.freeze(c.expectedOutput.error);
  }
  Object.freeze(c);
});
