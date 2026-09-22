# M05-SFA Implementation-Contract Extraction

## 1. Audit Identity and Mandate Receipt

- **Mandate ID:** `M05-SFA-ICE-001`
- **Title:** `M05-SFA Implementation-Contract Extraction`
- **Authority:** Chair, Zyppi Constitutional Council
- **Target Milestone:** `M05 — Registry Layer`
- **Purpose:** Extract exact implemented repository facts to assist the Council in drafting the "M05-SFA — Seed Fixture Authority"
- **Status:** `MANDATED — INVESTIGATION COMPLETED`
- **Execution Mode:** Read-only repository investigation and evidence extraction
- **Implementation Agent:** Jules

This report serves as a factual, repository-grounded extraction of the implemented Registry fixture and seed contracts. It provides the Council with precise technical constraints to ensure any drafted seed fixture remains structurally and programmatically valid under the active codebase rules.

---

## 2. Repository and Commit Receipt

- **Audited Commit SHA:** `1e22764b81d9f71d22c657728a052d2470efac33`
- **Audited Branch:** `jules-15656378126436390300-766d7b75`
- **Working-Tree Status:** Clean (with only the authorized report file under creation/modification)
- **Environment Versions:**
  - **Node.js:** `v22.22.1`
  - **pnpm:** `10.30.3`
  - **PostgreSQL:** `16.14`
  - **TypeScript:** `5.9.3`

---

## 3. Investigation Scope

The scope of this investigation is strictly limited to extracting:

1. The fixture manifest envelope structure and key validation constraints.
2. The exact field definitions, nullability, formats, and validators for the seven Registry collections.
3. The referential relationships and ordering validated by the seeder.
4. The CLI commands, environments, isolated paths, transaction boundaries, and outcomes of seed execution.
5. Cryptographic hashing (JCS, SHA-256), signature checks (Ed25519), key identifiers, and trust key sets.
6. Placement paths of database, contract, domain, CLI, and test modules.
7. The minimum structurally valid schema wedge configuration.

This investigation does not prescribe fixture contents or rotate production trust root material.

---

## 4. Evidence Methodology

To ensure absolute factual reliability, all claims are rigorously classified according to the mandated evidence disciplines:

- **"REPOSITORY-OBSERVED":** Directly verified from the final committed code structure, schema, configurations, and manifests.
- **"EXECUTION-OBSERVED":** Verified by observing output logs or executing Vitest suites under controlled settings in the repository sandbox.

Every reported contract details exact paths and symbols.

---

## 5. Fixture Manifest Contract

### 5.1 Format and Extension

- File extension must be exactly `.fixture.json` when running in `test-fixture` mode.
- _Evidence:_ `apps/api/src/registry/seed/seed-cli.ts` (Lines 87-90) — `if (!manifestPathStr.endsWith(".fixture.json")) { ... process.exit(6); }`

### 5.2 Recognized Locations

- For `test-fixture` mode, the manifest MUST reside in the canonical fixtures directory:
  `apps/api/src/registry/infrastructure/persistence/fixtures/`
- _Evidence:_ `apps/api/src/registry/seed/seed-cli.ts` (Lines 93-98)

### 5.3 Complete Manifest Structure & Required Top-Level Fields

The manifest JSON contains exactly these nine top-level keys. Additional top-level fields are strictly prohibited and cause `ValidationRefusal`.

```typescript
export interface SeedManifest {
  readonly manifestId: string; // Valid UUID string (RFC 4122)
  readonly manifestVersion: "1.0.0"; // Must be exactly "1.0.0"
  readonly authorityReference: string; // Non-empty string
  readonly keyId: string; // Non-empty string matching key convention
  readonly integrityAlgorithm: "SHA-256"; // Must be exactly "SHA-256"
  readonly integrityDigest: string; // Exactly 64 lowercase hex characters
  readonly signatureAlgorithm: "Ed25519"; // Must be exactly "Ed25519"
  readonly signature: string; // Non-empty Base64 signature
  readonly records: SeedManifestRecords; // Container object for collection arrays
}
```

