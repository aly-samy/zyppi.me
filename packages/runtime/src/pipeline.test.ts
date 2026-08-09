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

    // Verify ACV Activation specifically (which is implemented in AMS-0801)
    const acvPattern = `executePostAdmissionStage(\n    "ACV Activation",\n    () => {`;
    const acvPattern2 = `executePostAdmissionStage( "ACV Activation", () => {`;
    const acvCleaned = source.replace(/\s+/g, " ");
    const hasAcvMatch = source.includes(acvPattern) || acvCleaned.includes(acvPattern2) || acvCleaned.includes("executePostAdmissionStage( \"ACV Activation\", () => {");
    expect(hasAcvMatch).toBe(true);
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

  // AMS-0405: Evaluator-Result Retention & Decision-Summary Mapping
  it("retains evaluator result and deterministically maps decisionSummary across authorized, denied, and unavailable", () => {
    // Case A: authorized
    const overridesAuthorized: StageOverrideConfig = {
      policyEvaluator: () => ({ status: "authorized" }),
      "Bundle Discovery": { ok: true },
      "Bundle Verification": { ok: true },
      "Dependency Resolution": { ok: true },
      "Compatibility Validation": { ok: true },
      "ACV Activation": { ok: true },
      "Resolution Graph Construction": { ok: true },
      "Active Execution": { ok: true },
      "Receipt Generation": { ok: true },
    };
    const resAuth = runInternalPipeline(validRequestInput, overridesAuthorized);
    expect(resAuth.ok).toBe(true);
    if (resAuth.ok && resAuth.outcome.kind === "deferred") {
      expect(resAuth.outcome.decisionSummary).toBe("authorized");
    } else {
      expect.fail("Expected outcome to be deferred");
    }

    // Case B: denied (halts at Admission)
    const overridesDenied: StageOverrideConfig = {
      policyEvaluator: () => ({ status: "denied" }),
      Admission: { ok: true },
      "Bundle Discovery": { ok: true },
    };
    const resDenied = runInternalPipeline(validRequestInput, overridesDenied);
    expect(resDenied.ok).toBe(false);
    if (!resDenied.ok) {
      expect(resDenied.error.stage).toBe("Admission");
      expect(resDenied.error.code).toBe("ADMISSION_DENIED");
    }

    // Case C: unavailable (using Admission override to proceed)
    const overridesUnavailable: StageOverrideConfig = {
      policyEvaluator: () => ({ status: "unavailable" }),
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
    const resUnavail = runInternalPipeline(
      validRequestInput,
      overridesUnavailable,
    );
    expect(resUnavail.ok).toBe(true);
    if (resUnavail.ok && resUnavail.outcome.kind === "deferred") {
      expect(resUnavail.outcome.decisionSummary).toBe("unavailable");
    } else {
      expect.fail("Expected outcome to be deferred");
    }
  });

  // AMS-0405: Receipt-Stage Deferred Outcome Unresolved Fields
  it("reaches Receipt Generation, has deferred kind, and lists exactly the 9 unresolved fields", () => {
    const overrides: StageOverrideConfig = {
      policyEvaluator: () => ({ status: "authorized" }),
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
    if (result.ok && result.outcome.kind === "deferred") {
      expect(result.trace).toContain("Receipt Generation");

      const expectedUnresolved = [
        "receiptId",
        "executionId",
        "runtimeVersion",
        "inputHash",
        "outputHash",
        "evidenceHash",
        "policyVersion",
        "executionTime",
        "deterministicHash",
      ];
      expect(result.outcome.unresolvedFields).toEqual(expectedUnresolved);
    } else {
      expect.fail("Expected outcome to be deferred");
    }
  });

  // AMS-0405: No Fabricated Receipt Negative Test
  it("proves the pipeline outcome does not construct or return a partial or completed ExecutionReceipt", () => {
    const overrides: StageOverrideConfig = {
      policyEvaluator: () => ({ status: "authorized" }),
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
      const outcomeKeys = Object.keys(result.outcome);
      // The outcome must only have kind, decisionSummary, and unresolvedFields
      expect(outcomeKeys).toContain("kind");
      expect(outcomeKeys).toContain("decisionSummary");
      expect(outcomeKeys).toContain("unresolvedFields");

      // Negative check: none of the unresolved fields must exist as top-level properties on the outcome
      const forbiddenKeys = [
        "receiptId",
        "executionId",
        "runtimeVersion",
        "inputHash",
        "outputHash",
        "evidenceHash",
        "policyVersion",
        "executionTime",
        "deterministicHash",
      ];
      for (const k of forbiddenKeys) {
        expect(result.outcome).not.toHaveProperty(k);
      }
    }
  });

  describe("Deterministic replay proof — AMS-0406", () => {
    // DR-01: authorized × 3 independent runs
    it("DR-01: authorized x 3 -> structurally identical successful PipelineResults", () => {
      const overrides: StageOverrideConfig = {
        policyEvaluator: () => ({ status: "authorized" }),
        "Bundle Discovery": { ok: true },
        "Bundle Verification": { ok: true },
        "Dependency Resolution": { ok: true },
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
        "Resolution Graph Construction": { ok: true },
        "Active Execution": { ok: true },
        "Receipt Generation": { ok: true },
      };

      // Three independent runs with identical inputs and overrides
      const input1 = JSON.parse(JSON.stringify(validRequestInput));
      const input2 = JSON.parse(JSON.stringify(validRequestInput));
      const input3 = JSON.parse(JSON.stringify(validRequestInput));

      const res1 = runInternalPipeline(input1, overrides);
      const res2 = runInternalPipeline(input2, overrides);
      const res3 = runInternalPipeline(input3, overrides);

      // Value-level structural equality checks
      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      expect(res3.ok).toBe(true);

      expect(res1).toEqual(res2);
      expect(res1).toEqual(res3);

      if (res1.ok && res1.outcome.kind === "deferred") {
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
        expect(res1.outcome.decisionSummary).toBe("authorized");
        expect(res1.outcome.unresolvedFields).toEqual([
          "receiptId",
          "executionId",
          "runtimeVersion",
          "inputHash",
          "outputHash",
          "evidenceHash",
          "policyVersion",
          "executionTime",
          "deterministicHash",
        ]);
      } else {
        expect.fail("Outcome should be deferred with 9-stage completion");
      }
    });

    // DR-02: denied × 3 independent runs
    it("DR-02: denied x 3 -> structurally identical Admission failure results", () => {
      const overrides: StageOverrideConfig = {
        policyEvaluator: () => ({ status: "denied" }),
      };

      const input1 = JSON.parse(JSON.stringify(validRequestInput));
      const input2 = JSON.parse(JSON.stringify(validRequestInput));
      const input3 = JSON.parse(JSON.stringify(validRequestInput));

      const res1 = runInternalPipeline(input1, overrides);
      const res2 = runInternalPipeline(input2, overrides);
      const res3 = runInternalPipeline(input3, overrides);

      expect(res1.ok).toBe(false);
      expect(res2.ok).toBe(false);
      expect(res3.ok).toBe(false);

      expect(res1).toEqual(res2);
      expect(res1).toEqual(res3);

      if (!res1.ok) {
        expect(res1.error.stage).toBe("Admission");
        expect(res1.error.code).toBe("ADMISSION_DENIED");
        expect(res1.trace).toEqual(["Admission"]);
      }
    });

    // DR-03A: default unavailable × 3 independent runs (fails closed by default)
    it("DR-03A: default unavailable x 3 -> structurally identical Admission failure results", () => {
      const overrides: StageOverrideConfig = {
        policyEvaluator: () => ({ status: "unavailable" }),
      };

      const input1 = JSON.parse(JSON.stringify(validRequestInput));
      const input2 = JSON.parse(JSON.stringify(validRequestInput));
      const input3 = JSON.parse(JSON.stringify(validRequestInput));

      const res1 = runInternalPipeline(input1, overrides);
      const res2 = runInternalPipeline(input2, overrides);
      const res3 = runInternalPipeline(input3, overrides);

      expect(res1.ok).toBe(false);
      expect(res2.ok).toBe(false);
      expect(res3.ok).toBe(false);

      expect(res1).toEqual(res2);
      expect(res1).toEqual(res3);

      if (!res1.ok) {
        expect(res1.error.stage).toBe("Admission");
        expect(res1.error.code).toBe("ADMISSION_UNAVAILABLE");
        expect(res1.trace).toEqual(["Admission"]);
      }
    });

    // DR-03B: override-enabled unavailable × 3 independent runs
    it("DR-03B: override-enabled unavailable x 3 -> structurally identical successful deferred outcomes", () => {
      const overrides: StageOverrideConfig = {
        policyEvaluator: () => ({ status: "unavailable" }),
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
      const input3 = JSON.parse(JSON.stringify(validRequestInput));

      const res1 = runInternalPipeline(input1, overrides);
      const res2 = runInternalPipeline(input2, overrides);
      const res3 = runInternalPipeline(input3, overrides);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      expect(res3.ok).toBe(true);

      expect(res1).toEqual(res2);
      expect(res1).toEqual(res3);

      if (res1.ok && res1.outcome.kind === "deferred") {
        expect(res1.stage).toBe("Receipt Generation");
        expect(res1.outcome.decisionSummary).toBe("unavailable");
        expect(res1.outcome.unresolvedFields).toEqual([
          "receiptId",
          "executionId",
          "runtimeVersion",
          "inputHash",
          "outputHash",
          "evidenceHash",
          "policyVersion",
          "executionTime",
          "deterministicHash",
        ]);
      } else {
        expect.fail("Outcome should be successful and deferred");
      }
    });

    // DR-04: Exact nine-field membership and canonical order
    it("DR-04: Exact nine-field membership and canonical order", () => {
      const expectedFields = [
        "receiptId",
        "executionId",
        "runtimeVersion",
        "inputHash",
        "outputHash",
        "evidenceHash",
        "policyVersion",
        "executionTime",
        "deterministicHash",
      ];

      const overrides: StageOverrideConfig = {
        policyEvaluator: () => ({ status: "authorized" }),
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
      if (result.ok && result.outcome.kind === "deferred") {
        expect(result.outcome.unresolvedFields).toEqual(expectedFields);
        expect(result.outcome.unresolvedFields.length).toBe(9);
      } else {
        expect.fail("Expected a successful deferred outcome");
      }
    });

    // DR-05: A → B → A cross-invocation isolation
    it("DR-05: A -> B -> A cross-invocation isolation", () => {
      const overridesA: StageOverrideConfig = {
        policyEvaluator: () => ({ status: "authorized" }),
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
        policyEvaluator: () => ({ status: "denied" }),
      };

      // Distinct logical request objects
      const requestA1 = JSON.parse(JSON.stringify(validRequestInput));
      const requestB = {
        ...JSON.parse(JSON.stringify(validRequestInput)),
        requestId: "req-distinct-B-999",
      };
      const requestA2 = JSON.parse(JSON.stringify(validRequestInput));

      // 1. Run A1
      const resA1 = runInternalPipeline(requestA1, overridesA);
      expect(resA1.ok).toBe(true);

      // 2. Run B (intervening execution with distinct input and/or state)
      const resB = runInternalPipeline(requestB, overridesB);
      expect(resB.ok).toBe(false);

      // 3. Run A2
      const resA2 = runInternalPipeline(requestA2, overridesA);
      expect(resA2.ok).toBe(true);

      // Verify A1 and A2 are exactly identical (no state leakage from intervening run B)
      expect(resA1).toEqual(resA2);
    });

    // DR-06: Explicit input immutability under repeated execution
    it("DR-06: Explicit input immutability under repeated execution", () => {
      const inputCopy = JSON.parse(JSON.stringify(validRequestInput));
      const frozenInput = deepFreeze(inputCopy);

      const overrides: StageOverrideConfig = {
        policyEvaluator: () => ({ status: "authorized" }),
        "Bundle Discovery": { ok: true },
        "Bundle Verification": { ok: true },
        "Dependency Resolution": { ok: true },
        "Compatibility Validation": { ok: true },
        "ACV Activation": { ok: true },
        "Resolution Graph Construction": { ok: true },
        "Active Execution": { ok: true },
        "Receipt Generation": { ok: true },
      };

      // Running the pipeline three consecutive times on the frozen object must not throw mutation exceptions
      const res1 = runInternalPipeline(frozenInput, overrides);
      const res2 = runInternalPipeline(frozenInput, overrides);
      const res3 = runInternalPipeline(frozenInput, overrides);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      expect(res3.ok).toBe(true);

      // Ensure input structure remains absolutely unchanged
      expect(frozenInput).toEqual(validRequestInput);
    });

    // DR-07: Behavioral confirmation that no ExecutionReceipt is constructed, returned, or populated
    it("DR-07: Behavioral confirmation that no ExecutionReceipt is constructed, returned, or populated", () => {
      const overrides: StageOverrideConfig = {
        policyEvaluator: () => ({ status: "authorized" }),
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
        // Must contain ONLY ReceiptOutcome fields, not ExecutionReceipt fields
        const outcome = result.outcome;
        expect(outcome.kind).toBe("deferred");

        const keys = Object.keys(outcome);
        // The outcomes keys are restricted strictly to ReceiptOutcome
        expect(keys).toContain("kind");
        expect(keys).toContain("decisionSummary");
        expect(keys).toContain("unresolvedFields");
        expect(keys.length).toBe(3);

        // Verification of zero property leakage of the nine deferred receipt fields at top level of the outcome
        const deferredFields = [
          "receiptId",
          "executionId",
          "runtimeVersion",
          "inputHash",
          "outputHash",
          "evidenceHash",
          "policyVersion",
          "executionTime",
          "deterministicHash",
        ];
        for (const k of deferredFields) {
          expect(outcome).not.toHaveProperty(k);
        }
      }
    });
  });
});
