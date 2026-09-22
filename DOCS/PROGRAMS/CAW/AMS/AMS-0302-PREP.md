# AMS-0302 — GS1 / Referent Domain Scope Reconciliation & Implementation Preparation

**Implements:** IT-0302 · **Milestone:** M03 · **Size:** S–M · **Depends On:** IT-0202 ☑, IT-0301 ☑ · **Status:** PREPARATION / NO IMPLEMENTATION AUTHORIZED

---

## 1. Scope Reconciliation Findings

This section reconciles the exact relationship among the following key concepts under the governing sources: **GS1 Identifier**, **GS1 Digital Link**, **Referent**, **Product**, **Brand**, **Manufacturer**, **Identity**, and **`referentId`**.

### A. Canonical Task Name

The exact canonical name of `IT-0302` in `CAW-011` is **"GS1 identifier model"**.

- **Exact wording:** `"GS1 identifier model"`
- **Scope Assessment:** This wording is grammatically singular and describes a _GS1 identifier value object_ (such as a GTIN). However, when cross-referenced with `CAW-003` (Domain Model) and `CAW-008` (Registry Schema), there is an apparent terminology gap because the task for modeling the **Referent** entity (Product / Brand / Manufacturer) is not separately numbered in the `CAW-011` roadmap.
- **Wedge dependency map:** `CAW-012` Worked Example 1 shows that `IT-0601` (GS1 Digital Link Parser) depends on `IT-0302` (GS1 identifier model), indicating that `IT-0302` must at minimum define and validate the core GS1 identifier structures (e.g. GTIN/Serial/Lot/Expiration) needed for Digital Link resolution.

### B. Canonical Domain Concept

Is **Referent** a canonical Domain term? **Yes.**

- **Evidence in `CAW-003`:** Table rows explicitly define **Referent (Product / Brand / Manufacturer)** as "The real-world thing the Identity represents. Product identifies Brand and Manufacturer as related referents."
- **Evidence in `CAW-008`:** The `referents` table contains `id`, `referent_type` (product/brand/manufacturer), `name`, and `parent_referent_id (fk, nullable)`.
- **GS1 Identifier vs Referent Relationship:**
  - A _Referent_ is a database-backed domain entity representing a real-world commercial object (Product, Brand, or Manufacturer).
  - A _GS1 Identifier_ (such as a GTIN) is a property or value object belonging to a Product-type Referent. It acts as the key to verify that product's unique physical identity.
  - They are distinct: a GS1 identifier is a pure value object, whereas a Referent is an entity with structured relation hierarchies (Product -> Brand -> Manufacturer).

### C. Required Domain Types

To support the wedge while avoiding speculative expansion, we identify the following types for `IT-0302`:

| Proposed Type    | Source Basis          | Required or Optional | Responsibility                                                                 |
| :--------------- | :-------------------- | :------------------: | :----------------------------------------------------------------------------- |
| `ReferentRecord` | `CAW-003` / `CAW-008` |       Required       | Represents the Product, Brand, or Manufacturer entity represented by Identity. |
| `GS1Identifier`  | `CAW-011` / `CAW-012` |       Required       | Value object representing a validated GS1 identification string (e.g., GTIN).  |

### D. Relationship to AMS-0301

- **Consuming `ReferentId`:** `AMS-0301` established `referentId: string | null` inside `IdentityRecord`.
- **Typing `ReferentId`:** `ReferentId` should remain a string primitive (or a union type) rather than a complex class or branded type to preserve the leaf-package simplicity of `packages/domain` and prevent breaking changes.
- **AMS-0301 Impact:** **No change required.** The completed Identity model and its public exports do not need to be modified.

### E. GS1 Validation Boundary

- **Structural Validation Required Now:**
  - `GTIN` (Global Trade Item Number): Verify it is a non-empty string consisting only of digits (typically 14 digits, or normalized to 14 characters) and has a valid check digit.
  - `GS1Identifier`: Keep it simple. A GS1 identifier contains the parsed components.
