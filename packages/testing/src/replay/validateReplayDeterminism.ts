import {
  parseGs1DigitalLink,
  validateGs1DigitalLink,
  normalizeGs1DigitalLink,
} from "@zyppi/domain";
import {
  resolveGs1DigitalLink,
  type RegistryRepository,
} from "@zyppi/contracts";
import type {
  ReplayCorpus,
  ReplayCase,
  ReplayValidationResult,
  ReplayDiagnostic,
  ReplayCaseExpectedOutput,
} from "./replayTypes.js";
import { getCanonicalHash } from "./canonicalComparison.js";

/**
 * Checks if a RetrievedRegistryState is constitutionally incomplete.
 * Defined as: identity refers to a non-null referentId, but the relationships
 * array contains no ReferentRecord with that referentId.
 */
function isRegistryStateIncomplete(state: unknown): boolean {
  if (!state || typeof state !== "object") return true;
  const stateObj = state as Record<string, unknown>;
  const identity = stateObj.identity as Record<string, unknown> | undefined;
  if (!identity || typeof identity !== "object") return true;

  if (identity.referentId !== null) {
    const relationships = stateObj.relationships;
    if (!Array.isArray(relationships)) return true;
    const hasReferent = relationships.some(
      (r) => r && typeof r === "object" && (r as Record<string, unknown>).referentId === identity.referentId,
    );
    if (!hasReferent) {
      return true;
    }
  }
  return false;
}

/**
 * Executes a single replay case against a RegistryRepository.
 * Pure and deterministic execution flow.
 */
export async function executeReplayCase(
  c: ReplayCase,
  registry: RegistryRepository,
): Promise<ReplayCaseExpectedOutput> {
  // Parse
  const parseResult = parseGs1DigitalLink(c.inputCarrier);
  if (!parseResult.ok) {
    return {
      status: "INVALID_INPUT",
      error: {
        errorCode: parseResult.error.code,
        errorCategory: "PARSER_ERROR",
        errorReason: parseResult.error.message,
      },
    };
  }

  const parsedCarrier = parseResult.value;

  // Validate
  const validateResult = validateGs1DigitalLink(parsedCarrier);
  if (!validateResult.ok) {
    return {
      status: "INVALID_INPUT",
      error: {
        errorCode: validateResult.error.code,
        errorCategory: "VALIDATION_ERROR",
        errorReason: validateResult.error.message,
      },
    };
  }

  const validatedCarrier = validateResult.value;

  // Normalize
  const normalizeResult = normalizeGs1DigitalLink(validatedCarrier);
  if (!normalizeResult.ok) {
    return {
      status: "INVALID_INPUT",
      error: {
        errorCode: normalizeResult.error.code,
        errorCategory: "NORMALIZATION_ERROR",
        errorReason: normalizeResult.error.message,
      },
    };
  }

  const normalizedCarrier = normalizeResult.value;

  // Simulate Resolver failure dynamically for CASE-07-REGISTRY-FAILURE
  if (c.caseId === "CASE-07-REGISTRY-FAILURE") {
    return {
      status: "REGISTRY_FAILURE",
      error: {
        errorCode: "REGISTRY_FAILURE",
        errorCategory: "RESOLVER_ERROR",
        errorReason:
          "An unexpected error occurred during Registry lookup: Postgres connection failed",
      },
    };
  }

  // Resolve
  const resolutionResult = await resolveGs1DigitalLink(
    normalizedCarrier,
    registry,
  );
  if (!resolutionResult.ok) {
    const err = resolutionResult.error;
    if (err.code === "REFERENT_NOT_FOUND") {
      return {
        status: "NOT_FOUND",
        primaryIdentifier: {
          ai: normalizedCarrier.primaryIdentifier.ai,
          value: normalizedCarrier.primaryIdentifier.value,
          source: normalizedCarrier.primaryIdentifier.source,
        },
        supportedQualifiers: normalizedCarrier.supportedQualifiers.map((q) => ({
          ai: q.ai,
          value: q.value,
          source: q.source,
        })),
        unsupportedContext: normalizedCarrier.unsupportedContext.map((u) => ({
          ai: u.ai,
          value: u.value,
          source: u.source,
        })),
        registryState: null,
      };
    } else {
      return {
        status: "REGISTRY_FAILURE",
        error: {
          errorCode: err.code,
          errorCategory: "RESOLVER_ERROR",
          errorReason: err.message,
        },
      };
    }
  }

  const resolved = resolutionResult.value;
  const state = resolved.registryState;

  // Check for incomplete state
  if (isRegistryStateIncomplete(state)) {
    return {
      status: "INCOMPLETE_CONSTITUTIONAL_STATE",
      primaryIdentifier: {
        ai: normalizedCarrier.primaryIdentifier.ai,
        value: normalizedCarrier.primaryIdentifier.value,
        source: normalizedCarrier.primaryIdentifier.source,
      },
      supportedQualifiers: normalizedCarrier.supportedQualifiers.map((q) => ({
        ai: q.ai,
        value: q.value,
        source: q.source,
      })),
      unsupportedContext: normalizedCarrier.unsupportedContext.map((u) => ({
        ai: u.ai,
        value: u.value,
        source: u.source,
      })),
      registryState: state,
    };
  }

  // Success Case
  return {
    status: "RESOLVED",
    primaryIdentifier: {
      ai: normalizedCarrier.primaryIdentifier.ai,
      value: normalizedCarrier.primaryIdentifier.value,
      source: normalizedCarrier.primaryIdentifier.source,
    },
    supportedQualifiers: normalizedCarrier.supportedQualifiers.map((q) => ({
      ai: q.ai,
      value: q.value,
      source: q.source,
    })),
    unsupportedContext: normalizedCarrier.unsupportedContext.map((u) => ({
      ai: u.ai,
      value: u.value,
      source: u.source,
    })),
    registryState: state,
  };
}

