import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { compileQr } from "@zyppi/qr-core";
import { renderQrSvg } from "@zyppi/qr-svg";

export const FIXTURES = {
  A: new TextEncoder().encode("HELLO ZYPPI"),
  B: new TextEncoder().encode("https://id.gs1.org/01/09520123456788"),
  C: new TextEncoder().encode("ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001"),
  E: new TextEncoder().encode("ZYPPI-FQR1-INTERIOR-TEST-2026"),
} as const;

export type FixtureKey = keyof typeof FIXTURES;

export const STABLE_TRANSFORM_IDS = {
  SCALE_4PX: "SCALE_4PX",
  SCALE_6PX: "SCALE_6PX",
  SCALE_10PX: "SCALE_10PX",
  ROT_NEG15: "ROT_NEG15",
  ROT_POS15: "ROT_POS15",
  ROT_90: "ROT_90",
  PERSPECTIVE_BASELINE: "PERSPECTIVE_BASELINE",
  BLUR_SIGMA_1_2: "BLUR_SIGMA_1_2",
  LOW_LIGHT_0_70: "LOW_LIGHT_0_70",
  LOW_CONTRAST_0_65_B45: "LOW_CONTRAST_0_65_B45",
  RESAMPLE_JPEG_Q65: "RESAMPLE_JPEG_Q65",
} as const;

export type TransformId = keyof typeof STABLE_TRANSFORM_IDS;

export interface PristineRaster {
  png: Uint8Array;
  width: number;
  height: number;
  pixels: Uint8Array; // RGBA
}

export function generatePristineRaster(payload: Uint8Array): PristineRaster {
  const symbol = compileQr(payload, "zqe/fqr1");
  const svgString = renderQrSvg(symbol);

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
  const pixels = new Uint8Array(rendered.pixels);
  const png = new Uint8Array(rendered.asPng());

  return { png, width, height, pixels };
}

/**
 * Center image of specified target width on a white 512x512 canvas.
 */
export async function transformScale(
  sourcePng: Uint8Array,
  targetWidth: number,
): Promise<{
  buffer: Uint8Array;
  width: number;
  height: number;
  format: "png";
}> {
  const resized = await sharp(sourcePng)
    .resize(targetWidth, targetWidth, { kernel: "lanczos3" })
    .toBuffer();

  const canvasWidth = 512;
  const canvasHeight = 512;
  const left = Math.floor((canvasWidth - targetWidth) / 2);
  const top = Math.floor((canvasHeight - targetWidth) / 2);

  const finalPng = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();

  return {
    buffer: new Uint8Array(finalPng),
    width: canvasWidth,
    height: canvasHeight,
    format: "png",
  };
}

/**
 * Rotate image by specified angle with white background (no QR-content crop).
 */
