import type { WorkingMatrix } from "./types.js";

function setFunction(
  m: WorkingMatrix,
  x: number,
  y: number,
  dark: boolean,
): void {
  m.modules[y][x] = dark;
  m.isFunction[y][x] = true;
}

export function drawFunctionPatterns(m: WorkingMatrix): void {
  const size = m.size;

  // 1. Timing patterns
  for (let i = 0; i < size; i++) {
    setFunction(m, 6, i, i % 2 === 0);
    setFunction(m, i, 6, i % 2 === 0);
  }

  // 2. Finders and separators
  const finders: readonly (readonly [number, number])[] = [
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
          const r = Math.max(Math.abs(dx), Math.abs(dy));
          const dark = r !== 2 && r !== 4;
          setFunction(m, x, y, dark);
        }
      }
    }
  }

  // 3. Alignment pattern (center (22, 22) for V3)
  const ax = 22;
  const ay = 22;

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const x = ax + dx;
      const y = ay + dy;
      const dark = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;
      setFunction(m, x, y, dark);
    }
  }

  // 4. Reserve Format Information cells as function cells (unwritten/light state)
  // First copy format cells
  for (let i = 0; i <= 5; i++) {
    setFunction(m, 8, i, false);
  }
  setFunction(m, 8, 7, false);
  setFunction(m, 8, 8, false);
  setFunction(m, 7, 8, false);
  for (let i = 9; i < 15; i++) {
    setFunction(m, 14 - i, 8, false);
  }

  // Second copy format cells
  for (let i = 0; i < 8; i++) {
    setFunction(m, size - 1 - i, 8, false);
  }
  for (let i = 8; i < 15; i++) {
    setFunction(m, 8, size - 15 + i, false);
  }

  // 5. Permanent dark module at (8, 21)
  setFunction(m, 8, size - 8, true);
}
