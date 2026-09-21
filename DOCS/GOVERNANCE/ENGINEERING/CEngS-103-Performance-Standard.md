# CEngS-103 — Performance & Benchmark Standard

**Version 2.0 · Status: RATIFIED · Authority: Operational Standard · Depends On: CEngS-001, CEngS-101, CEngS-102**
**Supersedes: CEngS-009**

## 1. Purpose

Performance is measured, never assumed, and never traded against correctness. Fast-but-incorrect software is constitutionally invalid, full stop. Optimize from evidence, never from intuition.

## 2. What Gets Measured

Latency · Throughput · CPU · Memory/allocations · Storage · Network · Database · Startup time · Build time — across four benchmark scopes: **Micro** (functions, hashing, serialization, policy eval) → **Component** (Runtime, Registry, Identity Resolution, Evidence Verification, Receipt Generation) → **Integration** (API, DB, Worker, Cache, Storage) → **End-to-end** (full constitutional workflows, e.g. GS1 Digital Link → Resolution → Verification → Receipt → Response).

## 3. Baselines & Regression

Every critical component establishes a versioned baseline before optimization; every later measurement compares against it. Regressions are classified Minor / Moderate / Critical; Critical regressions require review before release, no exceptions.

## 4. Optimization Rules

Optimization always preserves: replay determinism, execution receipts, canonical serialization, security guarantees, constitutional behavior. Any behavioral change coming out of an optimization requires constitutional review, same as any other behavioral change would.

Profile before you optimize. AI-generated implementations in particular should avoid unnecessary allocation, unnecessary abstraction, and premature optimization — and should demonstrate measured performance, not claimed performance.

## 5. Migration Triggers (Go / language extraction)

Language migration is evidence-driven only — never a preference. A package becomes a migration candidate when **any** of these is measured and sustained, not merely suspected:

- Sustained p99 latency exceeding the approved budget for that component
- Replay instability under concurrent load (hash mismatches on repeated identical runs)
- GC overhead measurably eating into the execution budget
- A measured CPU bottleneck under realistic load
- A measured concurrency ceiling blocking a real requirement

Set the specific number for each trigger explicitly in the component's baseline doc before you need it — a vague trigger ("if it gets slow") is not a trigger, it's a postponement.

## 6. Performance Budgets & Capacity

Critical components define measurable budgets (max execution duration, memory, response latency, startup time, artifact size) — these are operational policy, reviewed periodically, not constitutional law. Capacity planning (concurrent users/executions, DB/evidence/storage growth, bandwidth) is evidence-based, not guessed.

## 7. Evidence & Cadence

Every benchmark run produces a **Benchmark Receipt** (ID, version, commit, environment, hardware, runtime version, dataset, metrics, baseline comparison, timestamp). Benchmarks run before every release, on major PRs, and after infrastructure or dependency changes. Historical trends are retained.

## 8. Definition of Constitutional Performance

A system demonstrates it when: performance is measurable and benchmarks repeatable, optimization preserves correctness, regressions are monitored, capacity is understood, and decisions are evidence-based. Any implementation released without benchmark evidence, regression monitoring, or performance validation is non-compliant for production.
