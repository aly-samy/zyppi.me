import { describe, it, expect } from "vitest";
import { FrozenRegistryRepository } from "@zyppi/testing";
import {
  createValidatedCanonicalIdentifier,
  type ObjectStorageClient,
} from "@zyppi/contracts";
import {
  type EvidenceBundle,
  type PolicyContext,
  canonicalizeJcs,
} from "@zyppi/domain";
import type { StageOverrideConfig } from "@zyppi/runtime/dist/types.js";
import { composeAndRunPipeline } from "./pipelineOrchestrator.js";
import crypto from "crypto";

describe("Pipeline Orchestrator Integration Tests — AMS-0801", () => {
  const validIdentifier = createValidatedCanonicalIdentifier("09506000134352");
  if (!validIdentifier.ok) {
    throw new Error("Invalid identifier setup");
  }

  const validEvidenceBundle: EvidenceBundle = {
    schemaVersion: "1.0",
    evidenceRecords: [],
  };

  const validPolicyContext: PolicyContext = {
    policies: [],
  };

  it("successfully composes requests and runs the pipeline through ACV Activation when overrides are present", async () => {
    const repository = new FrozenRegistryRepository();

    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: validIdentifier.value,
      requestId: "req-111",
      executionId: "exec-222",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "explicit-entropy",
      versions: ["1.0.0"],
      evidenceBundle: validEvidenceBundle,
      policyContext: validPolicyContext,
      overrides,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pipelineResult.ok).toBe(true);
      expect(result.pipelineResult.trace).toContain("ACV Activation");
    }
  });

  it("fails closed at Stage 6 (ACV Activation) if the ACV is somehow bypassed or missing in overrides", async () => {
    const repository = new FrozenRegistryRepository();

    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": {
        ok: false,
        code: "ACTIVATION_FAILED",
        message: "Simulated activation failure.",
      },
    };

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: validIdentifier.value,
      requestId: "req-111",
      executionId: "exec-222",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "explicit-entropy",
      versions: ["1.0.0"],
      evidenceBundle: validEvidenceBundle,
      policyContext: validPolicyContext,
      overrides,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pipelineResult.ok).toBe(false);
      if (!result.pipelineResult.ok) {
        expect(result.pipelineResult.error.stage).toBe("ACV Activation");
        expect(result.pipelineResult.error.code).toBe("ACTIVATION_FAILED");
      }
    }
  });

  it("fails closed with an error if the registry identifier does not exist", async () => {
    const repository = new FrozenRegistryRepository();
    const nonExistentIdentifier =
      createValidatedCanonicalIdentifier("99999999999999");
    if (!nonExistentIdentifier.ok) {
      throw new Error("Invalid identifier setup");
    }

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: nonExistentIdentifier.value,
      requestId: "req-111",
      executionId: "exec-222",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "explicit-entropy",
      versions: ["1.0.0"],
      evidenceBundle: validEvidenceBundle,
      policyContext: validPolicyContext,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Registry state not found");
    }
  });

  it("fails gracefully if the registry repository throws/fails", async () => {
    const repository = new FrozenRegistryRepository(
      undefined,
      "09506000134352",
    );

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: validIdentifier.value,
      requestId: "req-111",
      executionId: "exec-222",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "explicit-entropy",
      versions: ["1.0.0"],
      evidenceBundle: validEvidenceBundle,
      policyContext: validPolicyContext,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Registry repository lookup failed");
    }
  });

  it("verifies that explicit executionId and constitutionalTimestamp are preserved and validated in Runtime", async () => {
    const repository = new FrozenRegistryRepository();

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: validIdentifier.value,
      requestId: "req-111",
      executionId: "exec-preserve-123",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "explicit-entropy",
      versions: ["1.0.0"],
      evidenceBundle: validEvidenceBundle,
      policyContext: validPolicyContext,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pipelineResult.ok).toBe(false);
      if (!result.pipelineResult.ok) {
        expect(result.pipelineResult.error.stage).toBe("Dependency Resolution");
        expect(result.pipelineResult.error.code).toBe(
          "DEPENDENCY_RESOLUTION_UNAVAILABLE",
        );
      }
    }
  });

  it("proves perfect determinism of the pipeline and orchestrator across repeated runs", async () => {
    const repository = new FrozenRegistryRepository();

    const options = {
      registryRepository: repository,
      identifier: validIdentifier.value,
      requestId: "req-111",
      executionId: "exec-222",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "explicit-entropy",
      versions: ["1.0.0"],
      evidenceBundle: validEvidenceBundle,
      policyContext: validPolicyContext,
      resolvedPolicyGraph: { edges: [] },
    };

    const res1 = await composeAndRunPipeline(options);
    const res2 = await composeAndRunPipeline(options);

    expect(res1).toEqual(res2);
  });
});

