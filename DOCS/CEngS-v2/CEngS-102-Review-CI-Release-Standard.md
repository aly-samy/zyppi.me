# CEngS-102 — Review, CI/CD & Release Standard

**Version 2.0 · Status: RATIFIED · Authority: Operational Standard · Depends On: CEngS-001, CEngS-002, CEngS-003, CEngS-101**
**Supersedes and merges legacy: CEngS-004 "Constitutional Code Review Standard", CEngS-005 "Constitutional Build & Release Standard" (legacy number collided with the Testing Standard — resolved here)**

## 1. Purpose

Review and release are one continuous gate, not two processes: a contribution is presumed non-compliant until it proves itself, first in review, then in the pipeline, then at deployment. This document defines that whole gate, end to end.

## 2. Constitutional Principle

The burden of proof is on the implementation, always. Reviews may be performed by human engineers, AI agents, or automated CI — but **only a human maintainer approves a constitutional change or a production deployment.**

## 3. The Full Gate

```
Compile → Static Analysis → Architecture Validation → Unit/Integration/Replay Tests
  → Security Scan → Performance Benchmarks → Artifact Generation → Signing
  → Human Approval → Deploy
```

Failure at any stage stops the pipeline. No stage may be skipped.

## 4. Review Checklist (what a reviewer — human or AI — verifies)

- ☐ Layer boundaries respected, no circular dependencies (CEngS-001 §3, CEngS-002 §5)
- ☐ Runtime purity intact — no HTTP/SQL/ORM/filesystem/cloud SDK/env/logging/randomness/system time/hidden state in `packages/runtime` (CEngS-001 §4)
- ☐ Every new/changed dependency justified (CEngS-002 §6)
- ☐ Determinism preserved — no implicit entropy, canonical serialization intact, replay-stable
- ☐ Security preserved — auth, input/output validation, least privilege, no secrets in code
- ☐ Tests present and passing per CEngS-101
- ☐ Benchmarks acceptable per CEngS-103 (where applicable)
- ☐ Docs updated per CEngS-105
- ☐ For AI contributions specifically: mandate followed exactly, no architectural drift, no hallucinated functionality or invented requirements, constitutional references correct

(This checklist is also published standalone as **CL-001**.)

## 5. Merge Blocking Conditions

A contribution never merges if: any test fails, docs are incomplete, architecture boundaries are violated, Runtime purity is broken, security review fails, determinism or replay fails, breaking changes are undocumented, or any constitutional violation exists.

## 6. Severity Levels

| Severity | Meaning                             | Effect                              |
| -------- | ----------------------------------- | ----------------------------------- |
| Critical | Violates constitutional law         | Merge prohibited                    |
| High     | Security or architectural violation | Merge prohibited                    |
| Medium   | Maintainability/quality concern     | Must fix before release             |
| Low      | Minor improvement                   | May merge with documented rationale |

**Exceptions** (any severity) must be explicit, documented, time-bounded, human-approved, and carry a removal plan. There is no other path to bypassing this gate.

## 7. Build Pipeline (CI, on every PR)

1. **Static Validation** — formatting, linting, dependency analysis, forbidden-API detection, architecture validation. Failure halts the pipeline.
2. **Compilation** — every package, zero warnings.
3. **Unit Tests** — 100% pass required.
4. **Replay Tests** — every hash must match; any mismatch halts the pipeline.
5. **Boundary Validation** — forbidden imports and circular deps fail the build.
6. **Performance Benchmarks** — compared to baseline; significant regressions require review.
7. **Security Analysis** — dependency scan, secret scan, license scan, SBOM, container scan.
8. **Artifact Generation** — compiled packages, OpenAPI specs, execution schemas, docs, release notes, checksums, SBOM.
9. **Signing** — every artifact is cryptographically signed; unsigned artifacts never deploy.
10. **Release Approval** — human sign-off only.

Builds are reproducible: the same commit always produces identical binaries, packages, artifacts, and checksums. Builds never depend on local machine state, developer config, timestamps, random values, or mutable external resources.

## 8. Build & Release Evidence

Every successful build produces a **Build Receipt**: build ID, commit SHA, repo, branch, builder identity, compiler/package versions, checksums, SBOM hash, timestamp, test/replay/benchmark summaries, signature.

Every release produces a **Release Receipt**: version, artifact hash, environment, approver, deployment time, rollback version, validation results, signature.

## 9. Versioning & Channels

Semantic Versioning (MAJOR = constitutional/breaking, MINOR = backward-compatible feature, PATCH = bugfix). Channels: **Development** (internal only) → **Preview** (feature-complete, not production) → **Stable** (production, all gates required) → **Emergency** (security fixes only, requires post-release constitutional review).

## 10. Deployment, Rollback, Migrations, Secrets

- Deployments are automated, repeatable, versioned, auditable. Manual production deployment is prohibited. Infrastructure is defined as code and reviewed identically to application code.
- Every deployment supports rollback via a single command, with previous-artifact availability, schema compatibility, and data preservation — never requiring a rebuild.
- Database migrations are versioned, reviewed, tested, reversible where possible, and immutable once merged.
- Secrets never exist in source, repos, images, or runtime packages — platform secret stores only.

## 11. Exit Criteria

Software becomes an Active Constitutional Artifact only when: compilation succeeds, all tests + replay pass, performance is within policy, security passes, docs are synchronized, artifacts are signed, the Build Receipt exists, and release is approved.

(See **CL-002** for the standalone one-page release checklist.)
