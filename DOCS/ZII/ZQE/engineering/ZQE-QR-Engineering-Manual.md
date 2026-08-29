# ZQE QR Engineering Manual v0.4

## Clean-Room Implementation Edition — QR Code Model 2 / TypeScript

**Status:** Engineering Companion — Standard-Readiness Corrective
**Purpose:** Implementation guidance for `@zyppi/qr-core` and `@zyppi/qr-svg`
**Primary Target:** FQR-1 — QR Code Model 2, Version 3, ECC M, Byte mode
**Extended Target:** QR Code Model 2, Versions 1–40, ECC L/M/Q/H
**Language:** TypeScript
**Normative Baseline:** ISO/IEC 18004:2024 Edition 4
**Authority:** This manual is not a substitute for ISO/IEC 18004:2024 and does not independently establish legal or normative conformance. It is a clean-room engineering companion built from public technical material and permissively licensed reference implementations.
**Implementation Rule:** If a future requirement conflicts with an authorized ZQE specification or a human normative verification record, the authorized ZQE specification / verified record wins.

---

# 0. What This Manual Guarantees — and What It Does Not

This manual is written so that an engineer can implement the **FQR-1 QR Code Model 2 encoder** without consulting the ISO text.

It provides:

- the complete FQR-1 profile;
- exact bitstream rules for the Byte-mode path;
- exact Version-3-M capacity derivation;
- exact Reed–Solomon field arithmetic;
- exact block construction and interleaving logic;
- exact matrix geometry and function-pattern construction;
- exact data-placement traversal;
- exact mask predicates;
- exact penalty-scoring rules used by the reference implementation strategy;
- exact format-information and version-information BCH mechanics and placement;
- exact `QrSymbol` and renderer boundaries;
- exact quiet-zone behavior;
- deterministic tie-breaking;
- structured error requirements;
- conformance and independent-decoder tests.

It also contains the compact data required to extend the same architecture across **QR Code Model 2 Versions 1–40**.

It does **not** reproduce or replace the copyrighted ISO publication. It does **not** claim that this document alone proves formal ISO certification. Formal conformance claims still require the project's human normative-verification process.

The intended engineering claim is narrower and practical:

> An implementation that follows this manual, passes the strict structural verifier, matches the declared FQR test vectors, and is independently decoded by multiple mature QR readers should generate interoperable QR Code Model 2 symbols.

---

# 1. Source Hierarchy

The manual uses this hierarchy.

## Tier 1 — Normative identity

- ISO/IEC 18004:2024 Edition 4 — governing standard identity.
- Licensed standard — human verification only; not copied into this manual.

## Tier 2 — Symbology-owner public material

- DENSO WAVE QR Code technical pages:
  - Versions 1–40.
  - Symbol sizes 21×21 through 177×177.
  - L/M/Q/H error-correction families.
  - Numeric, alphanumeric, byte/binary and Kanji support.
  - Structured append up to 16 symbols.

## Tier 3 — Mature permissively licensed reference implementations

- Project Nayuki `QR-Code-generator` — MIT License.
- ZXing / ZXing-C++ — Apache 2.0.

Tier 3 is used to make implementation mechanics exact without reproducing ISO text.

## Research-only

Tutorials, blogs, forum posts and AI-generated explanations may be used only to discover questions. They are never the source of a ZQE normative claim.

---

# 2. Classification Labels

Every rule in this manual belongs to one of the following classes.

**[FQR-1 REQUIRED]**
Required for the first Zyppi QR proof.

**[MODEL-2 CORE]**
Required for general QR Code Model 2 encoding.

**[ZQE DECISION]**
A deterministic Zyppi implementation choice where multiple compatible implementations may exist.

**[FUTURE ZQE]**
Not required for FQR-1.

**[VERIFIER ONLY]**
Required in tests/conformance infrastructure, not in production `qr-core`.

---

# 3. FQR-1 Golden Profile

FQR-1 is deliberately fixed.

```text
Symbology        QR Code Model 2
Version          3
Symbol size      29 × 29 modules
ECC              M
Mode             Byte
Data codewords   44
ECC codewords    26
Total codewords  70
Remainder bits   7
Maximum payload  42 bytes
Auto version     PROHIBITED
Auto mode        PROHIBITED
ECC promotion    PROHIBITED
Quiet zone       4 modules, renderer-owned
```

The core engine input is bytes:

```ts
type FqrInput = Readonly<{
  data: Uint8Array;
  profile: "zqe/fqr1";
}>;
```

`qr-core` does not accept a string and guess its character encoding.

Higher layers may provide:

```ts
const bytes = new TextEncoder().encode(text);
```

before calling `qr-core`.

---

# 4. Frozen FQR Fixtures

All FQR string fixtures are ASCII and therefore one byte per character.

| ID  | Payload                                       | Bytes | Expected |
| --- | --------------------------------------------- | ----: | -------- |
| A   | `HELLO ZYPPI`                                 |    11 | ACCEPT   |
| B   | `https://id.gs1.org/01/09520123456788`        |    36 | ACCEPT   |
| C   | `ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001`  |    42 | ACCEPT   |
| D   | `ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001X` |    43 | REJECT   |
| E   | `ZYPPI-FQR1-INTERIOR-TEST-2026`               |    29 | ACCEPT   |

SHA-256 identities:

```text
A bd68ab3476a08c12c26492389e317096619c54a3fb7e61d13e1047ee2502e843
B 6eba966218ef0703cf47ee9079e4a3903bd315c4aa0c1544b5b64954ee5bccbd
C 50c21a65588849150446e953cf26a67ea7a80296ea15b944dbf2803df414eac6
D a6104165e93c8dfb8ed375409a4dc31912c22e68aacfa999b350dbbe2139f93f
E 725860310bdc78b647e494537b54674af8794f04a5965b81dbe178432d88b7f4
```

---

# 5. Package Boundary

The intended dependency shape is:

```text
payload bytes
    │
    ▼
@zyppi/qr-core
    │
    ▼
QrSymbol
    │
    ▼
@zyppi/qr-svg
    │
    ▼
SVG
```

`qr-core` SHALL NOT contain:

