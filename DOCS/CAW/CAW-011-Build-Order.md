# CAW-011 — Build Order (Living Roadmap)

**Version 2.0 · Status: ACTIVE — this is the project dashboard. Update Status inline as work progresses. Supersedes v1.0 (added Depends On / Size / AMS / Status columns per ratified governance; no separate ZIR).**

## How to Read This Document

Hierarchy: `Milestone → Implementation Task (IT-xxxx) → AI Mandate (AMS, same number as its IT) → Code`. No Subtasks, no Work Packages, no ZIR — this table _is_ the roadmap. An AI agent is assigned exactly one `IT-xxxx` at a time (CEngS-003 §3).

**Size** (CEngS-003 §3 scale): XS <2h · S half day · M 1–2 days · L 3–5 days · XL — never assign as-is, split first.
**Status:** ☐ Planned · ◐ In Progress · ☑ Complete · ⛔ Blocked · ⚠ Needs Review

## M01 — Repository Foundation

_(No dependencies — first milestone)_
_Note: AMS-0101's mandate text included pnpm-workspace.yaml creation, overlapping IT-0102's scope. Both are marked complete as of AMS-0101's delivery — this is a documentation correction, not double-counted work. Future AMS mandates should stay strictly within their `IT-xxxx`'s stated scope to avoid this._

| ID      | Title                             | Depends On | Size | AMS      | Status                                                                    |
| ------- | --------------------------------- | ---------- | ---- | -------- | ------------------------------------------------------------------------- |
| IT-0101 | Initialize monorepo               | —          | S    | AMS-0101 | ☑                                                                         |
| IT-0102 | Configure pnpm workspaces         | IT-0101    | XS   | AMS-0102 | ☑ _(delivered inside AMS-0101 — mandate scoping overlap; see note below)_ |
| IT-0103 | TypeScript project references     | IT-0102    | S    | AMS-0103 | ☑                                                                         |
| IT-0104 | ESLint config                     | IT-0102    | XS   | AMS-0104 | ☑                                                                         |
| IT-0105 | Prettier config                   | IT-0102    | XS   | AMS-0105 | ☑                                                                         |
| IT-0106 | Vitest config                     | IT-0103    | S    | AMS-0106 | ☑                                                                         |
| IT-0107 | GitHub Actions CI skeleton        | IT-0106    | S    | AMS-0107 | ☐                                                                         |
| IT-0108 | Runtime purity CI check (CAW-004) | IT-0107    | S    | AMS-0108 | ☐                                                                         |

## M02 — Constitutional Package Structure

_(Depends on M01)_

| ID      | Title                                         | Depends On   | Size | AMS      | Status                                                                                                   |
| ------- | --------------------------------------------- | ------------ | ---- | -------- | -------------------------------------------------------------------------------------------------------- |
| IT-0201 | Create `packages/runtime`                     | IT-0108      | XS   | AMS-0201 | ☑ _(Note: package manifest originated as the M01 purity-validator boundary and was extended during M02)_ |
| IT-0202 | Create `packages/domain`                      | IT-0108      | XS   | AMS-0202 | ☐                                                                                                        |
| IT-0203 | Create `packages/contracts`                   | IT-0108      | XS   | AMS-0203 | ☐                                                                                                        |
| IT-0204 | Create `packages/shared`                      | IT-0108      | XS   | AMS-0204 | ☐                                                                                                        |
| IT-0205 | Create `packages/testing`                     | IT-0108      | XS   | AMS-0205 | ☐                                                                                                        |
| IT-0206 | Create `apps/api`                             | IT-0108      | XS   | AMS-0206 | ☐                                                                                                        |
| IT-0207 | Create `apps/web`                             | IT-0108      | XS   | AMS-0207 | ☐                                                                                                        |
| IT-0208 | Enforce dependency boundaries (CAW-004 table) | IT-0201–0207 | S    | AMS-0208 | ☐                                                                                                        |

## M03 — Domain Foundation

_(Depends on M02; may run parallel with M04 registry work once contracts stabilize)_

| ID      | Title                | Depends On   | Size | AMS      | Status |
| ------- | -------------------- | ------------ | ---- | -------- | ------ |
| IT-0301 | Identity model       | IT-0202      | S    | AMS-0301 | ☐      |
| IT-0302 | GS1 identifier model | IT-0202      | S    | AMS-0302 | ☐      |
| IT-0303 | Evidence model       | IT-0202      | S    | AMS-0303 | ☐      |
| IT-0304 | Authority model      | IT-0202      | S    | AMS-0304 | ☐      |
| IT-0305 | Capability model     | IT-0202      | S    | AMS-0305 | ☐      |
| IT-0306 | Standing model       | IT-0202      | S    | AMS-0306 | ☐      |
| IT-0307 | Policy model         | IT-0202      | S    | AMS-0307 | ☐      |
| IT-0308 | ExecutionRequest     | IT-0301–0307 | S    | AMS-0308 | ☐      |
| IT-0309 | ExecutionContext     | IT-0301–0307 | S    | AMS-0309 | ☐      |
| IT-0310 | ExecutionReceipt     | IT-0301–0307 | S    | AMS-0310 | ☐      |
| IT-0311 | Outcome model        | IT-0301–0307 | S    | AMS-0311 | ☐      |

