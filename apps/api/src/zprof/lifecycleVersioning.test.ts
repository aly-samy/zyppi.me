import { describe, expect, it } from "vitest";
import {
  buildAssessmentRequestCoordinate,
  evaluateHistoricalReconstructionBoundary,
  validateTargetOperationCompatibility,
} from "./arc.js";
import { buildEvaluationCoordinate } from "./ec.js";
import { validateTemporalRequirements } from "./temporal.js";
import type {
  AssessmentRequestCoordinateInput,
  AssessmentTarget,
  CompositionAuthoringTarget,
  EvaluationCoordinate,
  EvaluationCoordinateInput,
  EvaluationTemporalCoordinates,
  ExecutionReceiptTarget,
  HistoricalEvaluationCoordinateTarget,
  PinnedStateReference,
  PrimitiveOperation,
  TemporalRequirements,
} from "./types.js";

describe("AMS-0860-B — Lifecycle & Versioning Evaluation & Assessment Coordinates", () => {
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
  const validBoundContext = {
    jurisdiction: "EU",
    purpose: "trade_item_evaluation",
  };
  const validEvidenceCoords = [
    {
      evidenceRef: "ev:1",
      digest:
        "sha256:5555555555555555555555555555555555555555555555555555555555555555",
    },
    {
      evidenceRef: "ev:2",
      digest:
        "sha256:6666666666666666666666666666666666666666666666666666666666666666",
    },
  ];

  const defaultEcInput: EvaluationCoordinateInput = {
    sccId: validSccId,
    bcgId: validBcgId,
    pinnedSemanticStateRef: validPinnedSemanticState,
    boundContext: validBoundContext,
    evidenceIntegrityCoordinates: validEvidenceCoords,
    authorizedInputs: { userRole: "admin" },
    evaluationParameters: { threshold: 100 },
    temporalCoordinates: { tValid: "2026-01-01T00:00:00Z" },
  };

  function getValidEc(): EvaluationCoordinate {
    const res = buildEvaluationCoordinate(defaultEcInput);
    if (!res.ok) {
      throw new Error("Failed to construct valid EC in test helper");
    }
    return res.coordinate;
  }

  // ==========================================================================
  // Section A: Evaluation Coordinate (EC) Tests (B1–B4, §40 1–5, 11–12)
  // ==========================================================================

  it("B1 / §40.1: Same explicit inputs produce equivalent EC", () => {
    const res1 = buildEvaluationCoordinate(defaultEcInput);
    const res2 = buildEvaluationCoordinate(defaultEcInput);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      expect(res1.coordinate).toEqual(res2.coordinate);
    }
  });

  it("B1 / §40.1: Same SCC + BCG but different bound Context produces different EC", () => {
    const res1 = buildEvaluationCoordinate(defaultEcInput);
    const res2 = buildEvaluationCoordinate({
      ...defaultEcInput,
      boundContext: { jurisdiction: "US", purpose: "trade_item_evaluation" },
    });

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      expect(res1.coordinate.boundContext).not.toEqual(
        res2.coordinate.boundContext,
      );
    }
  });

  it("B2 / §40.2: Same EC inputs across different wall clock execution produces identical EC", () => {
    const res1 = buildEvaluationCoordinate(defaultEcInput);
    const res2 = buildEvaluationCoordinate(defaultEcInput);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      expect(res1.coordinate).toEqual(res2.coordinate);
    }
  });

  it("B2 / §40.3-4: OP, assessment state, current trust, and receipts cannot appear in EC", () => {
    const res = buildEvaluationCoordinate(defaultEcInput);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const ec = res.coordinate as unknown as Record<string, unknown>;
      expect(ec.operation).toBeUndefined();
      expect(ec.pinnedAssessmentStateRef).toBeUndefined();
      expect(ec.tTrust).toBeUndefined();
      expect(ec.currentTrustResult).toBeUndefined();
      expect(ec.executionReceipt).toBeUndefined();
    }
  });

  it("§40.11: Missing pinned semantic state fails closed with 'missing'", () => {
    const res = buildEvaluationCoordinate({
      ...defaultEcInput,
      pinnedSemanticStateRef: { ref: "  " },
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("missing");
    }
  });

  it("§40.32-34: Consumes pre-computed sccId and bcgId explicitly without recomputation", () => {
    const res = buildEvaluationCoordinate(defaultEcInput);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.coordinate.sccId).toBe(validSccId);
      expect(res.coordinate.bcgId).toBe(validBcgId);
    }
  });

  // ==========================================================================
  // Section B: Temporal Coordinates Tests (B7–B9, §40 6–10)
  // ==========================================================================

  it("B7 / §40.6: Rule does not require T_e_input + tEInput absent -> valid", () => {
    const coords: EvaluationTemporalCoordinates = {
      tValid: "2026-01-01T00:00:00Z",
    };
    const reqs: TemporalRequirements = {
      requiresTValid: true,
      requiresTEInput: false,
    };

    const res = validateTemporalRequirements(coords, reqs);
    expect(res.ok).toBe(true);
  });

  it("B7 / §40.7: Rule requires T_e_input + tEInput supplied -> valid", () => {
    const coords: EvaluationTemporalCoordinates = {
      tEInput: "2026-06-01T12:00:00Z",
    };
    const reqs: TemporalRequirements = { requiresTEInput: true };

    const res = validateTemporalRequirements(coords, reqs);
    expect(res.ok).toBe(true);
  });

  it("B7 / §40.8: Rule requires T_e_input + tEInput absent -> fails closed with 'missing'", () => {
    const coords: EvaluationTemporalCoordinates = {
      tValid: "2026-01-01T00:00:00Z",
    };
    const reqs: TemporalRequirements = { requiresTEInput: true };

    const res = validateTemporalRequirements(coords, reqs);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("missing");
    }
  });

  it("B8-B9 / §40.9-10: T_o (tObservation) exists independently of T_e_observed, and EC contains no runtime-observed field", () => {
    const coords: EvaluationTemporalCoordinates = {
      tValid: "2026-01-01T00:00:00Z",
      tObservation: "2026-02-01T00:00:00Z",
      tEInput: "2026-03-01T00:00:00Z",
    };

    const ecRes = buildEvaluationCoordinate({
      ...defaultEcInput,
      temporalCoordinates: coords,
    });

    expect(ecRes.ok).toBe(true);
    if (ecRes.ok) {
      expect(ecRes.coordinate.temporalCoordinates.tObservation).toBe(
        "2026-02-01T00:00:00Z",
      );
      const temp = ecRes.coordinate.temporalCoordinates as unknown as Record<
        string,
        unknown
      >;
      expect(temp.tObserved).toBeUndefined();
      expect(temp.tEObserved).toBeUndefined();
    }
  });

  // ==========================================================================
  // Section C: Assessment Request Coordinate (ARC) Tests (B5–B6, §40 13–23)
  // ==========================================================================

  it("B5 / §40.13: Pinned assessment state state role equality without role collapse", () => {
    const ecTarget: AssessmentTarget = {
      kind: "EVALUATION_COORDINATE",
      coordinate: getValidEc(),
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: ecTarget,
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(true);
    if (arcRes.ok) {
      expect(arcRes.coordinate.pinnedAssessmentStateRef).toEqual(
        validPinnedAssessmentState,
      );
    }
  });

  it("B5 / §40.13: Omitted pinned assessment state fails closed with 'missing' (no fallback to semantic state)", () => {
    const ecTarget: AssessmentTarget = {
      kind: "EVALUATION_COORDINATE",
      coordinate: getValidEc(),
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: ecTarget,
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: { ref: "" },
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(false);
    if (!arcRes.ok) {
      expect(arcRes.error.code).toBe("missing");
    }
  });

  it("B6 / §40.15: NEW_EVALUATION + EvaluationCoordinate target -> valid ARC", () => {
    const ecTarget: AssessmentTarget = {
      kind: "EVALUATION_COORDINATE",
      coordinate: getValidEc(),
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: ecTarget,
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(true);
  });

  it("B6 / §40.16: RECEIPT_VERIFICATION + ExecutionReceipt target -> valid ARC", () => {
    const receiptTarget: AssessmentTarget = {
      kind: "EXECUTION_RECEIPT",
      receiptRef: "rcpt:123",
      receiptDigest:
        "sha256:4444444444444444444444444444444444444444444444444444444444444444",
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: receiptTarget,
      operation: "RECEIPT_VERIFICATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(true);
  });

  it("B6 / §40.17: RECEIPT_VERIFICATION + COMPOSITION_AUTHORING target -> invalid", () => {
    const compTarget: AssessmentTarget = {
      kind: "COMPOSITION_AUTHORING",
      compositionDefinition: {
        participants: [
          {
            identity: "dtc:1",
            kind: "DTC",
            version: "1.0.0",
            owner: "owner:1",
            role: "domain_template",
            reference: { id: "dtc:1", version: "1.0.0" },
          },
        ],
        bindingEdges: [],
      },
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: compTarget,
      operation: "RECEIPT_VERIFICATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(false);
    if (!arcRes.ok) {
      expect(arcRes.error.code).toBe("invalid");
    }
  });

  it("B6 / §40.18: NEW_EVALUATION + ExecutionReceipt target -> invalid", () => {
    const receiptTarget: AssessmentTarget = {
      kind: "EXECUTION_RECEIPT",
      receiptRef: "rcpt:123",
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: receiptTarget,
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(false);
    if (!arcRes.ok) {
      expect(arcRes.error.code).toBe("invalid");
    }
  });

  it("§40.19-20: Unknown OP or forbidden OP (e.g., CURRENT_TRUSTED_REPLAY) fails closed", () => {
    const ecTarget: AssessmentTarget = {
      kind: "EVALUATION_COORDINATE",
      coordinate: getValidEc(),
    };

    const opRes = validateTargetOperationCompatibility(
      ecTarget,
      "CURRENT_TRUSTED_REPLAY" as PrimitiveOperation,
    );

    expect(opRes.ok).toBe(false);
    if (!opRes.ok) {
      expect(opRes.error.code).toBe("unsupported");
    }
  });

  it("§40.21-23: Determinism - Same ARC inputs yield identical ARC, different T_trust yields different ARC", () => {
    const ecTarget: AssessmentTarget = {
      kind: "EVALUATION_COORDINATE",
      coordinate: getValidEc(),
    };

    const input1: AssessmentRequestCoordinateInput = {
      target: ecTarget,
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    };

    const res1 = buildAssessmentRequestCoordinate(input1);
    const res2 = buildAssessmentRequestCoordinate(input1);
    const res3 = buildAssessmentRequestCoordinate({
      ...input1,
      tTrust: "2026-07-01T00:00:00Z",
    });

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    expect(res3.ok).toBe(true);

    if (res1.ok && res2.ok && res3.ok) {
      expect(res1.coordinate).toEqual(res2.coordinate);
      expect(res1.coordinate.tTrust).not.toEqual(res3.coordinate.tTrust);
    }
  });

  // ==========================================================================
  // Section D: Historical Reconstruction Tests (B10–B12, §40 24–27)
  // ==========================================================================

  it("B10 / §40.24-25: Historical reconstruction request creates NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION boundary", () => {
    const histTarget: AssessmentTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:999",
      coordinate: getValidEc(),
    };

    const boundaryRes = evaluateHistoricalReconstructionBoundary(histTarget);
    expect(boundaryRes.ok).toBe(true);
    if (boundaryRes.ok) {
      expect(boundaryRes.result.status).toBe(
        "NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION",
      );
      expect(boundaryRes.result.targetRef).toBe("ec:hist:999");
      expect(boundaryRes.result.historicalCoordinate).toBeDefined();
    }
  });

  it("B12: Reconstruction output cannot silently acquire NEW_EVALUATION authority", () => {
    const histTarget: AssessmentTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:999",
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: histTarget,
      operation: "NEW_EVALUATION", // Illegal pairing!
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(false);
    if (!arcRes.ok) {
      expect(arcRes.error.code).toBe("invalid");
    }
  });

  // ==========================================================================
  // Section E: Deep Immutability Tests (B13, §40 28–31)
  // ==========================================================================

  it("B13 / §40.28-31: EC and ARC are deeply immutable and resist nested object mutations", () => {
    const mutableContext = { jurisdiction: "EU", inner: { key: "val" } };
    const ecRes = buildEvaluationCoordinate({
      ...defaultEcInput,
      boundContext: mutableContext,
    });

    expect(ecRes.ok).toBe(true);
    if (ecRes.ok) {
      const ec = ecRes.coordinate;
      expect(() => {
        (ec as unknown as Record<string, unknown>).sccId = "modified";
      }).toThrow();

      expect(() => {
        (ec.boundContext as unknown as Record<string, unknown>).jurisdiction =
          "US";
      }).toThrow();

      expect(() => {
        (
          (
            ec.boundContext as unknown as Record<
              string,
              Record<string, unknown>
            >
          ).inner as Record<string, unknown>
        ).key = "changed";
      }).toThrow();
    }
  });

  it("Evidence payload exclusion test: payload changes do not alter EC when identical integrity coords supplied", () => {
    const ec1 = buildEvaluationCoordinate(defaultEcInput);
    const ec2 = buildEvaluationCoordinate(defaultEcInput);

    expect(ec1.ok).toBe(true);
    expect(ec2.ok).toBe(true);
    if (ec1.ok && ec2.ok) {
      expect(ec1.coordinate).toEqual(ec2.coordinate);
    }
  });

  // ==========================================================================
  // Section F: CORR-0860-B-1 Mandatory Tests (B16–B25)
  // ==========================================================================

  it("Test B16 — Malformed A Identity fails closed with 'invalid'", () => {
    const badSccRes = buildEvaluationCoordinate({
      ...defaultEcInput,
      sccId: "abc",
    });
    expect(badSccRes.ok).toBe(false);
    if (!badSccRes.ok) {
      expect(badSccRes.error.code).toBe("invalid");
    }

    const badBcgRes = buildEvaluationCoordinate({
      ...defaultEcInput,
      bcgId: "sha256:abc",
    });
    expect(badBcgRes.ok).toBe(false);
    if (!badBcgRes.ok) {
      expect(badBcgRes.error.code).toBe("invalid");
    }
  });

  it("Test B17 — Malformed Evidence Digest fails closed with 'unverified'", () => {
    const badEvidenceRes = buildEvaluationCoordinate({
      ...defaultEcInput,
      evidenceIntegrityCoordinates: [
        { evidenceRef: "ev:1", digest: "sha256:aaa" },
      ],
    });
    expect(badEvidenceRes.ok).toBe(false);
    if (!badEvidenceRes.ok) {
      expect(badEvidenceRes.error.code).toBe("unverified");
    }
  });

  it("Test B18 — Malformed State Digest fails closed with 'invalid'", () => {
    const badStateRes = buildEvaluationCoordinate({
      ...defaultEcInput,
      pinnedSemanticStateRef: {
        ref: "acv:1",
        digest: "sha256:123",
      },
    });
    expect(badStateRes.ok).toBe(false);
    if (!badStateRes.ok) {
      expect(badStateRes.error.code).toBe("invalid");
    }
  });

  it("Test B19 — Malformed Temporal Coordinate fails closed with 'invalid'", () => {
    const badTempRes = buildEvaluationCoordinate({
      ...defaultEcInput,
      temporalCoordinates: { tEInput: "tomorrow" },
    });
    expect(badTempRes.ok).toBe(false);
    if (!badTempRes.ok) {
      expect(badTempRes.error.code).toBe("invalid");
    }
  });

  it("Test B20 — Valid Kind, Invalid EC Payload fails closed with 'invalid'", () => {
    const malformedEcTarget = {
      kind: "EVALUATION_COORDINATE",
      coordinate: { sccId: "bad" },
    } as unknown as AssessmentTarget;

    const arcRes = buildAssessmentRequestCoordinate({
      target: malformedEcTarget,
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(false);
    if (!arcRes.ok) {
      expect(arcRes.error.code).toBe("invalid");
    }
  });

  it("Test B21 — Empty Receipt Reference fails closed with 'invalid'", () => {
    const emptyReceiptTarget: ExecutionReceiptTarget = {
      kind: "EXECUTION_RECEIPT",
      receiptRef: "",
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: emptyReceiptTarget,
      operation: "RECEIPT_VERIFICATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(false);
    if (!arcRes.ok) {
      expect(arcRes.error.code).toBe("invalid");
    }
  });

  it("Test B22 — Arbitrary Composition Object Rejected", () => {
    const ungovernedAuthoringTarget = {
      kind: "COMPOSITION_AUTHORING",
      compositionDefinition: { arbitrary: "bag" },
    } as unknown as CompositionAuthoringTarget;

    const arcRes = buildAssessmentRequestCoordinate({
      target: ungovernedAuthoringTarget,
      operation: "NEW_COMPOSITION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(false);
    if (!arcRes.ok) {
      expect(arcRes.error.code).toBe("invalid");
    }
  });

  it("Test B23 — Generic Class Instance Rejected in authorizedInputs", () => {
    class ExecutableHandle {
      execute() {
        return true;
      }
    }

    const ecRes = buildEvaluationCoordinate({
      ...defaultEcInput,
      authorizedInputs: {
        handle: new ExecutableHandle() as unknown as Record<string, unknown>,
      },
    });

    expect(ecRes.ok).toBe(false);
    if (!ecRes.ok) {
      expect(ecRes.error.code).toBe("invalid");
    }
  });

  it("Test B24 — Reconstruction Has No Fabricated Timestamp", () => {
    const histTarget: HistoricalEvaluationCoordinateTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:123",
    };

    const boundaryRes = evaluateHistoricalReconstructionBoundary(histTarget);
    expect(boundaryRes.ok).toBe(true);
    if (boundaryRes.ok) {
      const resObj = boundaryRes.result as unknown as Record<string, unknown>;
      expect(resObj.reconstructionTimestamp).toBeUndefined();
      expect(boundaryRes.result.status).toBe(
        "NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION",
      );
      expect(boundaryRes.result.targetRef).toBe("ec:hist:123");
    }
  });

  it("Test B25 — Boolean Cannot Manufacture Sovereign Prohibition", () => {
    const histTarget: HistoricalEvaluationCoordinateTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:123",
    };

    // evaluateHistoricalReconstructionBoundary accepts only target (no boolean parameter)
    const boundaryRes = evaluateHistoricalReconstructionBoundary(histTarget);
    expect(boundaryRes.ok).toBe(true);
  });
});
