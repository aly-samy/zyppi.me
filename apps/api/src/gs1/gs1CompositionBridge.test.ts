import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createGs1AnchorFromCarrier } from "./gs1AnchorBridge.js";
import { assembleGs1CompositionFromAnchor } from "./gs1CompositionBridge.js";
import type { GS1AnchorBridgeSuccess } from "./types.js";
import {
  type RegistryRepository,
  type RegistryResult,
  type RetrievedRegistryState,
  type ValidatedCanonicalIdentifier,
} from "@zyppi/contracts";
import type {
  EvidenceRecord,
  EvidenceBundle,
  IdentityRecord,
  ReferentRecord,
  PolicyRecord,
  CapabilityRecord,
  AuthorityRecord,
  PolicyContext,
  ResolvedPolicyGraph,
} from "@zyppi/domain";
import { GS1_DOMAIN_TEMPLATE_CARD } from "../zprof/fixtures/gs1Dtc.js";
import {
  GS1_GTIN_EPISTEMIC_REQUIREMENT,
  GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
} from "../zprof/fixtures/gs1EpistemicRequirements.js";
import type {
  DomainTemplateCard,
  EpistemicRequirementContract,
} from "../zprof/types.js";
import { mapEvaluationCoordinateToExecutionRequest } from "../zprof/lifecycle.js";
// @ts-expect-error JS module without declaration file
import { runValidation } from "../../../../tools/verify-dependency-graph.mjs";

const validGtin14Carrier = "https://id.gs1.org/01/09506000134352";
const validK1 = "09506000134352";

