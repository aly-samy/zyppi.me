import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { Resvg } from "@resvg/resvg-js";
import {
  FIXTURES,
  generatePristineRaster,
  transformScale,
  transformRotation,
  transformPerspectiveBaseline,
  transformBlur,
  transformLightingContrast,
  transformResampleJpeg,
  STABLE_TRANSFORM_IDS,
} from "./capture-transforms.js";
import { sha256Hex } from "./evidence.js";

const BLANK_WHITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" width="370" height="370"><rect width="37" height="37" fill="#ffffff"/></svg>`;

export interface MobileFixtureManifestItem {
  filename: string;
  payloadId: string;
  payloadSha256: string;
  expectedBytesHex: string;
  transformId: string;
  imageSha256: string;
  expectedResult: "SUCCESS" | "NO_BARCODE";
}

export async function generateMobileFixtures(
  outputDir: string,
): Promise<MobileFixtureManifestItem[]> {
  mkdirSync(outputDir, { recursive: true });

  const manifest: MobileFixtureManifestItem[] = [];

  const addFixture = (
    filename: string,
    buffer: Uint8Array,
    payloadId: string,
    payloadBytes: Uint8Array | null,
    transformId: string,
  ) => {
    const filePath = resolve(outputDir, filename);
    writeFileSync(filePath, buffer);

    const imageSha256 = sha256Hex(buffer);
    const expectedResult = payloadBytes ? "SUCCESS" : "NO_BARCODE";
    const payloadSha256 = payloadBytes ? sha256Hex(payloadBytes) : "";
    const expectedBytesHex = payloadBytes
      ? Array.from(payloadBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      : "";

    manifest.push({
      filename,
      payloadId,
      payloadSha256,
      expectedBytesHex,
      transformId,
      imageSha256,
      expectedResult,
    });
  };

  // 1. Pristine A
  const pristineA = generatePristineRaster(FIXTURES.A);
  addFixture("pristine_A.png", pristineA.png, "A", FIXTURES.A, "PRISTINE");

  // 2. Pristine B
  const pristineB = generatePristineRaster(FIXTURES.B);
  addFixture("pristine_B.png", pristineB.png, "B", FIXTURES.B, "PRISTINE");

  // 3. Pristine C
  const pristineC = generatePristineRaster(FIXTURES.C);
  addFixture("pristine_C.png", pristineC.png, "C", FIXTURES.C, "PRISTINE");

  // 4. Pristine E
  const pristineE = generatePristineRaster(FIXTURES.E);
  addFixture("pristine_E.png", pristineE.png, "E", FIXTURES.E, "PRISTINE");

  // 5. Negative: blank white non-QR
  const resvgBlank = new Resvg(BLANK_WHITE_SVG, {
    fitTo: { mode: "width", value: 370 },
  }).render();
  const blankPng = new Uint8Array(resvgBlank.asPng());
  addFixture("negative_blank.png", blankPng, "BLANK", null, "BLANK_WHITE");

  // 6. B + SCALE_4PX
  const bScale4 = await transformScale(pristineB.png, 148);
  addFixture(
    "b_scale_4px.png",
    bScale4.buffer,
    "B",
    FIXTURES.B,
    STABLE_TRANSFORM_IDS.SCALE_4PX,
  );

  // 7. B + ROT_POS15
  const bRot15 = await transformRotation(pristineB.png, 15);
  addFixture(
    "b_rot_pos15.png",
    bRot15.buffer,
    "B",
    FIXTURES.B,
    STABLE_TRANSFORM_IDS.ROT_POS15,
  );

  // 8. B + PERSPECTIVE_BASELINE
  const bPersp = await transformPerspectiveBaseline(pristineB);
  addFixture(
    "b_perspective_baseline.png",
    bPersp.buffer,
    "B",
    FIXTURES.B,
    STABLE_TRANSFORM_IDS.PERSPECTIVE_BASELINE,
  );

  // 9. B + BLUR_SIGMA_1_2
  const bBlur = await transformBlur(pristineB.png, 1.2);
  addFixture(
    "b_blur_sigma_1_2.png",
    bBlur.buffer,
    "B",
    FIXTURES.B,
    STABLE_TRANSFORM_IDS.BLUR_SIGMA_1_2,
  );

  // 10. B + LOW_CONTRAST_0_65_B45
  const bContrast = await transformLightingContrast(
    pristineB,
    "LOW_CONTRAST_0_65_B45",
  );
  addFixture(
    "b_low_contrast_0_65_b45.png",
    bContrast.buffer,
    "B",
    FIXTURES.B,
    STABLE_TRANSFORM_IDS.LOW_CONTRAST_0_65_B45,
  );

  // 11. B + RESAMPLE_JPEG_Q65
  const bJpeg = await transformResampleJpeg(pristineB.png);
  addFixture(
    "b_resample_jpeg_q65.jpg",
    bJpeg.buffer,
    "B",
    FIXTURES.B,
    STABLE_TRANSFORM_IDS.RESAMPLE_JPEG_Q65,
  );

  writeFileSync(
    resolve(outputDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  return manifest;
}

// CLI entry point
if (process.argv[1]?.endsWith("generate-mobile-fixtures.ts")) {
  const targetDir =
    process.argv[2] ||
    resolve(
      process.cwd(),
      "tools/zqe/mobile/android/app/src/androidTest/assets",
    );
  console.log(`Generating mobile fixtures to ${targetDir}...`);
  generateMobileFixtures(targetDir).then((manifest) => {
    console.log(`Generated ${manifest.length} mobile fixtures.`);
  });
}