- _Evidence:_ `apps/api/src/registry/seed/seed-manifest.ts` & `apps/api/src/registry/seed/seed-manifest-loader.ts` (Lines 37-142)

### 5.4 Collection Names

Inside the `records` object, all seven collections must be defined as arrays. Omitted collections are prohibited and trigger `ValidationRefusal`.

1. `referents` (Array)
2. `identities` (Array)
3. `evidence` (Array)
4. `policies` (Array)
5. `authorities` (Array)
6. `capabilities` (Array)
7. `standings` (Array)

- _Evidence:_ `apps/api/src/registry/seed/seed-manifest-loader.ts` (Lines 144-184)

### 5.5 Canonical Serialization / Normalization

- Before verifying integrity and signature, the record collections or envelope elements are normalized using RFC 8785 JSON Canonicalization Scheme (JCS).
- _Evidence:_ `apps/api/src/registry/seed/seed-integrity.ts` (Lines 9-11) & `packages/domain/src/seed-helpers.ts` (Lines 111-137)

---

## 6. Registry Record Contracts

Every collection record must satisfy strict Domain-level validation rules.

### 6.1 Referents

- **Collection Name:** `referents`
- **Record Type:** `ReferentRecord` (`packages/domain/src/index.ts`)
- **Required Fields:**
  - `referentId`: Primitive non-empty string.
  - `referentType`: String enum exactly restricted to `"product" | "brand" | "manufacturer"`.
  - `name`: Primitive non-empty string.
  - `parentReferentId`: String or `null` (Self-referencing parent is prohibited: `parentReferentId !== referentId`).
  - `createdAt`: ISO-8601 UTC timestamp string.
- **Nullability:** Only `parentReferentId` may be `null`.
- **Database Generated Fields:** None. All fields are supplied by the seed manifest.

### 6.2 Identities

- **Collection Name:** `identities`
- **Record Type:** `IdentityRecord` (`packages/domain/src/index.ts`)
- **Required Fields:**
  - `identityId`: Primitive non-empty string.
  - `identityType`: Primitive non-empty string.
  - `canonicalReference`: Primitive non-empty string.
  - `referentId`: String or `null` (logical link to `ReferentRecord`).
  - `status`: String enum exactly restricted to `"draft" | "active" | "decommissioned"`.
  - `createdAt`: ISO-8601 UTC timestamp string.
  - `updatedAt`: ISO-8601 UTC timestamp string.
- **Nullability:** Only `referentId` may be `null`.

### 6.3 Evidence

- **Collection Name:** `evidence`
- **Record Type:** `EvidenceRecord` (`packages/domain/src/index.ts`)
- **Required Fields:**
  - `evidenceId`: Primitive non-empty string.
  - `identityId`: Primitive non-empty string.
  - `evidenceType`: Primitive non-empty string.
  - `hash`: Primitive non-empty string.
  - `storageRef`: Primitive non-empty string.
  - `retrievedAt`: ISO-8601 UTC timestamp string.
- **Nullability:** No fields may be `null`.

### 6.4 Policies

- **Collection Name:** `policies`
- **Record Type:** `PolicyRecord` (`packages/domain/src/index.ts`)
- **Required Fields:**
  - `policyId`: Primitive non-empty string.
  - `policyType`: Primitive non-empty string.
  - `version`: Primitive non-empty string.
  - `definition`: Recursive finite JSON-safe structure (Prototype must be `Object.prototype` or `null`, no cyclic references permitted).
  - `active`: Strictly boolean primitive.
- **Nullability:** `definition` may be `null` or carry nested nulls.

### 6.5 Authorities

- **Collection Name:** `authorities`
- **Record Type:** `AuthorityRecord` (`packages/domain/src/index.ts`)
- **Required Fields:**
  - `authorityId`: Primitive non-empty string.
  - `subjectId`: Primitive non-empty string.
  - `scope`: Primitive non-empty string.
  - `validFrom`: ISO-8601 UTC timestamp string.
  - `validTo`: ISO-8601 UTC timestamp string (`validTo` must not be chronologically before `validFrom`).
