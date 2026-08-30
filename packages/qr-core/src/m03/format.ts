import type { QrMask, WorkingMatrix } from "./types.js";

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}

export function computeFormatBits(mask: QrMask): number {
  const data = (0b00 << 3) | mask; // ECC M = 00
  let rem = data;

  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
  }

  return ((data << 10) | rem) ^ 0x5412;
}

export function drawFormatBits(m: WorkingMatrix, mask: QrMask): void {
  const bits = computeFormatBits(mask);
  const size = m.size;

  // First copy around top-left finder
  for (let i = 0; i <= 5; i++) {
    m.modules[i][8] = getBit(bits, i);
    m.isFunction[i][8] = true;
  }

  m.modules[7][8] = getBit(bits, 6);
  m.isFunction[7][8] = true;

  m.modules[8][8] = getBit(bits, 7);
  m.isFunction[8][8] = true;

  m.modules[8][7] = getBit(bits, 8);
  m.isFunction[8][7] = true;

  for (let i = 9; i < 15; i++) {
    m.modules[8][14 - i] = getBit(bits, i);
    m.isFunction[8][14 - i] = true;
  }

  // Second copy (split between top-right and bottom-left finders)
  for (let i = 0; i < 8; i++) {
    m.modules[8][size - 1 - i] = getBit(bits, i);
    m.isFunction[8][size - 1 - i] = true;
  }

  for (let i = 8; i < 15; i++) {
    m.modules[size - 15 + i][8] = getBit(bits, i);
    m.isFunction[size - 15 + i][8] = true;
  }

  // Fixed dark module at (8, 21) -> (x=8, y=21) -> m.modules[21][8]
  m.modules[size - 8][8] = true;
  m.isFunction[size - 8][8] = true;
}
