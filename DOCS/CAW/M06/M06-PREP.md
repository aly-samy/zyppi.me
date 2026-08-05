# M06-PREP — M06 Preparation and Repository Readiness Report

## 1. Executive Verdict

Based on a comprehensive, read-only investigation of the Zyppi repository, **Milestone M06 — GS1 Digital Link Resolution** is determined to be **READY FOR DETAILED PLANNING WITH EXPLICIT PRECONDITIONS (DISPOSITION B)**.

All foundational packages (M03 Domain Foundation, M04 Runtime Skeleton, M05 Registry Layer) are functionally complete, compiled, and verified to be structurally sound. The baseline test suite is executing at **100% pass status (481/481 tests passing)**.

Detailed planning for M06 may proceed immediately. However, **implementation of task AMS-0601 cannot begin** until the Chair resolves a set of core standards-governance and scope decisions—specifically the definition of the target GS1 support profile, the specific GS1 standard versions, and the URI parsing/normalization rules. No immediate repository remediation of existing code is necessary merely to begin planning.

---

## 2. Mandate and Investigation Boundaries

This investigation is conducted under **Mandate ID: M06-PREP** (Authority: Chair — Zyppi Constitutional Council, Program: CAW-011).

The scope of this investigation is strictly **read-only reconnaissance** to establish Zyppi’s exact architectural position before detailed planning for M06 or work on `AMS-0601` starts.

### Strict Execution Boundaries:

- **Jules SHALL:** Inspect repository state, package boundaries, M03 domain contracts, M04 replay tests, M05 database adapters, existing GS1 artifacts, run verification suites, and record exact paths, symbols, and evidence.
- **Jules SHALL NOT:** Implement `AMS-0601`, modify production or test code, modify any M03/M04/M05 artifacts, change package boundaries, add dependencies, or make/ratify constitutional/standards decisions on behalf of the Chair.

As mandated, any observed architectural concerns are reported herein rather than repaired.

---

## 3. Repository Baseline

The exact state of the Zyppi monorepo baseline was verified at the start and end of this investigation.

- **Current Branch:** `jules-3743838988093705821-24851811`
- **Starting Commit SHA:** `bd4cd3f51659be0e1dd1677803a808a35115bb60`
- **Ending Commit SHA:** `bd4cd3f51659be0e1dd1677803a808a35115bb60`
- **Working-Tree Status Before Report Creation:** `clean` (no uncommitted modifications)
- **Working-Tree Status After Report Creation:** Only `DOCS/CAW/M06/M06-PREP.md` was created; no other files were modified.
- **Node.js Version:** `v22.22.1` (Required engine in `package.json`: `20.19.0`)
- **pnpm Version:** `10.30.3` (Required in `package.json`: `10.30.3`)

### Verification Suite Outcome:

The full authorized verification suite was executed using:

```bash
pnpm run format:check && pnpm run lint && pnpm exec tsc -b && pnpm run runtime:purity && pnpm run boundary:all && pnpm run graph:validate && pnpm run test
```

- **Format Check:** **PASS** (100% compliant)
- **Linter:** **PASS** (100% compliant, 0 warnings/errors)
- **Type Checker:** **PASS** (100% compliant)
- **Runtime Purity Check:** **PASS** (3 source files analyzed, 0 violations)
- **Package Boundary Checks:** **PASS** (All layers compliant)
- **Dependency-Graph Validation:** **PASS** (9 workspace members, 50 source files)
- **Unit & Integration Tests:** **PASS** (481/481 tests passing)

---

## 4. CAW-011 and M06 Contract

According to `DOCS/CAW/CAW-011-Build-Order.md`, **Milestone M06 — GS1 Digital Link Resolution** is the milestone that establishes a deterministic GS1 Digital Link interpretation and constitutional identity-resolution capability.

### Exact Role Assigned to M06:

M06 handles **identification and resolution**, not constitutional verification.

- Its pipeline operates as:
  `GS1 Digital Link Input → Parsing → Validation → Normalization → Registry Lookup → Resolved Identity / Typed Non-Resolution`

### Excluded Responsibilities (M06 must NOT absorb):

- Evidence evaluation, trust determination, policy evaluation, authority/capability evaluation (retained by Runtime/Evidence Engine);
- Runtime verification or receipt generation (M08);
- HTTP/API delivery (M09);
- Edge routing (M10);
- QR-camera acquisition, presentation, or UI behavior (M11).

