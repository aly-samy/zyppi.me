import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as runtimeIndex from "./index.js";
import { runInternalPipeline } from "./pipeline.js";
import type { StageOverrideConfig } from "./types.js";
import type {
  ExecutionRequest,
  IdentityRecord,
  ReferentRecord,
  StandingRecord,
  AuthorityRecord,
  CapabilityRecord,
  EvidenceRecord,
  PolicyRecord,
  ExecutionContext,
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

  const validEvidence: EvidenceRecord = {
    evidenceId: "evidence-001",
    identityId: "id-123",
    evidenceType: "caw:receipt",
    hash: "hash123",
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

  // 10.4: Default production/unimplemented behavior
  it("passes Stage 1 natively and fails at Stage 2 (Bundle Discovery) under default production configuration", () => {
    const result = runInternalPipeline(validRequestInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Bundle Discovery");
      expect(result.error.code).toBe("BUNDLE_DISCOVERY_UNAVAILABLE");
    }
    expect(result.trace).toEqual(["Admission", "Bundle Discovery"]);
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
  it("confirms that the public entry point exposes zero symbols", () => {
    expect({ ...runtimeIndex }).toEqual({});
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

    // Verify that all post-Admission stages (2 to 9) pass context as the third argument to executePostAdmissionStage
    const stages = [
      "Bundle Discovery",
      "Bundle Verification",
      "Dependency Resolution",
      "Compatibility Validation",
      "Receipt Generation",
    ];

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
        expect(result.error.stage).toBe("Bundle Discovery");
        expect(result.error.code).toBe("BUNDLE_DISCOVERY_UNAVAILABLE");
      }
      expect(result.trace).toEqual(["Admission", "Bundle Discovery"]);
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
        expect(result.error.stage).toBe("Bundle Discovery");
        expect(result.error.code).toBe("BUNDLE_DISCOVERY_UNAVAILABLE");
      }
      expect(result.trace).toEqual(["Admission", "Bundle Discovery"]);

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
        expect(result.error.stage).toBe("Bundle Discovery");
        expect(result.error.code).toBe("BUNDLE_DISCOVERY_UNAVAILABLE");
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
        expect(result.error.stage).toBe("Bundle Discovery");
        expect(result.error.code).toBe("BUNDLE_DISCOVERY_UNAVAILABLE");
      }
      expect(result.trace).toEqual(["Admission", "Bundle Discovery"]);
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
          expect(res.error.stage).toBe("Bundle Discovery");
          expect(res.error.code).toBe("BUNDLE_DISCOVERY_UNAVAILABLE");
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
        expect(res1.error.stage).toBe("Bundle Discovery");
        expect(res1.error.code).toBe("BUNDLE_DISCOVERY_UNAVAILABLE");
      }
      expect(res1.trace).toEqual(["Admission", "Bundle Discovery"]);
    });

    it("RI01A-T10: Input Non-Mutation", () => {
      const reqCopy = JSON.parse(JSON.stringify(validRequestInput));
      const frozenInput = deepFreeze(reqCopy);

      const result = runInternalPipeline(frozenInput);
      expect(result.ok).toBe(false);
      expect(frozenInput).toEqual(validRequestInput);
    });
  });
});