- SVG generation;
- Canvas rendering;
- PNG generation;
- HTTP;
- API authentication;
- GS1 parsing;
- URL resolution;
- database access;
- networking;
- Runtime semantics;
- CAW semantics;
- zTOUCH semantics;
- ZPI semantics.

ZQE is API-callable but API-unaware.

---

# 6. Core Type Model

Use separate **color** and **function-role** state.

Do not encode both concepts into one enum.

Recommended internal representation:

```ts
interface WorkingMatrix {
  readonly size: number;
  readonly modules: boolean[][]; // false=light, true=dark
  readonly isFunction: boolean[][]; // true => never data-mask this cell
}
```

Before finalization both arrays are mutable internally.

The public artifact must not expose mutable backing storage.

Recommended public contract:

```ts
export type QrEcc = "L" | "M" | "Q" | "H";

export interface QrSymbol {
  readonly model: "QR_MODEL_2";
  readonly version: number;
  readonly size: number;
  readonly errorCorrection: QrEcc;
  readonly mask: number;
  getModule(x: number, y: number): boolean;
}
```

The implementation may additionally expose a defensive immutable snapshot if desired.

**Invariant:**

> No public consumer receives a mutable reference capable of changing the canonical module matrix.

---

# 7. Version and Capacity Mathematics

## 7.1 Symbol size

For Model 2:

```ts
function sizeForVersion(version: number): number {
  if (version < 1 || version > 40) throw new RangeError();
  return version * 4 + 17;
}
```

Examples:

```text
V1  = 21
V2  = 25
V3  = 29
...
V40 = 177
```

## 7.2 Number of raw data modules

This function counts all non-function modules, including remainder bits.

```ts
function numRawDataModules(version: number): number {
  if (version < 1 || version > 40) throw new RangeError();

  let result = (16 * version + 128) * version + 64;

  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
  }

  if (version >= 7) {
    result -= 36;
  }

  return result;
}
```

## 7.3 Remainder bits

Remainder bits are derivable:

```ts
function remainderBitCount(version: number): number {
  return numRawDataModules(version) & 7;
}
```

For Version 3:

```text
numRawDataModules(3) = 567
567 / 8 = 70 full codewords + 7 remainder bits
```

## 7.4 Data codewords

Let:

```text
rawCodewords      = floor(rawDataModules / 8)
eccPerBlock       = table[ecc][version]
numBlocks         = table[ecc][version]
dataCodewords     = rawCodewords - eccPerBlock * numBlocks
```

For Version 3-M:

```text
rawCodewords  = 70
eccPerBlock   = 26
numBlocks     = 1
dataCodewords = 44
```

## 7.5 Why FQR-1 maximum payload is 42 bytes

Byte mode Version 3 uses:

```text
4 bits   mode indicator
8 bits   byte count
8*N      payload
up to 4  terminator
```

At N = 42:

```text
4 + 8 + 42×8 = 348 bits
capacity = 44×8 = 352 bits
terminator = 4 bits
total = 352 bits
```

So 42 bytes fits exactly.

43 bytes requires:

```text
4 + 8 + 43×8 = 356 bits
```

which exceeds the 352-bit data capacity before termination.

Therefore FQR-1 must reject 43 bytes.

---

# 8. Mode Indicators and Character Count Widths

[FUTURE ZQE] general Model-2 segment support.

| Mode                 | 4-bit indicator | Count bits V1–9 | V10–26 | V27–40 |
| -------------------- | --------------: | --------------: | -----: | -----: |
| Terminator           |          `0000` |               — |      — |      — |
| Numeric              |          `0001` |              10 |     12 |     14 |
| Alphanumeric         |          `0010` |               9 |     11 |     13 |
| Structured Append    |          `0011` |               — |      — |      — |
| Byte                 |          `0100` |               8 |     16 |     16 |
| FNC1 first position  |          `0101` |               — |      — |      — |
| ECI                  |          `0111` |               — |      — |      — |
| Kanji                |          `1000` |               8 |     10 |     12 |
| FNC1 second position |          `1001` |               — |      — |      — |

FQR-1 uses only:

```text
Byte = 0100
character-count bits = 8
```

---

# 9. Byte-Mode Bitstream Construction

[FQR-1 REQUIRED]

Input: owned bytes and fixed profile.

## 9.1 Defensive input ownership

```ts
function ownInput(data: Uint8Array): Uint8Array {
  return new Uint8Array(data);
}
```

This is an owned copy, not "ownership transfer".

## 9.2 Bit writer

A bit writer must append the N low-order bits of a non-negative integer from most significant to least significant.

```ts
class BitBuffer {
  private readonly bits: number[] = [];

  get length(): number {
    return this.bits.length;
  }

  append(value: number, bitCount: number): void {
    if (bitCount < 0) throw new RangeError();
    if (value < 0 || value >= 2 ** bitCount) throw new RangeError();

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
```

For bit counts above normal JS 32-bit bitwise limits, use arithmetic or BigInt rather than blindly using `>>>`.

FQR-1 values are small.

## 9.3 FQR encoding sequence

```text
1. Append mode indicator 0100.
2. Append payload byte count using 8 bits.
3. Append each input byte using 8 bits, MSB first.
4. Append min(4, remainingCapacityBits) zero terminator bits.
5. Append zero bits until bit length is divisible by 8.
6. Append alternating pad codewords EC, 11, EC, 11... until exactly 44 data codewords.
7. Pack bits into bytes, MSB first.
```

## 9.4 Exact algorithm

```ts
function buildFqrDataCodewords(data: Uint8Array): Uint8Array {
  if (data.length > 42) {
    throw zqeError(
      "QR_CAPACITY_EXCEEDED",
      `Input contains ${data.length} bytes; zqe/fqr1 supports at most 42 bytes.`,
      "input_validation",
      "ZQE-001/FQR-CAPACITY",
      "Provide 42 bytes or fewer.",
    );
  }

  const capacityBits = 44 * 8;
  const bb = new BitBuffer();

  bb.append(0b0100, 4);
  bb.append(data.length, 8);

  for (const byte of data) {
    bb.append(byte, 8);
  }

  const terminator = Math.min(4, capacityBits - bb.length);
  bb.append(0, terminator);

  while (bb.length % 8 !== 0) {
    bb.append(0, 1);
  }

  let nextPad = 0xec;
  while (bb.length < capacityBits) {
    bb.append(nextPad, 8);
    nextPad = nextPad === 0xec ? 0x11 : 0xec;
  }

  if (bb.length !== capacityBits) {
    throw new Error("Internal invariant: data bitstream exceeded capacity");
  }

  const bits = bb.toArray();
  const out = new Uint8Array(bits.length / 8);

  for (let i = 0; i < bits.length; i++) {
    out[i >> 3] |= bits[i] << (7 - (i & 7));
  }

  return out;
}
```