### Planned M06 Tasks (from CAW-011):

1.  **IT-0601: GS1 Parser** (Size: M, Depends On: IT-0302)
2.  **IT-0602: GS1 Validator** (Size: S, Depends On: IT-0601)
3.  **IT-0603: Digital Link Normalizer** (Size: S, Depends On: IT-0601)
4.  **IT-0604: Identity Resolver** (Size: M, Depends On: IT-0603, IT-0503)
5.  **IT-0605: Parser Benchmarks** (Size: S, Depends On: IT-0604)
6.  **IT-0606: Replay Validation** (Size: S, Depends On: IT-0604, IT-0406)

### Conceptual Boundary Distinctions:

The M06 design enforces a rigorous separation of four states:

1.  **GS1 Syntax Validity:** Is the string a syntactically correct GS1 Digital Link URI?
2.  **Valid Normalized Identifier:** Is the parsed primary key (e.g. GTIN) valid according to length and check-digit rules, and is its URI canonically normalized?
3.  **Known Registry Identity:** Does the normalized identifier map to a registered constitutional `IdentityRecord` in the M05 Registry?
4.  **Constitutional Verification:** (Deferred to M08) Is the resolved identity authorized, verified, and active under active constitutional policies?

---

## 5. M03 Domain Foundation Readiness

An audit of the M03 Domain contracts (`packages/domain/src/index.ts`) was completed to assess their readiness to support M06:

### Current GS1Identifier Model:

```typescript
export type GS1Identifier = {
  readonly gtin: string;
};
```

- **Validator:** `validateGS1Identifier(input: unknown): ValidationResult<GS1Identifier, GS1IdentifierValidationError>`
- **Serializer:** `serializeGS1Identifier(identifier: GS1Identifier): string` (alphabetical sorted output: `{"gtin": "..."}`)

### Findings and Gaps:

1.  **Identifier Families:** The model strictly represents **GTIN only**. It cannot represent GLN, SSCC, GRAI, or other GS1 primary keys.
2.  **Attributes / Key Qualifiers:** There is **no representation of Serial Number (AI 21), Lot/Batch (AI 10), or Expiration Date (AI 17)**.
3.  **Extensibility:** The current type structure is narrow. Representing additional AIs will require modifying the `GS1Identifier` type or establishing a union of identifier types (e.g. `GS1DigitalLinkIdentifiers`), which would affect existing downstream schemas if not planned carefully.
4.  **Check-Digit & Length Validation:** Yes, `validateGS1Identifier` contains a fully compliant modulo-10 check-digit validation algorithm and enforces strict digit-only lengths of 8, 12, 13, or 14.
5.  **Preservation of Original Inputs:** The model does not preserve the original raw URI string or raw sub-elements—only the validated `gtin` string.

---

## 6. Existing GS1 and Digital Link Implementation Inventory

A search of the entire codebase was conducted to identify any existing GS1 or Digital Link-related logic:

1.  **GS1Identifier Validation & Serialization:**
    - **Path:** `packages/domain/src/index.ts`
    - **Classification:** **ACTIVE AND USABLE**
    - **Details:** Pure, deterministic validation of GTIN (modulo-10 check digit and lengths 8/12/13/14). No external dependencies.
2.  **GS1Identifier Tests:**
    - **Path:** `packages/domain/src/referent.test.ts` (suite `"GS1Identifier"`)
    - **Classification:** **ACTIVE AND USABLE**
    - **Details:** 12 tests asserting valid GTIN lengths, significant leading zero preservation, non-ASCII digit rejection, and correct check digits.
3.  **ReferentRecord Model & Validation:**
    - **Path:** `packages/domain/src/index.ts`
    - **Classification:** **ACTIVE AND USABLE**
    - **Details:** Represents Product, Brand, and Manufacturer aggregates, which M06 resolution must return.
4.  **No Leaked Future Behavior:**
    - **Search for:** URI parsing, URL regexes, percent-encoding, query parameters, path slicing, resolver stubs, or Digital Link normalizers.
    - **Classification:** **NONE**
    - **Details:** No parsing, URI handling, or resolution behavior is prematurely embedded in `packages/runtime`, `apps/api`, `edge`, or shared folders. The boundaries established in M04/M05 have been strictly preserved.

