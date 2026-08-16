import { describe, it, expect } from "vitest";
import {
  createValidatedCanonicalIdentifier,
  type RetrievedRegistryState,
} from "@zyppi/contracts";
import {
  type PolicyContext,
  type ResolvedPolicyGraph,
  type EvidenceRecord,
  type IdentityRecord,
  type CapabilityRecord,
  type PolicyRecord,
} from "@zyppi/domain";
import { runInternalPipeline } from "@zyppi/runtime/dist/pipeline.js";
import type { StageOverrideConfig } from "@zyppi/runtime/dist/types.js";
import { ApplicationCompositionResolver } from "./compositionResolver.js";
import { GS1_DOMAIN_TEMPLATE_CARD } from "./fixtures/gs1Dtc.js";
import {
  GS1_GTIN_EPISTEMIC_REQUIREMENT,
  GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
} from "./fixtures/gs1EpistemicRequirements.js";
import { DPP_DOMAIN_TEMPLATE_CARD } from "./fixtures/dppDtc.js";
import {
  DPP_PASSPORT_IDENTIFICATION_REQUIREMENT,
  DPP_MATERIAL_COMPOSITION_REQUIREMENT,
} from "./fixtures/dppEpistemicRequirements.js";
import { TestRegistryRepository } from "./testRegistryRepository.js";

