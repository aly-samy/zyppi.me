import { describe, it, expect } from "vitest";
import { ApplicationCompositionResolver } from "./compositionResolver.js";
import { deriveSccIdentityInternal } from "./scc.js";
import { buildBoundConfigurationGraph, type BcgNode } from "./bcg.js";
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

describe("AMS-0860-A / CORR-0860-A-1 through CORR-0860-A-5 — Identity & Configuration Closure", () => {
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

      expect(id1).toBe(id2);
    });
  });

  describe("Phase A2 — Bound Configuration Graph (BCG) & CORR-0860-A-2 Endpoint Resolution", () => {
    const sccId =
      "sha256:1111111111111111111111111111111111111111111111111111111111111111";

    const nodeX1: BcgNode = { id: "node:X", version: "1.0.0", kind: "DTC" };
    const nodeX2: BcgNode = { id: "node:X", version: "2.0.0", kind: "DTC" };
    const nodeY2: BcgNode = {
      id: "node:Y",
      version: "2.0.0",
      kind: "ARMProfile",
    };
    const nodeY3: BcgNode = {
      id: "node:Y",
      version: "3.0.0",
      kind: "ARMProfile",
    };

    it("CORR-0860-A-2 Test A — Unique legacy endpoint (edge Y, nodes [Y@v3]) resolves exactly to Y@v3", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeX1, nodeY3],
        bindingEdges: [
          {
            sourceRef: "node:X",
            targetRef: "node:Y", // Bare endpoint 'node:Y'
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.bcg.bindingEdges[0]?.targetRef).toBe("node:Y@3.0.0");
    });

    it("CORR-0860-A-2 Test B — Ambiguous legacy endpoint (edge Y, nodes [Y@v2, Y@v3]) FAILS CLOSED with 'conflicting'", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeX1, nodeY2, nodeY3],
        bindingEdges: [
          {
            sourceRef: "node:X",
            targetRef: "node:Y", // Bare endpoint matching multiple exact candidates Y@v2 and Y@v3
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("conflicting");
      expect(res.error.message).toContain("Ambiguous endpoint reference");
    });

    it("CORR-0860-A-2 Test C — Exact version endpoint (edge Y@v3, nodes [Y@v2, Y@v3]) resolves Y@v3 only", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeX1, nodeY2, nodeY3],
        bindingEdges: [
          {
            sourceRef: "node:X@1.0.0",
            targetRef: "node:Y@3.0.0", // Exact version coordinate
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;
      expect(res.bcg.bindingEdges[0]?.targetRef).toBe("node:Y@3.0.0");
      // nodeY2 should NOT be in the dependency graph
      expect(res.bcg.nodes.find((n) => n.version === "2.0.0")).toBeUndefined();
    });

    it("CORR-0860-A-2 Test D — Source ambiguity (source X, nodes [X@v1, X@v2]) FAILS CLOSED with 'conflicting'", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeX1, nodeX2, nodeY3],
        bindingEdges: [
          {
            sourceRef: "node:X", // Ambiguous bare sourceRef matching X@v1 and X@v2
            targetRef: "node:Y@3.0.0",
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("conflicting");
      expect(res.error.message).toContain("Ambiguous endpoint reference");
    });

    it("CORR-0860-A-2 Test E — Exact-version cycle (X@v1 -> Y@v2 -> X@v1) FAILS CLOSED with 'invalid'", () => {
      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeX1, nodeY2],
        bindingEdges: [
          {
            sourceRef: "node:X@1.0.0",
            targetRef: "node:Y@2.0.0",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:Y@2.0.0",
            targetRef: "node:X@1.0.0",
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("invalid");
      expect(res.error.message).toContain("circular REQUIRES dependency");
    });

    it("CORR-0860-A-2 Test F — Different versions, no false cycle (X@v1 -> Y@v2 and Y@v1 -> X@v1 do not cycle)", () => {
      const nodeY1: BcgNode = {
        id: "node:Y",
        version: "1.0.0",
        kind: "ARMProfile",
      };

      const res = buildBoundConfigurationGraph({
        semanticConfigurationRef: sccId,
        initialNodes: [nodeX1, nodeY2, nodeY1],
        bindingEdges: [
          {
            sourceRef: "node:X@1.0.0",
            targetRef: "node:Y@2.0.0",
            dependencyKind: "REQUIRES",
          },
          {
            sourceRef: "node:Y@1.0.0",
            targetRef: "node:X@1.0.0",
            dependencyKind: "REQUIRES",
          },
        ],
      });

      expect(res.ok).toBe(true);
    });

    it("CORR-0860-A-2 Test G — Non-binding manifest member present in SCC configuration but NOT present as BCG dependency node", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      // Resolve composition with zero binding edges in manifest.dependencyTopology.edges
      const res = await resolver.resolveComposition({
        manifestAuthor: "identity:council:admin",
        epistemicRequirementsFixtures: [
          {
            requirementId: "epistemic:req:gtin:v1",
            version: "1.0.0",
            targetDimension: "GTIN",
            goldenQuestionRef: "question:gtin",
            requiredFacts: [],
          },
        ],
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_non_binding",
        executionId: "exec_non_binding",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_non_binding",
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

      // Epistemic requirements exist on manifest/SCC, but do NOT acquire a BCG dependency node
      const bcgNodeIds = res.bcg?.nodes.map((n) => n.id);
      expect(bcgNodeIds).not.toContain("epistemic:req:gtin:v1");
    });

    it("CORR-0860-A-5 Test H — compositionDefinition with explicit governed participants & bindingEdges passes validation and transports T_bind", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      const res = await resolver.resolveComposition({
        manifestAuthor: "identity:council:admin",
        epistemicRequirementsFixtures: [
          {
            requirementId: "epistemic:req:gtin:v1",
            version: "1.0.0",
            targetDimension: "GTIN",
            goldenQuestionRef: "question:gtin",
            requiredFacts: [],
          },
        ],
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_governed",
        executionId: "exec_governed",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_governed",
        versions: ["1.0.0"],
        policyContext: mockPolicyContext,
        resolvedPolicyGraph: mockPolicyGraph,
        compositionDefinition: {
          participants: [
            {
              identity: "dtc:zyppi:domain:gs1:v1",
              kind: "DTC",
              version: "1.0.0",
              owner: "identity:council:admin",
              role: "domain_template",
              reference: { id: "dtc:zyppi:domain:gs1:v1", version: "1.0.0" },
            },
            {
              identity: "arm:profile:trade_item:v1",
              kind: "ARM_PROFILE",
              version: "1.0.0",
              owner: "identity:council:admin",
              role: "asset_profile",
              reference: {
                id: "arm:profile:trade_item:v1",
                version: "1.0.0",
              },
            },
            {
              identity: "prj:spec:trade_item:v1",
              kind: "PRJ_SPECIFICATION",
              version: "1.0.0",
              owner: "identity:council:admin",
              role: "prj_specification",
              reference: {
                id: "prj:spec:trade_item:v1",
                version: "1.0.0",
              },
            },
          ],
          bindingEdges: [
            {
              sourceId: "dtc:zyppi:domain:gs1:v1",
              targetId: "arm:profile:trade_item:v1",
              dependencyKind: "REQUIRES",
            },
          ],
        },
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

      expect(res.bcg?.bindingEdges).toHaveLength(1);
      expect(res.bcg?.bindingEdges[0]?.sourceRef).toBe(
        "dtc:zyppi:domain:gs1:v1@1.0.0",
      );
      expect(res.bcg?.bindingEdges[0]?.targetRef).toBe(
        "arm:profile:trade_item:v1@1.0.0",
      );
    });

    it("CORR-0860-A-5 Negative Test 1 — Absent/empty participants in compositionDefinition FAILS CLOSED", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      const res = await resolver.resolveComposition({
        manifestAuthor: "identity:council:admin",
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
        epistemicRequirementsFixtures: [
          {
            requirementId: "epistemic:req:gtin:v1",
            version: "1.0.0",
            targetDimension: "GTIN",
            goldenQuestionRef: "question:gtin",
            requiredFacts: [],
          },
        ],
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_no_participants",
        executionId: "exec_no_participants",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_no_participants",
        versions: ["1.0.0"],
        policyContext: mockPolicyContext,
        resolvedPolicyGraph: mockPolicyGraph,
        compositionDefinition: {
          bindingEdges: [
            {
              sourceId: "dtc:zyppi:domain:gs1:v1",
              targetId: "arm:profile:trade_item:v1",
              dependencyKind: "REQUIRES",
            },
          ],
        },
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
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("invalid");
        expect(res.error.message).toContain(
          "without explicit governed participants collection P",
        );
        const checkRes = res as unknown as {
          sccId?: string;
          bcgId?: string;
          bcg?: unknown;
        };
        expect(checkRes.sccId).toBeUndefined();
        expect(checkRes.bcgId).toBeUndefined();
        expect(checkRes.bcg).toBeUndefined();
      }
    });

    it("CORR-0860-A-5 Negative Test 2 — Participant with missing/blank owner FAILS CLOSED without default owner synthesis", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      const res = await resolver.resolveComposition({
        manifestAuthor: "identity:council:admin",
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
        epistemicRequirementsFixtures: [
          {
            requirementId: "epistemic:req:gtin:v1",
            version: "1.0.0",
            targetDimension: "GTIN",
            goldenQuestionRef: "question:gtin",
            requiredFacts: [],
          },
        ],
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_no_owner",
        executionId: "exec_no_owner",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_no_owner",
        versions: ["1.0.0"],
        policyContext: mockPolicyContext,
        resolvedPolicyGraph: mockPolicyGraph,
        compositionDefinition: {
          participants: [
            {
              identity: "dtc:zyppi:domain:gs1:v1",
              kind: "DTC",
              version: "1.0.0",
              owner: "", // Blank owner!
              role: "domain_template",
              reference: { id: "dtc:zyppi:domain:gs1:v1", version: "1.0.0" },
            },
          ],
        },
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
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("invalid");
        expect(res.error.message).toContain("missing or ambiguous owner");
      }
    });

    it("CORR-0860-A-5 Negative Test 3 — Participant with missing/blank version FAILS CLOSED without default version substitution", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      const res = await resolver.resolveComposition({
        manifestAuthor: "identity:council:admin",
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
        epistemicRequirementsFixtures: [
          {
            requirementId: "epistemic:req:gtin:v1",
            version: "1.0.0",
            targetDimension: "GTIN",
            goldenQuestionRef: "question:gtin",
            requiredFacts: [],
          },
        ],
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_no_version",
        executionId: "exec_no_version",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_no_version",
        versions: ["1.0.0"],
        policyContext: mockPolicyContext,
        resolvedPolicyGraph: mockPolicyGraph,
        compositionDefinition: {
          participants: [
            {
              identity: "dtc:zyppi:domain:gs1:v1",
              kind: "DTC",
              version: "", // Missing version!
              owner: "identity:council:admin",
              role: "domain_template",
              reference: { id: "dtc:zyppi:domain:gs1:v1", version: "1.0.0" },
            },
          ],
        },
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
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("invalid");
        expect(res.error.message).toContain("missing explicit version");
      }
    });

    it("CORR-0860-A-4 Negative Test — Cyclic CompositionDefinition fails topology validation closed without producing SCC or BCG", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      const res = await resolver.resolveComposition({
        manifestAuthor: "identity:council:admin",
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
        epistemicRequirementsFixtures: [
          {
            requirementId: "epistemic:req:gtin:v1",
            version: "1.0.0",
            targetDimension: "GTIN",
            goldenQuestionRef: "question:gtin",
            requiredFacts: [],
          },
        ],
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_cyclic_def",
        executionId: "exec_cyclic_def",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_cyclic_def",
        versions: ["1.0.0"],
        policyContext: mockPolicyContext,
        resolvedPolicyGraph: mockPolicyGraph,
        compositionDefinition: {
          participants: [
            {
              identity: "dtc:zyppi:domain:gs1:v1",
              kind: "DTC",
              version: "1.0.0",
              owner: "identity:council:admin",
              role: "domain_template",
              reference: { id: "dtc:zyppi:domain:gs1:v1", version: "1.0.0" },
            },
            {
              identity: "arm:profile:trade_item:v1",
              kind: "ARM_PROFILE",
              version: "1.0.0",
              owner: "identity:council:admin",
              role: "asset_profile",
              reference: {
                id: "arm:profile:trade_item:v1",
                version: "1.0.0",
              },
            },
          ],
          bindingEdges: [
            {
              sourceId: "dtc:zyppi:domain:gs1:v1",
              targetId: "arm:profile:trade_item:v1",
              dependencyKind: "REQUIRES",
            },
            {
              sourceId: "arm:profile:trade_item:v1",
              targetId: "dtc:zyppi:domain:gs1:v1",
              dependencyKind: "REQUIRES",
            },
          ],
        },
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
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("incompatible");
        expect(res.error.message).toContain("dependency cycle");
        const checkRes = res as unknown as {
          sccId?: string;
          bcgId?: string;
          bcg?: unknown;
        };
        expect(checkRes.sccId).toBeUndefined();
        expect(checkRes.bcgId).toBeUndefined();
        expect(checkRes.bcg).toBeUndefined();
      }
    });

    it("CORR-0860-A-3 Test I — Zero T_bind edges produces BCG with zero nodes and zero edges (Semantic Configuration Membership ≠ Binding Dependency Membership)", async () => {
      const repo: RegistryRepository = new FrozenRegistryRepository({});
      const resolver = new ApplicationCompositionResolver();

      const res = await resolver.resolveComposition({
        manifestAuthor: "identity:council:admin",
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
        epistemicRequirementsFixtures: [
          {
            requirementId: "epistemic:req:gtin:v1",
            version: "1.0.0",
            targetDimension: "GTIN",
            goldenQuestionRef: "question:gtin",
            requiredFacts: [],
          },
        ],
        registryRepository: repo,
        identifier: mockIdentifier,
        requestId: "req_zero_bind",
        executionId: "exec_zero_bind",
        constitutionalTimestamp: "2026-08-19T00:00:00Z",
        budget: 100,
        entropy: "entropy_zero_bind",
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
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.bcg?.bindingEdges).toHaveLength(0);
      expect(res.bcg?.nodes).toHaveLength(0);
    });
  });
});
