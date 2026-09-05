import { describe, expect, it } from "vitest";
import {
  deriveExecutionOutputHashV2,
  deriveReceiptDeterministicHashV2,
  deriveReceiptEvidenceHashV2,
  deriveReceiptIdV2,
  type ReceiptDeterministicHashPreimageV2,
  V2_RECEIPT_DOMAIN_SEPARATORS,
} from "./receiptCrypto.js";

describe("Receipt V2 Cryptographic Capabilities", () => {
  it("uses exact governed domain separators", () => {
    expect(V2_RECEIPT_DOMAIN_SEPARATORS).toEqual({
      OUTPUT: "zyppi:domain:output:v2:",
      EVIDENCE: "zyppi:domain:evidence:v2:",
      RECEIPT_ID: "zyppi:domain:receipt_id:v2:",
      RECEIPT: "zyppi:domain:receipt:v2:",
    });
  });

  it("derives outputHash with exact format and determinism", () => {
    const output = {
      executability: { status: "DETERMINED", value: true },
      outcome: { status: "PRODUCED", outcome: "verified" },
    };
    const res1 = deriveExecutionOutputHashV2(output);
    const res2 = deriveExecutionOutputHashV2(output);
    expect(res1.ok).toBe(true);
    if (!res1.ok || !res2.ok) return;

    expect(res1.value).toBe(res2.value);
    expect(res1.value).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("derives evidenceHash with exact format and determinism", () => {
    const proj = {
      evidenceRecords: [
        {
          evidenceId: "EVD-1",
          evidenceKind: "DOC",
          hashAlgorithm: "SHA-256",
          expectedHash:
            "sha256:1111111111111111111111111111111111111111111111111111111111111111",
        },
      ],
      evidencePayloads: [],
    };
    const res = deriveReceiptEvidenceHashV2(proj);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("derives receiptId with 8-field preimage and exact format", () => {
    const preimage = {
      executionId: "EXEC-001",
      runtimeVersion: "2.0.0",
      inputHash:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      outputHash:
        "sha256:1111111111111111111111111111111111111111111111111111111111111111",
      evidenceHash:
        "sha256:2222222222222222222222222222222222222222222222222222222222222222",
      policyVersion:
        "sha256:3333333333333333333333333333333333333333333333333333333333333333",
      decisionSummary: '{"status":"NOT_PRODUCED"}',
      executionTime: "2026-09-05T10:00:00Z",
    };

    const res = deriveReceiptIdV2(preimage);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("derives deterministicHash with 9-field preimage and exact format", () => {
    const preimage = {
      receiptId:
        "sha256:4444444444444444444444444444444444444444444444444444444444444444",
      executionId: "EXEC-001",
      runtimeVersion: "2.0.0",
      inputHash:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      outputHash:
        "sha256:1111111111111111111111111111111111111111111111111111111111111111",
      evidenceHash:
        "sha256:2222222222222222222222222222222222222222222222222222222222222222",
      policyVersion:
        "sha256:3333333333333333333333333333333333333333333333333333333333333333",
      decisionSummary: '{"status":"NOT_PRODUCED"}',
      executionTime: "2026-09-05T10:00:00Z",
    };

    const res = deriveReceiptDeterministicHashV2(preimage);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("B2 — Parameterized 9-field sensitivity test for deriveReceiptDeterministicHashV2", () => {
    const basePreimage: ReceiptDeterministicHashPreimageV2 = {
      receiptId:
        "sha256:4444444444444444444444444444444444444444444444444444444444444444",
      executionId: "EXEC-001",
      runtimeVersion: "2.0.0",
      inputHash:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      outputHash:
        "sha256:1111111111111111111111111111111111111111111111111111111111111111",
      evidenceHash:
        "sha256:2222222222222222222222222222222222222222222222222222222222222222",
      policyVersion:
        "sha256:3333333333333333333333333333333333333333333333333333333333333333",
      decisionSummary: '{"status":"NOT_PRODUCED"}',
      executionTime: "2026-09-05T10:00:00Z",
    };

    const baseRes = deriveReceiptDeterministicHashV2(basePreimage);
    expect(baseRes.ok).toBe(true);
    if (!baseRes.ok) return;
    const baseHash = baseRes.value;

    const testCases: {
      field: keyof ReceiptDeterministicHashPreimageV2;
      mutatedValue: string;
    }[] = [
      {
        field: "receiptId",
        mutatedValue:
          "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      },
      { field: "executionId", mutatedValue: "EXEC-002" },
      { field: "runtimeVersion", mutatedValue: "2.0.1" },
      {
        field: "inputHash",
        mutatedValue:
          "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      },
      {
        field: "outputHash",
        mutatedValue:
          "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      },
      {
        field: "evidenceHash",
        mutatedValue:
          "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      },
      {
        field: "policyVersion",
        mutatedValue:
          "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      },
      {
        field: "decisionSummary",
        mutatedValue: '{"aggregateResult":"ALLOW","status":"PRODUCED"}',
      },
      { field: "executionTime", mutatedValue: "2026-09-05T11:00:00Z" },
    ];

    expect(testCases).toHaveLength(9);

    for (const tc of testCases) {
      const mutatedPreimage = {
        ...basePreimage,
        [tc.field]: tc.mutatedValue,
      };
      const mutatedRes = deriveReceiptDeterministicHashV2(mutatedPreimage);
      expect(mutatedRes.ok).toBe(true);
      if (mutatedRes.ok) {
        expect(mutatedRes.value).not.toBe(baseHash);
      }
    }
  });
});