## M04 — Runtime Skeleton

_(Depends on M03)_

| ID      | Title                           | Depends On       | Size | AMS      | Status |
| ------- | ------------------------------- | ---------------- | ---- | -------- | ------ |
| IT-0401 | Runtime package bootstrap       | IT-0201, M03     | S    | AMS-0401 | ☐      |
| IT-0402 | Runtime pipeline scaffold       | IT-0401          | M    | AMS-0402 | ☐      |
| IT-0403 | ExecutionContext handling       | IT-0402, IT-0309 | S    | AMS-0403 | ☐      |
| IT-0404 | Policy evaluator (stub)         | IT-0402, IT-0307 | S    | AMS-0404 | ☐      |
| IT-0405 | Receipt generator               | IT-0402, IT-0310 | S    | AMS-0405 | ☐      |
| IT-0406 | Replay framework                | IT-0405          | M    | AMS-0406 | ☐      |
| IT-0407 | Entropy detector (CI lint rule) | IT-0402          | S    | AMS-0407 | ☐      |

## M05 — Registry Layer

_(Depends on M03; may run parallel with M04 and M06)_

| ID      | Title                       | Depends On | Size | AMS      | Status |
| ------- | --------------------------- | ---------- | ---- | -------- | ------ |
| IT-0501 | PostgreSQL schema (CAW-008) | M03        | M    | AMS-0501 | ☐      |
| IT-0502 | Repository interfaces       | IT-0501    | S    | AMS-0502 | ☐      |
| IT-0503 | Registry adapter            | IT-0502    | M    | AMS-0503 | ☐      |
| IT-0504 | Seed data                   | IT-0501    | S    | AMS-0504 | ☐      |
| IT-0505 | Migration framework         | IT-0501    | S    | AMS-0505 | ☐      |

## M06 — GS1 Digital Link Resolution

_(Depends on M03, M05; may run parallel with M04, M07-prep)_

| ID      | Title                   | Depends On       | Size | AMS      | Status |
| ------- | ----------------------- | ---------------- | ---- | -------- | ------ |
| IT-0601 | GS1 parser              | IT-0302          | M    | AMS-0601 | ☐      |
| IT-0602 | GS1 validator           | IT-0601          | S    | AMS-0602 | ☐      |
| IT-0603 | Digital Link normalizer | IT-0601          | S    | AMS-0603 | ☐      |
| IT-0604 | Identity resolver       | IT-0603, IT-0503 | M    | AMS-0604 | ☐      |
| IT-0605 | Parser benchmarks       | IT-0604          | S    | AMS-0605 | ☐      |
| IT-0606 | Replay validation       | IT-0604, IT-0406 | S    | AMS-0606 | ☐      |

## M07 — Evidence Engine

_(Depends on M03, M05; may run parallel with M06)_

| ID      | Title                                                   | Depends On       | Size | AMS      | Status |
| ------- | ------------------------------------------------------- | ---------------- | ---- | -------- | ------ |
| IT-0701 | Evidence Bundle model                                   | IT-0303          | S    | AMS-0701 | ☐      |
| IT-0702 | Evidence reference resolver                             | IT-0701, IT-0503 | S    | AMS-0702 | ☐      |
| IT-0703 | Hash verification                                       | IT-0701          | S    | AMS-0703 | ☐      |
| IT-0704 | R2 client integration (Application layer only, CAW-009) | IT-0702          | M    | AMS-0704 | ☐      |
| IT-0705 | Evidence retrieval tests                                | IT-0704          | S    | AMS-0705 | ☐      |

## M08 — Runtime Verification Pipeline

_(Depends on M04, M06, M07)_

| ID      | Title                               | Depends On       | Size | AMS      | Status |
| ------- | ----------------------------------- | ---------------- | ---- | -------- | ------ |
| IT-0801 | Wire ACV loading into pipeline      | IT-0402, IT-0503 | M    | AMS-0801 | ☐      |
| IT-0802 | Wire Evidence loading into pipeline | IT-0801, IT-0704 | M    | AMS-0802 | ☐      |
| IT-0803 | Generate Execution Receipt (full)   | IT-0802, IT-0405 | M    | AMS-0803 | ☐      |
| IT-0804 | Policy evaluation integration       | IT-0803, IT-0404 | M    | AMS-0804 | ☐      |
| IT-0805 | Pipeline replay tests               | IT-0804          | S    | AMS-0805 | ☐      |

## M09 — API Layer

_(Depends on M08)_

| ID      | Title                                               | Depends On   | Size | AMS      | Status |
| ------- | --------------------------------------------------- | ------------ | ---- | -------- | ------ |
| IT-0901 | REST endpoint scaffold (`GET /v1/resolve`, CAW-006) | IT-0805      | S    | AMS-0901 | ☐      |
| IT-0902 | Request validation                                  | IT-0901      | S    | AMS-0902 | ☐      |
| IT-0903 | OpenAPI spec generation                             | IT-0901      | S    | AMS-0903 | ☐      |
| IT-0904 | Error handling (CAW-006 table)                      | IT-0901      | S    | AMS-0904 | ☐      |
| IT-0905 | Contract tests                                      | IT-0902–0904 | S    | AMS-0905 | ☐      |

