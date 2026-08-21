import type {
  ParsedGs1DigitalLink,
  ValidatedGs1DigitalLink,
  NormalizedGs1DigitalLink,
  GS1ParseError,
  GS1ValidationError,
  GS1NormalizationError,
  ExecutionReceipt,
  ExecutionRequest,
} from "@zyppi/domain";
import type {
  ResolvedGs1DigitalLink,
  GS1ResolutionError,
} from "@zyppi/contracts";
import type {
  PipelineResult,
  PipelineError,
} from "@zyppi/runtime/dist/types.js";
import type {
  AssessmentResult,
  CompositionError,
  EpistemicStatus,
  HistoricalProvenanceLink,
  PinnedStateReference,
} from "../zprof/types.js";
import type {
  GS1CompositionBridgeAssemblyResult,
  GS1CompositionBridgeInputOptions,
} from "./gs1CompositionBridge.js";

export type GS1BridgeErrorCode =
  | "PARSE_FAILED"
  | "VALIDATION_FAILED"
  | "NORMALIZATION_FAILED"
  | "RESOLUTION_FAILED";

export type GS1BridgeStageError =
  | { readonly stage: "PARSE"; readonly error: GS1ParseError }
  | { readonly stage: "VALIDATION"; readonly error: GS1ValidationError }
  | { readonly stage: "NORMALIZATION"; readonly error: GS1NormalizationError }
  | { readonly stage: "RESOLUTION"; readonly error: GS1ResolutionError };

export interface GS1AnchorBridgeFailure {
  readonly ok: false;
  readonly error: GS1BridgeStageError;
}

export interface GS1AnchorBridgeProvenance {
  readonly carrierInput: string;
  readonly parsedCarrier: ParsedGs1DigitalLink;
  readonly validatedCarrier: ValidatedGs1DigitalLink;
  readonly normalizedCarrier: NormalizedGs1DigitalLink;
  readonly resolvedCanonicalId: string;
}

export interface GS1AnchorBridgeSuccess {
  readonly ok: true;
  readonly provenance: GS1AnchorBridgeProvenance;
  readonly anchor: ResolvedGs1DigitalLink;
}

export type GS1AnchorBridgeResult =
  GS1AnchorBridgeSuccess | GS1AnchorBridgeFailure;

export interface GS1DomainResult {
  readonly domain: "GS1";
  readonly projectionSpecification: string;
  readonly canonicalIdentifier: string;
  readonly anchorCarrier: string;
  readonly outcome: string;
  readonly executionReceipt: ExecutionReceipt;
  readonly provenanceLink: HistoricalProvenanceLink;
  readonly sccId: string;
  readonly bcgId: string;
  readonly pinnedSemanticStateRef: PinnedStateReference;
  readonly evaluatedAt: string;
  readonly details: {
    readonly aggregateResult: string;
    readonly verifiedEvidenceCount: number;
    readonly boundPrjSpecifications: readonly string[];
    readonly boundRsnBlueprints: readonly string[];
  };
}

export interface GS1ExecutionBridgeInputOptions extends Omit<
  GS1CompositionBridgeInputOptions,
  "requestId" | "executionId"
> {
  readonly requestId?: string;
  readonly executionId?: string;
  readonly evidencePayloads?: ReadonlyMap<string, unknown>;
  readonly overrides?: import("@zyppi/runtime/dist/types.js").StageOverrideConfig;
}

export type GS1ExecutionBridgeResult =
  | {
      readonly ok: true;
      readonly assembly: GS1CompositionBridgeAssemblyResult & { ok: true };
      readonly executionRequest: ExecutionRequest;
      readonly pipelineResult: PipelineResult;
      readonly provenanceLink: HistoricalProvenanceLink;
      readonly domainResult?: GS1DomainResult;
      readonly assessmentResult?: AssessmentResult;
    }
  | {
      readonly ok: false;
      readonly stage: "ASSEMBLY" | "ADAPTER" | "EXECUTION" | "PROJECTION";
      readonly error: CompositionError | PipelineError;
      readonly epistemicStatus?: EpistemicStatus;
    };
