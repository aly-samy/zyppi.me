import type {
  ActiveConstitutionalView,
  EvidenceBundle,
  ExecutionContext,
  PolicyContext,
  ResolvedPolicyGraph,
} from "@zyppi/domain";
import type {
  RegistryRepository,
  ValidatedCanonicalIdentifier,
  EvidenceReferenceResolver,
  EvidencePayloadProvider,
  ObjectStorageClient,
} from "@zyppi/contracts";
import type { StageOverrideConfig } from "@zyppi/runtime/dist/types.js";

/**
 * Closed epistemic status taxonomy per AMS-0852 §12.3 / CONTRACT-R1.
 */
export type EpistemicStatus =
  "UNKNOWN" | "UNAVAILABLE" | "UNVERIFIED" | "CONFLICTING";

/**
 * Closed Z-PROF composition error codes per AMS-0852 §6.3 / CONTRACT-R1.
 */
export type CompositionErrorCode =
  | "unsupported"
  | "unavailable"
  | "missing"
  | "incompatible"
  | "conflicting"
  | "unauthorized"
  | "unverified"
  | "invalid";

/**
 * Application-layer error representation for composition failures.
 */
export interface CompositionError {
  readonly code: CompositionErrorCode;
  readonly category: "Composition Failure";
  readonly message: string;
  readonly requirementId?: string;
}

/**
 * Structural specification of a Domain Template Card (DTC) per AMS-0852 §3.3.
 */
export interface DomainTemplateCard {
  readonly $schema?: string;
  readonly dtcId: string;
  readonly domainIdentifier: string;
  readonly domainName: string;
  readonly version: string;
  readonly scope: string;
  readonly applicableAssetClasses: readonly string[];
  readonly applicableArmProfiles: readonly string[];
  readonly epistemicRequirements: readonly string[];
  readonly requiredPrjSpecifications: readonly string[];
  readonly requiredRsnBlueprints: readonly string[];
  readonly requiredContextDimensions: readonly string[];
  readonly applicablePolRequirements: readonly string[];
  readonly applicableSecRequirements: readonly string[];
  readonly requiredRiCapabilities: readonly string[];
  readonly versionConstraints: Readonly<Record<string, string>>;
  readonly provenanceRequirements: {
    readonly requireRegistrationReceipt?: boolean;
    readonly requireAuthorIdentity?: boolean;
  };
}

/**
 * Individual fact definition within an Epistemic Requirement Contract per AMS-0852 §4.3.
 */
export interface FactDefinition {
  readonly factKey: string;
  readonly optionality: "MANDATORY" | "OPTIONAL";
  readonly expectedType: string;
}

/**
 * Epistemic Requirement Contract specification per AMS-0852 §4.3.
 */
export interface EpistemicRequirementContract {
  readonly $schema?: string;
  readonly requirementId: string;
  readonly version: string;
  readonly targetDimension: string;
  readonly goldenQuestionRef: string;
  readonly requiredFacts: readonly FactDefinition[];
  readonly evidenceConstraints?: {
    readonly requireSignedReceipt?: boolean;
    readonly allowedDigestAlgorithms?: readonly string[];
  };
  readonly temporalConstraints?: {
    readonly validTimeRequired?: boolean;
  };
}

/**
 * Reference binding structure inside a CompositionManifest per AMS-0852 §5.2.
 */
export interface VersionedReference {
  readonly id: string;
  readonly version: string;
}

/**
 * Structural reference to an ATT-R-001 Execution Proof artifact per AMS-0857 ARCH-CLOSURE §10.
 * Pure structural reference; Z-PROF does not perform cryptographic signature verification.
 */
export interface AttRProofReference {
  readonly proofId: string;
  readonly version: string;
  readonly attestationType: string;
}

/**
 * Structural reference to a CL-16 Governed Intelligence Artifact per AMS-0857 ARCH-CLOSURE §9.
 */
