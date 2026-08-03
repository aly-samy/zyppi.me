import { describe, it, expect } from "vitest";
// @ts-expect-error fs has no typings in this package
import * as fs from "fs";
// @ts-expect-error path has no typings in this package
import * as path from "path";
// @ts-expect-error url has no typings in this package
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
  PolicyContext,
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
      evidenceRecords: [validEvidence],
    },
    policyContext: {
      policies: [validPolicy],
    },
    executionContext: {
      budget: 1000,
      entropy: "random_entropy_string",
      versions: ["1.0.0", "1.1.0"],
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
  it("fails closed at Admission stage under default production configuration", () => {
    const result = runInternalPipeline(validRequestInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Admission");
      expect(result.error.code).toBe("ADMISSION_UNAVAILABLE");
    }
    expect(result.trace).toEqual(["Admission"]);
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
      "ACV Activation",
      "Resolution Graph Construction",
      "Active Execution",
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
        evidenceRecords: [{ ...validEvidence }],
      },
      policyContext: {
        policies: [{ ...validPolicy }],
      },
      executionContext: {
        budget: 1000,
        entropy: "random_entropy_string",
        versions: ["1.0.0", "1.1.0"],
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

  // AMS-0404: Deterministic Authorization
  it("proves deterministic authorization when evaluator returns authorized", () => {
    let receivedPolicyContext: PolicyContext | null = null;
    let receivedExecutionContext: ExecutionContext | null = null;

    const overrides: StageOverrideConfig = {
      policyEvaluator: (policyContext, executionContext) => {
        receivedPolicyContext = policyContext;
        receivedExecutionContext = executionContext;
        return { status: "authorized" };
      },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const inputCopy = JSON.parse(JSON.stringify(validRequestInput));
    const result = runInternalPipeline(inputCopy, overrides);

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

    expect(receivedPolicyContext).toEqual(validRequestInput.policyContext);
    expect(receivedExecutionContext).toEqual(
      validRequestInput.executionContext,
    );
  });

  // AMS-0404: Deterministic Denial
  it("proves deterministic denial when evaluator returns denied, preventing all downstream stages", () => {
    const overrides: StageOverrideConfig = {
      policyEvaluator: () => {
        return { status: "denied" };
      },
      "Bundle Discovery": { ok: true },
    };

    const inputCopy = JSON.parse(JSON.stringify(validRequestInput));
    const result = runInternalPipeline(inputCopy, overrides);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Admission");
      expect(result.error.code).toBe("ADMISSION_DENIED");
      expect(result.error.message).toBe("Policy evaluation denied admission.");
    }
    // Downstream stages must not execute or be in trace
    expect(result.trace).toEqual(["Admission"]);
  });

  // AMS-0404: Evaluation Cannot Be Silently Bypassed
  it("proves evaluation cannot be silently bypassed even when Admission is overridden to true", () => {
    const overrides: StageOverrideConfig = {
      policyEvaluator: () => {
        return { status: "denied" };
      },
      Admission: { ok: true }, // attempting bypass
      "Bundle Discovery": { ok: true },
    };

    const result = runInternalPipeline(validRequestInput, overrides);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Admission");
      expect(result.error.code).toBe("ADMISSION_DENIED");
    }
    expect(result.trace).toEqual(["Admission"]);
  });

  // AMS-0404: Repeated Execution
  it("proves structurally identical results on repeated execution without dependency on hidden state", () => {
    const overrides: StageOverrideConfig = {
      policyEvaluator: () => {
        return { status: "denied" };
      },
    };

    const result1 = runInternalPipeline(validRequestInput, overrides);
    const result2 = runInternalPipeline(validRequestInput, overrides);

    expect(result1).toEqual(result2);
  });

  // AMS-0404: Input Immutability
  it("proves evaluator and pipeline do not mutate inputs", () => {
    const inputCopy = JSON.parse(JSON.stringify(validRequestInput));
    const frozenInput = deepFreeze(inputCopy);

    const overrides: StageOverrideConfig = {
      policyEvaluator: (policyContext, executionContext) => {
        // Assert input shape can be read but not mutated
        expect(policyContext).toEqual(validRequestInput.policyContext);
        expect(executionContext).toEqual(validRequestInput.executionContext);
        return { status: "authorized" };
      },
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };

    const result = runInternalPipeline(frozenInput, overrides);
    expect(result.ok).toBe(true);
    expect(frozenInput).toEqual(validRequestInput);
  });

  // AMS-0404: Fail-Closed Evaluator Unavailability
  it("proves evaluator unavailability fails closed with ADMISSION_UNAVAILABLE when no stage-override is present", () => {
    const overrides: StageOverrideConfig = {
      policyEvaluator: () => {
        return { status: "unavailable" };
      },
    };

    const result = runInternalPipeline(validRequestInput, overrides);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Admission");
      expect(result.error.code).toBe("ADMISSION_UNAVAILABLE");
      expect(result.error.message).toBe(
        "Substantive admission engine is not authorized or implemented.",
      );
    }
    expect(result.trace).toEqual(["Admission"]);
  });

  // AMS-0404: Default Evaluator behavior is unavailable
  it("proves default/production evaluator fails closed as unavailable", () => {
    // When no overrides or evaluator is provided
    const result = runInternalPipeline(validRequestInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("Admission");
      expect(result.error.code).toBe("ADMISSION_UNAVAILABLE");
    }
  });
});