- **Nullability:** No fields may be `null`.

### 6.6 Capabilities

- **Collection Name:** `capabilities`
- **Record Type:** `CapabilityRecord` (`packages/domain/src/index.ts`)
- **Required Fields:**
  - `capabilityId`: Primitive non-empty string.
  - `subjectId`: Primitive non-empty string.
  - `scope`: Primitive non-empty string.
  - `validFrom`: ISO-8601 UTC timestamp string.
  - `validTo`: ISO-8601 UTC timestamp string (`validTo` must not be chronologically before `validFrom`).
- **Nullability:** No fields may be `null`.

### 6.7 Standings

- **Collection Name:** `standings`
- **Record Type:** `StandingRecord` (`packages/domain/src/index.ts`)
- **Required Fields:**
  - `standingId`: Primitive non-empty string.
  - `subjectId`: Primitive non-empty string.
  - `scope`: Primitive non-empty string.
  - `validFrom`: ISO-8601 UTC timestamp string.
  - `validTo`: ISO-8601 UTC timestamp string (`validTo` must not be chronologically before `validFrom`).
- **Nullability:** No fields may be `null`.

---

## 7. Cross-Record Relationship Matrix

The seeder enforces logical and database referential integrity during parse and execution.

| Source Collection / Field    | Target Collection / Field | Cardinality    | Enforced By                   | Failure Behavior                  |
| ---------------------------- | ------------------------- | -------------- | ----------------------------- | --------------------------------- |
| `referents.parentReferentId` | `referents.referentId`    | N:1 (Optional) | Database FK & Manifest Loader | `REFERENTIAL_INTEGRITY_VIOLATION` |
| `identities.referentId`      | `referents.referentId`    | N:1 (Optional) | Database FK & Manifest Loader | `REFERENTIAL_INTEGRITY_VIOLATION` |
| `evidence.identityId`        | `identities.identityId`   | N:1 (Required) | Database FK & Manifest Loader | `REFERENTIAL_INTEGRITY_VIOLATION` |

_Note:_ For `authorities`, `capabilities`, and `standings`, the database schema maps their `subject_id` field strictly against `identities.id` when looked up via the Postgres API Repository lookup transaction. However, the database schema doesn't enforce a physical foreign key constraint on the `subject_id` column itself to allow open subject references, though lookups strictly match `subject_id === identityId`.

---

## 8. Seed Execution Contract

### 8.1 Command Entrypoint

- `pnpm registry:seed -- --mode test-fixture --manifest <path>`
- _Evidence:_ `apps/api/src/registry/seed/seed-cli.ts` (Lines 11-15)

### 8.2 Environment and DB Restrictions

- If mode is `test-fixture`, the seeder strictly enforces `process.env.PGDATABASE === "zyppi_test"`. If absent or pointing elsewhere, it fails closed immediately.
- _Evidence:_ `apps/api/src/registry/seed/seed-cli.ts` (Lines 105-110)

### 8.3 Supported Outcome Set & Exit Codes

- **Success (0):** The database is completely empty of the declared records, and they are successfully written in the correct topological order.
- **AlreadyMaterialized (0):** The database already contains all declared manifest records, and their fields are 100% equivalent (no writes are executed).
- **StateDiverged (2):** One or more records with the same primary key exist in the database, but their field contents differ from the manifest.
- **PartialStateAnomaly (3):** Some manifest records exist in the database as equivalent, but others are absent.
- **IntegrityRefusal (4):** Manifest `integrityDigest` does not match the recomputed SHA-256 of canonical JCS records.
- **AuthorityRefusal (5):** Manifest cryptographic signature or key id validation fails against the trusted key set.
- **ValidationRefusal (6):** JSON parse error, malformed envelope, type violation, duplicate ID within arrays, or referential mismatch in loader.
- **InfrastructureFailure (1):** Statement timeout, connection down, serialization conflict, or driver abort.
- _Evidence:_ `apps/api/src/registry/seed/seed-cli.ts` (Lines 195-231) & `apps/api/src/registry/seed/postgres-registry-seeder.ts`

