import {
  canonicalizeJcsV2,
  computeSha256V2,
  type V2IdentityResult,
} from "./canonical.js";

export const V2_RECEIPT_DOMAIN_SEPARATORS = {
  OUTPUT: "zyppi:domain:output:v2:",
  EVIDENCE: "zyppi:domain:evidence:v2:",
  RECEIPT_ID: "zyppi:domain:receipt_id:v2:",
  RECEIPT: "zyppi:domain:receipt:v2:",
} as const;

export interface ExecutionOutputMaterialV2 {
  readonly executability: unknown;
  readonly outcome: unknown;
}

export interface ReceiptIdPreimageV2 {
  readonly executionId: string;
  readonly runtimeVersion: string;
  readonly inputHash: string;
  readonly outputHash: string;
  readonly evidenceHash: string;
  readonly policyVersion: string;
  readonly decisionSummary: string;
  readonly executionTime: string;
}

export interface ReceiptDeterministicHashPreimageV2 {
  readonly receiptId: string;
  readonly executionId: string;
  readonly runtimeVersion: string;
  readonly inputHash: string;
  readonly outputHash: string;
  readonly evidenceHash: string;
  readonly policyVersion: string;
  readonly decisionSummary: string;
  readonly executionTime: string;
}

/**
 * Canonicalizes a bounded decision summary object graph under RFC 8785 JCS.
 */
export function canonicalizeReceiptDecisionSummaryV2(
  material: unknown,
): V2IdentityResult<string> {
  return canonicalizeJcsV2(material);
}

/**
 * Computes SHA-256 output digest under `zyppi:domain:output:v2:` over JCS canonicalized output material.
 */
export function deriveExecutionOutputHashV2(
  material: ExecutionOutputMaterialV2,
): V2IdentityResult<string> {
  const jcsRes = canonicalizeJcsV2(material);
  if (!jcsRes.ok) return jcsRes;

  const digest = computeSha256V2(
    V2_RECEIPT_DOMAIN_SEPARATORS.OUTPUT,
    jcsRes.value,
  );
  return { ok: true, value: digest };
}

/**
 * Computes SHA-256 evidence digest under `zyppi:domain:evidence:v2:` over JCS canonicalized normalized evidence projection.
 */
export function deriveReceiptEvidenceHashV2(
  normalizedEvidenceProjection: unknown,
): V2IdentityResult<string> {
  const jcsRes = canonicalizeJcsV2(normalizedEvidenceProjection);
  if (!jcsRes.ok) return jcsRes;

  const digest = computeSha256V2(
    V2_RECEIPT_DOMAIN_SEPARATORS.EVIDENCE,
    jcsRes.value,
  );
  return { ok: true, value: digest };
}

/**
 * Computes SHA-256 receiptId digest under `zyppi:domain:receipt_id:v2:` over JCS canonicalized 8-field receiptId material.
 */
export function deriveReceiptIdV2(
  material: ReceiptIdPreimageV2,
): V2IdentityResult<string> {
  const jcsRes = canonicalizeJcsV2(material);
  if (!jcsRes.ok) return jcsRes;

  const digest = computeSha256V2(
    V2_RECEIPT_DOMAIN_SEPARATORS.RECEIPT_ID,
    jcsRes.value,
  );
  return { ok: true, value: digest };
}

/**
 * Computes SHA-256 deterministicHash digest under `zyppi:domain:receipt:v2:` over JCS canonicalized 9-field receipt material.
 */
export function deriveReceiptDeterministicHashV2(
  material: ReceiptDeterministicHashPreimageV2,
): V2IdentityResult<string> {
  const jcsRes = canonicalizeJcsV2(material);
  if (!jcsRes.ok) return jcsRes;

  const digest = computeSha256V2(
    V2_RECEIPT_DOMAIN_SEPARATORS.RECEIPT,
    jcsRes.value,
  );
  return { ok: true, value: digest };
}
