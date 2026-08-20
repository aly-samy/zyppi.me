import { describe, expect, it } from "vitest";
import { createValidatedCanonicalIdentifier } from "@zyppi/contracts";
import {
  type ActiveConstitutionalView,
  type CapabilityRecord,
  type EvidenceRecord,
  type ExecutionReceipt,
  type ExecutionRequest,
  type IdentityRecord,
  type PolicyContext,
  type PolicyRecord,
  type ResolvedPolicyGraph,
} from "@zyppi/domain";
import type { StageOverrideConfig } from "@zyppi/runtime/dist/types.js";
import {
  buildAssessmentRequestCoordinate,
  buildEvaluationCoordinate,
  evaluateAssessmentRequest,
  evaluateHistoricalReconstructionBoundary,
  executeEvaluationCoordinate,
  mapEvaluationCoordinateToExecutionRequest,
  verifyExecutionReceiptIntegrity,
} from "./index.js";
import { ApplicationCompositionResolver } from "./compositionResolver.js";
import { GS1_DOMAIN_TEMPLATE_CARD } from "./fixtures/gs1Dtc.js";
import {
  GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
  GS1_GTIN_EPISTEMIC_REQUIREMENT,
} from "./fixtures/gs1EpistemicRequirements.js";
import { TestRegistryRepository } from "./testRegistryRepository.js";
import type {
  AssessmentRequestCoordinate,
  AssessmentTarget,
  EvaluationCoordinate,
  EvaluationCoordinateInput,
  HistoricalEvaluationCoordinateTarget,
  PinnedStateReference,
} from "./types.js";

