# AMS-0407 — Runtime Purity and Entropy Enforcement Reconnaissance

## 1. Recon Scope and Read-Only Constraints

### Purpose of Mandate

This mandate authorizes a strictly read-only reconnaissance phase and architectural gap assessment for **IT-0407 — Runtime Purity / Entropy Enforcement** (Milestone M04 — Runtime Skeleton). The goal is to determine if the repository’s existing Runtime purity validator (`tools/validate-runtime-purity.mjs`) provides an effective, fail-closed constitutional enforcement gate, and whether its AST coverage is sufficient for the deterministic-execution boundaries required for M04.

### Inspected Repository State

The reconnaissance was performed on a clean workspace of the `zyppi-monorepo` running:

- **Node.js**: v22.22.1 (sandboxed; workspace-declared engine requirement is `20.19.0`)
- **pnpm**: v10.30.3 (workspace-declared packageManager is `pnpm@10.30.3`)

### Inspected Files and Commands

The following files and components were subjected to direct source-level audit:

- `tools/validate-runtime-purity.mjs` (Validator entry point and implementation rules)
- `tools/runtime-purity/validate-runtime-purity.test.ts` (Automated verification test suite)
- `packages/runtime/package.json` (Runtime manifest, dependencies, and metadata config)
- `packages/runtime/src/pipeline.ts` (Synchronous, in-memory pipeline execution target)
- `package.json` (Root monorepo workspace dependencies and commands)
- `.github/workflows/ci.yml` (Continuous integration workflow definition)

### Controlled Execution Commands Verified

- `pnpm runtime:purity` (Executes the validator script)
- `pnpm test` (Runs the automated test suites using Vitest)
- Controlled CLI execution using temporary, untracked fixtures to test detection, reporting, and process exit behavior.

### Adherence to Read-Only Constraints

No production code, test files, package manifests, lockfiles, CI configurations, typescript project references, or existing ADR/AMS documentation files were modified or left changed in any way. All testing was performed using clean, temporary, and untracked code artifacts that were completely removed prior to completing this step. No external dependencies were installed. This resulting report is the sole deliverable.

---

## 2. Current Validator Architecture

### Validator Entry Point

The validator is implemented as a Node.js ESM module located at `tools/validate-runtime-purity.mjs`.

### Parsing and AST Approach

- **TypeScript Compiler API**: The validator uses `ts.createSourceFile` with `ts.ScriptTarget.ES2022` to parse the text content of source files into a TypeScript Abstract Syntax Tree (AST).
- **Node Visitor Pattern**: A recursive `visit(node)` helper traverses the AST nodes using `ts.forEachChild` to inspect specific expressions, declarations, and call structures.

### File-Selection Scope

The scanning boundary is defined by `scanRuntimePurity(workspaceRoot)`:

1. **Manifest Scan**: Resolves and audits `packages/runtime/package.json`.
2. **Production Source Scan**: Recursively walks the directory tree under `packages/runtime/src`.
   - **Exclusions**: Explicitly excludes `node_modules`, `dist`, `build`, `coverage`, `fixtures`, and `temp` directories.
   - **Source Constraints**: Only parses files with `.ts` or `.tsx` extensions, excluding definition files (`.d.ts`) and unit tests matching `.test.` or `.spec.`.

### Rule Organization

The validator defines stable rule identifiers mapping to three categories:

- **Manifest Governance (`RTP_MANIFEST`)**:
  - `RTP-MANIFEST-001` (`MANIFEST_DEPENDENCY`): Blocks unauthorized dependencies.
  - `RTP-MANIFEST-002` (`MANIFEST_PEER_DEPENDENCY`): Blocks unauthorized peer dependencies.
- **Import Governance (`RTP_IMPORT`)**:
  - `RTP-IMPORT-001` (`IMPORT_ESCAPE`): Blocks relative imports escaping `packages/runtime/`.
  - `RTP-IMPORT-002` (`IMPORT_NODE_BUILTIN`): Blocks imports of standard Node.js built-ins.
  - `RTP-IMPORT-003` (`IMPORT_UNAPPROVED_INTERNAL`): Blocks unapproved internal packages (permits only root-level `@zyppi/domain` and `@zyppi/shared`).
  - `RTP-IMPORT-004` (`IMPORT_UNAPPROVED_EXTERNAL`): Blocks all external package imports (Default Denial).
  - `RTP-IMPORT-005` (`IMPORT_SUBPATH_DENIED`): Blocks subpath imports of approved packages to protect public boundaries.
  - `RTP-IMPORT-006` (`IMPORT_NON_LITERAL`): Blocks non-literal module specifiers in dynamic `import()` or `require()`.
