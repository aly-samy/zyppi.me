# M04-PREP — Repository Reconnaissance Report

**Mandate ID:** M04-PREP
**Milestone:** M04 — Runtime Skeleton
**Report Date:** March 9, 2025

---

## 1. Report Identity and Investigation Scope

This report is a factual repository reconnaissance artifact produced by the Repository Reconnaissance and Evidence-Extraction Agent. It establishes the current, verifiable repository reality as accurately and completely as possible to enable the Zyppi Constitutional Council to plan and execute Milestone M04.

- **Document Title:** JULES MANDATE — M04-PREP REPOSITORY RECONNAISSANCE
- **Mandate ID:** M04-PREP
- **Milestone:** Milestone M04 — Runtime Skeleton
- **Report Date:** March 9, 2025
- **Current Branch:** `jules-2697095110495339641-c8a1d239`
- **Starting Commit SHA:** `5d6d09d049478a6742c1bcca1ef4565a71fefe3c`
- **Ending Commit SHA:** `5d6d09d049478a6742c1bcca1ef4565a71fefe3c`
- **Ending Commit Differs from Starting Commit:** No (the working tree state remains at the starting commit; only this report file has been added to the working tree).
- **Working-Tree Status Before Investigation:** Clean (zero modified, staged, or untracked files).
- **Working-Tree Status After Report Creation:** Contains exactly one new untracked file (`DOCS/CAW/AMS/M04-PREP.md`).
- **Modification Disclaimer:** No production source files, test files, package manifests, configurations, tooling scripts, roadmaps, or existing governance documents were written, modified, moved, renamed, or deleted during this investigation.

**Definitive Disclaimer:**
This report is a repository reconnaissance artifact and does not constitute:

- Milestone M04 planning;
- Architectural approval;
- Constitutional interpretation;
- Implementation authorization;
- Milestone readiness certification.

---

## 2. Executive Repository Snapshot

This section summarizes the verifiable repository reality at the time of the investigation:

- **Repository and Workspace Structure:** A clean, fully functional `pnpm` monorepo containing 8 workspace packages conforming to CAW-004 dependency boundaries.
- **Current Status of `packages/runtime`:** Scaffolded but empty. The package compiles cleanly and passes boundary and purity checks, but contains no functional execution pipeline, context handling, or evaluation logic.
- **Current Status of `@zyppi/domain` as an M04 Dependency:** Highly stable and fully validated under M03. Its 68 exported types, interfaces, and validation/serialization functions represent a robust public boundary ready to be consumed.
- **Current Status of M04 Tasks in CAW-011:** All seven tasks (`IT-0401` through `IT-0407`) are currently marked as `☐` (Planned).
- **Baseline Verification State:** Complete PASS. All formatter, linter, compiler, runtime purity, package boundary, dependency graph, and test execution commands pass successfully with zero errors or warnings (except Node engine version warnings).
- **Council Attention Areas:** Mismatches between `packages/runtime` tsconfig references and package.json manifest declarations (lack of workspace dependencies), and slight verbosity differences in M04 constraints across historical and active roadmap documents.

---

## 3. Current Repository and Git State

1.  **Current Branch:** `jules-2697095110495339641-c8a1d239`
2.  **Starting Commit SHA:** `5d6d09d049478a6742c1bcca1ef4565a71fefe3c`
3.  **Working-Tree Status Before Report Creation:** Clean.
4.  **Pre-Existing Git State:** No untracked, modified, staged, or deleted files were present prior to the investigation.
5.  **Current Workspace Layout:**
    - `apps/` — Executable applications (`api`, `web`).
    - `packages/` — Monorepo library packages (`contracts`, `domain`, `runtime`, `shared`, `testing`).
    - `edge/` — Edge deployment target (`worker`).
    - `tools/` — Code quality, purity, boundary, and dependency graph validation utilities.
6.  **Relevant Package Directories:**
    - `packages/domain`
    - `packages/shared`
    - `packages/contracts`
    - `packages/runtime`
    - `packages/testing`
    - `apps/api`
    - `apps/web`
    - `edge/worker`
7.  **`packages/runtime` Existence:** Confirmed.
8.  **`packages/runtime` Implementation State:** Scaffolded only. Contains only config files (`package.json`, `tsconfig.json`) and a single, empty entry point file (`src/index.ts`). No functional implementations, tests, or documentation are present.
9.  **Ending Commit SHA:** `5d6d09d049478a6742c1bcca1ef4565a71fefe3c`
10. **Working-Tree Status After Report Creation:** One untracked file (`DOCS/CAW/AMS/M04-PREP.md`).

---

## 4. Exact CAW-011 M04 Extraction

