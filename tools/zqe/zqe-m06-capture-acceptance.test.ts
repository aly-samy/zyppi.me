import { readFileSync, existsSync } from "fs";
import { createRequire } from "module";
import { describe, it, expect, beforeAll } from "vitest";
import {
  prepareZXingModule,
  readBarcodes,
  type ReadBarcodesOptions,
} from "zxing-wasm/reader";

import {
  FIXTURES,
  type FixtureKey,
  generatePristineRaster,
  transformScale,
  transformRotation,
  transformPerspectiveBaseline,
  transformBlur,
  transformLightingContrast,
  transformResampleJpeg,
  STABLE_TRANSFORM_IDS,
} from "./m06/capture-transforms.js";
import { sha256Hex, type EvidenceRecord } from "./m06/evidence.js";

const require = createRequire(import.meta.url);

const BLANK_WHITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" width="370" height="370"><rect width="37" height="37" fill="#ffffff"/></svg>`;

const DECODER_OPTIONS: ReadBarcodesOptions = {
  formats: ["QRCodeModel2"],
  maxNumberOfSymbols: 1,
  tryRotate: true,
  tryInvert: false,
  tryDownscale: true,
  tryHarder: true,
};

describe("AMS-ZQE-M06-FQR-REAL-WORLD-ACCEPTANCE-01 - Capture Simulation Gate", () => {
  let wasmPathResolved: string;
  const evidenceRecords: EvidenceRecord[] = [];

  beforeAll(async () => {
    wasmPathResolved = require.resolve("zxing-wasm/reader/zxing_reader.wasm");
    expect(existsSync(wasmPathResolved)).toBe(true);

    const wasmBuffer = readFileSync(wasmPathResolved);
    const exactWasm = wasmBuffer.buffer.slice(
      wasmBuffer.byteOffset,
      wasmBuffer.byteOffset + wasmBuffer.byteLength,
    );

    let networkAttempted = false;
    const originalFetch = globalThis.fetch;

    globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
      networkAttempted = true;
      throw new Error(
        `M06 network isolation violation: fetch attempted for ${String(args[0])}`,
      );
    }) as typeof fetch;

    try {
      await prepareZXingModule({
        overrides: {
          wasmBinary: exactWasm,
        },
        fireImmediately: true,
      });
    } finally {
      globalThis.fetch = originalFetch;
    }

    expect(networkAttempted).toBe(false);
  });

  it("01. Inherited M05 pristine fixtures A/B/C/E exact decode", async () => {
    const keys: FixtureKey[] = ["A", "B", "C", "E"];
    for (const key of keys) {
      const payload = FIXTURES[key];
      const raster = generatePristineRaster(payload);
      const results = await readBarcodes(raster.png, DECODER_OPTIONS);

      expect(results).toHaveLength(1);
      expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
    }
  });

  it("02. Inherited M05 blank white negative control returns 0 QR barcodes", async () => {
    const raster = generatePristineRaster(FIXTURES.A); // get dimensions
    const results = await readBarcodes(raster.png, DECODER_OPTIONS);
    expect(results).toHaveLength(1); // Pristine A is 1

    // Blank SVG directly
    const { Resvg } = await import("@resvg/resvg-js");
    const blankRender = new Resvg(BLANK_WHITE_SVG, {
      fitTo: { mode: "width", value: 370 },
    }).render();
    const blankPng = new Uint8Array(blankRender.asPng());

    const blankResults = await readBarcodes(blankPng, DECODER_OPTIONS);
    expect(blankResults).toHaveLength(0);
  });

  it("03. Frozen Scale / Frame-Occupancy Corpus (12/12)", async () => {
    const keys: FixtureKey[] = ["A", "B", "C", "E"];
    const scales = [
      { id: STABLE_TRANSFORM_IDS.SCALE_4PX, width: 148 },
      { id: STABLE_TRANSFORM_IDS.SCALE_6PX, width: 222 },
      { id: STABLE_TRANSFORM_IDS.SCALE_10PX, width: 370 },
    ];

    for (const key of keys) {
      const payload = FIXTURES[key];
      const pristine = generatePristineRaster(payload);

      for (const scale of scales) {
        const transformed = await transformScale(pristine.png, scale.width);
        const results = await readBarcodes(transformed.buffer, DECODER_OPTIONS);

        const imgHash = sha256Hex(transformed.buffer);
        const success =
          results.length === 1 &&
          JSON.stringify(Array.from(results[0].bytes)) ===
            JSON.stringify(Array.from(payload));

        evidenceRecords.push({
          payloadId: key,
          transformId: scale.id,
          parameters: { targetWidth: scale.width, canvas: "512x512" },
          dimensions: { width: transformed.width, height: transformed.height },
          encodedImageSha256: imgHash,
          decoderOutcome: results.length === 1 ? "SUCCESS" : "DECODE_FAILED",
          decodedPayloadSha256:
            results.length === 1
              ? sha256Hex(Uint8Array.from(results[0].bytes))
              : undefined,
          status: success ? "PASS" : "FAIL",
        });

        expect(results).toHaveLength(1);
        expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
      }
    }
  });

  it("04. Frozen Rotation Corpus (12/12)", async () => {
    const keys: FixtureKey[] = ["A", "B", "C", "E"];
    const rotations = [
      { id: STABLE_TRANSFORM_IDS.ROT_NEG15, angle: -15 },
      { id: STABLE_TRANSFORM_IDS.ROT_POS15, angle: 15 },
      { id: STABLE_TRANSFORM_IDS.ROT_90, angle: 90 },
    ];

    for (const key of keys) {
      const payload = FIXTURES[key];
      const pristine = generatePristineRaster(payload);

      for (const rot of rotations) {
        const transformed = await transformRotation(pristine.png, rot.angle);
        const results = await readBarcodes(transformed.buffer, DECODER_OPTIONS);

        const imgHash = sha256Hex(transformed.buffer);
        const success =
          results.length === 1 &&
          JSON.stringify(Array.from(results[0].bytes)) ===
            JSON.stringify(Array.from(payload));

        evidenceRecords.push({
          payloadId: key,
          transformId: rot.id,
          parameters: { angleDegrees: rot.angle },
          dimensions: { width: transformed.width, height: transformed.height },
          encodedImageSha256: imgHash,
          decoderOutcome: results.length === 1 ? "SUCCESS" : "DECODE_FAILED",
          decodedPayloadSha256:
            results.length === 1
              ? sha256Hex(Uint8Array.from(results[0].bytes))
              : undefined,
          status: success ? "PASS" : "FAIL",
        });

        expect(results).toHaveLength(1);
        expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
      }
    }
  });

  it("05. Frozen Perspective Baseline (4/4)", async () => {
    const keys: FixtureKey[] = ["A", "B", "C", "E"];

    for (const key of keys) {
      const payload = FIXTURES[key];
      const pristine = generatePristineRaster(payload);

      const transformed = await transformPerspectiveBaseline(pristine);
      const results = await readBarcodes(transformed.buffer, DECODER_OPTIONS);

      const imgHash = sha256Hex(transformed.buffer);
      const success =
        results.length === 1 &&
        JSON.stringify(Array.from(results[0].bytes)) ===
          JSON.stringify(Array.from(payload));

      evidenceRecords.push({
        payloadId: key,
        transformId: STABLE_TRANSFORM_IDS.PERSPECTIVE_BASELINE,
        parameters: {
          src: "(0,0)..(369,369)",
          dst: "(80,70),(430,100),(400,430),(60,390)",
          canvas: "512x512",
        },
        dimensions: { width: transformed.width, height: transformed.height },
        encodedImageSha256: imgHash,
        decoderOutcome: results.length === 1 ? "SUCCESS" : "DECODE_FAILED",
        decodedPayloadSha256:
          results.length === 1
            ? sha256Hex(Uint8Array.from(results[0].bytes))
            : undefined,
        status: success ? "PASS" : "FAIL",
      });

      expect(results).toHaveLength(1);
      expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
    }
  });

  it("06. Frozen Blur Baseline (4/4)", async () => {
    const keys: FixtureKey[] = ["A", "B", "C", "E"];

    for (const key of keys) {
      const payload = FIXTURES[key];
      const pristine = generatePristineRaster(payload);

      const transformed = await transformBlur(pristine.png, 1.2);
      const results = await readBarcodes(transformed.buffer, DECODER_OPTIONS);

      const imgHash = sha256Hex(transformed.buffer);
      const success =
        results.length === 1 &&
        JSON.stringify(Array.from(results[0].bytes)) ===
          JSON.stringify(Array.from(payload));

      evidenceRecords.push({
        payloadId: key,
        transformId: STABLE_TRANSFORM_IDS.BLUR_SIGMA_1_2,
        parameters: { sigma: 1.2 },
        dimensions: { width: transformed.width, height: transformed.height },
        encodedImageSha256: imgHash,
        decoderOutcome: results.length === 1 ? "SUCCESS" : "DECODE_FAILED",
        decodedPayloadSha256:
          results.length === 1
            ? sha256Hex(Uint8Array.from(results[0].bytes))
            : undefined,
        status: success ? "PASS" : "FAIL",
      });

      expect(results).toHaveLength(1);
      expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
    }
  });

  it("07. Frozen Lighting / Contrast Corpus (8/8)", async () => {
    const keys: FixtureKey[] = ["A", "B", "C", "E"];
    const modes = [
      {
        id: STABLE_TRANSFORM_IDS.LOW_LIGHT_0_70,
        mode: "LOW_LIGHT_0_70" as const,
        params: { scale: 0.7 },
      },
      {
        id: STABLE_TRANSFORM_IDS.LOW_CONTRAST_0_65_B45,
        mode: "LOW_CONTRAST_0_65_B45" as const,
        params: { scale: 0.65, bias: 45 },
      },
    ];

    for (const key of keys) {
      const payload = FIXTURES[key];
      const pristine = generatePristineRaster(payload);

      for (const m of modes) {
        const transformed = await transformLightingContrast(pristine, m.mode);
        const results = await readBarcodes(transformed.buffer, DECODER_OPTIONS);

        const imgHash = sha256Hex(transformed.buffer);
        const success =
          results.length === 1 &&
          JSON.stringify(Array.from(results[0].bytes)) ===
            JSON.stringify(Array.from(payload));

        evidenceRecords.push({
          payloadId: key,
          transformId: m.id,
          parameters: m.params,
          dimensions: { width: transformed.width, height: transformed.height },
          encodedImageSha256: imgHash,
          decoderOutcome: results.length === 1 ? "SUCCESS" : "DECODE_FAILED",
          decodedPayloadSha256:
            results.length === 1
              ? sha256Hex(Uint8Array.from(results[0].bytes))
              : undefined,
          status: success ? "PASS" : "FAIL",
        });

        expect(results).toHaveLength(1);
        expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
      }
    }
  });

  it("08. Frozen Compression / Resampling Baseline (4/4)", async () => {
    const keys: FixtureKey[] = ["A", "B", "C", "E"];

    for (const key of keys) {
      const payload = FIXTURES[key];
      const pristine = generatePristineRaster(payload);

      const transformed = await transformResampleJpeg(pristine.png);
      const results = await readBarcodes(transformed.buffer, DECODER_OPTIONS);

      const imgHash = sha256Hex(transformed.buffer);
      const success =
        results.length === 1 &&
        JSON.stringify(Array.from(results[0].bytes)) ===
          JSON.stringify(Array.from(payload));

      evidenceRecords.push({
        payloadId: key,
        transformId: STABLE_TRANSFORM_IDS.RESAMPLE_JPEG_Q65,
        parameters: {
          resample: "370->185->370 Lanczos3",
          jpegQuality: 65,
          subsampling: "4:4:4",
        },
        dimensions: { width: transformed.width, height: transformed.height },
        encodedImageSha256: imgHash,
        decoderOutcome: results.length === 1 ? "SUCCESS" : "DECODE_FAILED",
        decodedPayloadSha256:
          results.length === 1
            ? sha256Hex(Uint8Array.from(results[0].bytes))
            : undefined,
        status: success ? "PASS" : "FAIL",
      });

      expect(results).toHaveLength(1);
      expect(Uint8Array.from(results[0].bytes)).toEqual(payload);
    }
  });

  it("09. Total simulation acceptance count is exactly 44/44 PASS", () => {
    expect(evidenceRecords).toHaveLength(44);
    const passes = evidenceRecords.filter((r) => r.status === "PASS");
    expect(passes).toHaveLength(44);
  });

  it("10. Transform determinism check across all transform families", async () => {
    const pristine = generatePristineRaster(FIXTURES.B);

    // Scale
    const sc1 = await transformScale(pristine.png, 222);
    const sc2 = await transformScale(pristine.png, 222);
    expect(sc1.buffer).toEqual(sc2.buffer);

    // Rotation
    const rot1 = await transformRotation(pristine.png, 15);
    const rot2 = await transformRotation(pristine.png, 15);
    expect(rot1.buffer).toEqual(rot2.buffer);

    // Perspective
    const p1 = await transformPerspectiveBaseline(pristine);
    const p2 = await transformPerspectiveBaseline(pristine);
    expect(p1.buffer).toEqual(p2.buffer);

    // Blur
    const b1 = await transformBlur(pristine.png, 1.2);
    const b2 = await transformBlur(pristine.png, 1.2);
    expect(b1.buffer).toEqual(b2.buffer);

    // Lighting/Contrast
    const lc1 = await transformLightingContrast(pristine, "LOW_LIGHT_0_70");
    const lc2 = await transformLightingContrast(pristine, "LOW_LIGHT_0_70");
    expect(lc1.buffer).toEqual(lc2.buffer);

    // Compression
    const j1 = await transformResampleJpeg(pristine.png);
    const j2 = await transformResampleJpeg(pristine.png);
    expect(j1.buffer).toEqual(j2.buffer);
  });
});
