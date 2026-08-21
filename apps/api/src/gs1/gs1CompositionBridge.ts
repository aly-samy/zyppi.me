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
import { deriveActiveConstitutionalViewStateDigest } from "@zyppi/domain";

export interface GS1CompositionBridgeInputOptions extends Omit<
  GS1CompositionOptions,
  "identifier"
> {
  readonly anchorSuccess: GS1AnchorBridgeSuccess;
  readonly tValid?: string;
  readonly tObservation?: string;
  readonly tEInput?: string;
}

export type GS1CompositionBridgeAssemblyResult =
  | {
      readonly ok: true;
      readonly manifest: CompositionManifest;
      readonly boundPayload: BoundConstitutionalPayload;
      readonly sccId: string;
      readonly bcgId: string;
      readonly bcg: import("../zprof/bcg.js").BoundConfigurationGraph;
      readonly evaluationCoordinate: EvaluationCoordinate;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
      readonly epistemicStatus?: EpistemicStatus;
    };

/**
 * GS1 Domain-Edge Assembly Bridge (AMS-0861-B / ACV-STATE-REF-GATE-01 / CORR-ACV-STATE-REF-01).
 *
 * Consumes the lawful constitutional anchor produced by Packet A (createGs1AnchorFromCarrier / GS1AnchorBridgeSuccess)
 * and adapts it into generic Z-PROF composition resolution.
 *
 * LAW-B-01: Does NOT reparse, revalidate, renormalize, or re-resolve the carrier/anchor. Preserves anchor identity.
 * LAW-B-11: Strictly stops before RI Execution (does NOT invoke runInternalPipeline or produce ExecutionReceipt).
 * LAW-B-09: Positioned strictly in the GS1 domain edge (apps/api/src/gs1/). Generic Z-PROF contains zero imports of this module.
 *
 * CORR-ACV-STATE-REF-01 Readiness Rules:
 * 1. Derives exact deterministic ACV State Reference digest from boundPayload.resolvedActiveConstitutionalView using @zyppi/domain.
 * 2. Maps digest into PinnedStateReference { ref: digest, digest: digest } with zero caller override / substitution.
 * 3. Requires explicit, non-empty tEInput (evaluation-affecting execution time coordinate) for successful Packet-B pre-RI assembly.
 *    Missing or blank tEInput fails closed with error code "missing" (B-0861-32 rule restored).
 * 4. Requires governed policyContext (no synthetic { policies: [] } fallback). Missing policyContext fails closed with "missing".
 * 5. Mechanical Temporal Enforcement:
 *    - If any bound EpistemicRequirementContract has temporalConstraints.validTimeRequired === true,
 *      tValid is mandatory; missing tValid fails closed with error code "missing".
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

  // 1. Require explicit tEInput coordinate for Packet-B assembly
  if (!options.tEInput || options.tEInput.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "Required evaluation execution time coordinate (tEInput) is missing or empty",
      },
      epistemicStatus: "UNAVAILABLE",
    };
  }

  // 2. Require explicit governed policyContext
  if (
    !options.policyContext ||
    typeof options.policyContext !== "object" ||
    !Array.isArray(options.policyContext.policies)
  ) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Required governed policyContext is missing or malformed",
      },
      epistemicStatus: "UNAVAILABLE",
    };
  }

  // 3. Mechanical Temporal Requirement Verification from bound EpistemicRequirementContracts
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

  // ACV-STATE-REF-GATE-01: Derive ACV state reference from exact resolvedActiveConstitutionalView
  const acvDigest = deriveActiveConstitutionalViewStateDigest(
    boundPayload.resolvedActiveConstitutionalView,
  );

  const pinnedSemanticStateRef: PinnedStateReference = Object.freeze({
    ref: acvDigest,
    digest: acvDigest,
  });

  const evidenceIntegrityCoordinates = (
    boundPayload.resolvedEvidenceBundle?.evidenceRecords ?? []
  ).map((record) => ({
    evidenceRef: record.evidenceId,
    digest: record.hash,
  }));

  const ecBuildRes = buildEvaluationCoordinate({
    sccId,
    bcgId,
    pinnedSemanticStateRef,
    boundContext: options.policyContext,
    evidenceIntegrityCoordinates,
    temporalCoordinates: {
      tValid: options.tValid,
      tObservation: options.tObservation,
      tEInput: options.tEInput,
    },
  });

  if (!ecBuildRes.ok) {
    return {
      ok: false,
      error: ecBuildRes.error,
    };
  }

  return Object.freeze({
    ok: true,
    manifest,
    boundPayload,
    sccId,
    bcgId,
    bcg,
    evaluationCoordinate: ecBuildRes.coordinate,
  });
}
