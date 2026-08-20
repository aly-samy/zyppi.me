import type {
  ParsedGs1DigitalLink,
  ValidatedGs1DigitalLink,
  NormalizedGs1DigitalLink,
  GS1ParseError,
  GS1ValidationError,
  GS1NormalizationError,
} from "@zyppi/domain";
import type {
  ResolvedGs1DigitalLink,
  GS1ResolutionError,
} from "@zyppi/contracts";

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
  | GS1AnchorBridgeSuccess
  | GS1AnchorBridgeFailure;