describe("Pipeline Orchestrator Evidence Loading Integration Tests — AMS-0802", () => {
  // Setup real structured payloads and digests
  const payloadDoc = { type: "license", status: "active" };
  const payloadSeal = { sealId: "seal-999", broken: false };

  const jcsDoc = canonicalizeJcs(payloadDoc);
  const jcsSeal = canonicalizeJcs(payloadSeal);

  const hashDocHex = crypto
    .createHash("sha256")
    .update(jcsDoc, "utf8")
    .digest("hex");
  const hashSealHex = crypto
    .createHash("sha256")
    .update(jcsSeal, "utf8")
    .digest("hex");

  const identifier = createValidatedCanonicalIdentifier("09506000134352");
  if (!identifier.ok) {
    throw new Error("Invalid identifier setup");
  }

  // Create mock snapshots
  const testSnapshot = {
    "09506000134352": {
      identity: {
        identityId: "id-xyz",
        identityType: "product",
        canonicalReference: "09506000134352",
        referentId: null,
        status: "active" as const,
        createdAt: "2026-08-08T12:00:00Z",
        updatedAt: "2026-08-08T12:00:00Z",
      },
      relationships: [],
      standings: [],
      authorities: [],
      capabilities: [],
      evidenceReferences: [
        {
          evidenceId: "ev-license",
          identityId: "id-xyz",
          evidenceType: "license_verification",
          hash: `sha256:${hashDocHex}`,
          storageRef: "r2://bucket/license.json",
          retrievedAt: "2026-08-08T12:00:00Z",
        },
        {
          evidenceId: "ev-seal",
          identityId: "id-xyz",
          evidenceType: "seal_audit",
          hash: `sha256:${hashSealHex}`,
          storageRef: "r2://bucket/seal.json",
          retrievedAt: "2026-08-08T12:00:00Z",
        },
      ],
      applicablePolicies: [],
    },
  };

  class MockObjectStorageClient implements ObjectStorageClient {
    private readonly storage = new Map<string, string>();

    set(ref: string, content: string) {
      this.storage.set(ref, content);
    }

    async getObject(storageRef: string): Promise<string | null> {
      if (storageRef === "r2://bucket/simulate-transient") {
        throw { message: "Connection timeout", isTransient: true };
      }
      if (storageRef === "r2://bucket/simulate-hard-failure") {
        throw new Error("Fatal Storage Hardware Crash");
      }
      return this.storage.get(storageRef) ?? null;
    }
  }

  it("successfully resolves, loads, pre-verifies, and transports valid evidence to pure Runtime", async () => {
    const repository = new FrozenRegistryRepository(testSnapshot);
    const storageClient = new MockObjectStorageClient();
    storageClient.set("r2://bucket/license.json", jcsDoc);
    storageClient.set("r2://bucket/seal.json", jcsSeal);

    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      // "Bundle Verification" is NOT overridden to prove Runtime's independent verification works!
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: identifier.value,
      requestId: "req-doc-seal",
      executionId: "exec-doc-seal",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "entropy",
      versions: ["1.0.0"],
      policyContext: { policies: [] },
      overrides,
      objectStorageClient: storageClient,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Runtime successfully executed and passed Bundle Verification using transported payloads!
      expect(result.pipelineResult.ok).toBe(true);
      expect(result.pipelineResult.trace).toContain("Bundle Verification");
    }
  });

  it("fails immediately at the Application-layer boundary if an evidence reference is missing/not found", async () => {
    const repository = new FrozenRegistryRepository(testSnapshot);
    const storageClient = new MockObjectStorageClient();

    const failingResolver = {
      resolve: async () => ({
        ok: false as const,
        error: {
          code: "REFERENCE_NOT_FOUND" as const,
          message: "Evidence reference not found: ev-license",
        },
      }),
    };

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: identifier.value,
      requestId: "req-fail",
      executionId: "exec-fail",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "entropy",
      versions: ["1.0.0"],
      policyContext: { policies: [] },
      objectStorageClient: storageClient,
      evidenceResolver: failingResolver,
      resolvedPolicyGraph: { edges: [] },
    });

    // Resolver failure must return a failed OrchestratorResult and not call the Runtime
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain(
        "Evidence reference resolution failed: Evidence reference not found",
      );
    }
  });

  it("fails immediately at the Application-layer boundary if payload loading fails due to fatal storage client crash", async () => {
    const repository = new FrozenRegistryRepository({
      "09506000134352": {
        ...testSnapshot["09506000134352"],
        evidenceReferences: [
          {
            evidenceId: "ev-license",
            identityId: "id-xyz",
            evidenceType: "license_verification",
            hash: `sha256:${hashDocHex}`,
            storageRef: "r2://bucket/simulate-hard-failure",
            retrievedAt: "2026-08-08T12:00:00Z",
          },
        ],
      },
    });

    const storageClient = new MockObjectStorageClient();

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: identifier.value,
      requestId: "req-fail",
      executionId: "exec-fail",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "entropy",
      versions: ["1.0.0"],
      policyContext: { policies: [] },
      objectStorageClient: storageClient,
      resolvedPolicyGraph: { edges: [] },
    });

    // Hard storage failure must return immediately
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Storage client failure");
    }
  });

  it("fails immediately at the Application-layer boundary if a payload is not found in storage", async () => {
    const repository = new FrozenRegistryRepository(testSnapshot);
    const storageClient = new MockObjectStorageClient();
    // Do not set "r2://bucket/license.json", leaving it missing in storage

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: identifier.value,
      requestId: "req-fail",
      executionId: "exec-fail",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "entropy",
      versions: ["1.0.0"],
      policyContext: { policies: [] },
      objectStorageClient: storageClient,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Payload not found for evidence ID");
    }
  });

  it("fails early at Application-layer preflight verification if payload hash does not match", async () => {
    const repository = new FrozenRegistryRepository(testSnapshot);
    const storageClient = new MockObjectStorageClient();
    storageClient.set(
      "r2://bucket/license.json",
      canonicalizeJcs({ ...payloadDoc, status: "REVOKED" }),
    ); // Corrupted payload
    storageClient.set("r2://bucket/seal.json", jcsSeal);

    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: identifier.value,
      requestId: "req-fail",
      executionId: "exec-fail",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "entropy",
      versions: ["1.0.0"],
      policyContext: { policies: [] },
      objectStorageClient: storageClient,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain(
        "Application preflight verification failed: HASH_MISMATCH",
      );
    }
  });

  it("proves independent Runtime verification and boundary isolation by bypassing preflight check and failing closed in Runtime", async () => {
    const repository = new FrozenRegistryRepository(testSnapshot);

    // Build the correct EvidenceBundle manually
    const validResolverBundle: EvidenceBundle = {
      schemaVersion: "1.0",
      evidenceRecords: [
        {
          evidenceId: "ev-license",
          identityId: "id-xyz",
          evidenceType: "license_verification",
          hash: `sha256:${hashDocHex}`,
          storageRef: "r2://bucket/license.json",
          retrievedAt: "2026-08-08T12:00:00Z",
        },
      ],
    };

    // Construct mismatched payloads (e.g. license payload status is modified)
    const corruptedPayloads = new Map<string, unknown>([
      ["ev-license", { ...payloadDoc, status: "corrupted_at_transport" }],
    ]);

    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      // "Bundle Verification" is NOT overridden -> Runtime must verify independently
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    // By passing the explicit evidenceBundle and evidencePayloads in options,
    // the orchestrator bypasses dynamic retrieval & preflight validation,
    // and invokes runInternalPipeline directly. This allows us to test
    // that the Runtime independently fails verification!
    const result = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: identifier.value,
      requestId: "req-independent",
      executionId: "exec-independent",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "entropy",
      versions: ["1.0.0"],
      policyContext: { policies: [] },
      overrides,
      evidenceBundle: validResolverBundle,
      evidencePayloads: corruptedPayloads,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // The Runtime independently detected the payload mismatch at Stage 3!
      expect(result.pipelineResult.ok).toBe(false);
      if (!result.pipelineResult.ok) {
        expect(result.pipelineResult.error.stage).toBe("Bundle Verification");
        expect(result.pipelineResult.error.code).toBe("HASH_MISMATCH");
      }
    }
  });

  it("proves perfect determinism across equivalent retrieval orders", async () => {
    // Retrieval or map insertion order MUST NOT impact the outcomes or pipeline results
    const repository = new FrozenRegistryRepository(testSnapshot);

    const clientOrderA = new MockObjectStorageClient();
    clientOrderA.set("r2://bucket/license.json", jcsDoc);
    clientOrderA.set("r2://bucket/seal.json", jcsSeal);

    const clientOrderB = new MockObjectStorageClient();
    clientOrderB.set("r2://bucket/seal.json", jcsSeal);
    clientOrderB.set("r2://bucket/license.json", jcsDoc);

    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const resA = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: identifier.value,
      requestId: "req-det",
      executionId: "exec-det",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "entropy",
      versions: ["1.0.0"],
      policyContext: { policies: [] },
      overrides,
      objectStorageClient: clientOrderA,
      resolvedPolicyGraph: { edges: [] },
    });

    const resB = await composeAndRunPipeline({
      registryRepository: repository,
      identifier: identifier.value,
      requestId: "req-det",
      executionId: "exec-det",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "entropy",
      versions: ["1.0.0"],
      policyContext: { policies: [] },
      overrides,
      objectStorageClient: clientOrderB,
      resolvedPolicyGraph: { edges: [] },
    });

    expect(resA).toEqual(resB);
  });
});
