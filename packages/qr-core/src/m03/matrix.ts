import type { QrMask, QrSymbol, WorkingMatrix } from "./types.js";

export function createWorkingMatrix(size: number = 29): WorkingMatrix {
  return {
    size,
    modules: Array.from({ length: size }, () => Array(size).fill(false)),
    isFunction: Array.from({ length: size }, () => Array(size).fill(false)),
  };
}

export function finalizeSymbol(m: WorkingMatrix, mask: QrMask): QrSymbol {
  const snapshot = m.modules.map((row) => row.slice());
  const size = m.size;

  return {
    model: "QR_MODEL_2",
    version: 3,
    size: 29,
    errorCorrection: "M",
    mask,
    getModule(x: number, y: number): boolean {
      if (
        !Number.isInteger(x) ||
        !Number.isInteger(y) ||
        x < 0 ||
        y < 0 ||
        x >= size ||
        y >= size
      ) {
        return false;
      }
      return snapshot[y][x];
    },
  };
}
