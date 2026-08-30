import type { QrMask, QrSymbol } from "../../src/index.js";

export interface StrictVerifierResult {
  readonly pass: boolean;
  readonly errors: readonly string[];
  readonly recoveredCodewords: Uint8Array;
  readonly decodedMask: QrMask;
  readonly penaltyScores: readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
}

// GF(256) independent helper for RS verification in verifier
function verifierGfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ (((z >>> 7) & 1) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function verifierRsGenerator(degree: number): Uint8Array {
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = verifierGfMultiply(result[j], root);
      if (j + 1 < degree) {
        result[j] ^= result[j + 1];
      }
    }
    root = verifierGfMultiply(root, 0x02);
  }
  return result;
}

function verifierRsRemainder(
  data: Uint8Array,
  divisor: Uint8Array,
): Uint8Array {
  const result = new Uint8Array(divisor.length);
  for (const byte of data) {
    const factor = byte ^ result[0];
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= verifierGfMultiply(divisor[i], factor);
    }
  }
  return result;
}

function verifierMaskMatches(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return false;
  }
}

function verifierFinderLikeCount(h: readonly number[]): number {
  const n = h[1];
  const core =
    n > 0 && h[2] === n && h[4] === n && h[5] === n && h[3] === 3 * n;
  let cnt = 0;
  if (core && h[0] >= 4 * n && h[6] >= n) cnt++;
  if (core && h[6] >= 4 * n && h[0] >= n) cnt++;
  return cnt;
}

function verifierComputePenalty(grid: boolean[][]): number {
  const size = 29;
  let N1 = 0;
  let N2 = 0;
  let N3 = 0;
  let N4 = 0;

  // Rule 1: Rows & Cols
  for (let y = 0; y < size; y++) {
    let runColor = grid[y][0];
    let runLen = 1;
    for (let x = 1; x < size; x++) {
      if (grid[y][x] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) N1 += 3 + (runLen - 5);
        runColor = grid[y][x];
        runLen = 1;
      }
    }
    if (runLen >= 5) N1 += 3 + (runLen - 5);
  }

  for (let x = 0; x < size; x++) {
    let runColor = grid[0][x];
    let runLen = 1;
    for (let y = 1; y < size; y++) {
      if (grid[y][x] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) N1 += 3 + (runLen - 5);
        runColor = grid[y][x];
        runLen = 1;
      }
    }
    if (runLen >= 5) N1 += 3 + (runLen - 5);
  }

  // Rule 2: 2x2 blocks
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = grid[y][x];
      if (
        grid[y][x + 1] === c &&
        grid[y + 1][x] === c &&
        grid[y + 1][x + 1] === c
      ) {
        N2 += 3;
      }
    }
  }

  // Rule 3: 1:1:3:1:1 pattern with edge light borders (AMS-ZQE-M03-CR01)
  for (let y = 0; y < size; y++) {
    const h = [0, 0, 0, 0, 0, 0, 0];
    let cur = false;
    let runLen = 0;
    for (let x = 0; x < size; x++) {
      if (grid[y][x] === cur) {
        runLen++;
      } else {
        if (h.every((v) => v === 0)) {
          runLen += size;
        }
        h.unshift(runLen);
        h.pop();
        cur = grid[y][x];
        runLen = 1;
        if (cur) N3 += verifierFinderLikeCount(h) * 40;
      }
    }
    h.unshift(runLen);
    h.pop();
    if (cur) {
      h.unshift(size);
      h.pop();
      N3 += verifierFinderLikeCount(h) * 40;
    } else {
      h[0] += size;
      N3 += verifierFinderLikeCount(h) * 40;
    }
  }

  for (let x = 0; x < size; x++) {
    const h = [0, 0, 0, 0, 0, 0, 0];
    let cur = false;
    let runLen = 0;
    for (let y = 0; y < size; y++) {
      if (grid[y][x] === cur) {
        runLen++;
      } else {
        if (h.every((v) => v === 0)) {
          runLen += size;
        }
        h.unshift(runLen);
        h.pop();
        cur = grid[y][x];
        runLen = 1;
        if (cur) N3 += verifierFinderLikeCount(h) * 40;
      }
    }
    h.unshift(runLen);
    h.pop();
    if (cur) {
      h.unshift(size);
      h.pop();
      N3 += verifierFinderLikeCount(h) * 40;
    } else {
      h[0] += size;
      N3 += verifierFinderLikeCount(h) * 40;
    }
  }

  // Rule 4: Balance
  let dark = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) dark++;
    }
  }
  const T = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - T * 10) / T) - 1;
  N4 = Math.max(0, k) * 10;

  return N1 + N2 + N3 + N4;
}

