# CEngS-002 — Engineering Rules

**Version 2.0 · Status: RATIFIED · Authority: Engineering Standard (may evolve) · Depends On: CEngS-001**

## 1. Purpose

CEngS-001 defines immutable law. This document defines the operational engineering rules that implement that law day to day: repository shape, package boundaries, dependency discipline, and branching. Unlike CEngS-001, this document may evolve — but never in a direction that weakens CEngS-001.

## 2. Principles

Optimize for simplicity, small changes, fast feedback, testability, determinism, maintainability. Prefer incremental evolution over large rewrites.

## 3. Repository Structure

The platform is a modular monorepo. Every package has exactly one responsibility.

```
/apps        web, admin, docs
/packages    runtime, sdk, core, policies, registry, shared
/tools       scripts, tooling
/tests
/docs
```

## 4. Runtime Package Rules

`packages/runtime` implements CEngS-001 §4 concretely. Forbidden imports: HTTP frameworks, database libraries, ORMs, filesystem APIs, cloud SDKs, environment access, logging frameworks, caching libraries, network clients. Only pure computation is permitted. This is enforced mechanically in CI (CEngS-102), not by convention.

## 5. Package Boundaries

Every package exposes a public API; internals stay private. Cross-package imports go only through public interfaces. Circular dependencies are prohibited, always.

## 6. Dependency Management

Every dependency has documented justification. Unused dependencies are removed. Large frameworks require architectural approval. Keep the dependency count minimal — prefer standard library and existing packages over new ones.

## 7. Branch Strategy

- `main` — always deployable
- feature branches — one milestone (see CEngS-003 §Task Hierarchy) only, short-lived
- hotfix branches — critical production fixes only

## 8. Pull Requests

Every PR is narrowly scoped — recommended max 300–500 changed lines; split larger ones. Full requirements and checklist are in CEngS-102 / CL-001.

## 9. Logging

Logging occurs only outside the Runtime. Logs are structured and machine-readable. Sensitive information is never logged (see CEngS-104 for the full observability standard).

## 10. Continuous Improvement

This document may evolve as engineering practice improves. CEngS-001 may not. Any change to this document must preserve compatibility with CEngS-001; if it can't, that's a signal the change belongs in a constitutional amendment, not here.