### 4.1 Task Extractions Verbatim from `DOCS/CAW/CAW-011-Build-Order.md`

#### Task IT-0401

1.  **Task ID:** `IT-0401`
2.  **Task Title:** `Runtime package bootstrap`
3.  **Current Completion Status:** `☐` (Planned)
4.  **Full Task Description:** «Not specified in the current CAW-011 entry.»
5.  **Dependencies:** `IT-0201, M03`
6.  **Acceptance Criteria:** «Not specified in the current CAW-011 entry.»
7.  **Deliverables:** «Not specified in the current CAW-011 entry.»
8.  **Sequencing or Parallelism Notes:** «Not specified in the current CAW-011 entry.»
9.  **Downstream References:** «Not specified in the current CAW-011 entry.»
10. **Implementation Notes or Constraints:** «Not specified in the current CAW-011 entry.»

#### Task IT-0402

1.  **Task ID:** `IT-0402`
2.  **Task Title:** `Runtime pipeline scaffold`
3.  **Current Completion Status:** `☐` (Planned)
4.  **Full Task Description:** «Not specified in the current CAW-011 entry.»
5.  **Dependencies:** `IT-0401`
6.  **Acceptance Criteria:** «Not specified in the current CAW-011 entry.»
7.  **Deliverables:** «Not specified in the current CAW-011 entry.»
8.  **Sequencing or Parallelism Notes:** «Not specified in the current CAW-011 entry.»
9.  **Downstream References:** «Not specified in the current CAW-011 entry.»
10. **Implementation Notes or Constraints:** «Not specified in the current CAW-011 entry.»

#### Task IT-0403

1.  **Task ID:** `IT-0403`
2.  **Task Title:** `ExecutionContext handling`
3.  **Current Completion Status:** `☐` (Planned)
4.  **Full Task Description:** «Not specified in the current CAW-011 entry.»
5.  **Dependencies:** `IT-0402, IT-0309`
6.  **Acceptance Criteria:** «Not specified in the current CAW-011 entry.»
7.  **Deliverables:** «Not specified in the current CAW-011 entry.»
8.  **Sequencing or Parallelism Notes:** «Not specified in the current CAW-011 entry.»
9.  **Downstream References:** «Not specified in the current CAW-011 entry.»
10. **Implementation Notes or Constraints:** «Not specified in the current CAW-011 entry.»

#### Task IT-0404

1.  **Task ID:** `IT-0404`
2.  **Task Title:** `Policy evaluator (stub)`
3.  **Current Completion Status:** `☐` (Planned)
4.  **Full Task Description:** «Not specified in the current CAW-011 entry.»
5.  **Dependencies:** `IT-0402, IT-0307`
6.  **Acceptance Criteria:** «Not specified in the current CAW-011 entry.»
7.  **Deliverables:** «Not specified in the current CAW-011 entry.»
8.  **Sequencing or Parallelism Notes:** «Not specified in the current CAW-011 entry.»
9.  **Downstream References:** «Not specified in the current CAW-011 entry.»
10. **Implementation Notes or Constraints:** «Not specified in the current CAW-011 entry.»

#### Task IT-0405

1.  **Task ID:** `IT-0405`
2.  **Task Title:** `Receipt generator`
3.  **Current Completion Status:** `☐` (Planned)
4.  **Full Task Description:** «Not specified in the current CAW-011 entry.»
5.  **Dependencies:** `IT-0402, IT-0310`
6.  **Acceptance Criteria:** «Not specified in the current CAW-011 entry.»
7.  **Deliverables:** «Not specified in the current CAW-011 entry.»
8.  **Sequencing or Parallelism Notes:** «Not specified in the current CAW-011 entry.»
9.  **Downstream References:** «Not specified in the current CAW-011 entry.»
10. **Implementation Notes or Constraints:** «Not specified in the current CAW-011 entry.»

#### Task IT-0406

1.  **Task ID:** `IT-0406`
2.  **Task Title:** `Replay framework`
3.  **Current Completion Status:** `☐` (Planned)
4.  **Full Task Description:** «Not specified in the current CAW-011 entry.»
5.  **Dependencies:** `IT-0405`
6.  **Acceptance Criteria:** «Not specified in the current CAW-011 entry.»
7.  **Deliverables:** «Not specified in the current CAW-011 entry.»
8.  **Sequencing or Parallelism Notes:** «Not specified in the current CAW-011 entry.»
9.  **Downstream References:** «Not specified in the current CAW-011 entry.»
10. **Implementation Notes or Constraints:** «Not specified in the current CAW-011 entry.»

#### Task IT-0407

