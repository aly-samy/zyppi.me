import type { JsonValueV2 } from "./json.js";
import type {
  ActionSemanticRefV2,
  AgencyBasisRefV2,
  CompatibilityContractRefV2,
  ConstitutionalRefV2,
  EvaluationSemanticRefV2,
  EvidenceRefV2,
  EvidenceRequirementRefV2,
  OwnerRefV2,
  PolicyRefV2,
  ProvenanceRefV2,
  QuestionSemanticRefV2,
  RelationshipRefV2,
  RequestedCapabilityRefV2,
  RuleRefV2,
  ScopeRefV2,
  StateArtifactRefV2,
  StateInstanceRefV2,
  StateSemanticRefV2,
  SubjectRefV2,
  TargetRefV2,
  TargetSlotSemanticRefV2,
} from "./refs.js";

// Component ref claims (digest strings matching ^sha256:[0-9a-f]{64}$)
export type SemanticStateRefV2 = string;
export type EvidenceStateRefV2 = string;
export type PolicyUniverseRefV2 = string;

// Participation Types
export type ParticipationRoleV2 =
  "ACTOR" | "GOVERNED_SUBJECT" | "INTENT_ORIGINATOR";

export type SubjectBindingV2 =
  | { readonly kind: "KNOWN"; readonly subjectRef: SubjectRefV2 }
  | { readonly kind: "UNKNOWN" };

export interface RoleBindingV2 {
  readonly roleBindingKey: string;
  readonly role: ParticipationRoleV2;
  readonly subject: SubjectBindingV2;
}

export interface AgencyBindingV2 {
  readonly agencyBindingKey: string;
  readonly actorRoleBindingRef: string;
  readonly governedSubjectRoleBindingRef: string;
  readonly terminalAgencyBasisRef: AgencyBasisRefV2;
}

export interface ParticipationV2 {
  readonly roleBindings: readonly RoleBindingV2[];
  readonly agencyBindings: readonly AgencyBindingV2[];
}

// Intent Types (C01)
export type IntentCategoryV2 =
  | "DISCOVER"
  | "ACCESS"
  | "VERIFY"
  | "AUTHENTICATE"
  | "REGISTER"
  | "CLAIM"
  | "PURCHASE"
  | "TRANSFER"
  | "RETURN"
  | "SUPPORT"
  | "SUBSCRIBE"
  | "TRIGGER";

export type ExactStateInstanceV2 =
  | {
      readonly kind: "GOVERNED_ARTIFACT_REF";
      readonly stateInstanceRef: StateInstanceRefV2;
    }
  | {
      readonly kind: "OWNER_TYPED_INLINE";
      readonly ownerRef: OwnerRefV2;
      readonly schemaRef: StateArtifactRefV2;
      readonly material: JsonValueV2;
    };

export interface CandidateStateBindingV2 {
  readonly stateTargetRef: TargetRefV2;
  readonly stateSemanticRef: StateSemanticRefV2;
  readonly exactStateInstance: ExactStateInstanceV2;
}

export interface IntentBindingV2 {
  readonly originatorParticipationRef: string;
  readonly intentCategory: IntentCategoryV2;
  readonly intentTargetRef: TargetRefV2;
  readonly candidateStateBinding: CandidateStateBindingV2;
}

// Requested Action Types (C02)
export type IntentActionCompatibilityBindingV2 =
  | {
      readonly kind: "GOVERNED_SEMANTIC_CONTRACT";
      readonly exactCompatibilityContractRef: CompatibilityContractRefV2;
    }
  | {
      readonly kind: "OWNER_DETERMINATION";
      readonly ownerDeterminationBindingRef: string;
    };

export type AgencyRelianceV2 =
  | { readonly kind: "NO_DELEGATED_AGENCY_RELIANCE" }
  | {
      readonly kind: "DELEGATED_AGENCY_SINGLE";
      readonly agencyBindingRef: string;
    }
  | {
      readonly kind: "DELEGATED_AGENCY_COMPOSED";
      readonly agencyBindingRefs: readonly string[];
      readonly agencyCompositionBasisRef: AgencyBasisRefV2;
    };

export interface ActionPerformerBindingV2 {
  readonly performerKey: string;
  readonly actorParticipationRef: string;
  readonly agencyReliance: AgencyRelianceV2;
}

export interface ActionTargetBindingV2 {
  readonly targetSlotSemanticRef: TargetSlotSemanticRefV2;
  readonly targetRef: TargetRefV2;
}