- **Static Determinism (`RTP_DETERMINISM`)**:
  - `RTP-DETERMINISM-001` (`DETERMINISM_MATH_RANDOM`): Blocks `Math.random()`.
  - `RTP-DETERMINISM-002` (`DETERMINISM_DATE_NOW`): Blocks `Date.now()`.
  - `RTP-DETERMINISM-003` (`DETERMINISM_NEW_DATE_ZERO_ARGS`): Blocks zero-argument `new Date()`.

### Reporting Mechanism

Violations are accumulated in a flat list. If any violations are found, the validator:

1. Sorts violations deterministically by file path, line, column, and Rule ID.
2. Formats and prints each violation to `stderr` with line/column localization and a detailed reason.
3. Prints a static, required purity disclaimer.
4. Terminates the process with exit code `1`.

### Current Invocation Path

The validator can be run from the repository root through the following command:
`node tools/validate-runtime-purity.mjs`
This is mapped in the root `package.json` to the package script `"runtime:purity"`.

---

## 3. Exit-Code and Fail-Closed Enforcement Audit

To establish whether the current validator acts as an actual enforcement gate, we audited its execution behaviors.

### Success Behavior

- **Detection**: No violations found.
- **Reporting**: Prints a structured summary of passed rules to `stdout` along with the required disclaimer.
- **Exit Code**: Terminated with exit code `0`.
- **Evidence**: `DIRECT SOURCE + EXECUTION EVIDENCE`. Running `pnpm runtime:purity` on the unmodified codebase prints a passing status and exits `0`.

### Failure Behavior

- **Detection**: Prohibited construct recognized in any scanned source file or manifest.
- **Reporting**: Prints diagnostic details of all detected violations to `stderr` and lists the rule-specific explanations, followed by the required disclaimer.
- **Enforcement / Fail-Closed Status**: The script calls `process.exit(1)` immediately after printing the list.
- **Failure Progression**: The validator continues scanning all target files and manifests to collect a comprehensive list of all violations, rather than exiting on the first failure. It then deterministically fails the process at the end of the scan. No detected violation can result in a successful command exit.
- **Evidence**: `DIRECT SOURCE + EXECUTION EVIDENCE`. We introduced a temporary file `packages/runtime/src/temp_recon_fixture.ts` containing `Date.now()` and verified that running `pnpm runtime:purity` printed the diagnostic and exited with code `1`.

---

## 4. Package-Script and CI Integration Path

### Exact Command Path

- **Package Script**: The root `package.json` defines `"runtime:purity": "node tools/validate-runtime-purity.mjs"`.
- **CI / Verification Target**: The script is included in the unified `"ci"` wrapper script:
  `"ci": "pnpm format:check && pnpm lint && pnpm exec tsc -b && pnpm runtime:purity && pnpm boundary:all && pnpm graph:validate && pnpm test"`

### Required Verification Integration

- **Continuous Integration**: Yes, the GitHub Actions configuration `.github/workflows/ci.yml` has an explicit step executing this gate:
  ```yaml
  - name: Run Runtime purity validation
    run: pnpm runtime:purity
  ```
  Since any non-zero exit code in a GitHub Actions workflow step halts the job execution, any purity violation successfully blocks the CI pipeline from passing.
- **Pre-commit / Pre-push Gates**: No automated pre-commit or pre-push hook configuration (such as Husky) is currently installed or enabled in the codebase.
- **Evidence**: `DIRECT SOURCE EVIDENCE` (`.github/workflows/ci.yml` and `package.json`).

### Exit-Code Propagation

The exit code `1` emitted by the Node.js process is fully propagated up to the shell and correctly fails the `pnpm` command execution, as well as the composite `"ci"` script and the CI runner step.

- **Evidence**: `EXECUTION EVIDENCE`. Run tests in bash confirmed the shell captured exit code `1` when a violation was active.

---

## 5. Entropy and Escape-Hatch Coverage Matrix

Below is the audited coverage matrix mapping standard entropy sources, global state mutations, and dynamic escape-hatch techniques against the current validator AST rules.

