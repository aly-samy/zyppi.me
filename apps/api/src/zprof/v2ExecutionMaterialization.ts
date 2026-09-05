import {
  deriveExecutionRequestV2DigestCandidate,
  validateExecutionRequestV2,
  verifyEvidenceStateRefV2,
  verifyPolicyUniverseRefV2,
  verifySemanticStateRefV2,
  type BoundConstitutionalStateV2,
  type BoundEvaluationContextV2,
  type BoundEvidenceStateV2,
  type BoundPolicyUniverseV2,
  type ExecutionContextV2,
  type ExecutionRequestV2,
  type ExecutionRequestV2ValidationError,
  type IntentBindingV2,
  type ParticipationV2,
  type RequestedActionBindingV2,
  type V2IdentityError,
} from "@zyppi/domain";

/**
 * Materialization input for Application V2 Execution Request assembly per CCP-RI-V2-03.
 * Intentionally excludes caller-selectable contractVersion (set explicitly to "v2").
 */
export interface ExecutionRequestV2MaterializationInput {
  readonly requestId: string;
  readonly participation: ParticipationV2;
  readonly intent: IntentBindingV2;
  readonly requestedAction: RequestedActionBindingV2;
  readonly constitutionalState: BoundConstitutionalStateV2;
  readonly evidenceState: BoundEvidenceStateV2;
  readonly policyUniverse: BoundPolicyUniverseV2;
  readonly evaluationContext: BoundEvaluationContextV2;
  readonly executionContext: ExecutionContextV2;
}

/**
 * Application-layer stage discriminator identifying exact failed materialization boundary per CCP-RI-V2-03.
 */
export type MaterializationFailureStage =
  | "STRUCTURAL_VALIDATION"
  | "SEMANTIC_STATE_IDENTITY"
  | "EVIDENCE_STATE_IDENTITY"
  | "POLICY_UNIVERSE_IDENTITY"
  | "ROOT_IDENTITY";

/**
 * Authoritative domain error type emitted by V2 validation or V2 identity capabilities per CCP-RI-V2-03.
 */
export type MaterializationDomainError =
  ExecutionRequestV2ValidationError | V2IdentityError;

/**
 * Successful V2 execution request materialization outcome exposing assembled candidate request and whole-request digest candidate.
 */
export interface ExecutionRequestV2MaterializationSuccess {
  readonly ok: true;
  readonly executionRequest: ExecutionRequestV2;
  readonly wholeRequestDigestCandidate: string;
}

/**
 * Failed V2 execution request materialization outcome exposing exact failure stage and preserved authoritative domain error.
 */
export interface ExecutionRequestV2MaterializationFailure {
  readonly ok: false;
  readonly stage: MaterializationFailureStage;
  readonly error: MaterializationDomainError;
}

/**
 * Typed, non-throwing result of V2 execution request materialization.
 */
export type ExecutionRequestV2MaterializationResult =
  | ExecutionRequestV2MaterializationSuccess
  | ExecutionRequestV2MaterializationFailure;

/**
 * Assembles a structurally valid, identity-consistent ExecutionRequestV2 from explicit governed source material per CCP-RI-V2-03.
 *
 * Performs sequential assembly:
 * 1. Explicitly sets contractVersion: "v2"
 * 2. Runs validateExecutionRequestV2 (STRUCTURAL_VALIDATION)
 * 3. Runs verifySemanticStateRefV2 (SEMANTIC_STATE_IDENTITY)
 * 4. Runs verifyEvidenceStateRefV2 (EVIDENCE_STATE_IDENTITY)
 * 5. Runs verifyPolicyUniverseRefV2 (POLICY_UNIVERSE_IDENTITY)
 * 6. Runs deriveExecutionRequestV2DigestCandidate (ROOT_IDENTITY)
 *
 * Fails closed without silent ref repair, ambient state inspection, or Runtime execution.
 */
export function materializeExecutionRequestV2(
  input: ExecutionRequestV2MaterializationInput,
): ExecutionRequestV2MaterializationResult {
  const candidate: ExecutionRequestV2 = {
    contractVersion: "v2",
    requestId: input.requestId,
    participation: input.participation,
    intent: input.intent,
    requestedAction: input.requestedAction,
    constitutionalState: input.constitutionalState,
    evidenceState: input.evidenceState,
    policyUniverse: input.policyUniverse,
    evaluationContext: input.evaluationContext,
    executionContext: input.executionContext,
  };

  const structRes = validateExecutionRequestV2(candidate);
  if (!structRes.ok) {
    return {
      ok: false,
      stage: "STRUCTURAL_VALIDATION",
      error: structRes.error,
    };
  }

  const semRes = verifySemanticStateRefV2(candidate.constitutionalState);
  if (!semRes.ok) {
    return {
      ok: false,
      stage: "SEMANTIC_STATE_IDENTITY",
      error: semRes.error,
    };
  }

  const evidRes = verifyEvidenceStateRefV2(candidate.evidenceState);
  if (!evidRes.ok) {
    return {
      ok: false,
      stage: "EVIDENCE_STATE_IDENTITY",
      error: evidRes.error,
    };
  }

  const polRes = verifyPolicyUniverseRefV2(candidate.policyUniverse);
  if (!polRes.ok) {
    return {
      ok: false,
      stage: "POLICY_UNIVERSE_IDENTITY",
      error: polRes.error,
    };
  }

  const digestRes = deriveExecutionRequestV2DigestCandidate(candidate);
  if (!digestRes.ok) {
    return {
      ok: false,
      stage: "ROOT_IDENTITY",
      error: digestRes.error,
    };
  }

  return {
    ok: true,
    executionRequest: candidate,
    wholeRequestDigestCandidate: digestRes.value,
  };
}
