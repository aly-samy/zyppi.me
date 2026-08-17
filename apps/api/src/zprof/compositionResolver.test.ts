import { describe, it, expect } from "vitest";
import {
  createValidatedCanonicalIdentifier,
  type RetrievedRegistryState,
  type EvidencePayloadProvider,
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
import {
  SIOS_GTIN_EPISTEMIC_REQUIREMENT,
  SIOS_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
} from "./fixtures/siosEpistemicRequirements.js";
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

  const gs1ProjectionCapability: CapabilityRecord = Object.freeze({
    capabilityId: "prj:spec:gs1_digital_link_projection:v1",
    subjectId: "arm:profile:trade_item:v1",
    scope: "projection:gs1_digital_link",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2030-01-01T00:00:00Z",
  });

  const dppProjectionCapability: CapabilityRecord = Object.freeze({
    capabilityId: "prj:spec:dpp_passport_projection:v1",
    subjectId: "arm:profile:trade_item:v1",
    scope: "projection:dpp_passport",
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
    capabilities: Object.freeze([
      materialCapability,
      gs1ProjectionCapability,
      dppProjectionCapability,
    ]),
    evidenceReferences: Object.freeze([sampleEvidenceRecord]),
    applicablePolicies: Object.freeze([]),
  });

  const sampleSnapshotStateNoMaterialCap: RetrievedRegistryState =
    Object.freeze({
      ...sampleCompleteSnapshotState,
      capabilities: Object.freeze([
        gs1ProjectionCapability,
        dppProjectionCapability,
      ]),
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
    const registryRepo = new TestRegistryRepository(
      sampleSnapshotStateNoMaterialCap,
      [sampleEvidenceRecord],
    );
    const resolver = new ApplicationCompositionResolver();

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
      expect(gs1Res.manifest.dtcReference.dtcId).toBe(
        "dtc:zyppi:domain:gs1:v1",
      );
      expect(dppRes.manifest.dtcReference.dtcId).toBe(
        "dtc:zyppi:domain:dpp:v1",
      );

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
        versions: ["2.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("incompatible");
        expect(result.error.message).toContain(
          "do not satisfy required explicit constraint",
        );
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

      const registryRepo = new TestRegistryRepository(revokedIdentityState, [
        sampleEvidenceRecord,
      ]);
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

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(["incompatible", "conflicting"]).toContain(result.error.code);
        expect(result.error.category).toBe("Composition Failure");
        expect("pipelineResult" in result).toBe(false);
        expect("boundPayload" in result).toBe(false);
      }
    });
  });

  describe("AMS-0857 ARM Projection Authorization, RSN/CL-16 Structural Binding & Divergence Test Suite", () => {
    it("TEST 857.1 — ARM Projection Authorization Gate: Primary ARM Profile explicit support accepted", async () => {
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
        requestId: "req-arm-01",
        executionId: "exec-arm-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.manifest.boundPrjSpecifications[0].specId).toBe(
          "prj:spec:gs1_digital_link_projection:v1",
        );
      }
    });

    it("TEST 857.2 — ARM Projection Authorization Gate: Unsupported projection reference rejected fail closed", async () => {
      const dtcWithUnsupportedPrj = {
        ...GS1_DOMAIN_TEMPLATE_CARD,
        requiredPrjSpecifications: [
          "prj:spec:unsupported_custom_projection:v1",
        ],
      };

      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: dtcWithUnsupportedPrj,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-arm-02",
        executionId: "exec-arm-02",
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
        expect(result.error.message).toContain(
          "is not explicitly authorized by primary ARM Profile",
        );
      }
    });

    it("TEST 857.3 — ARM Projection Authorization Gate: Secondary profile projection rejected when primary profile does not declare support", async () => {
      const dtcWithSecondaryPrj = {
        ...GS1_DOMAIN_TEMPLATE_CARD,
        requiredPrjSpecifications: ["prj:spec:secondary_only_projection:v1"],
      };

      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: dtcWithSecondaryPrj,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-arm-03",
        executionId: "exec-arm-03",
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
        expect(result.error.message).toContain(
          "is not explicitly authorized by primary ARM Profile",
        );
      }
    });

    it("TEST 857.4 — Pinned ACV Isolation: Ambient registry state mutation does not alter composition against pinned ACV, while mutating pinned ACV capabilities alters result", async () => {
      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const options = {
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-acv-01",
        executionId: "exec-acv-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      };

      const result1 = await resolver.resolveComposition(options);
      expect(result1.ok).toBe(true);

      // Mutate backing state on repository double to simulate ambient drift AFTER resolution
      registryRepo.setRetrievedState({
        ...sampleCompleteSnapshotState,
        identity: {
          ...sampleIdentity,
          status: "decommissioned",
        },
      });

      // Pinned ACV inside result1 remains 100% isolated
      if (result1.ok) {
        expect(
          result1.boundPayload.resolvedActiveConstitutionalView.identity.status,
        ).toBe("active");
      }

      // Conversely, if registry state is mutated BEFORE lookup (so pinned ACV loses projection capability), gate fails closed
      registryRepo.setRetrievedState({
        ...sampleCompleteSnapshotState,
        capabilities: [materialCapability], // GS1 projection capability omitted
      });

      const result2 = await resolver.resolveComposition({
        ...options,
        executionId: "exec-acv-02",
      });

      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error.code).toBe("unauthorized");
        expect(result2.error.message).toContain("in pinned ACV");
      }
    });

    it("TEST 857.4.A — Explicit Pinned ACV Input Isolation: Two explicit ACVs produce two corresponding deterministic results", async () => {
      const registryRepo = new TestRegistryRepository(null, []);
      const resolver = new ApplicationCompositionResolver();

      const explicitAcvAuthorized = {
        identity: sampleIdentity,
        relationships: [],
        standings: [],
        authorities: [
          {
            authorityId: "auth-001",
            subjectId: "09501101530003",
            scope: "GLOBAL",
            validFrom: "2026-01-01T00:00:00Z",
            validTo: "2030-01-01T00:00:00Z",
          },
        ],
        capabilities: [gs1ProjectionCapability],
        evidenceReferences: [sampleEvidenceRecord],
        applicablePolicies: [],
      };

      const explicitAcvUnauthorized = {
        ...explicitAcvAuthorized,
        capabilities: [], // Omit GS1 projection capability
      };

      const resAuth = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-exp-01",
        executionId: "exec-exp-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitAcv: explicitAcvAuthorized,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      const resUnauth = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-exp-02",
        executionId: "exec-exp-02",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitAcv: explicitAcvUnauthorized,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(resAuth.ok).toBe(true);
      expect(resUnauth.ok).toBe(false);

      if (!resUnauth.ok) {
        expect(resUnauth.error.code).toBe("unauthorized");
        expect(resUnauth.error.message).toContain("in pinned ACV");
      }
    });

    it("TEST 857.4.B — Required vs Optional ATT-R-001 Proof Reference: Missing required proof fails closed", async () => {
      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      // Path A: Optional proof reference absent -> Accepted
      const optionalCl16Artifact = Object.freeze({
        artifactId: "cl16:artifact:optional_proof:v1",
        version: "1.0.0",
        rsnBlueprintRef: "rsn:blueprint:gs1_identity_verification:v1",
      });

      const resOptional = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-att-opt-01",
        executionId: "exec-att-opt-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
        explicitCl16Artifacts: [optionalCl16Artifact],
      });

      expect(resOptional.ok).toBe(true);

      // Path B: Required proof reference absent -> Fail closed with code 'missing'
      const requiredCl16Artifact = Object.freeze({
        artifactId: "cl16:artifact:require_proof_test:v1",
        version: "1.0.0",
        rsnBlueprintRef: "rsn:blueprint:gs1_identity_verification:v1",
        requireAttestationProof: true,
      });

      const resRequiredMissing = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          GS1_GTIN_EPISTEMIC_REQUIREMENT,
          GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-att-req-01",
        executionId: "exec-att-req-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
        explicitCl16Artifacts: [requiredCl16Artifact],
      });

      expect(resRequiredMissing.ok).toBe(false);
      if (!resRequiredMissing.ok) {
        expect(resRequiredMissing.error.code).toBe("missing");
        expect(resRequiredMissing.error.message).toContain(
          "Required ATT-R-001 proof reference is missing",
        );
      }
    });

    it("TEST 857.5 — CL-16 Structural Binding & ATT-R-001 Reference Check: Valid CL-16 structural reference is bound without executing RSN", async () => {
      const sampleCl16Artifact = Object.freeze({
        artifactId: "cl16:artifact:gs1_origin_analysis:v1",
        version: "1.0.0",
        rsnBlueprintRef: "rsn:blueprint:gs1_identity_verification:v1",
        attestationProofRef: Object.freeze({
          proofId: "proof:att_r_001:exec_01",
          version: "1.0.0",
          attestationType: "ATT-R-001",
        }),
        conclusionSummary: "ORIGIN_VERIFIED_AUTHENTIC",
      });

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
        requestId: "req-cl16-01",
        executionId: "exec-cl16-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
        explicitCl16Artifacts: [sampleCl16Artifact],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.manifest.boundCl16IntelligenceArtifacts).toHaveLength(1);
        expect(
          result.manifest.boundCl16IntelligenceArtifacts?.[0].artifactId,
        ).toBe("cl16:artifact:gs1_origin_analysis:v1");
        expect(
          result.manifest.boundAttestationProofReferences?.[0].proofId,
        ).toBe("proof:att_r_001:exec_01");
        expect(result.boundPayload.boundCl16IntelligenceArtifacts).toHaveLength(
          1,
        );
      }
    });

    it("TEST 857.6 — ATT-R-001 Proof Reference Check: Malformed proof reference is rejected fail closed without cryptographic verification", async () => {
      const malformedCl16Artifact = Object.freeze({
        artifactId: "cl16:artifact:gs1_origin_analysis:v1",
        version: "1.0.0",
        rsnBlueprintRef: "rsn:blueprint:gs1_identity_verification:v1",
        attestationProofRef: Object.freeze({
          proofId: "", // Malformed proofId
          version: "1.0.0",
          attestationType: "ATT-R-001",
        }),
      });

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
        requestId: "req-cl16-02",
        executionId: "exec-cl16-02",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
        explicitCl16Artifacts: [malformedCl16Artifact],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("invalid");
        expect(result.error.message).toContain(
          "Malformed ATT-R-001 proof reference",
        );
      }
    });

    it("TEST 857.7 — Divergence Preservation: Conflicting CL-16 conclusions preserve structural divergence without selecting a winner", async () => {
      const cl16ArtifactA = Object.freeze({
        artifactId: "cl16:artifact:methodology_A:v1",
        version: "1.0.0",
        rsnBlueprintRef: "rsn:blueprint:methodology_A:v1",
        conclusionSummary: "CONCLUSION_AUTHENTIC",
      });

      const cl16ArtifactB = Object.freeze({
        artifactId: "cl16:artifact:methodology_B:v1",
        version: "1.0.0",
        rsnBlueprintRef: "rsn:blueprint:methodology_B:v1",
        conclusionSummary: "CONCLUSION_SUSPECT",
      });

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
        requestId: "req-div-01",
        executionId: "exec-div-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
        explicitCl16Artifacts: [cl16ArtifactA, cl16ArtifactB],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.manifest.boundCl16IntelligenceArtifacts).toHaveLength(2);
        expect(result.manifest.epistemicDivergence).toBe(true);
        expect(result.boundPayload.epistemicDivergence).toBe(true);
        // Both artifacts remain present and uncollapsed
        expect(
          result.manifest.boundCl16IntelligenceArtifacts?.[0].conclusionSummary,
        ).toBe("CONCLUSION_AUTHENTIC");
        expect(
          result.manifest.boundCl16IntelligenceArtifacts?.[1].conclusionSummary,
        ).toBe("CONCLUSION_SUSPECT");
      }
    });

    it("TEST 857.8 — Negative Boundary: Executable logic and DomainJudgment primitives do not exist in Z-PROF composition output", async () => {
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
        requestId: "req-neg-02",
        executionId: "exec-neg-02",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect("DomainJudgment" in result.manifest).toBe(false);
        expect("DomainJudgment" in result.boundPayload).toBe(false);
        expect("reasoningEngine" in result.manifest).toBe(false);
        expect("translationEngine" in result.manifest).toBe(false);
      }
    });

    it("TEST 857.9 — Proof Unchecked Cryptographically: Syntactically well-formed ATT-R-001 proof reference is bound without cryptographic evaluation", async () => {
      const cl16ArtifactWithUnverifiedProof = Object.freeze({
        artifactId: "cl16:artifact:unverified_signature:v1",
        version: "1.0.0",
        rsnBlueprintRef: "rsn:blueprint:gs1_identity_verification:v1",
        attestationProofRef: Object.freeze({
          proofId: "proof:att_r_001:invalid_crypto_signature_payload",
          version: "1.0.0",
          attestationType: "ATT-R-001",
        }),
        conclusionSummary: "INTERPRETED_CONCLUSION",
      });

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
        requestId: "req-crypto-01",
        executionId: "exec-crypto-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-123",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
        explicitCl16Artifacts: [cl16ArtifactWithUnverifiedProof],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(
          result.manifest.boundAttestationProofReferences?.[0].proofId,
        ).toBe("proof:att_r_001:invalid_crypto_signature_payload");
      }
    });
  });

  describe("AMS-0856-R SIOS → Z-PROF Consumer Boundary Test Suite (§19.1 – §19.10)", () => {
    it("19.1 Valid SIOS-Derived Requirement: A structurally valid, correctly versioned SIOS requirement enters composition pathway", async () => {
      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );

      const resolver = new ApplicationCompositionResolver();
      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          SIOS_GTIN_EPISTEMIC_REQUIREMENT,
          SIOS_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-01",
        executionId: "exec-sios-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-01",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.manifest.boundEpistemicRequirements).toHaveLength(2);
        expect(
          result.manifest.boundEpistemicRequirements[0].requirementId,
        ).toBe(SIOS_GTIN_EPISTEMIC_REQUIREMENT.requirementId);
        expect(
          result.manifest.boundEpistemicRequirements[1].requirementId,
        ).toBe(SIOS_BRAND_OWNER_EPISTEMIC_REQUIREMENT.requirementId);
      }
    });

    it("19.2 Missing Requirement: An absent required Epistemic Requirement reference is rejected with code 'missing'", async () => {
      const missingAuthorityState: RetrievedRegistryState = {
        ...sampleCompleteSnapshotState,
        authorities: Object.freeze([]),
      };

      const registryRepo = new TestRegistryRepository(missingAuthorityState, [
        sampleEvidenceRecord,
      ]);
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [SIOS_BRAND_OWNER_EPISTEMIC_REQUIREMENT],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-02",
        executionId: "exec-sios-02",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-02",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("missing");
      }
    });

    it("19.3 Invalid Structure: Malformed DTC epistemic requirement reference list returns code 'invalid'", async () => {
      const malformedDtc = {
        ...GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirements: [],
      };

      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: malformedDtc,
        epistemicRequirementsFixtures: [SIOS_GTIN_EPISTEMIC_REQUIREMENT],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-03",
        executionId: "exec-sios-03",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-03",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("invalid");
      }
    });

    it("19.4 Version Conflict: Incompatible SIOS requirement version is rejected with code 'incompatible'", async () => {
      const incompatibleSiosReq = {
        ...SIOS_GTIN_EPISTEMIC_REQUIREMENT,
        version: "2.0.0",
      };

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
        epistemicRequirementsFixtures: [incompatibleSiosReq],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-04",
        executionId: "exec-sios-04",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-04",
        versions: ["2.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("incompatible");
      }
    });

    it("19.5 Unverified Trust: Failure during evidence payload loading fails closed with code 'unverified'", async () => {
      const failingPayloadProvider: EvidencePayloadProvider = {
        loadPayloads: async () => ({
          ok: false,
          error: {
            kind: "INVALID_PAYLOAD",
            evidenceId: "evd-001",
            reason: "Payload corrupted",
          },
        }),
      };

      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [SIOS_GTIN_EPISTEMIC_REQUIREMENT],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-05",
        executionId: "exec-sios-05",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-05",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        evidencePayloadProvider: failingPayloadProvider,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("unverified");
        expect(result.epistemicStatus).toBe("UNVERIFIED");
      }
    });

    it("19.6 Unauthorized Requirement: Decommissioned identity status returns code 'unauthorized'", async () => {
      const decommissionedState: RetrievedRegistryState = {
        ...sampleCompleteSnapshotState,
        identity: {
          ...sampleIdentity,
          status: "decommissioned",
        },
      };

      const registryRepo = new TestRegistryRepository(decommissionedState, [
        sampleEvidenceRecord,
      ]);
      const resolver = new ApplicationCompositionResolver();

      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [SIOS_GTIN_EPISTEMIC_REQUIREMENT],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-06",
        executionId: "exec-sios-06",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-06",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("unauthorized");
      }
    });

    it("19.7 Temporal Requirement: Explicit temporal constraints in SIOS requirement are preserved deterministically", async () => {
      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );

      const resolver = new ApplicationCompositionResolver();
      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [SIOS_GTIN_EPISTEMIC_REQUIREMENT],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-07",
        executionId: "exec-sios-07",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-07",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(
          SIOS_GTIN_EPISTEMIC_REQUIREMENT.temporalConstraints,
        ).toBeDefined();
        expect(
          SIOS_GTIN_EPISTEMIC_REQUIREMENT.temporalConstraints
            ?.validTimeRequired,
        ).toBe(true);
        expect(
          result.boundPayload.executionContext.constitutionalTimestamp,
        ).toBe("2026-08-10T00:00:00Z");
      }
    });

    it("19.8 Provenance Preservation: Composition preserves provenance references without reinterpreting translation semantics", async () => {
      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );

      const resolver = new ApplicationCompositionResolver();
      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [
          SIOS_GTIN_EPISTEMIC_REQUIREMENT,
          SIOS_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
        ],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-08",
        executionId: "exec-sios-08",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-08",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.manifest.provenanceReferences.manifestAuthor).toBe(
          "identity:council:admin",
        );
        expect(result.manifest.provenanceReferences.createdTimestamp).toBe(
          "2026-08-10T00:00:00Z",
        );
      }
    });

    it("19.9 SIOS Absence: Z-PROF consumer boundary operates cleanly using a static SIOS requirement fixture without a live SIOS engine", async () => {
      const registryRepo = new TestRegistryRepository(
        sampleCompleteSnapshotState,
        [sampleEvidenceRecord],
      );

      const resolver = new ApplicationCompositionResolver();
      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [SIOS_GTIN_EPISTEMIC_REQUIREMENT],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-09",
        executionId: "exec-sios-09",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-09",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(
          result.manifest.boundEpistemicRequirements[0].requirementId,
        ).toBe("epistemic:req:sios:gtin_trade_item:v1");
      }
    });

    it("19.10 Semantic Ignorance Test: Z-PROF composes SIOS requirements purely by structural shape without evaluating semantic accuracy", async () => {
      const syntheticConceptRequirement = Object.freeze({
        $schema: "https://zyppi.org/schemas/v1/epistemic_requirement.json",
        requirementId: "epistemic:req:sios:synthetic_domain_concept:v1",
        version: "1.0.0",
        targetDimension: "dimension:zyppi:domain:synthetic_concept",
        goldenQuestionRef: "question:zyppi:sios:synthetic_concept_valid",
        requiredFacts: Object.freeze([
          Object.freeze({
            factKey: "authorityId",
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
      const result = await resolver.resolveComposition({
        dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
        epistemicRequirementsFixtures: [syntheticConceptRequirement],
        registryRepository: registryRepo,
        identifier: validIdentifier,
        requestId: "req-sios-10",
        executionId: "exec-sios-10",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-sios-10",
        versions: ["1.0.0"],
        policyContext: defaultPolicyContext,
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
        explicitEvidenceBundle: validEvidenceBundle,
        explicitEvidencePayloads: validEvidencePayloads,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(
          result.manifest.boundEpistemicRequirements[0].requirementId,
        ).toBe("epistemic:req:sios:synthetic_domain_concept:v1");
      }
    });
  });
});