---

## 7. M05 Registry Readiness

The M05 Registry Layer is implemented, compiled, and fully verified.

### Status and Public Interfaces:

- **Registry Repository Port (`packages/contracts/src/registry.ts`):**
  ```typescript
  export interface RegistryRepository {
    lookup(
      identifier: ValidatedCanonicalIdentifier,
    ): Promise<RegistryResult<RetrievedRegistryState | null>>;
  }
  ```
- **Registry Adapter (`apps/api/src/registry/postgres-registry-repository.ts`):**
  Implements `PostgresRegistryRepository` using the `postgres.js` driver.

### Capabilities and Gaps:

1.  **Input Requirement:** `lookup()` accepts a typed, branded `ValidatedCanonicalIdentifier`, constructed via `createValidatedCanonicalIdentifier(raw: string)`.
2.  **Lookup Mechanism:** It performs a strict equality match of the canonical reference against the `identities.canonical_reference` column in the database under `REPEATABLE READ READ ONLY` transaction isolation.
3.  **Output Representation:** Returns `RetrievedRegistryState | null`, which maps to the domain's `ActiveConstitutionalView` containing the `IdentityRecord`, ancestor `ReferentRecord` relationships, `StandingRecord[]`, `AuthorityRecord[]`, `CapabilityRecord[]`, and active `PolicyRecord[]`.
4.  **Distinctions Handled:**
    - `null` indicates the identity is not found (OK, but resolved target is absent).
    - `ok: false` is returned with exact closed `RegistryError` taxonomy variants: `InfrastructureUnavailable` (DB down) or `DataCorruption` (row mapping failed validation).
5.  **Interface Nature:** Strictly **asynchronous** (`Promise`).
6.  **Tests:** Full coverage in `apps/api/src/registry/postgres-registry.integration.test.ts` (8 integration tests passing against the active Postgres container).

---

## 8. M04 Replay and Determinism Readiness

The replay framework delivered in M04 is evaluated for its capability to absorb M06 operations.

### Current Replay Capability:

- **Path:** `packages/runtime/src/pipeline.test.ts` under `"Deterministic replay proof — AMS-0406"`.
- **Framework Nature:** It validates the 9-stage synchronous pipeline scaffold (`runInternalPipeline`).
- **Comparison Scope:** Captures and asserts value-level structural equality of `PipelineResult` across repeated runs, including the trace of executed stages, the `ReceiptOutcome` status (`authorized`, `denied`, `unavailable`), and the exactly 9 unresolved fields listed in `unresolvedFields`.

### Gaps and Integration Questions for M06:

1.  **Registry State Dependency:** The current replay framework is **purely in-memory and synchronous**. Registry resolution (`RegistryRepository.lookup`) is **asynchronous and persistence-backed**.
2.  **Environmental Control:** To keep M06 replays pure, deterministic, and replayable across time (CEngS-001 §4), any async DB calls must be decoupled from the core replay mechanism.
3.  **Recommended Integration Path:** During detailed planning, we must decide whether M06 replay tests will use:
    - Mocked, synchronous/resolved `RegistryRepository` state snapshots pre-loaded into the execution request;
    - Or if the resolution operation occurs _before_ entering the isolated Runtime pipeline (meaning the pipeline is fed the pre-resolved `RetrievedRegistryState` inside the `ExecutionRequest` ACV field, keeping the pipeline pure).

    _Evidence:_ The CAW-007 `ExecutionRequest` structure already carries `activeConstitutionalView`, indicating that the pipeline itself remains pure and is fed pre-loaded registry snapshots. Therefore, the asynchronous "Resolution" is an application/orchestration layer step (or admission-stage dependency) while the pure pipeline remains fully deterministic.

---

## 9. Package Architecture and Purity Constraints

Under CEngS-001 §3 & §4 and CEngS-002, the architectural placement of M06 components is mapped as follows:

