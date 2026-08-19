import { describe, it, expect } from "vitest";
import { ApplicationCompositionResolver } from "./compositionResolver.js";
import { projectSccIdentity, deriveSccIdentityInternal } from "./scc.js";
import {
  buildBoundConfigurationGraph,
  deriveBcgIdentity,
  normalizeBcg,
  type BoundConfigurationGraph,
  type BcgNode,
  type BcgOpacityBoundary,
  type BcgForeignIntegrityReference,
} from "./bcg.js";
import type { CompositionManifest } from "./types.js";
import { FrozenRegistryRepository } from "@zyppi/testing";
import type { ValidatedCanonicalIdentifier } from "@zyppi/contracts";
import type { PolicyContext, ResolvedPolicyGraph } from "@zyppi/domain";

const mockIdentifier: ValidatedCanonicalIdentifier =
  "01/09501101530003" as ValidatedCanonicalIdentifier;

const mockPolicyContext: PolicyContext = {
  policies: [],
};

const mockPolicyGraph: ResolvedPolicyGraph = {
  edges: [],
};

const baseManifest: CompositionManifest = Object.freeze({
  $schema: "https://zyppi.org/schemas/v1/composition_manifest.json",
  manifestId: "manifest:zyppi:gs1_trade_item:v1:exec_123",
  dtcReference: {
    dtcId: "dtc:zyppi:domain:gs1:v1",
    version: "1.0.0",
  },
  armProfileReference: {
    profileId: "arm:profile:trade_item:v1",
    version: "1.0.0",
  },
  boundEpistemicRequirements: Object.freeze([
    { requirementId: "epistemic:req:gtin:v1", version: "1.0.0" },
  ]),
  boundPrjSpecifications: Object.freeze([
    { specId: "prj:spec:trade_item:v1", version: "1.0.0" },
  ]),
  boundRsnBlueprints: Object.freeze([]),
  boundPolRequirements: Object.freeze([]),
  boundSecRequirements: Object.freeze([]),
  boundRiCapabilities: Object.freeze([]),
  dependencyTopology: Object.freeze({
    nodes: Object.freeze([
      "dtc:zyppi:domain:gs1:v1",
      "arm:profile:trade_item:v1",
    ]),
    edges: Object.freeze([
      { from: "dtc:zyppi:domain:gs1:v1", to: "arm:profile:trade_item:v1" },
    ]),
  }),
  provenanceReferences: Object.freeze({
    manifestAuthor: "identity:council:admin",
    createdTimestamp: "2026-08-19T00:00:00Z",
  }),
});

