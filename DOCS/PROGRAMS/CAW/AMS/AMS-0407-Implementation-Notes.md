# AMS-0407 — Runtime Purity and Entropy Enforcement Implementation Notes

## 1. Mandate Scope and Constitutional Purpose

AMS-0407 strengthens the existing `@zyppi/runtime` purity and determinism validator (`tools/validate-runtime-purity.mjs`) to detect and reject constitutionally prohibited entropy, host dependence, dynamic execution, and hidden cross-invocation state.

The purpose of this mandate is narrow enforcement completion. The existing recursive AST traversal structure and TypeScript Compiler API architecture of the validator have been preserved, and targeted AST checks have been integrated into the existing recursive visitor.

---

## 2. Reconnaissance Findings Adopted

The monorepo was classified under **Case B — Narrow Extension**. The implementation adopted the confirmed reconnaissance findings of five major enforcement gaps and addressed them directly:

1. Computed-property bypasses like `Math["random"]()` and `Date["now"]()`.
2. Global `process` and environment variable access.
3. `eval()` and `Function`-based dynamic code execution.
4. Garbage collection and finalization schedule dependencies via `WeakRef` and `FinalizationRegistry`.
5. Global namespace mutations of `globalThis` and `global`.
6. Mutable module-level state leading to cross-invocation leakages.

---

## 3. Implemented Detection Coverage

The validator has been extended with stable, sequential rule IDs under the `RTP-DETERMINISM` taxonomy:

### 3.1 RTP-DETERMINISM-001 / RTP-DETERMINISM-002: Computed-Property Entropy Bypasses

Matches `ts.ElementAccessExpression` inside call paths to reject equivalent bracket-notation access forms of standard entropy sources:

- `Math["random"]()`
- `Date["now"]()`

Uninvoked passive references are permitted to prevent false positives.

### 3.2 RTP-DETERMINISM-004: Process & Environment Access

Rejects all references to the unshadowed Node.js global `process` capability (e.g. `process.env`, `process["env"]`, `process.cwd()`, `use(process)`). Fully supports lexical scope shadowing to allow local variables or parameters named `process`.

### 3.3 RTP-DETERMINISM-005: Dynamic Code Execution Prohibition

Rejects actual call or construction paths targeting `eval` or `Function`, including namespace-prefixed forms and bracket notation:

- `eval(code)`, `Function(code)`, `new Function(code)`
- `globalThis.eval(code)`, `globalThis.Function(code)`, `new globalThis.Function(code)`
- `global["eval"](code)`, `global["Function"](code)`, `new global["Function"](code)`

Local variables or parameters shadowing `eval` or `Function` are preserved and accepted.

### 3.4 RTP-DETERMINISM-006: WeakRef and FinalizationRegistry Prohibition

Rejects construction of global GC-observability capabilities:

- `new WeakRef(target)`
- `new FinalizationRegistry(callback)`
- `new globalThis.WeakRef(target)`
- `new global["FinalizationRegistry"](callback)`

`WeakMap` and `WeakSet` remain fully permitted.

### 3.5 RTP-DETERMINISM-007: Global Namespace Mutation Prohibition

Rejects all assignment and update operations targeting properties or elements rooted in the unshadowed global namespaces `globalThis` or `global`:

- Operators: `=`, `+=`, `-=`, `*=`, `/=`, `++`, `--`, and all other TypeScript assignment operators (e.g. `&&=`, `||=`, `??=`, `**=`, `<<=`).
- Dot and bracket notation forms (e.g. `globalThis.runtimeState = value`, `global["runtimeState"]++`).

### 3.6 RTP-DETERMINISM-008: Mutable Module-Level State

Rejects top-level state retention while permitting block-scoped execution:

- Rejects top-level/source-file scope `let` and `var` bindings.
- Rejects direct assignments, updates, and direct mutating method calls (such as `.push()`, `.set()`, `.add()`, `.clear()`) on top-level `const` bindings.

---

## 4. Mutable-State Boundary

To prevent cross-invocation state leakage while preserving block-scoped utility:

- **Prohibited top-level/module-level mutable bindings:** `let` or `var` variables declared at source-file scope (grandparent is `VariableStatement`, great-grandparent is `SourceFile`).
- **Permitted local mutable bindings:** Inside functions, methods, and loop headers (e.g., `for (let item of items)` and `for (const key in obj)` occurring at top level are fully permitted as their declaration scopes do not establish persistent module-retained state).
- **Top-Level `const` Structures:** Harmoless immutable constants (e.g., `const MAX_RETRIES = 3` or `const STAGE_ORDER = [...] as const`) are fully accepted. Direct mutations on them are blocked, but local variables shadowing top-level constants are allowed to mutate freely.

---

## 5. False-Positive Controls

To ensure the validator remains highly focused without overreaching, the following constructs are explicitly permitted and verified:

1. `WeakMap` and `WeakSet` constructions are fully accepted.
2. Function-local mutable variables (`let`, `var`, `const`) and mutating method calls on them.
3. Module-scope immutable destructuring declarations using `const` (e.g. `const { a, b } = config;`).
4. Module-scope `for...of` and `for...in` loop variables.
5. Lexical shadowing of global names (e.g., local parameter `process: string` or local function `eval()`).

---

## 6. Fail-Closed and CI Behavior

The validator remains an uncompromising fail-closed gate:

- All violations are collected and deterministically sorted (by path, line, column, and ruleId) to produce stable output.
- If any violation is found, the CLI prints the diagnostics and exits with code `1`.
- Rejection is propagated cleanly via `pnpm runtime:purity` to fail the GitHub Actions CI workflow under Default Denial.

---

## 7. Static-Analysis Limitations

Static analysis is an AST-local static hygiene layer and **does not prove complete Runtime determinism or replace future runtime capability control or sandbox-level enforcement**.

- The validator does not perform whole-program data-flow, interprocedural analysis, or transitive capability tracing.
- Indirect aliases and transitive capability acquisition may remain outside direct AST coverage.
- `new Date(argument)` with a complex or computed argument is not itself proof that the argument is deterministic. For example:
  ```ts
  new Date(getTimestamp());
  ```
  is not, by the presence of the argument alone, proof that `getTimestamp()` is deterministic. Tracing arbitrary function calls, aliases, callbacks, or imported implementations to prove the origin of a timestamp is outside the scope of syntax-local AST analysis. This is an accepted and documented boundary.

---

## 8. Verification Summary

All required verification suites compile and pass successfully:

- **Purity Scan Command:** `pnpm runtime:purity` (PASSED)
- **Dependency Graph Validator:** `pnpm graph:validate` (PASSED)
- **Type Compilation Command:** `pnpm exec tsc -b` (PASSED)
- **Unit Tests Command:** `pnpm test` (414 tests PASSED)