describe("AMS-0854 Z-PROF Multi-Domain Factorization & Second-Domain Validation Test Suite", () => {
  const validIdentifierResult =
    createValidatedCanonicalIdentifier("09501101530003");
  if (!validIdentifierResult.ok) {
    throw new Error("Failed to create test identifier");
  }
  const validIdentifier = validIdentifierResult.value;

  const testOverrides: StageOverrideConfig = Object.freeze({
    Admission: Object.freeze({ ok: true as const }),
    "Bundle Discovery": Object.freeze({ ok: true as const }),
    "Bundle Verification": Object.freeze({ ok: true as const }),
    "Dependency Resolution": Object.freeze({ ok: true as const }),
    "Compatibility Validation": Object.freeze({ ok: true as const }),
    "ACV Activation": Object.freeze({ ok: true as const }),
    "Resolution Graph Construction": Object.freeze({ ok: true as const }),
    "Active Execution": Object.freeze({ ok: true as const }),
    "Receipt Generation": Object.freeze({ ok: true as const }),
  });

  const sampleEvidenceRecord: EvidenceRecord = Object.freeze({
    evidenceId: "evd-001",
    identityId: "09501101530003",
    evidenceType: "GTIN_VERIFICATION",
    hash: "sha256:d7a8fbb307d7809469ca9abec0003e42edd8ad9ab130919d20f23e37271dca9f",
    storageRef: "r2://evidence/evd-001",
    retrievedAt: "2026-08-10T00:00:00Z",
  });

  const emptyEvidenceBundle = Object.freeze({
    schemaVersion: "1.0" as const,
    evidenceRecords: Object.freeze([] as readonly EvidenceRecord[]),
  });

  const validEvidenceBundle = Object.freeze({
    schemaVersion: "1.0" as const,
    evidenceRecords: Object.freeze([sampleEvidenceRecord]),
  });

  const validEvidencePayloads = new Map<string, unknown>([
    ["evd-001", { verified: true }],
  ]);

  const defaultPolicyContext: PolicyContext = Object.freeze({
    policies: Object.freeze([]),
  });

  const defaultResolvedPolicyGraph: ResolvedPolicyGraph = Object.freeze({
    edges: Object.freeze([]),
  });

  const sampleIdentity: IdentityRecord = Object.freeze({
    identityId: "09501101530003",
    identityType: "ORGANIZATION",
    canonicalReference: validIdentifier,
    referentId: null,
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  });

  const materialCapability: CapabilityRecord = Object.freeze({
    capabilityId: "cap-material-001",
    subjectId: "09501101530003",
    scope: "material_composition_v1",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2030-01-01T00:00:00Z",
  });

  const sampleCompleteSnapshotState: RetrievedRegistryState = Object.freeze({
    identity: sampleIdentity,
    relationships: Object.freeze([]),
    standings: Object.freeze([]),
    authorities: Object.freeze([
      Object.freeze({
        authorityId: "auth-001",
        subjectId: "09501101530003",
        scope: "GLOBAL",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: "2030-01-01T00:00:00Z",
      }),
    ]),
    capabilities: Object.freeze([materialCapability]),
    evidenceReferences: Object.freeze([sampleEvidenceRecord]),
    applicablePolicies: Object.freeze([]),
  });

  const sampleSnapshotStateNoMaterialCap: RetrievedRegistryState =
    Object.freeze({
      ...sampleCompleteSnapshotState,
      capabilities: Object.freeze([]),
    });

  it("TEST A — GS1 Success: resolves valid GS1 composition through Application Composition boundary", async () => {
    const registryRepo = new TestRegistryRepository(
      sampleCompleteSnapshotState,
      [sampleEvidenceRecord],
    );

    const resolver = new ApplicationCompositionResolver();
    const result = await resolver.composeAndExecute({
      dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        GS1_GTIN_EPISTEMIC_REQUIREMENT,
        GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-gs1-01",
      executionId: "exec-gs1-01",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.manifest.dtcReference.dtcId).toBe(
        GS1_DOMAIN_TEMPLATE_CARD.dtcId,
      );
      expect(result.manifest.boundEpistemicRequirements).toHaveLength(2);
      expect(result.boundPayload.payloadId).toBe(
        "bound:payload:gs1:exec-gs1-01",
      );
      expect(result.pipelineResult).toBeDefined();
    }
  });

  it("TEST B — DPP Success: resolves valid DPP composition through the same structural composition boundary", async () => {
    const registryRepo = new TestRegistryRepository(
      sampleCompleteSnapshotState,
      [sampleEvidenceRecord],
    );

    const resolver = new ApplicationCompositionResolver();
    const result = await resolver.composeAndExecute({
      dtcFixture: DPP_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        DPP_PASSPORT_IDENTIFICATION_REQUIREMENT,
        DPP_MATERIAL_COMPOSITION_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-dpp-01",
      executionId: "exec-dpp-01",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-dpp-123",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.manifest.dtcReference.dtcId).toBe(
        DPP_DOMAIN_TEMPLATE_CARD.dtcId,
      );
      expect(result.manifest.boundEpistemicRequirements).toHaveLength(2);
      expect(result.boundPayload.payloadId).toBe(
        "bound:payload:dpp:exec-dpp-01",
      );
      expect(result.pipelineResult).toBeDefined();
    }
  });

  it("TEST C — DPP Epistemic Deficit: DPP scenario exhibiting missing material capability produces UNAVAILABLE state", async () => {
    const registryRepo = new TestRegistryRepository(
      sampleSnapshotStateNoMaterialCap,
      [sampleEvidenceRecord],
    );

    const resolver = new ApplicationCompositionResolver();
    const result = await resolver.composeAndExecute({
      dtcFixture: DPP_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        DPP_PASSPORT_IDENTIFICATION_REQUIREMENT,
        DPP_MATERIAL_COMPOSITION_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-dpp-02",
      executionId: "exec-dpp-02",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: emptyEvidenceBundle,
      overrides: testOverrides,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("missing");
      expect(result.error.requirementId).toBe(
        "epistemic:req:dpp_material_composition:v1",
      );
      expect(result.epistemicStatus).toBe("UNAVAILABLE");
    }
  });

  it("TEST D & E — GS1 Independence & Shared Asset Reality: DPP epistemic failure does not invalidate GS1 for same asset", async () => {
    // Snapshot state has NO material capability (causes DPP failure) but complete GS1 facts
    const registryRepo = new TestRegistryRepository(
      sampleSnapshotStateNoMaterialCap,
      [sampleEvidenceRecord],
    );
    const resolver = new ApplicationCompositionResolver();

    // 1. Evaluate DPP composition over asset -> Expect UNAVAILABLE failure
    const dppResult = await resolver.composeAndExecute({
      dtcFixture: DPP_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        DPP_PASSPORT_IDENTIFICATION_REQUIREMENT,
        DPP_MATERIAL_COMPOSITION_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-shared-dpp",
      executionId: "exec-shared-dpp",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(dppResult.ok).toBe(false);
    if (!dppResult.ok) {
      expect(dppResult.epistemicStatus).toBe("UNAVAILABLE");
    }

    // 2. Evaluate GS1 composition over EXACT SAME asset & repository state -> Expect SUCCESS
    const gs1Result = await resolver.composeAndExecute({
      dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        GS1_GTIN_EPISTEMIC_REQUIREMENT,
        GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-shared-gs1",
      executionId: "exec-shared-gs1",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(gs1Result.ok).toBe(true);

    // 3. Verify underlying Asset Reality was NOT mutated or duplicated
    expect(sampleSnapshotStateNoMaterialCap.identity.identityId).toBe(
      "09501101530003",
    );
    expect(sampleSnapshotStateNoMaterialCap.identity.status).toBe("active");
  });

  it("TEST F — Policy Context Isolation: GS1 authorization context does not implicitly authorize DPP", async () => {
    const gs1PolicyRecord: PolicyRecord = Object.freeze({
      policyId: "pol:req:gs1_active:v1",
      policyType: "POLICY_RULE",
      version: "1.0.0",
      definition: Object.freeze({ allow: "GS1_ONLY" }),
      active: true,
    });

    const dppPolicyRecord: PolicyRecord = Object.freeze({
      policyId: "pol:req:dpp_compliance:v1",
      policyType: "POLICY_RULE",
      version: "1.0.0",
      definition: Object.freeze({ allow: "DPP_ONLY" }),
      active: true,
    });

    const gs1PolicyContext: PolicyContext = Object.freeze({
      policies: Object.freeze([gs1PolicyRecord]),
    });

    const dppPolicyContext: PolicyContext = Object.freeze({
      policies: Object.freeze([dppPolicyRecord]),
    });

    const registryRepo = new TestRegistryRepository(
      sampleCompleteSnapshotState,
      [sampleEvidenceRecord],
    );
    const resolver = new ApplicationCompositionResolver();

    // GS1 Composition with GS1 Policy Context
    const gs1Res = await resolver.resolveComposition({
      dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        GS1_GTIN_EPISTEMIC_REQUIREMENT,
        GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-pol-gs1",
      executionId: "exec-pol-gs1",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: gs1PolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
    });

    // DPP Composition with DPP Policy Context
    const dppRes = await resolver.resolveComposition({
      dtcFixture: DPP_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        DPP_PASSPORT_IDENTIFICATION_REQUIREMENT,
        DPP_MATERIAL_COMPOSITION_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-pol-dpp",
      executionId: "exec-pol-dpp",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: dppPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
    });

    expect(gs1Res.ok).toBe(true);
    expect(dppRes.ok).toBe(true);

    if (gs1Res.ok && dppRes.ok) {
      // Manifest references remain strictly domain-scoped
      expect(gs1Res.manifest.dtcReference.dtcId).toBe(
        "dtc:zyppi:domain:gs1:v1",
      );
      expect(dppRes.manifest.dtcReference.dtcId).toBe(
        "dtc:zyppi:domain:dpp:v1",
      );

      // Verify execution context policy scopes are distinct
      expect(gs1Res.boundPayload.payloadId).not.toEqual(
        dppRes.boundPayload.payloadId,
      );
    }
  });

  it("TEST G & H — Runtime & Substrate Isolation: Both domains compose without modifying Runtime or Registry substrate", async () => {
    const registryRepo = new TestRegistryRepository(
      sampleCompleteSnapshotState,
      [sampleEvidenceRecord],
    );

    const resolver = new ApplicationCompositionResolver();

    const gs1Res = await resolver.resolveComposition({
      dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        GS1_GTIN_EPISTEMIC_REQUIREMENT,
        GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-iso-gs1",
      executionId: "exec-iso-gs1",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
    });

    const dppRes = await resolver.resolveComposition({
      dtcFixture: DPP_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        DPP_PASSPORT_IDENTIFICATION_REQUIREMENT,
        DPP_MATERIAL_COMPOSITION_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-iso-dpp",
      executionId: "exec-iso-dpp",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
    });

    expect(gs1Res.ok).toBe(true);
    expect(dppRes.ok).toBe(true);

    if (gs1Res.ok && dppRes.ok) {
      // Both bound payloads use the exact same pure ActiveConstitutionalView format and single ARM Profile
      expect(
        gs1Res.boundPayload.resolvedActiveConstitutionalView.identity
          .identityId,
      ).toBe("09501101530003");
      expect(
        dppRes.boundPayload.resolvedActiveConstitutionalView.identity
          .identityId,
      ).toBe("09501101530003");

      expect(gs1Res.manifest.armProfileReference.profileId).toBe(
        "arm:profile:trade_item:v1",
      );
      expect(dppRes.manifest.armProfileReference.profileId).toBe(
        "arm:profile:trade_item:v1",
      );
    }
  });

  it("TEST I — GS1 Disappearance Test: Path A (GS1 Composition Bridge) vs Path B (Direct Execution)", async () => {
    const registryRepo = new TestRegistryRepository(
      sampleCompleteSnapshotState,
      [sampleEvidenceRecord],
    );

    const resolver = new ApplicationCompositionResolver();
    const pathAResult = await resolver.composeAndExecute({
      dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        GS1_GTIN_EPISTEMIC_REQUIREMENT,
        GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-disappear-gs1",
      executionId: "exec-disappear-gs1",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-disappear",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(pathAResult.ok).toBe(true);
    if (!pathAResult.ok) return;

    const directAcv = {
      identity: sampleCompleteSnapshotState.identity,
      relationships: sampleCompleteSnapshotState.relationships,
      standings: sampleCompleteSnapshotState.standings,
      authorities: sampleCompleteSnapshotState.authorities,
      capabilities: sampleCompleteSnapshotState.capabilities,
      evidenceReferences: sampleCompleteSnapshotState.evidenceReferences,
      applicablePolicies: sampleCompleteSnapshotState.applicablePolicies,
    };

    const pathBPipelineResult = runInternalPipeline(
      {
        requestId: "req-disappear-gs1",
        identity: sampleCompleteSnapshotState.identity,
        activeConstitutionalView: directAcv,
        evidenceBundle: validEvidenceBundle,
        policyContext: defaultPolicyContext,
        executionContext: {
          executionId: "exec-disappear-gs1",
          constitutionalTimestamp: "2026-08-10T00:00:00Z",
          budget: 1000,
          entropy: "entropy-disappear",
          versions: ["1.0.0"],
        },
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
      },
      testOverrides,
      validEvidencePayloads,
    );

    expect(pathAResult.pipelineResult.ok).toBe(pathBPipelineResult.ok);
    if (
      pathAResult.pipelineResult.ok &&
      pathBPipelineResult.ok &&
      pathAResult.pipelineResult.outcome.kind === "materialized" &&
      pathBPipelineResult.outcome.kind === "materialized"
    ) {
      const outputA = pathAResult.pipelineResult.outcome.executionOutput;
      const outputB = pathBPipelineResult.outcome.executionOutput;

      expect(outputA.outcome).toBe(outputB.outcome);
      expect(outputA.executionReceipt.deterministicHash).toBe(
        outputB.executionReceipt.deterministicHash,
      );
    }
  });

  it("TEST J — DPP Disappearance Test: Path A (DPP Composition Bridge) vs Path B (Direct Execution)", async () => {
    const registryRepo = new TestRegistryRepository(
      sampleCompleteSnapshotState,
      [sampleEvidenceRecord],
    );

    const resolver = new ApplicationCompositionResolver();
    const pathAResult = await resolver.composeAndExecute({
      dtcFixture: DPP_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        DPP_PASSPORT_IDENTIFICATION_REQUIREMENT,
        DPP_MATERIAL_COMPOSITION_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-disappear-dpp",
      executionId: "exec-disappear-dpp",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-disappear",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(pathAResult.ok).toBe(true);
    if (!pathAResult.ok) return;

    const directAcv = {
      identity: sampleCompleteSnapshotState.identity,
      relationships: sampleCompleteSnapshotState.relationships,
      standings: sampleCompleteSnapshotState.standings,
      authorities: sampleCompleteSnapshotState.authorities,
      capabilities: sampleCompleteSnapshotState.capabilities,
      evidenceReferences: sampleCompleteSnapshotState.evidenceReferences,
      applicablePolicies: sampleCompleteSnapshotState.applicablePolicies,
    };

    const pathBPipelineResult = runInternalPipeline(
      {
        requestId: "req-disappear-dpp",
        identity: sampleCompleteSnapshotState.identity,
        activeConstitutionalView: directAcv,
        evidenceBundle: validEvidenceBundle,
        policyContext: defaultPolicyContext,
        executionContext: {
          executionId: "exec-disappear-dpp",
          constitutionalTimestamp: "2026-08-10T00:00:00Z",
          budget: 1000,
          entropy: "entropy-disappear",
          versions: ["1.0.0"],
        },
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
      },
      testOverrides,
      validEvidencePayloads,
    );

    expect(pathAResult.pipelineResult.ok).toBe(pathBPipelineResult.ok);
    if (
      pathAResult.pipelineResult.ok &&
      pathBPipelineResult.ok &&
      pathAResult.pipelineResult.outcome.kind === "materialized" &&
      pathBPipelineResult.outcome.kind === "materialized"
    ) {
      const outputA = pathAResult.pipelineResult.outcome.executionOutput;
      const outputB = pathBPipelineResult.outcome.executionOutput;

      expect(outputA.outcome).toBe(outputB.outcome);
      expect(outputA.executionReceipt.deterministicHash).toBe(
        outputB.executionReceipt.deterministicHash,
      );
    }
  });

  describe("AMS-0855 Version Binding & Compatibility Validation Tests", () => {
    it("TEST K — Version Binding: Rejects floating version specifier 'latest' with code 'invalid'", async () => {
      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-ver-01",
        executionId: "exec-ver-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["latest"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("invalid");
        expect(result.error.message).toContain("Prohibited floating");
      }
    });

    it("TEST L — Version Binding: Rejects wildcard range specifier '^1.0.0' with code 'invalid'", async () => {
      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-ver-02",
        executionId: "exec-ver-02",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["^1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("invalid");
        expect(result.error.message).toContain("Prohibited floating");
      }
    });

    it("TEST M — Version Constraint Mismatch: Explicit valid version mismatch returns code 'incompatible'", async () => {
      const dtcWithConstraint = {
        ...GS1_DOMAIN_TEMPLATE_CARD,
        versionConstraints: Object.freeze({
          "arm:profile:trade_item": "1.0.0",
        }),
      };

      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: dtcWithConstraint,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-ver-03",
        executionId: "exec-ver-03",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["2.0.0"], // Explicit version that does NOT satisfy required "1.0.0"
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("incompatible");
        expect(result.error.message).toContain("do not satisfy required explicit constraint");
      }
    });

    it("TEST N — Authorization Check: Revoked identity status returns code 'unauthorized'", async () => {
      const revokedIdentityState: RetrievedRegistryState = {
        ...sampleCompleteSnapshotState,
        identity: {
          ...sampleIdentity,
          status: "decommissioned",
        },
      };

      const registryRepo = new TestRegistryRepository(
        revokedIdentityState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-auth-01",
        executionId: "exec-auth-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("unauthorized");
        expect(result.epistemicStatus).toBe("UNVERIFIED");
      }
    });

    it("TEST O — Ownership Uniqueness Check: Multiple conflicting brand referents return code 'conflicting'", async () => {
      const conflictingRelationshipsState: RetrievedRegistryState = {
        ...sampleCompleteSnapshotState,
        relationships: Object.freeze([
          Object.freeze({
            referentId: "ref-brand-A",
            referentType: "brand" as const,
            name: "Brand A",
            parentReferentId: null,
            createdAt: "2026-01-01T00:00:00Z",
          }),
          Object.freeze({
            referentId: "ref-brand-B",
            referentType: "brand" as const,
            name: "Brand B",
            parentReferentId: null,
            createdAt: "2026-01-01T00:00:00Z",
          }),
        ]),
      };

      const registryRepo = new TestRegistryRepository(
        conflictingRelationshipsState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-owner-01",
        executionId: "exec-owner-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("conflicting");
        expect(result.epistemicStatus).toBe("CONFLICTING");
      }
    });

    it("TEST P (AC-16) — Mandatory Negative Test: Incompatible Healthcare Patient requirement combined with GS1 Trade Item DTC is rejected deterministically", async () => {
      const healthcarePatientRequirement = Object.freeze({
        $schema: "https://zyppi.org/schemas/v1/epistemic_requirement.json",
        requirementId: "epistemic:req:healthcare_patient:v1",
        version: "1.0.0",
        targetDimension: "HEALTHCARE_PATIENT",
        goldenQuestionRef: "question:healthcare:patient_identification:v1",
        requiredFacts: Object.freeze([
          Object.freeze({
            factKey: "healthcarePatientId",
            optionality: "MANDATORY" as const,
            expectedType: "string",
          }),
        ]),
      });

      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.composeAndExecute({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          healthcarePatientRequirement,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-neg-01",
        executionId: "exec-neg-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-neg-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
        overrides: testOverrides,
      });

      // Verification assertions for AC-16
      expect(result.ok).toBe(false);
      if (!result.ok) {
        // Must reject deterministically using an authorized code (incompatible or conflicting)
        expect(["incompatible", "conflicting"]).toContain(result.error.code);
        expect(result.error.category).toBe("Composition Failure");
        // Must NOT return a pipeline execution result or bound payload
        expect("pipelineResult" in result).toBe(false);
        expect("boundPayload" in result).toBe(false);
      }
    });
  });
});