1.  **Task ID:** `IT-0407`
2.  **Task Title:** `Entropy detector (CI lint rule)`
3.  **Current Completion Status:** `☐` (Planned)
4.  **Full Task Description:** «Not specified in the current CAW-011 entry.»
5.  **Dependencies:** `IT-0402`
6.  **Acceptance Criteria:** «Not specified in the current CAW-011 entry.»
7.  **Deliverables:** «Not specified in the current CAW-011 entry.»
8.  **Sequencing or Parallelism Notes:** «Not specified in the current CAW-011 entry.»
9.  **Downstream References:** «Not specified in the current CAW-011 entry.»
10. **Implementation Notes or Constraints:** «Not specified in the current CAW-011 entry.»

---

### 4.2 Milestone-Level Extractions

#### Source A: `DOCS/CAW/CAW-005-Milestone-Roadmap.md` (Active Roadmap Context)

- **Overall Purpose of M04:**
  `| M04 | Runtime Skeleton                 | packages/runtime scaffold                                           | Compiles, purity tests pass, boundary tests pass                  |`
- **M04's Position Relative to M03:**
  ```
  M03 Domain Foundation
    ↓
  M04 Runtime Skeleton
    ↓
  M05 Registry Layer
  ```
- **M04's Relationship to M05, M06, M07, and M08:**
  `M08 Runtime Verification Pipeline   (requires M04, M06, M07)`
  `Milestones are mostly sequential; a few (e.g., M07 Evidence Engine and parts of M05 Registry) may run in parallel once M04's domain contracts are stable — see CAW-011 for exact task-level parallelism rules (CEngS-003 §3, parallel execution conditions).`
- **Milestone-Level Entry or Closure Criteria:**
  `Every milestone produces working, deployable software; passes all applicable CEngS standards; includes tests and updated docs; preserves deterministic behavior. No milestone may leave the repository broken. A milestone is complete only when every Task beneath it is complete (CEngS-003 §3).`
- **Explicitly Stated M04 Non-Goals:**
  «Not specified in the current CAW-005 entry.»

#### Source B: `DOCS/CEngS-v2/CAW-001.md` (Historical/Constitutional Context)

- **Overall Purpose of M04:**
  `# Milestone M04 — Runtime Skeleton`
  `## Objective`
  `Create the constitutional runtime package.`
- **Deliverables:**
  ```
  packages/runtime
  Execution Pipeline
  Execution Context
  Policy Engine
  Receipt Generator
  ```
- **Constraints:**
  ```
  No I/O
  No SQL
  No HTTP
  No filesystem
  No entropy
  ```
- **Acceptance Criteria (Closure Criteria):**
  ```
  ✓ Runtime compiles
  ✓ Purity tests pass
  ✓ Boundary tests pass
  ```
- **Explicitly Stated M04 Non-Goals:**
  «Not specified in the current CAW-001 entry.»

---

## 5. Current Runtime Package Inventory

### 5.1 Package Existence and Purpose

- **Existence:** Yes, located at `packages/runtime`
- **Current Package Name:** `@zyppi/runtime`
- **Package Version:** `0.1.0`
- **Package Type:** `module`
- **Declared Description:** «Not specified in the current package.json manifest.»
- **Current Package Scripts:**
  - `"build": "tsc -b"`
  - `"boundary": "node ../../tools/verify-package-boundary.mjs --package=packages/runtime"`
- **Current Package Entry Points / Export Map:**
  ```json
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
  ```
- **Dependencies, Peer-dependencies, Optional-dependencies, and Dev-dependencies:**
  - `dependencies`: `{}` (Empty)
  - `peerDependencies`: `{}` (Empty)
  - `optionalDependencies`: «Not specified»
  - `devDependencies`: «Not specified»

---

### 5.2 Complete File Inventory

The complete inventory of physical files in `packages/runtime/` is detailed below:

| Path                             | Category      | Declared Purpose                  | Declared Symbols             | Observed Implementation State |
| -------------------------------- | ------------- | --------------------------------- | ---------------------------- | ----------------------------- |
| `packages/runtime/package.json`  | Metadata      | Package configuration             | N/A                          | configuration-only            |
| `packages/runtime/tsconfig.json` | Configuration | TypeScript configuration          | N/A                          | configuration-only            |
| `packages/runtime/src/index.ts`  | Source        | Package public entrypoint         | None (contains `export {};`) | scaffold                      |
| `packages/runtime/src/.gitkeep`  | Placeholder   | Ensure git tracks empty directory | N/A                          | placeholder                   |

---

### 5.3 Public Runtime Boundary

- **Publicly Exported Symbols (from Entry Point):** Zero symbols are publicly exported. The entry point contains only `export {};`.
- **Source Symbols Not Publicly Exported:** Zero.
- **Public API Paths Exposed:** Only the package root exports maps to `./dist/index.js`.
- **Boundary Mismatches:** The exports map refers to `./dist/index.js` and `./dist/index.d.ts`. If the project has not been compiled using `tsc -b`, these physical build artifacts will be absent. However, compiling the monorepo produces them successfully.

