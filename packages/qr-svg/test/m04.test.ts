import { describe, it, expect } from "vitest";
import { compileQr, QrSymbol, ZqeError } from "@zyppi/qr-core";
import { renderQrSvg } from "../src/index.js";
import fs from "node:fs";
import path from "node:path";

/**
 * Independent test-local reference serializer oracle.
 * Consumes ONLY public QrSymbol interface, performs its own row-major 29x29 traversal,
 * and constructs the frozen canonical SVG string independently of production renderer code.
 */
function independentReferenceSvg(symbol: QrSymbol): string {
  let darkRects = "";
  for (let y = 0; y < 29; y++) {
    for (let x = 0; x < 29; x++) {
      if (symbol.getModule(x, y)) {
        darkRects += `<rect x="${x + 4}" y="${y + 4}" width="1" height="1"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges"><rect x="0" y="0" width="37" height="37" fill="#fff"/><g fill="#000">${darkRects}</g></svg>`;
}

const FIXTURES = {
  A: new TextEncoder().encode("HELLO ZYPPI"),
  B: new TextEncoder().encode("https://id.gs1.org/01/09520123456788"),
  C: new TextEncoder().encode("ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001"),
  E: new TextEncoder().encode("ZYPPI-FQR1-INTERIOR-TEST-2026"),
} as const;

describe("ZQE-M04 Deterministic SVG Renderer Test Suite", () => {
  describe("20. Frozen Fixture Pipeline", () => {
    for (const [key, payload] of Object.entries(FIXTURES)) {
      it(`Fixture ${key}: renders SVG matching independent test oracle`, () => {
        const symbol = compileQr(payload, "zqe/fqr1");
        const rendered = renderQrSvg(symbol);
        const oracle = independentReferenceSvg(symbol);

        expect(rendered).toBe(oracle);
      });

      it(`Fixture ${key}: repeated renders are byte-identical (determinism)`, () => {
        const symbol = compileQr(payload, "zqe/fqr1");
        const rendered1 = renderQrSvg(symbol);
        const rendered2 = renderQrSvg(symbol);
        const rendered3 = renderQrSvg(symbol);

        expect(rendered1).toBe(rendered2);
        expect(rendered2).toBe(rendered3);
      });
    }

    it("SVG differs when underlying valid symbols differ", () => {
      const symA = compileQr(FIXTURES.A, "zqe/fqr1");
      const symB = compileQr(FIXTURES.B, "zqe/fqr1");

      const svgA = renderQrSvg(symA);
      const svgB = renderQrSvg(symB);

      expect(svgA).not.toBe(svgB);
    });

    it("Rendering does not mutate native QrSymbol instance", () => {
      const symbol = compileQr(FIXTURES.A, "zqe/fqr1");
      const modulesBefore: boolean[][] = [];
      for (let y = 0; y < 29; y++) {
        const row: boolean[] = [];
        for (let x = 0; x < 29; x++) {
          row.push(symbol.getModule(x, y));
        }
        modulesBefore.push(row);
      }

      renderQrSvg(symbol);

      for (let y = 0; y < 29; y++) {
        for (let x = 0; x < 29; x++) {
          expect(symbol.getModule(x, y)).toBe(modulesBefore[y][x]);
        }
      }
    });

    it("Reads getModule exactly once per module coordinate (exactly 841 calls)", () => {
      const symbol = compileQr(FIXTURES.A, "zqe/fqr1");
      let callCount = 0;
      const wrappedSymbol: QrSymbol = {
        ...symbol,
        getModule: (x: number, y: number) => {
          callCount++;
          return symbol.getModule(x, y);
        },
      };

      renderQrSvg(wrappedSymbol);

      expect(callCount).toBe(841);
    });
  });

  describe("21. Required Renderer Tests", () => {
    it("21.1 Exact wrapper formatting and no trailing newline", () => {
      const symbol = compileQr(FIXTURES.A, "zqe/fqr1");
      const svg = renderQrSvg(symbol);

      expect(
        svg.startsWith(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges"><rect x="0" y="0" width="37" height="37" fill="#fff"/><g fill="#000">',
        ),
      ).toBe(true);
      expect(svg.endsWith("</g></svg>")).toBe(true);
      expect(svg.endsWith("\n")).toBe(false);
      expect(svg.includes("\n")).toBe(false);
      expect(svg.includes("\r")).toBe(false);
    });

    it("21.2 Exact module correspondence and row-major ordering", () => {
      const symbol = compileQr(FIXTURES.A, "zqe/fqr1");
      const svg = renderQrSvg(symbol);

      const matchGroup = svg.match(/<g fill="#000">(.*?)<\/g>/);
      expect(matchGroup).not.toBeNull();
      const groupContent = matchGroup![1];

      const rectRegex = /<rect x="(\d+)" y="(\d+)" width="1" height="1"\/>/g;
      const emittedRects: Array<{ x: number; y: number }> = [];

      let match;
      while ((match = rectRegex.exec(groupContent)) !== null) {
        emittedRects.push({
          x: parseInt(match[1], 10),
          y: parseInt(match[2], 10),
        });
      }

      // Check module-by-module expectation
      let expectedRectCount = 0;
      const expectedRects: Array<{ x: number; y: number }> = [];
      for (let y = 0; y < 29; y++) {
        for (let x = 0; x < 29; x++) {
          if (symbol.getModule(x, y)) {
            expectedRectCount++;
            expectedRects.push({ x: x + 4, y: y + 4 });
          }
        }
      }

      expect(emittedRects.length).toBe(expectedRectCount);
      expect(emittedRects).toEqual(expectedRects);
    });

    it("21.3 Quiet zone enforcement (no dark rect outside x=4..32, y=4..32)", () => {
      const symbol = compileQr(FIXTURES.C, "zqe/fqr1");
      const svg = renderQrSvg(symbol);

      const rectRegex = /<rect x="(\d+)" y="(\d+)"/g;
      let match;
      while ((match = rectRegex.exec(svg)) !== null) {
        const x = parseInt(match[1], 10);
        const y = parseInt(match[2], 10);
        // Skip background rect at 0,0
        if (x === 0 && y === 0) continue;

        expect(x).toBeGreaterThanOrEqual(4);
        expect(x).toBeLessThanOrEqual(32);
        expect(y).toBeGreaterThanOrEqual(4);
        expect(y).toBeLessThanOrEqual(32);
      }
    });

    it("21.4 Integer geometry & no transforms", () => {
      const symbol = compileQr(FIXTURES.E, "zqe/fqr1");
      const svg = renderQrSvg(symbol);

      expect(svg).not.toMatch(/\d+\.\d+/); // No floating point numbers
      expect(svg.includes("transform")).toBe(false);
      expect(svg.includes("translate")).toBe(false);
      expect(svg.includes("scale")).toBe(false);
    });

    it("21.5 Determinism across equivalent compiled symbols", () => {
      const payload = new TextEncoder().encode("TEST_PAYLOAD");
      const sym1 = compileQr(payload, "zqe/fqr1");
      const sym2 = compileQr(payload, "zqe/fqr1");

      const svg1 = renderQrSvg(sym1);
      const svg2 = renderQrSvg(sym2);

      expect(svg1).toBe(svg2);
    });

    it("21.6 Invalid symbol failures with ZqeError and stage=rendering", () => {
      const validSym = compileQr(new TextEncoder().encode("TEST"), "zqe/fqr1");

      const invalidCases: Array<{
        name: string;
        input: unknown;
        reasonSubstr: string;
      }> = [
        { name: "null", input: null, reasonSubstr: "non-null object" },
        {
          name: "undefined",
          input: undefined,
          reasonSubstr: "non-null object",
        },
        {
          name: "primitive string",
          input: "not a symbol",
          reasonSubstr: "non-null object",
        },
        {
          name: "wrong model",
          input: { ...validSym, model: "QR_MODEL_1" },
          reasonSubstr: "QR_MODEL_2",
        },
        {
          name: "wrong version",
          input: { ...validSym, version: 2 },
          reasonSubstr: "version",
        },
        {
          name: "wrong size",
          input: { ...validSym, size: 25 },
          reasonSubstr: "size",
        },
        {
          name: "wrong errorCorrection",
          input: { ...validSym, errorCorrection: "L" },
          reasonSubstr: "errorCorrection",
        },
        {
          name: "invalid mask negative",
          input: { ...validSym, mask: -1 },
          reasonSubstr: "mask",
        },
        {
          name: "invalid mask > 7",
          input: { ...validSym, mask: 8 },
          reasonSubstr: "mask",
        },
        {
          name: "invalid mask float",
          input: { ...validSym, mask: 3.5 },
          reasonSubstr: "mask",
        },
        {
          name: "missing getModule",
          input: { ...validSym, getModule: undefined },
          reasonSubstr: "getModule",
        },
        {
          name: "getModule throws",
          input: {
            ...validSym,
            getModule: () => {
              throw new Error("getModule fail");
            },
          },
          reasonSubstr: "threw an error",
        },
        {
          name: "getModule returns non-boolean",
          input: {
            ...validSym,
            getModule: () => "true" as unknown as boolean,
          },
          reasonSubstr: "non-boolean",
        },
      ];

      for (const { name, input, reasonSubstr } of invalidCases) {
        expect(
          () => renderQrSvg(input as QrSymbol),
          `Case '${name}' failed to throw`,
        ).toThrow(ZqeError);

        try {
          renderQrSvg(input as QrSymbol);
        } catch (err) {
          expect(err).toBeInstanceOf(ZqeError);
          const ze = err as ZqeError;
          expect(ze.code).toBe("QR_RENDER_INVALID_SYMBOL");
          expect(ze.stage).toBe("rendering");
          expect(ze.reference).toBe(
            "ZQE-001 / Canonical SVG renderer contract",
          );
          expect(ze.recovery).toBe(
            "Provide a valid immutable FQR-1 QrSymbol produced by @zyppi/qr-core.",
          );
          expect(ze.reason.toLowerCase()).toContain(reasonSubstr.toLowerCase());
        }
      }
    });

    it("21.7 No recompilation & core internal imports", () => {
      // Inspect source file packages/qr-svg/src/render.ts
      const renderSrcPath = path.resolve(__dirname, "../src/render.ts");
      const renderSrc = fs.readFileSync(renderSrcPath, "utf8");

      expect(renderSrc.includes("qr-core/src")).toBe(false);
      expect(renderSrc.includes("m02/")).toBe(false);
      expect(renderSrc.includes("m03/")).toBe(false);
      expect(renderSrc.includes("rsGenerator")).toBe(false);
      expect(renderSrc.includes("gfMultiply")).toBe(false);
    });
  });

  describe("22. Generated Property Corpus", () => {
    it("Matches reference oracle across payload lengths 0..42 and patterns", () => {
      for (let len = 0; len <= 42; len++) {
        // All-zero pattern
        const zeroBuf = new Uint8Array(len);
        const zeroSym = compileQr(zeroBuf, "zqe/fqr1");
        expect(renderQrSvg(zeroSym)).toBe(independentReferenceSvg(zeroSym));

        // All-FF pattern
        const ffBuf = new Uint8Array(len).fill(0xff);
        const ffSym = compileQr(ffBuf, "zqe/fqr1");
        expect(renderQrSvg(ffSym)).toBe(independentReferenceSvg(ffSym));

        // Arithmetic pattern
        const arithBuf = new Uint8Array(len).map(
          (_, i) => (i * 37 + 13) & 0xff,
        );
        const arithSym = compileQr(arithBuf, "zqe/fqr1");
        expect(renderQrSvg(arithSym)).toBe(independentReferenceSvg(arithSym));
      }
    });
  });
});