export interface Cl16IntelligenceReference {
  readonly artifactId: string;
  readonly version: string;
  readonly rsnBlueprintRef: string;
  readonly requireAttestationProof?: boolean;
  readonly attestationProofRef?: AttRProofReference;
  readonly conclusionSummary?: string;
}

/**
 * CompositionManifest structural specification per AMS-0852 §5.2 / AMS-0857 ARCH-CLOSURE.
 */
export interface CompositionManifest {
  readonly $schema?: string;
  readonly manifestId: string;
  readonly dtcReference: {
    readonly dtcId: string;
    readonly version: string;
  };
  readonly armProfileReference: {
    readonly profileId: string;
    readonly version: string;
  };
  readonly boundEpistemicRequirements: readonly {
    readonly requirementId: string;
    readonly version: string;
  }[];
  readonly boundPrjSpecifications: readonly {
    readonly specId: string;
    readonly version: string;
  }[];
  readonly boundRsnBlueprints: readonly {
    readonly blueprintId: string;
    readonly version: string;
  }[];
  readonly boundPolRequirements: readonly {
    readonly policyId: string;
    readonly version: string;
  }[];
  readonly boundSecRequirements: readonly {
    readonly securityReqId: string;
    readonly version: string;
  }[];
  readonly boundRiCapabilities: readonly {
    readonly capabilityId: string;
    readonly version: string;
  }[];
  readonly boundCl16IntelligenceArtifacts?: readonly Cl16IntelligenceReference[];
  readonly boundAttestationProofReferences?: readonly AttRProofReference[];
  readonly epistemicDivergence?: boolean;
  readonly dependencyTopology: {
    readonly nodes: readonly string[];
    readonly edges: readonly {
      readonly from: string;
      readonly to: string;
    }[];
  };
  readonly provenanceReferences: {
    readonly manifestAuthor: string;
    readonly createdTimestamp: string;
  };
}

/**
 * Bound Constitutional Payload per AMS-0852 §7.3.
 */
export interface BoundConstitutionalPayload {
  readonly $schema?: string;
  readonly payloadId: string;
  readonly manifestId: string;
  readonly resolvedActiveConstitutionalView: ActiveConstitutionalView;
  readonly resolvedEvidenceBundle: EvidenceBundle;
  readonly executionContext: ExecutionContext;
  readonly boundCl16IntelligenceArtifacts?: readonly Cl16IntelligenceReference[];
  readonly epistemicDivergence?: boolean;
}

/**
 * Generic structural composition request options (AMS-0854 domain-agnostic interface).
 */
export interface GenericCompositionOptions {
  readonly dtcFixture: DomainTemplateCard;
  readonly epistemicRequirementsFixtures: readonly EpistemicRequirementContract[];
  readonly registryRepository: RegistryRepository;
  readonly identifier: ValidatedCanonicalIdentifier;
  readonly requestId: string;
  readonly executionId: string;
  readonly constitutionalTimestamp: string;
  readonly budget: number;
  readonly entropy: string;
  readonly versions: readonly string[];
  readonly policyContext: PolicyContext;
  readonly resolvedPolicyGraph: ResolvedPolicyGraph;
  readonly explicitAcv?: ActiveConstitutionalView;
  readonly explicitEvidenceBundle?: EvidenceBundle;
  readonly explicitEvidencePayloads?: ReadonlyMap<string, unknown>;
  readonly explicitCl16Artifacts?: readonly Cl16IntelligenceReference[];
  readonly overrides?: StageOverrideConfig;
  readonly evidenceResolver?: EvidenceReferenceResolver;
  readonly evidencePayloadProvider?: EvidencePayloadProvider;
  readonly objectStorageClient?: ObjectStorageClient;
  readonly explicitConflictInputs?: import("./conflict.js").ConflictEvaluationInputs;
  readonly compositionDefinition?: import("./bind.js").CompositionDefinition;
}

/**
 * GS1 Composition Resolution Request options (AMS-0853 compatibility alias / subset).
 */
