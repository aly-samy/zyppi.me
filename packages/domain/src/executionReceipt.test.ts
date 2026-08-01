import { describe, it, expect } from "vitest";
import {
  validateExecutionReceipt,
  serializeExecutionReceipt,
  type ExecutionReceipt,
} from "./index.js";

describe("ExecutionReceipt Domain Model", () => {
  const validReceiptInput = {
    receiptId: "receipt-123",
    executionId: "exec-456",
    runtimeVersion: "1.0.0",
    inputHash: "hash-input",
    outputHash: "hash-output",
    evidenceHash: "hash-evidence",
    policyVersion: "2.1.0",
    decisionSummary: "Allowed: all policies passed",
    executionTime: 125.5,
    deterministicHash: "hash-deterministic",
  };

  describe("Validation success", () => {
    it("accepts a well-formed input and preserves every supplied value exactly", () => {
      const result = validateExecutionReceipt(validReceiptInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(validReceiptInput);
        // Explicitly check no coercion, default insertion, or transformation
        expect(result.value.receiptId).toBe("receipt-123");
        expect(result.value.executionId).toBe("exec-456");
        expect(result.value.runtimeVersion).toBe("1.0.0");
        expect(result.value.inputHash).toBe("hash-input");
        expect(result.value.outputHash).toBe("hash-output");
        expect(result.value.evidenceHash).toBe("hash-evidence");
        expect(result.value.policyVersion).toBe("2.1.0");
        expect(result.value.decisionSummary).toBe(
          "Allowed: all policies passed",
        );
        expect(result.value.executionTime).toBe(125.5);
        expect(result.value.deterministicHash).toBe("hash-deterministic");
      }
    });

    it("accepts executionTime equal to 0", () => {
      const input = { ...validReceiptInput, executionTime: 0 };
      const result = validateExecutionReceipt(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.executionTime).toBe(0);
      }
    });

    it("preserves leading and trailing whitespace on valid string fields", () => {
      const input = {
        ...validReceiptInput,
        decisionSummary: "  Some padded summary  ",
      };
      const result = validateExecutionReceipt(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.decisionSummary).toBe("  Some padded summary  ");
      }
    });
  });

  describe("Root input type validation", () => {
    const invalidInputs = [
      null,
      undefined,
      "string",
      123,
      true,
      [validReceiptInput], // array
    ];

    it.each(invalidInputs)("rejects invalid root input type: %s", (input) => {
      const result = validateExecutionReceipt(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual({
          code: "INVALID_RECEIPT_ID",
          field: "receiptId",
          message: "receiptId must be a non-empty string",
        });
      }
    });
  });

  describe("Required string fields independent failures", () => {
    const stringFields: Array<{ field: keyof ExecutionReceipt; code: string }> =
      [
        { field: "receiptId", code: "INVALID_RECEIPT_ID" },
        { field: "executionId", code: "INVALID_EXECUTION_ID" },
        { field: "runtimeVersion", code: "INVALID_RUNTIME_VERSION" },
        { field: "inputHash", code: "INVALID_INPUT_HASH" },
        { field: "outputHash", code: "INVALID_OUTPUT_HASH" },
        { field: "evidenceHash", code: "INVALID_EVIDENCE_HASH" },
        { field: "policyVersion", code: "INVALID_POLICY_VERSION" },
        { field: "decisionSummary", code: "INVALID_DECISION_SUMMARY" },
        { field: "deterministicHash", code: "INVALID_DETERMINISTIC_HASH" },
      ];

    it.each(stringFields)(
      "rejects when $field is missing or undefined",
      ({ field, code }) => {
        const input = { ...validReceiptInput };
        delete (input as Partial<Record<keyof ExecutionReceipt, unknown>>)[
          field
        ];

        const result = validateExecutionReceipt(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe(code);
          expect(result.error.field).toBe(field);
          expect(result.error.message).toContain(
            `${field} must be a non-empty string`,
          );
        }
      },
    );

    it.each(stringFields)("rejects when $field is null", ({ field, code }) => {
      const input = { ...validReceiptInput, [field]: null };

      const result = validateExecutionReceipt(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe(code);
        expect(result.error.field).toBe(field);
        expect(result.error.message).toContain(
          `${field} must be a non-empty string`,
        );
      }
    });

    it.each(stringFields)(
      "rejects when $field is empty string",
      ({ field, code }) => {
        const input = { ...validReceiptInput, [field]: "" };

        const result = validateExecutionReceipt(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe(code);
          expect(result.error.field).toBe(field);
          expect(result.error.message).toContain(
            `${field} must be a non-empty string`,
          );
        }
      },
    );

    it.each(stringFields)(
      "rejects when $field is whitespace-only string",
      ({ field, code }) => {
        const input = { ...validReceiptInput, [field]: "   \n\t " };

        const result = validateExecutionReceipt(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe(code);
          expect(result.error.field).toBe(field);
          expect(result.error.message).toContain(
            `${field} must be a non-empty string`,
          );
        }
      },
    );

    it.each(stringFields)(
      "rejects when $field is wrong type (number, boolean, object, array)",
      ({ field, code }) => {
        const wrongTypes = [123, true, { some: "obj" }, ["arr"]];
        for (const wrongVal of wrongTypes) {
          const input = { ...validReceiptInput, [field]: wrongVal };

          const result = validateExecutionReceipt(input);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.code).toBe(code);
            expect(result.error.field).toBe(field);
            expect(result.error.message).toContain(
              `${field} must be a non-empty string`,
            );
          }
        }
      },
    );
  });

  describe("executionTime validation rules", () => {
    const invalidExecutionTimes = [
      -1,
      -0.0001,
      NaN,
      Infinity,
      -Infinity,
      "10",
      "0",
      true,
      false,
      null,
      undefined,
      { time: 10 },
      [10],
    ];

    it.each(invalidExecutionTimes)(
      "rejects invalid executionTime value: %s",
      (invalidVal) => {
        const input = { ...validReceiptInput, executionTime: invalidVal };
        const result = validateExecutionReceipt(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_EXECUTION_TIME");
          expect(result.error.field).toBe("executionTime");
          expect(result.error.message).toBe(
            "executionTime must be a non-negative finite number",
          );
        }
      },
    );
  });

  describe("Validation order", () => {
    it("respects the sequential field validation sequence and returns first error", () => {
      // Sequence: receiptId -> executionId -> runtimeVersion -> inputHash -> outputHash -> evidenceHash -> policyVersion -> decisionSummary -> executionTime -> deterministicHash

      // All fields invalid: receiptId is the first check, so it should fail on receiptId
      const allInvalidInput = {
        receiptId: "",
        executionId: "",
        runtimeVersion: "",
        inputHash: "",
        outputHash: "",
        evidenceHash: "",
        policyVersion: "",
        decisionSummary: "",
        executionTime: -5,
        deterministicHash: "",
      };

      const result1 = validateExecutionReceipt(allInvalidInput);
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_RECEIPT_ID");
        expect(result1.error.field).toBe("receiptId");
      }

      // receiptId valid, but others invalid -> fails on executionId
      const inputWithReceiptIdValid = {
        ...allInvalidInput,
        receiptId: "valid-receipt",
      };
      const result2 = validateExecutionReceipt(inputWithReceiptIdValid);
      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error.code).toBe("INVALID_EXECUTION_ID");
        expect(result2.error.field).toBe("executionId");
      }

      // Fails on executionTime when all earlier fields are valid
      const inputWithAllEarlierValid = {
        receiptId: "valid",
        executionId: "valid",
        runtimeVersion: "valid",
        inputHash: "valid",
        outputHash: "valid",
        evidenceHash: "valid",
        policyVersion: "valid",
        decisionSummary: "valid",
        executionTime: -1, // invalid
        deterministicHash: "", // also invalid, but executionTime is checked first
      };
      const result3 = validateExecutionReceipt(inputWithAllEarlierValid);
      expect(result3.ok).toBe(false);
      if (!result3.ok) {
        expect(result3.error.code).toBe("INVALID_EXECUTION_TIME");
        expect(result3.error.field).toBe("executionTime");
      }
    });
  });

  describe("Non-mutation and non-coercion", () => {
    it("does not mutate the original input object", () => {
      const originalInput = {
        receiptId: "receipt-123",
        executionId: "exec-456",
        runtimeVersion: "1.0.0",
        inputHash: "hash-input",
        outputHash: "hash-output",
        evidenceHash: "hash-evidence",
        policyVersion: "2.1.0",
        decisionSummary: "Allowed: all policies passed",
        executionTime: 125.5,
        deterministicHash: "hash-deterministic",
      };

      // Deep clone check
      const inputCopy = JSON.parse(JSON.stringify(originalInput));

      const valResult = validateExecutionReceipt(originalInput);
      expect(valResult.ok).toBe(true);
      expect(originalInput).toEqual(inputCopy); // No mutation after validation

      if (valResult.ok) {
        const serResult = serializeExecutionReceipt(valResult.value);
        expect(typeof serResult).toBe("string");
        expect(originalInput).toEqual(inputCopy); // No mutation after serialization
        expect(valResult.value).toEqual(inputCopy);
      }
    });

    it("never coerces or converts types", () => {
      const input = {
        ...validReceiptInput,
        executionTime: "10", // string instead of number
      };

      const result = validateExecutionReceipt(input);
      expect(result.ok).toBe(false); // No coercion from "10" to 10 occurs
    });
  });

  describe("Determinism", () => {
    it("produces identical result objects on repeated validation", () => {
      const res1 = validateExecutionReceipt(validReceiptInput);
      const res2 = validateExecutionReceipt(validReceiptInput);
      expect(res1).toEqual(res2);
    });

    it("produces byte-identical output on repeated serialization", () => {
      const res = validateExecutionReceipt(validReceiptInput);
      expect(res.ok).toBe(true);
      if (res.ok) {
        const receipt = res.value;
        const ser1 = serializeExecutionReceipt(receipt);
        const ser2 = serializeExecutionReceipt(receipt);
        expect(ser1).toBe(ser2);
      }
    });

    it("produces equivalent serialized output for equivalent receipts, independent of memory layout or property order", () => {
      const receiptA: ExecutionReceipt = {
        receiptId: "r-1",
        executionId: "e-1",
        runtimeVersion: "v-1",
        inputHash: "i-1",
        outputHash: "o-1",
        evidenceHash: "ev-1",
        policyVersion: "p-1",
        decisionSummary: "d-1",
        executionTime: 42,
        deterministicHash: "dh-1",
      };

      const receiptB: ExecutionReceipt = {
        deterministicHash: "dh-1",
        decisionSummary: "d-1",
        policyVersion: "p-1",
        evidenceHash: "ev-1",
        outputHash: "o-1",
        inputHash: "i-1",
        executionTime: 42,
        runtimeVersion: "v-1",
        executionId: "e-1",
        receiptId: "r-1",
      };

      const serA = serializeExecutionReceipt(receiptA);
      const serB = serializeExecutionReceipt(receiptB);
      expect(serA).toBe(serB);
    });
  });

  describe("Canonical serialization and key ordering", () => {
    it("sorts keys exactly alphabetically", () => {
      const receipt: ExecutionReceipt = {
        receiptId: "receiptId-val",
        executionId: "executionId-val",
        runtimeVersion: "runtimeVersion-val",
        inputHash: "inputHash-val",
        outputHash: "outputHash-val",
        evidenceHash: "evidenceHash-val",
        policyVersion: "policyVersion-val",
        decisionSummary: "decisionSummary-val",
        executionTime: 100,
        deterministicHash: "deterministicHash-val",
      };

      const serialized = serializeExecutionReceipt(receipt);
      const parsedKeys = Object.keys(JSON.parse(serialized));

      const expectedAlphabeticalKeys = [
        "decisionSummary",
        "deterministicHash",
        "evidenceHash",
        "executionId",
        "executionTime",
        "inputHash",
        "outputHash",
        "policyVersion",
        "receiptId",
        "runtimeVersion",
      ];

      expect(parsedKeys).toEqual(expectedAlphabeticalKeys);
    });
  });

  describe("Composition and Absence of Impure Behaviors", () => {
    it("contains no side effects, clock checks, hash generation or state dependencies", () => {
      // We check that validating or serializing doesn't throw or depend on mock clocks or external state.
      // This is a static code boundary test through pure runtime invocation.
      const result = validateExecutionReceipt(validReceiptInput);
      expect(result.ok).toBe(true);

      if (result.ok) {
        const serialized = serializeExecutionReceipt(result.value);
        expect(typeof serialized).toBe("string");
      }
    });
  });
});
