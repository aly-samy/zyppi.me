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
 */
export function projectSccIdentity(
  manifest: CompositionManifest,
): SccIdentityProjection {
  return {
    dtcReference: {
      dtcId: manifest.dtcReference.dtcId,
      version: manifest.dtcReference.version,
    },
    armProfileReference: {
      profileId: manifest.armProfileReference.profileId,
      version: manifest.armProfileReference.version,
    },
    boundEpistemicRequirements: manifest.boundEpistemicRequirements.map(
      (r) => ({
        requirementId: r.requirementId,
        version: r.version,
      }),
    ),
    boundPrjSpecifications: manifest.boundPrjSpecifications.map((s) => ({
      specId: s.specId,
      version: s.version,
    })),
    boundRsnBlueprints: manifest.boundRsnBlueprints.map((b) => ({
      blueprintId: b.blueprintId,
      version: b.version,
    })),
    boundPolRequirements: manifest.boundPolRequirements.map((p) => ({
      policyId: p.policyId,
      version: p.version,
    })),
    boundSecRequirements: manifest.boundSecRequirements.map((s) => ({
      securityReqId: s.securityReqId,
      version: s.version,
    })),
    boundRiCapabilities: manifest.boundRiCapabilities.map((c) => ({
      capabilityId: c.capabilityId,
      version: c.version,
    })),
    dependencyTopology: {
      nodes: [...manifest.dependencyTopology.nodes],
      edges: manifest.dependencyTopology.edges.map((e) => ({
        from: e.from,
        to: e.to,
      })),
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
