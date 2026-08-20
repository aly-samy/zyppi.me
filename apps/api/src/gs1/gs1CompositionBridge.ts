import type { GS1AnchorBridgeSuccess } from "./types.js";
import {
  ApplicationCompositionResolver,
  type EvaluationCoordinate,
  type BoundConstitutionalPayload,
  type CompositionManifest,
  type CompositionError,
  type EpistemicStatus,
  type GS1CompositionOptions,
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
 * GS1 Domain-Edge Assembly Bridge (AMS-0861-B / CORR-0861-B-3).
 *
 * Consumes the lawful constitutional anchor produced by Packet A (createGs1AnchorFromCarrier / GS1AnchorBridgeSuccess)
 * and adapts it into generic Z-PROF composition resolution.
 *
 * LAW-B-01: Does NOT reparse, revalidate, renormalize, or re-resolve the carrier/anchor. Preserves anchor identity.
 * LAW-B-11: Strictly stops before RI Execution (does NOT invoke runInternalPipeline or produce ExecutionReceipt).
 * LAW-B-09: Positioned strictly in the GS1 domain edge (apps/api/src/gs1/). Generic Z-PROF contains zero imports of this module.
 *
 * CORR-0861-B-3 Representation-Gap Lockdown:
 * 1. Removes explicitPinnedStateRef and caller-supplied ACV/pinned-state reference handling.
 * 2. ActiveConstitutionalView exposes zero top-level ACV state identifier or digest.
 *    Does NOT fabricate or synthesize a pin from subject canonicalReference, manifestId, or sccId.
 * 3. Returns valid CompositionManifest, BoundConstitutionalPayload, sccId, bcgId, and bcg, while leaving
 *    evaluationCoordinate absent (undefined) and returning representationGap: "PINNED_SEMANTIC_STATE_REPRESENTATION_GAP".
 * 4. Mechanical Temporal Enforcement:
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

  // CORR-0861-B-3 Lockdown:
  // ActiveConstitutionalView contains identity, relationships, standings, authorities, capabilities, evidenceReferences,
  // and applicablePolicies, but exposes zero top-level ACV state identifier or digest.
  // Per CORR-0861-B-3: No caller-supplied ACV pin escape hatches are permitted.
  // Return valid manifest, boundPayload, sccId, bcgId, and bcg, while leaving evaluationCoordinate absent (undefined)
  // and returning representationGap: "PINNED_SEMANTIC_STATE_REPRESENTATION_GAP".
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
