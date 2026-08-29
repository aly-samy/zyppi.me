import { createInternalInvariantError } from "./errors.js";
import { gfMultiply } from "./gf256.js";

/**
 * Constructs a Reed-Solomon generator polynomial for a given degree d:
 * g(x) = Π(i=0..d-1) (x - α^i) where α = 2 in GF(256) with modulus 0x11D.
 */
export function rsGenerator(degree: number): Uint8Array {
  if (degree < 1 || degree > 255 || !Number.isInteger(degree)) {
    throw createInternalInvariantError(
      `Invalid RS generator degree: ${degree}`,
      "ecc_generation",
    );
  }

  const result = new Uint8Array(degree);
  result[degree - 1] = 1;

  let root = 1;

  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) {
        result[j] ^= result[j + 1];
      }
    }
    root = gfMultiply(root, 0x02);
  }

  return result;
}

/**
 * Computes the Reed-Solomon ECC remainder for FQR-1.
 * Expects exactly 44 data codewords and a degree-26 divisor generator polynomial,
 * producing 26 ECC codewords.
 */
export function rsRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
  if (data.length !== 44) {
    throw createInternalInvariantError(
      `RS remainder expected data length 44, got ${data.length}`,
      "ecc_generation",
    );
  }
  if (divisor.length !== 26) {
    throw createInternalInvariantError(
      `RS remainder expected divisor degree 26, got ${divisor.length}`,
      "ecc_generation",
    );
  }

  const result = new Uint8Array(divisor.length);

  for (let k = 0; k < data.length; k++) {
    const byte = data[k];
    const factor = byte ^ result[0];

    result.copyWithin(0, 1);
    result[result.length - 1] = 0;

    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= gfMultiply(divisor[i], factor);
    }
  }

  return result;
}
