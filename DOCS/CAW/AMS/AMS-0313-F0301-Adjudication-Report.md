# AMS-0313 — F-0301 Public-Boundary Test and Dependency-Graph Adjudication Report

**Mandate Type:** Adversarial discovery, repository-policy analysis, and remediation recommendation
**Status:** **INVESTIGATION COMPLETE — PENDING RATIFICATION**
**Authority:** M03 Closure Audit, F-0301, CAW-004, CAW-011, CEngS-003 §3
**Auditor:** Jules (AI Software Engineer)
**Investigation Date:** August 2, 2026

---

## 1. Title, Mandate Authority, Date, and Investigation Status

- **Title:** F-0301 Public-Boundary Test and Dependency-Graph Adjudication Report
- **Mandate Authority:** Authorized under the M03 Domain Foundation Closure Audit, F-0301, CAW-004, and CAW-011.
- **Adjudication Status:** **Complete.** This report establishes the factual and constitutional adjudication of the contradiction between the public-boundary testing requirement and the repository's strict dependency graph validator.
- **Target Finding:** `F-0301 — Public-Boundary Test / Dependency-Graph Validation Contradiction`
- **Remediation Action:** **None.** Under this discovery mandate, no production or test files have been modified. All findings are presented as an evidence-backed adjudication surface.

---

## 2. Executive Determination

This investigation concludes with absolute certainty that **F-0301 is a test-placement defect (Adjudication B)**.

The public-boundary consumer test suite `m03Closure.test.ts` was placed inside `packages/domain/src/`. This placement is architecturally inappropriate because `packages/domain` is constitutionally defined as a leaf package with exactly zero dependency edges (neither production nor dev-only).

Requiring a test inside a zero-dependency package to import its own public alias `@zyppi/domain` creates a self-loop cycle (`packages/domain -> packages/domain`) and violates graph-authorization policies.

Locating the test inside the package being consumed distorts the meaning of "public-boundary consumer test" because it resides within the private boundary of the package itself.

The correct, constitutionally sound remediation is to **relocate the test to `packages/testing` (Option B)**, which is pre-authorized by graph policy to have dev-only dependencies on `packages/domain` and all other core packages. This solves the conflict beautifully with a zero code footprint on the validator tool, preserves strict fail-closed graph enforcement, and provides an authentic external-consumer boundary.

---

## 3. Exact Reproduction of F-0301

The dependency-graph validator failure was successfully reproduced in the sandboxed monorepo environment:

- **Command:** `pnpm graph:validate`
- **Exit Code:** `1`
- **Failing Source File:** `packages/domain/src/m03Closure.test.ts` (at line 39)
- **Importing Package:** `packages/domain`
- **Imported Specifier:** `@zyppi/domain`
- **Resolved Package Path:** `packages/domain`
- **Resulting Dependency Edge:** `packages/domain -> packages/domain`

### Complete Diagnostic Failure Output:

```text
Zyppi Constitutional Dependency Graph Validator: FAIL

Violation in workspace member: packages/domain
- Layer: graph
- File: N/A
- Rule Violated: dependency-cycle
- Diagnostics: Dependency cycle detected: packages/domain -> packages/domain

Violation in workspace member: packages/domain
- Layer: source
- File: packages/domain/src/m03Closure.test.ts
- Location: 39:8
- Rule Violated: unauthorized-dev-dependency
- Diagnostics: Unauthorized development import: "packages/domain" is not authorized to import "packages/domain" (@zyppi/domain) in dev context.
```

---

## 4. Repository Baseline Identity

The target baseline for this adjudication is verified as:

- **Current Branch:** `jules-6806216608701487131-26a4427d`
- **Current Commit SHA:** `468677fdc714fbbfeca4bbdb96c5e6704e0d82ac`
- **Working Tree Status:** Pristine. Contains only the newly created adjudication report under the discovery authority.

---

