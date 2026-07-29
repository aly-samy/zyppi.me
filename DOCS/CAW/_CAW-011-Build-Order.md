# CAW-011 — Build Order

**Version 1.0 · Status: ACTIVE (living backlog — update status inline as work completes)**

## Purpose

The literal, ordered task backlog for the wedge. Task IDs use `IT-MMNN` (Milestone-Task). Complexity scale: **XS** <2h · **S** half day · **M** 1–2 days · **L** 3–5 days · **XL** — never assigned as-is; split first (CEngS-003 §3).

An AI agent is assigned one `IT-xxxx` at a time, never a whole milestone. See CAW-012 for how each task becomes a mandate.

## M01 — Repository Foundation

`IT-0101` Initialize monorepo · `IT-0102` Configure pnpm workspaces · `IT-0103` TypeScript project references · `IT-0104` ESLint · `IT-0105` Prettier · `IT-0106` Vitest · `IT-0107` GitHub Actions CI skeleton · `IT-0108` CEngS validation scripts

## M02 — Constitutional Package Structure

`IT-0201` Create `packages/runtime` · `IT-0202` Create `packages/domain` · `IT-0203` Create `packages/contracts` · `IT-0204` Create `packages/shared` · `IT-0205` Create `packages/testing` · `IT-0206` Create `apps/api` · `IT-0207` Create `apps/web` · `IT-0208` Enforce dependency boundaries (CAW-004)

## M03 — Domain Foundation

`IT-0301` Identity model · `IT-0302` GS1 identifier model · `IT-0303` Evidence model · `IT-0304` Authority model · `IT-0305` Capability model · `IT-0306` Standing model · `IT-0307` Policy model · `IT-0308` ExecutionRequest · `IT-0309` ExecutionContext · `IT-0310` ExecutionReceipt · `IT-0311` Outcome model
_(All CAW-003 entities. Requires: M02.)_

## M04 — Runtime Skeleton

`IT-0401` Runtime package bootstrap · `IT-0402` Runtime pipeline · `IT-0403` ExecutionContext handling · `IT-0404` Policy evaluator (stub) · `IT-0405` Receipt generator · `IT-0406` Replay framework · `IT-0407` Entropy detector (CI lint rule blocking `Date.now`/`Math.random` in `packages/runtime`)
_(Requires: M03.)_

## M05 — Registry Layer

`IT-0501` PostgreSQL schema (CAW-008) · `IT-0502` Repository interfaces · `IT-0503` Registry adapter · `IT-0504` Seed data · `IT-0505` Migration framework
_(Requires: M03. Can run parallel with M04.)_

## M06 — GS1 Digital Link Resolution

`IT-0601` GS1 parser · `IT-0602` GS1 validator · `IT-0603` Digital Link normalizer · `IT-0604` Identity resolver · `IT-0605` Parser benchmarks · `IT-0606` Replay validation
_(Requires: M03, M05.)_

## M07 — Evidence Engine

`IT-0701` Evidence Bundle model · `IT-0702` Evidence reference resolver · `IT-0703` Hash verification · `IT-0704` R2 client integration (Application layer only — CAW-009) · `IT-0705` Evidence retrieval tests
_(Requires: M03, M05. Can run parallel with M06.)_

## M08 — Runtime Verification Pipeline

`IT-0801` Wire ACV loading into pipeline · `IT-0802` Wire Evidence loading into pipeline · `IT-0803` Generate Execution Receipt (full, per CAW-007) · `IT-0804` Policy evaluation integration · `IT-0805` Pipeline replay tests
_(Requires: M04, M06, M07.)_

## M09 — API Layer

`IT-0901` REST endpoint scaffold (`GET /v1/resolve`, CAW-006) · `IT-0902` Request validation · `IT-0903` OpenAPI spec generation · `IT-0904` Error handling per CAW-006 table · `IT-0905` Contract tests
_(Requires: M08.)_

## M10 — Edge Gateway

`IT-1001` Worker scaffold · `IT-1002` Request routing to API · `IT-1003` Request validation (edge-level) · `IT-1004` Cache policy · `IT-1005` Failure-mode handling · `IT-1006` Edge tests
_(Requires: M09.)_

## M11 — Verified Product Experience

`IT-1101` Verified Product page (`apps/web`) · `IT-1102` Wire full flow scan → response · `IT-1103` Receipt reference display · `IT-1104` End-to-end manual test with a real GS1 QR
_(Requires: M10.)_

## M12 — Deterministic Replay

`IT-1201` Replay framework hardening · `IT-1202` Hash comparison harness · `IT-1203` Receipt comparison harness · `IT-1204` CI integration — 10,000-run replay gate
_(Requires: M08. Runs alongside M09–M11.)_

## M13 — Performance Baseline

`IT-1301` Benchmark suite (CEngS-103) · `IT-1302` Latency/memory/CPU baselines · `IT-1303` Commit baseline to repo
_(Requires: M11.)_

## M14 — Constitutional Compliance Review

`IT-1401` CEngS-001/002/003 compliance pass · `IT-1402` CEngS-101/102 compliance pass · `IT-1403` CEngS-103/104/105 compliance pass · `IT-1404` Remediate findings
_(Requires: M11, M12, M13.)_

## M15 — Wedge Completion

`IT-1501` Final end-to-end demonstration (real QR, live) · `IT-1502` Documentation freeze · `IT-1503` Exit criteria sign-off (CAW-001 §8)
_(Requires: M14.)_

## Status Tracking

Each `IT-xxxx` moves through: `PLANNED → READY → ASSIGNED → IN_PROGRESS → REVIEW → VALIDATED → COMPLETED → LOCKED` (CEngS-003 §3). Only `COMPLETED` tasks count toward milestone completion. Track current status in the project tool of record, not in this document — this document is the plan, not the live board.