---

### 5.4 Runtime Implementation-State Inventory

- `Execution Pipeline`: **absent**
- `Execution Context Handling`: **absent** (only domain type exists under `@zyppi/domain`)
- `Policy Evaluator / Stub`: **absent**
- `Receipt Generator`: **absent**
- `Replay Framework`: **absent**
- `Entropy Detector (Lint Rule)`: **absent**
- `Runtime Tests`: **absent**
- `Implementation Notes`: **absent**

---

## 6. M03 Public Dependency Surface

The public entry point of `@zyppi/domain` is defined in `packages/domain/src/index.ts`. All 68 publicly exported symbols, their categories, and re-export statuses are verified below:

| Symbol Name                           | Export Category | Source Module                  | Direct / Re-export Status |
| ------------------------------------- | --------------- | ------------------------------ | ------------------------- |
| `ValidationResult`                    | type            | `packages/domain/src/index.ts` | Direct                    |
| `IdentityValidationErrorCode`         | type            | `packages/domain/src/index.ts` | Direct                    |
| `IdentityRecord`                      | type            | `packages/domain/src/index.ts` | Direct                    |
| `IdentityValidationError`             | type            | `packages/domain/src/index.ts` | Direct                    |
| `ReferentType`                        | type            | `packages/domain/src/index.ts` | Direct                    |
| `ReferentRecord`                      | type            | `packages/domain/src/index.ts` | Direct                    |
| `ReferentValidationErrorCode`         | type            | `packages/domain/src/index.ts` | Direct                    |
| `ReferentValidationError`             | type            | `packages/domain/src/index.ts` | Direct                    |
| `GS1Identifier`                       | type            | `packages/domain/src/index.ts` | Direct                    |
| `GS1IdentifierValidationErrorCode`    | type            | `packages/domain/src/index.ts` | Direct                    |
| `GS1IdentifierValidationError`        | type            | `packages/domain/src/index.ts` | Direct                    |
| `EvidenceRecord`                      | type            | `packages/domain/src/index.ts` | Direct                    |
| `EvidenceValidationErrorCode`         | type            | `packages/domain/src/index.ts` | Direct                    |
| `EvidenceValidationError`             | type            | `packages/domain/src/index.ts` | Direct                    |
| `AuthorityRecord`                     | type            | `packages/domain/src/index.ts` | Direct                    |
| `AuthorityValidationErrorCode`        | type            | `packages/domain/src/index.ts` | Direct                    |
| `AuthorityValidationError`            | type            | `packages/domain/src/index.ts` | Direct                    |
| `CapabilityRecord`                    | type            | `packages/domain/src/index.ts` | Direct                    |
| `CapabilityValidationErrorCode`       | type            | `packages/domain/src/index.ts` | Direct                    |
| `CapabilityValidationError`           | type            | `packages/domain/src/index.ts` | Direct                    |
| `StandingRecord`                      | type            | `packages/domain/src/index.ts` | Direct                    |
| `StandingValidationErrorCode`         | type            | `packages/domain/src/index.ts` | Direct                    |
| `StandingValidationError`             | type            | `packages/domain/src/index.ts` | Direct                    |
| `validateIdentityRecord`              | function        | `packages/domain/src/index.ts` | Direct                    |
| `validateReferentRecord`              | function        | `packages/domain/src/index.ts` | Direct                    |
| `validateGS1Identifier`               | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeIdentityRecord`             | function        | `packages/domain/src/index.ts` | Direct                    |
| `Outcome`                             | type            | `packages/domain/src/index.ts` | Direct                    |
| `OutcomeValidationErrorCode`          | type            | `packages/domain/src/index.ts` | Direct                    |
| `OutcomeValidationError`              | type            | `packages/domain/src/index.ts` | Direct                    |
| `validateOutcome`                     | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeOutcome`                    | function        | `packages/domain/src/index.ts` | Direct                    |
| `PolicyDefinition`                    | type            | `packages/domain/src/index.ts` | Direct                    |
| `PolicyRecord`                        | type            | `packages/domain/src/index.ts` | Direct                    |
| `PolicyValidationErrorCode`           | type            | `packages/domain/src/index.ts` | Direct                    |
| `PolicyValidationError`               | type            | `packages/domain/src/index.ts` | Direct                    |
| `validatePolicyRecord`                | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializePolicyRecord`               | function        | `packages/domain/src/index.ts` | Direct                    |
| `validateStandingRecord`              | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeStandingRecord`             | function        | `packages/domain/src/index.ts` | Direct                    |
| `validateCapabilityRecord`            | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeCapabilityRecord`           | function        | `packages/domain/src/index.ts` | Direct                    |
| `validateAuthorityRecord`             | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeAuthorityRecord`            | function        | `packages/domain/src/index.ts` | Direct                    |
| `validateEvidenceRecord`              | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeEvidenceRecord`             | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeReferentRecord`             | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeGS1Identifier`              | function        | `packages/domain/src/index.ts` | Direct                    |
| `ActiveConstitutionalView`            | interface       | `packages/domain/src/index.ts` | Direct                    |
| `EvidenceBundle`                      | interface       | `packages/domain/src/index.ts` | Direct                    |
| `PolicyContext`                       | interface       | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionContext`                    | interface       | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionContextValidationErrorCode` | type            | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionContextValidationError`     | interface       | `packages/domain/src/index.ts` | Direct                    |
| `validateExecutionContext`            | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeExecutionContext`           | function        | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionRequest`                    | interface       | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionRequestValidationErrorCode` | type            | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionRequestValidationError`     | type            | `packages/domain/src/index.ts` | Direct                    |
| `validateExecutionRequest`            | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeExecutionRequest`           | function        | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionReceipt`                    | interface       | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionReceiptValidationErrorCode` | type            | `packages/domain/src/index.ts` | Direct                    |
| `ExecutionReceiptValidationError`     | interface       | `packages/domain/src/index.ts` | Direct                    |
| `validateExecutionReceipt`            | function        | `packages/domain/src/index.ts` | Direct                    |
| `serializeExecutionReceipt`           | function        | `packages/domain/src/index.ts` | Direct                    |

### 5.5 M03 Public Exports References Trace

1.  **Referenced inside `packages/runtime`:** None.
2.  **Referenced elsewhere in the repository:**
    - `packages/testing/src/m03Closure.test.ts` — Imports all validation functions, serialization functions, and type definitions listed above from `@zyppi/domain`.
    - `tools/runtime-purity/fixtures/valid/pure-runtime.ts` — Contains a mock/test import reference: `import { something } from "@zyppi/domain";`
    - `tools/runtime-purity/validate-runtime-purity.test.ts` — Contains a mock/test import reference: `import { DomainModel } from "@zyppi/domain";`
3.  **Relative / Internal / Deep Imports bypassing public boundary:** Zero detected. No workspace members import relative files from `packages/domain/src` or deep subpaths.
4.  **Resolution Status:** All public `@zyppi/domain` imports resolve perfectly under the repository build.

---

## 7. Current Runtime Dependency and Boundary Evidence

### 7.1 Outbound Dependencies

- **Workspace package dependencies:** None.
- **External package dependencies:** None.
- **Node built-ins:** None.
- **Tooling dependencies:** None.
- **Direct imports in production source:** None.
- **Direct imports in tests:** N/A (no tests exist).

---

### 7.2 Inbound Dependencies

- **Production Inbound References:** None.
- **Test Inbound References:** None.
- **Tooling Inbound References:** None.
- **Documentation Inbound References:**
  - `DOCS/CAW/CAW-011-Build-Order.md` (tasks referencing `packages/runtime` or `@zyppi/runtime`).
  - `DOCS/CAW/AMS/M03-Closure-Report.md` (readiness framing).

---

### 7.3 Dependency-Graph Enforcement

- **File Path:** `tools/verify-dependency-graph.mjs`
- **Rules applying specifically to `packages/runtime`:**
  ```javascript
  "packages/runtime": {
    production: ["packages/domain", "packages/shared"],
    devOnly: [],
  }
  ```
- **Allowed dependency directions:** `packages/runtime` may depend only on `packages/domain` and `packages/shared` for production imports.
- **Prohibited dependency directions:**
  - `packages/runtime` cannot depend on `packages/contracts`, `packages/testing`, `apps/*`, or `edge/*`.
  - Tests and TS Config project references must not couple `packages/runtime` to unapproved workspace members.
- **Leaf/Core Status:** Core/Intermediate package (provides executing logic to apps/api, depends on domain and shared).
- **Test Inclusion:** Same-package tests are scanned to ensure they do not introduce unauthorized dependency edges.
- **Relative Boundary Skipping:** Relative imports that escape the `packages/runtime` package directory into other package paths are strictly blocked.

---

## 8. Runtime Purity and Determinism Enforcement

### 8.1 Enforcement Entry Points

- **Command Used:** `pnpm runtime:purity`
- **Tool/Script Path:** `tools/validate-runtime-purity.mjs`
- **Directories Inspected:** `packages/runtime/src` (recursively scanning all source files).
- **Included Files:** `.ts` and `.tsx` source files.
- **Excluded Files:** Definition files (`.d.ts`), test files (`*.test.ts`, `*.spec.ts`), and non-TypeScript files.

---

### 8.2 Prohibited Behavior

- **System Time Check:** Detects and blocks `Date.now()` and zero-argument constructor `new Date()`.
- **Random / Entropy APIs:** Detects and blocks `Math.random()`.
- **Network Access:** Default Denial of Node built-ins (such as `http`, `https`, `net`, `tls`, `dgram`) prevents host-level I/O.
- **Filesystem Access:** Default Denial of built-ins (such as `fs`, `fs/promises`) blocks direct storage access.
- **Prohibited Node Built-ins:** All Node built-in modules are disallowed via custom checks.
- **Dynamic Imports:** Evaluates import specifiers. Non-string literals or dynamic imports trigger violations.
- **Allowlist for Workspace Imports:** Only `@zyppi/domain` and `@zyppi/shared` are approved.
- **Fail-Closed Behavior:** Any violation results in script exit code `1` and halts CI pipelines.

---

### 8.3 Enforcement Limitations

- **Files Not Scanned:** Tests under `test/`, `tests/` or files containing `.test.` / `.spec.` are completely ignored.
- **Indirect Access Patterns:** Static AST analysis cannot detect indirect runtime capabilities, such as those passed via dynamic function constructor tricks or external closures (though build boundaries and strict type checks help mitigate this).

---

## 9. Build, Test, and Repository Convention Evidence

1.  **TypeScript Project References:** Handled in root `tsconfig.json` which includes project references for all packages. Individual package `tsconfig.json` configurations specify dependencies relative to parent roots (e.g. `packages/runtime` references `../domain` and `../shared`).
2.  **Runtime Compilation Inclusion/Exclusion:** Defined in `packages/runtime/tsconfig.json` via `"include": ["src/**/*"]` and `"outDir": "./dist"`.
3.  **Test Framework & Test Discovery:** `vitest` is the authoritative test runner, configured in root `vitest.config.ts`. It discovers `packages/**/*.test.ts` and `packages/**/*.spec.ts` but explicitly excludes `**/node_modules/**` recursively.
4.  **Test Concurrency:** Vitest runs serially with `maxConcurrency: 1` and `fileParallelism: false` to ensure test isolation and determinism.
5.  **Naming Conventions for Tests:** All tests follow the suffix `*.test.ts` or `*.spec.ts`.
6.  **Implementation-Notes Conventions:** Contained in `DOCS/CAW/AMS/` with the filename pattern `AMS-XXXX-[Component]-Implementation-Notes.md`.
7.  **AMS Conventions:** Standardized markdown structures containing verbatim source evidence, factual observations, and decision tables.
8.  **Formatting and Linting Rules:** Prettier check handles formatting workspace-wide. ESLint Flat configuration (`eslint.config.mjs`) checks linting rules and strictly enforces architectural boundary restricted paths.
9.  **Import Styles:** Unit/local tests utilize relative imports (e.g., `./index.js`), while public boundary integration tests utilize public workspace aliases (e.g., `@zyppi/domain`).