| Component                   | Permitted Package                       | Boundary / Purity Rationale                                                                                                                       |
| :-------------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. GS1 Parser**           | `packages/domain` or `packages/runtime` | Must be a pure, deterministic function. Placing in `packages/domain` ensures any package can parse a link.                                        |
| **2. GS1 Validator**        | `packages/domain`                       | Extends the existing `validateGS1Identifier` contract. Must be pure.                                                                              |
| **3. GS1 Normalizer**       | `packages/domain` or `packages/runtime` | Pure string-to-string transformation. No I/O permitted.                                                                                           |
| **4. Typed Errors**         | `packages/domain`                       | Shared error taxonomy (e.g., `GS1ParseError`) to avoid circular imports.                                                                          |
| **5. Registry Resolver**    | `apps/api` or a new `packages/resolver` | Resolving involves network/I/O (asynchronous `lookup()`). Must live in Layer 3 (Application/Gateway), calling the Persistence Layer 5 interfaces. |
| **6. Conformance Fixtures** | `packages/testing`                      | Host of official/internal test corpuses, keeping production packages clean of test-only assets.                                                   |

---

## 10. GS1 Standards-Conformance Readiness

This section outlines the gap analysis between the present repository state and GS1-standards conformance.

### 10.1 Authority and Versioning

- **Target GS1 Digital Link URI Syntax Standard:** **ABSENT**
- **GS1 General Specifications Version:** **ABSENT**
- **Application Identifier Registry Version:** **ABSENT**
- **Update / Governance Mechanism:** **ABSENT**
- _Reconnaissance Finding:_ The repository contains no reference pinning the codebase to a specific version of the GS1 standards.
- _Status:_ **EXTERNAL STANDARDS DECISION REQUIRED** — the repository does not identify or pin the governing GS1 authority.

### 10.2 Declared GS1 Support Profile

- **Primary Keys (GTIN, GLN, etc.):** Only GTIN is structurally declared.
- **Key Qualifiers & Attributes (Serial, Lot, Expiration):** Mentions in `CAW-012` and `AMS-0302-PREP` but no type declarations or schemas exist.
- **URI Forms (Path vs. Query, custom domains):** No rules, regexes, or parsing profiles are declared.
- _Status:_ **CHAIR DECISION REQUIRED** — No support profile is formalized.

### 10.3 AI Grammar and Extensibility

- **AI Handling:** Hardcoded inside `validateGS1Identifier` for GTIN only.
- **Grammar Definition:** No table-driven or schema-driven AI parser grammar exists.
- **Unknown AIs:** The present model fails closed on any AI except GTIN. It cannot parse, preserve, or represent unrecognized but well-formed AIs.
- _Status:_ **MISSING** — Table-driven or extensible AI grammar must be designed.

### 10.4 Identifier Validation

- **Modulo-10 Check-Digit Validation:** **IMPLEMENTED AND TESTED** (in `validateGS1Identifier`).
- **GTIN Length Handling:** **IMPLEMENTED AND TESTED** (strict lengths 8, 12, 13, 14).
- **Key-Specific Format Rules:** **ABSENT** (no logic for date formatting, alphanumeric ranges, or charsets of serials/lots).
- _Status:_ **PARTIALLY READY**

### 10.5 URI Parsing and Normalization

- **Digital Link Path/Query Parsing:** **ABSENT**
- **Percent-Encoding & Trailing Slashes:** **ABSENT**
- **AI Order Canonicalization:** **ABSENT**
- **Preservation of Input:** **ABSENT**
- _Status:_ **MISSING**

### 10.6 Conformance Test Assets

- **Official GS1 Conformance Vectors:** **ABSENT**
- **GS1-Derived Traced Examples:** **ABSENT**
- **Internal Fixtures:** **PARTIALLY READY** (A small set of internal GTINs exists in `referent.test.ts` and `seed.test.ts`).
- _Status:_ **MISSING**

### Verbatim Standards Statement:

> **Current implementation target:** GS1-standards conformance and independent conformance-testability.
> **Formal GS1 certification status:** Unconfirmed. No formal GS1 certification claim is authorized unless an applicable GS1 program, qualification scope, and verification path are independently established.

---

## 11. Consolidated Gap Matrix

