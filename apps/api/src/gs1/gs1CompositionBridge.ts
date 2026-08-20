import type { GS1AnchorBridgeSuccess } from "./types.js";
import {
  ApplicationCompositionResolver,
  buildEvaluationCoordinate,
  type EvaluationCoordinate,
  type BoundConstitutionalPayload,
  type CompositionManifest,
  type CompositionError,
  type EpistemicStatus,
  type GS1CompositionOptions,
  type PinnedStateReference,
} from "../zprof/index.js";
import { createValidatedCanonicalIdentifier } from "@zyppi/contracts";

export interface GS1CompositionBridgeInputOptions extends Omit<
  GS1CompositionOptions,
  "identifier"
> {
  readonly anchorSuccess: GS1AnchorBridgeSuccess;
  readonly tValid?: string;
  readonly tObservation?: string;
  readonly tEInput?: string;
  readonly explicitPinnedStateRef?: PinnedStateReference;
}

export type GS1CompositionBridgeAssemblyResult =
  | {
      readonly ok: true;
      readonly manifest: CompositionManifest;
      readonly boundPayload: BoundConstitutionalPayload;
      readonly sccId: string;
      readonly bcgId: string;
      readonly bcg: import("../zprof/bcg.js").BoundConfigurationGraph;
      readonly evaluationCoordinate?: EvaluationCoordinate;
      readonly representationGap?: "PINNED_SEMANTIC_STATE_REPRESENTATION_GAP";
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
      readonly epistemicStatus?: EpistemicStatus;
    };

/**
 * GS1 Domain-Edge Assembly Bridge (AMS-0861-B / CORR-0861-B-2).
 *
 * Consumes the lawful constitutional anchor produced by Packet A (createGs1AnchorFromCarrier / GS1AnchorBridgeSuccess)
 * and adapts it into generic Z-PROF composition resolution and EvaluationCoordinate construction.
 *
 * LAW-B-01: Does NOT reparse, revalidate, renormalize, or re-resolve the carrier/anchor. Preserves anchor identity.
 * LAW-B-11: Strictly stops before RI Execution (does NOT invoke runInternalPipeline or produce ExecutionReceipt).
 * LAW-B-09: Positioned strictly in the GS1 domain edge (apps/api/src/gs1/). Generic Z-PROF contains zero imports of this module.
 *
 * CORR-0861-B-2 Rules:
 * 1. Pinned Semantic State Reference Gap: Reconnaissance confirms ActiveConstitutionalView contains no top-level ACV
 *    state reference or digest. Does NOT fabricate or synthesize a pin from subject canonicalReference or manifestId.
 *    If explicitPinnedStateRef is provided, uses it. Otherwise, returns valid CompositionManifest, BoundConstitutionalPayload,
 *    SCC_ID, BCG_ID, and BCG, while setting evaluationCoordinate to undefined and reporting PINNED_SEMANTIC_STATE_REPRESENTATION_GAP.
 * 2. Mechanical Temporal Enforcement:
 *    - If any bound EpistemicRequirementContract has temporalConstraints.validTimeRequired === true, tValid is mandatory; missing tValid fails closed with "missing".
 *    - For execution readiness, tEInput must be explicitly supplied on options before EvaluationCoordinate materialization.
 *    - Zero fallback to constitutionalTimestamp, Date.now(), or other timestamps.
 */