---

# 10. FQR Worked Trace — `HELLO ZYPPI`

Input:

```text
HELLO ZYPPI
```

ASCII bytes:

```text
48 45 4C 4C 4F 20 5A 59 50 50 49
```

Length:

```text
11 bytes
```

Header:

```text
Mode  = 0100
Count = 00001011
```

Data:

```text
11 × 8 = 88 bits
```

Before terminator:

```text
4 + 8 + 88 = 100 bits
```

Terminator:

```text
0000
```

Total:

```text
104 bits
```

104 is already byte-aligned.

**No byte-boundary zero padding is added after the terminator.**

104 bits = 13 codewords.

Capacity requires 44 data codewords.

Append 31 pad bytes:

```text
EC 11 EC 11 ... alternating until length = 44
```

---

# 11. Reed–Solomon Error Correction

[FQR-1 REQUIRED] [MODEL-2 CORE]

QR uses GF(256) with modulus polynomial:

```text
x^8 + x^4 + x^3 + x^2 + 1
hex representation: 0x11D
```

Addition/subtraction in GF(256) is XOR.

## 11.1 Multiplication without lookup tables

Use an exact bitwise algorithm to avoid initialization tables:

```ts
function gfMultiply(x: number, y: number): number {
  if ((x & ~0xff) !== 0 || (y & ~0xff) !== 0) {
    throw new RangeError("GF operand outside byte range");
  }

  let z = 0;

  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ (((z >>> 7) & 1) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }

  return z & 0xff;
}
```

Property tests:

```text
gfMultiply(a,0) = 0
gfMultiply(a,1) = a
gfMultiply(a,b) = gfMultiply(b,a)
result ∈ [0,255]
```

## 11.2 Generator polynomial

For ECC degree `d`, construct:

```text
g(x) = Π(i=0..d-1) (x - α^i)
```

where α = 2 in the declared field.

Store all coefficients except the leading 1.

Implementation:

```ts
function rsGenerator(degree: number): Uint8Array {
  if (degree < 1 || degree > 255) throw new RangeError();

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
```

## 11.3 Remainder computation

```ts
function rsRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
  const result = new Uint8Array(divisor.length);

  for (const byte of data) {
    const factor = byte ^ result[0];

    result.copyWithin(0, 1);
    result[result.length - 1] = 0;

    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= gfMultiply(divisor[i], factor);
    }
  }

  return result;
}
```

FQR-1:

```text
data length = 44
ECC degree  = 26
ECC length  = 26
```

The returned array must have exactly 26 codewords.

---

# 12. Error-Correction Block Structure

[MODEL-2 CORE]

The following two compact tables are sufficient, together with the raw-module formula, to derive the data-codeword count and all block sizes.

Index 0 is an unused sentinel.

Order is:

```text
L, M, Q, H
```

## 12.1 ECC codewords per block

```ts
const ECC_CODEWORDS_PER_BLOCK: readonly (readonly number[])[] = [
  [
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30,
    28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ], // L
  [
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
    26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28,
  ], // M
  [
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28,
    26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ], // Q
  [
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28,
    26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ], // H
] as const;
```

## 12.2 Number of ECC blocks

```ts
const NUM_ERROR_CORRECTION_BLOCKS: readonly (readonly number[])[] = [
  [
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10,
    12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ], // L
  [
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17,
    17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ], // M
  [
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23,
    23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ], // Q
  [
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25,
    25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77,
    81,
  ], // H
] as const;
```

These constants are factual block-structure data cross-checked against the MIT-licensed Project Nayuki implementation.

## 12.3 ECC format bits are not enum ordinals

Format information uses:

```text
M = 00
L = 01
H = 10
Q = 11
```

Recommended mapping:

```ts
const ECC_FORMAT_BITS = {
  L: 0b01,
  M: 0b00,
  Q: 0b11,
  H: 0b10,
} as const;

const ECC_TABLE_INDEX = {
  L: 0,
  M: 1,
  Q: 2,
  H: 3,
} as const;
```

Do not conflate the two mappings.

---

# 13. General Block Splitting and Interleaving

[MODEL-2 CORE]

For:

```text
rawCodewords = floor(numRawDataModules(version) / 8)
numBlocks
eccPerBlock
```

derive:

```text
numShortBlocks = numBlocks - (rawCodewords mod numBlocks)
shortBlockLen  = floor(rawCodewords / numBlocks)
```

A short block contains:

```text
shortDataLen = shortBlockLen - eccPerBlock
```

A long block contains one more data codeword.

## 13.1 Correct sequence

1. Split data into short/long data blocks.
2. Compute the same number of ECC codewords for each block.
3. Interleave **all data codeword columns first**.
4. Interleave **all ECC codeword columns second**.
5. Output must contain exactly `rawCodewords` bytes.

Never alternate one data byte and one ECC byte.

## 13.2 TypeScript-oriented algorithm

