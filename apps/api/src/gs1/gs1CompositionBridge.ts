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
 * GS1 Domain-Edge Assembly Bridge (AMS-0861-B / CORR-0861-B-1).
 *
 * Consumes the lawful constitutional anchor produced by Packet A (createGs1AnchorFromCarrier / GS1AnchorBridgeSuccess)
 * and adapts it into generic Z-PROF composition resolution and EvaluationCoordinate construction.
 *
 * LAW-B-01: Does NOT reparse, revalidate, renormalize, or re-resolve the carrier/anchor. Preserves anchor identity.
 * LAW-B-11: Strictly stops before RI Execution (does NOT invoke runInternalPipeline or produce ExecutionReceipt).
 * LAW-B-09: Positioned strictly in the GS1 domain edge (apps/api/src/gs1/). Generic Z-PROF contains zero imports of this module.
 *
 * CORR-0861-B-1 Corrections:
 * 1. Binds actual existing pinned ACV identity reference (boundPayload.resolvedActiveConstitutionalView.identity.canonicalReference)
 *    to pinnedSemanticStateRef without synthesizing manifestId, sccId, or ARM version.
 * 2. Consumes explicit temporal inputs (tValid, tObservation, tEInput) without automatically assigning constitutionalTimestamp to all three.
 * 3. Binds actual governed options.policyContext directly as boundContext on EvaluationCoordinate (enabling pre-RI mapper compatibility).
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

  // 1. CORR-0861-B-1 §1: Bind actual existing pinned ACV identity reference without synthesizing manifest/scc/version
  const pinnedSemanticStateRef = Object.freeze({
    ref: boundPayload.resolvedActiveConstitutionalView.identity
      .canonicalReference,
  });

  // 3. CORR-0861-B-1 §3: Bind actual governed options.policyContext directly as boundContext
  const boundContext = options.policyContext;

  const evidenceIntegrityCoordinates = Object.freeze(
    boundPayload.resolvedEvidenceBundle.evidenceRecords.map((rec) =>
      Object.freeze({
        evidenceRef: rec.evidenceId,
        digest: rec.hash,
      }),
    ),
  );

  // 2. CORR-0861-B-1 §2: Consume explicit temporal coordinates without automatic collapsing to constitutionalTimestamp
  const temporalCoordinates = Object.freeze({
    ...(options.tValid !== undefined ? { tValid: options.tValid } : {}),
    ...(options.tObservation !== undefined
      ? { tObservation: options.tObservation }
      : {}),
    ...(options.tEInput !== undefined ? { tEInput: options.tEInput } : {}),
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