export async function assembleGs1CompositionFromAnchor(
  options: GS1CompositionBridgeInputOptions,
): Promise<GS1CompositionBridgeAssemblyResult> {
  const { anchorSuccess, ...resolverOptions } = options;

  if (!anchorSuccess || !anchorSuccess.ok || !anchorSuccess.anchor) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: "Valid GS1AnchorBridgeSuccess packet A anchor is required",
      },
      epistemicStatus: "UNAVAILABLE",
    };
  }

  // 1. Mechanical Temporal Requirement Verification from bound EpistemicRequirementContracts
  const requiresTValid = (options.epistemicRequirementsFixtures || []).some(
    (req) => req.temporalConstraints?.validTimeRequired === true,
  );

  if (requiresTValid) {
    if (!options.tValid || options.tValid.trim().length === 0) {
      return {
        ok: false,
        error: {
          code: "missing",
          category: "Composition Failure",
          message:
            "Required valid time coordinate (tValid) is missing for epistemic requirement with validTimeRequired constraint",
        },
        epistemicStatus: "UNAVAILABLE",
      };
    }
  }

  const anchor = anchorSuccess.anchor;
  const canonicalIdStr = anchor.normalizedCarrier.k1;

  const validIdRes = createValidatedCanonicalIdentifier(canonicalIdStr);
  if (!validIdRes.ok) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Invalid canonical identifier from anchor: ${canonicalIdStr}`,
      },
      epistemicStatus: "UNAVAILABLE",
    };
  }

  const identifier = validIdRes.value;

  // Adapt Packet-A anchor into generic composition resolver input
  const compositionResolver = new ApplicationCompositionResolver();

  const fullResolverOptions: GS1CompositionOptions = {
    ...resolverOptions,
    identifier,
  };

  const compositionRes =
    await compositionResolver.resolveComposition(fullResolverOptions);

  if (!compositionRes.ok) {
    return {
      ok: false,
      error: compositionRes.error,
      epistemicStatus: compositionRes.epistemicStatus,
    };
  }

  const { manifest, boundPayload, sccId, bcgId, bcg } = compositionRes;

  if (!sccId || !bcgId || !bcg) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          "Composition resolution failed to produce sccId, bcgId, or bcg graph",
      },
    };
  }

  // 2. CORR-0861-B-2 §1: Check Pinned Semantic State Reference
  // ActiveConstitutionalView contains identity, relationships, standings, authorities, capabilities, evidenceReferences, and applicablePolicies,
  // but exposes zero top-level ACV state identifier or digest.
  // Per CORR-0861-B-2 Decision Rule: Do NOT synthesize or fabricate a pin from subject identity canonicalReference, manifestId, or sccId.
  let pinnedSemanticStateRef: PinnedStateReference | undefined;
  if (options.explicitPinnedStateRef) {
    pinnedSemanticStateRef = options.explicitPinnedStateRef;
  }

  // If no explicit or lawful pinned state reference exists, report PINNED_SEMANTIC_STATE_REPRESENTATION_GAP
  if (!pinnedSemanticStateRef) {
    return Object.freeze({
      ok: true,
      manifest,
      boundPayload,
      sccId,
      bcgId,
      bcg,
      evaluationCoordinate: undefined,
      representationGap: "PINNED_SEMANTIC_STATE_REPRESENTATION_GAP",
    });
  }

  // If EvaluationCoordinate materialization is requested with explicit pinned state reference, enforce tEInput readiness
  if (!options.tEInput || options.tEInput.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "Required execution time input coordinate (tEInput) is missing for evaluation coordinate assembly",
      },
    };
  }

  const boundContext = options.policyContext;

  const evidenceIntegrityCoordinates = Object.freeze(
    boundPayload.resolvedEvidenceBundle.evidenceRecords.map((rec) =>
      Object.freeze({
        evidenceRef: rec.evidenceId,
        digest: rec.hash,
      }),
    ),
  );

  const temporalCoordinates = Object.freeze({
    ...(options.tValid !== undefined ? { tValid: options.tValid } : {}),
    ...(options.tObservation !== undefined
      ? { tObservation: options.tObservation }
      : {}),
    ...(options.tEInput !== undefined ? { tEInput: options.tEInput } : {}),
  });

  const temporalRequirements = Object.freeze({
    requiresTValid,
    requiresTObservation: false,
    requiresTEInput: true,
  });

  const ecResult = buildEvaluationCoordinate({
    sccId,
    bcgId,
    pinnedSemanticStateRef,
    boundContext,
    evidenceIntegrityCoordinates,
    authorizedInputs: Object.freeze({
      anchorCanonicalId: canonicalIdStr,
      provenanceCarrierInput: anchorSuccess.provenance.carrierInput,
      requestId: options.requestId,
      executionId: options.executionId,
      canonicalIdentifier: canonicalIdStr,
    }),
    evaluationParameters: Object.freeze({
      budget: options.budget,
      entropy: options.entropy,
      versions: options.versions,
    }),
    temporalCoordinates,
    temporalRequirements,
  });

  if (!ecResult.ok) {
    return {
      ok: false,
      error: ecResult.error,
    };
  }

  const result: GS1CompositionBridgeAssemblyResult = Object.freeze({
    ok: true,
    manifest,
    boundPayload,
    sccId,
    bcgId,
    bcg,
    evaluationCoordinate: ecResult.coordinate,
  });

  return result;
}