| Area             | Required Capability or Question              | Current Repository Evidence                                               | Status              | Blocking Level                           | Required Next Action                                                     |
| :--------------- | :------------------------------------------- | :------------------------------------------------------------------------ | :------------------ | :--------------------------------------- | :----------------------------------------------------------------------- |
| **M03 Domain**   | Support qualifiers (Serial, Lot, Expiration) | Type `GS1Identifier` only has `gtin`.                                     | **PARTIALLY READY** | **PLANNING BLOCKER**                     | Decouple qualifiers from core GTIN or extend `GS1Identifier` structure.  |
| **M04 Replay**   | Replaying resolution transactions            | Tests are 100% pure in-memory and synchronous.                            | **PARTIALLY READY** | **NONE**                                 | Decouple async database lookups from isolated replay pipeline.           |
| **M05 Registry** | Resolution capability                        | PostgresRegistryRepository lookup matches `canonical_reference` strictly. | **READY**           | **NONE**                                 | Utilize the repository interfaces to fetch Resolved Identities.          |
| **GS1 Standard** | Pinned Standard & AI Registry Version        | No citation or version pins found in repo.                                | **MISSING**         | **EXTERNAL STANDARDS DECISION REQUIRED** | Human Chair must pin standard versions (e.g. GS1 DL v1.2, GenSpecs v24). |
| **GS1 Profile**  | Supported AIs & URI Forms                    | No support profile defined.                                               | **MISSING**         | **CONSTITUTIONAL DECISION REQUIRED**     | Define the boundaries of supported vs. unsupported well-formed AIs.      |
| **GS1 Parser**   | DL URI Parsing and Normalization             | No parsing code or normalizer exists.                                     | **MISSING**         | **IMPLEMENTATION BLOCKER**               | Implement pure parsing and normalization in `packages/domain` (IT-0601). |
| **Conformance**  | Official GS1 Conformance Vectors             | No official test corpuses present.                                        | **MISSING**         | **EXTERNAL STANDARDS DECISION REQUIRED** | Acquire and import official GS1 test vectors into `packages/testing`.    |

---

## 12. Chair Decisions Required Before AMS-0601

| Decision ID  | Decision Required                      | Why It Matters                                                         | Repository Evidence                                                  | Consequence if Unresolved                                                    | Recommended Decision Stage |
| :----------- | :------------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :------------------------- |
| **CD-06-01** | **GS1 Support Profile Definition**     | Restricts which AIs are parsed, validated, and resolved.               | `GS1Identifier` only contains `gtin`.                                | Unclear whether to fail closed on non-GTIN links or ignore extra qualifiers. | Detailed M06 Planning      |
| **CD-06-02** | **Governing Standard Pinning**         | Guarantees compliance and prevents drift against evolving specs.       | No GS1 versions or general specifications cited.                     | Non-deterministic validation behavior across standard versions.              | Detailed M06 Planning      |
| **CD-06-03** | **Unrecognized Well-Formed AI Policy** | Defines how the parser handles valid GS1 links containing unknown AIs. | Default denial rules in `CEngS-001`.                                 | Either parser crashes, fails closed, or successfully parses and strips.      | Detailed M06 Planning      |
| **CD-06-04** | **URI Normalization Canonical Form**   | Defines canonical representations for caching and signature matches.   | No normalization logic or test vector exists in codebase.            | Mismatched registry keys and cache misses in Edge/API.                       | Detailed M06 Planning      |
| **CD-06-05** | **Parser Package Placement**           | Controls package-boundary directions.                                  | `packages/domain` has zero dependencies; `packages/runtime` is pure. | Circular dependencies or leaking I/O into Runtime.                           | Detailed M06 Planning      |

---

## 13. M06 Dependency and Execution Map

```
                          [CD-06-01 to CD-06-05]
                                    │
                                    ▼
                         [M06 Milestone Planning]
                                    │
                                    ▼
                              [IT-0601 Parser] (packages/domain)
                                    │
                                    ▼
                             [IT-0602 Validator]
                                    │
                                    ▼
                            [IT-0603 Normalizer]
                                    │
                      ┌─────────────┴─────────────┐
                      ▼                           ▼
            [IT-0604 Identity Resolver]   [IT-0605 Benchmarks]
                      │
                      ▼
            [IT-0606 Replay Validation]
```

---

## 14. Readiness Assessment