---

## 10. Repository-Wide M04 and Runtime Reference Search

A repository-wide search was executed across the codebase for keywords. Factual observations are categorized below:

### 10.1 Governance and Roadmap Documents

- `DOCS/CAW/CAW-005-Milestone-Roadmap.md` (active roadmap):
  - Milestone Summary table defines M04 objective as: `packages/runtime scaffold` with acceptance signal: `Compiles, purity tests pass, boundary tests pass`.
- `DOCS/CAW/CAW-011-Build-Order.md` (build roadmap):
  - Defines the 7 implementation tasks `IT-0401` through `IT-0407` with depends-on and sizing constraints.
- `DOCS/CEngS-v2/CAW-001.md` (historical/constitutional):
  - Milestone section M04 defines constraints (`No I/O`, `No SQL`, `No HTTP`, `No filesystem`, `No entropy`) and objectives (`Create the constitutional runtime package`).

### 10.2 Implementation Notes

- `DOCS/CAW/AMS/AMS-0308-PREP.md` (M03 domain prep):
  - Locators: Line 170. Excerpt: `As established by CAW-011, ExecutionContext represents a separate model scheduled for IT-0309 and handled under IT-0403.`
- `DOCS/CAW/AMS/AMS-0310-ExecutionReceipt-Model-Implementation-Notes.md` (M03 receipt notes):
  - Locators: Line 122. Excerpt: `These excluded behaviors are relegated to future runtime tasks (such as IT-0405 for receipt generation and M12 for deterministic replay verification).`
