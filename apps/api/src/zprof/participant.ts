import type { CompositionManifest, CompositionError } from "./types.js";
import { validateExplicitVersionList } from "./versionValidator.js";

/**
 * Closed vocabulary of governed participant kinds per AMS-0858 §4.1 / §5.
 */
export type ParticipantKind =
  | "DTC"
  | "ARM_PROFILE"
  | "EPISTEMIC_REQUIREMENT"
  | "PRJ_SPECIFICATION"
  | "RSN_BLUEPRINT"
  | "POL_REQUIREMENT"
  | "SEC_REQUIREMENT"
  | "RI_CAPABILITY"
  | "CL16_INTELLIGENCE"
  | "ATTR_PROOF";

/**
 * Closed vocabulary of composition roles derived from CompositionManifest references.
 */
export type ParticipantRole =
  | "domain_template"
  | "asset_profile"
  | "epistemic_requirement"
  | "prj_specification"
  | "rsn_blueprint"
  | "pol_requirement"
  | "sec_requirement"
  | "ri_capability"
  | "cl16_intelligence"
  | "attr_proof";

/**
 * Governed Participant abstraction in P per AMS-0858 §4.1 / §5.
 */
export interface Participant {
  readonly identity: string;
  readonly kind: ParticipantKind;
  readonly version: string;
  readonly owner: string;
  readonly role: ParticipantRole;
  readonly reference: {
    readonly id: string;
    readonly version: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
  };
}

export type ParticipantValidationResult =
  | { readonly ok: true; readonly participants: readonly Participant[] }
  | { readonly ok: false; readonly error: CompositionError };

/**
 * Validates a single Participant against constraints P-001 through P-005, P-009, P-010.
 */
export function validateParticipant(
  p: Participant,
): { readonly ok: true } | { readonly ok: false; readonly error: CompositionError } {
  // P-001: Explicit Identity
  if (!p.identity || typeof p.identity !== "string" || p.identity.trim() === "") {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: "Participant missing explicit identity",
      },
    };
  }
  if (
    p.identity.includes("*") ||
    p.identity.includes("latest") ||
    p.identity.includes("?")
  ) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Participant identity '${p.identity}' contains wildcard or floating identifier`,
      },
    };
  }

  // P-002: Explicit Kind
  const validKinds: readonly ParticipantKind[] = [
    "DTC",
    "ARM_PROFILE",
    "EPISTEMIC_REQUIREMENT",
    "PRJ_SPECIFICATION",
    "RSN_BLUEPRINT",
    "POL_REQUIREMENT",
    "SEC_REQUIREMENT",
    "RI_CAPABILITY",
    "CL16_INTELLIGENCE",
    "ATTR_PROOF",
  ];
  if (!p.kind || !validKinds.includes(p.kind)) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Participant '${p.identity}' has invalid or missing kind '${p.kind}'`,
      },
    };
  }

  // P-003: Explicit Version
  if (!p.version || typeof p.version !== "string") {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Participant '${p.identity}' missing explicit version`,
      },
    };
  }
  const verCheck = validateExplicitVersionList([p.version], `Participant '${p.identity}' version`);
  if (!verCheck.ok) {
    return { ok: false, error: verCheck.error };
  }

  // P-004: Unambiguous Ownership
  if (!p.owner || typeof p.owner !== "string" || p.owner.trim() === "") {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Participant '${p.identity}' has missing or ambiguous owner`,
      },
    };
  }

  // P-005: Declared Composition Role
  const validRoles: readonly ParticipantRole[] = [
    "domain_template",
    "asset_profile",
    "epistemic_requirement",
    "prj_specification",
    "rsn_blueprint",
    "pol_requirement",
    "sec_requirement",
    "ri_capability",
    "cl16_intelligence",
    "attr_proof",
  ];
  if (!p.role || !validRoles.includes(p.role)) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Participant '${p.identity}' has invalid declared role '${p.role}'`,
      },
    };
  }

  // P-009 / P-010: Declarative Purity & Reference Integrity
  if (!p.reference || typeof p.reference.id !== "string" || !p.reference.id) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Participant '${p.identity}' missing valid reference`,
      },
    };
  }

  return { ok: true };
}

/**
 * Validates a collection P of participants against constraints P-001 through P-010.
 */
