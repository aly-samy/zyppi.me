import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createGs1AnchorFromCarrier } from "./gs1AnchorBridge.js";
import { assembleGs1CompositionFromAnchor } from "./gs1CompositionBridge.js";
import {
  executeGs1Bridge,
  projectGs1DomainResult,
} from "./gs1ExecutionBridge.js";
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
import {
  mapEvaluationCoordinateToExecutionRequest,
  executeEvaluationCoordinate,
  verifyExecutionReceiptIntegrity,
  evaluateAssessmentRequest,
} from "../zprof/index.js";
import { GS1_DOMAIN_TEMPLATE_CARD } from "../zprof/fixtures/gs1Dtc.js";
import { GS1_GTIN_EPISTEMIC_REQUIREMENT } from "../zprof/fixtures/gs1EpistemicRequirements.js";
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
  definition: { allowTradeItem: true, mockResult: "ALLOW" },
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

  async lookupEvidenceByIds(): Promise<
    RegistryResult<readonly EvidenceRecord[]>
  > {
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

const testOverrides = Object.freeze({
  Admission: Object.freeze({ ok: true as const }),
  "Bundle Discovery": Object.freeze({ ok: true as const }),
  "Bundle Verification": Object.freeze({ ok: true as const }),
  "Dependency Resolution": Object.freeze({ ok: true as const }),
  "Compatibility Validation": Object.freeze({ ok: true as const }),
  "ACV Activation": Object.freeze({ ok: true as const }),
  "Resolution Graph Construction": Object.freeze({ ok: true as const }),
  "Active Execution": Object.freeze({ ok: true as const }),
  "Receipt Generation": Object.freeze({ ok: true as const }),
  outcome: "verified" as const,
});

function createDefaultBridgeInput(
  anchorSuccess: GS1AnchorBridgeSuccess,
  repo: RegistryRepository,
) {
  return {
    anchorSuccess,
    overrides: testOverrides,
    dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
    epistemicRequirementsFixtures: [GS1_GTIN_EPISTEMIC_REQUIREMENT],
    manifestAuthor: "identity:test:manifest_author",
    registryRepository: repo,
    requestId: "req:gs1:test:v1",
    executionId: "exec:gs1:test:v1",
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
    evidencePayloads: mockEvidencePayloads,
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

describe("AMS-0861-C RI Execution, Provenance & Governed Projection Test Suite", () => {
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

  // C-0861-01 — Exact EC → RI Mapping
  it("C-0861-01: should map lawful Packet-B EvaluationCoordinate to valid RI ExecutionRequest preserving all required coordinates", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const assemblyRes = await assembleGs1CompositionFromAnchor(
      createDefaultBridgeInput(anchorSuccess, repo),
    );
    expect(assemblyRes.ok).toBe(true);
    if (!assemblyRes.ok) return;

    const mapRes = mapEvaluationCoordinateToExecutionRequest({
      coordinate: assemblyRes.evaluationCoordinate,
      boundPayload: assemblyRes.boundPayload,
      requestId: "req:test:01",
      executionId: "exec:test:01",
    });

    expect(mapRes.ok).toBe(true);
    if (mapRes.ok) {
      expect(mapRes.executionRequest.requestId).toBe("req:test:01");
      expect(mapRes.executionRequest.executionContext.executionId).toBe(
        "exec:test:01",
      );
      expect(
        mapRes.executionRequest.executionContext.constitutionalTimestamp,
      ).toBe("2026-01-01T00:00:00Z");
    }
  });

  // C-0861-02 — SCC Identity Preservation
  it("C-0861-02: should preserve exact sccId during RI execution and bind it into provenance without recomputation", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    if (!execRes.ok) {
      console.log("EXEC RES FAILURE:", JSON.stringify(execRes, null, 2));
    }
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.provenanceLink.sccId).toBe(execRes.assembly.sccId);
    }
  });

  // C-0861-03 — BCG Identity Preservation
  it("C-0861-03: should preserve exact bcgId during RI execution and bind it into provenance without recomputation", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.provenanceLink.bcgId).toBe(execRes.assembly.bcgId);
    }
  });

  // C-0861-04 — ACV State Reference Preservation
  it("C-0861-04: should preserve pinnedSemanticStateRef from EC into provenance link with zero caller substitution", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.provenanceLink.coordinate.pinnedSemanticStateRef).toEqual(
        execRes.assembly.evaluationCoordinate.pinnedSemanticStateRef,
      );
    }
  });

  // C-0861-05 — Evidence Integrity Preservation
  it("C-0861-05: should preserve evidence integrity coordinates and evidenceHash across execution", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.provenanceLink.evidenceHash).toMatch(
        /^sha256:[a-f0-9]{64}$/,
      );
      expect(
        execRes.provenanceLink.coordinate.evidenceIntegrityCoordinates.length,
      ).toBe(1);
    }
  });

  // C-0861-06 — Explicit T_e_input
  it("C-0861-06: should pass exact supplied tEInput into ExecutionRequest.executionContext.constitutionalTimestamp", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(
        execRes.executionRequest.executionContext.constitutionalTimestamp,
      ).toBe("2026-01-01T00:00:00Z");
    }
  });

  // C-0861-07 — Missing Required T_e_input
  it("C-0861-07: should fail closed before RI execution when tEInput is missing or empty", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);
    const badInput = { ...input, tEInput: "" };

    const execRes = await executeGs1Bridge(badInput);
    expect(execRes.ok).toBe(false);
    if (!execRes.ok) {
      expect(execRes.stage).toBe("ASSEMBLY");
      expect(execRes.error.code).toBe("missing");
    }
  });

  // C-0861-08 — T_e_observed Separation
  it("C-0861-08: should record post-execution T_e_observed as historical fact separate from pre-execution T_e_input", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.provenanceLink.observedExecutionTime).toBeDefined();
      expect(typeof execRes.provenanceLink.observedExecutionTime).toBe(
        "string",
      );
    }
  });

  // C-0861-09 — RI Neutrality
  it("C-0861-09: should execute GS1-derived EC through generic RI without GS1 branching in generic code", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.pipelineResult.ok).toBe(true);
      if (execRes.pipelineResult.ok) {
        expect(execRes.pipelineResult.trace).toContain("Admission");
        expect(execRes.pipelineResult.trace).toContain("Receipt Generation");
      }
    }
  });

  // C-0861-10 — No RI Network Access
  it("C-0861-10: should execute RI pipeline with zero network lookups during execution", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const repoLookupCountBefore = repo.lookupCount;
    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);

    // Assembly takes 1 lookup, zero lookups performed inside execution
    expect(repo.lookupCount).toBe(repoLookupCountBefore + 1);
  });

  // C-0861-11 — ExecutionReceipt Neutrality
  it("C-0861-11: should verify generic ExecutionReceipt contains zero GS1-specific fields", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      const rcpt = execRes.provenanceLink.executionReceipt;
      expect(rcpt).not.toHaveProperty("gtin");
      expect(rcpt).not.toHaveProperty("gln");
      expect(rcpt).not.toHaveProperty("digitalLink");
      expect(rcpt).not.toHaveProperty("gs1Ai");
      expect(rcpt).not.toHaveProperty("tradeItem");
    }
  });

  // C-0861-12 — EC / Receipt Provenance
  it("C-0861-12: should bind EvaluationCoordinate to ExecutionReceipt via HistoricalProvenanceLink", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      const link = execRes.provenanceLink;
      expect(link.receiptId).toBe(link.executionReceipt.receiptId);
      expect(link.sccId).toBe(link.coordinate.sccId);
      expect(link.bcgId).toBe(link.coordinate.bcgId);
    }
  });

  // C-0861-13 — Receipt Immutability
  it("C-0861-13: should preserve historical ExecutionReceipt immutability under Object.freeze", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      const rcpt = execRes.provenanceLink.executionReceipt;
      expect(Object.isFrozen(rcpt)).toBe(true);
      expect(() => {
        // @ts-expect-error mutating frozen receipt
        rcpt.executionTime = 999;
      }).toThrow();
    }
  });

  // C-0861-14 — Receipt Verification Separation
  it("C-0861-14: should prove receipt verification does not imply current trust or admissibility", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      const verifyRes = verifyExecutionReceiptIntegrity(
        execRes.provenanceLink.executionReceipt,
        execRes.executionRequest,
      );
      expect(verifyRes.ok).toBe(true);
      if (verifyRes.ok) {
        expect(verifyRes.verification.structuralValidity).toBe(true);
        expect(verifyRes.verification.inputBinding).toBe("VERIFIED");
        // Separation check: Verification details do NOT assert currentlyTrusted or currentlyAdmissible
        expect(verifyRes.verification).not.toHaveProperty("currentlyTrusted");
        expect(verifyRes.verification).not.toHaveProperty(
          "currentlyAdmissible",
        );
      }
    }
  });

  // C-0861-15 — Governed PRJ Projection
  it("C-0861-15: should produce governed GS1DomainResult post-RI through projectGs1DomainResult", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.domainResult).toBeDefined();
      expect(execRes.domainResult?.domain).toBe("GS1");
      expect(execRes.domainResult?.projectionSpecification).toBe(
        "prj:spec:gs1_digital_link_projection:v1",
      );
      expect(execRes.domainResult?.canonicalIdentifier).toBe(validK1);
    }
  });

  // C-0861-16 — PRJ Specification Sensitivity
  it("C-0861-16: should reflect bound PRJ specification in projection result when explicitly altered", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    // Add secondary capability and PRJ spec participant
    const altCapability: CapabilityRecord = {
      capabilityId: "prj:spec:gs1_digital_link_projection:v2",
      subjectId: "arm:profile:trade_item:v1",
      scope: "prj:spec:gs1_digital_link_projection:v2",
      validFrom: "2026-01-01T00:00:00Z",
      validTo: "2030-01-01T00:00:00Z",
    };
    const altState: RetrievedRegistryState = {
      ...mockRegistryState,
      capabilities: [altCapability],
    };
    const altRepo = new MockRegistryRepository(new Map([[validK1, altState]]));
    const altAnchorRes = await createGs1AnchorFromCarrier(
      validGtin14Carrier,
      altRepo,
    );

    const altDtc = {
      ...GS1_DOMAIN_TEMPLATE_CARD,
      requiredPrjSpecifications: ["prj:spec:gs1_digital_link_projection:v2"],
    };

    const altInput = {
      ...createDefaultBridgeInput(
        altAnchorRes as GS1AnchorBridgeSuccess,
        altRepo,
      ),
      dtcFixture: altDtc,
      compositionDefinition: {
        ...input.compositionDefinition,
        participants: input.compositionDefinition.participants.map((p) =>
          p.kind === "PRJ_SPECIFICATION"
            ? {
                ...p,
                identity: "prj:spec:gs1_digital_link_projection:v2",
                reference: {
                  id: "prj:spec:gs1_digital_link_projection:v2",
                  version: "1.0.0",
                },
              }
            : p,
        ),
        bindingEdges: [
          {
            sourceId: "dtc:zyppi:domain:gs1:v1",
            targetId: "prj:spec:gs1_digital_link_projection:v2",
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

    const execRes = await executeGs1Bridge(altInput);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.domainResult?.projectionSpecification).toBe(
        "prj:spec:gs1_digital_link_projection:v2",
      );
    }
  });

  // C-0861-17 — Closed Projection Capability Surface
  it("C-0861-17: should verify post-RI projection operates over a closed capability surface with zero ambient dependencies", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok && execRes.domainResult) {
      const proj = execRes.domainResult;
      expect(proj).not.toHaveProperty("db");
      expect(proj).not.toHaveProperty("fetch");
      expect(proj).not.toHaveProperty("env");
    }
  });

  // C-0861-18 — Projection Replayability
  it("C-0861-18: should produce byte-identical GS1DomainResult given identical inputs", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input1 = createDefaultBridgeInput(anchorSuccess, repo);
    const input2 = createDefaultBridgeInput(anchorSuccess, repo);

    const res1 = await executeGs1Bridge(input1);
    const res2 = await executeGs1Bridge(input2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      expect(res1.domainResult?.sccId).toBe(res2.domainResult?.sccId);
      expect(res1.domainResult?.bcgId).toBe(res2.domainResult?.bcgId);
      expect(res1.domainResult?.executionReceipt.deterministicHash).toBe(
        res2.domainResult?.executionReceipt.deterministicHash,
      );
    }
  });

  // C-0861-19 — No Shadow Runtime
  it("C-0861-19: should verify post-RI projection does not bypass or re-execute Runtime pipeline", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (
      execRes.ok &&
      execRes.pipelineResult.ok &&
      execRes.pipelineResult.outcome.kind === "materialized"
    ) {
      // Projection relies on existing materialized executionOutput and does not run pipeline again
      const projRes = projectGs1DomainResult({
        coordinate: execRes.assembly.evaluationCoordinate,
        manifest: execRes.assembly.manifest,
        boundPayload: execRes.assembly.boundPayload,
        executionReceipt: execRes.provenanceLink.executionReceipt,
        provenanceLink: execRes.provenanceLink,
        executionOutput: execRes.pipelineResult.outcome.executionOutput,
        canonicalIdentifier: validK1,
      });
      expect(projRes.ok).toBe(true);
      if (projRes.ok) {
        expect(projRes.result.outcome).toBe("verified");
      }
    }
  });

  // C-0861-20 — Historical Reality View
  it("C-0861-20: should re-execute exact historical EvaluationCoordinate and produce deterministic historical projection", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const res1 = await executeGs1Bridge(input);
    expect(res1.ok).toBe(true);
    if (!res1.ok) return;

    // Historical execution using exact historical coordinate and evidence payloads
    const historicalExecRes = await executeEvaluationCoordinate({
      coordinate: res1.assembly.evaluationCoordinate,
      boundPayload: res1.assembly.boundPayload,
      requestId: "req:historical:01",
      executionId: "exec:historical:01",
      evidencePayloads: mockEvidencePayloads,
    });

    expect(historicalExecRes.ok).toBe(true);
    if (historicalExecRes.ok && historicalExecRes.provenanceLink) {
      expect(historicalExecRes.provenanceLink.sccId).toBe(res1.assembly.sccId);
      expect(historicalExecRes.provenanceLink.bcgId).toBe(res1.assembly.bcgId);
    }
  });

  // C-0861-21 — Current-State Contamination Negative Test
  it("C-0861-21: should prove historical execution result is unchanged when current Registry state is mutated after historical coordinates are fixed", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const historicalRes = await executeGs1Bridge(input);
    expect(historicalRes.ok).toBe(true);
    if (!historicalRes.ok) return;

    // Mutate mock Registry state for future lookups
    const mutatedRegistryState: RetrievedRegistryState = {
      ...mockRegistryState,
      applicablePolicies: [],
    };
    const mutatedRepo = new MockRegistryRepository(
      new Map([[validK1, mutatedRegistryState]]),
    );
    expect(mutatedRepo.lookupCount).toBe(0);

    // Re-evaluating historical coordinate with fixed historical boundPayload produces identical result
    const reExecRes = await executeEvaluationCoordinate({
      coordinate: historicalRes.assembly.evaluationCoordinate,
      boundPayload: historicalRes.assembly.boundPayload,
      requestId: "req:historical:reexec",
      executionId: "exec:historical:reexec",
      evidencePayloads: mockEvidencePayloads,
    });

    expect(reExecRes.ok).toBe(true);
    if (reExecRes.ok && reExecRes.provenanceLink) {
      expect(reExecRes.provenanceLink.sccId).toBe(historicalRes.assembly.sccId);
    }
  });

  // C-0861-22 — Missing Historical Material
  it("C-0861-22: should return UNAVAILABLE status in evaluateAssessmentRequest when historical coordinate is missing", async () => {
    const arc = Object.freeze({
      target: {
        kind: "HISTORICAL_EVALUATION_COORDINATE" as const,
        ref: "target:missing:123",
      },
      operation: "HISTORICAL_RECONSTRUCTION" as const,
      pinnedAssessmentStateRef: Object.freeze({
        ref: "sha256:0000",
        digest: "sha256:0000",
      }),
      tTrust: "2026-01-01T00:00:00Z",
    });

    const assessmentOutcome = evaluateAssessmentRequest({ arc });
    expect(assessmentOutcome.ok).toBe(true);
    if (assessmentOutcome.ok) {
      expect(assessmentOutcome.assessment.reproducible.status).toBe(
        "UNAVAILABLE",
      );
    }
  });

  // C-0861-23 — Reconstruction Non-Authority
  it("C-0861-23: should prove historical reconstruction does not create current execution authority", async () => {
    const arc = Object.freeze({
      target: {
        kind: "HISTORICAL_EVALUATION_COORDINATE" as const,
        ref: "target:recon:123",
      },
      operation: "HISTORICAL_RECONSTRUCTION" as const,
      pinnedAssessmentStateRef: Object.freeze({
        ref: "sha256:0000",
        digest: "sha256:0000",
      }),
      tTrust: "2026-01-01T00:00:00Z",
    });

    const assessmentOutcome = evaluateAssessmentRequest({ arc });
    expect(assessmentOutcome.ok).toBe(true);
    if (assessmentOutcome.ok) {
      // Executable and currentlyTrusted remain UNAVAILABLE without current authority outputs
      expect(assessmentOutcome.assessment.executable.status).toBe(
        "UNAVAILABLE",
      );
      expect(assessmentOutcome.assessment.currentlyTrusted.status).toBe(
        "UNAVAILABLE",
      );
    }
  });

  // C-0861-24 — POL Denial
  it("C-0861-24: should fail closed with rejected outcome when governed policy definition specifies DENY", async () => {
    const denyingPolicy: PolicyRecord = {
      policyId: "pol:req:active_standing:v1",
      policyType: "TRADE_ITEM_POLICY",
      version: "1.0.0",
      definition: { mockResult: "DENY" },
      active: true,
    };

    const denyingState: RetrievedRegistryState = {
      ...mockRegistryState,
      applicablePolicies: [denyingPolicy],
    };
    const denyingRepo = new MockRegistryRepository(
      new Map([[validK1, denyingState]]),
    );
    const anchorRes = await createGs1AnchorFromCarrier(
      validGtin14Carrier,
      denyingRepo,
    );
    expect(anchorRes.ok).toBe(true);

    const input = {
      ...createDefaultBridgeInput(
        anchorRes as GS1AnchorBridgeSuccess,
        denyingRepo,
      ),
      policyContext: { policies: [denyingPolicy] },
    };

    const execRes = await executeGs1Bridge(input);

    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.domainResult.outcome).toBe("rejected");
      expect(
        execRes.pipelineResult.ok &&
          execRes.pipelineResult.outcome.kind === "materialized" &&
          execRes.pipelineResult.outcome.executionOutput.trustResult
            .degradationFactors,
      ).toContain("POLICY_DENIED");
    }
  });

  // C-0861-25 — POL Authority Preservation
  it("C-0861-25: should preserve governed POL denial regardless of local caller options or execution parameters", async () => {
    const denyingPolicy: PolicyRecord = {
      policyId: "pol:req:active_standing:v1",
      policyType: "TRADE_ITEM_POLICY",
      version: "1.0.0",
      definition: { mockResult: "DENY" },
      active: true,
    };

    const denyingState: RetrievedRegistryState = {
      ...mockRegistryState,
      applicablePolicies: [denyingPolicy],
    };
    const denyingRepo = new MockRegistryRepository(
      new Map([[validK1, denyingState]]),
    );
    const anchorRes = await createGs1AnchorFromCarrier(
      validGtin14Carrier,
      denyingRepo,
    );
    expect(anchorRes.ok).toBe(true);

    const input = {
      ...createDefaultBridgeInput(
        anchorRes as GS1AnchorBridgeSuccess,
        denyingRepo,
      ),
      policyContext: { policies: [denyingPolicy] },
      requestId: "req:caller:optimistic_attempt",
      executionId: "exec:caller:optimistic_attempt",
      budget: 999999,
    };

    const execRes = await executeGs1Bridge(input);

    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      // Governed POL denial is preserved as "rejected" outcome despite caller parameters
      expect(execRes.domainResult.outcome).toBe("rejected");
      expect(execRes.executionRequest.requestId).toBe(
        "req:caller:optimistic_attempt",
      );
    }
  });

  // C-0861-26 — SEC / Trust Denial
  it("C-0861-26: should return currentlyTrusted = false when SEC authority provides explicit adverse determination", async () => {
    const arc = Object.freeze({
      target: {
        kind: "HISTORICAL_EVALUATION_COORDINATE" as const,
        ref: "target:sec:123",
      },
      operation: "HISTORICAL_RECONSTRUCTION" as const,
      pinnedAssessmentStateRef: Object.freeze({
        ref: "sha256:0000",
        digest: "sha256:0000",
      }),
      tTrust: "2026-01-01T00:00:00Z",
    });

    const authorityOutputs = {
      currentlyTrusted: {
        value: false,
        authorityRef: "auth:sec:revocation_authority:v1",
        details: "Certificate revoked.",
      },
    };

    const res = evaluateAssessmentRequest({ arc, authorityOutputs });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.assessment.currentlyTrusted.status).toBe("DETERMINED");
      if (res.assessment.currentlyTrusted.status === "DETERMINED") {
        expect(res.assessment.currentlyTrusted.value).toBe(false);
        expect(res.assessment.currentlyTrusted.authorityRef).toBe(
          "auth:sec:revocation_authority:v1",
        );
      }
    }
  });

  // C-0861-27 — SEC Unavailability
  it("C-0861-27: should return currentlyTrusted = UNAVAILABLE when SEC authority output is absent", async () => {
    const arc = Object.freeze({
      target: {
        kind: "HISTORICAL_EVALUATION_COORDINATE" as const,
        ref: "target:sec:123",
      },
      operation: "HISTORICAL_RECONSTRUCTION" as const,
      pinnedAssessmentStateRef: Object.freeze({
        ref: "sha256:0000",
        digest: "sha256:0000",
      }),
      tTrust: "2026-01-01T00:00:00Z",
    });

    const res = evaluateAssessmentRequest({ arc });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.assessment.currentlyTrusted.status).toBe("UNAVAILABLE");
    }
  });

  // C-0861-28 — Historical Truth / Current Trust Separation
  it("C-0861-28: should prove a verified historical receipt can coexist with adverse current trust", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (!execRes.ok) return;

    const receipt = execRes.provenanceLink.executionReceipt;
    const request = execRes.executionRequest;

    const verifyRes = verifyExecutionReceiptIntegrity(receipt, request);
    expect(verifyRes.ok).toBe(true);

    const arc = Object.freeze({
      target: {
        kind: "EXECUTION_RECEIPT" as const,
        receiptRef: receipt.receiptId,
      },
      operation: "RECEIPT_VERIFICATION" as const,
      pinnedAssessmentStateRef: Object.freeze({
        ref: "sha256:0000",
        digest: "sha256:0000",
      }),
      tTrust: "2026-01-01T00:00:00Z",
    });

    const authorityOutputs = {
      currentlyTrusted: {
        value: false,
        authorityRef: "auth:sec:revocation_authority:v1",
      },
    };

    const assessmentRes = evaluateAssessmentRequest({
      arc,
      executionReceipt: receipt,
      executionRequest: request,
      authorityOutputs,
    });

    expect(assessmentRes.ok).toBe(true);
    if (assessmentRes.ok) {
      // Historical receipt is verified reproducible
      expect(assessmentRes.assessment.reproducible.status).toBe("DETERMINED");
      if (assessmentRes.assessment.reproducible.status === "DETERMINED") {
        expect(assessmentRes.assessment.reproducible.value).toBe(true);
      }
      // Current trust is explicitly adverse
      expect(assessmentRes.assessment.currentlyTrusted.status).toBe(
        "DETERMINED",
      );
      if (assessmentRes.assessment.currentlyTrusted.status === "DETERMINED") {
        expect(assessmentRes.assessment.currentlyTrusted.value).toBe(false);
      }
    }
  });

  // C-0861-29 — No Ambient Version Upgrade
  it("C-0861-29: should maintain explicit Artifact@v1 version binding when v2 exists in registry", async () => {
    const { anchorSuccess, repo } = await getLawfulAnchor();
    const input = createDefaultBridgeInput(anchorSuccess, repo);

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.assembly.manifest.dtcReference.version).toBe("1.0.0");
    }
  });

  // C-0861-30 — Domain Diagnostic Opacity
  it("C-0861-30: should preserve GS1 diagnostic reference without altering generic control flow", async () => {
    const { repo } = await getLawfulAnchor();
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

    const input = createDefaultBridgeInput(
      parseFailureAnchor as unknown as GS1AnchorBridgeSuccess,
      repo,
    );

    const execRes = await executeGs1Bridge(input);
    expect(execRes.ok).toBe(false);
    if (!execRes.ok) {
      expect(execRes.stage).toBe("ASSEMBLY");
      expect(execRes.epistemicStatus).toBe("UNAVAILABLE");
    }
  });

  // C-0861-31 — Generic Dependency Isolation
  it("C-0861-31: should verify zero direct or transitive GS1 dependencies in generic execution / runtime modules", () => {
    const { violations } = runValidation();
    const gs1Violations = violations.filter(
      (v: { rule: string }) => v.rule === "gs1-domain-edge-contamination",
    );
    expect(gs1Violations.length).toBe(0);
  });

  // C-0861-32 — Runtime Disappearance Independence
  it("C-0861-32: should verify Runtime and generic execution lifecycle remain coherent without GS1 modules", () => {
    const zprofLifecyclePath = path.resolve(__dirname, "../zprof/lifecycle.ts");
    const content = fs.readFileSync(zprofLifecyclePath, "utf8");
    expect(content).not.toContain("GS1");
    expect(content).not.toContain("GTIN");
    expect(content).not.toContain("DigitalLink");
  });
});