- `DOCS/CAW/AMS/AMS-0311-Outcome-Model-Implementation-Notes.md` (M03 outcome notes):
  - Locators: Line 143. Excerpt: `Evidence-loading, trust calculation, or receipt generation.`

### 10.3 Source Code and Tooling

- `tools/validate-runtime-purity.mjs`:
  - Contains several rule definitions referencing `@zyppi/runtime` boundary scans.
- `tools/verify-dependency-graph.mjs`:
  - Contains the strict edge validation constraints for `@zyppi/runtime`.

---

## 11. M04 Task-to-Repository Artifact Matrix

The current mapping of each M04 task to physical repository artifacts and states is detailed below:

| Task ID     | Exact CAW-011 Status | Existing Repository Artifact(s)                                                                        | Observed Implementation State                                                 | Existing Tests                                                                | Existing Implementation Notes                                                 | Existing References      | Repository Evidence Gap                                                                                    |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **IT-0401** | `☐` (Planned)        | `packages/runtime/package.json`<br>`packages/runtime/tsconfig.json`<br>`packages/runtime/src/index.ts` | Scaffold only                                                                 | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | `CAW-011-Build-Order.md` | Mismatch between TS project references (references domain) and ESM manifest dependencies (declared empty). |
| **IT-0402** | `☐` (Planned)        | «No corresponding repository artifact was located during this investigation.»                          | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | `CAW-011-Build-Order.md` | Entirely absent.                                                                                           |
| **IT-0403** | `☐` (Planned)        | «No corresponding repository artifact was located during this investigation.»                          | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | `CAW-011-Build-Order.md` | Entirely absent.                                                                                           |
| **IT-0404** | `☐` (Planned)        | «No corresponding repository artifact was located during this investigation.»                          | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | `CAW-011-Build-Order.md` | Entirely absent.                                                                                           |
| **IT-0405** | `☐` (Planned)        | «No corresponding repository artifact was located during this investigation.»                          | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | `CAW-011-Build-Order.md` | Entirely absent.                                                                                           |
| **IT-0406** | `☐` (Planned)        | «No corresponding repository artifact was located during this investigation.»                          | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | `CAW-011-Build-Order.md` | Entirely absent.                                                                                           |
| **IT-0407** | `☐` (Planned)        | «No corresponding repository artifact was located during this investigation.»                          | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | «No corresponding repository artifact was located during this investigation.» | `CAW-011-Build-Order.md` | Entirely absent.                                                                                           |