### 8.4 Materialization Topological Order

To prevent foreign key violations, records are inserted in this strict sequential order:

1. `referents`
2. `identities`
3. `evidence`
4. `policies`
5. `authorities`
6. `capabilities`
7. `standings`

- _Evidence:_ `apps/api/src/registry/seed/postgres-registry-seeder.ts` (Lines 190-244)

### 8.5 Transaction Boundaries

- Seeding executes inside a single, dedicated PostgreSQL transaction.
- Isolation level is configured to `SERIALIZABLE` isolation.
- Database statement timeout is configured to `30000` milliseconds via `SET LOCAL statement_timeout = 30000;`.
- _Evidence:_ `apps/api/src/registry/seed/postgres-registry-seeder.ts` (Lines 142-146)

### 8.6 Idempotency Comparison Method

- Before executing any database mutations, the seeder queries the records on-disk and performs a field-by-field semantic equivalence comparison using `areRegistryRecordsEquivalent` from `@zyppi/domain`, ignoring write-only metadata and treating `null` vs `undefined` as strictly non-equivalent.
- _Evidence:_ `packages/domain/src/seed-helpers.ts` (Lines 163-238)

---

## 9. Integrity, Signature, and Trust Contract

### 9.1 Integrity Algorithm

- Exactly `SHA-256` computed over canonical JCS.
- _Evidence:_ `apps/api/src/registry/seed/seed-integrity.ts` (Lines 14-16)

### 9.2 Signature Algorithm

- Exactly `Ed25519` over the signed envelope fields.
- _Evidence:_ `apps/api/src/registry/seed/seed-authority.ts` (Lines 147-151)

### 9.3 Public Trust Set Configuration

- **Production trust set:** Strictly empty (`PRODUCTION_TRUST_SET = []`). No production root is committed.
- **Test-fixture trust set:** Defined in `test-trust-set.ts` with two active keys:
  - `keyId`: `zyppi-seed-ed25519-2026-v1`
  - `keyId`: `zyppi-seed-ed25519-2026-revoked` (marked revoked)
- **Key naming convention:** Strictly matches `/^zyppi-seed-ed25519-\d{4}-v\d+$/`.
- _Evidence:_ `apps/api/src/registry/seed/seed-trust-set.ts`, `apps/api/src/registry/seed/test-trust-set.ts`, & `apps/api/src/registry/seed/seed-authority.ts` (Lines 11-13)

---

## 10. Repository Placement and Discovery Map

The physical files establishing these seeding and validation behaviors are mapped as follows:

- **Fixture Canonical Directory:**
  - `apps/api/src/registry/infrastructure/persistence/fixtures/`
  - _Establishes:_ Canonical location for `.fixture.json` files.
- **Seed Command CLI:**
  - `apps/api/src/registry/seed/seed-cli.ts`
  - _Establishes:_ Execution parsing, mode checks, and DB environment validations.
- **Seeder Engine:**
  - `apps/api/src/registry/seed/postgres-registry-seeder.ts`
  - _Establishes:_ Isolation level, database insertion topological order, and transaction limits.
- **Trust Keys:**
  - `apps/api/src/registry/seed/seed-trust-set.ts` & `test-trust-set.ts`
  - _Establishes:_ Active key records and cryptographic signature boundaries.
- **Integrity Calculation Helpers:**
  - `packages/domain/src/seed-helpers.ts`
  - _Establishes:_ Canonical JCS serialization and field-level semantic equivalence.

---

## 11. Minimum Structurally Valid Wedge Analysis

A minimum structurally valid Registry fixture representation must declare all seven collection arrays to bypass the loader's strict shape validations.

### 11.1 Collection Empty/Omitted Rules

