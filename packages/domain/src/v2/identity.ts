import { createHash } from "node:crypto";
import {
  buildTrustedInertSnapshot,
  canonicalizeJcsV2,
  makeIdentityFailure,
  type V2IdentityResult,
} from "./canonical.js";
import {
  canonicalizeConstitutionalStateComponentV2,
  canonicalizeEvidenceStateComponentV2,
  canonicalizeGraphAndCollectionsV2,
  canonicalizePolicyUniverseComponentV2,
} from "./graphCanonicalization.js";
import { validateExecutionRequestV2 } from "./validator.js";
import { canonicalizeTemporalCoordinatesV2 } from "./temporal.js";
import type {
  BoundConstitutionalStateV2,
  BoundEvidenceStateV2,
  BoundPolicyUniverseV2,
  EvidenceStateRefV2,
  ExecutionRequestV2,
  PolicyUniverseRefV2,
  SemanticStateRefV2,
} from "./types.js";

// Domain Separators
export const V2_DOMAIN_SEPARATORS = {
  CONSTITUTIONAL_STATE: "zyppi:domain:constitutional_state:v2:",
  EVIDENCE_STATE: "zyppi:domain:evidence_state:v2:",
  POLICY_UNIVERSE: "zyppi:domain:policy_universe:v2:",
  INPUT: "zyppi:domain:input:v2:",
} as const;

/**
 * Computes SHA-256 digest with specified domain separator over JCS canonicalized payload string.
 */
function computeV2Digest(
  domainSeparator: string,
  jcsCanonicalString: string,
): string {
  const hash = createHash("sha256");
  hash.update(domainSeparator, "utf8");
  hash.update(jcsCanonicalString, "utf8");
  return `sha256:${hash.digest("hex")}`;
}

/**
 * Normalizes stateViews and computes ConstitutionalStateIdentityProjectionV2 (excluding semanticStateRef).
 */
export function getConstitutionalStateIdentityProjectionV2(
  state: BoundConstitutionalStateV2,
): V2IdentityResult<Omit<BoundConstitutionalStateV2, "semanticStateRef">> {
  const canonRes = canonicalizeConstitutionalStateComponentV2(state);
  if (!canonRes.ok) return canonRes;

  const projection = { ...canonRes.value } as Record<string, unknown>;
  delete projection.semanticStateRef;
  return {
    ok: true,
    value: projection as Omit<BoundConstitutionalStateV2, "semanticStateRef">,
  };
}

/**
 * Derives SemanticStateRefV2 for a given BoundConstitutionalStateV2.
 */
export function deriveSemanticStateRefV2(
  state: BoundConstitutionalStateV2,
): V2IdentityResult<SemanticStateRefV2> {
  const projRes = getConstitutionalStateIdentityProjectionV2(state);
  if (!projRes.ok) return projRes;

  const jcsRes = canonicalizeJcsV2(projRes.value);
  if (!jcsRes.ok) return jcsRes;

  const digest = computeV2Digest(
    V2_DOMAIN_SEPARATORS.CONSTITUTIONAL_STATE,
    jcsRes.value,
  );
  return { ok: true, value: digest };
}

/**
 * Verifies that the supplied SemanticStateRefV2 matches the derived digest from the constitutional state.
 * Snapshots the hostile component once and performs all derivations, reads, and comparisons strictly on the trusted snapshot.
 */
export function verifySemanticStateRefV2(
  state: BoundConstitutionalStateV2,
): V2IdentityResult<{ readonly matches: boolean }> {
  const snapRes = buildTrustedInertSnapshot(state);
  if (!snapRes.ok) return snapRes;
  const trustedState = snapRes.value;

  const derivedRes = deriveSemanticStateRefV2(trustedState);
  if (!derivedRes.ok) return derivedRes;

  if (trustedState.semanticStateRef !== derivedRes.value) {
    return makeIdentityFailure(
      "COMPONENT_DIGEST_MISMATCH",
      `SemanticStateRef mismatch: expected '${derivedRes.value}', got '${trustedState.semanticStateRef}'`,
      "constitutionalState.semanticStateRef",
    );
  }
  return { ok: true, value: { matches: true } };
}