---

## 12. Downstream Repository State: M05–M08

1.  **Existing Artifacts:**
    - There is no `packages/registry` or equivalent database adapter package.
    - There is no `packages/evidence` package.
    - `apps/api/` and `apps/web/` contain only empty `src/main.ts` entry points containing `export {};`. No functional business logic, routing, or database connection pools exist.
    - `edge/worker/` contains a single placeholder file `index.ts` exporting `WORKER_LABEL = "worker"`.
2.  **Downstream Imports / References to Runtime:** Zero detected.
3.  **Downstream Assumptions of Runtime Boundary/APIs:** None.
4.  **Downstream Constraints on Runtime Integration:** No downstream constraints currently exist because all downstream packages/applications are scaffolded with zero business logic.

---

## 13. Existing M04 AMS and Documentation Inventory

- **AMS-0401 through AMS-0407:** Absent. No implementation notes, preparation reports, review records, audits, or closure records for M04 exist in the repository.

---

## 14. Verification Baseline

All required verification commands were executed on March 9, 2025. The results are recorded below:

### Command 1: `pnpm format:check`

- **Command:** `pnpm format:check`
- **Exit Code:** `0`
- **Status:** `PASS`
- **Duration:** ~0.4s
- **Output Summary:**
  ```
  Checking formatting...
  All matched files use Prettier code style!
  ```

### Command 2: `pnpm lint`

- **Command:** `pnpm lint`
- **Exit Code:** `0`
- **Status:** `PASS`
- **Duration:** ~1.4s
- **Output Summary:** Completed with zero ESLint errors or warnings (except for standard `.eslintignore` deprecation warning).

### Command 3: `pnpm exec tsc -b`

- **Command:** `pnpm exec tsc -b`
- **Exit Code:** `0`
- **Status:** `PASS`
- **Duration:** ~0.9s
- **Output Summary:** Completed successfully with zero typescript build errors.

### Command 4: `pnpm runtime:purity`

- **Command:** `pnpm runtime:purity`
- **Exit Code:** `0`
- **Status:** `PASS`
- **Duration:** ~0.3s
- **Output Summary:**
  ```
  Zyppi Static Runtime Purity & Determinism Validator: PASS
  - Runtime manifest status: Valid
  - Runtime source-file count analyzed: 1
  - Import governance status: Valid
  - Static determinism status: Valid
  ```