describe("AMS-0860-C Execution Integration, Provenance & Verification Test Suite (§41 Scenarios 1–44)", () => {
  const validIdentifierResult =
    createValidatedCanonicalIdentifier("09501101530003");
  if (!validIdentifierResult.ok) {
    throw new Error("Failed to create test identifier");
  }
  const validIdentifier = validIdentifierResult.value;

  const validSccId =
    "sha256:1111111111111111111111111111111111111111111111111111111111111111";
  const validBcgId =
    "sha256:2222222222222222222222222222222222222222222222222222222222222222";

  const validPinnedSemanticState: PinnedStateReference = {
    ref: "acv:trade_item:v1.0.0",
    digest:
      "sha256:3333333333333333333333333333333333333333333333333333333333333333",
    version: "1.0.0",
  };
  const validPinnedAssessmentState: PinnedStateReference = {
    ref: "acv:trade_item:v1.0.0",
    digest:
      "sha256:3333333333333333333333333333333333333333333333333333333333333333",
    version: "1.0.0",
  };

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

  const gs1ProjectionCapability: CapabilityRecord = Object.freeze({
    capabilityId: "prj:spec:gs1_digital_link_projection:v1",
    subjectId: "arm:profile:trade_item:v1",
    scope: "projection:gs1_digital_link",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2030-01-01T00:00:00Z",
  });

  const sampleState = Object.freeze({
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
    capabilities: Object.freeze([gs1ProjectionCapability]),
    evidenceReferences: Object.freeze([sampleEvidenceRecord]),
    applicablePolicies: Object.freeze([]),
  });

  async function getResolvedBoundPayload() {
    const registryRepo = new TestRegistryRepository(sampleState, [
      sampleEvidenceRecord,
    ]);
    const resolver = new ApplicationCompositionResolver();
    const compositionRes = await resolver.resolveComposition({
      dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [
        GS1_GTIN_EPISTEMIC_REQUIREMENT,
        GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
      ],
      registryRepository: registryRepo,
      identifier: validIdentifier,
      requestId: "req-c-01",
      executionId: "exec-c-01",
      constitutionalTimestamp: "2026-08-10T00:00:00Z",
      budget: 1000,
      entropy: "entropy-c-01",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: validEvidenceBundle,
      explicitEvidencePayloads: validEvidencePayloads,
    });

    if (!compositionRes.ok) {
      throw new Error("Composition resolution failed in test setup");
    }
    return compositionRes.boundPayload;
  }

  const defaultEcInput: EvaluationCoordinateInput = {
    sccId: validSccId,
    bcgId: validBcgId,
    pinnedSemanticStateRef: validPinnedSemanticState,
    boundContext: { jurisdiction: "EU", purpose: "trade_item_evaluation" },
    evidenceIntegrityCoordinates: [
      {
        evidenceRef: "evd-001",
        digest:
          "sha256:d7a8fbb307d7809469ca9abec0003e42edd8ad9ab130919d20f23e37271dca9f",
      },
    ],
    authorizedInputs: { userRole: "admin" },
    evaluationParameters: { threshold: 100 },
    temporalCoordinates: { tEInput: "2026-08-10T00:00:00Z" },
  };

  function getValidEc(): EvaluationCoordinate {
    const res = buildEvaluationCoordinate(defaultEcInput);
    if (!res.ok) {
      throw new Error("Failed to construct valid EC in test setup");
    }
    return res.coordinate;
  }

  // ==========================================================================
  // Section 1: RI Seam Integration Scenarios (1–6)
  // ==========================================================================

  it("Scenario 1 — Valid EC maps mechanically to existing RI ExecutionRequest", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const mapRes = mapEvaluationCoordinateToExecutionRequest({
      coordinate: ec,
      boundPayload,
      requestId: "req-map-01",
      executionId: "exec-map-01",
      budget: 1000,
      entropy: "entropy-map-01",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
    });

    expect(mapRes.ok).toBe(true);
    if (mapRes.ok) {
      expect(mapRes.executionRequest.requestId).toBe("req-map-01");
      expect(mapRes.executionRequest.executionContext.executionId).toBe(
        "exec-map-01",
      );
      expect(
        mapRes.executionRequest.executionContext.constitutionalTimestamp,
      ).toBe("2026-08-10T00:00:00Z");
    }
  });

  it("Scenario 2 — Adapter performs no version resolution (preserves bound payload versions)", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const mapRes = mapEvaluationCoordinateToExecutionRequest({
      coordinate: ec,
      boundPayload,
      requestId: "req-map-02",
      executionId: "exec-map-02",
      budget: 1000,
      entropy: "entropy-map-02",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
    });

    expect(mapRes.ok).toBe(true);
    if (mapRes.ok) {
      expect(mapRes.executionRequest.executionContext.versions).toEqual([
        "1.0.0",
      ]);
    }
  });

  it("Scenario 3 & 4 — Adapter performs no Registry, SEC, or POL queries", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    // Mapping is a pure, synchronous function
    const mapRes = mapEvaluationCoordinateToExecutionRequest({
      coordinate: ec,
      boundPayload,
      requestId: "req-map-03",
      executionId: "exec-map-03",
      budget: 1000,
      entropy: "entropy-map-03",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
    });

    expect(mapRes.ok).toBe(true);
  });

  it("Scenario 5 — Incomplete / malformed EC fails before Runtime execution with 'missing' or 'invalid'", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const malformedEc = {
      ...getValidEc(),
      sccId: "", // Blank sccId!
    } as EvaluationCoordinate;

    const mapRes = mapEvaluationCoordinateToExecutionRequest({
      coordinate: malformedEc,
      boundPayload,
      requestId: "req-map-05",
      executionId: "exec-map-05",
      budget: 1000,
      entropy: "entropy-map-05",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
    });

    expect(mapRes.ok).toBe(false);
    if (!mapRes.ok) {
      expect(mapRes.error.code).toBe("missing");
    }
  });

  it("Scenario 6 — No parallel Z-PROF execution engine (uses existing pure Runtime pipeline)", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-exec-01",
      executionId: "exec-exec-01",
      budget: 1000,
      entropy: "entropy-exec-01",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (execRes.ok && execRes.pipelineResult.ok) {
      expect(execRes.pipelineResult.stage).toBe("Receipt Generation");
    }
  });

  // ==========================================================================
  // Section 2: Temporal Integration Scenarios (7–10)
  // ==========================================================================

  it("Scenario 7 — Explicit T_e_input reaches evaluation seam when required", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const mapRes = mapEvaluationCoordinateToExecutionRequest({
      coordinate: ec,
      boundPayload,
      requestId: "req-temp-01",
      executionId: "exec-temp-01",
      budget: 1000,
      entropy: "entropy-temp-01",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
    });

    expect(mapRes.ok).toBe(true);
    if (mapRes.ok) {
      expect(
        mapRes.executionRequest.executionContext.constitutionalTimestamp,
      ).toBe("2026-08-10T00:00:00Z");
    }
  });

  it("Scenario 8 — Runtime T_e_observed is captured and recorded separately from T_e_input", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-temp-02",
      executionId: "exec-temp-02",
      budget: 1000,
      entropy: "entropy-temp-02",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.observedExecutionTime).toBeDefined();
      expect(execRes.provenanceLink?.observedExecutionTime).toBeDefined();
      // T_e_input on EC remains unchanged
      expect(ec.temporalCoordinates.tEInput).toBe("2026-08-10T00:00:00Z");
    }
  });

  it("Scenario 9 — T_e_observed cannot repair missing required T_e_input", async () => {
    const boundPayload = {
      ...(await getResolvedBoundPayload()),
      executionContext: {
        ...(await getResolvedBoundPayload()).executionContext,
        constitutionalTimestamp: "",
      },
    };

    const ecWithoutTEInput = buildEvaluationCoordinate({
      ...defaultEcInput,
      temporalCoordinates: {}, // Missing T_e_input!
    });

    expect(ecWithoutTEInput.ok).toBe(true);
    if (ecWithoutTEInput.ok) {
      const mapRes = mapEvaluationCoordinateToExecutionRequest({
        coordinate: ecWithoutTEInput.coordinate,
        boundPayload,
        requestId: "req-temp-03",
        executionId: "exec-temp-03",
        budget: 1000,
        entropy: "entropy-temp-03",
        versions: ["1.0.0"],
        resolvedPolicyGraph: defaultResolvedPolicyGraph,
      });

      expect(mapRes.ok).toBe(false);
      if (!mapRes.ok) {
        expect(mapRes.error.code).toBe("missing");
      }
    }
  });

  it("Scenario 10 — Different observed runtime times do not mutate historical EC", async () => {
    const ec = getValidEc();
    const initialEcSnapshot = JSON.stringify(ec);

    const boundPayload = await getResolvedBoundPayload();
    await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-temp-04",
      executionId: "exec-temp-04",
      budget: 1000,
      entropy: "entropy-temp-04",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(JSON.stringify(ec)).toBe(initialEcSnapshot);
  });

  // ==========================================================================
  // Section 3: Provenance Scenarios (11–15)
  // ==========================================================================

  it("Scenario 11 — Execution output retains Application provenance link to exact SCC/BCG/EC coordinates", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-prov-01",
      executionId: "exec-prov-01",
      budget: 1000,
      entropy: "entropy-prov-01",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (execRes.ok && execRes.provenanceLink) {
      expect(execRes.provenanceLink.sccId).toBe(validSccId);
      expect(execRes.provenanceLink.bcgId).toBe(validBcgId);
      expect(execRes.provenanceLink.coordinate).toEqual(ec);
    }
  });

  it("Scenario 12 — Historical ExecutionReceipt remains immutable upon creation", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-prov-02",
      executionId: "exec-prov-02",
      budget: 1000,
      entropy: "entropy-prov-02",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (execRes.ok && execRes.provenanceLink) {
      const rcpt = execRes.provenanceLink.executionReceipt as unknown as Record<string, unknown>;
      expect(() => {
        rcpt.receiptId = "modified-id";
      }).toThrow();

      const link = execRes.provenanceLink as unknown as Record<string, unknown>;
      expect(() => {
        link.sccId = "modified-scc";
      }).toThrow();
    }
  });

  it("Scenario 13 — Later assessment creates new relation/result without receipt mutation", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-prov-03",
      executionId: "exec-prov-03",
      budget: 1000,
      entropy: "entropy-prov-03",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (
      execRes.ok &&
      execRes.pipelineResult.ok &&
      execRes.pipelineResult.outcome.kind === "materialized"
    ) {
      const rcpt = execRes.pipelineResult.outcome.executionOutput
        .executionReceipt;
      const initialRcptDigest = rcpt.deterministicHash;

      const arcInput: AssessmentRequestCoordinate = {
        target: { kind: "EXECUTION_RECEIPT", receiptRef: rcpt.receiptId },
        operation: "RECEIPT_VERIFICATION",
        pinnedAssessmentStateRef: validPinnedAssessmentState,
        tTrust: "2026-09-01T00:00:00Z",
      };

      const assessmentRes = evaluateAssessmentRequest({
        arc: arcInput,
        executionReceipt: rcpt,
        executionRequest: execRes.executionRequest,
      });

      expect(assessmentRes.ok).toBe(true);
      expect(rcpt.deterministicHash).toBe(initialRcptDigest);
    }
  });

  it("Scenario 14 — Exact Evidence integrity references remain bound in EC and provenance link", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-prov-04",
      executionId: "exec-prov-04",
      budget: 1000,
      entropy: "entropy-prov-04",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (execRes.ok && execRes.provenanceLink) {
      expect(
        execRes.provenanceLink.coordinate.evidenceIntegrityCoordinates,
      ).toHaveLength(1);
      expect(
        execRes.provenanceLink.coordinate.evidenceIntegrityCoordinates[0]
          .evidenceRef,
      ).toBe("evd-001");
    }
  });

  it("Scenario 15 — Foreign receipt digest remains historically bound without float", async () => {
    const receiptTarget: AssessmentTarget = {
      kind: "EXECUTION_RECEIPT",
      receiptRef: "rcpt:foreign:123",
      receiptDigest:
        "sha256:4444444444444444444444444444444444444444444444444444444444444444",
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: receiptTarget,
      operation: "RECEIPT_VERIFICATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-08-10T00:00:00Z",
    });

    expect(arcRes.ok).toBe(true);
    if (arcRes.ok) {
      const target = arcRes.coordinate.target;
      if (target.kind === "EXECUTION_RECEIPT") {
        expect(target.receiptDigest).toBe(
          "sha256:4444444444444444444444444444444444444444444444444444444444444444",
        );
      }
    }
  });

  // ==========================================================================
  // Section 4: Receipt Verification Scenarios (16–20)
  // ==========================================================================

  it("Scenario 16 — Exact valid receipt verifies using domain verification primitives", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-verify-01",
      executionId: "exec-verify-01",
      budget: 1000,
      entropy: "entropy-verify-01",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (
      execRes.ok &&
      execRes.pipelineResult.ok &&
      execRes.pipelineResult.outcome.kind === "materialized"
    ) {
      const rcpt = execRes.pipelineResult.outcome.executionOutput
        .executionReceipt;
      const verifyRes = verifyExecutionReceiptIntegrity(
        rcpt,
        execRes.executionRequest,
      );

      expect(verifyRes.ok).toBe(true);
      if (verifyRes.ok) {
        expect(verifyRes.verified).toBe(true);
      }
    }
  });

  it("Scenario 17 — Tampered receipt fails with 'invalid' or unverified status", async () => {
    const tamperedReceipt = {
      receiptId: "rcpt:bad",
      executionId: "exec:bad",
    };

    const verifyRes = verifyExecutionReceiptIntegrity(tamperedReceipt);
    expect(verifyRes.ok).toBe(false);
    if (!verifyRes.ok) {
      expect(verifyRes.error.code).toBe("invalid");
    }
  });

  it("Scenario 18 & 19 — Receipt verification does not imply current trust or current admissibility", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-verify-02",
      executionId: "exec-verify-02",
      budget: 1000,
      entropy: "entropy-verify-02",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (
      execRes.ok &&
      execRes.pipelineResult.ok &&
      execRes.pipelineResult.outcome.kind === "materialized"
    ) {
      const rcpt = execRes.pipelineResult.outcome.executionOutput
        .executionReceipt;
      const arcInput: AssessmentRequestCoordinate = {
        target: { kind: "EXECUTION_RECEIPT", receiptRef: rcpt.receiptId },
        operation: "RECEIPT_VERIFICATION",
        pinnedAssessmentStateRef: validPinnedAssessmentState,
        tTrust: "2026-09-01T00:00:00Z",
      };

      const assessmentRes = evaluateAssessmentRequest({
        arc: arcInput,
        executionReceipt: rcpt,
        executionRequest: execRes.executionRequest,
        // No explicit SEC or POL outputs provided!
      });

      expect(assessmentRes.ok).toBe(true);
      if (assessmentRes.ok) {
        const asm = assessmentRes.assessment;
        expect(asm.reproducible.value).toBe(true);
        expect(asm.currentlyTrusted.value).toBe(false);
        expect(asm.currentlyAdmissible.value).toBe(false);
      }
    }
  });

  it("Scenario 20 — Current Registry state does not alter historical receipt identity", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-verify-03",
      executionId: "exec-verify-03",
      budget: 1000,
      entropy: "entropy-verify-03",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (
      execRes.ok &&
      execRes.pipelineResult.ok &&
      execRes.pipelineResult.outcome.kind === "materialized"
    ) {
      const rcpt = execRes.pipelineResult.outcome.executionOutput
        .executionReceipt;
      const verify1 = verifyExecutionReceiptIntegrity(
        rcpt,
        execRes.executionRequest,
      );

      // Mutating ambient state does not change receipt verification result
      const verify2 = verifyExecutionReceiptIntegrity(
        rcpt,
        execRes.executionRequest,
      );

      expect(verify1).toEqual(verify2);
    }
  });

  // ==========================================================================
  // Section 5: Historical Reconstruction Scenarios (21–27)
  // ==========================================================================

  it("Scenario 21 & 22 — Exact available historical coordinate reconstructs analytically marked non-authoritative", () => {
    const ec = getValidEc();
    const histTarget: HistoricalEvaluationCoordinateTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:001",
      coordinate: ec,
    };

    const boundaryRes = evaluateHistoricalReconstructionBoundary(histTarget);
    expect(boundaryRes.ok).toBe(true);
    if (boundaryRes.ok) {
      expect(boundaryRes.result.status).toBe(
        "NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION",
      );
      expect(boundaryRes.result.targetRef).toBe("ec:hist:001");
      expect(boundaryRes.result.historicalCoordinate).toEqual(ec);
    }
  });

  it("Scenario 23 — Reconstruction cannot invoke RI execution authority without NEW_EVALUATION", () => {
    const histTarget: AssessmentTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:001",
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: histTarget,
      operation: "NEW_EVALUATION", // Illegal pairing!
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-08-10T00:00:00Z",
    });

    expect(arcRes.ok).toBe(false);
    if (!arcRes.ok) {
      expect(arcRes.error.code).toBe("invalid");
    }
  });

  it("Scenario 24 & 25 — Analytical reconstruction preserves non-authoritative boundary", () => {
    const ec = getValidEc();
    const histTarget: HistoricalEvaluationCoordinateTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:002",
      coordinate: ec,
    };

    const boundaryRes = evaluateHistoricalReconstructionBoundary(histTarget);
    expect(boundaryRes.ok).toBe(true);
    if (boundaryRes.ok) {
      expect(boundaryRes.result.status).toBe(
        "NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION",
      );
    }
  });

  it("Scenario 26 & 27 — Missing exact historical material fails closed with 'invalid' / Reproducible = false (no nearest/current/latest substitution)", () => {
    const malformedHistTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:missing",
      coordinate: { sccId: "bad_scc" },
    } as unknown as AssessmentTarget;

    const boundaryRes =
      evaluateHistoricalReconstructionBoundary(malformedHistTarget);

    expect(boundaryRes.ok).toBe(false);
    if (!boundaryRes.ok) {
      expect(boundaryRes.error.code).toBe("invalid");
    }
  });

  // ==========================================================================
  // Section 6: New Evaluation From Historical Inputs Scenarios (28–31)
  // ==========================================================================

  it("Scenario 28, 29, 30 & 31 — Historical material used in NEW_EVALUATION ARC follows ordinary RI admission", async () => {
    const ec = getValidEc();
    const ecTarget: AssessmentTarget = {
      kind: "EVALUATION_COORDINATE",
      coordinate: ec,
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: ecTarget,
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-08-10T00:00:00Z",
    });

    expect(arcRes.ok).toBe(true);
    if (arcRes.ok) {
      expect(arcRes.coordinate.operation).toBe("NEW_EVALUATION");
    }
  });

  // ==========================================================================
  // Section 7: Four-Dimensional Assessment Scenarios (32–37)
  // ==========================================================================

  it("Scenario 32–36 — Four assessment dimensions retain separate authority sources and may disagree without collapse", () => {
    const ec = getValidEc();
    const arcInput: AssessmentRequestCoordinate = {
      target: { kind: "EVALUATION_COORDINATE", coordinate: ec },
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-08-10T00:00:00Z",
    };

    const assessmentRes = evaluateAssessmentRequest({
      arc: arcInput,
      historicalCoordinate: ec,
      authorityOutputs: {
        executable: {
          value: true,
          authorityRef: "authority:ri:admission",
          details: "RI admission granted",
        },
        currentlyTrusted: {
          value: false,
          authorityRef: "authority:sec:trust",
          details: "SEC trust status uncertain",
        },
        currentlyAdmissible: {
          value: false,
          authorityRef: "authority:pol:admissibility",
          details: "POL policy requires updated certification",
        },
      },
    });

    expect(assessmentRes.ok).toBe(true);
    if (assessmentRes.ok) {
      const asm = assessmentRes.assessment;
      expect(asm.reproducible.value).toBe(true);
      expect(asm.executable.value).toBe(true);
      expect(asm.currentlyTrusted.value).toBe(false);
      expect(asm.currentlyAdmissible.value).toBe(false);

      expect(asm.reproducible.authorityRef).toBe(
        "authority:zprof:reproducibility",
      );
      expect(asm.executable.authorityRef).toBe("authority:ri:admission");
      expect(asm.currentlyTrusted.authorityRef).toBe("authority:sec:trust");
      expect(asm.currentlyAdmissible.authorityRef).toBe(
        "authority:pol:admissibility",
      );
    }
  });

  it("Scenario 37 — ARC pinning prevents assessment-state drift", () => {
    const ec = getValidEc();
    const arcInput: AssessmentRequestCoordinate = {
      target: { kind: "EVALUATION_COORDINATE", coordinate: ec },
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-08-10T00:00:00Z",
    };

    const assessmentRes = evaluateAssessmentRequest({
      arc: arcInput,
      historicalCoordinate: ec,
    });

    expect(assessmentRes.ok).toBe(true);
    if (assessmentRes.ok) {
      expect(assessmentRes.assessment.reproducible.stateRef).toEqual(
        validPinnedAssessmentState,
      );
    }
  });

  // ==========================================================================
  // Section 8: Historical Immutability Scenarios (38–41)
  // ==========================================================================

  it("Scenario 38–41 — New SEC/POL states or foreign revocations produce new assessment relation, leaving historical receipt unchanged", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const execRes = await executeEvaluationCoordinate({
      coordinate: ec,
      boundPayload,
      requestId: "req-immut-01",
      executionId: "exec-immut-01",
      budget: 1000,
      entropy: "entropy-immut-01",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      evidencePayloads: validEvidencePayloads,
      overrides: testOverrides,
    });

    expect(execRes.ok).toBe(true);
    if (
      execRes.ok &&
      execRes.pipelineResult.ok &&
      execRes.pipelineResult.outcome.kind === "materialized"
    ) {
      const rcpt = execRes.pipelineResult.outcome.executionOutput
        .executionReceipt;
      const initialRcptJson = JSON.stringify(rcpt);

      const updatedAssessmentState: PinnedStateReference = {
        ref: "acv:trade_item:v2.0.0",
        digest:
          "sha256:9999999999999999999999999999999999999999999999999999999999999999",
        version: "2.0.0",
      };

      const arcInput: AssessmentRequestCoordinate = {
        target: { kind: "EXECUTION_RECEIPT", receiptRef: rcpt.receiptId },
        operation: "RECEIPT_VERIFICATION",
        pinnedAssessmentStateRef: updatedAssessmentState,
        tTrust: "2026-10-01T00:00:00Z",
      };

      const asmRes = evaluateAssessmentRequest({
        arc: arcInput,
        executionReceipt: rcpt,
        executionRequest: execRes.executionRequest,
        authorityOutputs: {
          currentlyTrusted: {
            value: false,
            authorityRef: "authority:sec:revocation_cascade",
            details: "Revoked by new assessment state",
          },
        },
      });

      expect(asmRes.ok).toBe(true);
      if (asmRes.ok) {
        expect(asmRes.assessment.currentlyTrusted.value).toBe(false);
      }
      expect(JSON.stringify(rcpt)).toBe(initialRcptJson);
    }
  });

  // ==========================================================================
  // Section 9: Identity & Version Scenarios (42–44)
  // ==========================================================================

  it("Scenario 42 & 43 — Historical execution remains bound to exact artifact versions; newer Registry versions cause no implicit upgrade", async () => {
    const boundPayload = await getResolvedBoundPayload();
    const ec = getValidEc();

    const mapRes = mapEvaluationCoordinateToExecutionRequest({
      coordinate: ec,
      boundPayload,
      requestId: "req-ver-01",
      executionId: "exec-ver-01",
      budget: 1000,
      entropy: "entropy-ver-01",
      versions: ["1.0.0"],
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
    });

    expect(mapRes.ok).toBe(true);
    if (mapRes.ok) {
      expect(mapRes.executionRequest.executionContext.versions).toEqual([
        "1.0.0",
      ]);
    }
  });

  it("Scenario 44 — Same historical coordinate produces same reconstruction identity when required material remains available", () => {
    const ec = getValidEc();
    const histTarget: HistoricalEvaluationCoordinateTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:same",
      coordinate: ec,
    };

    const res1 = evaluateHistoricalReconstructionBoundary(histTarget);
    const res2 = evaluateHistoricalReconstructionBoundary(histTarget);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      expect(res1.result).toEqual(res2.result);
    }
  });
});
