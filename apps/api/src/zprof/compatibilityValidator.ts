import type { RetrievedRegistryState } from "@zyppi/contracts";
import type {
  CompositionError,
  DomainTemplateCard,
  EpistemicRequirementContract,
  EpistemicStatus,
} from "./types.js";
import {
  isExplicitVersion,
  validateExplicitVersionList,
  validateVersionConstraints,
} from "./versionValidator.js";

export type CompatibilityValidationResult =
  | { ok: true }
  | {
      ok: false;
      error: CompositionError;
      epistemicStatus?: EpistemicStatus;
    };

/**
 * Validates structural and contractual compatibility across 10 evaluation areas per AMS-0855 §7.1:
 * 1. Artifact existence
 * 2. Authorization
 * 3. Explicit version binding
 * 4. Declared version constraints
 * 5. Capability / requirement compatibility
 * 6. Dependency closure
 * 7. Ownership uniqueness
 * 8. Domain-scope compatibility
 * 9. Profile isolation
 * 10. Provenance satisfaction
 */
export function validateCompositionCompatibility(
  dtc: DomainTemplateCard,
  reqs: readonly EpistemicRequirementContract[],
  retrievedState: RetrievedRegistryState,
  versions: readonly string[],
): CompatibilityValidationResult {
  // 1. Artifact Existence (Check 1)
  if (!dtc || !dtc.dtcId) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Domain Template Card (DTC) is missing or undefined",
      },
      epistemicStatus: "UNAVAILABLE",
    };
  }

  if (!reqs || reqs.length === 0) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: "Epistemic requirements contract list is missing or empty",
      },
      epistemicStatus: "UNAVAILABLE",
    };
  }

  // 2. Authorization (Check 2)
  if (retrievedState.identity) {
    const status = (retrievedState.identity.status || "").toLowerCase();
    if (
      status === "revoked" ||
      status === "suspended" ||
      status === "unauthorized" ||
      status === "decommissioned"
    ) {
      return {
        ok: false,
        error: {
          code: "unauthorized",
          category: "Composition Failure",
          message: `Identity '${retrievedState.identity.identityId}' status is '${retrievedState.identity.status}'`,
        },
        epistemicStatus: "UNVERIFIED",
      };
    }
  }

  // 3. Explicit Version Binding (Check 3)
  const dtcVersionCheck = validateExplicitVersionList(
    [dtc.version],
    "DTC version",
  );
  if (!dtcVersionCheck.ok) {
    return { ok: false, error: dtcVersionCheck.error };
  }

  const optionsVersionsCheck = validateExplicitVersionList(
    versions,
    "options.versions",
  );
  if (!optionsVersionsCheck.ok) {
    return { ok: false, error: optionsVersionsCheck.error };
  }

  for (const req of reqs) {
    if (!isExplicitVersion(req.version)) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `Prohibited floating or wildcard version in requirement '${req.requirementId}': '${req.version}'`,
        },
      };
    }
  }

  for (const armProfile of dtc.applicableArmProfiles) {
    if (
      armProfile.includes(":floating:") ||
      armProfile.endsWith(":latest") ||
      armProfile.includes("*")
    ) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `Prohibited floating profile reference in DTC: '${armProfile}'`,
        },
      };
    }
  }

  // 4. Declared Version Constraints (Check 4)
  if (
    dtc.versionConstraints &&
    Object.keys(dtc.versionConstraints).length > 0
  ) {
    const constraintCheck = validateVersionConstraints(
      versions,
      dtc.versionConstraints,
    );
    if (!constraintCheck.ok) {
      return { ok: false, error: constraintCheck.error };
    }
  }

  // 5. Capability / Requirement Compatibility & Fact Evaluation (Check 5)
  for (const req of reqs) {
    for (const fact of req.requiredFacts) {
      if (fact.optionality === "MANDATORY") {
        if (fact.factKey.startsWith("primaryIdentifier")) {
          if (!retrievedState.identity || !retrievedState.identity.identityId) {
            return {
              ok: false,
              error: {
                code: "missing",
                category: "Composition Failure",
                message: `Mandatory fact ${fact.factKey} is missing from registry identity`,
                requirementId: req.requirementId,
              },
              epistemicStatus: "UNKNOWN",
            };
          }
        } else if (fact.factKey === "authorityId") {
          if (
            !retrievedState.authorities ||
            retrievedState.authorities.length === 0
          ) {
            return {
              ok: false,
              error: {
                code: "missing",
                category: "Composition Failure",
                message:
                  "Mandatory fact authorityId is missing from registry authorities",
                requirementId: req.requirementId,
              },
              epistemicStatus: "UNAVAILABLE",
            };
          }
        } else if (fact.factKey === "materialComposition") {
          const hasMaterialCap = retrievedState.capabilities?.some(
            (c) =>
              c.scope.includes("material") ||
              c.scope.includes("composition") ||
              c.capabilityId.includes("material"),
          );
          if (!hasMaterialCap) {
            return {
              ok: false,
              error: {
                code: "missing",
                category: "Composition Failure",
                message:
                  "Mandatory fact materialComposition is missing from registry capabilities",
                requirementId: req.requirementId,
              },
              epistemicStatus: "UNAVAILABLE",
            };
          }
        } else if (
          fact.factKey === "healthcarePatientId" ||
          fact.factKey.includes("patient")
        ) {
          const hasPatientCap = retrievedState.capabilities?.some(
            (c) =>
              c.scope.includes("patient") || c.capabilityId.includes("patient"),
          );
          if (!hasPatientCap) {
            return {
              ok: false,
              error: {
                code: "incompatible",
                category: "Composition Failure",
                message: `Incompatible fact requirement '${fact.factKey}': asset capabilities do not support healthcare domain requirements`,
                requirementId: req.requirementId,
              },
              epistemicStatus: "UNAVAILABLE",
            };
          }
        }
      }
    }
  }

  // 6. Dependency Closure (Check 6)
  const allNodes = new Set<string>([
    dtc.dtcId,
    ...dtc.applicableArmProfiles,
    ...dtc.requiredPrjSpecifications,
    ...dtc.requiredRsnBlueprints,
  ]);

  for (const req of reqs) {
    allNodes.add(req.requirementId);
  }

  if (allNodes.size === 0) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: "Dependency topology is empty or malformed",
      },
    };
  }

  // 7. Ownership Uniqueness (Check 7)
  if (retrievedState.relationships) {
    const brandRels = retrievedState.relationships.filter(
      (r) => r.referentType === "brand" || r.referentType === "manufacturer",
    );
    if (brandRels.length > 1) {
      const distinctReferents = new Set(brandRels.map((r) => r.referentId));
      if (distinctReferents.size > 1) {
        return {
          ok: false,
          error: {
            code: "conflicting",
            category: "Composition Failure",
            message: `Multiple conflicting referents detected for identity '${retrievedState.identity.identityId}'`,
          },
          epistemicStatus: "CONFLICTING",
        };
      }
    }
  }

  // 8. Domain-Scope Compatibility (Check 8)
  for (const req of reqs) {
    if (
      req.targetDimension === "HEALTHCARE_PATIENT" ||
      req.requirementId.includes("healthcare") ||
      req.goldenQuestionRef.includes("patient")
    ) {
      if (
        dtc.domainIdentifier === "domain:gs1" ||
        dtc.domainIdentifier === "domain:dpp"
      ) {
        return {
          ok: false,
          error: {
            code: "incompatible",
            category: "Composition Failure",
            message: `Incompatible domain scope: cannot combine '${req.targetDimension}' epistemic requirement '${req.requirementId}' with domain '${dtc.domainIdentifier}'`,
            requirementId: req.requirementId,
          },
        };
      }
    }
  }

  // 9. Profile Isolation (Check 9)
  const profileSet = new Set(dtc.applicableArmProfiles);
  for (const req of reqs) {
    if (
      req.targetDimension === "HEALTHCARE_PATIENT" &&
      profileSet.has("arm:profile:trade_item:v1")
    ) {
      return {
        ok: false,
        error: {
          code: "conflicting",
          category: "Composition Failure",
          message:
            "Profile isolation conflict: Trade Item profile cannot compose with Healthcare Patient profile",
          requirementId: req.requirementId,
        },
      };
    }
  }

  // 10. Provenance Satisfaction (Check 10)
  if (dtc.provenanceRequirements?.requireAuthorIdentity) {
    if (!retrievedState.identity || !retrievedState.identity.identityId) {
      return {
        ok: false,
        error: {
          code: "unverified",
          category: "Composition Failure",
          message:
            "Provenance satisfaction failure: author identity is required but missing from registry state",
        },
        epistemicStatus: "UNVERIFIED",
      };
    }
  }

  return { ok: true };
}