### Command 5: `pnpm boundary:all`

- **Command:** `pnpm boundary:all`
- **Exit Code:** `0`
- **Status:** `PASS`
- **Duration:** ~1.5s
- **Output Summary:**
  ```
  Zyppi Package Boundary Verification for "@zyppi/contracts": PASS
  Zyppi Package Boundary Verification for "@zyppi/runtime": PASS
  Zyppi Package Boundary Verification for "@zyppi/shared": PASS
  Zyppi Package Boundary Verification for "@zyppi/domain": PASS
  Zyppi Package Boundary Verification for "@zyppi/testing": PASS
  ```

### Command 6: `pnpm graph:validate`

- **Command:** `pnpm graph:validate`
- **Exit Code:** `0`
- **Status:** `PASS`
- **Duration:** ~0.3s
- **Output Summary:**
  ```
  Zyppi Constitutional Dependency Graph Validator: PASS
  - Graph layout: Valid (conforms to CAW-004 v2.1)
  - Workspace members analyzed: 8
  - Source files scanned: 20
  ```

### Command 7: `pnpm test --run`

- **Command:** `pnpm test --run`
- **Exit Code:** `0`
- **Status:** `PASS`
- **Duration:** 7.17s
- **Output Summary:**
  ```
   Test Files  14 passed (14)
        Tests  355 passed (355)
     Duration  7.17s
  ```

---

## 15. Repository Evidence Gaps, Ambiguities, and Contradictions

This section lists factual repository issues discovered during the investigation:

| Finding ID     | Category                                 | Evidence                                                                                                                                                       | Affected M04 Task(s) | Why Repository Evidence is Incomplete/Contradictory                                                                       | Council Attention Required?       |
| -------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **REG-04-001** | missing repository evidence              | `packages/runtime/src/index.ts` contains only `export {};`, and there are no other source files or test folders.                                               | IT-0402 to IT-0407   | Complete functional implementations and tests of the pipeline are absent.                                                 | «Council determination required.» |
| **REG-04-002** | unresolved package-boundary evidence     | `packages/runtime/tsconfig.json` references `../domain` and `../shared` but `packages/runtime/package.json` contains empty dependencies objects.               | IT-0401              | Compile-time project references exist without matching ESM workspace package manifest declarations.                       | «Council determination required.» |
| **REG-04-003** | incomplete task definition in repository | `DOCS/CAW/CAW-011-Build-Order.md` contains only the task table but lacks task-level descriptions, acceptance criteria, or deliverables.                        | IT-0401 to IT-0407   | Fine-grained requirements for individual tasks are unspecified in CAW-011.                                                | «Council determination required.» |
| **REG-04-004** | contradictory repository records         | `DOCS/CEngS-v2/CAW-001.md` lists concrete milestone constraints (`No I/O`, `No HTTP`, etc.), but `DOCS/CAW/CAW-005-Milestone-Roadmap.md` does not repeat them. | IT-0401 to IT-0407   | Minor discrepancies exist in milestone-level constraint and objective verbosity across active roadmaps and constitutions. | «Council determination required.» |
| **REG-04-005** | missing implementation artifact          | The package `packages/runtime` contains zero tests or test directories.                                                                                        | IT-0401 to IT-0407   | Testing conventions (such as local versus public alias import usage) cannot be mechanically determined.                   | «Council determination required.» |

---

## 16. Objective Repository Readiness Facts

### Confirmed Facts

- The `@zyppi/domain` package represents a complete, stable, and fully tested public dependency surface ready to be consumed.
- The `@zyppi/runtime` package exists as a scaffolded, compilable monorepo member.
- The dependency graph and purity checkers are fully operational and are successfully integrated into the monorepo scripts.
- The entire repository compiles cleanly and passes all code quality benchmarks.

### Unconfirmed or Unavailable Facts

- The concrete internal directory layout and folder names (e.g., `test/` vs `tests/`) for `@zyppi/runtime` tests cannot be verified from repository artifacts.
- The expected structure of the future Runtime Pipeline and evaluator cannot be verified.

### Repository Evidence Requiring Council Interpretation

- Adjudication on whether the mismatch between TS project references and package.json manifest declarations (Gap REG-04-002) is acceptable for a pure, leaf-like workspace member prior to task execution.
- Clarification of whether historical constraints listed in `CAW-001.md` represent binding rules for the upcoming M04 implementation.

### Out-of-Repository Questions

- How should the Council define the detailed acceptance criteria and deliverables for tasks `IT-0401` through `IT-0407` when they are absent from `CAW-011`?
- What is the timeline for establishing database adapters and registry interfaces (Milestone M05) to support runtime integration?