export async function transformRotation(
  sourcePng: Uint8Array,
  angleDegrees: number,
): Promise<{
  buffer: Uint8Array;
  width: number;
  height: number;
  format: "png";
}> {
  const rotatedBuffer = await sharp(sourcePng)
    .rotate(angleDegrees, { background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const meta = await sharp(rotatedBuffer).metadata();
  return {
    buffer: new Uint8Array(rotatedBuffer),
    width: meta.width || 370,
    height: meta.height || 370,
    format: "png",
  };
}

/**
 * Solve an 8x8 linear equation system Ax = B using Gaussian elimination.
 */
function solve8x8(A: number[][], B: number[]): number[] {
  const n = 8;
  const M: number[][] = A.map((row, i) => [...row, B[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) {
      throw new Error("Matrix is singular in solve8x8");
    }

    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  return M.map((row) => row[n]);
}

/**
 * Projective homography mapping source 370x370 into 512x512 white output frame.
 * Source corners: (0,0), (369,0), (369,369), (0,369)
 * Dest corners: (80,70), (430,100), (400,430), (60,390)
 */
export async function transformPerspectiveBaseline(
  sourceRaster: PristineRaster,
): Promise<{
  buffer: Uint8Array;
  width: number;
  height: number;
  format: "png";
}> {
  const dstWidth = 512;
  const dstHeight = 512;

  // Destination (u, v) -> Source (x, y)
  // u, v mapping to x, y:
  // x = (m00*u + m01*v + m02) / (m20*u + m21*v + 1)
  // y = (m10*u + m11*v + m12) / (m20*u + m21*v + 1)
  const pts: Array<{ u: number; v: number; x: number; y: number }> = [
    { u: 80, v: 70, x: 0, y: 0 },
    { u: 430, v: 100, x: 369, y: 0 },
    { u: 400, v: 430, x: 369, y: 369 },
    { u: 60, v: 390, x: 0, y: 369 },
  ];

  const A: number[][] = [];
  const B: number[] = [];

  for (const p of pts) {
    // m00*u + m01*v + m02 - m20*u*x - m21*v*x = x
    A.push([p.u, p.v, 1, 0, 0, 0, -p.u * p.x, -p.v * p.x]);
    B.push(p.x);

    // m10*u + m11*v + m12 - m20*u*y - m21*v*y = y
    A.push([0, 0, 0, p.u, p.v, 1, -p.u * p.y, -p.v * p.y]);
    B.push(p.y);
  }

  const m = solve8x8(A, B);
  const m00 = m[0],
    m01 = m[1],
    m02 = m[2];
  const m10 = m[3],
    m11 = m[4],
    m12 = m[5];
  const m20 = m[6],
    m21 = m[7];

  const srcPixels = sourceRaster.pixels; // RGBA 370x370
  const srcW = sourceRaster.width;
  const srcH = sourceRaster.height;

  const dstPixels = new Uint8Array(dstWidth * dstHeight * 4);

  for (let v = 0; v < dstHeight; v++) {
    for (let u = 0; u < dstWidth; u++) {
      const denom = m20 * u + m21 * v + 1;
      const x = (m00 * u + m01 * v + m02) / denom;
      const y = (m10 * u + m11 * v + m12) / denom;

      const dstIdx = (v * dstWidth + u) * 4;

      if (x < 0 || x >= srcW - 1 || y < 0 || y >= srcH - 1) {
        dstPixels[dstIdx] = 255;
        dstPixels[dstIdx + 1] = 255;
        dstPixels[dstIdx + 2] = 255;
        dstPixels[dstIdx + 3] = 255;
      } else {
        // Bilinear interpolation
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const x1 = x0 + 1;
        const y1 = y0 + 1;

        const dx = x - x0;
        const dy = y - y0;

        const w00 = (1 - dx) * (1 - dy);
        const w10 = dx * (1 - dy);
        const w01 = (1 - dx) * dy;
        const w11 = dx * dy;

        for (let c = 0; c < 4; c++) {
          const val =
            w00 * srcPixels[(y0 * srcW + x0) * 4 + c] +
            w10 * srcPixels[(y0 * srcW + x1) * 4 + c] +
            w01 * srcPixels[(y1 * srcW + x0) * 4 + c] +
            w11 * srcPixels[(y1 * srcW + x1) * 4 + c];
          dstPixels[dstIdx + c] = Math.round(val);
        }
      }
    }
  }

  const pngBuffer = await sharp(dstPixels, {
    raw: { width: dstWidth, height: dstHeight, channels: 4 },
  })
    .png()
    .toBuffer();

  return {
    buffer: new Uint8Array(pngBuffer),
    width: dstWidth,
    height: dstHeight,
    format: "png",
  };
}

/**
 * Gaussian Blur sigma = 1.2 px
 */
export async function transformBlur(
  sourcePng: Uint8Array,
  sigma = 1.2,
): Promise<{
  buffer: Uint8Array;
  width: number;
  height: number;
  format: "png";
}> {
  const blurred = await sharp(sourcePng).blur(sigma).png().toBuffer();

  return {
    buffer: new Uint8Array(blurred),
    width: 370,
    height: 370,
    format: "png",
  };
}

/**
 * Pixel manipulation for LOW_LIGHT_0_70 and LOW_CONTRAST_0_65_B45
 */
export async function transformLightingContrast(
  sourceRaster: PristineRaster,
  mode: "LOW_LIGHT_0_70" | "LOW_CONTRAST_0_65_B45",
): Promise<{
  buffer: Uint8Array;
  width: number;
  height: number;
  format: "png";
}> {
  const src = sourceRaster.pixels;
  const len = src.length;
  const out = new Uint8Array(len);

  for (let i = 0; i < len; i += 4) {
    if (mode === "LOW_LIGHT_0_70") {
      out[i] = Math.min(255, Math.max(0, Math.round(0.7 * src[i])));
      out[i + 1] = Math.min(255, Math.max(0, Math.round(0.7 * src[i + 1])));
      out[i + 2] = Math.min(255, Math.max(0, Math.round(0.7 * src[i + 2])));
    } else {
      out[i] = Math.min(255, Math.max(0, Math.round(0.65 * src[i] + 45)));
      out[i + 1] = Math.min(
        255,
        Math.max(0, Math.round(0.65 * src[i + 1] + 45)),
      );
      out[i + 2] = Math.min(
        255,
        Math.max(0, Math.round(0.65 * src[i + 2] + 45)),
      );
    }
    out[i + 3] = 255; // Opaque alpha
  }

  const pngBuffer = await sharp(out, {
    raw: {
      width: sourceRaster.width,
      height: sourceRaster.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  return {
    buffer: new Uint8Array(pngBuffer),
    width: sourceRaster.width,
    height: sourceRaster.height,
    format: "png",
  };
}

/**
 * Resampling and JPEG compression baseline:
 * 370x370 -> resize 185x185 Lanczos3 -> resize 370x370 Lanczos3 -> JPEG Q65 4:4:4
 */
export async function transformResampleJpeg(sourcePng: Uint8Array): Promise<{
  buffer: Uint8Array;
  width: number;
  height: number;
  format: "jpeg";
}> {
  const downsized = await sharp(sourcePng)
    .resize(185, 185, { kernel: "lanczos3" })
    .toBuffer();

  const upsized = await sharp(downsized)
    .resize(370, 370, { kernel: "lanczos3" })
    .toBuffer();

  const jpeg = await sharp(upsized)
    .jpeg({
      quality: 65,
      chromaSubsampling: "4:4:4",
      progressive: false,
      mozjpeg: false,
    })
    .toBuffer();

  return {
    buffer: new Uint8Array(jpeg),
    width: 370,
    height: 370,
    format: "jpeg",
  };
}