```ts
interface Block {
  readonly data: Uint8Array;
  readonly ecc: Uint8Array;
}

function addEccAndInterleave(
  data: Uint8Array,
  version: number,
  ecc: QrEcc,
): Uint8Array {
  const row = ECC_TABLE_INDEX[ecc];
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[row][version];
  const eccPerBlock = ECC_CODEWORDS_PER_BLOCK[row][version];

  const rawCodewords = Math.floor(numRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const shortDataLen = shortBlockLen - eccPerBlock;

  const divisor = rsGenerator(eccPerBlock);
  const blocks: Block[] = [];

  let k = 0;

  for (let i = 0; i < numBlocks; i++) {
    const dataLen = shortDataLen + (i < numShortBlocks ? 0 : 1);
    const blockData = data.slice(k, k + dataLen);
    k += dataLen;

    blocks.push({
      data: blockData,
      ecc: rsRemainder(blockData, divisor),
    });
  }

  if (k !== data.length) throw new Error("Block split invariant failed");

  const result: number[] = [];

  const maxDataLen = Math.max(...blocks.map((b) => b.data.length));

  for (let i = 0; i < maxDataLen; i++) {
    for (const block of blocks) {
      if (i < block.data.length) result.push(block.data[i]);
    }
  }

  for (let i = 0; i < eccPerBlock; i++) {
    for (const block of blocks) {
      result.push(block.ecc[i]);
    }
  }

  if (result.length !== rawCodewords) {
    throw new Error("Interleave invariant failed");
  }

  return Uint8Array.from(result);
}
```

For FQR-1, there is one block, so the result is simply:

```text
44 data codewords
followed by
26 ECC codewords
```

---

# 14. Working Matrix Construction

[FQR-1 REQUIRED] [MODEL-2 CORE]

Initialize:

```ts
function createWorkingMatrix(version: number): WorkingMatrix {
  const size = sizeForVersion(version);

  return {
    size,
    modules: Array.from({ length: size }, () => Array(size).fill(false)),
    isFunction: Array.from({ length: size }, () => Array(size).fill(false)),
  };
}
```

Helper:

```ts
function setFunction(
  m: WorkingMatrix,
  x: number,
  y: number,
  dark: boolean,
): void {
  m.modules[y][x] = dark;
  m.isFunction[y][x] = true;
}
```

Coordinates use:

```text
x = column, increasing left → right
y = row, increasing top → bottom
```

---

# 15. Function Patterns

## 15.1 Timing patterns

For all `i = 0..size-1`:

```ts
setFunction(m, 6, i, i % 2 === 0);
setFunction(m, i, 6, i % 2 === 0);
```

Finder patterns will overwrite the timing pattern where they overlap.

## 15.2 Finder patterns including separators

Draw a conceptual 9×9 region centered on:

```text
top-left     (3,3)
top-right    (size-4,3)
bottom-left  (3,size-4)
```

Parts outside the matrix are ignored.

For each offset `dx,dy ∈ [-4,+4]`:

```ts
const r = Math.max(Math.abs(dx), Math.abs(dy));
const dark = r !== 2 && r !== 4;
```

Set in-bounds modules as function modules.

This creates the 7×7 finder plus one-module light separator.

## 15.3 Alignment positions

Version 1 has none.

For Version ≥2:

```ts
function alignmentPositions(version: number): number[] {
  if (version === 1) return [];

  const size = sizeForVersion(version);
  const count = Math.floor(version / 7) + 2;
  const step = Math.floor((version * 8 + count * 3 + 5) / (count * 4 - 4)) * 2;

  const descending: number[] = [];

  for (let i = 0; i < count - 1; i++) {
    descending.push(size - 7 - i * step);
  }

  descending.push(6);

  return descending.reverse();
}
```

For Version 3:

```text
[6,22]
```

Form every `(x,y)` Cartesian pair except the three pairs that collide with finder corners:

```text
(first,first)
(first,last)
(last,first)
```

For Version 3, only the alignment centered at `(22,22)` remains.

## 15.4 Alignment pattern drawing

For offsets `dx,dy ∈ [-2,+2]`:

```ts
const dark = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;
```

This creates the 5×5 dark/light/dark alignment bullseye.

## 15.5 Format reservations and dark module

The simplest safe technique is to draw dummy format information before placing data.

Call:

```ts
drawFormatBits(m, ecc, 0);
```

This reserves both format strips and the always-dark module.

For Version ≥7 also call:

```ts
drawVersionBits(m, version);
```

All those cells become function cells before data placement.

---

# 16. Format Information

[FQR-1 REQUIRED] [MODEL-2 CORE]

Format data is:

```text
2 ECC bits + 3 mask bits
```

Build:

```ts
const data = (ECC_FORMAT_BITS[ecc] << 3) | mask;
```

Compute the 10-bit BCH remainder using generator `0x537`:

```ts
function formatBits(ecc: QrEcc, mask: number): number {
  if (mask < 0 || mask > 7) throw new RangeError();

  const data = (ECC_FORMAT_BITS[ecc] << 3) | mask;

  let rem = data;

  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
  }

  return ((data << 10) | rem) ^ 0x5412;
}
```

Result is 15 bits.

Bit helper:

```ts
function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}
```

## 16.1 Exact placement

```ts
function drawFormatBits(m: WorkingMatrix, ecc: QrEcc, mask: number): void {
  const bits = formatBits(ecc, mask);
  const size = m.size;

  // First copy
  for (let i = 0; i <= 5; i++) {
    setFunction(m, 8, i, getBit(bits, i));
  }

  setFunction(m, 8, 7, getBit(bits, 6));
  setFunction(m, 8, 8, getBit(bits, 7));
  setFunction(m, 7, 8, getBit(bits, 8));

  for (let i = 9; i < 15; i++) {
    setFunction(m, 14 - i, 8, getBit(bits, i));
  }

  // Second copy
  for (let i = 0; i < 8; i++) {
    setFunction(m, size - 1 - i, 8, getBit(bits, i));
  }

  for (let i = 8; i < 15; i++) {
    setFunction(m, 8, size - 15 + i, getBit(bits, i));
  }

  // Fixed dark module
  setFunction(m, 8, size - 8, true);
}
```

For Version 3:

```text
size - 8 = 21
dark module = (x=8,y=21)
```

Equivalent row/column notation is `(row 21, column 8)`.

---

# 17. Version Information

[MODEL-2 CORE] [FUTURE ZQE for FQR-1]

Versions 1–6 do not contain version-information fields.

For Version ≥7:

```ts
function versionBits(version: number): number {
  if (version < 7 || version > 40) throw new RangeError();

  let rem = version;

  for (let i = 0; i < 12; i++) {
    rem = (rem << 1) ^ (((rem >>> 11) & 1) * 0x1f25);
  }

  return (version << 12) | rem;
}
```

Placement:

```ts
function drawVersionBits(m: WorkingMatrix, version: number): void {
  if (version < 7) return;

  const bits = versionBits(version);

  for (let i = 0; i < 18; i++) {
    const bit = getBit(bits, i);
    const a = m.size - 11 + (i % 3);
    const b = Math.floor(i / 3);

    setFunction(m, a, b, bit);
    setFunction(m, b, a, bit);
  }
}
```

---

# 18. Data Placement

[FQR-1 REQUIRED] [MODEL-2 CORE]

Input is the fully interleaved codeword sequence.

Function modules must already be marked.

Traverse 2-column bands from right to left.

Skip timing column 6.

Within each band alternate upward/downward travel.

```ts
function drawCodewords(m: WorkingMatrix, codewords: Uint8Array): void {
  const expectedCodewords = Math.floor(
    numRawDataModules((m.size - 17) / 4) / 8,
  );

  if (codewords.length !== expectedCodewords) {
    throw new Error("Codeword count mismatch");
  }

  let bitIndex = 0;

  for (let right = m.size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;

    const upward = ((right + 1) & 2) === 0;

    for (let vert = 0; vert < m.size; vert++) {
      const y = upward ? m.size - 1 - vert : vert;

      for (let j = 0; j < 2; j++) {
        const x = right - j;

        if (m.isFunction[y][x]) continue;

        if (bitIndex < codewords.length * 8) {
          const byte = codewords[bitIndex >>> 3];
          const bit = ((byte >>> (7 - (bitIndex & 7))) & 1) !== 0;
          m.modules[y][x] = bit;
          bitIndex++;
        } else {
          // Remainder-bit cell. It must remain light.
          m.modules[y][x] = false;
        }
      }
    }
  }

  if (bitIndex !== codewords.length * 8) {
    throw new Error("Data placement did not consume all codeword bits");
  }

  const version = (m.size - 17) / 4;
  const dataCellCount = countNonFunctionCells(m);
  const expectedBits = codewords.length * 8 + remainderBitCount(version);

  if (dataCellCount !== expectedBits) {
    throw new Error(
      `Data-region invariant failed: cells=${dataCellCount}, expected=${expectedBits}`,
    );
  }
}
```

**Important:** do not "fill unexpected unassigned cells white" as a recovery path. A mismatch is an implementation defect and must fail.

The two-grid model means data cells are simply `isFunction=false`.

---

# 19. Mask Predicates

[FQR-1 REQUIRED] [MODEL-2 CORE]

Apply a mask only when `isFunction[y][x] === false`.

For each `(x,y)`:

```ts
function maskMatches(mask: number, x: number, y: number): boolean {
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
      throw new RangeError("Mask outside 0..7");
  }
}
```

Mask application is XOR:

```ts
function applyMask(m: WorkingMatrix, mask: number): void {
  for (let y = 0; y < m.size; y++) {
    for (let x = 0; x < m.size; x++) {
      if (!m.isFunction[y][x] && maskMatches(mask, x, y)) {
        m.modules[y][x] = !m.modules[y][x];
      }
    }
  }
}
```

Calling `applyMask(m,k)` twice restores the previous data-module state.

---

# 20. Penalty Scoring

[FQR-1 REQUIRED] [MODEL-2 CORE]

Use constants:

```text
N1 = 3
N2 = 3
N3 = 40
N4 = 10
```

## Rule 1 — long same-color runs

For every row and every column, each maximal run of the same color with length `r >= 5` contributes:

```text
3 + (r - 5)
```

Equivalent:

```text
r=5 => 3
r=6 => 4
r=7 => 5
...
```

## Rule 2 — monochrome 2×2 blocks

Every 2×2 block whose four modules have the same color contributes:

```text
3
```

Overlapping blocks each count.

## Rule 3 — finder-like 1:1:3:1:1 patterns

In every row and every column, detect a dark/light/dark/dark/dark/light/dark core with run-length ratio:

```text
1 : 1 : 3 : 1 : 1
```

where the unit run length may be greater than one.

The core must have at least four unit-lengths of light modules immediately before or after it, including the conceptual light border outside the symbol.

Each qualifying occurrence contributes:

```text
40
```

A robust implementation should use run histories rather than literal 11-bit string matching, because scaled run lengths and edge light-border semantics matter.

Recommended run-history helper strategy:

```ts
function finderLikeCount(history: readonly number[]): number {
  // history is newest-first, seven runs
  const n = history[1];

  const core =
    n > 0 &&
    history[2] === n &&
    history[4] === n &&
    history[5] === n &&
    history[3] === 3 * n;

  let result = 0;

  if (core && history[0] >= 4 * n && history[6] >= n) result++;
  if (core && history[6] >= 4 * n && history[0] >= n) result++;

  return result;
}
```

The row/column scanner should treat the area outside each symbol edge as a light border at least `size` modules long for this test.

## Rule 4 — dark/light balance

Let:

```text
D = number of dark modules
T = total modules = size²
```

Use:

```ts
const k = Math.ceil(Math.abs(D * 20 - T * 10) / T) - 1;

const penalty = Math.max(0, k) * 10;
```

This is the reference scoring behavior used by the chosen mature implementation strategy.

## Total

```text
score = rule1 + rule2 + rule3 + rule4
```

Lower is better.

---

# 21. Candidate Scoring Order

[FQR-1 REQUIRED]

For `zqe/fqr1`, candidate scoring follows the conservative standard-ready sequence.

For each mask ID:

```text
apply candidate data mask
        ↓
leave Format Information cells reserved/unwritten
        ↓
score the candidate
        ↓
undo candidate data mask
```
After all eight candidates have been evaluated:
```
select minimum-score mask
        ↓
apply selected data mask
        ↓
write final Format Information
```
The candidate-scoring stage SHALL NOT write per-candidate Format Information before penalty evaluation.

**Tie-break remains:**

> If multiple masks have the same minimum score, choose the numerically lowest mask ID.

---

# 22. Mask Selection Algorithm