## 5. Graph-Validator Implementation Analysis

The file `tools/verify-dependency-graph.mjs` was thoroughly inspected. It executes validation across three layers:

1. **Manifest Layer:** Parses `package.json` configurations to verify `dependencies`, `peerDependencies`, and `devDependencies`.
2. **TSConfig Layer:** Parses `tsconfig.json` references to ensure compile-time edges correspond to allowed pathways.
3. **Source Layer:** Uses the TypeScript Compiler API (`ts.createSourceFile` and recursive node visits) to extract all static imports, exports, dynamic imports, and `require` specifiers in `.ts`/`.tsx` files.

The graph validator maintains a static mapping:

```javascript
const PACKAGE_TO_NODE = {
  "@zyppi/domain": "packages/domain",
  "@zyppi/shared": "packages/shared",
  "@zyppi/contracts": "packages/contracts",
  "@zyppi/runtime": "packages/runtime",
  "@zyppi/testing": "packages/testing",
  "@zyppi/api": "apps/api",
  "@zyppi/web": "apps/web",
};
```

And enforces the dependency graph policy using `POLICY`:

```javascript
  const POLICY = {
    "packages/domain": { production: [], devOnly: [] },
    "packages/shared": { production: [], devOnly: [] },
    ...
  };
```

---

## 6. Import-Discovery and Dependency-Edge Analysis

During Source-Layer validation, the validator extracts the import specifier `"@zyppi/domain"` inside `m03Closure.test.ts`.

The package resolution matches it to the target node `"packages/domain"`. Since the importing package is `"packages/domain"`, it adds the dependency edge:

```javascript
edges.add("packages/domain->packages/domain");
```

This edge represents a self-loop. The cycle detector `findCycle` uses Depth-First Search (DFS) with a recursion stack tracing nodes in `"visiting"` state. When visiting `"packages/domain"`, it explores its adjacent edges. Since it finds an edge pointing to itself, it detects a cycle immediately and returns `["packages/domain", "packages/domain"]`, flagging a blocking `dependency-cycle` violation.

---

## 7. Test-File Treatment Analysis

The graph validator **intentionally scans and validates all test files**. It retrieves all TS files under each node (excluding `node_modules`, `dist`, `build`, etc.) and determines if a file is dev context using:

```javascript
  const isFileDevContext = (relativeFilePath) => { ... }
```

For test files, the validator enforces that the imported package `targetNode` is listed in either `production` or `devOnly` policy maps of the importing node.

Because `POLICY["packages/domain"]` defines empty lists for both contexts, any package-level import (even of itself) is flagged as `unauthorized-dev-dependency`.

Test-file validation is an essential security measure of repository governance; excluding tests from graph analysis would create a blind spot, allowing tests to import unauthorized database or infrastructure layers, violating the pure/impure package boundary.

---

## 8. Public-Boundary Test Placement Analysis

A public-boundary consumer test is designed to verify that an external consumer can integrate with the package exclusively through its public exports without relying on internal file paths or private types.

Locating this test inside the source directory `packages/domain/src/`:

1. **Weakens Consumer Validation:** It resides inside the private directory structure of the package under test. It is compiled under `packages/domain`'s own compiler context and is packed as part of the package itself.
2. **Creates Circularity:** It forces the package to reference itself through a public alias, which is not supported by strict zero-dependency architectures.
3. **Mismatches Design:** A real downstream consumer operates from an external package boundary (e.g. `packages/runtime` or `apps/api`). Testing the consumer surface from _within_ the package is an architectural contradiction.

Therefore, placing the public-boundary closure test inside `packages/domain` is a **placement defect**.

---

## 9. Repository Precedent Search

A comprehensive repository-wide search was conducted:

- **Precedents found of packages self-importing:** **Zero.** No package in `@zyppi/domain`, `@zyppi/runtime`, `@zyppi/contracts`, `@zyppi/shared`, or `@zyppi/testing` imports itself through its own public alias. All local tests use relative paths (e.g., `./index.js`).
- **External boundary tests:** There are no current external public-boundary tests located in separate packages for M03 models because M03 was treated as a leaf. However, `packages/testing` exists and is explicitly configured in `verify-dependency-graph.mjs` with dev-only dependencies on all library packages, showing that the workspace was designed to accommodate external, cross-package tests.

---

## 10. Governing-Document Analysis

- **CAW-004 (Repository Map):** Confirms `packages/domain` as a leaf, pure model layer with zero dependencies.
- **CAW-011 (Build Order):** Establishes the creation of `packages/testing` (IT-0205) specifically as a testing package.
- **M03 Closure Mandate:** Instructs that the closure audit must obtain executable evidence of downstream public-boundary consumption to prove M04 readiness, but does not dictate that the test file itself must reside physically inside the `domain` folder—only that it must belong naturally to the test surface.

---

## 11. Adversarial Answers

1. **If a package imports itself through its public package name in a production source file, should the graph validator reject it?**
   - **Yes.** Production self-imports are an anti-pattern. They create compilation order issues under `tsc -b` and indicate circular coupling on the package's public exports map.
2. **If the same import appears only in a test file, should the graph validator treat it differently?**
   - **Conceptually yes, but contextually no.** While testing public exports is valid, forcing same-package alias imports within the package's own folders introduces self-loops in cycle detection and necessitates complex validator exceptions.
3. **If yes, what objective rule distinguishes the permitted test case from an impermissible production self-dependency?**
   - The rule would be file classification via `isFileDevContext(relativeFilePath)`. The validator would have to exempt self-imports only for test files.
4. **Would permitting same-package package-name imports create a loophole through which production code could evade internal import restrictions?**
   - **Yes.** It opens the door to circular references and evading internal boundaries by importing via the public alias inside test code, which can bleed into build scripts.
5. **Does moving the test outside the package create a genuine consumer boundary, or merely relocate the same dependency problem?**
   - **It creates a genuine consumer boundary.** Moving the test to `packages/testing` provides a clean, acyclic dependency edge (`testing -> domain`) fully authorized by policy, entirely resolving the self-loop.
6. **Would an external test location require adding a new workspace dependency? If so, is that dependency constitutionally authorized?**
   - **Yes, and yes.** It adds `@zyppi/domain` to `packages/testing`'s devDependencies, which is explicitly authorized by `POLICY["packages/testing"].devOnly`.
7. **Does the current graph validator intentionally validate test dependencies as part of repository governance?**
   - **Yes.** It scans and validates imports in test files to prevent layer leakage (such as domain tests importing API routing layers).
8. **If test files are excluded from graph validation, what existing mechanism would continue to prevent unauthorized cross-package test imports?**
   - **None.** Excluding tests would leave the repository vulnerable to architectural bleed.
9. **Is the current failure evidence of a validator defect, a test-placement defect, or a legitimate policy conflict?**
   - **A test-placement defect.** The validator correctly rejects the self-loop. The test-placement physically violates the zero-dependency contract.
10. **Which remediation has the smallest permanent architectural footprint?**
    - **Option B (Relocating the test to `packages/testing`).** It requires zero code changes to validators, zero policy changes, and zero production alterations.

---

## 12. Options A–D Analysis

### Option A — Permit Same-Package Public Imports in the Graph Validator

- **Semantic Correctness:** Moderate. While valid in ESM, self-imports are mathematically circular.
- **Loophole Risk:** High. Could permit circular test structures and create loopholes.
- **Complexity:** Moderate. Requires modifying `verify-dependency-graph.mjs` to bypass self-loops.

### Option B — Relocate the Public-Boundary Consumer Test Outside `packages/domain`