- **Specification Gap:** `CAW-008` mentions "the Digital Link / GTIN it resolves from" but does not define exact length requirements or the validation math. We will implement simple standard GTIN check-digit calculation and length validation as a reasonable implementation inference, while keeping it out of the domain-level schema dependencies.

### F. Referent Scope

- **Wedge Requirement:** Under `CAW-008`, `referents` are stored in a single table. Therefore, `ReferentRecord` must support:
  - `referentId: string` (required, trimmed, non-empty)
  - `referentType: 'product' | 'brand' | 'manufacturer'` (required)
  - `name: string` (required, trimmed, non-empty)
  - `parentReferentId: string | null` (optional/nullable)
  - `createdAt: string` (required ISO-8601 UTC string)
- **Note on `updatedAt`:** Under `CAW-008`, the `referents` table **does not** have an `updated_at` column (unlike `identities` which is mutable). Thus, `updatedAt` is **not** included in `ReferentRecord`, maintaining exact alignment with the PostgreSQL schema.
- **Out of Scope:** Price, inventory, description, image URLs, or any other non-registry metadata.

---

## 2. Decision Memo

### 2.1 Summary of Scope Decisions

1. **Canonical Task Name:** `IT-0302` is titled **"GS1 identifier model"** in the build order, but the milestone must also deliver the **"Referent"** domain model defined in `CAW-003` to prevent an orphaned reference.
2. **Canonical Scope:** Define both `GS1Identifier` and `ReferentRecord` in `packages/domain` within the same milestone, as they are twin aspects of real-world identity representation.
3. **Resolved Relationship:** A `GS1Identifier` represents a validated, structured physical item identifier (e.g., GTIN), while a `ReferentRecord` represents the catalog entity (Product, Brand, or Manufacturer) carrying that identity.
4. **`ReferentRecord` in Scope:** **Yes.** Required to model database rows in the `referents` table defined by `CAW-008`.
5. **`GS1Identifier` in Scope:** **Yes.** Required to parse and validate physical GTIN identity references.
6. **Minimum Required Domain Types:**
   - `ReferentType: 'product' | 'brand' | 'manufacturer'`
   - `ReferentRecord` (Type)
   - `GS1Identifier` (Type)
   - `ReferentValidationError` (Type)
7. **Minimum Required Fields:**
   - `ReferentRecord`: `referentId: string`, `referentType: ReferentType`, `name: string`, `parentReferentId: string | null`, `createdAt: string`. (Note: `updatedAt` is excluded).
   - `GS1Identifier`: `gtin: string`, `serialNumber?: string`, `lotNumber?: string`, `expirationDate?: string`.
8. **Required Validation Rules:**
   - `ReferentRecord` fields must be non-empty after trimming; `createdAt` must be a valid calendar-level ISO-8601 UTC timestamp; `referentType` must be strictly one of the allowed literal values.
   - `GS1Identifier` GTIN must be validated strictly for numeric-only characters and standard check-digit checksum validity.
9. **Explicitly Out-of-Scope Behavior:** No external GS1 parsing libraries, no filesystem access, no clock access, no HTTP requests, no catalog schema values (such as price or merchant descriptions).
10. **Relationship to Completed `IdentityRecord`:** Identity points to Referent via `referentId`. No types are broken.
11. **AMS-0301 Amendment:** **No change required.**
12. **CAW-003, CAW-008, CAW-011 Corrections:** No corrections needed. The terminology is reconciled gracefully through implementation mapping.
13. **Strict Implementation Boundary:** The validation functions (`validateReferentRecord`, `validateGS1Identifier`) are pure functions and do not generate dates or throw exceptions.

### 2.2 Traceability Mapping

| Choice / Conclusion                     | Evidence / Basis                           | Classification                      |
| :-------------------------------------- | :----------------------------------------- | :---------------------------------- |
| **Combine Referent and GS1 Identifier** | `CAW-003`, `CAW-008`, and `CAW-011`        | Reasonable implementation inference |
| **No `updatedAt` on `ReferentRecord`**  | `CAW-008` `referents` schema table columns | Directly supported by the corpus    |
| **`ReferentId` is string primitive**    | `IdentityRecord` definition in `AMS-0301`  | Directly supported by the corpus    |
| **GTIN check-digit calculation**        | Standard GS1 validation practice           | Reasonable implementation inference |
| **No external schema libraries**        | CEngS-001/002 dependency constraints       | Directly supported by the corpus    |

