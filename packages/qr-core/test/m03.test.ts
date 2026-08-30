import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { compileQr, QrSymbol, ZqeError } from "../src/index.js";
import { strictVerifyQrSymbol } from "./m03/strict-verifier.js";

function getMatrixDigest(symbol: QrSymbol): string {
  const size = symbol.size; // 29
  const totalBits = size * size; // 841
  const numBytes = Math.ceil(totalBits / 8); // 106 bytes
  const bytes = new Uint8Array(numBytes);

  let bitIndex = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dark = symbol.getModule(x, y);
      if (dark) {
        bytes[bitIndex >>> 3] |= 1 << (7 - (bitIndex & 7));
      }
      bitIndex++;
    }
  }

  return createHash("sha256").update(bytes).digest("hex");
}

describe("ZQE-M03 QrSymbol Compiler & Verification Suite", () => {
  const FIXTURES = {
    A: {
      payload: new TextEncoder().encode("HELLO ZYPPI"),
      mask: 3,
      scores: [1468, 1491, 1557, 1368, 1414, 1644, 1610, 1412],
      formatHex: "5b4b",
      formatBits: "101101101001011",
      digest:
        "a57a4f64b7a54395dcd91fa635a49c837686aeea311e7bbd0d965ee33f55a431",
      expectedCodewordHex:
        "40b48454c4c4f205a595050490ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec1ca700e8aee8305065ee9c9dd2f4952b652982ccb33d74781e9a",
    },
    B: {
      payload: new TextEncoder().encode("https://id.gs1.org/01/09520123456788"),
      mask: 5,
      scores: [1748, 1623, 1547, 1563, 1574, 1415, 1498, 1610],
      formatHex: "40ce",
      formatBits: "100000011001110",
      digest:
        "67235cff7f198a7117f689441f682f613518b3b1908f4a9b34cc6ed3362275db",
      expectedCodewordHex:
        "42468747470733a2f2f69642e6773312e6f72672f30312f30393532303132333435363738380ec11ec11ec11adf4b7f417d1f943140a3b018a5d1e9baaa2027908845f65bc56",
    },
    C: {
      payload: new TextEncoder().encode(
        "ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001",
      ),
      mask: 6,
      scores: [1663, 1524, 1638, 1559, 1535, 1647, 1480, 1523],
      formatHex: "4f97",
      formatBits: "100111110010111",
      digest:
        "896719a7f024b513b0d90a2b8b67abd817a7fe94762dfe6574b108ad0f23e3de",
      expectedCodewordHex:
        "42a5a595050492d465152312d43415041434954592d424f554e444152592d303030303030303030303030310201d4d882c757d770d283dc557bca11f88f7faf686b2af797515",
    },
    D: {
      payload: new TextEncoder().encode(
        "ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001X",
      ),
    },
    E: {
      payload: new TextEncoder().encode("ZYPPI-FQR1-INTERIOR-TEST-2026"),
      mask: 1,
      scores: [1673, 1259, 1731, 1571, 1405, 1425, 1559, 1535],
      formatHex: "5125",
      formatBits: "101000100100101",
      digest:
        "75d608fe6e20c56e7fb80744ebbe3aa07e4dc151470cc119f11ef68aec04e837",
      expectedCodewordHex:
        "41d5a595050492d465152312d494e544552494f522d544553542d323032360ec11ec11ec11ec11ec11ec11ec6d568cf5352971bb72b8b6c1573082bb3f1fd31e90a0bd4f884e",
    },
  };

  describe("23.1 Frozen Fixtures & Verifier Proofs", () => {
    it("matches exact mask, scores, digest, and strict verifier for Fixture A", () => {
      const sym = compileQr(FIXTURES.A.payload, "zqe/fqr1");

      expect(sym.model).toBe("QR_MODEL_2");
      expect(sym.version).toBe(3);
      expect(sym.size).toBe(29);
      expect(sym.errorCorrection).toBe("M");
      expect(sym.mask).toBe(FIXTURES.A.mask);

      expect(getMatrixDigest(sym)).toBe(FIXTURES.A.digest);

      const verification = strictVerifyQrSymbol(sym);
      expect(verification.pass).toBe(true);
      expect(verification.errors).toEqual([]);
      expect(verification.penaltyScores).toEqual(FIXTURES.A.scores);
      expect(verification.decodedMask).toBe(FIXTURES.A.mask);

      const recoveredHex = Array.from(verification.recoveredCodewords)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      expect(recoveredHex).toBe(FIXTURES.A.expectedCodewordHex);
    });

    it("matches exact mask, scores, digest, and strict verifier for Fixture B", () => {
      const sym = compileQr(FIXTURES.B.payload, "zqe/fqr1");

      expect(sym.mask).toBe(FIXTURES.B.mask);
      expect(getMatrixDigest(sym)).toBe(FIXTURES.B.digest);

      const verification = strictVerifyQrSymbol(sym);
      expect(verification.pass).toBe(true);
      expect(verification.errors).toEqual([]);
      expect(verification.penaltyScores).toEqual(FIXTURES.B.scores);
      expect(verification.decodedMask).toBe(FIXTURES.B.mask);

      const recoveredHex = Array.from(verification.recoveredCodewords)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      expect(recoveredHex).toBe(FIXTURES.B.expectedCodewordHex);
    });

    it("matches exact mask, scores, digest, and strict verifier for Fixture C", () => {
      const sym = compileQr(FIXTURES.C.payload, "zqe/fqr1");

      expect(sym.mask).toBe(FIXTURES.C.mask);
      expect(getMatrixDigest(sym)).toBe(FIXTURES.C.digest);

      const verification = strictVerifyQrSymbol(sym);
      expect(verification.pass).toBe(true);
      expect(verification.errors).toEqual([]);
      expect(verification.penaltyScores).toEqual(FIXTURES.C.scores);
      expect(verification.decodedMask).toBe(FIXTURES.C.mask);

      const recoveredHex = Array.from(verification.recoveredCodewords)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      expect(recoveredHex).toBe(FIXTURES.C.expectedCodewordHex);
    });

    it("rejects Fixture D with QR_CAPACITY_EXCEEDED", () => {
      try {
        compileQr(FIXTURES.D.payload, "zqe/fqr1");
        expect.unreachable("Should have thrown QR_CAPACITY_EXCEEDED");
      } catch (err) {
        expect(err).toBeInstanceOf(ZqeError);
        const zqeErr = err as ZqeError;
        expect(zqeErr.code).toBe("QR_CAPACITY_EXCEEDED");
        expect(zqeErr.stage).toBe("input_validation");
      }
    });

    it("matches exact mask, scores, digest, and strict verifier for Fixture E", () => {
      const sym = compileQr(FIXTURES.E.payload, "zqe/fqr1");

      expect(sym.mask).toBe(FIXTURES.E.mask);
      expect(getMatrixDigest(sym)).toBe(FIXTURES.E.digest);

      const verification = strictVerifyQrSymbol(sym);
      expect(verification.pass).toBe(true);
      expect(verification.errors).toEqual([]);
      expect(verification.penaltyScores).toEqual(FIXTURES.E.scores);
      expect(verification.decodedMask).toBe(FIXTURES.E.mask);

      const recoveredHex = Array.from(verification.recoveredCodewords)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      expect(recoveredHex).toBe(FIXTURES.E.expectedCodewordHex);
    });
  });

  describe("23.2 Structural Geometry & Bounds", () => {
    it("returns size 29 and false for out-of-bounds coordinates", () => {
      const sym = compileQr(FIXTURES.A.payload, "zqe/fqr1");
      expect(sym.size).toBe(29);

      expect(sym.getModule(-1, 0)).toBe(false);
      expect(sym.getModule(0, -1)).toBe(false);
      expect(sym.getModule(29, 0)).toBe(false);
      expect(sym.getModule(0, 29)).toBe(false);
      expect(sym.getModule(100, 100)).toBe(false);
    });

    it("verifies permanent dark module at (8, 21) is dark", () => {
      const sym = compileQr(FIXTURES.A.payload, "zqe/fqr1");
      expect(sym.getModule(8, 21)).toBe(true);
    });
  });

  describe("23.3 Immutability", () => {
    it("proves mutating caller input array after compilation does not alter QrSymbol module state", () => {
      const callerInput = new Uint8Array([72, 69, 76, 76, 79]); // "HELLO"
      const sym = compileQr(callerInput, "zqe/fqr1");

      const digestBefore = getMatrixDigest(sym);
      callerInput.fill(0xff);
      const digestAfter = getMatrixDigest(sym);

      expect(digestBefore).toBe(digestAfter);
    });
  });

  describe("23.4 Runtime Errors & Input Validation", () => {
    it("throws QR_INVALID_INPUT on non-Uint8Array data input", () => {
      try {
        // @ts-expect-error Testing runtime invalid input
        compileQr("HELLO ZYPPI", "zqe/fqr1");
        expect.unreachable("Should have thrown QR_INVALID_INPUT");
      } catch (err) {
        expect(err).toBeInstanceOf(ZqeError);
        const zqeErr = err as ZqeError;
        expect(zqeErr.code).toBe("QR_INVALID_INPUT");
        expect(zqeErr.stage).toBe("input_validation");
      }
    });

    it("throws QR_PROFILE_UNSUPPORTED on unsupported profile string", () => {
      try {
        // @ts-expect-error Testing runtime unsupported profile
        compileQr(FIXTURES.A.payload, "zqe/fqr2");
        expect.unreachable("Should have thrown QR_PROFILE_UNSUPPORTED");
      } catch (err) {
        expect(err).toBeInstanceOf(ZqeError);
        const zqeErr = err as ZqeError;
        expect(zqeErr.code).toBe("QR_PROFILE_UNSUPPORTED");
        expect(zqeErr.stage).toBe("input_validation");
      }
    });
  });

  describe("23.5 Generated & Property Corpus across lengths 0..42 and byte values 0x00..0xFF", () => {
    it("verifies strict verification passes for all lengths 0..42 with all-zero bytes", () => {
      for (let len = 0; len <= 42; len++) {
        const payload = new Uint8Array(len);
        payload.fill(0x00);
        const sym = compileQr(payload, "zqe/fqr1");
        const verification = strictVerifyQrSymbol(sym);
        expect(verification.pass).toBe(true);
      }
    });

    it("verifies strict verification passes for all lengths 0..42 with all-0xFF bytes", () => {
      for (let len = 0; len <= 42; len++) {
        const payload = new Uint8Array(len);
        payload.fill(0xff);
        const sym = compileQr(payload, "zqe/fqr1");
        const verification = strictVerifyQrSymbol(sym);
        expect(verification.pass).toBe(true);
      }
    });

    it("verifies strict verification passes for full byte range 0x00..0xFF across payloads", () => {
      const payload = new Uint8Array(42);
      for (let i = 0; i < 42; i++) {
        payload[i] = (i * 37 + 13) % 256;
      }
      const sym = compileQr(payload, "zqe/fqr1");
      const verification = strictVerifyQrSymbol(sym);
      expect(verification.pass).toBe(true);
    });

    it("proves deterministic repetition: same payload produces byte-identical matrix", () => {
      const sym1 = compileQr(FIXTURES.A.payload, "zqe/fqr1");
      const sym2 = compileQr(FIXTURES.A.payload, "zqe/fqr1");

      expect(sym1.mask).toBe(sym2.mask);
      expect(getMatrixDigest(sym1)).toBe(getMatrixDigest(sym2));
    });
  });
});
