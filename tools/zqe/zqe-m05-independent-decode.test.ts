import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createRequire } from "module";
import { describe, it, expect, beforeAll } from "vitest";
import { Resvg } from "@resvg/resvg-js";
import {
  prepareZXingModule,
  readBarcodes,
  ZXING_WASM_VERSION,
  ZXING_CPP_COMMIT,
  ZXING_WASM_SHA256,
  type ReadBarcodesOptions,
} from "zxing-wasm/reader";

import { compileQr } from "@zyppi/qr-core";
import { renderQrSvg } from "@zyppi/qr-svg";

const require = createRequire(import.meta.url);

const FIXTURES = {
  A: new TextEncoder().encode("HELLO ZYPPI"),
  B: new TextEncoder().encode("https://id.gs1.org/01/09520123456788"),
  C: new TextEncoder().encode("ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001"),
  E: new TextEncoder().encode("ZYPPI-FQR1-INTERIOR-TEST-2026"),
};

const BLANK_WHITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" width="370" height="370"><rect width="37" height="37" fill="#ffffff"/></svg>`;

const DECODER_OPTIONS: ReadBarcodesOptions = {
  formats: ["QRCodeModel2"],
  maxNumberOfSymbols: 1,
  tryRotate: false,
  tryInvert: false,
  tryDownscale: false,
  tryHarder: true,
};

function rasterizeSvgToPng(svgString: string): {
  png: Uint8Array;
  width: number;
  height: number;
  pixels: Uint8Array;
} {
  const resvg = new Resvg(svgString, {
    fitTo: {
      mode: "width",
      value: 370,
    },
    font: {
      loadSystemFonts: false,
    },
  });

  const rendered = resvg.render();
  const width = rendered.width;
  const height = rendered.height;
  const pixels = rendered.pixels;
  const png = rendered.asPng();

  return { png, width, height, pixels };
}