- **Semantic Correctness:** High. Creates an authentic, external consumer-boundary.
- **Loophole Risk:** Zero. Avoids modifying any validator tool or graph policy.
- **Complexity:** Low. Involves moving the test to `packages/testing` and updating dependencies.

### Option C — Exclude Recognized Test Files from Dependency-Graph Analysis

- **Semantic Correctness:** Low. Weakens repository-wide test dependency governance.
- **Loophole Risk:** High. Allows test files to import any unauthorized package without detection.
- **Complexity:** Low. Simply bypasses AST import scanning on test files.

### Option D — Create a Dedicated Consumer-Test Package

- **Semantic Correctness:** High. Isolate consumer tests into a new workspace package.
- **Loophole Risk:** Zero. No graph policy changes.
- **Complexity:** High. Creating and maintaining an additional workspace package is disproportionate for M03.

---

## 13. Comparative Decision Matrix

| Criterion                                        | Option A: Validator Self-Import Exception              | Option B: External Consumer Test (Preferred)           | Option C: Exclude Test Files                           | Option D: Dedicated Consumer Package                   |
| ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ |
| **Preserves production dependency enforcement**  | **Yes.** Production files are still validated.         | **Yes.** No changes to production rules.               | **Yes.** Production checks remain in place.            | **Yes.** Production checks remain in place.            |
| **Preserves meaningful public-boundary testing** | **Moderate.** Test is inside the package being tested. | **High.** Authentically external consumer perspective. | **High.** Verifies public consumption.                 | **High.** Authentically external consumer perspective. |
| **Avoids permanent validator loopholes**         | **No.** Introduces a special-case exception in graph.  | **Yes.** Keeps validator strict and fail-closed.       | **No.** Opens a wide loophole for all tests.           | **Yes.** No validator changes required.                |
| **Avoids false dependency edges**                | **No.** Leaves self-loop edge in memory.               | **Yes.** Edge is a valid directed acyclic edge.        | **Yes.** Bypasses edge generation for tests.           | **Yes.** Edge is a valid directed acyclic edge.        |
| **Preserves test dependency governance**         | **Yes.** Test imports still checked against policy.    | **Yes.** Completely governed under `packages/testing`. | **No.** Complete loss of test dependency checks.       | **Yes.** Governed under new package policy.            |
| **Requires minimal change**                      | **Moderate.** Requires editing validator script.       | **High.** No validator or policy changes; file move.   | **High.** Small validator modification.                | **Low.** Heavy monorepo package creation overhead.     |
| **Aligns with existing repository conventions**  | **No.** No other package self-imports.                 | **Yes.** Aligns with `@zyppi/testing` purpose.         | **No.** Contradicts fail-closed validation philosophy. | **No.** Unnecessary additional package layer.          |
| **Aligns with CAW-004**                          | **No.** Violates mathematical acyclicity of map.       | **Yes.** Conforms perfectly to CAW-004 maps.           | **No.** Weakens the security boundaries.               | **Yes.** Conforms perfectly to CAW-004 maps.           |
| **Is proportionate to M03**                      | **Yes.** Localized to the validator.                   | **Yes.** Relocates file within existing packages.      | **Yes.** Localized to the validator.                   | **No.** High overhead for closure audit.               |
| **Creates future architectural risk**            | **Low.** Small localized validator loophole.           | **Zero.** Cleaner, strict architecture.                | **High.** Severe loss of test import boundary safety.  | **Low.** Adds workspace package maintenance.           |

---

## 14. Recommended Remediation Path

The recommended, highly robust remediation path is **Option B (Relocate the Public-Boundary Consumer Test to `packages/testing`)**:

1. **Move File:** Relocate `packages/domain/src/m03Closure.test.ts` to `packages/testing/src/m03Closure.test.ts`.
2. **Update Manifest:** Add `"@zyppi/domain": "workspace:*"` to `devDependencies` of `packages/testing/package.json`.
3. **Update TSConfig:** Add `{ "path": "../domain" }` to `references` of `packages/testing/tsconfig.json`.
4. **Clean Domain Package:** The `packages/domain` directory remains perfectly clean of any self-imports or cycles, preserving its leaf-level zero-dependency contract.

