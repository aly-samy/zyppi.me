import { createHash } from "node:crypto";
import { canonicalizeJcs } from "@zyppi/domain";
import type { CompositionManifest } from "./types.js";

/**
 * Derived Semantic Configuration Capability (SCC) Identity Projection per AMS-0860-A.
 * Contains strictly declarative identity-bearing semantic configuration definitions.
 * Excludes evaluation results, trust proofs, instance coordinates, and epistemic state.
 */
export interface SccIdentityProjection {
  readonly dtcReference: CompositionManifest["dtcReference"];
  readonly armProfileReference: CompositionManifest["armProfileReference"];
  readonly boundEpistemicRequirements: CompositionManifest["boundEpistemicRequirements"];
  readonly boundPrjSpecifications: CompositionManifest["boundPrjSpecifications"];
  readonly boundRsnBlueprints: CompositionManifest["boundRsnBlueprints"];
  readonly boundPolRequirements: CompositionManifest["boundPolRequirements"];
  readonly boundSecRequirements: CompositionManifest["boundSecRequirements"];
  readonly boundRiCapabilities: CompositionManifest["boundRiCapabilities"];
  readonly dependencyTopology: CompositionManifest["dependencyTopology"];
}

/**
 * Projects a validated CompositionManifest into its allowlisted SCC identity-bearing projection.
 * Strictly enforces inclusion of authorized semantic configuration fields and exclusion
 * of instance coordinates (manifestId, provenanceReferences) and evaluation/result layers
 * (boundCl16IntelligenceArtifacts, boundAttestationProofReferences, epistemicDivergence).
 *
 * Deterministically normalizes and sorts all array collections by complete stable semantic coordinates
 * per CORR-0860-A-1 §2 to guarantee permutation-invariant SCC identity.
 */
export function projectSccIdentity(
  manifest: CompositionManifest,
): SccIdentityProjection {
  const boundEpistemicRequirements = [...manifest.boundEpistemicRequirements]
    .map((r) => ({
      requirementId: r.requirementId,
      version: r.version,
    }))
    .sort(
      (a, b) =>
        a.requirementId.localeCompare(b.requirementId) ||
        a.version.localeCompare(b.version),
    );

  const boundPrjSpecifications = [...manifest.boundPrjSpecifications]
    .map((s) => ({
      specId: s.specId,
      version: s.version,
    }))
    .sort(
      (a, b) =>
        a.specId.localeCompare(b.specId) || a.version.localeCompare(b.version),
    );

  const boundRsnBlueprints = [...manifest.boundRsnBlueprints]
    .map((b) => ({
      blueprintId: b.blueprintId,
      version: b.version,
    }))
    .sort(
      (a, b) =>
        a.blueprintId.localeCompare(b.blueprintId) ||
        a.version.localeCompare(b.version),
    );

  const boundPolRequirements = [...manifest.boundPolRequirements]
    .map((p) => ({
      policyId: p.policyId,
      version: p.version,
    }))
    .sort(
      (a, b) =>
        a.policyId.localeCompare(b.policyId) ||
        a.version.localeCompare(b.version),
    );

  const boundSecRequirements = [...manifest.boundSecRequirements]
    .map((s) => ({
      securityReqId: s.securityReqId,
      version: s.version,
    }))
    .sort(
      (a, b) =>
        a.securityReqId.localeCompare(b.securityReqId) ||
        a.version.localeCompare(b.version),
    );

  const boundRiCapabilities = [...manifest.boundRiCapabilities]
    .map((c) => ({
      capabilityId: c.capabilityId,
      version: c.version,
    }))
    .sort(
      (a, b) =>
        a.capabilityId.localeCompare(b.capabilityId) ||
        a.version.localeCompare(b.version),
    );

  const nodes = Array.from(new Set(manifest.dependencyTopology.nodes)).sort();

  const edges = [...manifest.dependencyTopology.edges]
    .map((e) => ({
      from: e.from,
      to: e.to,
    }))
    .sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

  return {
    dtcReference: {
      dtcId: manifest.dtcReference.dtcId,
      version: manifest.dtcReference.version,
    },
    armProfileReference: {
      profileId: manifest.armProfileReference.profileId,
      version: manifest.armProfileReference.version,
    },
    boundEpistemicRequirements,
    boundPrjSpecifications,
    boundRsnBlueprints,
    boundPolRequirements,
    boundSecRequirements,
    boundRiCapabilities,
    dependencyTopology: {
      nodes,
      edges,
    },
  };
}

/**
 * Computes deterministic SCC identity (sha256:<hex>) for a validated CompositionManifest.
 * Must be called only from the successful composition validation / resolution path.
 */
export function deriveSccIdentityInternal(
  manifest: CompositionManifest,
): string {
  const projection = projectSccIdentity(manifest);
  const canonicalJson = canonicalizeJcs(projection);
  const hashHex = createHash("sha256")
    .update(canonicalJson, "utf8")
    .digest("hex");
  return `sha256:${hashHex}`;
}
