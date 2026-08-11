import crypto from "crypto";
import { canonicalizeJcs } from "./seed-helpers.js";
import type { ExecutionRequest } from "./index.js";

export interface TrustResultInput {
  readonly trustStatus: string;
  readonly degradationFactors: readonly string[];
}

export interface PolicyDecisionInput {
  readonly policyId: string;
  readonly policyVersion: string;
  readonly result: string;
  readonly diagnostic?: string;
}

/**
 * Recursively cleans an object to ensure it only contains JCS-compatible types.
 */
export function cleanForJcs(val: unknown): unknown {
  if (val === null) return null;
  if (val === undefined) return undefined;
  if (Array.isArray(val)) {
    return val.map(cleanForJcs).filter((v) => v !== undefined);
  }
  if (typeof val === "object") {
    const proto = Object.getPrototypeOf(val);
    if (proto !== Object.prototype && proto !== null) {
      return val;
    }
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(val)) {
      const v = (val as Record<string, unknown>)[key];
      if (v !== undefined) {
        const cleanedVal = cleanForJcs(v);
        if (cleanedVal !== undefined) {
          cleaned[key] = cleanedVal;
        }
      }
    }
    return cleaned;
  }
  return val;
}

/**
 * Computes the SHA-256 hex digest prefixed with 'sha256:'
 */
export function computeSha256(preimage: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(preimage, "utf8")
    .digest("hex")
    .toLowerCase();
  return "sha256:" + hash;
}

/**
 * Pure deterministic cryptographic helper under G-0803 / G-0809
 */
export function generateReceiptHashes(
  executionRequest: ExecutionRequest,
  outcome: string,
  trustResult: TrustResultInput,
  policyDecisions: readonly PolicyDecisionInput[],
  pipelineDiagnostics: readonly string[],
  evaluatedPolicyVersion: string,
  executionTime: number,
  executionId: string,
  runtimeVersion: string,
) {
  // 1. inputHash
  const inputHash = computeSha256(
    "zyppi:domain:input:v1:" + canonicalizeJcs(cleanForJcs(executionRequest)),
  );

  // 2. evidenceHash
  const evidenceHash = computeSha256(
    "zyppi:domain:evidence:v1:" +
      canonicalizeJcs(cleanForJcs(executionRequest.evidenceBundle)),
  );

  // 3. outputHash
  const outputPreimageObj = {
    outcome,
    trustResult,
    policyDecisions: policyDecisions.map((d) => ({
      policyId: d.policyId,
      policyVersion: d.policyVersion,
      result: d.result,
      ...(d.diagnostic ? { diagnostic: d.diagnostic } : {}),
    })),
    diagnostics: pipelineDiagnostics,
    evidenceReferences:
      executionRequest.activeConstitutionalView.evidenceReferences,
  };
  const outputHash = computeSha256(
    "zyppi:domain:output:v1:" + canonicalizeJcs(cleanForJcs(outputPreimageObj)),
  );

  // 4. decisionSummary (derived deterministically as an output element)
  const sortedDecisions = [...policyDecisions].sort((a, b) =>
    a.policyId < b.policyId ? -1 : a.policyId > b.policyId ? 1 : 0,
  );
  const decisionSummaryObj = {
    aggregateResult:
      outcome === "verified"
        ? "authorized"
        : outcome === "rejected"
          ? "denied"
          : "unavailable",
    attributions: sortedDecisions.map((d) => ({
      policyId: d.policyId,
      result: d.result,
    })),
  };
  const decisionSummary = canonicalizeJcs(cleanForJcs(decisionSummaryObj));

  // 5. receiptId
  const receiptIdPreimageObj = {
    executionId,
    runtimeVersion,
    inputHash,
    outputHash,
    evidenceHash,
    policyVersion: evaluatedPolicyVersion,
    decisionSummary,
    executionTime,
  };
  const receiptId = computeSha256(
    "zyppi:domain:receipt_id:v1:" +
      canonicalizeJcs(cleanForJcs(receiptIdPreimageObj)),
  );

  // 6. deterministicHash
  const receiptPreimageObj = {
    receiptId,
    executionId,
    runtimeVersion,
    inputHash,
    outputHash,
    evidenceHash,
    policyVersion: evaluatedPolicyVersion,
    decisionSummary,
    executionTime,
  };
  const deterministicHash = computeSha256(
    "zyppi:domain:receipt:v1:" +
      canonicalizeJcs(cleanForJcs(receiptPreimageObj)),
  );

  return {
    inputHash,
    outputHash,
    evidenceHash,
    decisionSummary,
    receiptId,
    deterministicHash,
  };
}