export function strictVerifyQrSymbol(symbol: QrSymbol): StrictVerifierResult {
  const errors: string[] = [];

  // 1. Metadata check
  if (symbol.model !== "QR_MODEL_2")
    errors.push(`Model mismatch: ${symbol.model}`);
  if (symbol.version !== 3) errors.push(`Version mismatch: ${symbol.version}`);
  if (symbol.size !== 29) errors.push(`Size mismatch: ${symbol.size}`);
  if (symbol.errorCorrection !== "M")
    errors.push(`ECC mismatch: ${symbol.errorCorrection}`);
  if (symbol.mask < 0 || symbol.mask > 7)
    errors.push(`Invalid mask: ${symbol.mask}`);

  const size = 29;
  const grid: boolean[][] = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => symbol.getModule(x, y)),
  );
  const isFunc: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  // 2. Build independent function map & check fixed function modules
  // Finders + separators first
  const finders = [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ];
  for (const [cx, cy] of finders) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          isFunc[y][x] = true;
          const r = Math.max(Math.abs(dx), Math.abs(dy));
          const expected = r !== 2 && r !== 4;
          if (grid[y][x] !== expected) {
            errors.push(`Finder mismatch at (${x},${y})`);
          }
        }
      }
    }
  }

  // Timing (check only non-finder modules, i.e. 8..20)
  for (let i = 0; i < size; i++) {
    if (!isFunc[i][6]) {
      isFunc[i][6] = true;
      if (grid[i][6] !== (i % 2 === 0))
        errors.push(`Timing col 6 mismatch at y=${i}`);
    }
    if (!isFunc[6][i]) {
      isFunc[6][i] = true;
      if (grid[6][i] !== (i % 2 === 0))
        errors.push(`Timing row 6 mismatch at x=${i}`);
    }
  }

  // Alignment at (22, 22)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const x = 22 + dx;
      const y = 22 + dy;
      isFunc[y][x] = true;
      const expected = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;
      if (grid[y][x] !== expected) {
        errors.push(`Alignment mismatch at (${x},${y})`);
      }
    }
  }

  // Format reservations
  for (let i = 0; i <= 5; i++) isFunc[i][8] = true;
  isFunc[7][8] = true;
  isFunc[8][8] = true;
  isFunc[8][7] = true;
  for (let i = 9; i < 15; i++) isFunc[8][14 - i] = true;
  for (let i = 0; i < 8; i++) isFunc[8][size - 1 - i] = true;
  for (let i = 8; i < 15; i++) isFunc[size - 15 + i][8] = true;

  // Permanent dark module at (8, 21)
  isFunc[size - 8][8] = true;
  if (!grid[size - 8][8]) {
    errors.push("Permanent dark module at (8,21) is light");
  }

  // 3. Decode Format Information
  // Extract Copy 1 format bits
  const c1Bits: boolean[] = [];
  for (let i = 0; i <= 5; i++) c1Bits.push(grid[i][8]);
  c1Bits.push(grid[7][8]);
  c1Bits.push(grid[8][8]);
  c1Bits.push(grid[8][7]);
  for (let i = 9; i < 15; i++) c1Bits.push(grid[8][14 - i]);

  let format1Val = 0;
  for (let i = 0; i < 15; i++) {
    if (c1Bits[i]) format1Val |= 1 << i;
  }

  // Extract Copy 2 format bits
  const c2Bits: boolean[] = [];
  for (let i = 0; i < 8; i++) c2Bits.push(grid[8][size - 1 - i]);
  for (let i = 8; i < 15; i++) c2Bits.push(grid[size - 15 + i][8]);

  let format2Val = 0;
  for (let i = 0; i < 15; i++) {
    if (c2Bits[i]) format2Val |= 1 << i;
  }

  if (format1Val !== format2Val) {
    errors.push(
      `Format copies mismatch: copy1=${format1Val.toString(16)}, copy2=${format2Val.toString(16)}`,
    );
  }

  const rawFmt = format1Val ^ 0x5412;
  let rem = rawFmt;
  for (let i = 14; i >= 10; i--) {
    if ((rem >>> i) & 1) {
      rem ^= 0x537 << (i - 10);
    }
  }
  if (rem !== 0) {
    errors.push(`Format BCH remainder non-zero: ${rem}`);
  }

  const fmtData = rawFmt >>> 10;
  const decodedEccBits = (fmtData >>> 3) & 0b11;
  const decodedMaskVal = (fmtData & 0b111) as QrMask;

  if (decodedEccBits !== 0b00) {
    errors.push(
      `Format decoded ECC bits mismatch: expected 0 (ECC M), got ${decodedEccBits}`,
    );
  }
  if (decodedMaskVal !== symbol.mask) {
    errors.push(
      `Format decoded mask mismatch: expected ${symbol.mask}, got ${decodedMaskVal}`,
    );
  }

  // 4. Data Extraction & Unmasking
  const dataCells: boolean[] = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let vert = 0; vert < size; vert++) {
      const y = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (isFunc[y][x]) continue;

        const modVal = grid[y][x];
        const maskBit = verifierMaskMatches(symbol.mask, x, y);
        const unmaskedVal = modVal !== maskBit;
        dataCells.push(unmaskedVal);
      }
    }
  }

  if (dataCells.length !== 567) {
    errors.push(
      `Data cell count mismatch: expected 567, got ${dataCells.length}`,
    );
  }

  // Remainder bits check (last 7 data cells must be light unmasked)
  const remainderBits = dataCells.slice(560);
  if (remainderBits.some((b) => b)) {
    errors.push("Non-zero remainder bits found in unmasked stream");
  }

  // Recover 70 codewords
  const recoveredCodewords = new Uint8Array(70);
  for (let i = 0; i < 560; i++) {
    if (dataCells[i]) {
      recoveredCodewords[i >> 3] |= 1 << (7 - (i & 7));
    }
  }

  // 5. RS Parity Verification
  const generator = verifierRsGenerator(26);
  const parityRem = verifierRsRemainder(recoveredCodewords, generator);
  if (parityRem.some((b) => b !== 0)) {
    errors.push("Reed-Solomon parity check failed over recovered 70 codewords");
  }

  // 6. Independent Mask Optimality Recomputation
  // Build unmasked candidate grid with reserved format cells light
  const candidateGrid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      candidateGrid[y][x] = grid[y][x];
    }
  }

  // Unmask data cells in candidateGrid
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let vert = 0; vert < size; vert++) {
      const y = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (isFunc[y][x]) continue;
        const maskBit = verifierMaskMatches(symbol.mask, x, y);
        candidateGrid[y][x] = grid[y][x] !== maskBit;
      }
    }
  }

  // Set reserved format cells in candidateGrid to light (false)
  for (let i = 0; i <= 5; i++) candidateGrid[i][8] = false;
  candidateGrid[7][8] = false;
  candidateGrid[8][8] = false;
  candidateGrid[8][7] = false;
  for (let i = 9; i < 15; i++) candidateGrid[8][14 - i] = false;
  for (let i = 0; i < 8; i++) candidateGrid[8][size - 1 - i] = false;
  for (let i = 8; i < 15; i++) candidateGrid[size - 15 + i][8] = false;

  const penaltyScores: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ] = [0, 0, 0, 0, 0, 0, 0, 0];
  let minPenalty = Number.POSITIVE_INFINITY;
  let bestMask: QrMask = 0;

  for (let mask = 0; mask < 8; mask++) {
    // Apply candidate mask to data cells only
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      const upward = ((right + 1) & 2) === 0;
      for (let vert = 0; vert < size; vert++) {
        const y = upward ? size - 1 - vert : vert;
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          if (isFunc[y][x]) continue;
          if (verifierMaskMatches(mask, x, y)) {
            candidateGrid[y][x] = !candidateGrid[y][x];
          }
        }
      }
    }

    const score = verifierComputePenalty(candidateGrid);
    penaltyScores[mask] = score;

    if (score < minPenalty) {
      minPenalty = score;
      bestMask = mask as QrMask;
    }

    // Undo candidate mask
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      const upward = ((right + 1) & 2) === 0;
      for (let vert = 0; vert < size; vert++) {
        const y = upward ? size - 1 - vert : vert;
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          if (isFunc[y][x]) continue;
          if (verifierMaskMatches(mask, x, y)) {
            candidateGrid[y][x] = !candidateGrid[y][x];
          }
        }
      }
    }
  }

  if (bestMask !== symbol.mask) {
    errors.push(
      `Mask optimality mismatch: expected mask ${bestMask} (penalty ${minPenalty}), symbol has mask ${symbol.mask} (penalty ${penaltyScores[symbol.mask]})`,
    );
  }

  return {
    pass: errors.length === 0,
    errors,
    recoveredCodewords,
    decodedMask: decodedMaskVal,
    penaltyScores,
  };
}