---

## 3. Proposed AMS-0302 Implementation Plan

### 3.1 Proposed Canonical Mandate

- **Title:** `AMS-0302 — GS1 Identifier & Referent Domain Model`
- **Objective:** Implement the `Referent` domain record and the `GS1Identifier` value object as pure, immutable, and canonically serializable TypeScript models in `packages/domain`.

### 3.2 Expected File Changes

- **Modified:** `packages/domain/src/index.ts` (adding exports for referent types, validation, and serialization).
- **Created:** `packages/domain/src/referent.test.ts` (unit tests for referent and GS1 validation/serialization).

### 3.3 Proposed Exports and API

```typescript
export type ReferentType = "product" | "brand" | "manufacturer";

export type ReferentRecord = {
  referentId: string;
  referentType: ReferentType;
  name: string;
  parentReferentId: string | null;
  createdAt: string;
};

export type GS1Identifier = {
  gtin: string;
  serialNumber?: string;
  lotNumber?: string;
  expirationDate?: string;
};

export type ReferentValidationErrorCode =
  | "INVALID_REFERENT_ID"
  | "INVALID_REFERENT_TYPE"
  | "INVALID_NAME"
  | "INVALID_PARENT_REFERENT_ID"
  | "INVALID_CREATED_AT"
  | "INVALID_GTIN_FORMAT"
  | "INVALID_GTIN_CHECKSUM";

export type ReferentValidationError = {
  code: ReferentValidationErrorCode;
  field: string;
  message: string;
};

export function validateReferentRecord(
  input: unknown,
): ValidationResult<ReferentRecord, ReferentValidationError>;

export function validateGS1Identifier(
  input: unknown,
): ValidationResult<GS1Identifier, ReferentValidationError>;

export function serializeReferentRecord(record: ReferentRecord): string;

export function serializeGS1Identifier(id: GS1Identifier): string;
```

### 3.4 Validation and Error Conventions

- Reuses `ValidationResult<T, E>` from `AMS-0301`.
- Validation functions do not throw and return exact structured machine-readable validation errors.

### 3.5 Serialization Requirements

- Standardizes alphabetical sorting for both models to achieve 100% deterministic canonical serialization.
- `serializeReferentRecord` key order: `createdAt`, `name`, `parentReferentId`, `referentId`, `referentType`.
- `serializeGS1Identifier` key order: `expirationDate`, `gtin`, `lotNumber`, `serialNumber` (with optional properties omitted or serialized only if present).

### 3.6 Test Plan

- **Referent Record validation tests:**
  - Verify acceptance of well-formed Product, Brand, and Manufacturer records.
  - Verify rejection of empty fields, invalid ISO-8601 calendar dates, and incorrect `referentType`.
- **GS1 Identifier validation tests:**
  - Verify strict numeric-only check for GTIN.
  - Verify standard check-digit checksum check for GTIN-14, GTIN-13, and GTIN-12 structures.
- **Serialization tests:**
  - Prove key insertion order stability under `JSON.stringify`.
  - Proves stable round-trip serialization.

### 3.7 Acceptance Criteria

- All tests pass with 100% code coverage.
- Package boundaries (`boundary:all`) and dependency graph verification (`graph:validate`) pass cleanly.

---

## 4. Final Recommendation

We recommend:

> **B. Scope confirmed with documented assumptions — Chair approval required**

**Reasoning:** The scope combines both `GS1Identifier` and `ReferentRecord` types to perfectly satisfy the database mapping of `CAW-008` and the parsed dependencies of `CAW-012`, while ensuring no design or public contracts from the completed `IdentityRecord` (AMS-0301) are modified. Chair approval is required to ratify the inclusion of the `Referent` model within `IT-0302` and confirm our lightweight standard GTIN check-digit implementation boundary.