describe("AMS-ZQE-M05-INDEPENDENT-DECODE-GATE-01", () => {
  let wasmPathResolved: string;

  beforeAll(async () => {
    wasmPathResolved = require.resolve("zxing-wasm/reader/zxing_reader.wasm");

    expect(existsSync(wasmPathResolved)).toBe(true);

    const wasmBuffer = readFileSync(wasmPathResolved);
    const exactWasm = wasmBuffer.buffer.slice(
      wasmBuffer.byteOffset,
      wasmBuffer.byteOffset + wasmBuffer.byteLength,
    );

    await prepareZXingModule({
      overrides: {
        wasmBinary: exactWasm,
      },
      fireImmediately: true,
    });
  });

  it("01. Decoder WASM provenance and local loading without remote fetch", () => {
    expect(ZXING_WASM_VERSION).toBe("3.1.3");
    expect(ZXING_CPP_COMMIT).toBeDefined();
    expect(ZXING_WASM_SHA256).toBeDefined();
    expect(existsSync(wasmPathResolved)).toBe(true);
  });

  it("02. Fixture A exact decode", async () => {
    const payload = FIXTURES.A;
    const symbol = compileQr(payload, "zqe/fqr1");
    const svg = renderQrSvg(symbol);
    const raster = rasterizeSvgToPng(svg);

    expect(raster.width).toBe(370);
    expect(raster.height).toBe(370);

    const results = await readBarcodes(raster.png, DECODER_OPTIONS);
    expect(results).toHaveLength(1);
    expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
  });

  it("03. Fixture B exact decode", async () => {
    const payload = FIXTURES.B;
    const symbol = compileQr(payload, "zqe/fqr1");
    const svg = renderQrSvg(symbol);
    const raster = rasterizeSvgToPng(svg);

    expect(raster.width).toBe(370);
    expect(raster.height).toBe(370);

    const results = await readBarcodes(raster.png, DECODER_OPTIONS);
    expect(results).toHaveLength(1);
    expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
  });

  it("04. Fixture C exact decode", async () => {
    const payload = FIXTURES.C;
    const symbol = compileQr(payload, "zqe/fqr1");
    const svg = renderQrSvg(symbol);
    const raster = rasterizeSvgToPng(svg);

    expect(raster.width).toBe(370);
    expect(raster.height).toBe(370);

    const results = await readBarcodes(raster.png, DECODER_OPTIONS);
    expect(results).toHaveLength(1);
    expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
  });

  it("05. Fixture E exact decode", async () => {
    const payload = FIXTURES.E;
    const symbol = compileQr(payload, "zqe/fqr1");
    const svg = renderQrSvg(symbol);
    const raster = rasterizeSvgToPng(svg);

    expect(raster.width).toBe(370);
    expect(raster.height).toBe(370);

    const results = await readBarcodes(raster.png, DECODER_OPTIONS);
    expect(results).toHaveLength(1);
    expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
  });

  it("06. Repeated decode and rasterization determinism over A/B/C/E", async () => {
    const keys: Array<keyof typeof FIXTURES> = ["A", "B", "C", "E"];

    for (const key of keys) {
      const payload = FIXTURES[key];
      const symbol1 = compileQr(payload, "zqe/fqr1");
      const svg1 = renderQrSvg(symbol1);
      const raster1 = rasterizeSvgToPng(svg1);

      const symbol2 = compileQr(payload, "zqe/fqr1");
      const svg2 = renderQrSvg(symbol2);
      const raster2 = rasterizeSvgToPng(svg2);

      expect(svg1).toBe(svg2);
      expect(raster1.width).toBe(370);
      expect(raster1.height).toBe(370);
      expect(raster2.width).toBe(370);
      expect(raster2.height).toBe(370);
      expect(raster1.png).toEqual(raster2.png);
      expect(raster1.pixels).toEqual(raster2.pixels);

      const res1 = await readBarcodes(raster1.png, DECODER_OPTIONS);
      const res2 = await readBarcodes(raster2.png, DECODER_OPTIONS);

      expect(res1).toHaveLength(1);
      expect(res2).toHaveLength(1);
      expect(Uint8Array.from(res1[0].bytes)).toEqual(payload);
      expect(Uint8Array.from(res2[0].bytes)).toEqual(payload);
    }
  }, 15000);

  it("07. Raster output dimensions strictly 370x370", () => {
    const symbol = compileQr(FIXTURES.A, "zqe/fqr1");
    const svg = renderQrSvg(symbol);
    const raster = rasterizeSvgToPng(svg);

    expect(raster.width).toBe(370);
    expect(raster.height).toBe(370);
  });

  it("08. Blank white negative control returns no QR barcode", async () => {
    const raster = rasterizeSvgToPng(BLANK_WHITE_SVG);
    expect(raster.width).toBe(370);
    expect(raster.height).toBe(370);

    const results = await readBarcodes(raster.png, DECODER_OPTIONS);
    expect(results).toHaveLength(0);
  });

  it("09. Production package manifests contain no decoder/rasterizer dependencies", () => {
    const corePkgPath = resolve(process.cwd(), "packages/qr-core/package.json");
    const svgPkgPath = resolve(process.cwd(), "packages/qr-svg/package.json");

    const corePkg = JSON.parse(readFileSync(corePkgPath, "utf-8"));
    const svgPkg = JSON.parse(readFileSync(svgPkgPath, "utf-8"));

    const forbidden = ["zxing-wasm", "@resvg/resvg-js", "@sec-ant/zxing-wasm"];

    for (const pkg of forbidden) {
      expect(corePkg.dependencies?.[pkg]).toBeUndefined();
      expect(corePkg.devDependencies?.[pkg]).toBeUndefined();
      expect(svgPkg.dependencies?.[pkg]).toBeUndefined();
      expect(svgPkg.devDependencies?.[pkg]).toBeUndefined();
    }
  });

  it("10. Test harness imports only public package surfaces (@zyppi/qr-core and @zyppi/qr-svg)", () => {
    const harnessPath = resolve(
      process.cwd(),
      "tools/zqe/zqe-m05-independent-decode.test.ts",
    );
    const code = readFileSync(harnessPath, "utf-8");

    expect(code).toContain('import { compileQr } from "@zyppi/qr-core"');
    expect(code).toContain('import { renderQrSvg } from "@zyppi/qr-svg"');

    const coreSrc = ["packages", "qr-core", "src"].join("/");
    const svgSrc = ["packages", "qr-svg", "src"].join("/");
    const forbiddenVerifier = ["strict", "verifier"].join("-");

    expect(code.includes(coreSrc)).toBe(false);
    expect(code.includes(svgSrc)).toBe(false);
    expect(code.includes(forbiddenVerifier)).toBe(false);
  });
});