---

## 15. Rejected Alternatives and Reasons

- **Option A (Validator Exception) — REJECTED:** Bypassing self-loops in `verify-dependency-graph.mjs` is rejected because it introduces permanent complexity, creates validator loopholes, and fails to establish an authentic external-consumer boundary (the test remains physically inside the package).
- **Option C (Exclude Test Files) — REJECTED:** Disabling dependency graph checks on tests is rejected because it is highly insecure and violates the constitutional pure/impure package boundary enforcement.
- **Option D (Dedicated Package) — REJECTED:** Creating a new workspace package is rejected due to excessive monorepo build and maintenance overhead.

---

## 16. Constitutional and Repository Impact

- **Zero production impact:** No production source code is altered.
- **Zero validator impact:** The validator remains strict, simple, and fail-closed.
- **Strict Acyclicity preserved:** The directed graph of the monorepo remains a pure DAG, fully compliant with CAW-004 v2.1.

---

## 17. Proposed Future Implementation Scope

Under a future implementation mandate:

- **Files to create/modify:**
  - Move `packages/domain/src/m03Closure.test.ts` to `packages/testing/src/m03Closure.test.ts`
  - Modify `packages/testing/package.json` (add `@zyppi/domain` devDependency)
  - Modify `packages/testing/tsconfig.json` (add reference to `../domain`)
- **Files to remain strictly unchanged:**
  - `tools/verify-dependency-graph.mjs`
  - `packages/domain/package.json`
  - `packages/domain/src/index.ts`
  - All production models and validators.

---

## 18. Required Verification Criteria for the Future Remediation

Following the future relocation:

1. `pnpm format:check` must pass.
2. `pnpm lint` must pass.
3. `pnpm exec tsc -b` must compile the entire workspace successfully.
4. `pnpm boundary:all` must pass.
5. `pnpm graph:validate` must return exit code 0 (PASS).
6. `pnpm test` must run and successfully execute all 355 unit tests (including the 31 adversarial closure tests running under `@zyppi/testing`).

---

## 19. Risks and Safeguards

- **Risk:** `packages/testing` build order compilation.
- **Safeguard:** Referencing `../domain` in `packages/testing/tsconfig.json` ensures that `pnpm exec tsc -b` compiles `packages/domain` completely before compiling `packages/testing`, guaranteeing that the type mappings are resolved safely.

---

## 20. Findings Register

| ID         | Layer                      | Finding                                                                                                                                                                                                                        | Evidence                                                          | Severity     | Constitutional Impact                                                           | Affected Contract                                     | Recommended Disposition                                                                       | Corrective Work Required?                               |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **F-0301** | Layer 3: Boundary Coverage | Strict dependency graph validation (`pnpm graph:validate`) fails due to a self-import of the public `@zyppi/domain` package name within `packages/domain/src/m03Closure.test.ts`, causing cycle and dev-dependency violations. | Executable check: `pnpm graph:validate` fails with cyclic errors. | **Blocking** | Contradiction between public-boundary testing rules and dependency-graph rules. | Yes. Prevents repository pipeline from passing green. | Relocate `m03Closure.test.ts` to `packages/testing` (Option B), keeping the validator strict. | Yes. Stop remediation; document corrective AMS mandate. |

---

## 21. Final Adjudication

This audit issues the following final adjudication:

**Adjudication B — Test Placement Defect Confirmed**

The M03 closure test `m03Closure.test.ts` is located in an architecturally inappropriate place (`packages/domain`). The test should be relocated to `packages/testing` under a separately authorized corrective mandate, resolving finding F-0301 and restoring strict dependency-graph validation compliance without weakening the graph validator.

**M03 remains open.**
