import { QrSymbol, ZqeError } from "@zyppi/qr-core";

function createRenderInvalidSymbolError(reason: string): ZqeError {
  return new ZqeError({
    code: "QR_RENDER_INVALID_SYMBOL",
    reason,
    stage: "rendering",
    reference: "ZQE-001 / Canonical SVG renderer contract",
    recovery:
      "Provide a valid immutable FQR-1 QrSymbol produced by @zyppi/qr-core.",
  });
}

function validateQrSymbolInput(symbol: unknown): QrSymbol {
  if (typeof symbol !== "object" || symbol === null) {
    throw createRenderInvalidSymbolError(
      "Input symbol must be a non-null object.",
    );
  }

  const s = symbol as Record<string, unknown>;

  if (s.model !== "QR_MODEL_2") {
    throw createRenderInvalidSymbolError(
      `Invalid QrSymbol model '${String(s.model)}'; expected 'QR_MODEL_2'.`,
    );
  }

  if (s.version !== 3) {
    throw createRenderInvalidSymbolError(
      `Invalid QrSymbol version '${String(s.version)}'; expected 3.`,
    );
  }

  if (s.size !== 29) {
    throw createRenderInvalidSymbolError(
      `Invalid QrSymbol size '${String(s.size)}'; expected 29.`,
    );
  }

  if (s.errorCorrection !== "M") {
    throw createRenderInvalidSymbolError(
      `Invalid QrSymbol errorCorrection '${String(s.errorCorrection)}'; expected 'M'.`,
    );
  }

  if (
    typeof s.mask !== "number" ||
    !Number.isInteger(s.mask) ||
    s.mask < 0 ||
    s.mask > 7
  ) {
    throw createRenderInvalidSymbolError(
      `Invalid QrSymbol mask '${String(s.mask)}'; expected integer in 0..7.`,
    );
  }

  if (typeof s.getModule !== "function") {
    throw createRenderInvalidSymbolError(
      "Invalid QrSymbol getModule; expected function.",
    );
  }

  const getModuleFn = s.getModule as (x: number, y: number) => boolean;

  for (let y = 0; y < 29; y++) {
    for (let x = 0; x < 29; x++) {
      let modVal: unknown;
      try {
        modVal = getModuleFn(x, y);
      } catch (err) {
        throw createRenderInvalidSymbolError(
          `getModule(${x},${y}) threw an error: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      if (typeof modVal !== "boolean") {
        throw createRenderInvalidSymbolError(
          `getModule(${x},${y}) returned non-boolean value of type '${typeof modVal}'.`,
        );
      }
    }
  }

  return s as unknown as QrSymbol;
}

/**
 * Renders a QrSymbol into a canonical, deterministic SVG string.
 *
 * Output format:
 * - viewBox="0 0 37 37" (29 + 4 quiet zone each side)
 * - shape-rendering="crispEdges"
 * - explicit white background rect x="0" y="0" width="37" height="37" fill="#fff"
 * - group fill="#000" containing dark module rects with 4-module offset
 * - row-major iteration (y = 0..28, x = 0..28)
 * - single line, no trailing newline, no extra whitespace
 */
export function renderQrSvg(symbol: QrSymbol): string {
  const validSymbol = validateQrSymbolInput(symbol);

  let darkRects = "";

  for (let y = 0; y < 29; y++) {
    for (let x = 0; x < 29; x++) {
      if (validSymbol.getModule(x, y)) {
        darkRects += `<rect x="${x + 4}" y="${y + 4}" width="1" height="1"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges"><rect x="0" y="0" width="37" height="37" fill="#fff"/><g fill="#000">${darkRects}</g></svg>`;
}
