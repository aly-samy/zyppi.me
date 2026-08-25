export type ConstitutionalRefFamilyV2 =
  | "SUBJECT"
  | "ACTION_SEMANTIC"
  | "TARGET"
  | "STATE_SEMANTIC"
  | "STATE_INSTANCE"
  | "REQUESTED_CAPABILITY"
  | "AGENCY_BASIS"
  | "POLICY"
  | "EVIDENCE"
  | "QUESTION_SEMANTIC"
  | "TARGET_SLOT_SEMANTIC"
  | "COMPATIBILITY_CONTRACT"
  | "EVIDENCE_REQUIREMENT"
  | "SCOPE"
  | "RULE"
  | "PROVENANCE"
  | "OWNER"
  | "RELATIONSHIP"
  | "STATE_ARTIFACT"
  | "EVALUATION_SEMANTIC";

export interface ConstitutionalRefBaseV2<
  F extends ConstitutionalRefFamilyV2 = ConstitutionalRefFamilyV2,
> {
  readonly family: F;
  readonly ownerRef: string;
  readonly artifactId: string;
  readonly version?: string;
  readonly stateRef?: string;
  readonly provenanceRef?: string;
}

export type SubjectRefV2 = ConstitutionalRefBaseV2<"SUBJECT">;
export type ActionSemanticRefV2 = ConstitutionalRefBaseV2<"ACTION_SEMANTIC">;
export type TargetRefV2 = ConstitutionalRefBaseV2<"TARGET">;
export type StateSemanticRefV2 = ConstitutionalRefBaseV2<"STATE_SEMANTIC">;
export type StateInstanceRefV2 = ConstitutionalRefBaseV2<"STATE_INSTANCE">;
export type RequestedCapabilityRefV2 =
  ConstitutionalRefBaseV2<"REQUESTED_CAPABILITY">;
export type AgencyBasisRefV2 = ConstitutionalRefBaseV2<"AGENCY_BASIS">;
export type PolicyRefV2 = ConstitutionalRefBaseV2<"POLICY">;
export type EvidenceRefV2 = ConstitutionalRefBaseV2<"EVIDENCE">;
export type QuestionSemanticRefV2 =
  ConstitutionalRefBaseV2<"QUESTION_SEMANTIC">;
export type TargetSlotSemanticRefV2 =
  ConstitutionalRefBaseV2<"TARGET_SLOT_SEMANTIC">;
export type CompatibilityContractRefV2 =
  ConstitutionalRefBaseV2<"COMPATIBILITY_CONTRACT">;
export type EvidenceRequirementRefV2 =
  ConstitutionalRefBaseV2<"EVIDENCE_REQUIREMENT">;
export type ScopeRefV2 = ConstitutionalRefBaseV2<"SCOPE">;
export type RuleRefV2 = ConstitutionalRefBaseV2<"RULE">;
export type ProvenanceRefV2 = ConstitutionalRefBaseV2<"PROVENANCE">;
export type OwnerRefV2 = ConstitutionalRefBaseV2<"OWNER">;
export type RelationshipRefV2 = ConstitutionalRefBaseV2<"RELATIONSHIP">;
export type StateArtifactRefV2 = ConstitutionalRefBaseV2<"STATE_ARTIFACT">;
export type EvaluationSemanticRefV2 =
  ConstitutionalRefBaseV2<"EVALUATION_SEMANTIC">;

export type ConstitutionalRefV2 =
  | SubjectRefV2
  | ActionSemanticRefV2
  | TargetRefV2
  | StateSemanticRefV2
  | StateInstanceRefV2
  | RequestedCapabilityRefV2
  | AgencyBasisRefV2
  | PolicyRefV2
  | EvidenceRefV2
  | QuestionSemanticRefV2
  | TargetSlotSemanticRefV2
  | CompatibilityContractRefV2
  | EvidenceRequirementRefV2
  | ScopeRefV2
  | RuleRefV2
  | ProvenanceRefV2
  | OwnerRefV2
  | RelationshipRefV2
  | StateArtifactRefV2
  | EvaluationSemanticRefV2;
