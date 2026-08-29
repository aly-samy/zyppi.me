import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { BitBuffer, buildFqrDataCodewords } from "../src/m02/bitstream.js";
import { ZqeError } from "../src/m02/errors.js";
import { buildFqr1CodewordStream } from "../src/m02/fqr1-codewords.js";
import { gfMultiply } from "../src/m02/gf256.js";
import { rsGenerator, rsRemainder } from "../src/m02/reed-solomon.js";

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

describe("ZQE-M02 Bitstream, Field Arithmetic & ECC Core", () => {
  // Frozen Fixture Definitions
  const FIXTURES = {
    A: {
      payload: new TextEncoder().encode("HELLO ZYPPI"),
      length: 11,
      expectedDataHex:
        "40b48454c4c4f205a595050490ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec",
      expectedEccHex: "1ca700e8aee8305065ee9c9dd2f4952b652982ccb33d74781e9a",
      expectedFullHex:
        "40b48454c4c4f205a595050490ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec11ec1ca700e8aee8305065ee9c9dd2f4952b652982ccb33d74781e9a",
      expectedFullSha256:
        "ebb3315437d5d982394fa3be91cbdb6f8b2263dbf1c2299868392a68e3e17f78",
    },
    B: {
      payload: new TextEncoder().encode("https://id.gs1.org/01/09520123456788"),
      length: 36,
      expectedDataHex:
        "42468747470733a2f2f69642e6773312e6f72672f30312f30393532303132333435363738380ec11ec11ec11",
      expectedEccHex: "adf4b7f417d1f943140a3b018a5d1e9baaa2027908845f65bc56",
      expectedFullHex:
        "42468747470733a2f2f69642e6773312e6f72672f30312f30393532303132333435363738380ec11ec11ec11adf4b7f417d1f943140a3b018a5d1e9baaa2027908845f65bc56",
      expectedFullSha256:
        "a641d302a4231bc760b1f3e25dd603b2381fa67fd8d1b698b5d32f6bd3a69bb8",
    },
    C: {
      payload: new TextEncoder().encode(
        "ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001",
      ),
      length: 42,
      expectedDataHex:
        "42a5a595050492d465152312d43415041434954592d424f554e444152592d303030303030303030303030310",
      expectedEccHex: "201d4d882c757d770d283dc557bca11f88f7faf686b2af797515",
      expectedFullHex:
        "42a5a595050492d465152312d43415041434954592d424f554e444152592d303030303030303030303030310201d4d882c757d770d283dc557bca11f88f7faf686b2af797515",
      expectedFullSha256:
        "8a47e344e54a8e1803cf8e0a40edfd7ebe6b8f289a174c9ed8caba7475177aee",
    },
    D: {
      payload: new TextEncoder().encode(
        "ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001X",
      ),
      length: 43,
    },
    E: {
      payload: new TextEncoder().encode("ZYPPI-FQR1-INTERIOR-TEST-2026"),
      length: 29,
      expectedDataHex:
        "41d5a595050492d465152312d494e544552494f522d544553542d323032360ec11ec11ec11ec11ec11ec11ec",
      expectedEccHex: "6d568cf5352971bb72b8b6c1573082bb3f1fd31e90a0bd4f884e",
      expectedFullHex:
        "41d5a595050492d465152312d494e544552494f522d544553542d323032360ec11ec11ec11ec11ec11ec11ec6d568cf5352971bb72b8b6c1573082bb3f1fd31e90a0bd4f884e",
      expectedFullSha256:
        "73c5aefe3e3973df2a4c6fbcafffc69a5279ba95da1d7c09ce7285d3b16bb62a",
    },
  };

  describe("17.1 Bitstream & Chair-Frozen Golden Vectors", () => {
    it("matches exact 44 data codewords, 26 ECC codewords, and 70-byte stream for Fixture A", () => {
      const data = buildFqrDataCodewords(FIXTURES.A.payload);
      expect(data.length).toBe(44);
      expect(bytesToHex(data)).toBe(FIXTURES.A.expectedDataHex);

      const gen = rsGenerator(26);
      const ecc = rsRemainder(data, gen);
      expect(ecc.length).toBe(26);
      expect(bytesToHex(ecc)).toBe(FIXTURES.A.expectedEccHex);

      const stream = buildFqr1CodewordStream(FIXTURES.A.payload);
      expect(stream.length).toBe(70);
      expect(bytesToHex(stream)).toBe(FIXTURES.A.expectedFullHex);
      expect(sha256Hex(stream)).toBe(FIXTURES.A.expectedFullSha256);
    });

    it("matches exact 44 data codewords, 26 ECC codewords, and 70-byte stream for Fixture B", () => {
      const data = buildFqrDataCodewords(FIXTURES.B.payload);
      expect(data.length).toBe(44);
      expect(bytesToHex(data)).toBe(FIXTURES.B.expectedDataHex);

      const gen = rsGenerator(26);
      const ecc = rsRemainder(data, gen);
      expect(ecc.length).toBe(26);
      expect(bytesToHex(ecc)).toBe(FIXTURES.B.expectedEccHex);

      const stream = buildFqr1CodewordStream(FIXTURES.B.payload);
      expect(stream.length).toBe(70);
      expect(bytesToHex(stream)).toBe(FIXTURES.B.expectedFullHex);
      expect(sha256Hex(stream)).toBe(FIXTURES.B.expectedFullSha256);
    });

    it("matches exact 44 data codewords, 26 ECC codewords, and 70-byte stream for Fixture C", () => {
      const data = buildFqrDataCodewords(FIXTURES.C.payload);
      expect(data.length).toBe(44);
      expect(bytesToHex(data)).toBe(FIXTURES.C.expectedDataHex);

      const gen = rsGenerator(26);
      const ecc = rsRemainder(data, gen);
      expect(ecc.length).toBe(26);
      expect(bytesToHex(ecc)).toBe(FIXTURES.C.expectedEccHex);

      const stream = buildFqr1CodewordStream(FIXTURES.C.payload);
      expect(stream.length).toBe(70);
      expect(bytesToHex(stream)).toBe(FIXTURES.C.expectedFullHex);
      expect(sha256Hex(stream)).toBe(FIXTURES.C.expectedFullSha256);
    });

    it("matches exact 44 data codewords, 26 ECC codewords, and 70-byte stream for Fixture E", () => {
      const data = buildFqrDataCodewords(FIXTURES.E.payload);
      expect(data.length).toBe(44);
      expect(bytesToHex(data)).toBe(FIXTURES.E.expectedDataHex);

      const gen = rsGenerator(26);
      const ecc = rsRemainder(data, gen);
      expect(ecc.length).toBe(26);
      expect(bytesToHex(ecc)).toBe(FIXTURES.E.expectedEccHex);

      const stream = buildFqr1CodewordStream(FIXTURES.E.payload);
      expect(stream.length).toBe(70);
      expect(bytesToHex(stream)).toBe(FIXTURES.E.expectedFullHex);
      expect(sha256Hex(stream)).toBe(FIXTURES.E.expectedFullSha256);
    });
  });

  describe("17.2 Capacity Boundary & Error Contract", () => {
    it("accepts 42 bytes (Fixture C) and rejects 43 bytes (Fixture D) with QR_CAPACITY_EXCEEDED reporting byte length", () => {
      expect(() => buildFqr1CodewordStream(FIXTURES.C.payload)).not.toThrow();

      try {
        buildFqr1CodewordStream(FIXTURES.D.payload);
        expect.unreachable("Should have thrown QR_CAPACITY_EXCEEDED");
      } catch (err) {
        expect(err).toBeInstanceOf(ZqeError);
        const zqeErr = err as ZqeError;
        expect(zqeErr.code).toBe("QR_CAPACITY_EXCEEDED");
        expect(zqeErr.stage).toBe("input_validation");
        expect(zqeErr.reason).toBe(
          "Input contains 43 bytes; zqe/fqr1 supports at most 42 bytes.",
        );
        expect(zqeErr.reference).toBe("ZQE-001 / FQR capacity rule");
        expect(zqeErr.recovery).toBe(
          "Provide 42 bytes or fewer, or use a future explicitly authorized profile.",
        );
      }
    });

    it("rejects larger overflow inputs identically with QR_CAPACITY_EXCEEDED and byte length reporting", () => {
      const largeInput = new Uint8Array(100);
      largeInput.fill(0x41);

      try {
        buildFqr1CodewordStream(largeInput);
        expect.unreachable("Should have thrown QR_CAPACITY_EXCEEDED");
      } catch (err) {
        expect(err).toBeInstanceOf(ZqeError);
        const zqeErr = err as ZqeError;
        expect(zqeErr.code).toBe("QR_CAPACITY_EXCEEDED");
        expect(zqeErr.reason).toBe(
          "Input contains 100 bytes; zqe/fqr1 supports at most 42 bytes.",
        );
      }
    });
  });

  describe("17.3 GF(256) Properties", () => {
    it("satisfies zero identity: a * 0 = 0", () => {
      for (let a = 0; a <= 255; a++) {
        expect(gfMultiply(a, 0)).toBe(0);
        expect(gfMultiply(0, a)).toBe(0);
      }
    });

    it("satisfies unit identity: a * 1 = a", () => {
      for (let a = 0; a <= 255; a++) {
        expect(gfMultiply(a, 1)).toBe(a);
        expect(gfMultiply(1, a)).toBe(a);
      }
    });

    it("satisfies commutativity: a * b = b * a", () => {
      for (let a = 0; a <= 255; a += 17) {
        for (let b = 0; b <= 255; b += 19) {
          expect(gfMultiply(a, b)).toBe(gfMultiply(b, a));
        }
      }
    });

    it("satisfies closure: a * b ∈ [0, 255]", () => {
      for (let a = 0; a <= 255; a += 13) {
        for (let b = 0; b <= 255; b += 11) {
          const res = gfMultiply(a, b);
          expect(res).toBeGreaterThanOrEqual(0);
          expect(res).toBeLessThanOrEqual(255);
        }
      }
    });

    it("satisfies distributivity over XOR: a * (b XOR c) = (a * b) XOR (a * c)", () => {
      for (let a = 0; a <= 255; a += 23) {
        for (let b = 0; b <= 255; b += 29) {
          for (let c = 0; c <= 255; c += 31) {
            const left = gfMultiply(a, b ^ c);
            const right = gfMultiply(a, b) ^ gfMultiply(a, c);
            expect(left).toBe(right);
          }
        }
      }
    });

    it("fails closed on out-of-range operands", () => {
      expect(() => gfMultiply(-1, 10)).toThrow(ZqeError);
      expect(() => gfMultiply(256, 10)).toThrow(ZqeError);
      expect(() => gfMultiply(10, 1.5)).toThrow(ZqeError);
    });
  });

  describe("17.4 Reed-Solomon Generator & Remainder", () => {
    it("produces deterministic degree-26 generator of length 26", () => {
      const g1 = rsGenerator(26);
      const g2 = rsGenerator(26);

      expect(g1.length).toBe(26);
      expect(g1).toEqual(g2);
    });

    it("produces exact ECC vectors for valid fixtures A, B, C, E", () => {
      const g = rsGenerator(26);

      const eccA = rsRemainder(buildFqrDataCodewords(FIXTURES.A.payload), g);
      expect(bytesToHex(eccA)).toBe(FIXTURES.A.expectedEccHex);

      const eccB = rsRemainder(buildFqrDataCodewords(FIXTURES.B.payload), g);
      expect(bytesToHex(eccB)).toBe(FIXTURES.B.expectedEccHex);

      const eccC = rsRemainder(buildFqrDataCodewords(FIXTURES.C.payload), g);
      expect(bytesToHex(eccC)).toBe(FIXTURES.C.expectedEccHex);

      const eccE = rsRemainder(buildFqrDataCodewords(FIXTURES.E.payload), g);
      expect(bytesToHex(eccE)).toBe(FIXTURES.E.expectedEccHex);
    });

    it("repeats remainder computation byte-identically", () => {
      const g = rsGenerator(26);
      const data = buildFqrDataCodewords(FIXTURES.A.payload);

      const run1 = rsRemainder(data, g);
      const run2 = rsRemainder(data, g);

      expect(run1).toEqual(run2);
    });
  });

  describe("17.5 & 17.6 Deterministic Generated Corpus across lengths 0..42", () => {
    it("proves 44 data + 26 ECC = 70 codewords for all generated lengths 0..42 and all-zero bytes", () => {
      for (let len = 0; len <= 42; len++) {
        const payload = new Uint8Array(len);
        payload.fill(0x00);

        const data = buildFqrDataCodewords(payload);
        expect(data.length).toBe(44);

        const stream = buildFqr1CodewordStream(payload);
        expect(stream.length).toBe(70);
      }
    });

    it("proves 44 data + 26 ECC = 70 codewords for all generated lengths 0..42 and all-0xFF bytes", () => {
      for (let len = 0; len <= 42; len++) {
        const payload = new Uint8Array(len);
        payload.fill(0xff);

        const data = buildFqrDataCodewords(payload);
        expect(data.length).toBe(44);

        const stream = buildFqr1CodewordStream(payload);
        expect(stream.length).toBe(70);
      }
    });

    it("proves 44 data + 26 ECC = 70 codewords for ascending mod-256 patterns", () => {
      for (let len = 0; len <= 42; len++) {
        const payload = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          payload[i] = (i * 37 + 13) % 256;
        }

        const stream = buildFqr1CodewordStream(payload);
        expect(stream.length).toBe(70);
      }
    });

    it("proves repeated construction yields byte-identical results without system randomness", () => {
      const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const s1 = buildFqr1CodewordStream(payload);
      const s2 = buildFqr1CodewordStream(payload);

      expect(s1).toEqual(s2);
    });
  });

  describe("17.7 Defensive Ownership & Alias Isolation", () => {
    it("proves mutating the caller input array after invocation does not alter returned codeword output", () => {
      const callerInput = new Uint8Array([0x48, 0x45, 0x4c, 0x4c, 0x4f]); // "HELLO"
      const stream = buildFqr1CodewordStream(callerInput);

      const snapshotBeforeMutation = new Uint8Array(stream);

      // Mutate original caller input
      callerInput.fill(0xff);

      expect(stream).toEqual(snapshotBeforeMutation);
    });
  });

  describe("17.8 Malformed Primitive Rejection", () => {
    it("rejects invalid bit width or negative/overflow value in BitBuffer", () => {
      const bb = new BitBuffer();
      expect(() => bb.append(10, -1)).toThrow(ZqeError);
      expect(() => bb.append(256, 8)).toThrow(ZqeError);
      expect(() => bb.append(-1, 8)).toThrow(ZqeError);
    });

    it("rejects RS generator with invalid degree", () => {
      expect(() => rsGenerator(0)).toThrow(ZqeError);
      expect(() => rsGenerator(256)).toThrow(ZqeError);
    });

    it("rejects RS remainder if data or divisor lengths are invalid", () => {
      const g26 = rsGenerator(26);
      expect(() => rsRemainder(new Uint8Array(43), g26)).toThrow(ZqeError);

      const data44 = new Uint8Array(44);
      expect(() => rsRemainder(data44, new Uint8Array(25))).toThrow(ZqeError);
    });
  });
});