export interface RequestedCapabilityClaimBindingV2 {
  readonly capabilityClaimKey: string;
  readonly requestedCapabilityRef: RequestedCapabilityRefV2;
  readonly claimantPerformerRefs: readonly string[];
}

export interface RequestedActionBindingV2 {
  readonly actionSemanticRef: ActionSemanticRefV2;
  readonly intentActionCompatibilityBinding: IntentActionCompatibilityBindingV2;
  readonly actionPerformerBindings: readonly ActionPerformerBindingV2[];
  readonly actionTargetBindings: readonly ActionTargetBindingV2[];
  readonly requestedCapabilityClaimBindings: readonly RequestedCapabilityClaimBindingV2[];
}

// Bound Constitutional State Types (C05)
export type NormalStateBindingKindV2 =
  | "IDENTITY_STATE"
  | "STANDING_STATE"
  | "AUTHORITY_STATE"
  | "CAPABILITY_STATE"
  | "AGENCY_STATE";

export type StateBindingV2 =
  | {
      readonly stateBindingKey: string;
      readonly kind: NormalStateBindingKindV2;
      readonly subjectRef: SubjectRefV2;
      readonly stateSemanticRef: StateSemanticRefV2;
      readonly exactStateRef: StateInstanceRefV2;
      readonly stateArtifactRef?: StateArtifactRefV2;
    }
  | {
      readonly stateBindingKey: string;
      readonly kind: "RELATIONSHIP_STATE";
      readonly relationshipKind: "STRUCTURAL";
      readonly sourceEndpointRef: ConstitutionalRefV2;
      readonly relationshipSemanticRef: RelationshipRefV2;
      readonly targetEndpointRef: ConstitutionalRefV2;
      readonly exactTopologyStateRef: StateInstanceRefV2;
    }
  | {
      readonly stateBindingKey: string;
      readonly kind: "RELATIONSHIP_STATE";
      readonly relationshipKind: "REIFIED";
      readonly relationshipRef: RelationshipRefV2;
      readonly exactStateRef: StateInstanceRefV2;
      readonly subjectRef?: SubjectRefV2;
      readonly stateSemanticRef?: StateSemanticRefV2;
      readonly stateArtifactRef?: StateArtifactRefV2;
    };

export interface StateViewV2 {
  readonly viewKey: string;
  readonly viewScope: ScopeRefV2;
  readonly stateBindings: readonly StateBindingV2[];
}

export interface BoundConstitutionalStateV2 {
  readonly semanticStateRef: SemanticStateRefV2;
  readonly stateViews: readonly StateViewV2[];
}

// Bound Evidence State Types
export interface EvidenceRequirementBindingV2 {
  readonly requirementKey: string;
  readonly governedRequirementRef: EvidenceRequirementRefV2;
  readonly requirementAuthorityBinding: OwnerRefV2;
  readonly requirementScopeBinding: ScopeRefV2;
}

export interface SuppliedEvidenceMaterialV2 {
  readonly materialKey: string;
  readonly evidenceRef: EvidenceRefV2;
  readonly ownerRef: OwnerRefV2;
  readonly schemaRef: StateArtifactRefV2;
  readonly material: JsonValueV2;
}

export interface EvidencePresentationBindingV2 {
  readonly evidenceRequirementRef: EvidenceRequirementRefV2;
  readonly presentedEvidenceRefs: readonly EvidenceRefV2[];
}

export interface IntegrityCoordinatesV2 {
  readonly coordinateKey: string;
  readonly evidenceRef: EvidenceRefV2;
  readonly expectedDigest: string;
  readonly algorithm: string;
}

export interface BoundEvidenceStateV2 {
  readonly evidenceStateRef: EvidenceStateRefV2;
  readonly evidenceRequirementBindings: readonly EvidenceRequirementBindingV2[];
  readonly suppliedEvidenceMaterial: readonly SuppliedEvidenceMaterialV2[];
  readonly evidencePresentationBindings: readonly EvidencePresentationBindingV2[];
  readonly integrityCoordinates: readonly IntegrityCoordinatesV2[];
}

// Bound Policy Universe Types (C06)
export interface PolicyDependencyEdgeV2 {
  readonly dependeePolicyRef: PolicyRefV2;
  readonly dependentPolicyRef: PolicyRefV2;
}

export interface PolicyDependencyTopologyV2 {
  readonly dependencyEdges: readonly PolicyDependencyEdgeV2[];
}

export interface BoundPolicyMaterialV2 {
  readonly policyKey: string;
  readonly policyRef: PolicyRefV2;
  readonly material: JsonValueV2;
}

