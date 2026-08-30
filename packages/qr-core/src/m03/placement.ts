import { createInternalInvariantError } from "../m02/errors.js";
import type { WorkingMatrix } from "./types.js";

export function placeDataBits(m: WorkingMatrix, codewords: Uint8Array): void {
  if (codewords.length !== 70) {
    throw createInternalInvariantError(
      `Data placement expected exactly 70 codewords, got ${codewords.length}`,
      "data_placement",
    );
  }

  const totalCodewordBits = codewords.length * 8; // 560
  let bitIndex = 0;
  let nonFunctionCells = 0;

  for (let right = m.size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5;
    }

    const upward = ((right + 1) & 2) === 0;

    for (let vert = 0; vert < m.size; vert++) {
      const y = upward ? m.size - 1 - vert : vert;

      for (let j = 0; j < 2; j++) {
        const x = right - j;

        if (m.isFunction[y][x]) {
          continue;
        }

        nonFunctionCells++;

        if (bitIndex < totalCodewordBits) {
          const byte = codewords[bitIndex >>> 3];
          const bit = ((byte >>> (7 - (bitIndex & 7))) & 1) !== 0;
          m.modules[y][x] = bit;
          bitIndex++;
        } else {
          // 7 remainder bits - light before candidate masking
          m.modules[y][x] = false;
        }
      }
    }
  }

  if (bitIndex !== totalCodewordBits) {
    throw createInternalInvariantError(
      `Data placement consumed ${bitIndex} bits; expected ${totalCodewordBits}`,
      "data_placement",
    );
  }

  if (nonFunctionCells !== 567) {
    throw createInternalInvariantError(
      `Data placement visited ${nonFunctionCells} non-function cells; expected 567`,
      "data_placement",
    );
  }
}