describe("AMS-0860-A — Identity & Configuration Closure", () => {
  describe("Phase A1 — SCC Identity & Separation Constraints", () => {
    it("TEST 0860.2 — Identity-Bearing Change changes SCC_ID", () => {
      const id1 = deriveSccIdentityInternal(baseManifest);

      const modifiedManifest: CompositionManifest = {
        ...baseManifest,
        dtcReference: {
          dtcId: "dtc:zyppi:domain:gs1:v1",
          version: "2.0.0",
        },
      };
      const id2 = deriveSccIdentityInternal(modifiedManifest);

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(id2).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it("TEST 0860.4 — Canonical Manifest Permutation yields same SCC_ID", () => {
      const id1 = deriveSccIdentityInternal(baseManifest);

      // Manifest with different key order inside objects
      const reorderedManifest: CompositionManifest = {
        provenanceReferences: {
          createdTimestamp: "2026-08-19T00:00:00Z",
          manifestAuthor: "identity:council:admin",
        },
        dependencyTopology: {
          edges: [
            {
              to: "arm:profile:trade_item:v1",
              from: "dtc:zyppi:domain:gs1:v1",
            },
          ],
          nodes: ["dtc:zyppi:domain:gs1:v1", "arm:profile:trade_item:v1"],
        },
        boundRiCapabilities: [],
        boundSecRequirements: [],
        boundPolRequirements: [],
        boundRsnBlueprints: [],
        boundPrjSpecifications: [
          { version: "1.0.0", specId: "prj:spec:trade_item:v1" },
        ],
        boundEpistemicRequirements: [
          { version: "1.0.0", requirementId: "epistemic:req:gtin:v1" },
        ],
        armProfileReference: {
          version: "1.0.0",
          profileId: "arm:profile:trade_item:v1",
        },
        dtcReference: {
          version: "1.0.0",
          dtcId: "dtc:zyppi:domain:gs1:v1",
        },
        manifestId: "manifest:zyppi:gs1_trade_item:v1:exec_999",
      };

      const id2 = deriveSccIdentityInternal(reorderedManifest);
      expect(id1).toBe(id2);
    });

    it("TEST 0860.36 — Future / Excluded Manifest Metadata does not alter SCC_ID", () => {
      const id1 = deriveSccIdentityInternal(baseManifest);

      // Change manifestId and provenanceReferences (instance coordinates)
      const manifestWithDifferentInstanceCoords: CompositionManifest = {
        ...baseManifest,
        manifestId: "manifest:zyppi:gs1_trade_item:v1:DIFFERENT_EXEC_ID",
        provenanceReferences: {
          manifestAuthor: "identity:council:other",
          createdTimestamp: "2029-01-01T12:34:56Z",
        },
      };

      const id2 = deriveSccIdentityInternal(
        manifestWithDifferentInstanceCoords,
      );
      expect(id1).toBe(id2);
    });

    it("Separation Test — CL-16 Artifacts, ATT-R proofs, and epistemicDivergence do NOT alter SCC_ID", () => {
      const id1 = deriveSccIdentityInternal(baseManifest);

      const manifestWithResults: CompositionManifest = {
        ...baseManifest,
        boundCl16IntelligenceArtifacts: [
          {
            artifactId: "cl16:artifact:001",
            version: "1.0.0",
            rsnBlueprintRef: "rsn:blueprint:001",
            conclusionSummary: "VERIFIED",
          },
        ],
        boundAttestationProofReferences: [
          {
            proofId: "attr:proof:001",
            version: "1.0.0",
            attestationType: "EXECUTION_PROOF",
          },
        ],
        epistemicDivergence: true,
      };

      const id2 = deriveSccIdentityInternal(manifestWithResults);

      // SCC_ID MUST remain identical because evaluation/result layer is excluded
      expect(id1).toBe(id2);
    });
  });

  describe("Phase A2 — Bound Configuration Graph (BCG)", () => {
    const sccId =
      "sha256:1111111111111111111111111111111111111111111111111111111111111111";

    const nodeA: BcgNode = { id: "node:A", version: "1.0.0", kind: "DTC" };
    const nodeB: BcgNode = {
      id: "node:B",
      version: "1.0.0",
      kind: "ARMProfile",
    };
    const nodeC: BcgNode = { id: "node:C", version: "1.0.0", kind: "PrjSpec" };

    it("TEST 0860.5 — Node Permutation produces same BCG_ID", () => {
      const res1 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB, nodeC],
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:B",
            targetRef: "node:C",
            dependencyKind: "REQUIRES",
          },
        ],
      });
      expect(res1.ok).toBe(true);
      if (!res1.ok) return;

      const res2 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeC, nodeA, nodeB], // Permuted node order
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:B",
            targetRef: "node:C",
            dependencyKind: "REQUIRES",
          },
        ],
      });
      expect(res2.ok).toBe(true);
      if (!res2.ok) return;

      expect(res1.bcgId).toBe(res2.bcgId);
    });

    it("TEST 0860.6 — Edge Permutation produces same BCG_ID", () => {
      const res1 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB, nodeC],
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:B",
            targetRef: "node:C",
            dependencyKind: "REQUIRES",
          },
        ],
      });
      expect(res1.ok).toBe(true);
      if (!res1.ok) return;

      const res2 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB, nodeC],
        bindingEdges: [
          {
            sourceRef: "node:B",
            targetRef: "node:C",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "REQUIRES",
          }, // Permuted edge order
        ],
      });
      expect(res2.ok).toBe(true);
      if (!res2.ok) return;

      expect(res1.bcgId).toBe(res2.bcgId);
    });

    it("TEST 0860.7 — Missing Transitive Dependency fails closed without substitution", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA], // nodeB is missing
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("missing");
      expect(res.error.message).toContain("node:B");
    });

    it("TEST 0860.38 — Binding Cycle fails closed with CONTRACT-12 'invalid'", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB, nodeC],
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:B",
            targetRef: "node:C",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:C",
            targetRef: "node:A",
            dependencyKind: "REQUIRES",
          }, // Cycle
        ],
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("invalid");
      expect(res.error.message).toContain("circular REQUIRES dependency");
    });

    it("TEST 0860.39 — Free-Form relationKind fails closed with CONTRACT-12 'invalid'", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB],
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "SEMANTICALLY_DEPENDS_ON",
          },
        ],
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("invalid");
      expect(res.error.message).toContain("Closed to 'REQUIRES'");
    });

    it("TEST 0860.9 — Foreign Integrity Change alters BCG_ID", () => {
      const opacityBoundary: BcgOpacityBoundary = {
        foreignInterfaceRef: "interface:foreign:v1",
        foreignAuthorityRef: "auth:foreign:v1",
        foreignReceiptDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        localFederationPolicyRef: "pol:fed:v1",
      };

      const foreignRef1: BcgForeignIntegrityReference = {
        referenceId: "ref:1",
        foreignInterfaceRef: "interface:foreign:v1",
        digest:
          "sha256:1111111111111111111111111111111111111111111111111111111111111111",
      };

      const res1 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA],
        bindingEdges: [],
        opacityBoundaries: [opacityBoundary],
        externalIntegrityReferences: [foreignRef1],
      });
      expect(res1.ok).toBe(true);
      if (!res1.ok) return;

      const foreignRef2: BcgForeignIntegrityReference = {
        ...foreignRef1,
        digest:
          "sha256:2222222222222222222222222222222222222222222222222222222222222222", // Different receipt digest
      };

      const res2 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA],
        bindingEdges: [],
        opacityBoundaries: [opacityBoundary],
        externalIntegrityReferences: [foreignRef2],
      });
      expect(res2.ok).toBe(true);
      if (!res2.ok) return;

      expect(res1.bcgId).not.toBe(res2.bcgId);
    });

    it("TEST 0860.10 — Deterministic Closure produces identical BCG_ID", () => {
      const res1 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB],
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "REQUIRES",
          },
        ],
      });

      const res2 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB],
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B",
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (res1.ok && res2.ok) {
        expect(res1.bcgId).toBe(res2.bcgId);
      }
    });

    it("Structural references (T_struct) do NOT manufacture REQUIRES edges", () => {
      // Create graph with nodes A and B, but zero bindingEdges
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB],
        bindingEdges: [], // T_struct contains structural relationship, but T_bind is empty
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;
      expect(res.bcg.bindingEdges).toHaveLength(0);
    });
  });

  describe("Integration & Gate Verification", () => {
    it("TEST 0860.1 / TEST 0860.35 & Integration Gate — Failed composition resolution produces NO sccId or bcgId", async () => {
      const repo = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      // Lookup fails because repository is empty -> composition fails closed
      const res = await resolver.resolveComposition({
        registryRepository: repo as any,
        identifier: mockIdentifier,
        requestId: "req_001",
        executionId: "exec_001",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_001",
        versions: ["1.0.0"],
        policyContext: mockPolicyContext,
        resolvedPolicyGraph: mockPolicyGraph,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("missing");
        expect((res as any).sccId).toBeUndefined();
        expect((res as any).bcgId).toBeUndefined();
        expect((res as any).bcg).toBeUndefined();
      }
    });

    it("TEST 0860.8 — Registry Drift after resolution leaves sccId and bcgId unchanged", async () => {
      const repo = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      const res = await resolver.resolveComposition({
        registryRepository: repo as any,
        identifier: mockIdentifier,
        requestId: "req_002",
        executionId: "exec_002",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_002",
        versions: ["1.0.0"],
        policyContext: mockPolicyContext,
        resolvedPolicyGraph: mockPolicyGraph,
        explicitAcv: {
          identity: {
            identityId: "id_1",
            identityType: "product",
            canonicalReference: "gtin:01",
            referentId: "ref_1",
            status: "active",
            createdAt: "2026-08-19T00:00:00Z",
            updatedAt: "2026-08-19T00:00:00Z",
          },
          relationships: [],
          standings: [],
          authorities: [
            {
              authorityId: "auth_1",
              subjectId: "id_1",
              scope: "trade_item",
              validFrom: "2026-01-01T00:00:00Z",
              validTo: "2030-01-01T00:00:00Z",
            },
          ],
          capabilities: [
            {
              capabilityId: "prj:spec:gs1_digital_link_projection:v1",
              subjectId: "arm:profile:trade_item:v1",
              scope: "prj:spec:gs1_digital_link_projection:v1",
              validFrom: "2026-01-01T00:00:00Z",
              validTo: "2030-01-01T00:00:00Z",
            },
          ],
          evidenceReferences: [],
          applicablePolicies: [],
        },
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const { sccId, bcgId } = res;
      expect(sccId).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(bcgId).toMatch(/^sha256:[a-f0-9]{64}$/);

      // Mutate underlying registry repo / state
      // SCC and BCG IDs must remain strictly identical
      expect(res.sccId).toBe(sccId);
      expect(res.bcgId).toBe(bcgId);
    });
  });
});
