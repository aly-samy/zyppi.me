import { describe, it, expect } from "vitest";
import { ApplicationCompositionResolver } from "./compositionResolver.js";
import { deriveSccIdentityInternal } from "./scc.js";
import {
  buildBoundConfigurationGraph,
  type BcgNode,
  type BcgOpacityBoundary,
  type BcgForeignIntegrityReference,
} from "./bcg.js";
import type { CompositionManifest } from "./types.js";
import { FrozenRegistryRepository } from "@zyppi/testing";
import type {
  RegistryRepository,
  ValidatedCanonicalIdentifier,
} from "@zyppi/contracts";
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
    { requirementId: "epistemic:req:brand_owner:v1", version: "1.0.0" },
  ]),
  boundPrjSpecifications: Object.freeze([
    { specId: "prj:spec:trade_item:v1", version: "1.0.0" },
    { specId: "prj:spec:digital_link:v1", version: "1.0.0" },
  ]),
  boundRsnBlueprints: Object.freeze([]),
  boundPolRequirements: Object.freeze([]),
  boundSecRequirements: Object.freeze([]),
  boundRiCapabilities: Object.freeze([]),
  dependencyTopology: Object.freeze({
    nodes: Object.freeze([
      "dtc:zyppi:domain:gs1:v1",
      "arm:profile:trade_item:v1",
      "prj:spec:trade_item:v1",
    ]),
    edges: Object.freeze([
      { from: "dtc:zyppi:domain:gs1:v1", to: "arm:profile:trade_item:v1" },
      { from: "arm:profile:trade_item:v1", to: "prj:spec:trade_item:v1" },
    ]),
  }),
  provenanceReferences: Object.freeze({
    manifestAuthor: "identity:council:admin",
    createdTimestamp: "2026-08-19T00:00:00Z",
  }),
});