export interface BoundPolicyUniverseV2 {
  readonly policyUniverseRef: PolicyUniverseRefV2;
  readonly applicablePolicyMaterial: readonly BoundPolicyMaterialV2[];
  readonly dependencyTopology: PolicyDependencyTopologyV2;
  readonly applicabilityProvenanceBinding: ProvenanceRefV2;
}

// Bound Evaluation Context Types (C03, C04)
export interface EvaluationContextBindingV2 {
  readonly bindingKey: string;
  readonly semanticRef: EvaluationSemanticRefV2;
  readonly value: JsonValueV2;
  readonly provenanceRef?: ProvenanceRefV2;
  readonly authorityRef?: OwnerRefV2;
}

export type TemporalCoordinateRefV2 =
  "tValid" | "tObservation" | "tEInput" | "tTrust";

export type QuestionOperandBindingV2 =
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "PARTICIPATION_BINDING";
      readonly roleBindingRef: string;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "ACTION_PERFORMER";
      readonly performerRef: string;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "REQUESTED_ACTION";
      readonly actionSemanticRef: ActionSemanticRefV2;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "ACTION_TARGET";
      readonly targetSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly targetRef: TargetRefV2;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "CAPABILITY_CLAIM";
      readonly capabilityClaimRef: string;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "CONSTITUTIONAL_STATE";
      readonly semanticStateRef: SemanticStateRefV2;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "EVIDENCE_STATE";
      readonly evidenceStateRef: EvidenceStateRefV2;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "POLICY_UNIVERSE";
      readonly policyUniverseRef: PolicyUniverseRefV2;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "EVALUATION_CONTEXT_BINDING";
      readonly bindingCollection:
        | "authorizedInputBindings"
        | "evaluationParameterBindings"
        | "boundContextBindings";
      readonly bindingRef: string;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "TEMPORAL_COORDINATE";
      readonly temporalCoordinateRef: TemporalCoordinateRefV2;
    }
  | {
      readonly operandKey: string;
      readonly operandSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly operandKind: "OWNER_DETERMINATION";
      readonly ownerDeterminationBindingRef: string;
    };

export interface DeterminationQuestionBindingV2 {
  readonly questionSemanticRef: QuestionSemanticRefV2;
  readonly questionOperandBindings: readonly QuestionOperandBindingV2[];
}

export type DeterminationDependencyDeclarationV2 =
  | { readonly kind: "AUTHORITATIVELY_NONE" }
  | {
      readonly kind: "EXPLICIT";
      readonly dependencyRefs: readonly string[];
    };

export interface OwnerDeterminationBindingV2 {
  readonly determinationBindingKey: string;
  readonly determinationQuestionBinding: DeterminationQuestionBindingV2;
  readonly constitutionalOwnerRef: OwnerRefV2;
  readonly ownerNativeResult: JsonValueV2;
  readonly exactStateRef: ConstitutionalRefV2;
  readonly exactRuleRef: RuleRefV2;
  readonly assessedAtCoordinateRef: TemporalCoordinateRefV2;
  readonly provenanceRef: ProvenanceRefV2;
  readonly determinationDependencyDeclaration: DeterminationDependencyDeclarationV2;
}

export interface BoundEvaluationContextV2 {
  readonly authorizedInputBindings: readonly EvaluationContextBindingV2[];
  readonly evaluationParameterBindings: readonly EvaluationContextBindingV2[];
  readonly boundContextBindings: readonly EvaluationContextBindingV2[];
  readonly ownerDeterminationBindings: readonly OwnerDeterminationBindingV2[];
}

// Execution Context V2
export interface TemporalCoordinatesV2 {
  readonly tValid?: string;
  readonly tObservation?: string;
  readonly tEInput: string;
  readonly tTrust?: string;
}

export interface ExecutionContextV2 {
  readonly executionId: string;
  readonly temporalCoordinates: TemporalCoordinatesV2;
  readonly budget: number;
  readonly entropy?: string;
}

// Top-Level Execution Request V2
export interface ExecutionRequestV2 {
  readonly contractVersion: "v2";
  readonly requestId: string;
  readonly participation: ParticipationV2;
  readonly intent: IntentBindingV2;
  readonly requestedAction: RequestedActionBindingV2;
  readonly constitutionalState: BoundConstitutionalStateV2;
  readonly evidenceState: BoundEvidenceStateV2;
  readonly policyUniverse: BoundPolicyUniverseV2;
  readonly evaluationContext: BoundEvaluationContextV2;
  readonly executionContext: ExecutionContextV2;
}