export interface GS1CompositionRequest {
  readonly identifier: ValidatedCanonicalIdentifier;
  readonly requestId: string;
  readonly executionId: string;
  readonly constitutionalTimestamp: string;
  readonly budget: number;
  readonly entropy: string;
  readonly versions: readonly string[];
  readonly policyContext: PolicyContext;
  readonly resolvedPolicyGraph: ResolvedPolicyGraph;
  readonly explicitEvidenceBundle?: EvidenceBundle;
  readonly explicitEvidencePayloads?: ReadonlyMap<string, unknown>;
  readonly overrides?: StageOverrideConfig;
}

/**
 * Result of composition resolution before runtime execution.
 */
export type CompositionResolutionResult =
  | {
      readonly ok: true;
      readonly manifest: CompositionManifest;
      readonly boundPayload: BoundConstitutionalPayload;
      readonly evidencePayloads: ReadonlyMap<string, unknown>;
      readonly sccId?: string;
      readonly bcgId?: string;
      readonly bcg?: import("./bcg.js").BoundConfigurationGraph;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
      readonly epistemicStatus?: EpistemicStatus;
    };

// ============================================================================
// AMS-0860-B — Evaluation & Assessment Coordinate Type Contracts
// ============================================================================

/**
 * Explicit structural reference contract for pinned constitutional states per AMS-0860-B.
 */
export interface PinnedStateReference {
  readonly ref: string;
  readonly digest?: string;
  readonly version?: string;
}

/**
 * Explicit evaluation temporal coordinates per AMS-0860-B.
 * Preserves strict separation: T_v (Reality Valid Time), T_o (Evidence Observation Time), T_e_input (Execution Time Input).
 * Runtime-observed execution timestamp (T_e_observed) SHALL NOT exist inside EvaluationCoordinate.
 */
export interface EvaluationTemporalCoordinates {
  readonly tValid?: string; // T_v — Reality Valid Time
  readonly tObservation?: string; // T_o — Evidence Observation Time
  readonly tEInput?: string; // T_e_input — evaluation-affecting execution time input
}

/**
 * Explicit governed temporal requirement declarations per AMS-0860-B.
 */
export interface TemporalRequirements {
  readonly requiresTValid?: boolean;
  readonly requiresTObservation?: boolean;
  readonly requiresTEInput?: boolean;
}

/**
 * Integrity coordinate binding Evidence per AMS-0860-B.
 * Pure integrity reference; decoupled from Evidence payload maps and current trust calculations.
 */
export interface EvidenceIntegrityCoordinate {
  readonly evidenceRef: string;
  readonly digest: string;
}

/**
 * EvaluationCoordinate (EC) per AMS-0860-B §10.
 * Pre-execution coordinate describing WHAT WAS / WILL BE EVALUATED.
 * Laws: OP ∉ EC, PinnedAssessmentState ∉ EC, T_trust ∉ EC, ExecutionReceipt ∉ EC, T_e_observed ∉ EC.
 */
export interface EvaluationCoordinate {
  readonly sccId: string;
  readonly bcgId: string;
  readonly pinnedSemanticStateRef: PinnedStateReference;
  readonly boundContext: PolicyContext | Readonly<Record<string, unknown>>;
  readonly evidenceIntegrityCoordinates: readonly EvidenceIntegrityCoordinate[];
  readonly authorizedInputs: Readonly<Record<string, unknown>>;
  readonly evaluationParameters: Readonly<Record<string, unknown>>;
  readonly temporalCoordinates: EvaluationTemporalCoordinates;
}

/**
 * Closed primitive operation vocabulary per AMS-0860-B §23.
 */
export type PrimitiveOperation =
  | "NEW_COMPOSITION"
  | "NEW_EVALUATION"
  | "HISTORICAL_RECONSTRUCTION"
  | "RECEIPT_VERIFICATION";

/**
 * Governed composition-authoring target for NEW_COMPOSITION operation.
 */