describe("AMS-0860-A / CORR-0860-A-1 — Identity & Configuration Closure", () => {
  describe("Phase A1 — Canonical SCC Collection Permutation Tests", () => {
    it("CORR-0860-A-1 Test 1 — Permutation of boundEpistemicRequirements yields same SCC_ID", () => {
      const id1 = deriveSccIdentityInternal(baseManifest);

      const permutedManifest: CompositionManifest = {
        ...baseManifest,
        boundEpistemicRequirements: [
          { requirementId: "epistemic:req:brand_owner:v1", version: "1.0.0" },
          { requirementId: "epistemic:req:gtin:v1", version: "1.0.0" },
        ],
      };

      const id2 = deriveSccIdentityInternal(permutedManifest);
      expect(id1).toBe(id2);
    });

    it("CORR-0860-A-1 Test 2 — Permutation of boundPrjSpecifications yields same SCC_ID", () => {
      const id1 = deriveSccIdentityInternal(baseManifest);

      const permutedManifest: CompositionManifest = {
        ...baseManifest,
        boundPrjSpecifications: [
          { specId: "prj:spec:digital_link:v1", version: "1.0.0" },
          { specId: "prj:spec:trade_item:v1", version: "1.0.0" },
        ],
      };

      const id2 = deriveSccIdentityInternal(permutedManifest);
      expect(id1).toBe(id2);
    });

    it("CORR-0860-A-1 Test 3 — Permutation of dependencyTopology.nodes yields same SCC_ID", () => {
      const id1 = deriveSccIdentityInternal(baseManifest);

      const permutedManifest: CompositionManifest = {
        ...baseManifest,
        dependencyTopology: {
          ...baseManifest.dependencyTopology,
          nodes: [
            "prj:spec:trade_item:v1",
            "dtc:zyppi:domain:gs1:v1",
            "arm:profile:trade_item:v1",
          ],
        },
      };

      const id2 = deriveSccIdentityInternal(permutedManifest);
      expect(id1).toBe(id2);
    });

    it("CORR-0860-A-1 Test 4 — Permutation of dependencyTopology.edges yields same SCC_ID", () => {
      const id1 = deriveSccIdentityInternal(baseManifest);

      const permutedManifest: CompositionManifest = {
        ...baseManifest,
        dependencyTopology: {
          ...baseManifest.dependencyTopology,
          edges: [
            { from: "arm:profile:trade_item:v1", to: "prj:spec:trade_item:v1" },
            {
              from: "dtc:zyppi:domain:gs1:v1",
              to: "arm:profile:trade_item:v1",
            },
          ],
        },
      };

      const id2 = deriveSccIdentityInternal(permutedManifest);
      expect(id1).toBe(id2);
    });

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

  describe("Phase A2 — Bound Configuration Graph (BCG) & Version Coordinates", () => {
    const sccId =
      "sha256:1111111111111111111111111111111111111111111111111111111111111111";

    const nodeA: BcgNode = { id: "node:A", version: "1.0.0", kind: "DTC" };
    const nodeB1: BcgNode = {
      id: "node:B",
      version: "1.0.0",
      kind: "ARMProfile",
    };
    const nodeB2: BcgNode = {
      id: "node:B",
      version: "2.0.0",
      kind: "ARMProfile",
    };
    const nodeC: BcgNode = { id: "node:C", version: "1.0.0", kind: "PrjSpec" };

    it("CORR-0860-A-1 Test 5 — Same artifact ID with two exact versions (X@v1 and X@v2) coexist without overwriting", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB1, nodeB2, nodeC],
        bindingEdges: [
          {
            sourceRef: "node:A",
            targetRef: "node:B@1.0.0",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:A",
            targetRef: "node:B@2.0.0",
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      // Both versions MUST appear in BCG nodes as distinct exact entries
      expect(res.bcg.nodes).toHaveLength(4);
      const b1 = res.bcg.nodes.find(
        (n) => n.id === "node:B" && n.version === "1.0.0",
      );
      const b2 = res.bcg.nodes.find(
        (n) => n.id === "node:B" && n.version === "2.0.0",
      );
      expect(b1).toBeDefined();
      expect(b2).toBeDefined();
    });

    it("CORR-0860-A-1 Test 6 — Opacity-boundary permutation produces same BCG_ID", () => {
      const o1: BcgOpacityBoundary = {
        foreignInterfaceRef: "interface:foreign:v1",
        foreignAuthorityRef: "auth:foreign:v1",
        foreignReceiptDigest: "sha256:1111",
        localFederationPolicyRef: "pol:fed:v1",
      };
      const o2: BcgOpacityBoundary = {
        foreignInterfaceRef: "interface:foreign:v2",
        foreignAuthorityRef: "auth:foreign:v2",
        foreignReceiptDigest: "sha256:2222",
        localFederationPolicyRef: "pol:fed:v2",
      };

      const res1 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA],
        bindingEdges: [],
        opacityBoundaries: [o1, o2],
      });

      const res2 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA],
        bindingEdges: [],
        opacityBoundaries: [o2, o1], // Permuted order
      });

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (res1.ok && res2.ok) {
        expect(res1.bcgId).toBe(res2.bcgId);
      }
    });

    it("CORR-0860-A-1 Test 7 — External-integrity-reference permutation produces same BCG_ID", () => {
      const r1: BcgForeignIntegrityReference = {
        referenceId: "ref:1",
        foreignInterfaceRef: "interface:v1",
        digest: "sha256:1111",
      };
      const r2: BcgForeignIntegrityReference = {
        referenceId: "ref:2",
        foreignInterfaceRef: "interface:v2",
        digest: "sha256:2222",
      };

      const res1 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA],
        bindingEdges: [],
        externalIntegrityReferences: [r1, r2],
      });

      const res2 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA],
        bindingEdges: [],
        externalIntegrityReferences: [r2, r1], // Permuted order
      });

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (res1.ok && res2.ok) {
        expect(res1.bcgId).toBe(res2.bcgId);
      }
    });

    it("TEST 0860.5 — Node Permutation produces same BCG_ID", () => {
      const res1 = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB1, nodeC],
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
        initialNodes: [nodeC, nodeA, nodeB1], // Permuted node order
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

    it("TEST 0860.38 — Binding Cycle fails closed with CONTRACT-12 'invalid'", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeA, nodeB1, nodeC],
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
  });

  describe("CORR-0860-A-1 Resolver & Governed Configuration Invariants", () => {
    it("CORR-0860-A-1 Test 8 & 9 — Resolver creates ZERO REQUIRES edges not explicitly present in T_bind (structural topology alone never creates a BCG dependency)", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      // Create manifest with nodes in dependencyTopology, but ZERO edges in dependencyTopology.edges
      const manifestWithNoBindingEdges: CompositionManifest = {
        ...baseManifest,
        dependencyTopology: {
          nodes: ["dtc:zyppi:domain:gs1:v1", "arm:profile:trade_item:v1"],
          edges: [], // Zero T_bind binding edges
        },
      };

      const res = await resolver.resolveComposition({
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_no_edges",
        executionId: "exec_no_edges",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_no_edges",
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
              capabilityId: "prj:spec:trade_item:v1",
              subjectId: "arm:profile:trade_item:v1",
              scope: "prj:spec:trade_item:v1",
              validFrom: "2026-01-01T00:00:00Z",
              validTo: "2030-01-01T00:00:00Z",
            },
          ],
          evidenceReferences: [],
          applicablePolicies: [],
        },
        dtcFixture: {
          ...baseManifest.dtcReference,
          dtcId: "dtc:zyppi:domain:gs1:v1",
          domainIdentifier: "domain:gs1",
          domainName: "GS1",
          version: "1.0.0",
          scope: "scope",
          applicableAssetClasses: ["asset:class:trade_item:v1"],
          applicableArmProfiles: ["arm:profile:trade_item:v1"],
          epistemicRequirements: ["epistemic:req:gtin:v1"],
          requiredPrjSpecifications: ["prj:spec:trade_item:v1"],
          requiredRsnBlueprints: [],
          requiredContextDimensions: [],
          applicablePolRequirements: [],
          applicableSecRequirements: [],
          requiredRiCapabilities: [],
          versionConstraints: {},
          provenanceRequirements: {},
        },
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      // The resolver MUST NOT have manufactured any DTC -> ARM binding edge!
      expect(res.bcg?.bindingEdges).toHaveLength(0);
    });

    it("CORR-0860-A-1 Test 10 — All explicitly governed BCG participants required appear in BCG nodes", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      const res = await resolver.resolveComposition({
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_full_nodes",
        executionId: "exec_full_nodes",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_full_nodes",
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

      const nodeKinds = res.bcg?.nodes.map((n) => n.kind);
      expect(nodeKinds).toContain("DTC");
      expect(nodeKinds).toContain("ARMProfile");
      expect(nodeKinds).toContain("EpistemicRequirement");
      expect(nodeKinds).toContain("PrjSpec");
    });
  });
});