/**
 * Normalizes evidence state and computes EvidenceStateIdentityProjectionV2 (excluding evidenceStateRef).
 */
export function getEvidenceStateIdentityProjectionV2(
  state: BoundEvidenceStateV2,
): V2IdentityResult<Omit<BoundEvidenceStateV2, "evidenceStateRef">> {
  const canonRes = canonicalizeEvidenceStateComponentV2(state);
  if (!canonRes.ok) return canonRes;

  const projection = { ...canonRes.value } as Record<string, unknown>;
  delete projection.evidenceStateRef;
  return {
    ok: true,
    value: projection as Omit<BoundEvidenceStateV2, "evidenceStateRef">,
  };
}

/**
 * Derives EvidenceStateRefV2 for a given BoundEvidenceStateV2.
 */
export function deriveEvidenceStateRefV2(
  state: BoundEvidenceStateV2,
): V2IdentityResult<EvidenceStateRefV2> {
  const projRes = getEvidenceStateIdentityProjectionV2(state);
  if (!projRes.ok) return projRes;

  const jcsRes = canonicalizeJcsV2(projRes.value);
  if (!jcsRes.ok) return jcsRes;

  const digest = computeV2Digest(
    V2_DOMAIN_SEPARATORS.EVIDENCE_STATE,
    jcsRes.value,
  );
  return { ok: true, value: digest };
}

/**
 * Verifies that the supplied EvidenceStateRefV2 matches the derived digest from the evidence state.
 * Snapshots the hostile component once and performs all derivations, reads, and comparisons strictly on the trusted snapshot.
 */
export function verifyEvidenceStateRefV2(
  state: BoundEvidenceStateV2,
): V2IdentityResult<{ readonly matches: boolean }> {
  const snapRes = buildTrustedInertSnapshot(state);
  if (!snapRes.ok) return snapRes;
  const trustedState = snapRes.value;

  const derivedRes = deriveEvidenceStateRefV2(trustedState);
  if (!derivedRes.ok) return derivedRes;

  if (trustedState.evidenceStateRef !== derivedRes.value) {
    return makeIdentityFailure(
      "COMPONENT_DIGEST_MISMATCH",
      `EvidenceStateRef mismatch: expected '${derivedRes.value}', got '${trustedState.evidenceStateRef}'`,
      "evidenceState.evidenceStateRef",
    );
  }
  return { ok: true, value: { matches: true } };
}

/**
 * Normalizes policy universe and computes PolicyUniverseIdentityProjectionV2 (excluding policyUniverseRef).
 */
export function getPolicyUniverseIdentityProjectionV2(
  universe: BoundPolicyUniverseV2,
): V2IdentityResult<Omit<BoundPolicyUniverseV2, "policyUniverseRef">> {
  const canonRes = canonicalizePolicyUniverseComponentV2(universe);
  if (!canonRes.ok) return canonRes;

  const projection = { ...canonRes.value } as Record<string, unknown>;
  delete projection.policyUniverseRef;
  return {
    ok: true,
    value: projection as Omit<BoundPolicyUniverseV2, "policyUniverseRef">,
  };
}

/**
 * Derives PolicyUniverseRefV2 for a given BoundPolicyUniverseV2.
 */
export function derivePolicyUniverseRefV2(
  universe: BoundPolicyUniverseV2,
): V2IdentityResult<PolicyUniverseRefV2> {
  const projRes = getPolicyUniverseIdentityProjectionV2(universe);
  if (!projRes.ok) return projRes;

  const jcsRes = canonicalizeJcsV2(projRes.value);
  if (!jcsRes.ok) return jcsRes;

  const digest = computeV2Digest(
    V2_DOMAIN_SEPARATORS.POLICY_UNIVERSE,
    jcsRes.value,
  );
  return { ok: true, value: digest };
}

/**
 * Verifies that the supplied PolicyUniverseRefV2 matches the derived digest from the policy universe.
 * Snapshots the hostile component once and performs all derivations, reads, and comparisons strictly on the trusted snapshot.
 */