| Verification Target                                       | Constitutional Relevance                | Enforcement Classification            | Validator Evidence                                                                                                                                | Gap / Limitation                                                                                                                                          |
| :-------------------------------------------------------- | :-------------------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Date.now()`                                              | Implicit time entropy                   | **ENFORCED**                          | AST matches `PropertyAccessExpression` where object is `Date` and property is `now`.                                                              | _None._ Covered under rule `RTP-DETERMINISM-002`.                                                                                                         |
| `new Date()`                                              | Host-time dependence                    | **ENFORCED**                          | AST matches `NewExpression` where object is `Date` and arguments count is exactly `0`.                                                            | _None._ Covered under rule `RTP-DETERMINISM-003`.                                                                                                         |
| Other `Date` forms (e.g., `Date.UTC`, `new Date(string)`) | Time-related bypass risk                | **PARTIALLY ENFORCED**                | AST allows parameterized constructors (e.g., `new Date(1785382820000)`). Other static properties like `Date.parse()` or `Date.UTC()` are allowed. | Computed-property syntax like `Date["now"]` is NOT covered. `Date` helper methods could be misused if they consume host-specific timezone settings.       |
| `Math.random()`                                           | Hidden execution entropy                | **ENFORCED**                          | AST matches `PropertyAccessExpression` where object is `Math` and property is `random`.                                                           | _None._ Covered under rule `RTP-DETERMINISM-001`.                                                                                                         |
| Other randomness APIs (e.g., `crypto.getRandomValues`)    | Randomness bypass risk                  | **NOT ENFORCED**                      | No matching rules for `crypto` or `webcrypto` globals.                                                                                            | Standard `crypto` module is blocked indirectly via node built-in import restrictions, but the global `crypto` object is not blocked.                      |
| Filesystem access                                         | External I/O & host dependence          | **ENFORCED** (indirectly via imports) | Blocks imports of standard Node built-ins (`fs`, `node:fs`, etc.) and external packages.                                                          | No AST rule prevents access to global/implicit runtime FS mechanisms if available in the host sandbox environment, though none exist in standard pure V8. |
| Network access                                            | Environmental dependence                | **ENFORCED** (indirectly via imports) | Blocks imports of standard Node built-ins (`http`, `node:https`, etc.) and external packages.                                                     | Access to global fetch (if exposed in the host environment) is NOT explicitly blocked.                                                                    |
| Child-process / OS access                                 | Host-service dependence                 | **ENFORCED** (indirectly via imports) | Blocks imports of standard Node built-ins (`child_process`, `os`, `node:os`, etc.) and external packages.                                         | Access to platform-specific spawning or system-level APIs is not prevented if accessed via other global properties.                                       |
| `process.env`                                             | Environment-variable dependency         | **NOT ENFORCED**                      | No AST rule targets the identifier `process` or property `env`.                                                                                   | Allows execution logic to read from and depend on implicit host env variables.                                                                            |
| Broader `process` access                                  | Implicit process & host state           | **NOT ENFORCED**                      | No AST rule targets `process` property accesses or method invocations.                                                                            | Prohibited process state or side-effects can be triggered using global `process` properties.                                                              |
| `globalThis` mutation                                     | Hidden mutable execution state          | **NOT ENFORCED**                      | No AST rule analyzes assignments or property updates on `globalThis`.                                                                             | Top-level variables and state can be leaked or modified globally across pipeline cycles.                                                                  |
| Other global-object mutation                              | Hidden process state                    | **NOT ENFORCED**                      | No AST rule checks for mutations on global object aliases (like `global` or `window`).                                                            | Cross-invocation state leakage is possible.                                                                                                               |
| `eval()`                                                  | Dynamic code execution and AST bypass   | **NOT ENFORCED**                      | No AST rule blocks `CallExpression` matching `eval`.                                                                                              | Dynamic code strings can execute outside static verification.                                                                                             |
| `Function()`                                              | Dynamic code construction               | **NOT ENFORCED**                      | No AST rule blocks `CallExpression` matching `Function`.                                                                                          | Dynamic construction can bypass static analysis.                                                                                                          |
| `new Function()`                                          | Dynamic code construction               | **NOT ENFORCED**                      | No AST rule blocks `NewExpression` matching `Function`.                                                                                           | Dynamic constructors can execute unverified code.                                                                                                         |
| `WeakRef`                                                 | GC-observable nondeterminism            | **NOT ENFORCED**                      | No AST rule blocks `NewExpression` or `Identifier` matching `WeakRef`.                                                                            | Allows GC-dependent execution behavior.                                                                                                                   |
| `FinalizationRegistry`                                    | Nondeterministic finalization timing    | **NOT ENFORCED**                      | No AST rule blocks `NewExpression` or `Identifier` matching `FinalizationRegistry`.                                                               | GC scheduling can influence control flow.                                                                                                                 |
| Mutable module-level state                                | Cross-invocation history & hidden state | **NOT ENFORCED**                      | No AST rule scans for `let` / `var` declarations, mutable object bindings, or mutations at the module level.                                      | State can persist across execution requests, violating pure isolation.                                                                                    |

- **Evidence Class**: `DIRECT SOURCE + EXECUTION EVIDENCE`. Verified via direct inspection of `tools/validate-runtime-purity.mjs` and tested through temporary fixture injection.

---

## 6. AST Bypass-Form Analysis

To establish the limits of the validator's AST rules, we evaluated how it handles alternative or obfuscated syntax forms.

### Tested Patterns and AST Evaluation

#### 1. Computed-Property Bracket Access (e.g., `Date["now"]()`, `Math["random"]()`, `new Date["constructor"]()`)

- **Detection**: **NOT DETECTED**
- **AST Node Details**: Standard properties are matched using `ts.isPropertyAccessExpression` which requires dot-notation (`Math.random`). Bracket notation resolves to a `ts.ElementAccessExpression` where the property name is a `StringLiteral` or computed expression. Since the validator does not scan `ElementAccessExpression`, these forms completely bypass detection.
- **Exit Code**: Exits `0` (Success).
- **Evidence Class**: `DIRECT SOURCE + EXECUTION EVIDENCE`. Tested using `Date["now"]()` in a temporary fixture.

#### 2. Obfuscated Global Reference / Mutation (e.g., `process["env"]`, `globalThis["runtimeState"] = value`)

- **Detection**: **NOT DETECTED**
- **AST Node Details**: There are no rules checking the `process` or `globalThis` identifiers. Assignment expressions on properties (both dot and bracket notation) are not evaluated by any AST walk rule.
- **Exit Code**: Exits `0` (Success).
- **Evidence Class**: `DIRECT SOURCE + EXECUTION EVIDENCE`.

#### 3. Dynamic Execution and Construction (e.g., `eval(code)`, `globalThis.eval(code)`, `Function(code)()`, `new Function(code)()`)

- **Detection**: **NOT DETECTED**
- **AST Node Details**: The validator does not target the identifiers `eval` or `Function` in its `CallExpression` or `NewExpression` handlers.
- **Exit Code**: Exits `0` (Success).
- **Evidence Class**: `DIRECT SOURCE + EXECUTION EVIDENCE`.

---

## 7. Global and Module-State Analysis

We analyzed the validator's capacity to enforce execution isolation by inspecting how it handles top-level state declarations and mutations.

### Binding Immutability

- **Detection**: **NOT DETECTED**
- **Evaluation**: The AST traversal does not check variable declaration blocks (`VariableDeclarationList` or `VariableDeclaration`). It does not inspect whether variables are declared using `let`, `var`, or `const`.
- **Result**: Top-level mutable variables (`let state = 0;`) can be freely declared and reassigned within packages/runtime without flagging any violation.
- **Evidence Class**: `DIRECT SOURCE EVIDENCE`.

### Value Immutability

- **Detection**: **NOT DETECTED**
- **Evaluation**: The validator does not evaluate assignment operators (`=`, `+=`, etc.) or mutation methods (such as `Array.prototype.push`, `Object.assign`, or direct property updates) on objects.
- **Result**: Constant bindings that hold mutable structures (e.g., `const cache = {};`) can be freely mutated, creating cross-invocation state leakage.
- **Evidence Class**: `DIRECT SOURCE EVIDENCE`.

### Global-Object Mutation Coverage

- **Detection**: **NOT DETECTED**
- **Evaluation**: No rules inspect mutations to `globalThis`, `global`, `window`, or other environment globals.
- **Result**: Arbitrary runtime variables can be attached to global scopes, directly violating execution isolation.
- **Evidence Class**: `DIRECT SOURCE EVIDENCE`.

### Immutable Constants Treatment

- **Evaluation**: Simple, harmless module-level constants (e.g., `const CONFIG_LIMIT = 100;`) are appropriately permitted. Since the validator has no variable declaration checking rules, it does not suffer from false positives regarding harmless module-level constants.
- **Evidence Class**: `DIRECT SOURCE EVIDENCE`.

---

## 8. False-Positive and False-Negative Observations

### Confirmed False Negatives (Security/Purity Gaps)

1. **Computed-Property Bypass (`DIRECT SOURCE + EXECUTION EVIDENCE`)**:
   An engineer can bypass `Math.random()` and `Date.now()` constraints simply by writing `Math["random"]()` or `Date["now"]()`.
2. **Dynamic Code Execution (`DIRECT SOURCE + EXECUTION EVIDENCE`)**:
   `eval` and `Function` constructors are completely ignored, enabling execution of unvalidated code.
3. **Environment-Variable Access (`DIRECT SOURCE + EXECUTION EVIDENCE`)**:
   `process.env` is unmonitored, allowing pure-deterministic code to depend on external host environments.
4. **Weak References (`DIRECT SOURCE + EXECUTION EVIDENCE`)**:
   `WeakRef` and `FinalizationRegistry` usage is not detected, enabling GC-observable nondeterministic control flow.
5. **Cross-Invocation Mutable State (`DIRECT SOURCE EVIDENCE`)**:
   Top-level variables (`let`, `var`) and object mutations are unchecked, permitting execution history to bleed across multiple pipeline executions.

### Confirmed False Positives

_None._ The current implementation is highly precise regarding the rules it does enforce; there is no evidence of the validator rejecting constitutionally acceptable Runtime code.

### Potential False Positives

- **Parameterized `Date` construction (`INFERENCE`)**:
  While `new Date(timestamp)` is allowed, the current simple AST check allows any arguments. There is a potential concern that complex arguments could hide dynamic calculations. However, no false positives on valid, pure-deterministic timestamp instantiations have been reported or observed.

---

## 9. Case Classification

We classify this repository's purity enforcement system under:

### **Case B — Narrow Extension**

### Supporting Evidence

1. **Fail-Closed Gate Status**:
   Direct execution evidence confirms that the existing validator acts as a robust, fail-closed command-line gate. It correctly sets the process exit code to `1` when a violation is found, successfully failing CI and verification scripts.
2. **Architectural Suitability**:
   The current architecture (TypeScript Compiler API parsing and recursive AST node visitor) is exceptionally clean, well-structured, and highly suitable.
3. **Narrow Nature of Gaps**:
   The uncovered gaps—such as detecting bracket notation, banning `process.env`, `eval`, `Function`, `WeakRef`, and `globalThis` mutations—can be addressed completely by adding focused matching logic inside the existing recursive AST visitor.
4. **Feasibility without Redesign**:
   No runtime-level execution isolation, V8 sandboxing, or compilation rewrite is needed. Bounded static AST checking rules added to `validate-runtime-purity.mjs` are fully sufficient to block these escape vectors at the static-analysis level.

---

## 10. Evidence-Backed Recommendation

### Follow-on Implementation Mandate Recommendation

Yes, we strongly recommend a separate, follow-on implementation mandate to resolve the verified static purity and determinism gaps.

### Minimum Authorized Scope

The follow-on mandate should be tightly scoped to enhance the AST checking capabilities of `tools/validate-runtime-purity.mjs` to block the following specific escape vectors:

1. **Computed-Property and Element-Access Bypass**:
   Extend the AST checks to inspect `ElementAccessExpression` nodes. If the expression matches bracket notation for `Math["random"]`, `Date["now"]`, or `new Date()`, raise the respective `RTP-DETERMINISM` violation.
2. **Dynamic Code Execution Blocks**:
   Add rules targeting the identifiers `eval` and `Function` (both in standard calls, new expressions, and global namespaces like `globalThis.eval` or `globalThis.Function`) to prevent execution-time AST bypasses.
3. **Environment Variable and Process Dependencies**:
   Add a rule to block access to the global `process` object (e.g., `process.env` or `process["env"]`), enforcing absolute environment-variable and host-independence.
4. **Nondeterministic Garbage-Collection Timing**:
   Add rules to block usage of `WeakRef` and `FinalizationRegistry` constructors to prevent GC-observable execution nondeterminism.
5. **Global Mutation Prohibitions**:
   Add checks to block property assignments or modifications targeting `globalThis`, `global`, or other global namespace aliases.

### Out of Scope Items for Follow-on Mandate

The following must remain outside the scope of the follow-on mandate to maintain simple, fast, and deterministic static checks:

- Any implementation of runtime isolation (V8 contexts), sandbox environments, or module loaders.
- Prohibitions on harmless module-level constant definitions.
- Banning `WeakMap` or `WeakSet` (which are constitutionally acceptable and do not expose GC timing).