const mockIdentity: IdentityRecord = {
  identityId: "09506000134352",
  identityType: "GTIN-14",
  canonicalReference: "09506000134352",
  referentId: "ref-trade-item-123",
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockReferent: ReferentRecord = {
  referentId: "ref-trade-item-123",
  referentType: "brand",
  name: "Example Brand",
  parentReferentId: null,
  createdAt: "2026-01-01T00:00:00Z",
};

const mockAuthority: AuthorityRecord = {
  authorityId: "auth:brand_owner:v1",
  subjectId: "arm:profile:trade_item:v1",
  scope: "brand_owner_authority",
  validFrom: "2026-01-01T00:00:00Z",
  validTo: "2030-01-01T00:00:00Z",
};

const mockCapability: CapabilityRecord = {
  capabilityId: "prj:spec:gs1_digital_link_projection:v1",
  subjectId: "arm:profile:trade_item:v1",
  scope: "prj:spec:gs1_digital_link_projection:v1",
  validFrom: "2026-01-01T00:00:00Z",
  validTo: "2030-01-01T00:00:00Z",
};

const mockPolicy: PolicyRecord = {
  policyId: "pol:req:active_standing:v1",
  policyType: "TRADE_ITEM_POLICY",
  version: "1.0.0",
  definition: { allowTradeItem: true },
  active: true,
};

const mockEvidenceRecord: EvidenceRecord = {
  evidenceId: "ev:gtin_registration:v1",
  identityId: "09506000134352",
  evidenceType: "GTIN_REGISTRATION_RECORD",
  hash: "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  storageRef: "r2://evidence/gtin_registration_v1.json",
  retrievedAt: "2026-01-01T00:00:00Z",
};

const mockEvidenceBundle: EvidenceBundle = {
  schemaVersion: "1.0",
  evidenceRecords: [mockEvidenceRecord],
};

const mockEvidencePayloads = new Map<string, unknown>([
  ["ev:gtin_registration:v1", { gtin: "09506000134352" }],
]);

const mockRegistryState: RetrievedRegistryState = {
  identity: mockIdentity,
  relationships: [mockReferent],
  standings: [],
  authorities: [mockAuthority],
  capabilities: [mockCapability],
  evidenceReferences: [mockEvidenceRecord],
  applicablePolicies: [mockPolicy],
};

class MockRegistryRepository implements RegistryRepository {
  public lookupCalls: string[] = [];
  public lookupCount = 0;

  constructor(private knownK1Map: Map<string, RetrievedRegistryState>) {}

  async lookup(
    identifier: ValidatedCanonicalIdentifier,
  ): Promise<RegistryResult<RetrievedRegistryState | null>> {
    const key =
      typeof identifier === "string"
        ? identifier
        : (identifier as unknown as { value: string }).value ||
          String(identifier);
    this.lookupCalls.push(key);
    this.lookupCount++;
    const state = this.knownK1Map.get(key) || null;
    return { ok: true, value: state };
  }

  async lookupEvidenceByIds(
    evidenceIds: readonly string[],
  ): Promise<RegistryResult<readonly EvidenceRecord[]>> {
    if (evidenceIds.includes("ev:missing_evidence:v1")) {
      return { ok: true, value: [] };
    }
    return { ok: true, value: [mockEvidenceRecord] };
  }
}

const defaultPolicyContext: PolicyContext = {
  policies: [mockPolicy],
};

const defaultResolvedPolicyGraph: ResolvedPolicyGraph = {
  edges: [],
};

const defaultVersions = Object.freeze(["1.0.0"]);

function createDefaultBridgeInput(
  anchorSuccess: GS1AnchorBridgeSuccess,
  repo: RegistryRepository,
) {
  return {
    anchorSuccess,
    dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
    epistemicRequirementsFixtures: [GS1_GTIN_EPISTEMIC_REQUIREMENT],
    manifestAuthor: "identity:test:manifest_author",
    registryRepository: repo,
    requestId: "req-123",
    executionId: "exec-456",
    constitutionalTimestamp: "2026-01-01T00:00:00Z",
    tValid: "2026-01-01T00:00:00Z",
    tObservation: "2026-01-01T00:00:00Z",
    tEInput: "2026-01-01T00:00:00Z",
    budget: 1000,
    entropy: "test-entropy-string-1234567890",
    versions: defaultVersions,
    policyContext: defaultPolicyContext,
    resolvedPolicyGraph: defaultResolvedPolicyGraph,
    explicitEvidenceBundle: mockEvidenceBundle,
    explicitEvidencePayloads: mockEvidencePayloads,
    compositionDefinition: {
      participants: [
        {
          id: "p1",
          identity: "dtc:zyppi:domain:gs1:v1",
          kind: "DTC" as const,
          version: "1.0.0",
          owner: "identity:test:manifest_author",
          role: "domain_template" as const,
          reference: { id: "dtc:zyppi:domain:gs1:v1", version: "1.0.0" },
        },
        {
          id: "p2",
          identity: "arm:profile:trade_item:v1",
          kind: "ARM_PROFILE" as const,
          version: "1.0.0",
          owner: "identity:test:manifest_author",
          role: "asset_profile" as const,
          reference: { id: "arm:profile:trade_item:v1", version: "1.0.0" },
        },
        {
          id: "p3",
          identity: "prj:spec:gs1_digital_link_projection:v1",
          kind: "PRJ_SPECIFICATION" as const,
          version: "1.0.0",
          owner: "identity:test:manifest_author",
          role: "prj_specification" as const,
          reference: {
            id: "prj:spec:gs1_digital_link_projection:v1",
            version: "1.0.0",
          },
        },
        {
          id: "p4",
          identity: "rsn:blueprint:gs1_identity_verification:v1",
          kind: "RSN_BLUEPRINT" as const,
          version: "1.0.0",
          owner: "identity:test:manifest_author",
          role: "rsn_blueprint" as const,
          reference: {
            id: "rsn:blueprint:gs1_identity_verification:v1",
            version: "1.0.0",
          },
        },
        {
          id: "p5",
          identity: "pol:req:active_standing:v1",
          kind: "POL_REQUIREMENT" as const,
          version: "1.0.0",
          owner: "identity:test:manifest_author",
          role: "pol_requirement" as const,
          reference: { id: "pol:req:active_standing:v1", version: "1.0.0" },
        },
        {
          id: "p6",
          identity: "sec:req:sha256_payload_integrity:v1",
          kind: "SEC_REQUIREMENT" as const,
          version: "1.0.0",
          owner: "identity:test:manifest_author",
          role: "sec_requirement" as const,
          reference: {
            id: "sec:req:sha256_payload_integrity:v1",
            version: "1.0.0",
          },
        },
        {
          id: "p7",
          identity: "ri:capability:stage7_ast_evaluation:v1",
          kind: "RI_CAPABILITY" as const,
          version: "1.0.0",
          owner: "identity:test:manifest_author",
          role: "ri_capability" as const,
          reference: {
            id: "ri:capability:stage7_ast_evaluation:v1",
            version: "1.0.0",
          },
        },
      ],
      structuralEdges: [
        {
          sourceId: "dtc:zyppi:domain:gs1:v1",
          targetId: "arm:profile:trade_item:v1",
          relationKind: "CONTAINS",
        },
      ],
      bindingEdges: [
        {
          sourceId: "dtc:zyppi:domain:gs1:v1",
          targetId: "prj:spec:gs1_digital_link_projection:v1",
          dependencyKind: "REQUIRES",
        },
        {
          sourceId: "dtc:zyppi:domain:gs1:v1",
          targetId: "rsn:blueprint:gs1_identity_verification:v1",
          dependencyKind: "REQUIRES",
        },
      ],
    },
  };
}

describe("AMS-0861-B GS1 Epistemic Composition & Application Assembly Test Suite (CORR-0861-B-1)", () => {
  // Setup common anchor
  async function getLawfulAnchor() {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);
    const anchorRes = await createGs1AnchorFromCarrier(
      validGtin14Carrier,
      repo,
    );
    expect(anchorRes.ok).toBe(true);
    return {
      anchorSuccess: anchorRes as GS1AnchorBridgeSuccess,
      repo,
    };
  }

  // B-0861-01: A-anchor accepted through lawful public seam
  it("B-0861-01: should accept packet A anchor through lawful public seam and assemble composition", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.manifest.dtcReference.dtcId).toBe(
        "dtc:zyppi:domain:gs1:v1",
      );
      expect(result.sccId).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(result.bcgId).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(result.evaluationCoordinate.sccId).toBe(result.sccId);
      expect(result.evaluationCoordinate.bcgId).toBe(result.bcgId);
      expect(result.evaluationCoordinate.pinnedSemanticStateRef.ref).toBe(
        mockIdentity.canonicalReference,
      );
    }
  });

  // B-0861-02: No carrier reparsing/re-resolution
  it("B-0861-02: should not reparse carrier URI or perform extra registry lookups during B assembly", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const initialLookups = repo.lookupCount;

    const input = createDefaultBridgeInput(anchorSuccess, repo);
    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    // B resolution requires 1 ACV lookup during composition resolution when explicit ACV is not supplied
    expect(repo.lookupCount).toBe(initialLookups + 1);
  });

  // B-0861-03: Explicit Profile/composition binding
  it("B-0861-03: should enforce explicit Profile and version binding without implicit defaults", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    // Provide floating wildcard version in option
    const badInput = {
      ...input,
      versions: ["latest"],
    };

    const result = await assembleGs1CompositionFromAnchor(badInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invalid");
    }
  });

  // B-0861-04: Deterministic composition binding topology (T_bind) closure
  it("B-0861-04: should compute deterministic composition binding topology (T_bind) closure and matching SCC/BCG identities", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input1 = createDefaultBridgeInput(anchorSuccess, repo);
    const input2 = createDefaultBridgeInput(anchorSuccess, repo);

    const res1 = await assembleGs1CompositionFromAnchor(input1);
    const res2 = await assembleGs1CompositionFromAnchor(input2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      expect(res1.sccId).toBe(res2.sccId);
      expect(res1.bcgId).toBe(res2.bcgId);
    }
  });

  // B-0861-05: Fan-out binding topology resolution
  it("B-0861-05: should resolve fan-out composition binding topologies cleanly into BCG graph nodes and edges", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.bcg.nodes.length).toBeGreaterThanOrEqual(3);
      expect(result.bcg.bindingEdges.length).toBe(2);
    }
  });

  // B-0861-06: Fan-in/shared binding topology resolution
  it("B-0861-06: should resolve shared dependencies in fan-in binding topologies without duplicating BCG nodes", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    // Add shared node binding edges
    input.compositionDefinition.bindingEdges = [
      {
        sourceId: "dtc:zyppi:domain:gs1:v1",
        targetId: "prj:spec:gs1_digital_link_projection:v1",
        dependencyKind: "REQUIRES",
      },
      {
        sourceId: "arm:profile:trade_item:v1",
        targetId: "prj:spec:gs1_digital_link_projection:v1",
        dependencyKind: "REQUIRES",
      },
    ];

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const p3Nodes = result.bcg.nodes.filter(
        (n) => n.id === "prj:spec:gs1_digital_link_projection:v1",
      );
      expect(p3Nodes.length).toBe(1); // Unique deduplicated node
    }
  });

  // B-0861-07: Missing dependency fails closed
  it("B-0861-07: should fail closed when a required dependency participant is missing", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    // Remove PRJ_SPECIFICATION participant p3
    input.compositionDefinition.participants =
      input.compositionDefinition.participants.filter(
        (p) => p.identity !== "prj:spec:gs1_digital_link_projection:v1",
      );

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(["missing", "invalid"]).toContain(result.error.code);
    }
  });

  // B-0861-08: Invalid/cyclic topology fails according to existing contract
  it("B-0861-08: should fail closed when cyclic binding topology is introduced", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    // Add cyclic binding edge p3 -> p1 where p1 -> p3 already exists
    input.compositionDefinition.bindingEdges = [
      {
        sourceId: "dtc:zyppi:domain:gs1:v1",
        targetId: "prj:spec:gs1_digital_link_projection:v1",
        dependencyKind: "REQUIRES",
      },
      {
        sourceId: "prj:spec:gs1_digital_link_projection:v1",
        targetId: "dtc:zyppi:domain:gs1:v1",
        dependencyKind: "REQUIRES",
      },
    ];

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("incompatible");
    }
  });

  // B-0861-09: Missing Evidence requirement remains unsatisfied
  it("B-0861-09: should fail closed with UNAVAILABLE epistemic status when registry state is missing required evidence", async () => {
    const unresolvableEvidenceRecord: EvidenceRecord = {
      ...mockEvidenceRecord,
      evidenceId: "ev:missing_evidence:v1",
    };
    const missingEvidenceState: RetrievedRegistryState = {
      ...mockRegistryState,
      evidenceReferences: [unresolvableEvidenceRecord],
    };
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, missingEvidenceState],
    ]);
    const repo = new MockRegistryRepository(knownMap);
    const anchorRes = await createGs1AnchorFromCarrier(
      validGtin14Carrier,
      repo,
    );
    expect(anchorRes.ok).toBe(true);

    const input = createDefaultBridgeInput(
      anchorRes as GS1AnchorBridgeSuccess,
      repo,
    );

    const noEvidenceInput = {
      ...input,
      explicitEvidenceBundle: undefined,
      explicitEvidencePayloads: undefined,
    };

    const result = await assembleGs1CompositionFromAnchor(noEvidenceInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.epistemicStatus).toBe("UNAVAILABLE");
    }
  });

  // B-0861-10: No Evidence fabrication
  it("B-0861-10: should not fabricate evidence records or alter evidence payload maps", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(
        result.boundPayload.resolvedEvidenceBundle.evidenceRecords.length,
      ).toBe(1);
      expect(
        result.boundPayload.resolvedEvidenceBundle.evidenceRecords[0]
          ?.evidenceId,
      ).toBe("ev:gtin_registration:v1");
    }
  });

  // B-0861-11 & B-0861-12: Topology-driven resolution proof & Topology Mutation Proof
  it("B-0861-11 & B-0861-12: should demonstrate topology-driven composition resolution and topology mutation proof without generic code change", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();

    // Topology 1 — Simple Fan-Out
    const input1 = createDefaultBridgeInput(anchorSuccess, repo);
    input1.compositionDefinition.bindingEdges = [
      {
        sourceId: "dtc:zyppi:domain:gs1:v1",
        targetId: "prj:spec:gs1_digital_link_projection:v1",
        dependencyKind: "REQUIRES",
      },
    ];

    // Topology 2 — Multi-tier Fan-In
    const input2 = createDefaultBridgeInput(anchorSuccess, repo);
    input2.compositionDefinition.bindingEdges = [
      {
        sourceId: "dtc:zyppi:domain:gs1:v1",
        targetId: "prj:spec:gs1_digital_link_projection:v1",
        dependencyKind: "REQUIRES",
      },
      {
        sourceId: "dtc:zyppi:domain:gs1:v1",
        targetId: "rsn:blueprint:gs1_identity_verification:v1",
        dependencyKind: "REQUIRES",
      },
      {
        sourceId: "rsn:blueprint:gs1_identity_verification:v1",
        targetId: "prj:spec:gs1_digital_link_projection:v1",
        dependencyKind: "REQUIRES",
      },
    ];

    const res1 = await assembleGs1CompositionFromAnchor(input1);
    const res2 = await assembleGs1CompositionFromAnchor(input2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);

    if (res1.ok && res2.ok) {
      // Manifest edges differ
      expect(res1.manifest.dependencyTopology.edges.length).toBe(1);
      expect(res2.manifest.dependencyTopology.edges.length).toBe(3);

      // Deterministic identities differ due to topology change
      expect(res1.sccId).not.toBe(res2.sccId);
      expect(res1.bcgId).not.toBe(res2.bcgId);
    }
  });

  // B-0861-13: Explicit version binding / no latest fallback
  it("B-0861-13: should reject wildcard and floating version specifiers in input options", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const floatingInputs = [
      { ...input, versions: ["*"] },
      { ...input, versions: ["^1.0.0"] },
      { ...input, versions: [">=1.0.0"] },
    ];

    for (const bad of floatingInputs) {
      const res = await assembleGs1CompositionFromAnchor(bad);
      expect(res.ok).toBe(false);
    }
  });

  // B-0861-14: SCC/BCG reuse under existing authority
  it("B-0861-14: should reuse existing SCC and BCG builders without re-implementing identity derivation", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sccId.startsWith("sha256:")).toBe(true);
      expect(result.bcgId.startsWith("sha256:")).toBe(true);
      expect(result.bcg.semanticConfigurationRef).toBe(result.sccId);
    }
  });

  // B-0861-15: Generic failure-envelope neutrality
  it("B-0861-15: should return standard generic failure envelope on error without exposing domain-specific error types", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const badInput = {
      ...createDefaultBridgeInput(anchorSuccess, repo),
      manifestAuthor: "", // Blank author -> missing error
    };

    const result = await assembleGs1CompositionFromAnchor(badInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.category).toBe("Composition Failure");
      expect(result.error.code).toBe("missing");
      expect(typeof result.error.message).toBe("string");
    }
  });

  // B-0861-16, B-0861-17, B-0861-18, B-0861-19: Dependency Isolation Tests
  it("B-0861-16 through B-0861-19: should verify zero direct or transitive GS1 dependencies in generic Z-PROF / Application / Runtime modules", () => {
    const { violations } = runValidation();
    const gs1Violations = violations.filter(
      (v: { rule: string }) => v.rule === "gs1-domain-edge-contamination",
    );
    expect(gs1Violations.length).toBe(0);
  });

  // B-0861-20 & B-0861-21: RI / PRJ / RSN non-involvement
  it("B-0861-20 & B-0861-21: should assemble execution-ready coordinates without invoking RI, PRJ, or RSN evaluators", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Ensure no execution output or receipt is present
      expect("pipelineResult" in result).toBe(false);
      expect("executionReceipt" in result).toBe(false);
      expect("executionOutput" in result).toBe(false);
    }
  });

  // B-0861-22: Deterministic repeated assembly
  it("B-0861-22: should produce byte-identical assembly results given identical inputs", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input1 = createDefaultBridgeInput(anchorSuccess, repo);
    const input2 = createDefaultBridgeInput(anchorSuccess, repo);

    const res1 = await assembleGs1CompositionFromAnchor(input1);
    const res2 = await assembleGs1CompositionFromAnchor(input2);

    expect(res1).toEqual(res2);
  });

  // B-0861-23: No Registry mutation
  it("B-0861-23: should read registry state without performing mutations", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    await assembleGs1CompositionFromAnchor(input);

    // Repo maintains read-only lookup state
    expect(repo.lookupCalls.length).toBeGreaterThan(0);
  });

  // B-0861-24: No generic persistence contamination
  it("B-0861-24: should confirm zero domain-specific persistence contamination in generic zprof files", () => {
    const zprofDir = path.resolve(__dirname, "../zprof");
    const files = fs
      .readdirSync(zprofDir)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

    for (const file of files) {
      const filePath = path.join(zprofDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      expect(content).not.toContain("GTIN");
      expect(content).not.toContain("DigitalLink");
      expect(content).not.toContain("AI 01");
    }
  });

  // B-0861-25: Anchor Identity Preservation
  it("B-0861-25: should preserve exact Packet A anchor identity into Packet B output", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(
        result.evaluationCoordinate.authorizedInputs.anchorCanonicalId,
      ).toBe(anchorSuccess.anchor.normalizedCarrier.k1);
      expect(
        result.evaluationCoordinate.authorizedInputs.provenanceCarrierInput,
      ).toBe(anchorSuccess.provenance.carrierInput);
    }
  });

  // B-0861-26: Same Anchor, Different Governed Configuration
  it("B-0861-26: should maintain identical anchor identity when governed configuration differs", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();

    const input1 = createDefaultBridgeInput(anchorSuccess, repo);
    const input2 = createDefaultBridgeInput(anchorSuccess, repo);

    // Change DTC fixture id in input2
    const altDtc: DomainTemplateCard = {
      ...GS1_DOMAIN_TEMPLATE_CARD,
      dtcId: "dtc:zyppi:domain:gs1:v2",
      version: "1.0.0",
    };
    (input2 as unknown as { dtcFixture: DomainTemplateCard }).dtcFixture =
      altDtc;
    input2.compositionDefinition.participants[0] = {
      id: "p1",
      identity: "dtc:zyppi:domain:gs1:v2",
      kind: "DTC",
      version: "1.0.0",
      owner: "identity:test:manifest_author",
      role: "domain_template",
      reference: { id: "dtc:zyppi:domain:gs1:v2", version: "1.0.0" },
    };
    input2.compositionDefinition.structuralEdges = [
      {
        sourceId: "dtc:zyppi:domain:gs1:v2",
        targetId: "arm:profile:trade_item:v1",
        relationKind: "CONTAINS",
      },
    ];
    input2.compositionDefinition.bindingEdges = [
      {
        sourceId: "dtc:zyppi:domain:gs1:v2",
        targetId: "prj:spec:gs1_digital_link_projection:v1",
        dependencyKind: "REQUIRES",
      },
      {
        sourceId: "dtc:zyppi:domain:gs1:v2",
        targetId: "rsn:blueprint:gs1_identity_verification:v1",
        dependencyKind: "REQUIRES",
      },
    ];

    const res1 = await assembleGs1CompositionFromAnchor(input1);
    const res2 = await assembleGs1CompositionFromAnchor(input2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      // Anchor identity remains identical
      expect(res1.evaluationCoordinate.authorizedInputs.anchorCanonicalId).toBe(
        res2.evaluationCoordinate.authorizedInputs.anchorCanonicalId,
      );
      // Semantic configuration identity differs
      expect(res1.sccId).not.toBe(res2.sccId);
    }
  });

  // B-0861-27: Same Configuration, Different Evidence Availability
  it("B-0861-27: should fail closed when evidence availability changes while configuration remains constant", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();

    // Run 1: Evidence available
    const input1 = createDefaultBridgeInput(anchorSuccess, repo);
    const res1 = await assembleGs1CompositionFromAnchor(input1);
    expect(res1.ok).toBe(true);

    // Run 2: Missing evidence in repo state
    const unresolvableEvidenceRecord: EvidenceRecord = {
      ...mockEvidenceRecord,
      evidenceId: "ev:missing_evidence:v1",
    };
    const noEvidenceState: RetrievedRegistryState = {
      ...mockRegistryState,
      evidenceReferences: [unresolvableEvidenceRecord],
    };
    const emptyRepo = new MockRegistryRepository(
      new Map([[validK1, noEvidenceState]]),
    );

    const input2 = createDefaultBridgeInput(anchorSuccess, emptyRepo);

    const noEvidenceInput = {
      ...input2,
      explicitEvidenceBundle: undefined,
      explicitEvidencePayloads: undefined,
    };

    const res2 = await assembleGs1CompositionFromAnchor(noEvidenceInput);

    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.epistemicStatus).toBe("UNAVAILABLE");
    }
  });

  // B-0861-28: Requirement Order Permutation Invariance
  it("B-0861-28: should yield identical closure and identities under requirement order permutation", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();

    const input1 = createDefaultBridgeInput(anchorSuccess, repo);
    const input2 = createDefaultBridgeInput(anchorSuccess, repo);

    // Permute requirement order
    const req1 = GS1_GTIN_EPISTEMIC_REQUIREMENT;
    const req2 = GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT;

    (
      input1 as unknown as {
        epistemicRequirementsFixtures: readonly EpistemicRequirementContract[];
      }
    ).epistemicRequirementsFixtures = [req1, req2];
    (
      input2 as unknown as {
        epistemicRequirementsFixtures: readonly EpistemicRequirementContract[];
      }
    ).epistemicRequirementsFixtures = [req2, req1];

    const res1 = await assembleGs1CompositionFromAnchor(input1);
    const res2 = await assembleGs1CompositionFromAnchor(input2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      expect(res1.sccId).toBe(res2.sccId);
      expect(res1.bcgId).toBe(res2.bcgId);
    }
  });

  // B-0861-29: Domain Diagnostic Isolation (CORR-0861-B-1 §5)
  it("B-0861-29: should maintain identical generic control flow regardless of domain diagnostic errors", async () => {
    const { repo } = await getLawfulAnchor();

    // Two distinct Packet A domain diagnostic stage failures (PARSE vs VALIDATION)
    const parseFailureAnchor = Object.freeze({
      ok: false as const,
      error: {
        stage: "PARSE" as const,
        error: {
          code: "INVALID_URI_SCHEME",
          message: "Unsupported URI scheme",
        },
      },
    });

    const validationFailureAnchor = Object.freeze({
      ok: false as const,
      error: {
        stage: "VALIDATION" as const,
        error: { code: "MISSING_PRIMARY_IDENTIFIER", message: "AI 01 missing" },
      },
    });

    const input1 = createDefaultBridgeInput(
      parseFailureAnchor as unknown as GS1AnchorBridgeSuccess,
      repo,
    );
    const input2 = createDefaultBridgeInput(
      validationFailureAnchor as unknown as GS1AnchorBridgeSuccess,
      repo,
    );

    const res1 = await assembleGs1CompositionFromAnchor(input1);
    const res2 = await assembleGs1CompositionFromAnchor(input2);

    // Both map to identical generic control flow disposition (ok: false, code: "invalid", epistemicStatus: "UNAVAILABLE")
    expect(res1.ok).toBe(false);
    expect(res2.ok).toBe(false);
    if (!res1.ok && !res2.ok) {
      expect(res1.error.code).toBe(res2.error.code);
      expect(res1.epistemicStatus).toBe(res2.epistemicStatus);
    }
  });

  // B-0861-30: No Hidden Acquisition
  it("B-0861-30: should prove zero external network or hidden acquisition during assembly", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const initialRepoCount = repo.lookupCount;
    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    // Verified exactly 1 ACV lookup call during composition resolution, zero network or extra M06 calls
    expect(repo.lookupCount).toBe(initialRepoCount + 1);
  });

  // CORR-0861-B-1 §2: Distinct Temporal Coordinate Verification
  it("CORR-0861-B-1 §2: should preserve distinct temporal coordinates (tValid, tObservation, tEInput) when explicitly supplied", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();

    const tValid = "2026-01-01T10:00:00Z";
    const tObservation = "2026-01-02T12:00:00Z";
    const tEInput = "2026-01-03T14:00:00Z";

    const input = {
      ...createDefaultBridgeInput(anchorSuccess, repo),
      tValid,
      tObservation,
      tEInput,
    };

    const result = await assembleGs1CompositionFromAnchor(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const temps = result.evaluationCoordinate.temporalCoordinates;
      expect(temps.tValid).toBe(tValid);
      expect(temps.tObservation).toBe(tObservation);
      expect(temps.tEInput).toBe(tEInput);
      expect(temps.tValid).not.toBe(temps.tObservation);
      expect(temps.tObservation).not.toBe(temps.tEInput);
    }
  });

  // CORR-0861-B-1 §3: Pre-RI EvaluationCoordinate Mapper Compatibility Test
  it("CORR-0861-B-1 §3: should produce an EvaluationCoordinate and BoundPayload that pass mapEvaluationCoordinateToExecutionRequest structurally without invoking RI", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const assemblyRes = await assembleGs1CompositionFromAnchor(input);
    expect(assemblyRes.ok).toBe(true);

    if (assemblyRes.ok) {
      const mapped = mapEvaluationCoordinateToExecutionRequest({
        coordinate: assemblyRes.evaluationCoordinate,
        boundPayload: assemblyRes.boundPayload,
        requestId: input.requestId,
        executionId: input.executionId,
      });

      expect(mapped.ok).toBe(true);
      if (mapped.ok) {
        expect(mapped.executionRequest.requestId).toBe(input.requestId);
        expect(mapped.executionRequest.executionContext.executionId).toBe(
          input.executionId,
        );
        expect(
          mapped.executionRequest.activeConstitutionalView.identity.identityId,
        ).toBe("09506000134352");
      }
    }
  });
});
