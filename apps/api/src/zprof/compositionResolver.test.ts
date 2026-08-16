import { describe, it, expect } from "vitest";
import {
  createValidatedCanonicalIdentifier,
  type EvidenceRecord,
} from "@zyppi/contracts";
import {
  type ExecutionRequest,
  type PolicyContext,
  type ResolvedPolicyGraph,
} from "@zyppi/domain";
import { runInternalPipeline } from "@zyppi/runtime/dist/pipeline.js";
import type { StageOverrideConfig } from "@zyppi/runtime/dist/types.js";
import { ApplicationCompositionResolver } from "./compositionResolver.js";
import { GS1_DOMAIN_TEMPLATE_CARD } from "./fixtures/gs1Dtc.js";
import { TestRegistryRepository } from "./testRegistryRepository.js";

describe("AMS-0853 GS1 Z-PROF Application Composition Bridge", () => {
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
    schemaVersion: "1.0",
    evidenceType: "GTIN_VERIFICATION",
    targetReferentId: "id-gtin-01",
    providerIdentityId: "id-provider-01",
    issuerIdentityId: "id-issuer-01",
    policyReferenceIds: Object.freeze(["pol-001"]),
    evidencePayloadHash:
      "sha256:d7a8fbb307d7809469ca9abec0003e42edd8ad9ab130919d20f23e37271dca9f",
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2027-01-01T00:00:00Z",
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
    policyContextId: "ctx-001",
    tenantId: "tenant-001",
    environment: "test",
    timestamp: "2026-08-10T00:00:00Z",
  });

  const defaultResolvedPolicyGraph: ResolvedPolicyGraph = Object.freeze({
    graphId: "graph-001",
    nodes: Object.freeze([]),
    edges: Object.freeze([]),
  });

  const sampleSnapshotState = Object.freeze({
    identity: Object.freeze({
      identityId: "09501101530003",
      canonicalIdentifier: validIdentifier,
      identityType: "ORGANIZATION" as const,
      registeredAt: "2026-01-01T00:00:00Z",
    }),
    relationships: Object.freeze([]),
    standings: Object.freeze([]),
    authorities: Object.freeze([
      Object.freeze({
        authorityId: "auth-001",
        subjectIdentityId: "09501101530003",
        authorityType: "BRAND_OWNER" as const,
        scope: "GLOBAL" as const,
        grantedAt: "2026-01-01T00:00:00Z",
      }),
    ]),
    capabilities: Object.freeze([]),
    evidenceReferences: Object.freeze([
      Object.freeze({
        evidenceId: "evd-001",
        evidenceType: "GTIN_VERIFICATION",
        targetReferentId: "09501101530003",
      }),
    ]),
    applicablePolicies: Object.freeze([]),
  });

  it("STRUCTURAL: resolves valid GS1 composition with static fixtures", async () => {
    const registryRepo = new TestRegistryRepository(sampleSnapshotState, [
      sampleEvidenceRecord,
    ]);

    const resolver = new ApplicationCompositionResolver();
    const result = await resolver.composeAndExecute({
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-001",
      executionId: "exec-001",
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
      expect(result.boundPayload.payloadId).toBe("bound:payload:gs1:exec-001");
      expect(result.pipelineResult).toBeDefined();
    }
  });

  it("FAILURE TAXONOMY & EPISTEMIC UNCERTAINTY: preserves UNAVAILABLE on missing registry record", async () => {
    const emptyRegistryRepo = new TestRegistryRepository(null, []);

    const resolver = new ApplicationCompositionResolver();
    const result = await resolver.composeAndExecute({
      registryRepository: emptyRegistryRepo,
      identifier: validIdentifier,
      requestId: "req-002",
      executionId: "exec-002",
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
      expect(result.epistemicStatus).toBe("UNAVAILABLE");
    }
  });

  it("FAILURE TAXONOMY & EPISTEMIC UNCERTAINTY: preserves UNAVAILABLE when brand owner authority is missing", async () => {
    const missingAuthorityState = Object.freeze({
      ...sampleSnapshotState,
      authorities: Object.freeze([]),
    });

    const registryRepo = new TestRegistryRepository(missingAuthorityState, []);

    const resolver = new ApplicationCompositionResolver();
    const result = await resolver.composeAndExecute({
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-003",
      executionId: "exec-003",
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
        "epistemic:req:brand_owner_authority:v1",
      );
      expect(result.epistemicStatus).toBe("UNAVAILABLE");
    }
  });

  it("FACTORIZATION VERIFICATION: GS1 composition does not mutate ARM Profiles, ACV, or Runtime", async () => {
    const registryRepo = new TestRegistryRepository(sampleSnapshotState, [
      sampleEvidenceRecord,
    ]);

    const resolver = new ApplicationCompositionResolver();
    const res = await resolver.resolveComposition({
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-004",
      executionId: "exec-004",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-123",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      // ACV structure is standard pure ActiveConstitutionalView
      const acv = res.boundPayload.resolvedActiveConstitutionalView;
      expect(acv).toHaveProperty("identity");
      expect(acv).toHaveProperty("relationships");
      expect(acv).toHaveProperty("standings");
      expect(acv).toHaveProperty("authorities");
      expect(acv).toHaveProperty("capabilities");
      expect(acv).toHaveProperty("evidenceReferences");
      expect(acv).toHaveProperty("applicablePolicies");
      // Verify no Z-PROF fields exist on ACV
      expect(acv).not.toHaveProperty("dtc");
      expect(acv).not.toHaveProperty("compositionManifest");
    }
  });

  it("DISAPPEARANCE TEST: compares Path A (Composition Bridge) vs Path B (Direct Assembly)", async () => {
    const registryRepo = new TestRegistryRepository(sampleSnapshotState, [
      sampleEvidenceRecord,
    ]);

    // --- PATH A: Via GS1 Z-PROF Composition Bridge ---
    const resolver = new ApplicationCompositionResolver();
    const pathAResult = await resolver.composeAndExecute({
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-disappear-01",
      executionId: "exec-disappear-01",
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

    // --- PATH B: Direct Assembly from Equivalent Constitutional Inputs ---
    const directAcv = {
      identity: sampleSnapshotState.identity,
      relationships: sampleSnapshotState.relationships,
      standings: sampleSnapshotState.standings,
      authorities: sampleSnapshotState.authorities,
      capabilities: sampleSnapshotState.capabilities,
      evidenceReferences: sampleSnapshotState.evidenceReferences,
      applicablePolicies: sampleSnapshotState.applicablePolicies,
    };

    const directExecutionRequest: ExecutionRequest = {
      requestId: "req-disappear-01",
      identity: sampleSnapshotState.identity,
      activeConstitutionalView: directAcv,
      evidenceBundle: validEvidenceBundle,
      policyContext: defaultPolicyContext,
      executionContext: {
        executionId: "exec-disappear-01",
        constitutionalTimestamp: "2026-08-10T00:00:00Z",
        budget: 1000,
        entropy: "entropy-disappear",
        versions: ["1.0.0"],
      },
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
    };

    const pathBPipelineResult = runInternalPipeline(
      directExecutionRequest,
      testOverrides,
      validEvidencePayloads,
    );

    // --- COMPARISON ---
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
      expect(outputA.trustResult).toEqual(outputB.trustResult);

      expect(outputA.evidenceReceipt.identityId).toBe(
        outputB.evidenceReceipt.identityId,
      );
      expect(outputA.evidenceReceipt.bundleDigest).toBe(
        outputB.evidenceReceipt.bundleDigest,
      );
      expect(outputA.evidenceReceipt.acvDigest).toBe(
        outputB.evidenceReceipt.acvDigest,
      );
      expect(outputA.evidenceReceipt.policyDigest).toBe(
        outputB.evidenceReceipt.policyDigest,
      );
      expect(outputA.evidenceReceipt.outcome).toBe(
        outputB.evidenceReceipt.outcome,
      );

      expect(outputA.evidenceReceipt.receiptId).toBe(
        outputB.evidenceReceipt.receiptId,
      );
    }
  });

  it("DETERMINISM & REPLAY: identical inputs produce identical composition manifests & bound payloads", async () => {
    const registryRepo = new TestRegistryRepository(sampleSnapshotState, [
      sampleEvidenceRecord,
    ]);

    const resolver = new ApplicationCompositionResolver();

    const requestOptions = {
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-replay-01",
      executionId: "exec-replay-01",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-replay",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
    };

    const res1 = await resolver.resolveComposition(requestOptions);
    const res2 = await resolver.resolveComposition(requestOptions);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);

    if (res1.ok && res2.ok) {
      expect(JSON.stringify(res1.manifest)).toBe(JSON.stringify(res2.manifest));
      expect(JSON.stringify(res1.boundPayload)).toBe(
        JSON.stringify(res2.boundPayload),
      );
    }
  });
});
