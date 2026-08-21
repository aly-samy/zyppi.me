import {
  executeEvaluationCoordinate,
  mapEvaluationCoordinateToExecutionRequest,
  type BoundConstitutionalPayload,
  type CompositionManifest,
  type EvaluationCoordinate,
  type HistoricalProvenanceLink,
} from "../zprof/index.js";
import { assembleGs1CompositionFromAnchor } from "./gs1CompositionBridge.js";
import type {
  GS1DomainResult,
  GS1ExecutionBridgeInputOptions,
  GS1ExecutionBridgeResult,
} from "./types.js";

/**
 * Pure, side-effect-free post-RI GS1 Domain Projection.
 * Consumes ExecutionOutput, ExecutionReceipt, EvaluationCoordinate, CompositionManifest, and BoundConstitutionalPayload over a closed capability surface.
 *
 * Closed Capability Surface Laws (LAW-C-06, LAW-C-07, LAW-C-24):
 * - ZERO Registry access
 * - ZERO Database access
 * - ZERO Network access
 * - ZERO System clock access (Date.now())
 * - ZERO Randomness (Math.random())
 * - ZERO Environment access (process.env)
 * - ZERO Ambient application container state
 */
export function projectGs1DomainResult(options: {
  readonly coordinate: EvaluationCoordinate;
  readonly manifest: CompositionManifest;
  readonly boundPayload: BoundConstitutionalPayload;
  readonly executionReceipt: import("@zyppi/domain").ExecutionReceipt;
  readonly provenanceLink: HistoricalProvenanceLink;
  readonly executionOutput: import("@zyppi/runtime/dist/types.js").ExecutionOutput;
  readonly canonicalIdentifier: string;
}): GS1DomainResult {
  const {
    coordinate,
    manifest,
    boundPayload,
    executionReceipt,
    provenanceLink,
    executionOutput,
    canonicalIdentifier,
  } = options;

  const boundPrjSpecs = (manifest.boundPrjSpecifications ?? []).map(
    (s) => s.specId,
  );
  const boundRsnBlueprints = (manifest.boundRsnBlueprints ?? []).map(
    (b) => b.blueprintId,
  );

  const primaryPrjSpec =
    boundPrjSpecs.length > 0
      ? boundPrjSpecs[0]!
      : "prj:spec:gs1_digital_link_projection:v1";

  const verifiedEvidenceCount =
    boundPayload.resolvedEvidenceBundle?.evidenceRecords?.length ?? 0;

  const evaluatedAt =
    coordinate.temporalCoordinates.tEInput ?? "1970-01-01T00:00:00.000Z";

  return Object.freeze({
    domain: "GS1",
    projectionSpecification: primaryPrjSpec,
    canonicalIdentifier,
    anchorCarrier: canonicalIdentifier,
    outcome: executionOutput.outcome,
    executionReceipt,
    provenanceLink,
    sccId: coordinate.sccId,
    bcgId: coordinate.bcgId,
    pinnedSemanticStateRef: coordinate.pinnedSemanticStateRef,
    evaluatedAt,
    details: Object.freeze({
      aggregateResult: executionOutput.outcome,
      verifiedEvidenceCount,
      boundPrjSpecifications: boundPrjSpecs,
      boundRsnBlueprints,
    }),
  });
}

/**
 * GS1 Domain-Edge Execution, Provenance & Governed Projection Bridge (AMS-0861-C).
 *
 * Orchestrates:
 * 1. Assembly from Packet-A Anchor via `assembleGs1CompositionFromAnchor`
 * 2. Application EC -> RI Mapping via existing `mapEvaluationCoordinateToExecutionRequest`
 * 3. Existing RI Admission & Runtime Execution via existing `executeEvaluationCoordinate`
 * 4. Post-RI Governed GS1 Domain Projection via `projectGs1DomainResult`
 *
 * Laws:
 * LAW-C-01: RI remains sovereign. Bypasses neither RI nor existing Runtime.
 * LAW-C-03: Consumes pre-computed SCC_ID and BCG_ID from Packet B. Recomputes zero identities.
 * LAW-C-08: Receipt contains ZERO GS1-specific fields.
 * LAW-C-09: Positioned strictly in GS1 Domain Edge (apps/api/src/gs1/). Generic Z-PROF / Runtime / Domain remain domain-neutral.
 */
export async function executeGs1Bridge(
  options: GS1ExecutionBridgeInputOptions,
): Promise<GS1ExecutionBridgeResult> {
  const {
    requestId = "req:gs1:execution:v1",
    executionId = "exec:gs1:execution:v1",
    evidencePayloads,
    overrides,
    ...compositionOptions
  } = options;

  // 1. Packet-B Pre-Execution Assembly
  const assemblyRes = await assembleGs1CompositionFromAnchor({
    ...compositionOptions,
    requestId,
    executionId,
  });
  if (!assemblyRes.ok) {
    return {
      ok: false,
      stage: "ASSEMBLY",
      error: assemblyRes.error,
      epistemicStatus: assemblyRes.epistemicStatus,
    };
  }

  const { manifest, boundPayload, evaluationCoordinate } = assemblyRes;

  // 2. Application EC -> RI Adapter
  const mapRes = mapEvaluationCoordinateToExecutionRequest({
    coordinate: evaluationCoordinate,
    boundPayload,
    requestId,
    executionId,
  });

  if (!mapRes.ok) {
    return {
      ok: false,
      stage: "ADAPTER",
      error: mapRes.error,
    };
  }

  const executionRequest = mapRes.executionRequest;

  // 3. RI Execution Seam
  const execRes = await executeEvaluationCoordinate({
    coordinate: evaluationCoordinate,
    boundPayload,
    requestId,
    executionId,
    evidencePayloads,
    overrides,
  });

  if (!execRes.ok) {
    return {
      ok: false,
      stage: "EXECUTION",
      error: execRes.error,
    };
  }

  const { pipelineResult, provenanceLink } = execRes;

  if (!pipelineResult.ok) {
    return {
      ok: false,
      stage: "EXECUTION",
      error: {
        stage: pipelineResult.error.stage,
        code: pipelineResult.error.code,
        message: pipelineResult.error.message,
      },
    };
  }

  if (pipelineResult.outcome.kind !== "materialized" || !provenanceLink) {
    return {
      ok: false,
      stage: "EXECUTION",
      error: {
        stage: "Receipt Generation",
        code: "INVALID_RECEIPT",
        message:
          "RI execution succeeded but failed to produce a materialized ExecutionOutput or HistoricalProvenanceLink",
      },
    };
  }

  const executionOutput = pipelineResult.outcome.executionOutput;
  const canonicalIdentifier = options.anchorSuccess.anchor.normalizedCarrier.k1;

  // 4. Post-RI Governed GS1 Domain Projection
  const domainResult = projectGs1DomainResult({
    coordinate: evaluationCoordinate,
    manifest,
    boundPayload,
    executionReceipt: executionOutput.executionReceipt,
    provenanceLink,
    executionOutput,
    canonicalIdentifier,
  });

  return Object.freeze({
    ok: true,
    assembly: assemblyRes,
    executionRequest,
    pipelineResult,
    provenanceLink,
    domainResult,
  });
}