```ts
function chooseMask(m: WorkingMatrix, ecc: QrEcc): number {
  let bestMask = 0;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask++) {
    applyMask(m, mask);

    // Format Information remains reserved/unwritten while scoring.
    const score = penaltyScore(m.modules);

    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
    }

    applyMask(m, mask); // undo DATA mask
  }

  return bestMask;
}
```
Finalization:
```ts
const mask = chooseMask(m, ecc);
applyMask(m, mask);
drawFormatBits(m, ecc, mask);
```
The format bits are written only after the winning mask has been selected.

---

# 23. Compiler Orchestration — FQR-1

```ts
function compileFqr1(input: Uint8Array): QrSymbol {
  const data = ownInput(input);

  if (data.length > 42) {
    throw zqeError(
      "QR_CAPACITY_EXCEEDED",
      `Input contains ${data.length} bytes; maximum is 42.`,
      "input_validation",
      "ZQE-001/FQR-CAPACITY",
      "Provide 42 bytes or fewer.",
    );
  }

  const dataCodewords = buildFqrDataCodewords(data);

  if (dataCodewords.length !== 44) {
    throw new Error("Expected 44 data codewords");
  }

  const allCodewords = addEccAndInterleave(dataCodewords, 3, "M");

  if (allCodewords.length !== 70) {
    throw new Error("Expected 70 total codewords");
  }

  const m = createWorkingMatrix(3);

  drawFunctionPatterns(m, 3, "M");
  drawCodewords(m, allCodewords);

  const mask = chooseMask(m, "M");

  applyMask(m, mask);
  drawFormatBits(m, "M", mask);

  return finalizeSymbol(m, 3, "M", mask);
}
```

`drawFunctionPatterns()` means:

```text
timing
finder + separators
alignment
dummy format bits
version bits if applicable
```

For V3 there are no version bits.

---

# 24. Final `QrSymbol`

The final symbol contains only the QR symbol modules.

It does not include the quiet zone.

For FQR-1:

```text
size = 29
matrix = 29 × 29
```

A safe implementation can close over a private matrix snapshot:

```ts
function finalizeSymbol(
  m: WorkingMatrix,
  version: number,
  ecc: QrEcc,
  mask: number,
): QrSymbol {
  const snapshot = m.modules.map((row) => row.slice());

  return {
    model: "QR_MODEL_2",
    version,
    size: m.size,
    errorCorrection: ecc,
    mask,
    getModule(x: number, y: number): boolean {
      if (x < 0 || y < 0 || x >= m.size || y >= m.size) return false;
      return snapshot[y][x];
    },
  };
}
```

No mutable matrix reference escapes.

---

# 25. SVG Rendering

[FQR-1 REQUIRED]

The renderer consumes a finished `QrSymbol`.

It must not know:

- payload bytes;
- ECC generation;
- masking rules;
- alignment rules;
- GS1 semantics.

## 25.1 Quiet zone

For ordinary QR Code Model 2 output, use a four-module light margin around the symbol.

For FQR-1:

```text
symbol size = 29
quiet zone each side = 4
logical SVG grid = 29 + 8 = 37
```

## 25.2 Deterministic integer geometry

Canonical FQR SVG must use:

- integer coordinates;
- integer viewBox;
- fixed element ordering;
- no generated IDs;
- no timestamps;
- no floating-point transforms;
- no metadata that varies by runtime.

A simple deterministic output strategy:

```text
viewBox="0 0 37 37"
background omitted or explicit white rectangle
each dark module rendered at x+4,y+4 with width=1,height=1
```

A more compact deterministic path representation is allowed if its ordering is frozen.

Same `QrSymbol` + same renderer options must produce byte-identical SVG.

---

# 26. Structured ZQE Error Contract

Every failure must preserve:

```text
code
reason
stage
reference
recovery
```

Recommended TypeScript:

```ts
export type ZqeStage =
  | "input_validation"
  | "data_encoding"
  | "ecc_generation"
  | "block_interleaving"
  | "matrix_construction"
  | "data_placement"
  | "mask_evaluation"
  | "format_generation"
  | "symbol_finalization"
  | "rendering";

export interface ZqeErrorShape {
  readonly code: string;
  readonly reason: string;
  readonly stage: ZqeStage;
  readonly reference: string;
  readonly recovery: string;
}
```

Minimum FQR public errors:

```text
QR_INVALID_INPUT
QR_PROFILE_UNSUPPORTED
QR_CAPACITY_EXCEEDED
QR_INTERNAL_INVARIANT
QR_RENDER_INVALID_SYMBOL
```

Do not expose a bare `Error("invalid")`.

---

# 27. Strict Structural Verifier

[VERIFIER ONLY]

The strict verifier must not reuse production encoder helper functions in a way that makes it a self-approval loop.

For FQR-1 it must independently confirm:

```text
version = 3
size = 29
ECC = M
mask ∈ 0..7
finder patterns correct
separators correct
timing patterns correct
alignment center = (22,22)
dark module = (8,21)
format bits decode to ECC M + selected mask
all data modules visited exactly once
70 codewords extractable
7 remainder bits present and light before masking semantics are reversed as applicable
RS parity validates for the extracted codewords
```

The verifier may reverse masking and data placement to recover the raw codeword stream.

It does not need to become a production QR decoder.

---

# 28. Independent Interoperability Tests

FQR-1 requires at least:

```text
strict structural verifier
+
ZXing-C++ family decode
+
ML Kit Android decode
```

The independent reader must be test-only.

It must not become a `qr-core` production dependency.

For every valid fixture:

```text
decode(render(compile(bytes))) === original bytes
```

For Fixture D:

```text
compile(43 bytes) => QR_CAPACITY_EXCEEDED
```

For a frozen non-QR control image:

```text
independent decoder => no valid QR
```

---

# 29. Required Property Tests

Critical properties include:

```text
same bytes + same profile => same data codewords
same bytes + same profile => same ECC
same bytes + same profile => same QrSymbol
same QrSymbol => same canonical SVG

0 <= payload length <= 42 => successful FQR compile
payload length >= 43 => deterministic rejection

gfMultiply(a,0) = 0
gfMultiply(a,1) = a
gfMultiply(a,b) = gfMultiply(b,a)

RS remainder length = ECC degree

all codeword bits are consumed exactly once
data-region cells = raw codeword bits + remainder bits

mask ∈ [0,7]
all eight masks are evaluated

independent_decode(encode(payload)) = payload
```