## M10 — Edge Gateway

_(Depends on M09; may run parallel with M11 prep)_

| ID      | Title                           | Depends On   | Size | AMS      | Status |
| ------- | ------------------------------- | ------------ | ---- | -------- | ------ |
| IT-1001 | Worker scaffold                 | IT-0905      | S    | AMS-1001 | ☐      |
| IT-1002 | Request routing to API          | IT-1001      | S    | AMS-1002 | ☐      |
| IT-1003 | Request validation (edge-level) | IT-1001      | XS   | AMS-1003 | ☐      |
| IT-1004 | Cache policy                    | IT-1002      | S    | AMS-1004 | ☐      |
| IT-1005 | Failure-mode handling           | IT-1002      | S    | AMS-1005 | ☐      |
| IT-1006 | Edge tests                      | IT-1001–1005 | S    | AMS-1006 | ☐      |

## M11 — Verified Product Experience

_(Depends on M10)_

| ID      | Title                               | Depends On | Size | AMS      | Status |
| ------- | ----------------------------------- | ---------- | ---- | -------- | ------ |
| IT-1101 | Verified Product page (`apps/web`)  | IT-1006    | M    | AMS-1101 | ☐      |
| IT-1102 | Wire full flow scan → response      | IT-1101    | M    | AMS-1102 | ☐      |
| IT-1103 | Receipt reference display           | IT-1102    | S    | AMS-1103 | ☐      |
| IT-1104 | End-to-end manual test, real GS1 QR | IT-1103    | S    | AMS-1104 | ☐      |

## M12 — Deterministic Replay

_(Depends on M08; runs alongside M09–M11)_

| ID      | Title                                   | Depends On       | Size | AMS      | Status |
| ------- | --------------------------------------- | ---------------- | ---- | -------- | ------ |
| IT-1201 | Replay framework hardening              | IT-0805          | M    | AMS-1201 | ☐      |
| IT-1202 | Hash comparison harness                 | IT-1201          | S    | AMS-1202 | ☐      |
| IT-1203 | Receipt comparison harness              | IT-1201          | S    | AMS-1203 | ☐      |
| IT-1204 | CI integration — 10,000-run replay gate | IT-1202, IT-1203 | M    | AMS-1204 | ☐      |

## M13 — Performance Baseline

_(Depends on M11)_

| ID      | Title                        | Depends On | Size | AMS      | Status |
| ------- | ---------------------------- | ---------- | ---- | -------- | ------ |
| IT-1301 | Benchmark suite (CEngS-103)  | IT-1104    | M    | AMS-1301 | ☐      |
| IT-1302 | Latency/memory/CPU baselines | IT-1301    | S    | AMS-1302 | ☐      |
| IT-1303 | Commit baseline to repo      | IT-1302    | XS   | AMS-1303 | ☐      |

## M14 — Constitutional Compliance Review

_(Depends on M11, M12, M13)_

| ID      | Title                             | Depends On       | Size | AMS      | Status |
| ------- | --------------------------------- | ---------------- | ---- | -------- | ------ |
| IT-1401 | CEngS-001/002/003 compliance pass | M11, M12, M13    | S    | AMS-1401 | ☐      |
| IT-1402 | CEngS-101/102 compliance pass     | IT-1401          | S    | AMS-1402 | ☐      |
| IT-1403 | CEngS-103/104/105 compliance pass | IT-1401          | S    | AMS-1403 | ☐      |
| IT-1404 | Remediate findings                | IT-1402, IT-1403 | M    | AMS-1404 | ☐      |

## M15 — Wedge Completion

_(Depends on M14)_

| ID      | Title                                          | Depends On | Size | AMS      | Status |
| ------- | ---------------------------------------------- | ---------- | ---- | -------- | ------ |
| IT-1501 | Final end-to-end demonstration (real QR, live) | IT-1404    | S    | AMS-1501 | ☐      |
| IT-1502 | Documentation freeze                           | IT-1501    | S    | AMS-1502 | ☐      |
| IT-1503 | Exit criteria sign-off (CAW-001 §8)            | IT-1502    | XS   | AMS-1503 | ☐      |

## Parallel Execution Map

```
M01 → M02 → M03 ─┬─→ M04 ─┐
                  ├─→ M05 ─┼─→ M08 → M09 → M10 → M11 ─┬─→ M13 ─┐
                  └─→ M06 ─┘         M07 ──────────────┘        ├─→ M14 → M15
                                                          M12 ───┘
```

M03's downstream (M04, M05, M06) may run in parallel once M03 is complete. M07 may run parallel with M06 (both depend only on M03/M05). M12 runs alongside M09–M11, not after them.

## Rules

Every milestone produces working, deployable software; passes applicable CEngS standards; includes tests and updated docs; preserves determinism. No milestone leaves the repository broken. A milestone completes only when every `IT-xxxx` beneath it is ☑ Complete.
