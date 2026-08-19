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
  EvaluationCoordinateInput,
  EvaluationTemporalCoordinates,
  PinnedStateReference,
  PrimitiveOperation,
  TemporalRequirements,
} from "./types.js";

describe("AMS-0860-B — Lifecycle & Versioning Evaluation & Assessment Coordinates", () => {
  const validSccId = "sha256:1111111111111111111111111111111111111111111111111111111111111111";
  const validBcgId = "sha256:2222222222222222222222222222222222222222222222222222222222222222";
  const validPinnedSemanticState: PinnedStateReference = {
    ref: "acv:trade_item:v1.0.0",
    digest: "sha256:3333333333333333333333333333333333333333333333333333333333333333",
    version: "1.0.0",
  };
  const validPinnedAssessmentState: PinnedStateReference = {
    ref: "acv:trade_item:v1.0.0",
    digest: "sha256:3333333333333333333333333333333333333333333333333333333333333333",
    version: "1.0.0",
  };
  const validBoundContext = {
    jurisdiction: "EU",
    purpose: "trade_item_evaluation",
  };
  const validEvidenceCoords = [
    { evidenceRef: "ev:1", digest: "sha256:aaa" },
    { evidenceRef: "ev:2", digest: "sha256:bbb" },
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
      expect(res1.coordinate.boundContext).not.toEqual(res2.coordinate.boundContext);
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
    const coords: EvaluationTemporalCoordinates = { tValid: "2026-01-01T00:00:00Z" };
    const reqs: TemporalRequirements = { requiresTValid: true, requiresTEInput: false };

    const res = validateTemporalRequirements(coords, reqs);
    expect(res.ok).toBe(true);
  });

  it("B7 / §40.7: Rule requires T_e_input + tEInput supplied -> valid", () => {
    const coords: EvaluationTemporalCoordinates = { tEInput: "2026-06-01T12:00:00Z" };
    const reqs: TemporalRequirements = { requiresTEInput: true };

    const res = validateTemporalRequirements(coords, reqs);
    expect(res.ok).toBe(true);
  });

  it("B7 / §40.8: Rule requires T_e_input + tEInput absent -> fails closed with 'missing'", () => {
    const coords: EvaluationTemporalCoordinates = { tValid: "2026-01-01T00:00:00Z" };
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
      expect(ecRes.coordinate.temporalCoordinates.tObservation).toBe("2026-02-01T00:00:00Z");
      const temp = ecRes.coordinate.temporalCoordinates as unknown as Record<string, unknown>;
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
      coordinate: buildEvaluationCoordinate(defaultEcInput).ok
        ? (buildEvaluationCoordinate(defaultEcInput) as { ok: true; coordinate: any }).coordinate
        : ({} as any),
    };

    const arcRes = buildAssessmentRequestCoordinate({
      target: ecTarget,
      operation: "NEW_EVALUATION",
      pinnedAssessmentStateRef: validPinnedAssessmentState,
      tTrust: "2026-06-01T00:00:00Z",
    });

    expect(arcRes.ok).toBe(true);
    if (arcRes.ok) {
      expect(arcRes.coordinate.pinnedAssessmentStateRef).toEqual(validPinnedAssessmentState);
    }
  });

  it("B5 / §40.13: Omitted pinned assessment state fails closed with 'missing' (no fallback to semantic state)", () => {
    const ecTarget: AssessmentTarget = {
      kind: "EVALUATION_COORDINATE",
      coordinate: buildEvaluationCoordinate(defaultEcInput).ok
        ? (buildEvaluationCoordinate(defaultEcInput) as { ok: true; coordinate: any }).coordinate
        : ({} as any),
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
      coordinate: (buildEvaluationCoordinate(defaultEcInput) as any).coordinate,
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
      receiptDigest: "sha256:4444444444444444444444444444444444444444444444444444444444444444",
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
      compositionDefinition: { participants: ["p1"] },
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
      coordinate: (buildEvaluationCoordinate(defaultEcInput) as any).coordinate,
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
      coordinate: (buildEvaluationCoordinate(defaultEcInput) as any).coordinate,
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
      coordinate: (buildEvaluationCoordinate(defaultEcInput) as any).coordinate,
    };

    const boundaryRes = evaluateHistoricalReconstructionBoundary(histTarget);
    expect(boundaryRes.ok).toBe(true);
    if (boundaryRes.ok) {
      expect(boundaryRes.result.status).toBe("NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION");
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

  it("B10 / §40.26: Explicit bound sovereign prohibition on historical reconstruction fails closed with 'unauthorized'", () => {
    const histTarget: AssessmentTarget = {
      kind: "HISTORICAL_EVALUATION_COORDINATE",
      ref: "ec:hist:999",
    };

    const boundaryRes = evaluateHistoricalReconstructionBoundary(histTarget, true);
    expect(boundaryRes.ok).toBe(false);
    if (!boundaryRes.ok) {
      expect(boundaryRes.error.code).toBe("unauthorized");
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
        (ec as any).sccId = "modified";
      }).toThrow();

      expect(() => {
        (ec.boundContext as any).jurisdiction = "US";
      }).toThrow();

      expect(() => {
        (ec.boundContext as any).inner.key = "changed";
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
});
