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
} from "../zprof/index.js";
import { createValidatedCanonicalIdentifier } from "@zyppi/contracts";

export interface GS1CompositionBridgeInputOptions extends Omit<
  GS1CompositionOptions,
  "identifier"
> {
  readonly anchorSuccess: GS1AnchorBridgeSuccess;
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
 * GS1 Domain-Edge Assembly Bridge (AMS-0861-B).
 *
 * Consumes the lawful constitutional anchor produced by Packet A (createGs1AnchorFromCarrier / GS1AnchorBridgeSuccess)
 * and adapts it into generic Z-PROF composition resolution and EvaluationCoordinate construction.
 *
 * LAW-B-01: Does NOT reparse, revalidate, renormalize, or re-resolve the carrier/anchor. Preserves anchor identity.
 * LAW-B-11: Strictly stops before RI Execution (does NOT invoke runInternalPipeline or produce ExecutionReceipt).
 * LAW-B-09: Positioned strictly in the GS1 domain edge (apps/api/src/gs1/). Generic Z-PROF contains zero imports of this module.
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

  // Build EvaluationCoordinate (EC) using pre-computed sccId and bcgId from composition resolution
  const pinnedSemanticStateRef = Object.freeze({
    ref: manifest.manifestId,
    digest: sccId,
    version: manifest.armProfileReference.version,
  });

  const boundContext = Object.freeze({
    requestId: options.requestId,
    executionId: options.executionId,
    constitutionalTimestamp: options.constitutionalTimestamp,
    versions: options.versions,
    canonicalIdentifier: canonicalIdStr,
  });

  const evidenceIntegrityCoordinates = Object.freeze(
    boundPayload.resolvedEvidenceBundle.evidenceRecords.map((rec) =>
      Object.freeze({
        evidenceRef: rec.evidenceId,
        digest: rec.hash,
      }),
    ),
  );

  const ecResult = buildEvaluationCoordinate({
    sccId,
    bcgId,
    pinnedSemanticStateRef,
    boundContext,
    evidenceIntegrityCoordinates,
    authorizedInputs: Object.freeze({
      anchorCanonicalId: canonicalIdStr,
      provenanceCarrierInput: anchorSuccess.provenance.carrierInput,
    }),
    evaluationParameters: Object.freeze({
      budget: options.budget,
      entropy: options.entropy,
    }),
    temporalCoordinates: Object.freeze({
      tValid: options.constitutionalTimestamp,
      tObservation: options.constitutionalTimestamp,
      tEInput: options.constitutionalTimestamp,
    }),
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
