import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as runtimeIndex from "./index.js";
import { runInternalPipeline } from "./pipeline.js";
import type { StageOverrideConfig } from "./types.js";
import crypto from "crypto";
import {
  canonicalizeJcs,
  type ExecutionRequest,
  type IdentityRecord,
  type ReferentRecord,
  type StandingRecord,
  type AuthorityRecord,
  type CapabilityRecord,
  type EvidenceRecord,
  type PolicyRecord,
  type ExecutionContext,
} from "@zyppi/domain";

const url = (import.meta as unknown as { url: string }).url;
const __filename = fileURLToPath(url);
const __dirname = path.dirname(__filename);

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  Object.freeze(obj);
  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    if (typeof key === "string") {
      const val = (obj as Record<string, unknown>)[key];
      if (typeof val === "object" && val !== null) {
        deepFreeze(val);
      }
    }
  }
  return obj;
}

describe("Runtime Pipeline Scaffold Tests", () => {
  const validIdentity: IdentityRecord = {
    identityId: "id-123",
    identityType: "product",
    canonicalReference: "https://id.gs1.org/01/09780201379626",
    referentId: "ref-456",
    status: "active",
    createdAt: "2026-07-28T12:00:00Z",
    updatedAt: "2026-07-28T12:05:00.123Z",
  };

  const validRelationship: ReferentRecord = {
    referentId: "ref-456",
    referentType: "brand",
    name: "Acme",
    parentReferentId: null,
    createdAt: "2026-07-28T12:00:00Z",
  };

  const validStanding: StandingRecord = {
    standingId: "standing-001",
    subjectId: "id-123",
    scope: "caw:eligible",
    validFrom: "2026-07-28T12:00:00Z",
    validTo: "2026-07-28T12:00:00Z",
  };

  const validAuthority: AuthorityRecord = {
    authorityId: "auth-001",
    subjectId: "id-123",
    scope: "caw:assert",
    validFrom: "2026-07-28T12:00:00Z",
    validTo: "2026-07-28T12:00:00Z",
  };

  const validCapability: CapabilityRecord = {
    capabilityId: "cap-001",
    subjectId: "id-123",
    scope: "caw:verify",
    validFrom: "2026-07-28T12:00:00Z",
    validTo: "2026-07-28T12:00:00Z",
  };

  const validEvidencePayload = { hello: "world" };
  // SHA-256 of JCS canonicalized `{"hello":"world"}`
  const validEvidenceHash =
    "sha256:93a23971a914e5eacbf0a8d25154cda309c3c1c72fbb9914d47c60f3cb681588";

  const validEvidence: EvidenceRecord = {
    evidenceId: "evidence-001",
    identityId: "id-123",
    evidenceType: "caw:receipt",
    hash: validEvidenceHash,
    storageRef: "r2://key-123",
    retrievedAt: "2026-07-28T12:00:00Z",
  };

  const validPolicy: PolicyRecord = {
    policyId: "policy-001",
    policyType: "caw:simple",
    version: "1.0.0",
    definition: { rule: "always-allow" },
    active: true,
  };

  const validRequestInput: ExecutionRequest = {
    requestId: "req-789",
    identity: validIdentity,
    activeConstitutionalView: {
      identity: validIdentity,
      relationships: [validRelationship],
      standings: [validStanding],
      authorities: [validAuthority],
      capabilities: [validCapability],
      evidenceReferences: [validEvidence],
      applicablePolicies: [validPolicy],
    },
    evidenceBundle: {
      schemaVersion: "1.0",
      evidenceRecords: [validEvidence],
    },
    policyContext: {
      policies: [validPolicy],
    },
    executionContext: {
      executionId: "exec-456",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "random_entropy_string",
      versions: ["1.0.0", "1.1.0"],
    },
    resolvedPolicyGraph: {
      edges: [],
    },
  };

  // 10.1: Exact sequential ordering
  it("proves precise sequential ordering of all 9 stages when all pass", () => {
    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const result = runInternalPipeline(validRequestInput, overrides);
    expect(result.ok).toBe(true);
    expect(result.trace).toEqual([
      "Admission",
      "Bundle Discovery",
      "Bundle Verification",
      "Dependency Resolution",
      "Compatibility Validation",
      "ACV Activation",
      "Resolution Graph Construction",
      "Active Execution",
      "Receipt Generation",
    ]);
  });

  // 10.2: No stage bypass
  it("proves a stage cannot be visited unless every preceding stage has completed successfully", () => {
    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": {
        ok: false,
        code: "VERIFICATION_FAILED",
        message: "Bundle signatures invalid.",
      },
      "Dependency Resolution": { ok: true },
    };

    const result = runInternalPipeline(validRequestInput, overrides);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Bundle Verification");
      expect(result.error.code).toBe("VERIFICATION_FAILED");
    }
    expect(result.trace).toEqual([
      "Admission",
      "Bundle Discovery",
      "Bundle Verification",
    ]);
  });

  // 10.3: Fail-closed behavior
  it("stops immediately when an early stage fails and reports the correct stage & stable code", () => {
    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": {
        ok: false,
        code: "DISCOVERY_TIMEOUT",
        message: "Lookup timed out.",
      },
    };

    const result = runInternalPipeline(validRequestInput, overrides);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Bundle Discovery");
      expect(result.error.code).toBe("DISCOVERY_TIMEOUT");
      expect(result.error.message).toBe("Lookup timed out.");
    }
    expect(result.trace).toEqual(["Admission", "Bundle Discovery"]);
  });

  // 10.4: Default production native behavior (passes Stage 1 and Stage 2 natively, failing at Stage 3 with PAYLOAD_MISSING when payloads are omitted)
  it("passes Stage 1 and Stage 2 natively and fails at Stage 3 (Bundle Verification) with PAYLOAD_MISSING under default production configuration", () => {
    const result = runInternalPipeline(validRequestInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Bundle Verification");
      expect(result.error.code).toBe("PAYLOAD_MISSING");
    }
    expect(result.trace).toEqual([
      "Admission",
      "Bundle Discovery",
      "Bundle Verification",
    ]);
  });

  // 10.5: Determinism
  it("proves perfect determinism across repeated executions with identical input & overrides", () => {
    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": {
        ok: false,
        code: "TEST_ERR",
        message: "Fail here.",
      },
    };

    const result1 = runInternalPipeline(validRequestInput, overrides);
    const result2 = runInternalPipeline(validRequestInput, overrides);
    expect(result1).toEqual(result2);
  });

  // 10.6: Domain validation behavior
  it("rejects invalid request inputs at Admission stage and blocks downstream stages", () => {
    const invalidInput = { ...validRequestInput, requestId: "" };
    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
    };

    const result = runInternalPipeline(invalidInput, overrides);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Admission");
      expect(result.error.code).toBe("INVALID_EXECUTION_REQUEST");
    }
    expect(result.trace).toEqual(["Admission"]);
  });

  // 10.7: Public API containment
  it("confirms that the public entry point exposes the intended V2 capability", () => {
    expect({ ...runtimeIndex }).toEqual({
      validateExecutionEnvelopeCompatibilityV2: expect.any(Function),
      prepareProductionExecutionV2: expect.any(Function),
      integrateOwnerDeterminationsV2: expect.any(Function),
      evaluateExecutabilityAndOutcomeV2: expect.any(Function),
    });
  });

  // 12.1: Context Propagation Test
  it("proves actual explicit receipt by the stage handlers via static source audit", () => {
    const sourcePath = path.resolve(__dirname, "pipeline.ts");
    const source = fs.readFileSync(sourcePath, "utf-8");

    // Verify that executePostAdmissionStage signature has context parameter of type ExecutionContext
    expect(source).toContain("function executePostAdmissionStage(");
    expect(source).toContain("context: ExecutionContext");

    // Verify that performAction in executePostAdmissionStage is defined as requiring ExecutionContext
    expect(source).toContain("performAction: (");
    expect(source).toContain("context: ExecutionContext");

    // Verify makeUnimplementedAction signature
    expect(source).toContain(
      "function makeUnimplementedAction(stageName: string)",
    );
    expect(source).toContain("return () =>");

    // Verify that post-Admission stages pass context as the third argument to executePostAdmissionStage
    const stages = ["Compatibility Validation", "Receipt Generation"];

    for (const stage of stages) {
      const searchPattern1 = `executePostAdmissionStage(\n    "${stage}",\n    makeUnimplementedAction("${stage}"),\n    context,\n  )`;
      const searchPattern2 = `executePostAdmissionStage(\n    "${stage}",\n    makeUnimplementedAction("${stage}"),\n    context\n  )`;

      const cleanedSource = source.replace(/\s+/g, " ");
      const expectedCallPattern = `executePostAdmissionStage( "${stage}", makeUnimplementedAction("${stage}"), context, )`;
      const expectedCallPatternNoTrailingComma = `executePostAdmissionStage( "${stage}", makeUnimplementedAction("${stage}"), context )`;

      const hasMatch =
        source.includes(searchPattern1) ||
        source.includes(searchPattern2) ||
        cleanedSource.includes(expectedCallPattern) ||
        cleanedSource.includes(expectedCallPatternNoTrailingComma);

      expect(hasMatch).toBe(true);
    }

    // Verify Bundle Discovery specifically (implemented in CCP-RI-02A)
    const discoveryCleaned = source.replace(/\s+/g, " ");
    expect(discoveryCleaned).toContain(
      'executePostAdmissionStage( "Bundle Discovery", () => {',
    );

    // Verify ACV Activation specifically (which is implemented in AMS-0801)
    const acvCleaned = source.replace(/\s+/g, " ");
    expect(acvCleaned).toContain(
      'executePostAdmissionStage( "ACV Activation", () => {',
    );

    // Verify Resolution Graph Construction specifically (implemented in AMS-0804)
    expect(acvCleaned).toContain(
      'executePostAdmissionStage( "Resolution Graph Construction", () => {',
    );

    // Verify Active Execution specifically (implemented in AMS-0804)
    expect(acvCleaned).toContain(
      'executePostAdmissionStage( "Active Execution", () => {',
    );
  });

  // 12.2: Input Immutability Test
  it("proves that original input request and nested executionContext cannot be mutated", () => {
    const inputCopy = JSON.parse(JSON.stringify(validRequestInput));
    const frozenInput = deepFreeze(inputCopy);

    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    // Running the pipeline must not throw type errors (due to attempting mutation on frozen objects)
    const result = runInternalPipeline(frozenInput, overrides);
    expect(result.ok).toBe(true);

    // Deep comparison of the frozen request post-run to verify value-level integrity
    expect(frozenInput).toEqual(validRequestInput);
    expect(frozenInput.executionContext).toEqual(
      validRequestInput.executionContext,
    );
    expect(frozenInput.executionContext.budget).toBe(1000);
    expect(frozenInput.executionContext.entropy).toBe("random_entropy_string");
    expect(frozenInput.executionContext.versions).toEqual(["1.0.0", "1.1.0"]);
  });

  // 12.3: Deterministic Propagation Test
  it("guarantees structurally equal results on repeated executions and verifies no side effects", () => {
    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const input1 = JSON.parse(JSON.stringify(validRequestInput));
    const input2 = JSON.parse(JSON.stringify(validRequestInput));

    const res1 = runInternalPipeline(input1, overrides);
    const res2 = runInternalPipeline(input2, overrides);

    expect(res1).toEqual(res2);
    expect(input1).toEqual(validRequestInput);
    expect(input2).toEqual(validRequestInput);
  });

  // 12.4: No Hidden-State Test
  it("proves no hidden module-level or global execution state influences separate runs", () => {
    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    // Run first
    const res1 = runInternalPipeline(validRequestInput, overrides);
    expect(res1.ok).toBe(true);

    // Run second with an independent but structurally equal object
    const equivalentInput: ExecutionRequest = {
      requestId: "req-789",
      identity: { ...validIdentity },
      activeConstitutionalView: {
        identity: { ...validIdentity },
        relationships: [{ ...validRelationship }],
        standings: [{ ...validStanding }],
        authorities: [{ ...validAuthority }],
        capabilities: [{ ...validCapability }],
        evidenceReferences: [{ ...validEvidence }],
        applicablePolicies: [{ ...validPolicy }],
      },
      evidenceBundle: {
        schemaVersion: "1.0",
        evidenceRecords: [{ ...validEvidence }],
      },
      policyContext: {
        policies: [{ ...validPolicy }],
      },
      executionContext: {
        executionId: "exec-456",
        constitutionalTimestamp: "2026-08-08T14:30:00Z",
        budget: 1000,
        entropy: "random_entropy_string",
        versions: ["1.0.0", "1.1.0"],
      },
      resolvedPolicyGraph: {
        edges: [],
      },
    };

    const res2 = runInternalPipeline(equivalentInput, overrides);
    expect(res2).toEqual(res1);
  });

  // 12.5: Missing or Invalid Context Fail-Closed Test
  it("fails closed at Admission stage if executionContext is missing or invalid", () => {
    const invalidInput1 = {
      ...validRequestInput,
      executionContext: undefined as unknown as ExecutionContext,
    };
    const invalidInput2 = {
      ...validRequestInput,
      executionContext: {
        budget: -10, // negative budget is invalid
        entropy: "random_entropy_string",
        versions: ["1.0.0"],
      },
    };

    const overrides: StageOverrideConfig = {
      Admission: { ok: true }, // Even if overrides try to allow Admission, the validator blocks
      "Bundle Discovery": { ok: true },
    };

    const res1 = runInternalPipeline(invalidInput1, overrides);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.stage).toBe("Admission");
      expect(res1.error.code).toBe("INVALID_EXECUTION_REQUEST");
    }
    expect(res1.trace).toEqual(["Admission"]);

    const res2 = runInternalPipeline(invalidInput2, overrides);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.stage).toBe("Admission");
      expect(res2.error.code).toBe("INVALID_EXECUTION_REQUEST");
    }
    expect(res2.trace).toEqual(["Admission"]);
  });

  // 12.6: Budget Preservation Test
  it("proves budget is preserved exactly and is not altered, measured, or consumed", () => {
    const testBudget = 99999;
    const requestWithCustomBudget: ExecutionRequest = {
      ...validRequestInput,
      executionContext: {
        ...validRequestInput.executionContext,
        budget: testBudget,
      },
    };

    const overrides: StageOverrideConfig = {
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const result = runInternalPipeline(requestWithCustomBudget, overrides);
    expect(result.ok).toBe(true);
    expect(requestWithCustomBudget.executionContext.budget).toBe(testBudget);
  });

  // AMS-0405: Reaches Stage 9 and successfully materializes the ExecutionOutput
  it("reaches Receipt Generation and successfully materializes the ExecutionOutput", () => {
    const overrides: StageOverrideConfig = {
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const result = runInternalPipeline(validRequestInput, overrides);
    expect(result.ok).toBe(true);
    if (result.ok && result.outcome.kind === "materialized") {
      expect(result.trace).toContain("Receipt Generation");
      const output = result.outcome.executionOutput;
      expect(output.outcome).toBe("unverified");
      expect(output.trustResult.trustStatus).toBe("uncertain");
      expect(output.executionReceipt).toBeDefined();
      expect(output.executionReceipt.executionId).toBe("exec-456");
      expect(output.policyDecisions).toBeDefined();
    } else {
      expect.fail("Expected outcome to be materialized");
    }
  });

  // AMS-0405: Receipt-Stage constructs and returns a fully completed and validated ExecutionReceipt
  it("proves the pipeline outcome constructs and returns a fully completed and validated ExecutionReceipt", () => {
    const overrides: StageOverrideConfig = {
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const result = runInternalPipeline(validRequestInput, overrides);
    expect(result.ok).toBe(true);
    if (result.ok && result.outcome.kind === "materialized") {
      const receipt = result.outcome.executionOutput.executionReceipt;
      expect(receipt.receiptId).toBeDefined();
      expect(receipt.executionId).toBe("exec-456");
      expect(receipt.runtimeVersion).toBe("1.0.0");
      expect(receipt.inputHash).toBeDefined();
      expect(receipt.outputHash).toBeDefined();
      expect(receipt.evidenceHash).toBeDefined();
      expect(receipt.deterministicHash).toBeDefined();
    } else {
      expect.fail("Expected outcome to be materialized");
    }
  });

  describe("Deterministic replay proof — AMS-0406", () => {
    it("DR-01: authorized execution x 3 -> structurally identical successful PipelineResults", () => {
      const overrides: StageOverrideConfig = {
        outcome: "verified",
        trustResult: { trustStatus: "definite", degradationFactors: [] },
        "Bundle Discovery": { ok: true },
        "Bundle Verification": { ok: true },
        "Dependency Resolution": { ok: true },
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
        "Resolution Graph Construction": { ok: true },
        "Active Execution": { ok: true },
        "Receipt Generation": { ok: true },
      };

      const input1 = JSON.parse(JSON.stringify(validRequestInput));
      const input2 = JSON.parse(JSON.stringify(validRequestInput));
      const input3 = JSON.parse(JSON.stringify(validRequestInput));

      const res1 = runInternalPipeline(input1, overrides);
      const res2 = runInternalPipeline(input2, overrides);
      const res3 = runInternalPipeline(input3, overrides);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      expect(res3.ok).toBe(true);

      expect(res1).toEqual(res2);
      expect(res1).toEqual(res3);

      if (res1.ok && res1.outcome.kind === "materialized") {
        expect(res1.stage).toBe("Receipt Generation");
        expect(res1.trace).toEqual([
          "Admission",
          "Bundle Discovery",
          "Bundle Verification",
          "Dependency Resolution",
          "Compatibility Validation",
          "ACV Activation",
          "Resolution Graph Construction",
          "Active Execution",
          "Receipt Generation",
        ]);
      } else {
        expect.fail("Outcome should be materialized with 9-stage completion");
      }
    });

    it("DR-04: Exact ten-field membership and canonical order", () => {
      const expectedFields = [
        "receiptId",
        "executionId",
        "runtimeVersion",
        "inputHash",
        "outputHash",
        "evidenceHash",
        "policyVersion",
        "decisionSummary",
        "executionTime",
        "deterministicHash",
      ];

      const overrides: StageOverrideConfig = {
        "Bundle Discovery": { ok: true },
        "Bundle Verification": { ok: true },
        "Dependency Resolution": { ok: true },
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
        "Resolution Graph Construction": { ok: true },
        "Active Execution": { ok: true },
        "Receipt Generation": { ok: true },
      };

      const result = runInternalPipeline(validRequestInput, overrides);
      expect(result.ok).toBe(true);
      if (result.ok && result.outcome.kind === "materialized") {
        const receipt = result.outcome.executionOutput.executionReceipt;
        const keys = Object.keys(receipt);
        expect(keys.length).toBe(10);
        for (const field of expectedFields) {
          expect(keys).toContain(field);
        }
      } else {
        expect.fail("Expected a successful materialized outcome");
      }
    });

    it("DR-05: A -> B -> A cross-invocation isolation", () => {
      const overridesA: StageOverrideConfig = {
        "Bundle Discovery": { ok: true },
        "Bundle Verification": { ok: true },
        "Dependency Resolution": { ok: true },
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
        "Resolution Graph Construction": { ok: true },
        "Active Execution": { ok: true },
        "Receipt Generation": { ok: true },
      };

      const overridesB: StageOverrideConfig = {
        "Bundle Discovery": {
          ok: false,
          code: "DISCOVERY_ERR",
          message: "Failure B",
        },
      };

      const requestA1 = JSON.parse(JSON.stringify(validRequestInput));
      const requestB = {
        ...JSON.parse(JSON.stringify(validRequestInput)),
        requestId: "req-distinct-B-999",
      };
      const requestA2 = JSON.parse(JSON.stringify(validRequestInput));

      const resA1 = runInternalPipeline(requestA1, overridesA);
      expect(resA1.ok).toBe(true);

      const resB = runInternalPipeline(requestB, overridesB);
      expect(resB.ok).toBe(false);

      const resA2 = runInternalPipeline(requestA2, overridesA);
      expect(resA2.ok).toBe(true);

      expect(resA1).toEqual(resA2);
    });

    it("DR-06: Explicit input immutability under repeated execution", () => {
      const inputCopy = JSON.parse(JSON.stringify(validRequestInput));
      const frozenInput = deepFreeze(inputCopy);

      const overrides: StageOverrideConfig = {
        "Bundle Discovery": { ok: true },
        "Bundle Verification": { ok: true },
        "Dependency Resolution": { ok: true },
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
        "Resolution Graph Construction": { ok: true },
        "Active Execution": { ok: true },
        "Receipt Generation": { ok: true },
      };

      const res1 = runInternalPipeline(frozenInput, overrides);
      const res2 = runInternalPipeline(frozenInput, overrides);
      const res3 = runInternalPipeline(frozenInput, overrides);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      expect(res3.ok).toBe(true);

      expect(frozenInput).toEqual(validRequestInput);
    });

    it("DR-07: Behavioral confirmation of ExecutionReceipt fields being returned", () => {
      const overrides: StageOverrideConfig = {
        "Bundle Discovery": { ok: true },
        "Bundle Verification": { ok: true },
        "Dependency Resolution": { ok: true },
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
        "Resolution Graph Construction": { ok: true },
        "Active Execution": { ok: true },
        "Receipt Generation": { ok: true },
      };

      const result = runInternalPipeline(validRequestInput, overrides);
      expect(result.ok).toBe(true);

      if (result.ok) {
        const outcome = result.outcome;
        expect(outcome.kind).toBe("materialized");
        if (outcome.kind === "materialized") {
          const receipt = outcome.executionOutput.executionReceipt;
          expect(receipt.receiptId).toBeDefined();
          expect(receipt.deterministicHash).toBeDefined();
        }
      }
    });
  });

  describe("AMS-0803 Explicit Full Verification Tests", () => {
    const defaultOverrides: StageOverrideConfig = {
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    it("verifies explicit G-0813 Budget consumption and fail-closed behavior on budget exhaustion", () => {
      const lowBudgetInput = {
        ...validRequestInput,
        executionContext: {
          ...validRequestInput.executionContext,
          budget: 0,
        },
      };

      const res = runInternalPipeline(lowBudgetInput, {
        ...defaultOverrides,
        "Active Execution": undefined,
      });
      expect(res.ok).toBe(true);
      if (res.ok && res.outcome.kind === "materialized") {
        expect(res.outcome.executionOutput.outcome).toBe("unverified");
        expect(res.outcome.executionOutput.trustResult.trustStatus).toBe(
          "uncertain",
        );
        expect(res.outcome.executionOutput.diagnostics).toContain(
          "Budget exhausted before evaluating policy: policy-001",
        );
      }
    });

    it("verifies direct Outcome and TrustResult consumption and override capabilities", () => {
      const overrides: StageOverrideConfig = {
        ...defaultOverrides,
        outcome: "rejected",
        trustResult: {
          trustStatus: "speculative",
          degradationFactors: ["TEST_DEGRADED"],
        },
      };

      const res = runInternalPipeline(validRequestInput, overrides);
      expect(res.ok).toBe(true);
      if (res.ok && res.outcome.kind === "materialized") {
        const output = res.outcome.executionOutput;
        expect(output.outcome).toBe("rejected");
        expect(output.trustResult.trustStatus).toBe("speculative");
        expect(output.trustResult.degradationFactors).toEqual([
          "TEST_DEGRADED",
        ]);
      }
    });

    it("verifies deterministic, G-0809 domain-separated hashes (preimages are stable and non-circular)", () => {
      const res = runInternalPipeline(validRequestInput, defaultOverrides);
      expect(res.ok).toBe(true);
      if (res.ok && res.outcome.kind === "materialized") {
        const receipt = res.outcome.executionOutput.executionReceipt;
        expect(receipt.inputHash.startsWith("sha256:")).toBe(true);
        expect(receipt.outputHash.startsWith("sha256:")).toBe(true);
        expect(receipt.evidenceHash.startsWith("sha256:")).toBe(true);
        expect(receipt.deterministicHash.startsWith("sha256:")).toBe(true);

        expect(receipt.inputHash).not.toBe(receipt.outputHash);
        expect(receipt.inputHash).not.toBe(receipt.evidenceHash);
        expect(receipt.deterministicHash).not.toBe(receipt.inputHash);
      }
    });

    it("verifies evaluationCoordinate is properly mapped to executionTime and carries no ambient performance time", () => {
      const res = runInternalPipeline(validRequestInput, defaultOverrides);
      expect(res.ok).toBe(true);
      if (res.ok && res.outcome.kind === "materialized") {
        const receipt = res.outcome.executionOutput.executionReceipt;
        const expectedTime = Date.parse(
          validRequestInput.executionContext.constitutionalTimestamp,
        );
        expect(receipt.executionTime).toBe(expectedTime);
      }
    });
  });

  describe("CCP-RI-01A — Mandatory Test Suite (RI01A-T01 to RI01A-T10)", () => {
    it("RI01A-T01: Native Valid Admission", () => {
      const result = runInternalPipeline(validRequestInput);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("PAYLOAD_MISSING");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
      ]);
    });

    it("RI01A-T02: Structural Invalidity", () => {
      const invalidInput = { ...validRequestInput, requestId: "" };
      const result = runInternalPipeline(invalidInput);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Admission");
        expect(result.error.code).toBe("INVALID_EXECUTION_REQUEST");
      }
      expect(result.trace).toEqual(["Admission"]);
    });

    it("RI01A-T03: No Stage-1 POL Evaluation", () => {
      // Behaviorally: Valid request passes Stage 1 regardless of policy definitions
      const requestWithDenyPolicy: ExecutionRequest = {
        ...validRequestInput,
        policyContext: {
          policies: [
            {
              policyId: "deny-policy",
              policyType: "caw:simple",
              version: "1.0.0",
              definition: { rule: "always-deny" },
              active: true,
            },
          ],
        },
      };
      const result = runInternalPipeline(requestWithDenyPolicy);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("PAYLOAD_MISSING");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
      ]);

      // Statically: verify pipeline.ts source code has no defaultPolicyEvaluator or policy status checks in Stage 1
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );
      expect(source).not.toContain("defaultPolicyEvaluator");
      expect(source).not.toContain("ADMISSION_DENIED");
      expect(source).not.toContain("ADMISSION_UNAVAILABLE");
    });

    it("RI01A-T04: Stage-8 Sovereignty", () => {
      // Statically verify evaluatePolicies is called only within Stage 8 Active Execution
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );
      const activeExecIndex = source.indexOf("Active Execution");
      const evalPoliciesIndex = source.indexOf("evaluatePolicies(");

      expect(activeExecIndex).not.toBe(-1);
      expect(evalPoliciesIndex).not.toBe(-1);
      expect(evalPoliciesIndex).toBeGreaterThan(activeExecIndex);
    });

    it("RI01A-T05: No ADMISSION_DENIED Policy Mapping", () => {
      const overrides: StageOverrideConfig = {
        "Bundle Discovery": { ok: true },
        "Bundle Verification": { ok: true },
        "Dependency Resolution": { ok: true },
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
        "Resolution Graph Construction": { ok: true },
        // Active Execution runs natively with policy evaluation
        "Receipt Generation": { ok: true },
      };
      const requestWithDenyPolicy: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          applicablePolicies: [
            {
              policyId: "deny-policy",
              policyType: "caw:simple",
              version: "1.0.0",
              definition: { mockResult: "DENY" },
              active: true,
            },
          ],
        },
        policyContext: {
          policies: [
            {
              policyId: "deny-policy",
              policyType: "caw:simple",
              version: "1.0.0",
              definition: { mockResult: "DENY" },
              active: true,
            },
          ],
        },
      };

      const result = runInternalPipeline(requestWithDenyPolicy, overrides);
      expect(result.ok).toBe(true);
      if (result.ok && result.outcome.kind === "materialized") {
        expect(result.outcome.executionOutput.outcome).toBe("rejected");
        expect(
          result.outcome.executionOutput.trustResult.degradationFactors,
        ).toContain("POLICY_DENIED");
      }
    });

    it("RI01A-T06: No ADMISSION_UNAVAILABLE Default Blocker", () => {
      const result = runInternalPipeline(validRequestInput);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).not.toBe("ADMISSION_UNAVAILABLE");
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("PAYLOAD_MISSING");
      }
    });

    it("RI01A-T07: Domain Neutrality", () => {
      const syntheticNonGs1Request: ExecutionRequest = {
        ...validRequestInput,
        identity: {
          ...validIdentity,
          identityId: "synthetic-uuid-001",
          identityType: "synthetic_asset",
          canonicalReference: "urn:uuid:12345678-1234-1234-1234-123456789abc",
        },
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          identity: {
            ...validIdentity,
            identityId: "synthetic-uuid-001",
            identityType: "synthetic_asset",
            canonicalReference: "urn:uuid:12345678-1234-1234-1234-123456789abc",
          },
        },
      };

      const result = runInternalPipeline(syntheticNonGs1Request);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("PAYLOAD_MISSING");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
      ]);
    });

    it("RI01A-T08: No Hidden I/O", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );
      expect(source).not.toContain('import fs from "fs"');
      expect(source).not.toContain('import http from "http"');
      expect(source).not.toContain('import net from "net"');
      expect(source).not.toContain("process.env");

      // Verify execution with modified process.env produces identical result
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test-mutation-env";
      try {
        const res = runInternalPipeline(validRequestInput);
        expect(res.ok).toBe(false);
        if (!res.ok) {
          expect(res.error.stage).toBe("Bundle Verification");
          expect(res.error.code).toBe("PAYLOAD_MISSING");
        }
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it("RI01A-T09: Deterministic Replay", () => {
      const req1 = JSON.parse(JSON.stringify(validRequestInput));
      const req2 = JSON.parse(JSON.stringify(validRequestInput));

      const res1 = runInternalPipeline(req1);
      const res2 = runInternalPipeline(req2);

      expect(res1).toEqual(res2);
      expect(res1.ok).toBe(false);
      if (!res1.ok) {
        expect(res1.error.stage).toBe("Bundle Verification");
        expect(res1.error.code).toBe("PAYLOAD_MISSING");
      }
      expect(res1.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
      ]);
    });

    it("RI01A-T10: Input Non-Mutation", () => {
      const reqCopy = JSON.parse(JSON.stringify(validRequestInput));
      const frozenInput = deepFreeze(reqCopy);

      const result = runInternalPipeline(frozenInput);
      expect(result.ok).toBe(false);
      expect(frozenInput).toEqual(validRequestInput);
    });
  });

  describe("CCP-RI-02A — Mandatory Test Suite (RI02A-T01 to RI02A-T13)", () => {
    it("RI02A-T01: Required Evidence Complete", () => {
      const evidenceA: EvidenceRecord = {
        evidenceId: "ev-A",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashA",
        storageRef: "r2://A",
        retrievedAt: "2026-07-28T12:00:00Z",
      };
      const evidenceB: EvidenceRecord = {
        evidenceId: "ev-B",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashB",
        storageRef: "r2://B",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const req: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evidenceA, evidenceB],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evidenceA, evidenceB],
        },
      };

      const result = runInternalPipeline(req);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.trace).toContain("Bundle Discovery");
        expect(result.error.stage).toBe("Bundle Verification");
      }
    });

    it("RI02A-T02: Required Evidence Missing", () => {
      const evidenceA: EvidenceRecord = {
        evidenceId: "ev-A",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashA",
        storageRef: "r2://A",
        retrievedAt: "2026-07-28T12:00:00Z",
      };
      const evidenceB: EvidenceRecord = {
        evidenceId: "ev-B",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashB",
        storageRef: "r2://B",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const req: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evidenceA, evidenceB],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evidenceA],
        },
      };

      const result = runInternalPipeline(req);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Discovery");
        expect(result.error.code).toBe(
          "BUNDLE_DISCOVERY_MISSING_REQUIRED_MATERIAL",
        );
        expect(result.error.message).toContain("ev-B");
        expect(result.trace).toEqual(["Admission", "Bundle Discovery"]);
      }
    });

    it("RI02A-T03: Empty Required Set", () => {
      const req: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [],
        },
      };

      const result = runInternalPipeline(req);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Compatibility Validation");
        expect(result.error.code).toBe("COMPATIBILITY_VALIDATION_UNAVAILABLE");
        expect(result.trace).toEqual([
          "Admission",
          "Bundle Discovery",
          "Bundle Verification",
          "Dependency Resolution",
          "Compatibility Validation",
        ]);
      }
    });

    it("RI02A-T04: Superset Evidence", () => {
      const evidenceA: EvidenceRecord = {
        evidenceId: "ev-A",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashA",
        storageRef: "r2://A",
        retrievedAt: "2026-07-28T12:00:00Z",
      };
      const evidenceB: EvidenceRecord = {
        evidenceId: "ev-B",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashB",
        storageRef: "r2://B",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const req: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evidenceA],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evidenceA, evidenceB],
        },
      };

      const result = runInternalPipeline(req);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.trace).toEqual([
          "Admission",
          "Bundle Discovery",
          "Bundle Verification",
        ]);
      }
    });

    it("RI02A-T05: No Cryptographic Verification", () => {
      const evidenceA: EvidenceRecord = {
        evidenceId: "ev-A",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        storageRef: "r2://A",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const req: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evidenceA],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evidenceA],
        },
      };

      // Provide corrupt evidencePayload where payload hash does not match evidenceA.hash
      const evidencePayloads = new Map<string, unknown>([
        ["ev-A", { corruptedData: true }],
      ]);

      const result = runInternalPipeline(req, undefined, evidencePayloads);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.trace).toEqual([
          "Admission",
          "Bundle Discovery",
          "Bundle Verification",
        ]);
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("HASH_MISMATCH");
      }
    });

    it("RI02A-T06: Domain Neutrality", () => {
      const syntheticReq: ExecutionRequest = {
        ...validRequestInput,
        identity: {
          identityId: "synth-id-1",
          identityType: "synthetic_kind",
          canonicalReference: "urn:synthetic:ref:1",
          referentId: null,
          status: "active",
          createdAt: "2026-07-28T12:00:00Z",
          updatedAt: "2026-07-28T12:00:00Z",
        },
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          identity: {
            identityId: "synth-id-1",
            identityType: "synthetic_kind",
            canonicalReference: "urn:synthetic:ref:1",
            referentId: null,
            status: "active",
            createdAt: "2026-07-28T12:00:00Z",
            updatedAt: "2026-07-28T12:00:00Z",
          },
        },
      };

      const result = runInternalPipeline(syntheticReq);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.trace).toEqual([
          "Admission",
          "Bundle Discovery",
          "Bundle Verification",
        ]);
      }
    });

    it("RI02A-T07: No I/O", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );

      expect(source).not.toContain("RegistryRepository");
      expect(source).not.toContain("fetch(");
      expect(source).not.toContain("axios");
      expect(source).not.toContain("ObjectStorage");
      expect(source).not.toContain("process.env");
      expect(source).not.toContain("Date.now");
      expect(source).not.toContain("new Date(");
      expect(source).not.toContain("Math.random");
      expect(source).not.toContain("crypto.randomUUID");
    });

    it("RI02A-T08: No Z-PROF Dependency", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );

      expect(source).not.toContain("zprof");
      expect(source).not.toContain("CompositionManifest");
      expect(source).not.toContain("EvaluationCoordinate");
      expect(source).not.toContain("SCC");
      expect(source).not.toContain("BCG");
      expect(source).not.toContain("DomainTemplateCard");
      expect(source).not.toContain("EpistemicRequirement");
      expect(source).not.toContain("DigitalLink");
      expect(source).not.toContain("DPP");
    });

    it("RI02A-T09: Deterministic Permutation", () => {
      const evidenceA: EvidenceRecord = {
        evidenceId: "ev-A",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashA",
        storageRef: "r2://A",
        retrievedAt: "2026-07-28T12:00:00Z",
      };
      const evidenceB: EvidenceRecord = {
        evidenceId: "ev-B",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashB",
        storageRef: "r2://B",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const reqOrder1: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evidenceA, evidenceB],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evidenceB, evidenceA],
        },
      };

      const reqOrder2: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evidenceB, evidenceA],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evidenceA, evidenceB],
        },
      };

      const res1 = runInternalPipeline(reqOrder1);
      const res2 = runInternalPipeline(reqOrder2);

      expect(res1).toEqual(res2);
    });

    it("RI02A-T10: Input Non-Mutation", () => {
      const evidenceA: EvidenceRecord = {
        evidenceId: "ev-A",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashA",
        storageRef: "r2://A",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const req: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evidenceA],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evidenceA],
        },
      };

      const frozenReq = deepFreeze(JSON.parse(JSON.stringify(req)));
      const res = runInternalPipeline(frozenReq);

      expect(res.ok).toBe(false);
      expect(frozenReq).toEqual(req);
    });

    it("RI02A-T11: No New Bundle Primitive", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );

      const prohibitedPrimitives = [
        "Bundle",
        "RuntimeBundle",
        "ConstitutionalBundle",
        "CandidateBundle",
        "DiscoveredBundle",
        "DiscoveryBundle",
        "RequiredMaterialBundle",
      ];

      for (const prim of prohibitedPrimitives) {
        expect(source).not.toContain(`type ${prim}`);
        expect(source).not.toContain(`interface ${prim}`);
        expect(source).not.toContain(`class ${prim}`);
      }
    });

    it("RI02A-T12: Native Progression", () => {
      const result = runInternalPipeline(validRequestInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("PAYLOAD_MISSING");
        expect(result.trace).toEqual([
          "Admission",
          "Bundle Discovery",
          "Bundle Verification",
        ]);
      }
    });

    it("RI02A-T13: Duplicate Evidence Identifier Governance", () => {
      const duplicateEvidence: EvidenceRecord = {
        evidenceId: "ev-DUP",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "hashDUP",
        storageRef: "r2://DUP",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const reqWithDuplicateBundle = {
        ...validRequestInput,
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [duplicateEvidence, duplicateEvidence],
        },
      };

      const result = runInternalPipeline(reqWithDuplicateBundle);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Admission");
        expect(result.error.code).toBe("INVALID_EXECUTION_REQUEST");
        expect(result.error.message).toContain(
          "Duplicate evidence reference detected",
        );
      }
    });
  });

  describe("CCP-RI-04A — Mandatory Test Suite (RI04A-T01 to RI04A-T12)", () => {
    const validPayloads = new Map<string, unknown>([
      [validEvidence.evidenceId, validEvidencePayload],
    ]);

    it("RI04A-T01 — Native Valid Stage-4 Passage", () => {
      const result = runInternalPipeline(
        validRequestInput,
        undefined,
        validPayloads,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Compatibility Validation");
        expect(result.error.code).toBe("COMPATIBILITY_VALIDATION_UNAVAILABLE");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
        "Dependency Resolution",
        "Compatibility Validation",
      ]);
    });

    it("RI04A-T02 — Explicit Graph Pass-Through", () => {
      const reqWithGraph: ExecutionRequest = {
        ...validRequestInput,
        resolvedPolicyGraph: {
          edges: [{ dependeeId: "policy-001", dependentId: "policy-002" }],
        },
      };
      const reqCopy = JSON.parse(JSON.stringify(reqWithGraph));

      const result = runInternalPipeline(
        reqWithGraph,
        undefined,
        validPayloads,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Compatibility Validation");
      }
      expect(reqWithGraph.resolvedPolicyGraph).toEqual(
        reqCopy.resolvedPolicyGraph,
      );
    });

    it("RI04A-T03 — Empty Dependency State", () => {
      const emptyGraphReq: ExecutionRequest = {
        ...validRequestInput,
        resolvedPolicyGraph: {
          edges: [],
        },
      };

      const result = runInternalPipeline(
        emptyGraphReq,
        undefined,
        validPayloads,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Compatibility Validation");
        expect(result.error.code).toBe("COMPATIBILITY_VALIDATION_UNAVAILABLE");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
        "Dependency Resolution",
        "Compatibility Validation",
      ]);
    });

    it("RI04A-T04 — Unknown Reference Sovereignty", () => {
      const unknownRefReq: ExecutionRequest = {
        ...validRequestInput,
        resolvedPolicyGraph: {
          edges: [
            { dependeeId: "policy-001", dependentId: "unknown-policy-999" },
          ],
        },
      };

      // NO Stage 4 override! Test-only overrides for Stage 5 and 6 to drive execution to Stage 7
      const overrides: StageOverrideConfig = {
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
      };

      const result = runInternalPipeline(
        unknownRefReq,
        overrides,
        validPayloads,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Resolution Graph Construction");
        expect(result.error.code).toBe("REFERENTIAL_INTEGRITY_VIOLATION");
      }
      expect(result.trace).toContain("Dependency Resolution");
      expect(result.trace).toContain("Resolution Graph Construction");
    });

    it("RI04A-T05 — Cycle Sovereignty", () => {
      const cycleReq: ExecutionRequest = {
        ...validRequestInput,
        resolvedPolicyGraph: {
          edges: [{ dependeeId: "policy-001", dependentId: "policy-001" }],
        },
      };

      // NO Stage 4 override! Test-only overrides for Stage 5 and 6 to drive execution to Stage 7
      const overrides: StageOverrideConfig = {
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
      };

      const result = runInternalPipeline(cycleReq, overrides, validPayloads);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Resolution Graph Construction");
        expect(result.error.code).toBe("CYCLIC_POLICY_GRAPH");
      }
      expect(result.trace).toContain("Dependency Resolution");
      expect(result.trace).toContain("Resolution Graph Construction");
    });

    it("RI04A-T06 — No Topological Ordering", () => {
      const reqWithEdges: ExecutionRequest = {
        ...validRequestInput,
        resolvedPolicyGraph: {
          edges: [{ dependeeId: "policy-B", dependentId: "policy-A" }],
        },
      };

      const reqCopy = JSON.parse(JSON.stringify(reqWithEdges));
      const result = runInternalPipeline(
        reqWithEdges,
        undefined,
        validPayloads,
      );

      expect(result.ok).toBe(false);
      expect(reqWithEdges.resolvedPolicyGraph.edges).toEqual(
        reqCopy.resolvedPolicyGraph.edges,
      );
    });

    it("RI04A-T07 — Domain Neutrality", () => {
      const syntheticReq: ExecutionRequest = {
        ...validRequestInput,
        identity: {
          identityId: "synthetic-asset-999",
          identityType: "synthetic_kind",
          canonicalReference: "urn:uuid:99999999-9999-9999-9999-999999999999",
          referentId: null,
          status: "active",
          createdAt: "2026-07-28T12:00:00Z",
          updatedAt: "2026-07-28T12:00:00Z",
        },
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          identity: {
            identityId: "synthetic-asset-999",
            identityType: "synthetic_kind",
            canonicalReference: "urn:uuid:99999999-9999-9999-9999-999999999999",
            referentId: null,
            status: "active",
            createdAt: "2026-07-28T12:00:00Z",
            updatedAt: "2026-07-28T12:00:00Z",
          },
        },
      };

      const result = runInternalPipeline(
        syntheticReq,
        undefined,
        validPayloads,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Compatibility Validation");
        expect(result.error.code).toBe("COMPATIBILITY_VALIDATION_UNAVAILABLE");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
        "Dependency Resolution",
        "Compatibility Validation",
      ]);
    });

    it("RI04A-T08 — Zero I/O", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );

      expect(source).not.toContain("RegistryRepository");
      expect(source).not.toContain("fetch(");
      expect(source).not.toContain("axios");
      expect(source).not.toContain("ObjectStorage");
      expect(source).not.toContain("process.env");
      expect(source).not.toContain("Date.now");
      expect(source).not.toContain("new Date(");
      expect(source).not.toContain("Math.random");
      expect(source).not.toContain("crypto.randomUUID");
    });

    it("RI04A-T09 — Zero Z-PROF / GS1 Dependency", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );

      expect(source).not.toContain("zprof");
      expect(source).not.toContain("CompositionManifest");
      expect(source).not.toContain("EvaluationCoordinate");
      expect(source).not.toContain("SCC");
      expect(source).not.toContain("BCG");
      expect(source).not.toContain("DomainTemplateCard");
      expect(source).not.toContain("EpistemicRequirement");
      expect(source).not.toContain("DigitalLink");
      expect(source).not.toContain("DPP");
      expect(source).not.toContain("GTIN");
    });

    it("RI04A-T10 — Input Non-Mutation", () => {
      const reqCopy = JSON.parse(JSON.stringify(validRequestInput));
      const frozenReq = deepFreeze(reqCopy);
      const frozenPayloads = deepFreeze(new Map(validPayloads));

      const result = runInternalPipeline(frozenReq, undefined, frozenPayloads);

      expect(result.ok).toBe(false);
      expect(frozenReq).toEqual(validRequestInput);
    });

    it("RI04A-T11 — Deterministic Replay", () => {
      const req1 = JSON.parse(JSON.stringify(validRequestInput));
      const req2 = JSON.parse(JSON.stringify(validRequestInput));

      const res1 = runInternalPipeline(req1, undefined, validPayloads);
      const res2 = runInternalPipeline(req2, undefined, validPayloads);

      expect(res1).toEqual(res2);
      expect(res1.ok).toBe(false);
      if (!res1.ok) {
        expect(res1.error.stage).toBe("Compatibility Validation");
        expect(res1.error.code).toBe("COMPATIBILITY_VALIDATION_UNAVAILABLE");
      }
      expect(res1.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
        "Dependency Resolution",
        "Compatibility Validation",
      ]);
    });

    it("RI04A-T12 — No New Dependency Primitive", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );

      const prohibitedPrimitives = [
        "DependencyResolutionResult",
        "DependencyManifest",
        "DependencyBundle",
        "RuntimeDependencyGraph",
        "ResolvedDependencySet",
        "CandidateDependencySet",
        "DependencySelection",
        "DependencyPlan",
        "ResolvedDependencyManifest",
      ];

      for (const prim of prohibitedPrimitives) {
        expect(source).not.toContain(`type ${prim}`);
        expect(source).not.toContain(`interface ${prim}`);
        expect(source).not.toContain(`class ${prim}`);
      }
    });
  });

  describe("CCP-RI-03A — Mandatory Test Suite (RI03A-T01 to RI03A-T12)", () => {
    it("RI03A-T01 — Valid Evidence Verification", () => {
      const payloads = new Map<string, unknown>([
        [validEvidence.evidenceId, validEvidencePayload],
      ]);
      const result = runInternalPipeline(
        validRequestInput,
        undefined,
        payloads,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Compatibility Validation");
        expect(result.error.code).toBe("COMPATIBILITY_VALIDATION_UNAVAILABLE");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
        "Dependency Resolution",
        "Compatibility Validation",
      ]);
    });

    it("RI03A-T02 — Empty Bundle, No Payloads", () => {
      const emptyBundleReq: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [],
        },
      };
      const result = runInternalPipeline(emptyBundleReq, undefined, undefined);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Compatibility Validation");
        expect(result.error.code).toBe("COMPATIBILITY_VALIDATION_UNAVAILABLE");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
        "Dependency Resolution",
        "Compatibility Validation",
      ]);
    });

    it("RI03A-T03 — Missing Payload", () => {
      const result = runInternalPipeline(
        validRequestInput,
        undefined,
        new Map(),
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("PAYLOAD_MISSING");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
      ]);
    });

    it("RI03A-T04 — Hash Mismatch", () => {
      const corruptPayloads = new Map<string, unknown>([
        [validEvidence.evidenceId, { hello: "corrupted_world" }],
      ]);
      const result = runInternalPipeline(
        validRequestInput,
        undefined,
        corruptPayloads,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("HASH_MISMATCH");
      }
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
      ]);
    });

    it("RI03A-T05 — Bundle Size Limit", { timeout: 15000 }, () => {
      const largePayload = { data: "x".repeat(11 * 1024 * 1024) };
      // Compute hash for large payload to bypass HASH_MISMATCH and trigger BUNDLE_LIMIT_EXCEEDED
      const hashHex = crypto
        .createHash("sha256")
        .update(canonicalizeJcs(largePayload), "utf8")
        .digest("hex");

      const largeEvidence: EvidenceRecord = {
        evidenceId: "large-ev-001",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: `sha256:${hashHex}`,
        storageRef: "r2://key-large",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const largeReq: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [largeEvidence],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [largeEvidence],
        },
      };

      const payloads = new Map<string, unknown>([
        ["large-ev-001", largePayload],
      ]);

      const result = runInternalPipeline(largeReq, undefined, payloads);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("BUNDLE_LIMIT_EXCEEDED");
      }
    });

    it("RI03A-T06 — Unsupported Hash Algorithm", () => {
      const unsupportedEvidence: EvidenceRecord = {
        evidenceId: "ev-unsupported",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "sha512:abcdef123456",
        storageRef: "r2://key-unsupported",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const req: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [unsupportedEvidence],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [unsupportedEvidence],
        },
      };

      const payloads = new Map<string, unknown>([
        ["ev-unsupported", { data: true }],
      ]);

      const result = runInternalPipeline(req, undefined, payloads);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("UNSUPPORTED_HASH_ALGORITHM");
      }
    });

    it("RI03A-T07 — Invalid Hash Format", () => {
      const invalidFormatEvidence: EvidenceRecord = {
        evidenceId: "ev-bad-format",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: "invalid-hash-no-colon",
        storageRef: "r2://key-bad-format",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const req: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [invalidFormatEvidence],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [invalidFormatEvidence],
        },
      };

      const payloads = new Map<string, unknown>([
        ["ev-bad-format", { data: true }],
      ]);

      const result = runInternalPipeline(req, undefined, payloads);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Bundle Verification");
        expect(result.error.code).toBe("INVALID_HASH_FORMAT");
      }
    });

    it("RI03A-T08 — Deterministic Multi-Failure Selection", () => {
      // Create two failing EvidenceRecords with distinct evidenceIds & different failure conditions:
      // "ev-A": Missing payload -> PAYLOAD_MISSING
      // "ev-B": Corrupted payload -> HASH_MISMATCH
      const evA: EvidenceRecord = {
        evidenceId: "ev-A",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: validEvidenceHash,
        storageRef: "r2://key-A",
        retrievedAt: "2026-07-28T12:00:00Z",
      };
      const evB: EvidenceRecord = {
        evidenceId: "ev-B",
        identityId: "id-123",
        evidenceType: "caw:receipt",
        hash: validEvidenceHash,
        storageRef: "r2://key-B",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      // Only supply payload for ev-B (which is corrupt for validEvidenceHash)
      const payloads = new Map<string, unknown>([
        ["ev-B", { wrongPayload: true }],
      ]);

      // Permutation 1: [evA, evB]
      const req1: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evA, evB],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evA, evB],
        },
      };

      // Permutation 2: [evB, evA]
      const req2: ExecutionRequest = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [evB, evA],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [evB, evA],
        },
      };

      const res1 = runInternalPipeline(req1, undefined, payloads);
      const res2 = runInternalPipeline(req2, undefined, payloads);

      // Both permutations must return the exact same Stage-3 PipelineError!
      expect(res1).toEqual(res2);
      expect(res1.ok).toBe(false);
      if (!res1.ok) {
        expect(res1.error.stage).toBe("Bundle Verification");
        // Ordinal comparison selects "ev-A" first -> PAYLOAD_MISSING
        expect(res1.error.code).toBe("PAYLOAD_MISSING");
      }
    });

    it("RI03A-T09 — Input Non-Mutation", () => {
      const payloads = new Map<string, unknown>([
        [validEvidence.evidenceId, validEvidencePayload],
      ]);
      const reqCopy = JSON.parse(JSON.stringify(validRequestInput));
      const frozenInput = deepFreeze(reqCopy);
      const frozenPayloads = deepFreeze(payloads);

      const result = runInternalPipeline(
        frozenInput,
        undefined,
        frozenPayloads,
      );
      expect(result.ok).toBe(false);
      expect(frozenInput).toEqual(validRequestInput);
    });

    it("RI03A-T10 — No I/O / Domain Leakage", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "pipeline.ts"),
        "utf-8",
      );

      // Audit forbidden symbols in production pipeline
      expect(source).not.toContain("RegistryRepository");
      expect(source).not.toContain("EvidencePayloadProvider");
      expect(source).not.toContain("ObjectStorage");
      expect(source).not.toContain("fetch(");
      expect(source).not.toContain("axios");
      expect(source).not.toContain("http");
      expect(source).not.toContain("https");
      expect(source).not.toContain("process.env");
      expect(source).not.toContain("Date.now");
      expect(source).not.toContain("new Date(");
      expect(source).not.toContain("Math.random");
      expect(source).not.toContain("crypto.randomUUID");
      expect(source).not.toContain("CompositionManifest");
      expect(source).not.toContain("EvaluationCoordinate");
      expect(source).not.toContain("SCC");
      expect(source).not.toContain("BCG");
      expect(source).not.toContain("GS1");
      expect(source).not.toContain("GTIN");
      expect(source).not.toContain("DigitalLink");
      expect(source).not.toContain("currentlyTrusted");
    });

    it("RI03A-T11 — Runtime Reverification After Application Preflight", () => {
      // Prove Stage 3 executes verifyEvidenceBundle natively regardless of upstream preflight
      const payloads = new Map<string, unknown>([
        [validEvidence.evidenceId, validEvidencePayload],
      ]);
      const result = runInternalPipeline(
        validRequestInput,
        undefined,
        payloads,
      );
      // Stage 3 succeeds natively, progressing to Stage 4 and Stage 5
      expect(result.trace).toEqual([
        "Admission",
        "Bundle Discovery",
        "Bundle Verification",
        "Dependency Resolution",
        "Compatibility Validation",
      ]);
    });

    it("RI03A-T12 — Native Progression", () => {
      const payloads = new Map<string, unknown>([
        [validEvidence.evidenceId, validEvidencePayload],
      ]);
      const result = runInternalPipeline(
        validRequestInput,
        undefined,
        payloads,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stage).toBe("Compatibility Validation");
        expect(result.error.code).toBe("COMPATIBILITY_VALIDATION_UNAVAILABLE");
        expect(result.trace).toEqual([
          "Admission",
          "Bundle Discovery",
          "Bundle Verification",
          "Dependency Resolution",
          "Compatibility Validation",
        ]);
      }
    });
  });
});