export interface CompositionAuthoringTarget {
  readonly kind: "COMPOSITION_AUTHORING";
  readonly compositionDefinition:
    | import("./bind.js").CompositionDefinition
    | Readonly<Record<string, unknown>>;
}

/**
 * Complete pre-execution EvaluationCoordinate target for NEW_EVALUATION operation.
 */
export interface EvaluationCoordinateTarget {
  readonly kind: "EVALUATION_COORDINATE";
  readonly coordinate: EvaluationCoordinate;
}

/**
 * Historical EvaluationCoordinate target for HISTORICAL_RECONSTRUCTION operation.
 */
export interface HistoricalEvaluationCoordinateTarget {
  readonly kind: "HISTORICAL_EVALUATION_COORDINATE";
  readonly ref: string;
  readonly coordinate?: EvaluationCoordinate;
}

/**
 * ExecutionReceipt reference target for RECEIPT_VERIFICATION operation.
 */
export interface ExecutionReceiptTarget {
  readonly kind: "EXECUTION_RECEIPT";
  readonly receiptRef: string;
  readonly receiptDigest?: string;
}

/**
 * Strict discriminated union of lawful assessment targets per AMS-0860-B §24.
 */
export type AssessmentTarget =
  | CompositionAuthoringTarget
  | EvaluationCoordinateTarget
  | HistoricalEvaluationCoordinateTarget
  | ExecutionReceiptTarget;

/**
 * AssessmentRequestCoordinate (ARC) per AMS-0860-B §22.
 * Describes WHAT OPERATION IS BEING REQUESTED AGAINST A GOVERNED TARGET.
 */
export interface AssessmentRequestCoordinate {
  readonly target: AssessmentTarget;
  readonly operation: PrimitiveOperation;
  readonly pinnedAssessmentStateRef: PinnedStateReference;
  readonly tTrust: string;
  readonly applicableAssessmentRules?: readonly PinnedStateReference[];
}

/**
 * Analytical non-authoritative historical reconstruction result marker per AMS-0860-B §30.
 */
export interface HistoricalReconstructionResult {
  readonly status: "NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION";
  readonly targetRef: string;
  readonly historicalCoordinate?: EvaluationCoordinate;
  readonly reconstructionTimestamp: string;
}

/**
 * Input options for buildEvaluationCoordinate.
 */
export interface EvaluationCoordinateInput {
  readonly sccId: string;
  readonly bcgId: string;
  readonly pinnedSemanticStateRef: PinnedStateReference;
  readonly boundContext: PolicyContext | Readonly<Record<string, unknown>>;
  readonly evidenceIntegrityCoordinates: readonly EvidenceIntegrityCoordinate[];
  readonly authorizedInputs?: Readonly<Record<string, unknown>>;
  readonly evaluationParameters?: Readonly<Record<string, unknown>>;
  readonly temporalCoordinates?: EvaluationTemporalCoordinates;
  readonly temporalRequirements?: TemporalRequirements;
}

/**
 * Input options for buildAssessmentRequestCoordinate.
 */
export interface AssessmentRequestCoordinateInput {
  readonly target: AssessmentTarget;
  readonly operation: PrimitiveOperation;
  readonly pinnedAssessmentStateRef: PinnedStateReference;
  readonly tTrust: string;
  readonly applicableAssessmentRules?: readonly PinnedStateReference[];
  readonly prohibitHistoricalReconstruction?: boolean;
}

/**
 * Result of EvaluationCoordinate construction.
 */
export type EvaluationCoordinateResult =
  | {
      readonly ok: true;
      readonly coordinate: EvaluationCoordinate;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
    };

/**
 * Result of AssessmentRequestCoordinate construction.
 */
export type AssessmentRequestCoordinateResult =
  | {
      readonly ok: true;
      readonly coordinate: AssessmentRequestCoordinate;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
    };

/**
 * Result of historical reconstruction boundary evaluation.
 */
export type HistoricalReconstructionBoundaryResult =
  | {
      readonly ok: true;
      readonly result: HistoricalReconstructionResult;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
    };