Property generation should cover every byte value `0x00..0xFF`, not just text.

---

# 30. Model-2 Extension Path

After FQR-1, the core architecture can expand without changing `QrSymbol`.

Recommended order:

```text
1. Versions 1–40 using the same capacity/block derivation.
2. ECC L/Q/H.
3. Numeric mode.
4. Alphanumeric mode.
5. ECI.
6. Kanji mode.
7. Multi-segment input.
8. Version auto-selection.
9. Optional optimal segmentation.
10. Structured Append / FNC1 only under separate explicit requirements.
```

Do not implement all future capabilities merely because the manual lists them.

---

# 31. Numeric Mode

[FUTURE ZQE]

Characters:

```text
0–9 only
```

Groups:

```text
3 digits => integer encoded in 10 bits
2 digits => integer encoded in 7 bits
1 digit  => integer encoded in 4 bits
```

Mode indicator:

```text
0001
```

Character count uses the Numeric widths from §8.

---

# 32. Alphanumeric Mode

[FUTURE ZQE]

Alphabet:

```text
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:
```

Map each character to its index 0–44.

Pairs:

```text
value = first * 45 + second
encode in 11 bits
```

Final unpaired character:

```text
encode its value in 6 bits
```

Mode indicator:

```text
0010
```

---

# 33. Byte Mode

[FQR-1 REQUIRED]

Each byte becomes exactly 8 payload bits.

Mode indicator:

```text
0100
```

The QR core does not assign text encoding semantics to those bytes.

If an upper layer wants UTF-8, it must explicitly convert text to UTF-8 bytes before calling the byte encoder.

---

# 34. ECI

[FUTURE ZQE]

Mode indicator:

```text
0111
```

ECI has no character-count field.

Assignment value encoding:

```text
0 .. 127
=> 8 bits

128 .. 16383
=> prefix 10 + 14-bit value

16384 .. 999999
=> prefix 110 + 21-bit value
```

Values outside the supported ECI assignment range must fail.

ECI changes interpretation of subsequent character data; it does not change QR matrix construction.

---

# 35. Kanji Mode

[FUTURE ZQE]

Mode indicator:

```text
1000
```

Character count widths are in §8.

A Kanji-mode encoder must operate on eligible Shift-JIS double-byte values and transform each eligible character into a 13-bit value.

This feature is deliberately not part of FQR-1.

Because text-encoding libraries and Shift-JIS mapping introduce additional correctness surface, ZQE should implement and verify Kanji in a dedicated milestone rather than allowing it to leak into the byte-mode core.

---

# 36. Structured Append and FNC1

[FUTURE ZQE]

These are valid Model-2 control modes but are explicitly outside FQR-1.

Known mode indicators:

```text
Structured Append     0011
FNC1 first position   0101
FNC1 second position  1001
```

Structured Append can combine up to 16 symbols.

FNC1 first position is used for GS1-style semantics.

**Boundary rule:**

> Adding FNC1 does not give `qr-core` authority to understand GS1 business meaning.

Before implementing Structured Append or either FNC1 mode, create a dedicated requirements card and verify the exact control-field semantics and parity/application-indicator rules through the project's normative-verification process.

---

# 37. Requirement Ledger — FQR-1

| ID              | Requirement                          | Module    | Test              |
| --------------- | ------------------------------------ | --------- | ----------------- |
| QR-REQ-FQR-001  | profile fixed to V3-M Byte           | profile   | T-FQR-PROFILE     |
| QR-REQ-FQR-002  | max payload 42 bytes                 | input     | T-FQR-CAP         |
| QR-REQ-BIT-001  | Byte mode indicator `0100`           | encoding  | T-BIT-MODE        |
| QR-REQ-BIT-002  | V3 Byte count width 8                | encoding  | T-BIT-COUNT       |
| QR-REQ-BIT-003  | terminator up to 4 zero bits         | encoding  | T-BIT-TERM        |
| QR-REQ-BIT-004  | byte alignment with zeros            | encoding  | T-BIT-ALIGN       |
| QR-REQ-BIT-005  | pad alternates EC/11                 | encoding  | T-BIT-PAD         |
| QR-REQ-RS-001   | GF modulus 0x11D                     | ecc       | T-RS-GF           |
| QR-REQ-RS-002   | V3-M ECC degree 26                   | ecc       | T-RS-DEG          |
| QR-REQ-BLK-001  | V3-M 1 block                         | blocks    | T-BLK-V3M         |
| QR-REQ-BLK-002  | 44 data + 26 ECC                     | blocks    | T-BLK-LEN         |
| QR-REQ-GEO-001  | size = 17+4v                         | matrix    | T-GEO-SIZE        |
| QR-REQ-GEO-002  | V3 = 29×29                           | matrix    | T-GEO-V3          |
| QR-REQ-FUNC-001 | 3 finder patterns                    | matrix    | T-FUNC-FINDER     |
| QR-REQ-FUNC-002 | timing row/col 6                     | matrix    | T-FUNC-TIMING     |
| QR-REQ-FUNC-003 | V3 alignment center 22,22            | matrix    | T-FUNC-ALIGN      |
| QR-REQ-FUNC-004 | dark module 8,21                     | matrix    | T-FUNC-DARK       |
| QR-REQ-PLC-001  | right-to-left 2-col zig-zag          | placement | T-PLC-ORDER       |
| QR-REQ-PLC-002  | skip function cells                  | placement | T-PLC-SKIP        |
| QR-REQ-PLC-003  | V3 has 7 remainder bits              | placement | T-PLC-REM         |
| QR-REQ-MSK-001  | evaluate all 8 masks                 | mask      | T-MSK-ALL         |
| QR-REQ-MSK-002  | mask only non-function cells         | mask      | T-MSK-SCOPE       |
| QR-REQ-MSK-003  | deterministic lowest-score selection | mask      | T-MSK-SELECT      |
| QR-REQ-MSK-004  | tie => lowest numerical mask         | mask      | T-MSK-TIE         |
| QR-REQ-FMT-001  | BCH generator 0x537                  | format    | T-FMT-BCH         |
| QR-REQ-FMT-002  | XOR mask 0x5412                      | format    | T-FMT-XOR         |
| QR-REQ-REN-001  | QrSymbol excludes quiet zone         | symbol    | T-REN-BOUNDARY    |
| QR-REQ-REN-002  | SVG adds 4-module quiet zone         | svg       | T-REN-QZ          |
| QR-REQ-REN-003  | canonical SVG integer-only           | svg       | T-REN-DETERMINISM |

