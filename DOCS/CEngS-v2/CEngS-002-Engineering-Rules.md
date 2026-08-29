# CEngS-002 — Engineering Rules

**Version 2.1 · Status: RATIFIED · Authority: Engineering Standard (may evolve) · Depends On: CEngS-001**

## 1. Purpose

CEngS-001 defines immutable law. This document defines the operational engineering rules that implement that law day to day: repository shape, workspace admission, package boundaries, dependency discipline, and branching.

CEngS-002 is the platform-wide authority for repository governance.

Program-specific repository maps may define the topology and permitted dependencies of their own program, but they remain subordinate to CEngS-002 and may not create platform-wide repository law.

Unlike CEngS-001, this document may evolve — but never in a direction that weakens CEngS-001.

## 2. Principles

Optimize for simplicity, small changes, fast feedback, testability, determinism, maintainability.

Prefer incremental evolution over large rewrites.

Repository governance follows:

> **one platform-wide authority, federated program ownership, explicit direct edges, fail closed.**

## 3. Repository Structure

The platform is a modular monorepo.

Top-level repository locations may contain packages, applications, infrastructure, tooling, tests, documentation, and future program-owned workspaces.

```text
/apps
/packages
/infra
/edge
/tools
/tests
/DOCS
```

The existence of a directory or workspace in the repository does not itself grant dependency authority.

Program-specific topology belongs in that program's repository map.

## 4. Runtime Package Rules

`packages/runtime` implements CEngS-001 §4 concretely.

Forbidden imports include HTTP frameworks, database libraries, ORMs, filesystem APIs, cloud SDKs, environment access, logging frameworks, caching libraries, and network clients.

Only pure computation is permitted.

This is enforced mechanically in CI (CEngS-102), not by convention.

RGT and program-specific repository rules SHALL NOT weaken Runtime purity.

## 5. Workspace and Package Boundaries

Every governed workspace node SHALL have:

- an explicit repository role;
- an owning authority;
- a defined public boundary where applicable.

Every package exposes a public API; internals stay private.

Cross-package imports go only through public interfaces unless a higher authority explicitly defines otherwise.

Circular dependencies are prohibited, always.

Unknown workspace nodes are denied until explicitly admitted.

## 6. Dependency Authorization

Every direct workspace dependency edge requires explicit authority.

Authorization is:

- **direct** — authority for `A → B` does not arise through another node;
- **non-transitive** — `A → B` and `B → C` do not authorize `A → C`;
- **scoped** — a program may authorize edges only within the authority granted to that program;
- **a ceiling, not an obligation** — an authorized edge need not be used;
- **fail-closed** — an unknown or unclassified direct workspace edge is denied.

Repository implementation does not manufacture authority.

A dependency found in source code, `package.json`, `tsconfig`, a validator, generated metadata, or a historical implementation mandate is not lawful merely because it exists.

Executable repository policy must derive from active authority, not replace it.

## 7. Program Repository Maps

A program-specific repository map governs only that program's repository topology and authorized dependency edges.

Examples include:

- `CAW-004` for CAW;
- a future `ZII-004` if ZII requires a permanent repository map;
- future peer-program repository maps admitted under the same model.

A program repository map SHALL NOT:

- redefine CEngS platform-wide repository law;
- grant authority to a peer program;
- make a validator or implementation artifact constitutional by itself;
- infer authority from repository presence.

Where a program map conflicts with CEngS-002, CEngS-002 governs.

## 8. Global Executable Policy

The repository SHALL have one platform-wide executable representation for workspace admission and direct dependency authorization.

That executable representation is operational policy, not independent constitutional authority.

It must be capable of composing platform-wide rules with program-scoped authority without flattening all programs into one ownership domain.

Its concrete representation is defined by implementation work authorized after this amendment.

## 9. Branch Strategy

- `main` — always deployable
- feature branches — one milestone (see CEngS-003 §Task Hierarchy) only, short-lived
- hotfix branches — critical production fixes only

## 10. Pull Requests

Every PR is narrowly scoped — recommended max 300–500 changed lines; split larger ones.

Full requirements and checklist are in CEngS-102 / CL-001.

## 11. Logging

Logging occurs only outside the Runtime.

Logs are structured and machine-readable.

Sensitive information is never logged (see CEngS-104 for the full observability standard).

## 12. Continuous Improvement

This document may evolve as engineering practice improves.

CEngS-001 may not.

Any change to this document must preserve compatibility with CEngS-001; if it cannot, that is a signal the change belongs in a constitutional amendment, not here.