- All 7 collection fields must exist in the `records` object of the manifest.
- **Omitted Collections:** Unsupported.
- **Empty Collections:** Fully supported. It is structurally valid to pass empty arrays (`[]`) for any or all collection fields, provided they are declared.

### 11.2 Minimum Relation Graph

To satisfy database foreign-key constraints, if any of the following items are declared, they must exist in a topological hierarchy:

1. `identities` can be created independently if `referentId` is `null`.
2. `evidence` requires at least one `IdentityRecord` to exist matching `evidence.identityId`.
3. `referents` parent-child relationships require the referenced `parentReferentId` to be declared as an independent `ReferentRecord`.

### 11.3 Minimum Structurally Valid Wedge Placeholder (Symbolic Map)

```json
{
  "manifestId": "00000000-0000-0000-0000-000000000001",
  "manifestVersion": "1.0.0",
  "authorityReference": "zyppi:council:test-authority",
  "keyId": "zyppi-seed-ed25519-2026-v1",
  "integrityAlgorithm": "SHA-256",
  "integrityDigest": "COMPUTED_SHA256_HEX_DIGEST",
  "signatureAlgorithm": "Ed25519",
  "signature": "COMPUTED_ED25519_BASE64_SIGNATURE",
  "records": {
    "referents": [],
    "identities": [],
    "evidence": [],
    "policies": [],
    "authorities": [],
    "capabilities": [],
    "standings": []
  }
}
```

This is the absolute smallest, structurally valid wedge. It is completely empty but perfectly parseable.

---

## 12. Implementation Constraints Affecting M05-SFA Drafting

1. **Top-Level Field Constraint:** Any additional top-level keys added to the manifest file will cause a `ValidationRefusal` exit.
2. **File Placement and Mode Constraint:** In test-fixture mode, files must end with `.fixture.json` and reside strictly in `apps/api/src/registry/infrastructure/persistence/fixtures/`.
3. **Database Guard Constraint:** Seeding in test-fixture mode will immediately fail-closed if `PGDATABASE` is not `"zyppi_test"`.
4. **Signature Envelope Constraint:** The signature calculation covers a canonical JCS of exactly the seven top-level envelope fields. Any variation in JCS keys will invalidate the signature.

---

## 13. Findings Register

- **Finding ID:** `M05-SFA-F01`
- **Classification:** `NO FINDING`
- **Impact:** System integrity is highly secure and fully conforms to expectations.

---

## 14. Explicit Unknowns and Gaps

- **"NOT ESTABLISHED BY CURRENT IMPLEMENTATION":** Production cryptographic signing private key. The private key corresponding to the public key root in `PRODUCTION_TRUST_SET` is not stored, committed, or available anywhere in the repository, guaranteeing that production manifests cannot be signed maliciously.

---

## 15. Council Handoff Summary

The Council is equipped with the complete technical specifications to draft a compatible seed fixture. Any drafted wedge must:

1. Reside in `apps/api/src/registry/infrastructure/persistence/fixtures/`.
2. Follow the `.fixture.json` extension.
3. Contain all nine top-level envelope fields.
4. Contain all seven record collection arrays under the `"records"` object.
5. Respect referential constraints (`identities -> referents`, `evidence -> identities`).
6. Sign using Ed25519 over the seven canonicalized signed envelope fields, referencing key `zyppi-seed-ed25519-2026-v1`.

---

## 16. Evidence Index with Paths, Symbols, and Tests

- **Fixture manifest contract:** `apps/api/src/registry/seed/seed-manifest.ts`
- **Strict envelope schema and loader:** `apps/api/src/registry/seed/seed-manifest-loader.ts`
- **Topological seeder operations:** `apps/api/src/registry/seed/postgres-registry-seeder.ts`
- **Deterministic cryptographic checks:** `apps/api/src/registry/seed/seed-integrity.ts` & `seed-authority.ts`
- **Active test key details:** `apps/api/src/registry/seed/test-trust-set.ts`
- **Automated test suite:** `apps/api/src/registry/seed/seed.test.ts`
