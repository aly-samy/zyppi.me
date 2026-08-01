# AMS-0302 — GS1 Identifier & Referent Domain Model Implementation Notes

## Conventions Established for M03 (IT-0302)

This document chronicles the implementation notes for IT-0302 / AMS-0302.

### 1. Chair-Approved Inclusion of `ReferentRecord`
To address the terminology gap in the build roadmap, this task implements both the `GS1Identifier` value object and the minimal `ReferentRecord` entity required by CAW-003 and CAW-008.

### 2. Strict Identity, Referent, and GS1 Identifier Separation
The three concepts maintain explicit semantic and physical type separations:
- `IdentityRecord`: Persistent digital representation (AMS-0301). Points to `ReferentRecord` via nullable string field `referentId`.
- `ReferentRecord`: Real-world Product, Brand, or Manufacturer represented by Identity. Contains `referentId`, `referentType` (`"product" | "brand" | "manufacturer"`), `name`, nullable `parentReferentId`, and `createdAt` (strict ISO-8601 UTC string). Excludes `updatedAt` for Postgres compatibility.
- `GS1Identifier`: Validated GS1 trade-item identifier containing only the validated ASCII-digits `gtin` string.

### 3. Pure Referent Validation & Self-Consistency Invariant
- `validateReferentRecord(input)` validates properties to be non-empty after trimming, but returns the supplied representation exactly.
- Direct self-referencing check: a Referent is forbidden from being its own parent. If `parentReferentId` is not null and is exactly equal to `referentId` (with case-sensitive and spacing literal equality), returns a `SELF_REFERENCING_PARENT` validation error.

### 4. Pure GTIN Validation Check-Digit Algorithm
- Supported GTIN lengths: GTIN-8, GTIN-12, GTIN-13, and GTIN-14.
- All validated GTINs must consist only of ASCII decimal digits `[0-9]`. No whitespace, signs, decimals, or unicode digits are allowed.
- Normalization (such as padding/zero-padding or conversion to GTIN-14) is **explicitly absent** within Domain to prevent premature application-layer mapping assumptions.
- Modulo-10 checksum validation is computed locally with no external GS1 dependency.

### 5. Deterministic Serialization
Deterministic JSON serialization is provided by explicitly constructing ordered JSON-safe objects with approved key ordering:
- `ReferentRecord`: `createdAt`, `name`, `parentReferentId`, `referentId`, `referentType`.
- `GS1Identifier`: `gtin`.

### 6. Mechanical Domain-Purity Enforcement Gap
Static purity analyses (`tools/validate-runtime-purity.mjs`) currently only examine `packages/runtime` files. Purity of `packages/domain` remains verified manually and through strict zero-dependency boundaries (`package.json`) enforced by the graph validator.
