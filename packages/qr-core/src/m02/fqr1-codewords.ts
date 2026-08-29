import { buildFqrDataCodewords } from "./bitstream.js";

import { createCapacityError, createInternalInvariantError } from "./errors.js";
import { rsGenerator, rsRemainder } from "./reed-solomon.js";

/**
 * Constructs the complete 70-codeword FQR-1 stream from raw input bytes.
 *
 * Mechanics:
 * 1. Takes defensive ownership copy of input.
 * 2. Rejects inputs > 42 bytes with QR_CAPACITY_EXCEEDED.
 * 3. Builds 44 data codewords (Byte mode, indicator 0100, length 8 bits, payload,
 *    terminator, zero pad, EC 11 alternating capacity pad).
 * 4. Computes 26 ECC codewords via Reed-Solomon GF(256) degree 26 generator.
 * 5. Returns a 70-byte Uint8Array (44 data codewords followed by 26 ECC codewords).
 */
export function buildFqr1CodewordStream(input: Uint8Array): Uint8Array {
  // Defensive input ownership copy
  const ownedInput = new Uint8Array(input);

  if (ownedInput.length > 42) {
    throw createCapacityError(ownedInput.length);
  }

  const dataCodewords = buildFqrDataCodewords(ownedInput);

  if (dataCodewords.length !== 44) {
    throw createInternalInvariantError(
      `Expected 44 data codewords, got ${dataCodewords.length}`,
      "data_encoding",
    );
  }

  const generator = rsGenerator(26);
  const eccCodewords = rsRemainder(dataCodewords, generator);

  if (eccCodewords.length !== 26) {
    throw createInternalInvariantError(
      `Expected 26 ECC codewords, got ${eccCodewords.length}`,
      "ecc_generation",
    );
  }

  const stream = new Uint8Array(70);
  stream.set(dataCodewords, 0);
  stream.set(eccCodewords, 44);

  return stream;
}