export function verifyPolicyUniverseRefV2(
  universe: BoundPolicyUniverseV2,
): V2IdentityResult<{ readonly matches: boolean }> {
  const snapRes = buildTrustedInertSnapshot(universe);
  if (!snapRes.ok) return snapRes;
  const trustedUniverse = snapRes.value;

  const derivedRes = derivePolicyUniverseRefV2(trustedUniverse);
  if (!derivedRes.ok) return derivedRes;

  if (trustedUniverse.policyUniverseRef !== derivedRes.value) {
    return makeIdentityFailure(
      "COMPONENT_DIGEST_MISMATCH",
      `PolicyUniverseRef mismatch: expected '${derivedRes.value}', got '${trustedUniverse.policyUniverseRef}'`,
      "policyUniverse.policyUniverseRef",
    );
  }
  return { ok: true, value: { matches: true } };
}

export interface NormalizedExecutionRequestV2Material {
  readonly normalizedReq: ExecutionRequestV2;
  readonly jcs: string;
}

/**
 * Shared production root-normalization path.
 * Performs snapshotting, V2-01 structural validation, component verification,
 * temporal normalization, graph/collection canonicalization, and JCS serialization.
 * Internal to identity.ts (and exported for unit tests, NOT re-exported in v2/index.ts).
 */
export function normalizeExecutionRequestV2IdentityMaterial(
  req: ExecutionRequestV2,
): V2IdentityResult<NormalizedExecutionRequestV2Material> {
  // 0a. Build trusted inert snapshot of hostile caller value in one descriptor-driven pass
  const snapRes = buildTrustedInertSnapshot(req);
  if (!snapRes.ok) {
    return snapRes;
  }
  const trustedReq = snapRes.value;

  // 0b. C04: Enforce V2-01 structural validation on trusted snapshot
  const structVal = validateExecutionRequestV2(trustedReq);
  if (!structVal.ok) {
    return makeIdentityFailure(
      "INVALID_IDENTITY_INPUT",
      `Structural V2-01 validation failed: ${structVal.error.message}`,
      structVal.error.path,
    );
  }

  // 1. Verify component digests on trusted snapshot
  const semCheck = verifySemanticStateRefV2(trustedReq.constitutionalState);
  if (!semCheck.ok) return semCheck;

  const evidCheck = verifyEvidenceStateRefV2(trustedReq.evidenceState);
  if (!evidCheck.ok) return evidCheck;

  const polCheck = verifyPolicyUniverseRefV2(trustedReq.policyUniverse);
  if (!polCheck.ok) return polCheck;

  // 2. Canonicalize temporal coordinates to UTC Z
  const normTimeRes = canonicalizeTemporalCoordinatesV2(
    trustedReq.executionContext.temporalCoordinates,
  );
  if (!normTimeRes.ok) return normTimeRes;

  const reqWithNormTime: ExecutionRequestV2 = {
    ...trustedReq,
    executionContext: {
      ...trustedReq.executionContext,
      temporalCoordinates: normTimeRes.value,
    },
  };

  // 3. Canonicalize local labels and collection ordering across the entire request
  const canonReqRes = canonicalizeGraphAndCollectionsV2(reqWithNormTime);
  if (!canonReqRes.ok) return canonReqRes;

  // 4. JCS canonicalize the normalized whole request
  const jcsRes = canonicalizeJcsV2(canonReqRes.value);
  if (!jcsRes.ok) return jcsRes;

  return {
    ok: true,
    value: {
      normalizedReq: canonReqRes.value,
      jcs: jcsRes.value,
    },
  };
}

/**
 * Derives the deterministic whole-request V2 digest candidate from an ExecutionRequestV2 structure.
 * Performs component ref verification, temporal normalization, and whole-graph local label canonicalization.
 */
export function deriveExecutionRequestV2DigestCandidate(
  req: ExecutionRequestV2,
): V2IdentityResult<string> {
  const normRes = normalizeExecutionRequestV2IdentityMaterial(req);
  if (!normRes.ok) return normRes;

  const candidateDigest = computeV2Digest(
    V2_DOMAIN_SEPARATORS.INPUT,
    normRes.value.jcs,
  );
  return { ok: true, value: candidateDigest };
}
