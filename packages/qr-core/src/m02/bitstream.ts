import { createCapacityError, createInternalInvariantError } from "./errors.js";

export class BitBuffer {
  private readonly bits: number[] = [];

  get length(): number {
    return this.bits.length;
  }

  append(value: number, bitCount: number): void {
    if (bitCount < 0 || !Number.isInteger(bitCount)) {
      throw createInternalInvariantError(
        `Invalid bit count: ${bitCount}`,
        "data_encoding",
      );
    }
    if (bitCount === 0) return;

    if (value < 0 || value >= 2 ** bitCount || !Number.isInteger(value)) {
      throw createInternalInvariantError(
        `Value ${value} cannot fit in ${bitCount} bits`,
        "data_encoding",
      );
    }

    for (let i = bitCount - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  }

  appendByte(value: number): void {
    this.append(value, 8);
  }

  toArray(): readonly number[] {
    return this.bits.slice();
  }
}

export function buildFqrDataCodewords(data: Uint8Array): Uint8Array {
  if (data.length > 42) {
    throw createCapacityError(data.length);
  }

  const capacityBits = 44 * 8; // 352
  const bb = new BitBuffer();

  // 1. Mode indicator: 0100 (Byte mode)
  bb.append(0b0100, 4);

  // 2. Character count width for V3 Byte mode: 8 bits
  bb.append(data.length, 8);

  // 3. Payload bytes MSB-first
  for (let i = 0; i < data.length; i++) {
    bb.appendByte(data[i]);
  }

  // 4. Terminator bits: min(4, remaining capacity bits) zero bits
  const remainingAfterPayload = capacityBits - bb.length;
  const terminatorCount = Math.min(4, remainingAfterPayload);
  bb.append(0, terminatorCount);

  // 5. Byte alignment padding: append zero bits until bit count % 8 === 0
  const padToByteAlignment = (8 - (bb.length % 8)) % 8;
  bb.append(0, padToByteAlignment);

  // 6. Capacity pad codewords: alternating 0xEC, 0x11
  let nextPad = 0xec;
  while (bb.length < capacityBits) {
    bb.appendByte(nextPad);
    nextPad = nextPad === 0xec ? 0x11 : 0xec;
  }

  if (bb.length !== capacityBits) {
    throw createInternalInvariantError(
      `Bitstream bit length ${bb.length} !== capacity ${capacityBits}`,
      "data_encoding",
    );
  }

  const bits = bb.toArray();
  const out = new Uint8Array(44);

  for (let i = 0; i < bits.length; i++) {
    out[i >> 3] |= bits[i] << (7 - (i & 7));
  }

  return out;
}