export function validateParticipantCollection(
  participants: readonly Participant[],
): ParticipantValidationResult {
  if (!participants || participants.length === 0) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: "Participant collection P must contain at least one participant",
      },
    };
  }

  const seenIdentities = new Map<string, ParticipantRole>();

  for (const p of participants) {
    const singleCheck = validateParticipant(p);
    if (!singleCheck.ok) {
      return singleCheck;
    }

    // P-007: Structural Uniqueness (same identity cannot occur unless explicitly permitted with distinct roles)
    if (seenIdentities.has(p.identity)) {
      const existingRole = seenIdentities.get(p.identity);
      if (existingRole === p.role) {
        return {
          ok: false,
          error: {
            code: "conflicting",
            category: "Composition Failure",
            message: `Duplicate participant identity '${p.identity}' with same role '${p.role}'`,
          },
        };
      }
    }
    seenIdentities.set(p.identity, p.role);
  }

  return { ok: true, participants: Object.freeze([...participants]) };
}

/**
 * Extracts and constructs the formal participant collection P from a CompositionManifest.
 */
export function extractParticipantsFromManifest(
  manifest: CompositionManifest,
  defaultOwner = "identity:council:admin",
): ParticipantValidationResult {
  const participants: Participant[] = [];

  // 1. DTC Participant
  if (manifest.dtcReference) {
    participants.push({
      identity: manifest.dtcReference.dtcId,
      kind: "DTC",
      version: manifest.dtcReference.version,
      owner: defaultOwner,
      role: "domain_template",
      reference: {
        id: manifest.dtcReference.dtcId,
        version: manifest.dtcReference.version,
      },
    });
  }

  // 2. ARM Profile Participant
  if (manifest.armProfileReference) {
    participants.push({
      identity: manifest.armProfileReference.profileId,
      kind: "ARM_PROFILE",
      version: manifest.armProfileReference.version,
      owner: defaultOwner,
      role: "asset_profile",
      reference: {
        id: manifest.armProfileReference.profileId,
        version: manifest.armProfileReference.version,
      },
    });
  }

  // 3. Epistemic Requirements
  for (const ref of manifest.boundEpistemicRequirements || []) {
    participants.push({
      identity: ref.requirementId,
      kind: "EPISTEMIC_REQUIREMENT",
      version: ref.version,
      owner: defaultOwner,
      role: "epistemic_requirement",
      reference: {
        id: ref.requirementId,
        version: ref.version,
      },
    });
  }

  // 4. PRJ Specifications
  for (const ref of manifest.boundPrjSpecifications || []) {
    participants.push({
      identity: ref.specId,
      kind: "PRJ_SPECIFICATION",
      version: ref.version,
      owner: defaultOwner,
      role: "prj_specification",
      reference: {
        id: ref.specId,
        version: ref.version,
      },
    });
  }

  // 5. RSN Blueprints
  for (const ref of manifest.boundRsnBlueprints || []) {
    participants.push({
      identity: ref.blueprintId,
      kind: "RSN_BLUEPRINT",
      version: ref.version,
      owner: defaultOwner,
      role: "rsn_blueprint",
      reference: {
        id: ref.blueprintId,
        version: ref.version,
      },
    });
  }

  // 6. POL Requirements
  for (const ref of manifest.boundPolRequirements || []) {
    participants.push({
      identity: ref.policyId,
      kind: "POL_REQUIREMENT",
      version: ref.version,
      owner: defaultOwner,
      role: "pol_requirement",
      reference: {
        id: ref.policyId,
        version: ref.version,
      },
    });
  }

  // 7. SEC Requirements
  for (const ref of manifest.boundSecRequirements || []) {
    participants.push({
      identity: ref.securityReqId,
      kind: "SEC_REQUIREMENT",
      version: ref.version,
      owner: defaultOwner,
      role: "sec_requirement",
      reference: {
        id: ref.securityReqId,
        version: ref.version,
      },
    });
  }

  // 8. RI Capabilities
  for (const ref of manifest.boundRiCapabilities || []) {
    participants.push({
      identity: ref.capabilityId,
      kind: "RI_CAPABILITY",
      version: ref.version,
      owner: defaultOwner,
      role: "ri_capability",
      reference: {
        id: ref.capabilityId,
        version: ref.version,
      },
    });
  }

  // 9. CL-16 Intelligence Artifacts
  for (const ref of manifest.boundCl16IntelligenceArtifacts || []) {
    participants.push({
      identity: ref.artifactId,
      kind: "CL16_INTELLIGENCE",
      version: ref.version,
      owner: defaultOwner,
      role: "cl16_intelligence",
      reference: {
        id: ref.artifactId,
        version: ref.version,
        metadata: { rsnBlueprintRef: ref.rsnBlueprintRef },
      },
    });
  }

  // 10. ATT-R Proof References
  for (const ref of manifest.boundAttestationProofReferences || []) {
    participants.push({
      identity: ref.proofId,
      kind: "ATTR_PROOF",
      version: ref.version,
      owner: defaultOwner,
      role: "attr_proof",
      reference: {
        id: ref.proofId,
        version: ref.version,
        metadata: { attestationType: ref.attestationType },
      },
    });
  }

  return validateParticipantCollection(participants);
}
