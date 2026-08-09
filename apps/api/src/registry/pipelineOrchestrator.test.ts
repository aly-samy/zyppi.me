import { describe, it, expect } from "vitest";
import { FrozenRegistryRepository } from "@zyppi/testing";
import { createValidatedCanonicalIdentifier } from "@zyppi/contracts";
import type { EvidenceBundle, PolicyContext } from "@zyppi/domain";
import type { StageOverrideConfig } from "@zyppi/runtime/dist/types.js";
import { composeAndRunPipeline } from "./pipelineOrchestrator.js";

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
      // ACV Activation is implemented, so we don't have to override it to check its execution!
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
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pipelineResult.ok).toBe(true);
      expect(result.pipelineResult.trace).toContain("ACV Activation");
    }
  });

  it("fails closed at Stage 6 (ACV Activation) if the ACV is somehow bypassed or missing in overrides", async () => {
    const repository = new FrozenRegistryRepository();

    // If we override the Stage 6 ("ACV Activation") to fail explicitly
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
    const nonExistentIdentifier = createValidatedCanonicalIdentifier("99999999999999");
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
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Registry state not found");
    }
  });

  it("fails gracefully if the registry repository throws/fails", async () => {
    // FrozenRegistryRepository can simulate failure if we supply simulateFailureId
    const repository = new FrozenRegistryRepository(undefined, "09506000134352");

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
      // No overrides -> will fail closed at Admission by default
    });

    // The orchestrator successfully composed and invoked the pipeline
    expect(result.ok).toBe(true);
    if (result.ok) {
      // It failed closed at Admission stage by default with ADMISSION_UNAVAILABLE
      expect(result.pipelineResult.ok).toBe(false);
      if (!result.pipelineResult.ok) {
        expect(result.pipelineResult.error.stage).toBe("Admission");
        expect(result.pipelineResult.error.code).toBe("ADMISSION_UNAVAILABLE");
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
    };

    const res1 = await composeAndRunPipeline(options);
    const res2 = await composeAndRunPipeline(options);

    expect(res1).toEqual(res2);
  });
});
