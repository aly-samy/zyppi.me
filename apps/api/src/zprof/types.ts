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
