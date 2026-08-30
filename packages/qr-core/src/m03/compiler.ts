import { buildFqr1CodewordStream } from "../m02/fqr1-codewords.js";
import {
  createCapacityError,
  createInvalidInputError,
  createUnsupportedProfileError,
} from "../m02/errors.js";
import { drawFormatBits } from "./format.js";
import { applyMask, evaluateMasks } from "./mask.js";
import { createWorkingMatrix, finalizeSymbol } from "./matrix.js";
import { drawFunctionPatterns } from "./patterns.js";
import { placeDataBits } from "./placement.js";
import type { QrSymbol, ZqeProfileId } from "./types.js";

export function compileQr(data: Uint8Array, profile: ZqeProfileId): QrSymbol {
  if (profile !== "zqe/fqr1") {
    throw createUnsupportedProfileError(profile);
  }

  if (!(data instanceof Uint8Array)) {
    throw createInvalidInputError("Input data must be a Uint8Array instance.");
  }

  if (data.length > 42) {
    throw createCapacityError(data.length);
  }

  const codewords = buildFqr1CodewordStream(data);
  const m = createWorkingMatrix(29);

  drawFunctionPatterns(m);
  placeDataBits(m, codewords);

  const { bestMask } = evaluateMasks(m);

  applyMask(m, bestMask);
  drawFormatBits(m, bestMask);

  return finalizeSymbol(m, bestMask);
}
