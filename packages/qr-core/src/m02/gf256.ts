import { createInternalInvariantError } from "./errors.js";

/**
 * GF(256) multiplication with modulus polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11D).
 * Fails closed if operands are outside 0..255 or non-integers.
 */
export function gfMultiply(x: number, y: number): number {
  if (
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    x > 255 ||
    y < 0 ||
    y > 255
  ) {
    throw createInternalInvariantError(
      `GF(256) operands must be integers in 0..255. Got x=${x}, y=${y}`,
      "ecc_generation",
    );
  }

  let z = 0;

  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ (((z >>> 7) & 1) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }

  return z & 0xff;
}
