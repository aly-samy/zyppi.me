import { describe, it, expect } from "vitest";
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
} from "@zyppi/domain";

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
    // Inject a failure at Bundle Verification
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
    // Should stop exactly at Bundle Verification and NEVER execute dependency resolution or later stages
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
    const invalidInput = { ...validRequestInput, requestId: "" }; // invalid requestId
    const overrides: StageOverrideConfig = {
      // Even if Admission test override is set to OK, the validator check must run
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
});