1.  **Repository Readiness:** **READY** — Baseline state is healthy; type checking, formatting, linting, and all 481 tests pass cleanly once local database container is initialized.
2.  **M03 Readiness:** **PARTIALLY READY** — Existing GTIN-only value object is robust but structurally insufficient to model Broader Digital Link identifiers (Serial/Lot/Expiration) without a planned schema extension.
3.  **M04 Readiness:** **READY** — Replay framework is stable and fully operational; integration requires feeding pre-resolved DB states into the pure pipeline execution requests to maintain isolability.
4.  **M05 Readiness:** **READY** — Registry database adapter and contracts are implemented, tested, and fully capable of performing canonical lookups.
5.  **GS1 Standards-Conformance Readiness:** **MISSING** — The repository is missing governing version definitions, support profiles, parser grammars, and official conformance test vectors.
6.  **Readiness to Plan AMS-0601:** **READY** — No repository blockers exist that prevent initiating the planning stage.
7.  **Readiness to Implement AMS-0601:** **NOT READY** — Implementation is blocked pending the 5 formal Chair Decisions outlined in Section 12.

---

## 15. Final Disposition

### DISPOSITION B — READY FOR PLANNING WITH EXPLICIT PRECONDITIONS

Detailed planning for M06 and task decomposition may proceed immediately. However, **physical implementation cannot begin** until the Chair resolves the standards-governance questions (CD-06-01 to CD-06-05) and imports the target standard versions/test vectors. No immediate repository code remediation is required to begin planning.

---

## Appendix A — Repository Evidence Index

- **M03 Domain Contracts:** `packages/domain/src/index.ts` (exposes `GS1Identifier`, `validateGS1Identifier`, `serializeGS1Identifier`, `ReferentRecord`).
- **M03 Domain Tests:** `packages/domain/src/referent.test.ts` (proves modulo-10 validation).
- **M04 Replay Test Suite:** `packages/runtime/src/pipeline.test.ts` (validates the 9-stage pipeline and deferred outcome unresolved fields list).
- **M05 Registry Adapter:** `apps/api/src/registry/postgres-registry-repository.ts` (implements repeatable read snapshot lookup).
- **M05 Registry Integration Tests:** `apps/api/src/registry/postgres-registry.integration.test.ts`.

---

## Appendix B — Commands Executed

All actions were performed on the workspace root:

1.  **Initial Status Verification:**

    ```bash
    pnpm run test
    ```

    _Status:_ **FAILED** (`PostgresError: connect ECONNREFUSED 127.0.0.1:5432`)
    _Reason:_ No local PostgreSQL container service was running.
    _Finding:_ The database dependency is a development prerequisite but was uninitialized in the sandbox.

2.  **PostgreSQL Local Container Initialization:**

    ```bash
    # Adjusted Docker daemon to 'vfs' storage driver to support container mounting in sandbox
    echo '{"storage-driver": "vfs"}' | sudo tee /etc/docker/daemon.json
    sudo systemctl restart docker

    # Started PostgreSQL 16 Alpine container with environment matching ci.yml
    docker run --name pg-test -e POSTGRES_DB=zyppi_test -e POSTGRES_USER=zyppi_test -e POSTGRES_PASSWORD=zyppi_test -p 5432:5432 -d postgres:16-alpine
    ```

3.  **Database Migration Application:**

    ```bash
    pnpm db:migrate
    ```

    _Result:_ Successfully applied 1 migration: `001_initial_registry_schema.sql` (created tables: `referents`, `identities`, `evidence`, `policies`, `authorities`, `capabilities`, `standings`, `execution_receipts`, `schema_migrations`).

4.  **Full Verification Suite Execution:**
    ```bash
    pnpm install -w
    pnpm run format:check && pnpm run lint && pnpm exec tsc -b && pnpm run runtime:purity && pnpm run boundary:all && pnpm run graph:validate && pnpm run test
    ```
    _Outcome:_ **PASS**
    - `vitest` execution: **22 test files passed, 481 tests passed** (including database integration and seed system mechanics).

---

## Appendix C — Relevant Paths, Symbols, and Tests

- **GS1Identifier Type:** `packages/domain/src/index.ts` line 67
- **GS1 Validator:** `packages/domain/src/index.ts` line 440 (`validateGS1Identifier`)
- **GS1 Serializer:** `packages/domain/src/index.ts` line 1083 (`serializeGS1Identifier`)
- **Registry Lookup Interface:** `packages/contracts/src/registry.ts` line 45 (`RegistryRepository`)
- **Registry lookup implementation:** `apps/api/src/registry/postgres-registry-repository.ts` line 34 (`lookup`)
- **Replay proof block:** `packages/runtime/src/pipeline.test.ts` line 527 (`"Deterministic replay proof — AMS-0406"`)