---

# 38. ZQE Decision Register

| ID          | Decision                                          | Rationale                           |
| ----------- | ------------------------------------------------- | ----------------------------------- |
| ZQE-DEC-001 | Core input is bytes, not string                   | no hidden text encoding             |
| ZQE-DEC-002 | Caller input is defensively copied                | caller cannot mutate internal state |
| ZQE-DEC-003 | Public QrSymbol exposes no mutable matrix         | immutable artifact boundary         |
| ZQE-DEC-004 | FQR fixed to V3-M Byte                            | scope discipline                    |
| ZQE-DEC-005 | FQR overflow fails instead of promoting version   | deterministic profile               |
| ZQE-DEC-006 | Two-grid working matrix: color + function-role    | no ambiguous module state           |
| ZQE-DEC-007 | Candidate format bits do not participate in FQR mask scoring | conservative standard-ready ordering |
| ZQE-DEC-008 | Equal mask scores choose lowest mask ID           | deterministic tie                   |
| ZQE-DEC-009 | Quiet zone belongs to renderer                    | QrSymbol stays native matrix        |
| ZQE-DEC-010 | Canonical SVG uses integer geometry               | byte reproducibility                |

---

# 39. Forbidden Shortcuts

Do not:

```text
✗ infer encoding from JavaScript string input in qr-core
✗ use `Object.freeze()` on Uint8Array as the immutability mechanism
✗ treat a boolean `false` cell as both "unassigned" and "function-light"
✗ expand the 29×29 QrSymbol to include quiet zone
✗ alternate data and ECC bytes during interleaving
✗ omit EC/11 capacity padding
✗ omit remainder bits
✗ mask finder/timing/alignment/format/version modules
✗ select the first mask that decodes
✗ use a decoder pass as the only proof of structural correctness
✗ silently promote FQR Version 3 to Version 4
✗ silently truncate overflow data
✗ put GS1 parsing in qr-core
✗ let qr-svg rebuild QR semantics
✗ "repair" unexpected unfilled data cells by setting them light
```

---

# 40. FQR-1 Definition of Engineering Success

The implementation is ready for the FQR acceptance phase when all of the following pass:

```text
[ ] Fixture A compile
[ ] Fixture B compile
[ ] Fixture C 42-byte boundary compile
[ ] Fixture D 43-byte overflow fails deterministically
[ ] Fixture E compile

[ ] Every valid compile returns 29×29 QrSymbol
[ ] V3-M raw module count = 567
[ ] V3-M total codewords = 70
[ ] V3-M data codewords = 44
[ ] V3-M ECC codewords = 26
[ ] V3 remainder bits = 7

[ ] strict structural verifier PASS
[ ] mask selection deterministic
[ ] canonical SVG hash deterministic
[ ] ZXing-C++ family decoder exact round-trip
[ ] ML Kit exact round-trip
[ ] frozen simulated-capture corpus PASS
[ ] physical print/scan PASS
```

---

# 41. Human Normative Verification Register

This manual deliberately separates "implementation-ready engineering fact" from "formal normative verification".

For FQR-1, the human reviewer should confirm at least:

| NVR     | Subject                                          |
| ------- | ------------------------------------------------ |
| NVR-001 | ISO/IEC 18004:2024 Ed.4 is active baseline       |
| NVR-002 | V3-M 44 data / 26 ECC / 1 block                  |
| NVR-003 | Byte-mode indicator and V3 count width           |
| NVR-004 | terminator, byte alignment, EC/11 pad behavior   |
| NVR-005 | GF(256) field and RS generator semantics         |
| NVR-006 | function-pattern geometry                        |
| NVR-007 | V3 remainder-bit count                           |
| NVR-008 | eight mask predicates                            |
| NVR-009 | penalty rules and candidate-evaluation semantics |
| NVR-010 | format BCH and placement                         |
| NVR-011 | four-module quiet zone                           |

Formal status labels such as `NORMATIVE VERIFIED` must not be applied until a named human reviewer records the result.

---

# 42. Provenance and Licensing Notes

This clean-room manual was redrafted from the project's earlier ZQE QR Engineering Manual corrective draft and independently cross-checked against public/open technical sources.

Important implementation references:

- DENSO WAVE public QR technical documentation — symbol versions, size ranges, supported modes and ECC families.
- Project Nayuki `QR-Code-generator` — MIT License — compact multi-language reference implementation used to cross-check:
  - raw-module derivation;
  - alignment-position derivation;
  - GF(256) multiplication;
  - RS generator/remainder construction;
  - ECC block constants;
  - block interleaving;
  - function pattern placement;
  - format/version BCH placement;
  - masking and penalty logic.
- ZXing / ZXing-C++ — Apache 2.0 — independent interoperability/reference decoder family.

The project must preserve any third-party license notices required when code is actually copied or adapted. This manual describes algorithms and data; it does not authorize removal of attribution obligations from implementation source.

---

# 43. Final Engineering Rule

The engineer implementing FQR-1 should be able to follow one linear path:

```text
bytes
  ↓
validate 0..42
  ↓
Byte mode header + count + bytes
  ↓
terminator + byte alignment + EC/11 pad
  ↓
44 data codewords
  ↓
RS degree 26
  ↓
70 total codewords
  ↓
29×29 working matrix
  ↓
function modules
  ↓
codeword placement + 7 remainder bits
  ↓
evaluate 8 masks with format cells reserved
  ↓
select mask
  ↓
format BCH
  ↓
deterministic mask choice
  ↓
QrSymbol
  ↓
4-module renderer quiet zone
  ↓
SVG
  ↓
strict verifier
  ↓
independent decoders
```

At no point may an implementation guess a missing value, silently broaden the profile, or repair an invariant violation by inventing output.

**Fail closed. Prove structure. Then prove interoperability.**
