import { describe, it, expect } from "vitest";
import {
  compileQr,
  QrEcc,
  QrSymbol,
  ZqeError,
  ZqeProfileId,
} from "../src/index.js";

describe("AMS-ZQE-P2-M01 — General QR Type Foundation Proofs", () => {
  describe("Compile-time type representability proofs", () => {
    it("satisfies QrSymbol for Version 1 + ECC L", () => {
      const symbolV1L = {
        model: "QR_MODEL_2",
        version: 1,
        size: 21,
        errorCorrection: "L",
        mask: 0,
        getModule: () => false,
      } satisfies QrSymbol;

      expect(symbolV1L.model).toBe("QR_MODEL_2");
      expect(symbolV1L.version).toBe(1);
      expect(symbolV1L.size).toBe(21);
      expect(symbolV1L.errorCorrection).toBe("L");
    });

    it("satisfies QrSymbol for Version 7 + ECC Q", () => {
      const symbolV7Q = {
        model: "QR_MODEL_2",
        version: 7,
        size: 45,
        errorCorrection: "Q",
        mask: 3,
        getModule: () => true,
      } satisfies QrSymbol;

      expect(symbolV7Q.model).toBe("QR_MODEL_2");
      expect(symbolV7Q.version).toBe(7);
      expect(symbolV7Q.size).toBe(45);
      expect(symbolV7Q.errorCorrection).toBe("Q");
    });

    it("satisfies QrSymbol for Version 40 + ECC H", () => {
      const symbolV40H = {
        model: "QR_MODEL_2",
        version: 40,
        size: 177,
        errorCorrection: "H",
        mask: 7,
        getModule: () => false,
      } satisfies QrSymbol;

      expect(symbolV40H.model).toBe("QR_MODEL_2");
      expect(symbolV40H.version).toBe(40);
      expect(symbolV40H.size).toBe(177);
      expect(symbolV40H.errorCorrection).toBe("H");
    });
  });

  describe("Runtime compiler invariants & non-expansion", () => {
    it("M01-T01: compiler remains profile-locked to zqe/fqr1", () => {
      const payload = new Uint8Array([0x41]);
      // Attempting unsupported profile via cast must fail closed
      expect(() =>
        compileQr(payload, "zqe/fqr2" as unknown as ZqeProfileId),
      ).toThrowError(ZqeError);

      try {
        compileQr(payload, "unsupported_profile" as unknown as ZqeProfileId);
      } catch (err) {
        expect(err).toBeInstanceOf(ZqeError);
        const zqeErr = err as ZqeError;
        expect(zqeErr.code).toBe("QR_PROFILE_UNSUPPORTED");
        expect(zqeErr.stage).toBe("input_validation");
      }
    });

    it("M01-T02: compiled QrSymbol metadata remains strictly fixed to V3/M", () => {
      const payload = new Uint8Array([0x01, 0x02, 0x03]);
      const symbol = compileQr(payload, "zqe/fqr1");

      expect(symbol.model).toBe("QR_MODEL_2");
      expect(symbol.version).toBe(3);
      expect(symbol.size).toBe(29);
      expect(symbol.errorCorrection).toBe("M");
      expect(symbol.mask).toBeGreaterThanOrEqual(0);
      expect(symbol.mask).toBeLessThanOrEqual(7);
    });

    it("M01-T04: capacity remains strictly unchanged at 42 bytes", () => {
      const valid42 = new Uint8Array(42).fill(0xaa);
      const invalid43 = new Uint8Array(43).fill(0xaa);

      expect(() => compileQr(valid42, "zqe/fqr1")).not.toThrow();

      expect(() => compileQr(invalid43, "zqe/fqr1")).toThrowError(ZqeError);
      try {
        compileQr(invalid43, "zqe/fqr1");
      } catch (err) {
        expect(err).toBeInstanceOf(ZqeError);
        const zqeErr = err as ZqeError;
        expect(zqeErr.code).toBe("QR_CAPACITY_EXCEEDED");
      }
    });

    it("verifies QrEcc type coverage", () => {
      const eccs: QrEcc[] = ["L", "M", "Q", "H"];
      expect(eccs).toEqual(["L", "M", "Q", "H"]);
    });
  });
});