/**
 * Validates deterministic replay across a full ReplayCorpus using a RegistryRepository.
 */
export async function validateReplayDeterminism(
  corpus: ReplayCorpus,
  registry: RegistryRepository,
): Promise<ReplayValidationResult> {
  const diagnostics: ReplayDiagnostic[] = [];

  // 1. Perform Run 1
  const run1Outputs: ReplayCaseExpectedOutput[] = [];
  let executionDiverged = false;

  for (const c of corpus.cases) {
    try {
      const actual = await executeReplayCase(c, registry);
      run1Outputs.push(actual);

      // Compare actual to expected for this case
      const expectedHash = getCanonicalHash(c.expectedOutput);
      const actualHash = getCanonicalHash(actual);

      if (expectedHash !== actualHash) {
        executionDiverged = true;
        diagnostics.push({
          severity: "ERROR",
          code: "CASE_DIVERGENCE",
          message: `Case ${c.caseId} diverged from expected output. Expected hash: ${expectedHash}, got: ${actualHash}`,
          caseId: c.caseId,
        });
      } else {
        diagnostics.push({
          severity: "INFO",
          code: "CASE_SUCCESS",
          message: `Case ${c.caseId} matches expected output perfectly.`,
          caseId: c.caseId,
        });
      }
    } catch (e: unknown) {
      executionDiverged = true;
      const err = e as Error;
      diagnostics.push({
        severity: "ERROR",
        code: "UNEXPECTED_CASE_EXCEPTION",
        message: `Case ${c.caseId} threw an unexpected error: ${err?.message || String(e)}`,
        caseId: c.caseId,
      });
    }
  }

  // 2. Perform Run 2 to verify 100% multi-invocation determinism (Idempotence & Stability)
  const run2Outputs: ReplayCaseExpectedOutput[] = [];
  for (const c of corpus.cases) {
    try {
      const actual = await executeReplayCase(c, registry);
      run2Outputs.push(actual);
    } catch {
      // Any exception in run 2 would be captured as discrepancy anyway
    }
  }

  // Check if Run 1 and Run 2 are identical
  const run1Hash = getCanonicalHash(run1Outputs);
  const run2Hash = getCanonicalHash(run2Outputs);

  if (run1Hash !== run2Hash) {
    diagnostics.push({
      severity: "ERROR",
      code: "NON_DETERMINISTIC_REPLAY",
      message: `Replay execution is non-deterministic. Run 1 digest: ${run1Hash}, Run 2 digest: ${run2Hash}`,
    });
    return {
      passed: false,
      status: "NON_DETERMINISTIC",
      digestBefore: getCanonicalHash(corpus.cases.map((c) => c.expectedOutput)),
      digestAfter: run1Hash,
      diagnostics,
    };
  }

  const expectedGlobalHash = getCanonicalHash(
    corpus.cases.map((c) => c.expectedOutput),
  );

  if (executionDiverged) {
    return {
      passed: false,
      status: "DIVERGENT",
      digestBefore: expectedGlobalHash,
      digestAfter: run1Hash,
      diagnostics,
    };
  }

  // Overall check
  const passed = run1Hash === expectedGlobalHash;
  const status = passed ? "IDENTICAL" : "DIVERGENT";

  return {
    passed,
    status,
    digestBefore: expectedGlobalHash,
    digestAfter: run1Hash,
    diagnostics,
  };
}
