# CAW-005 — Milestone Roadmap
**Version 1.0 · Status: ACTIVE**

## Hierarchy
This document uses CEngS-003's task hierarchy exactly (Phase → Milestone → Task → Work Item) rather than inventing a parallel one — one hierarchy, one home, per CEngS-000's single-authority principle. The Commerce Atlas Wedge is **Phase 2**. Its Milestones are M01–M15 below. Task and Work Item breakdown lives in CAW-011 (Build Order) and CAW-012 (AI Mandates).

## Milestone Dependency Chain
```
M01 Repository Foundation
  ↓
M02 Constitutional Package Structure
  ↓
M03 Domain Foundation
  ↓
M04 Runtime Skeleton
  ↓
M05 Registry Layer
  ↓
M06 GS1 Digital Link Resolution
  ↓
M07 Evidence Engine
  ↓
M08 Runtime Verification Pipeline   (requires M04, M06, M07)
  ↓
M09 API Layer
  ↓
M10 Edge Gateway
  ↓
M11 Verified Product Experience     (integrates M06–M10 end to end)
  ↓
M12 Deterministic Replay
  ↓
M13 Performance Baseline
  ↓
M14 Constitutional Compliance Review
  ↓
M15 Commerce Atlas Wedge Completion
```

Milestones are mostly sequential; a few (e.g., M07 Evidence Engine and parts of M05 Registry) may run in parallel once M04's domain contracts are stable — see CAW-011 for exact task-level parallelism rules (CEngS-003 §3, parallel execution conditions).

## Milestone Summary

| # | Milestone | Objective | Key Acceptance Signal |
|---|---|---|---|
| M01 | Repository Foundation | Monorepo, CI skeleton, tooling | Repo builds, CI runs, zero lint/type errors |
| M02 | Constitutional Package Structure | Permanent package architecture | Boundaries enforced, forbidden imports rejected |
| M03 | Domain Foundation | Core domain entities (CAW-003) | Pure objects, zero infra deps, serialization tests pass |
| M04 | Runtime Skeleton | `packages/runtime` scaffold | Compiles, purity tests pass, boundary tests pass |
| M05 | Registry Layer | Postgres schema + repository interfaces (CAW-008) | Schema deployed, ACV retrieval works |
| M06 | GS1 Digital Link Resolution | Parse/normalize/resolve a real GS1 link | Real GS1 URL parsed, GTIN extracted, identity resolved |
| M07 | Evidence Engine | Evidence retrieval + hash verification (CAW-009) | Evidence retrieved, hash verified, immutable references generated |
| M08 | Runtime Verification Pipeline | Full Runtime execution: ACV → Evidence → Policy → Outcome → Receipt | Deterministic execution, replay passes, receipt generated |
| M09 | API Layer | HTTP surface over the Runtime (CAW-006) | Runtime callable, API documented, contract tests pass |
| M10 | Edge Gateway | Cloudflare Worker (CAW-010) | Worker deployed, routing operational, edge tests pass |
| M11 | Verified Product Experience | First full user-facing flow | Real QR scan succeeds, response displayed, receipt accessible |
| M12 | Deterministic Replay | Prove determinism at scale | 10,000 identical executions → identical outputs/receipts/hashes |
| M13 | Performance Baseline | Establish measured baselines (CEngS-103) | Benchmarks automated, baseline committed |
| M14 | Constitutional Compliance Review | Full CEngS compliance pass | CEngS-001 through CEngS-105 compliant |
| M15 | Wedge Completion | Full end-to-end demonstration | See CAW-001 §8 Definition of Done |

## Milestone Rules
Every milestone produces working, deployable software; passes all applicable CEngS standards; includes tests and updated docs; preserves deterministic behavior. No milestone may leave the repository broken. A milestone is complete only when every Task beneath it is complete (CEngS-003 §3).
