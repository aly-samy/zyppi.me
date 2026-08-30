import type { QrMask, WorkingMatrix } from "./types.js";

export function maskMatches(mask: QrMask, x: number, y: number): boolean {
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
  }
}

export function applyMask(m: WorkingMatrix, mask: QrMask): void {
  for (let y = 0; y < m.size; y++) {
    for (let x = 0; x < m.size; x++) {
      if (!m.isFunction[y][x] && maskMatches(mask, x, y)) {
        m.modules[y][x] = !m.modules[y][x];
      }
    }
  }
}

function finderLikeCountNayuki(h: readonly number[]): number {
  const n = h[1];
  const core =
    n > 0 && h[2] === n && h[3] === 3 * n && h[4] === n && h[5] === n;
  let count = 0;
  if (core && h[0] >= 4 * n && h[6] >= n) count++;
  if (core && h[6] >= 4 * n && h[0] >= n) count++;
  return count;
}

export function computePenaltyScore(
  modules: readonly (readonly boolean[])[],
): number {
  const size = modules.length;
  let N1 = 0;
  let N2 = 0;
  let N3 = 0;
  let N4 = 0;

  // Rule 1: Long same-color runs in rows and columns
  for (let y = 0; y < size; y++) {
    let runColor = modules[y][0];
    let runLen = 1;
    for (let x = 1; x < size; x++) {
      if (modules[y][x] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) {
          N1 += 3 + (runLen - 5);
        }
        runColor = modules[y][x];
        runLen = 1;
      }
    }
    if (runLen >= 5) {
      N1 += 3 + (runLen - 5);
    }
  }

  for (let x = 0; x < size; x++) {
    let runColor = modules[0][x];
    let runLen = 1;
    for (let y = 1; y < size; y++) {
      if (modules[y][x] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) {
          N1 += 3 + (runLen - 5);
        }
        runColor = modules[y][x];
        runLen = 1;
      }
    }
    if (runLen >= 5) {
      N1 += 3 + (runLen - 5);
    }
  }

  // Rule 2: 2x2 blocks of same color
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x];
      if (
        modules[y][x + 1] === color &&
        modules[y + 1][x] === color &&
        modules[y + 1][x + 1] === color
      ) {
        N2 += 3;
      }
    }
  }

  // Rule 3: 1:1:3:1:1 pattern with edge light borders (AMS-ZQE-M03-CR01)
  for (let y = 0; y < size; y++) {
    const runHistory = [0, 0, 0, 0, 0, 0, 0];
    let color = false;
    let runLen = 0;

    for (let x = 0; x < size; x++) {
      if (modules[y][x] === color) {
        runLen++;
      } else {
        if (runHistory.every((v) => v === 0)) {
          runLen += size; // Add initial light border
        }
        runHistory.unshift(runLen);
        runHistory.pop();
        color = modules[y][x];
        runLen = 1;
        if (color) {
          N3 += finderLikeCountNayuki(runHistory) * 40;
        }
      }
    }
    runHistory.unshift(runLen);
    runHistory.pop();
    if (color) {
      runHistory.unshift(size);
      runHistory.pop();
      N3 += finderLikeCountNayuki(runHistory) * 40;
    } else {
      runHistory[0] += size;
      N3 += finderLikeCountNayuki(runHistory) * 40;
    }
  }

  for (let x = 0; x < size; x++) {
    const runHistory = [0, 0, 0, 0, 0, 0, 0];
    let color = false;
    let runLen = 0;

    for (let y = 0; y < size; y++) {
      if (modules[y][x] === color) {
        runLen++;
      } else {
        if (runHistory.every((v) => v === 0)) {
          runLen += size; // Add initial light border
        }
        runHistory.unshift(runLen);
        runHistory.pop();
        color = modules[y][x];
        runLen = 1;
        if (color) {
          N3 += finderLikeCountNayuki(runHistory) * 40;
        }
      }
    }
    runHistory.unshift(runLen);
    runHistory.pop();
    if (color) {
      runHistory.unshift(size);
      runHistory.pop();
      N3 += finderLikeCountNayuki(runHistory) * 40;
    } else {
      runHistory[0] += size;
      N3 += finderLikeCountNayuki(runHistory) * 40;
    }
  }

  // Rule 4: Proportion of dark modules
  let darkCount = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) {
        darkCount++;
      }
    }
  }
  const T = size * size; // 841
  const k = Math.ceil(Math.abs(darkCount * 20 - T * 10) / T) - 1;
  N4 = Math.max(0, k) * 10;

  return N1 + N2 + N3 + N4;
}

export function evaluateMasks(m: WorkingMatrix): {
  bestMask: QrMask;
  scores: [number, number, number, number, number, number, number, number];
} {
  const scores: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ] = [0, 0, 0, 0, 0, 0, 0, 0];
  let bestMask: QrMask = 0;
  let minScore = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask++) {
    const qMask = mask as QrMask;
    applyMask(m, qMask);
    const score = computePenaltyScore(m.modules);
    scores[mask] = score;

    if (score < minScore) {
      minScore = score;
      bestMask = qMask;
    }

    applyMask(m, qMask); // undo mask
  }

  return { bestMask, scores };
}
