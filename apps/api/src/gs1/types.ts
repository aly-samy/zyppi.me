import type {
  ExecutionRequestV2,
  IntentBindingV2,
  JsonValueV2,
  NormalizedGs1DigitalLink,
  OwnerDeterminationBindingV2,
  ParticipationV2,
  RequestedActionBindingV2,
  ParsedGs1DigitalLink,
  ValidatedGs1DigitalLink,
  GS1ParseError,
  GS1ValidationError,
  GS1NormalizationError,
} from "@zyppi/domain";
import type { ExecutionReceiptV2 } from "@zyppi/runtime";
import type {
  ResolvedGs1DigitalLink,
  GS1ResolutionError,
} from "@zyppi/contracts";
import type {
  BoundPrjProjectionSpecificationV1,
  BoundPrjRealityViewV1,
  PrjProjectionArtifactV1,
} from "../prj/index.js";
import type {
  CompositionManifest,
  EvaluationCoordinate,
} from "../zprof/index.js";
import type { GS1CompositionBridgeInputOptions } from "./gs1CompositionBridge.js";

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

// Native V2 Packet C Types
export type GS1PacketCStage =
  | "INPUT_VALIDATION"
  | "ASSEMBLY"
  | "V2_ADAPTER"
  | "SEC"
  | "POL_AGGREGATE"
  | "POL_AUTHORIZATION"
  | "V2_MATERIALIZATION"
  | "RI"
  | "PRJ"
  | "PROVENANCE"
  | "GS1_INTERPRETATION";

export interface GS1NativeV2PacketCInput {
  readonly carrierInput?: string;
  readonly composition: Omit<
    GS1CompositionBridgeInputOptions,
    "anchorSuccess"
  > & {
    readonly anchorSuccess?: GS1AnchorBridgeSuccess;
  };
  readonly participation: ParticipationV2;
  readonly intent: IntentBindingV2;
  readonly requestedAction: RequestedActionBindingV2;
  readonly realityView: BoundPrjRealityViewV1;
  readonly projectionSpecification: BoundPrjProjectionSpecificationV1;
}

export interface AMS0861CV2ProvenanceEnvelope {
  readonly version: "AMS-0861-C-PROVENANCE-V2-01";

  readonly packetB: {
    readonly manifestId: string;
    readonly payloadId: string;
    readonly sccId: string;
    readonly bcgId: string;
    readonly pinnedSemanticStateRef: string;
    readonly tValid?: string;
    readonly tObservation?: string;
    readonly tEInput: string;
  };

  readonly request: {
    readonly requestId: string;
    readonly executionId: string;
    readonly wholeRequestDigestCandidate: string;
  };

  readonly ownerDeterminations: {
    readonly secTrustBindingKey: string;
    readonly policyAggregateBindingKey: string;
    readonly authorizationBindingKey: string;
  };

  readonly receipt: {
    readonly receiptId: string;
    readonly inputHash: string;
    readonly outputHash: string;
    readonly evidenceHash: string;
    readonly policyVersion: string;
    readonly deterministicHash: string;
    readonly executionTime: string;
  };

  readonly projection: {
    readonly projectionId: string;
    readonly sourceZid: string;
    readonly realityDigest: string;
    readonly specificationDigest: string;
    readonly provenanceHash: string;
  };

  readonly provenanceHash: string;
}

export interface GS1DomainInterpretation {
  readonly domain: "GS1";
  readonly normalizedCarrier: NormalizedGs1DigitalLink;
  readonly canonicalExternalIdentifier: string;
  readonly sourceZid: string;
  readonly projectedRepresentation: JsonValueV2;
}

export interface GS1NativeV2PacketCSuccess {
  readonly ok: true;

  readonly packetB: {
    readonly manifest: CompositionManifest;
    readonly sccId: string;
    readonly bcgId: string;
    readonly evaluationCoordinate: EvaluationCoordinate;
  };

  readonly executionRequest: ExecutionRequestV2;

  readonly ownerDeterminations: {
    readonly secTrustResult: OwnerDeterminationBindingV2;
    readonly policyAggregate: OwnerDeterminationBindingV2;
    readonly authorization: OwnerDeterminationBindingV2;
  };

  readonly ri: {
    readonly executability: JsonValueV2;
    readonly outcome: JsonValueV2;
    readonly executionReceipt: ExecutionReceiptV2;
  };

  readonly projection: PrjProjectionArtifactV1;

  readonly provenance: AMS0861CV2ProvenanceEnvelope;

  readonly domainResult: GS1DomainInterpretation;
}

export interface GS1NativeV2PacketCFailure {
  readonly ok: false;
  readonly stage: GS1PacketCStage;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

export type GS1NativeV2PacketCResult =
  GS1NativeV2PacketCSuccess | GS1NativeV2PacketCFailure;
