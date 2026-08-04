````
# CAW-000 — Navigation Index

**Version 1.0 · Status: ACTIVE · Commerce Atlas Wedge (Phase 2) Execution Series**

## Purpose

This is the entry point for the CAW series. It tells you what exists, in what order to read it, and what to load for the task in front of you. Load this first, always.

## What CAW Is

CAW is an execution specification, not a constitutional corpus. The Constitution (ZRM/POL/SEC/RI/WS) answers **what is true**. CEngS answers **how to engineer**. CAW answers **what to build next, in what order, to what contract**. Every CAW document is 2–5 pages, single-responsibility, and directly actionable — free of philosophy unless a decision genuinely requires it.

## Document Map

| Doc      | Title                         | Answers                                                                    |
| -------- | ----------------------------- | -------------------------------------------------------------------------- |
| CAW-001  | Wedge Vision                  | Why are we building this, and what does "done" mean?                       |
| CAW-002  | System Architecture           | What does the request path look like end to end?                           |
| CAW-003  | Domain Model                  | What are the entities in this slice?                                       |
| CAW-004  | Repository Map                | Where does code live?                                                      |
| CAW-005  | Milestone Roadmap             | What are the milestones and their dependencies?                            |
| CAW-006  | API Contracts                 | What are the HTTP endpoints, requests, responses?                          |
| CAW-007  | Runtime Contracts             | What does `@zyppi/runtime` take in and return?                             |
| CAW-008  | Registry Schema               | What are the database tables?                                              |
| CAW-009  | Evidence Model                | How is evidence stored, hashed, retained?                                  |
| CAW-010  | Edge Layer                    | What does the Cloudflare Worker do?                                        |
| CAW-011  | Build Order                   | What's the literal task backlog, in order?                                 |
| CAW-012  | AI Mandates                   | What does an AI agent read and do for a given task?                        |
| CAW-013  | Validation Suite              | How do we know the wedge actually works (beyond unit tests)?               |
| CAW-014  | Release Plan                  | How does this go from local to production?                                 |
| OPEN-001 | Open Constitutional Questions | What's deferred, and what triggers revisiting it?                          |
| AMS-xxxx | AI Mandates (one per IT-xxxx) | The actual execution instructions for one task — see CAW-011 for the index |

## Implementation Hierarchy (ratified)

```
Constitution → CEngS → CAW → Milestone (Mxx) → Implementation Task (IT-xxxx) → AI Mandate (AMS) → Code
```

No Subtasks, no Work Packages, no separate roadmap series (ZIR). CAW-011 _is_ the roadmap. AMS-xxxx is the CEngS-003 §6 mandate template filled in for one `IT-xxxx` — it is not a new planning layer.

## Current Status

Phase 2 (Commerce Atlas Wedge) — Milestone M01, IT-0101 in progress (AMS-0101). Update this line as milestones complete; do not let it drift from CAW-011's tracker — CAW-011 is the source of truth for status, this line is just a pointer to it.

## Document Governance

Before creating any new document, ask: does this define a permanent engineering rule (→ CEngS), what the product must implement (→ CAW), only what's needed to execute one milestone (→ extend the relevant CAW doc or write one AMS), or a deferred future concern (→ OPEN-001)? If none of these fit, don't create the document — say so and ask.

## Loading Patterns

- **Implementing a feature:** CAW-000 → CAW-005 → CAW-012 → CEngS-000 (for the applicable CEngS docs)
- **Building an API:** CAW-000 → CAW-006 → CAW-007
- **Database work:** CAW-000 → CAW-008
- **Edge routing work:** CAW-000 → CAW-010
- **Planning the next block of work:** CAW-000 → CAW-011
- **Validating the wedge is actually done:** CAW-000 → CAW-013

## Relationship to CEngS

CAW never restates a CEngS rule. Where a CAW document needs an engineering rule (runtime purity, replay, review gates, testing pyramid), it cites the CEngS document instead of repeating it. If you find a rule duplicated between a CAW document and a CEngS document, that's a defect — report it, don't resolve it by picking one silently.
````

---

# CAW-001 — Wedge Vision

**Version 1.0 · Status: ACTIVE · Authority: North Star, Founding Principles, PRD, Tech Architecture Bible**

## 1. Objective

Prove — with one real, complete transaction — that the Zyppi constitutional stack works end to end. This is not "build Commerce Atlas." It is: **can one real GS1 Digital Link flow through Identity → Evidence → Policy → Runtime → Receipt → Response, successfully and deterministically?**

If yes, everything downstream (SDK, ecosystem, additional wedges) becomes credible. If no, we've learned that cheaply, before scaling the architecture further.

## 2. What Success Validates

Runtime architecture · Identity model · Evidence model · Policy execution · Trust evaluation · Execution receipts · Developer workflow · AI-assisted engineering workflow.

## 3. Success Criteria

A real GS1 QR code is scanned → the Digital Link resolves → the Cloudflare Worker and API receive the request → the Runtime evaluates it → evidence is verified → an Execution Receipt is generated → a deterministic, verified response is returned. The full flow completes successfully, and replaying identical input produces an identical receipt.

## 4. Primary User Story

As a consumer, I scan a GS1 Digital Link QR code and immediately receive a verified product response I can trust because it was constitutionally verified — not because a brand asserted it.

## 5. Primary Use Case

**UC-001 — Verify Product Identity.** Input: a GS1 Digital Link. Output: a Verified Product Response (product, brand, manufacturer, verification status, trust status, evidence links, receipt reference).

## 6. Out of Scope

Payments · authentication platform · multi-tenancy · ERP integrations · marketplace · inventory · analytics · notifications · AI automation · federation · SDK publication · mobile apps. Build only what one successful end-to-end verification flow requires — nothing that anticipates Phase 3+.

## 7. Non-Functional Targets

Response time < 300ms (target, not a hard gate) · Determinism 100% · Replay 100% · Auditability and Observability mandatory · Availability: development target only (not production SLA).

## 8. Definition of Done

The wedge is complete only when:

- One real GS1 Digital Link resolves successfully, end to end
- The Runtime is 100% deterministic and 100% replayable
- An Execution Receipt is generated for every execution
- CI passes, including the Constitutional Conformance Suite (CEngS-101)
- Documentation is current

Only then does Phase 2 close and Phase 3 planning begin. See CAW-013 for how each of these is actually validated, and CAW-014 for what happens after.

---

# CAW-002 — System Architecture

**Version 2.0 · Status: ACTIVE · Supersedes v1.0 (added Provisioning Flow, made Resolution carrier-agnostic)**

## Two Lifecycles, Not One

Zyppi has two distinct flows that must never be conflated: **Provisioning** (how a product becomes Zyppi-enabled, before any consumer interaction) and **Resolution** (what happens when someone interacts with an already-provisioned product). They have different owners, different triggers, and — critically — Resolution must stay identical regardless of which carrier (QR, NFC, RFID, BLE, vision, future) Provisioning chose. Mixing them would couple runtime behavior to carrier technology, which is exactly what CEngS-001 §5 (independence guarantees) exists to prevent.

## Flow 1 — Provisioning (Authoring)

_Documented here for architectural completeness. Not built by this wedge — CAW-008's seed data stands in for it. Build it only when a milestone explicitly requires it (see CAW-005/CAW-011)._

```
Create Digital Identity
      ↓
Generate GS1 Digital Link
      ↓
Validate Link
      ↓
Register Constitutional Metadata (ACV entries — CAW-003, CAW-008)
      ↓
Generate Carrier (QR / NFC / other)
      ↓
Print QR or Encode NFC
      ↓
Attach to Physical Product
      ↓
Ready for Consumer Interaction
```

Answers: **how does a product become Zyppi-enabled?**

## Flow 2 — Resolution (this wedge's actual scope)

```
Carrier Capture (scan QR / tap NFC / future: RFID, BLE, vision)
      ↓
Cloudflare Worker receives request        (CAW-010)
      ↓
Normalize Digital Link
      ↓
Resolve Identity
      ↓
Retrieve Active Constitutional View (ACV)  (CAW-007, CAW-008)
      ↓
Retrieve Evidence                          (CAW-009)
      ↓
Execute Runtime                            (CAW-007, CEngS-001 §4)
      ↓
Evaluate Policies
      ↓
Generate Execution Receipt                 (CAW-007)
      ↓
Return Verified Response                   (CAW-006)
```

Answers: **what happens when someone interacts with a Zyppi-enabled product?** The first step is deliberately named "Carrier Capture," not "Scan QR" — everything from that point on is carrier-agnostic by design. A future NFC tap, RFID read, or vision-based recognition enters at the same step and follows the identical remaining nine steps unchanged.

## Layer Responsibility (maps to CEngS-001 §3)

| Step                                    | Layer       | Owns                                                                                            |
| --------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| Carrier Capture, Worker receipt         | Gateway     | Routing, normalization, rate limiting — carrier-specific parsing lives here, nowhere downstream |
| Normalize, Resolve Identity             | Application | Request coordination, identity lookup orchestration                                             |
| ACV, Evidence, Runtime, Policy, Receipt | Runtime     | All constitutional truth-generation — carrier-blind                                             |
| —                                       | Persistence | Registry (Postgres), Evidence Store (R2) — storage only                                         |

## Non-Negotiable Boundary

Everything above the Runtime line may change per carrier or technology. The Runtime never knows or cares whether the request originated from a QR scan, an NFC tap, or a future carrier — it only ever sees a normalized `ExecutionRequest` (CAW-007). This is what makes adding a new carrier a Gateway-layer change, never a Runtime change.

---

# CAW-003 — Domain Model

**Version 1.0 · Status: ACTIVE · Package: `packages/domain`**

## Scope

Only the entities this wedge actually uses. No future entities, no speculative fields. If a milestone needs something not listed here, add it here first — don't invent it inline in another package.

## Entities

| Entity                                        | Represents                                                                     | Notes                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Identity**                                  | Persistent digital representation resolved from a Digital Link                 | Immutable once commissioned                                                        |
| **Referent (Product / Brand / Manufacturer)** | The real-world thing the Identity represents                                   | Product identifies Brand and Manufacturer as related referents                     |
| **Evidence**                                  | Immutable verification material (hashes, metadata) backing a claim             | See CAW-009 for storage                                                            |
| **Authority**                                 | Who/what is permitted to assert or approve a given fact                        | Minimal wedge scope — enough to satisfy policy checks, not a full authority engine |
| **Capability**                                | A bounded permission checked during policy evaluation                          | Minimal wedge scope                                                                |
| **Standing**                                  | Constitutional eligibility state of an actor                                   | Minimal wedge scope                                                                |
| **Policy**                                    | A rule evaluated by the Runtime against Identity/Evidence/Authority/Capability | Read-only for this wedge — no policy authoring UI                                  |
| **ExecutionRequest**                          | The explicit input to the Runtime                                              | See CAW-007                                                                        |
| **ExecutionContext**                          | Explicit execution parameters (budget, entropy, versions)                      | Never implicit — CEngS-001 §4                                                      |
| **ExecutionReceipt**                          | The immutable output artifact of a Runtime execution                           | See CAW-007 §Receipt                                                               |
| **Outcome**                                   | The decision/result produced by policy evaluation                              | Feeds into the Verified Response                                                   |

## Rules

- All entities in `packages/domain` are pure data + pure validation — zero infrastructure dependency (no DB client, no HTTP, no filesystem). This is enforced by CI per CEngS-002 §4.
- Every entity supports canonical serialization (RI-001) — this is tested, not assumed.
- Identity ≠ Referent. A Product Identity is not the physical product; it represents it. Don't collapse the distinction for convenience (see WS-03A.2/.3 if you need the full constitutional reasoning — not needed for this wedge's implementation).

## M03 Implementation Note — Cross-Entity Consistency

This wedge's foundational domain entities will likely be built across separate AI mandates. The real risk isn't ontological drift — this document already scopes each entity deliberately — it's naming inconsistency between entities that reference each other.

Two conventions are checked during review of each applicable M03 implementation task:

- Every entity's own identifier field is named `{entity}Id` (for example, `identityId`, `evidenceId`, `authorityId`) — never a bare `id`.
- A field referencing another entity uses that entity's exact identifier name (for example, Standing references `identityId`, not `subjectId` or `actorId`).

This is enforced at review time for each applicable M03 task, not by a separate pre-implementation audit.

The implementation-task mapping for **Referent** and the **GS1 identifier model** must remain consistent with CAW-011 and any ratified AMS scope clarification. This document defines the domain concepts; it does not silently resolve an ambiguity in task naming or expand a task's scope.

## Explicitly Rejected Scope Expansion

Full AI-agent delegation-chain modeling — distinct Agent/Sponsor/Organization identity layers, cascading revocation, and non-repudiable agent provenance — is real POL-001/SEC-001 territory but is **not** this wedge's job.

CAW-001 §6 already excludes an authentication platform, and this wedge excludes full Authority Anchor delegation chains (WS-03D). If a future milestone needs this capability, it requires a new CAW series or an explicit amendment to this one. It must not be introduced implicitly through the acceptance criteria of an M03 entity task.

---

# CAW-004 — Repository Map & Bootstrap

**Version 2.1 · Status: ACTIVE · Supersedes v1.0 (bootstrap details folded in per ratified decision: no CEngS-011 — one-time setup lives here, not in a permanent engineering standard)**

## Workspace Layout

```
apps/
  api/            Fastify HTTP API — orchestrates requests, calls @zyppi/runtime
  web/             Next.js — renders the Verified Product page

packages/
  runtime/         @zyppi/runtime — pure, zero-I/O constitutional execution (CEngS-001 §4)
  domain/          Pure entities + validation (CAW-003) — zero infra dependency
  contracts/       Shared TypeScript types for API requests/responses (CAW-006), OpenAPI source
  shared/          Cross-cutting pure utilities (canonical serialization, hashing helpers)
  testing/         Shared test fixtures, replay harness

edge/
  worker/          Cloudflare Worker — routing/normalization only (CAW-010)

infra/             Infrastructure as code, Postgres schema/migrations (CAW-008), seed data
scripts/           CI validation, benchmark runners, conformance checks
.github/workflows/ CI pipelines (CEngS-102)
```

## Ownership & Import Rules

**Version 2.1 note:** this table was incomplete in v2.0 — `packages/shared`, `packages/testing`, and `apps/web` were never formally specified, only described narratively. Completed here from what was already established elsewhere in the corpus (AMS-0103's review) before AMS-0208 (dependency-graph enforcement) can be built against it. This is the authoritative version — if AMS-0208 or any other document conflicts with this table, this table wins; report the conflict rather than resolving it in code.

| Package              | May import from (production)                                | May import from (dev-only)                                                                                   | Must never import                                                                             |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `packages/domain`    | nothing (leaf package)                                      | nothing                                                                                                      | any infra, any other package                                                                  |
| `packages/shared`    | nothing (leaf package)                                      | nothing                                                                                                      | any infra, any other package                                                                  |
| `packages/contracts` | `packages/domain`                                           | —                                                                                                            | `packages/runtime` internals                                                                  |
| `packages/runtime`   | `packages/domain`, `packages/shared`                        | —                                                                                                            | HTTP, DB, filesystem, cloud SDKs, `apps/*`, `edge/*` — CEngS-001 §4 / CEngS-002 §4            |
| `packages/testing`   | nothing in production (it's dev-only tooling itself)        | `packages/domain`, `packages/contracts`, `packages/runtime`, `packages/shared` — for building typed fixtures | production code in any package (testing is never a runtime dependency of anything)            |
| `apps/api`           | `packages/runtime`, `packages/domain`, `packages/contracts` | `packages/testing`                                                                                           | direct DB access bypassing a repository interface                                             |
| `apps/web`           | `packages/contracts`, `packages/domain`, `packages/shared`  | `packages/testing`                                                                                           | `packages/runtime` directly — Presentation must not skip the Application layer (CEngS-001 §3) |
| `edge/worker`        | `packages/contracts` (types only)                           | —                                                                                                            | `packages/runtime` directly                                                                   |

**Authorization is not obligation.** A permitted edge above may remain unused until an implementation actually requires it — this table defines the _ceiling_ of what's allowed, not a checklist of imports that must exist.

**Direct authorization is non-transitive.** `apps/api` may import `packages/domain` directly because the table says so — not because `packages/runtime` also imports `domain`. No package inherits import rights through another package's permissions.

**No cycles, ever**, regardless of whether the individual edges are each independently authorized.

Circular imports are prohibited and checked in CI.

## Bootstrap — One-Time Setup (IT-0101–IT-0108)

This is what "the repository comes into existence" means concretely. It runs once, at M01, not repeatedly — that's why it lives here as implementation content, not as a standing CEngS rule.

**Package manager:** pnpm workspaces. `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `edge/*`.

**Root `package.json` scripts:** `dev`, `build` (`pnpm -r build`), `test` (`pnpm -r test`), `test:replay`, `test:conformance`, `lint`, `format`, `bench`, `ci` (lint → build → test).

**TypeScript:** project references across all packages, strict mode on, TS 5.4+.

**Tooling:** ESLint + Prettier (repo-wide config), Vitest (unit/replay/CI configs per package).

**CI skeleton (`.github/workflows/`):** `ci.yml`, `replay.yml`, `conformance.yml`, `benchmarks.yml`, `release.yml` — scaffolded and green (even with zero tests) before any business logic is written.

**Runtime purity enforcement — mechanical, not conventional.** A CI script checks `packages/runtime/package.json` and blocks the build if it depends on: `http`, `express`, `fastify`, `pg`, `postgres`, `prisma`, `drizzle`, `typeorm`, `fs`, `path`, `os`, `net`, `tls`, `child_process`, `aws-sdk`, `@cloudflare/*`, `winston`, `pino`, `dotenv`, or any other I/O-bearing package. This exists from commit one — it is not added later once "there's something to protect."

## Repository Definition of Done (Bootstrap)

- `pnpm install`, `pnpm run build`, `pnpm run lint`, `pnpm run test` all succeed (zero tests passing is fine at this stage)
- `pnpm run ci` succeeds end to end
- Forbidden-import check passes for `packages/runtime`
- CI is green on `main`
- README documents the layout above

## Technology Stack

Frontend: Next.js · Edge: Cloudflare Workers · API: Fastify · Runtime: `@zyppi/runtime` (TypeScript) · Database: PostgreSQL · Evidence: Cloudflare R2 · Cache: Redis · Language: TypeScript throughout this wedge. Migration for any package follows CEngS-103 §5 (evidence-based triggers only) — not decided here.

---

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

| #   | Milestone                        | Objective                                                           | Key Acceptance Signal                                             |
| --- | -------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| M01 | Repository Foundation            | Monorepo, CI skeleton, tooling                                      | Repo builds, CI runs, zero lint/type errors                       |
| M02 | Constitutional Package Structure | Permanent package architecture                                      | Boundaries enforced, forbidden imports rejected                   |
| M03 | Domain Foundation                | Core domain entities (CAW-003)                                      | Pure objects, zero infra deps, serialization tests pass           |
| M04 | Runtime Skeleton                 | `packages/runtime` scaffold                                         | Compiles, purity tests pass, boundary tests pass                  |
| M05 | Registry Layer                   | Postgres schema + repository interfaces (CAW-008)                   | Schema deployed, ACV retrieval works                              |
| M06 | GS1 Digital Link Resolution      | Parse/normalize/resolve a real GS1 link                             | Real GS1 URL parsed, GTIN extracted, identity resolved            |
| M07 | Evidence Engine                  | Evidence retrieval + hash verification (CAW-009)                    | Evidence retrieved, hash verified, immutable references generated |
| M08 | Runtime Verification Pipeline    | Full Runtime execution: ACV → Evidence → Policy → Outcome → Receipt | Deterministic execution, replay passes, receipt generated         |
| M09 | API Layer                        | HTTP surface over the Runtime (CAW-006)                             | Runtime callable, API documented, contract tests pass             |
| M10 | Edge Gateway                     | Cloudflare Worker (CAW-010)                                         | Worker deployed, routing operational, edge tests pass             |
| M11 | Verified Product Experience      | First full user-facing flow                                         | Real QR scan succeeds, response displayed, receipt accessible     |
| M12 | Deterministic Replay             | Prove determinism at scale                                          | 10,000 identical executions → identical outputs/receipts/hashes   |
| M13 | Performance Baseline             | Establish measured baselines (CEngS-103)                            | Benchmarks automated, baseline committed                          |
| M14 | Constitutional Compliance Review | Full CEngS compliance pass                                          | CEngS-001 through CEngS-105 compliant                             |
| M15 | Wedge Completion                 | Full end-to-end demonstration                                       | See CAW-001 §8 Definition of Done                                 |

## Milestone Rules

Every milestone produces working, deployable software; passes all applicable CEngS standards; includes tests and updated docs; preserves deterministic behavior. No milestone may leave the repository broken. A milestone is complete only when every Task beneath it is complete (CEngS-003 §3).

---

# CAW-006 — API Contracts

**Version 1.0 · Status: ACTIVE · Package: `packages/contracts`, `apps/api`**

## Scope

Exactly one public endpoint for this wedge. No admin API, no write endpoints, no auth platform — see CAW-001 §6 Out of Scope.

## Endpoint

### `GET /v1/resolve`

Resolves a GS1 Digital Link to a Verified Product Response.

**Request**

```
GET /v1/resolve?link={url-encoded GS1 Digital Link}
Headers:
  X-Api-Key: <wedge dev key>   (minimal gate for this wedge only — not a security model)
```

**Response 200**

```json
{
  "product": { "gtin": "string", "name": "string" },
  "brand": { "id": "string", "name": "string" },
  "manufacturer": { "id": "string", "name": "string" },
  "verificationStatus": "verified | unverified | rejected",
  "trustStatus": "definite | probable | possible | uncertain | speculative",
  "evidenceLinks": ["string (evidence reference URIs)"],
  "receiptReference": "string (execution receipt ID)"
}
```

No internal implementation detail (Runtime internals, ACV structure, raw policy decisions) is ever exposed in this response — CAW-003/CAW-007 stay internal.

**Error Responses**

| Status | Code                   | Meaning                                                                    |
| ------ | ---------------------- | -------------------------------------------------------------------------- |
| 400    | `INVALID_DIGITAL_LINK` | Link failed parsing/normalization                                          |
| 404    | `IDENTITY_NOT_FOUND`   | Link parsed but resolves to no known Identity                              |
| 409    | `VERIFICATION_FAILED`  | Evidence or policy evaluation failed                                       |
| 422    | `EVIDENCE_UNAVAILABLE` | Required evidence could not be retrieved                                   |
| 500    | `RUNTIME_ERROR`        | Unexpected Runtime failure — always includes Execution ID for traceability |

Every error body follows CEngS-001 §7 (Error Code, Reason, Execution Stage, Constitutional Reference, Recovery Guidance) — not redefined here.

## Versioning

Path-versioned (`/v1/...`). A breaking change to the response shape requires `/v2/...`, not a silent change to `/v1/...` — see CEngS-102 §9 (semantic versioning).

## Authentication

Minimal API-key gate for this wedge only. This is explicitly **not** SEC-001's full trust model — full authentication/authorization is out of scope per CAW-001 §6 and deferred to a later phase.

## Contract Testing

Every field above is covered by a contract test in `packages/testing`, run in CI per CEngS-102 §7. The OpenAPI spec generated from `packages/contracts` is the source of truth for this document — if they diverge, the spec wins and this document is stale and must be updated.

---

# CAW-007 — Runtime Contracts

**Version 1.0 · Status: ACTIVE · Package: `packages/runtime` · Extends: RI-006, CEngS-001 §4**

## Scope

This document defines the wedge-specific input/output shapes for `@zyppi/runtime`. It does not redefine Runtime purity, determinism, or isolation rules — those live in CEngS-001 §4 and RI-006, and apply here without exception.

## Input — `ExecutionRequest`

The Runtime receives only explicit inputs. No hidden reads of time, randomness, network, or filesystem.

```
ExecutionRequest {
  requestId: string
  identity: Identity
  activeConstitutionalView: ActiveConstitutionalView   // Identity, Relationships, Standing,
                                                          // Authorities, Capabilities, Evidence
                                                          // References, Applicable Policies —
                                                          // minimum state required, nothing more
  evidenceBundle: EvidenceBundle
  policyContext: PolicyContext
  executionContext: ExecutionContext                    // budget, entropy, versions — explicit only
}
```

## Output

```
ExecutionOutput {
  outcome: Outcome
  executionReceipt: ExecutionReceipt
  evidenceReferences: string[]
  trustResult: TrustResult
  policyDecisions: PolicyDecision[]
  diagnostics: Diagnostics
}
```

## Execution Receipt (immutable, per execution)

`Receipt ID · Execution ID · Runtime Version · Input Hash · Output Hash · Evidence Hash · Policy Version · Decision Summary · Execution Time · Deterministic Hash`

Same input → same receipt → same hash, always. This is tested at scale in CAW-011 M12 (10,000 identical executions, zero mismatches) and enforced continuously per CEngS-101 §2.

## What the Runtime Evaluates (this wedge only)

Identity validity · Evidence validity · Policy compliance · Trust requirements · Capability requirements · Authority requirements. Nothing beyond what CAW-003's domain model defines is evaluated.

## Constraints (restated as a pointer, not a new rule)

No I/O, no SQL, no HTTP, no filesystem, no hidden state, no randomness, no implicit timestamps, fully deterministic — this is CEngS-001 §4 verbatim, applied to this package. If you need an exception, it isn't a Runtime concern; move it to the Application layer (CAW-002).

## Active Constitutional View (ACV) Scope for This Wedge

Only the minimum constitutional state needed for one verification decision is loaded — not the full corpus, not speculative future fields. See CAW-003 for exactly which entities populate it.

---

# CAW-008 — Registry Schema

**Version 1.0 · Status: ACTIVE · Package: `packages/runtime` repository adapters (schema owned in `infra/`) · Storage: PostgreSQL**

## Scope

Tables required to serve one verification flow. No multi-tenant columns, no future-proofing columns not yet used — extend the schema when a milestone actually needs it, not before.

## Tables

**`identities`**
`id (pk, uuid)` · `identity_type` · `canonical_reference` (the Digital Link / GTIN it resolves from) · `referent_id (fk → referents)` · `status` (draft/active/decommissioned) · `created_at` · `updated_at`

**`referents`**
`id (pk, uuid)` · `referent_type` (product/brand/manufacturer) · `name` · `parent_referent_id (fk, nullable)` — used for Product → Brand → Manufacturer relations · `created_at`

**`evidence`**
`id (pk, uuid)` · `identity_id (fk)` · `evidence_type` · `hash` · `storage_ref` (R2 object key, see CAW-009) · `retrieved_at` · `immutable: true` (enforced at application level, never updated after insert)

**`policies`**
`id (pk, uuid)` · `policy_type` · `version` · `definition (jsonb)` · `active: boolean`

**`authorities`** / **`capabilities`** / **`standings`** _(minimal wedge scope — enough rows to satisfy policy evaluation for the demo dataset, not a full authority engine)_
`id (pk, uuid)` · `subject_id` · `scope` · `valid_from` · `valid_to`

**`execution_receipts`**
`id (pk, uuid)` · `execution_id` · `runtime_version` · `input_hash` · `output_hash` · `evidence_hash` · `policy_version` · `decision_summary (jsonb)` · `execution_time_ms` · `deterministic_hash` · `created_at` — **append-only, never updated or deleted**

## Constraints

- Foreign keys enforced at the database level, not just application level.
- `execution_receipts` and `evidence` are insert-only tables — no `UPDATE`/`DELETE` grants for the application role. This is not optional; it's how CEngS-001 §4's replay/immutability guarantee is actually enforced at the storage layer.
- Every table has `created_at`; mutable tables (`identities`, `policies`) also have `updated_at`.

## Migrations

Versioned, reviewed, tested, reversible where possible, immutable once merged — per CEngS-102 §10. Seed data for the wedge demo dataset lives in `infra/seed/` and is not production data.

## What This Schema Is Not

It is not the full Reality Graph, not the 17-cluster registry, not a general-purpose entity store. It's the minimum persistence needed to answer one question: does this Identity resolve, and is it verifiable? Broader registry work is out of this wedge's scope (CAW-001 §6).

---

# CAW-009 — Evidence Model

**Version 1.0 · Status: ACTIVE · Storage: Cloudflare R2 + `evidence` table (CAW-008)**

## What Evidence Contains (this wedge)

Product identity data · manufacturer data · brand data · verification metadata · cryptographic hashes · evidence references. Evidence is immutable once written — never edited, only superseded by a new evidence record.

## Storage Split

| What                                                                         | Where                                     |
| ---------------------------------------------------------------------------- | ----------------------------------------- |
| Hash, type, timestamp, pointer to blob                                       | `evidence` table (Postgres) — fast lookup |
| The actual evidence payload (documents, certificates, raw verification data) | Cloudflare R2 — content-addressed by hash |

The database never stores the blob itself — only its hash and R2 key. This keeps the registry small and keeps evidence retrieval a simple, cacheable fetch.

## R2 Key Layout

```
evidence/{identity_id}/{evidence_type}/{hash}.json
```

Deterministic and content-addressed: the same evidence content always produces the same key. Re-uploading identical evidence is a no-op, not a duplicate.

## Hashing

Evidence payloads are canonically serialized (RI-001) before hashing — same rule as everywhere else in the constitutional stack, not a wedge-specific exception. The resulting hash is what the Execution Receipt's `evidenceHash` field references (CAW-007).

## Retention

Evidence is retained indefinitely for this wedge (small, controlled demo dataset). Production retention policy is out of scope here — see CEngS-104 §8 when this wedge graduates toward production data volumes.

## Verification Flow (as consumed by the Runtime)

1. Runtime requests evidence by Identity ID (via the Application layer — the Runtime itself never talks to R2 directly, per CEngS-001 §4).
2. Application layer resolves the evidence record(s) from Postgres, fetches the blob from R2, and assembles the `EvidenceBundle` passed into `ExecutionRequest` (CAW-007).
3. Runtime verifies the hash matches and evaluates evidence validity as part of policy evaluation — it never fetches, never re-derives, only verifies what it's given.

## Out of Scope

Multi-party evidence attestation, evidence revocation workflows, cross-organization evidence federation. These are real future constructs (see SEC-001 Asset Class D) but not exercised here.

---

# CAW-010 — Edge Layer

**Version 1.0 · Status: ACTIVE · Package: `edge/worker` · Platform: Cloudflare Workers**

## Responsibility

The Worker does exactly four things and nothing else: receive the request, validate it superficially, forward it, return the response. **It contains no business logic and no constitutional logic** — it never calls `packages/runtime` directly (CAW-004).

## Flow

```
Incoming scan/request
      ↓
Validate request shape (well-formed URL, required params present)
      ↓
Forward to apps/api (GET /v1/resolve — CAW-006)
      ↓
Return response verbatim (pass-through, with edge caching where safe)
```

## Responsibilities in Detail

- **Routing** — map the incoming Digital Link request to the API endpoint.
- **Validation** — reject obviously malformed requests before they reach the API (cheap rejection, not business validation).
- **Caching** — cache successful responses at the edge where the response is safe to cache (verified, non-time-sensitive); never cache errors or unverified results.
- **Failure handling** — on API timeout/failure, return a clear, typed error (CAW-006 error table) — never fabricate a response, never silently retry into a different code path.

## What the Worker Never Does

Evaluate policy, verify evidence, generate receipts, hold any constitutional state (KV or otherwise), or make decisions about trust/verification. If a task looks like it needs "just a little logic" in the Worker, that logic belongs in the Runtime or Application layer instead — this boundary is deliberate (see the stack discussion that led to this architecture: Workers are edge-fast and read-mostly, not a place for correctness-critical state).

## Testing

Edge tests verify: routing correctness, request validation, pass-through fidelity, cache behavior, and failure-mode handling — per CEngS-101. No Runtime logic is tested here; that's CAW-007's concern.

---

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

## M02 — Constitutional Package Structure — ☑ Complete

_(Depends on M01)_

| ID      | Title                                         | Depends On   | Size | AMS      | Status                                                                                                                                |
| ------- | --------------------------------------------- | ------------ | ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| IT-0201 | Create `packages/runtime`                     | IT-0108      | XS   | AMS-0201 | ☑ _(Note: package manifest originated as the M01 purity-validator boundary and was extended during M02)_                              |
| IT-0202 | Create `packages/domain`                      | IT-0108      | XS   | AMS-0202 | ☑                                                                                                                                     |
| IT-0203 | Create `packages/contracts`                   | IT-0108      | XS   | AMS-0203 | ☑                                                                                                                                     |
| IT-0204 | Create `packages/shared`                      | IT-0108      | XS   | AMS-0204 | ☑                                                                                                                                     |
| IT-0205 | Create `packages/testing`                     | IT-0108      | XS   | AMS-0205 | ☑                                                                                                                                     |
| IT-0206 | Create `apps/api`                             | IT-0108      | XS   | AMS-0206 | ☑                                                                                                                                     |
| IT-0207 | Create `apps/web`                             | IT-0108      | XS   | AMS-0207 | ☑                                                                                                                                     |
| IT-0208 | Enforce dependency boundaries (CAW-004 table) | IT-0201–0207 | S    | AMS-0208 | ☑ _(The repository-level graph validator `tools/verify-dependency-graph.mjs` is the enforcement mechanism that closes the milestone)_ |

## M03 — Domain Foundation

_(Depends on M02; may run parallel with M04 registry work once contracts stabilize. Note: IT-0307 completes the planned Wave-A domain-foundation implementation set.)_

| ID      | Title                | Depends On   | Size | AMS      | Status |
| ------- | -------------------- | ------------ | ---- | -------- | ------ |
| IT-0301 | Identity model       | IT-0202      | S    | AMS-0301 | ☑      |
| IT-0302 | GS1 identifier model | IT-0202      | S    | AMS-0302 | ☑      |
| IT-0303 | Evidence model       | IT-0202      | S    | AMS-0303 | ☑      |
| IT-0304 | Authority model      | IT-0202      | S    | AMS-0304 | ☑      |
| IT-0305 | Capability model     | IT-0202      | S    | AMS-0305 | ☑      |
| IT-0306 | Standing model       | IT-0202      | S    | AMS-0306 | ☑      |
| IT-0307 | Policy model         | IT-0202      | S    | AMS-0307 | ☑      |
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

---

# CAW-012 — AI Mandates

**Version 1.0 · Status: ACTIVE · Uses: CEngS-003 mandate template — not restated here**

## Purpose

This is what an AI agent actually consumes to do one unit of work. It turns one `IT-xxxx` from CAW-011 into a concrete mandate. The structure comes from CEngS-003 §6 — this document supplies wedge-specific content, not a new format.

## What to Load for Any `IT-xxxx`

CAW-000 → CAW-005 (for milestone context) → this document → the specific CAW doc for the task's area (CAW-003 domain, CAW-006 API, CAW-007 runtime, CAW-008 registry, CAW-009 evidence, CAW-010 edge) → CEngS-000's table for the applicable engineering standards. Nothing more, by default (CEngS-003 §5).

## Worked Example 1 — `IT-0601` Implement GS1 Digital Link Parser

```
Objective:    Parse a GS1 Digital Link into a normalized request model.
Background:   First step of M06; feeds Identity resolution (CAW-005, CAW-003).
Scope:        packages/domain, packages/runtime, tests/runtime
Out of Scope: HTTP handling, database access — pure function only
Inputs:       Raw Digital Link string
Constraints:  No HTTP, no DB, pure function, canonical serialization supported
              (CEngS-001 §4)
Acceptance:   ✓ Valid GS1 links parsed (GTIN, Serial, Lot, Expiration)
              ✓ Invalid links rejected with typed error
              ✓ Typed result returned
Tests:        Unit, invalid-input, boundary, replay (CEngS-101)
Done when:    CI green, replay passes, docs updated, benchmark recorded,
              reviewed (CL-001)
Dependencies: IT-0302 (GS1 identifier model), IT-0501 (registry interfaces)
Complexity:   M
```

## Worked Example 2 — `IT-0803` Generate Execution Receipt

```
Objective:    Generate immutable constitutional execution receipts.
Scope:        packages/runtime
Fields:       Execution ID, Receipt ID, Input Hash, Output Hash, Evidence Hash,
              Policy Version, Runtime Version, Execution Budget, Execution
              Duration, Deterministic Hash (CAW-007)
Acceptance:   Same input → same receipt → same hash, 100% of executions
Tests:        10,000 replay executions, zero mismatches (CEngS-101 §2)
Done when:    Replay passes, receipt schema documented, CI green,
              performance baseline recorded
```

## Assignment Rule

An AI agent is never assigned a whole Milestone, package, or subsystem — one `IT-xxxx` only, per CEngS-003 §3. On completion: Review → Validation → Merge → next task (CEngS-102 §4–6). This is what keeps progress deterministic and architectural drift near zero — don't shortcut it even when a task looks trivial.

## When a Mandate Is Ambiguous

Stop and report, per CEngS-003 §5 — do not infer missing scope from the milestone description. If `IT-xxxx`'s CAW-011 one-liner isn't enough to build the mandate above, that's a signal this document needs a fuller worked example added, not that the agent should guess.

---

# CAW-013 — Validation Suite

**Version 1.0 · Status: ACTIVE**

## Purpose

Unit/integration/replay testing is CEngS-101's job — it proves the code does what it claims. This document proves something different: **that the wedge actually validates what CAW-001 set out to validate.** These are the checks that answer "did we learn what we needed to learn," not "does the code pass."

## Business Validation

- Can one real manufacturer's real GS1-labeled product be scanned and verified, with no synthetic shortcuts?
- Does the Verified Response contain information a real consumer would actually trust more than an unverified product page? (Qualitative — ask actual people, don't assume.)
- Would a real brand look at the Execution Receipt and evidence chain and consider it meaningful evidence of authenticity?

## Developer Validation

- Can a new engineer (or a fresh AI agent session) pick up CAW-000 → CAW-005 → CAW-012 and correctly implement the next `IT-xxxx` without needing verbal clarification?
- Did any milestone require an undocumented assumption to complete? If so, that's a defect in this series, not a one-off — fix the document.
- Did the CEngS series actually reduce hallucination/drift during this build, or did agents still need out-of-band correction? Track this honestly.

## Performance Validation

Per CEngS-103: is the wedge's measured p99 latency within CAW-001 §7's target (< 300ms)? Is it measured continuously, not just once? Are there any components approaching a migration trigger (CEngS-103 §5)?

## User Validation

- Time-to-first-verified-scan for a first-time user: how long, how many steps?
- Does the response make sense without needing an explanation of Zyppi's architecture? (If a consumer needs to understand "constitutional runtime" to trust the result, the UX has failed regardless of backend correctness.)

## Exit Signal

The wedge is validated — not just "tests pass" — when: a real external product scans successfully end to end, at least one person outside the build team can explain what they saw without prompting, performance is measured and within target, and no undocumented assumption was required anywhere in the build. This is the actual gate for CAW-001 §8's Definition of Done — CEngS-101's green CI is necessary, not sufficient.

---

# CAW-014 — Release Plan

**Version 1.0 · Status: ACTIVE · Channels defined by CEngS-102 §9 — applied here to the wedge**

## Stages

| Stage          | Audience                                          | Gate to Enter                                         | Gate to Exit                                                                                                 |
| -------------- | ------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Alpha**      | Build team only                                   | M11 (Verified Product Experience) complete            | End-to-end flow works on ≥1 real product, no crashes on the happy path                                       |
| **Internal**   | Full Zyppi team / council                         | M12–M13 complete (replay + performance baselines)     | Determinism proven at scale, performance measured and acceptable                                             |
| **Pilot**      | 1 real external manufacturer/brand, real products | M14 (Compliance Review) complete                      | CAW-013's Validation Suite passes in full, including business and user validation with a real external party |
| **Production** | Public                                            | M15 (Wedge Completion) complete, CAW-001 §8 satisfied | Only after every gate above; this is also the gate for Phase 3 to begin                                      |

## Success Metrics (per stage)

- **Alpha:** flow completes without manual intervention, ≥1 successful real scan.
- **Internal:** 10,000/10,000 replay match rate; p99 latency measured and recorded.
- **Pilot:** external partner confirms the Verified Response is meaningful to them; zero unresolved Critical/High findings from CEngS-102 §6 severity classification.
- **Production:** sustained success rate on real traffic over an initial observation window (define the window and threshold before launch, not after — this is an explicit gap to close at the start of Pilot, not left implicit).

## Rollback

Follows CEngS-102 §10 exactly: single-command rollback, previous artifact available, schema-compatible, no rebuild required. For this wedge specifically: rolling back the API/Runtime never requires rolling back the Registry schema in lockstep — migrations for this phase are additive-only until Production, so a rollback never needs a down-migration under normal operation.

## What Happens After Production

Production release of the wedge is the trigger for Phase 3 planning (SDK, next wedge, or ecosystem work — per the original 5-phase roadmap). It is not automatically a trigger for scope expansion within this wedge — new capability requests get a new CAW series, not an amendment bolted onto this one.

---

# OPEN-001 — Open Constitutional Questions

**Version 1.0 · Status: ACTIVE (tracking doc — not constitutional law, not a CEngS/CAW document)**

## Purpose

Real architectural questions surfaced during design that don't block current milestones. Each is revisited only when the milestone that actually needs the answer begins — never speculatively. Do not let this list grow into a shadow constitution; if an item never gets revisited by the time its trigger milestone starts, that's a signal it wasn't actually load-bearing.

## Tracked Questions

| ID         | Question                                                                                                                                                                                                                                                                                                                     | Raised By                                                              | Trigger Milestone                                                                                                                                                                                                                                                                       | Status                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| OPEN-001-A | How does policy evaluation handle clock drift / ordering between edge and registry? Should temporal evaluation use cryptographic sequence number instead of wall-clock time?                                                                                                                                                 | Council review                                                         | M08 (Runtime Verification Pipeline)                                                                                                                                                                                                                                                     | Open                                                    |
| OPEN-001-B | What is the cascading invalidation mechanism when a sponsoring Human/Organization's Standing is suspended mid-execution for a delegated AI Agent?                                                                                                                                                                            | Council review                                                         | Post-wedge (SEC-001 full implementation, not this wedge's minimal Authority scope)                                                                                                                                                                                                      | Open — explicitly out of this wedge's scope per CAW-003 |
| OPEN-001-C | Execution Receipts risk unbounded growth at scale (full Resolution Graph per receipt). Should Merkle projections / cryptographic accumulators be used for historical receipts?                                                                                                                                               | Council review                                                         | M13 (Performance Baseline) if receipt storage growth becomes measurable                                                                                                                                                                                                                 | Open                                                    |
| OPEN-001-D | What are the exact, numeric Go-migration trigger thresholds for `packages/runtime` (p99 latency, replay failure rate under load)?                                                                                                                                                                                            | CEngS-103 §5 references this as needing hard numbers                   | M13 (Performance Baseline)                                                                                                                                                                                                                                                              | Open                                                    |
| OPEN-001-E | Should `@zyppi/domain` eventually split into subsystem-specific domain packages (e.g., `@zyppi/runtime-domain`, `@zyppi/policy-domain`) to avoid becoming a monolithic dependency chokepoint as the domain model grows beyond this wedge's 11 entities?                                                                      | Council review (raised during AMS-0202)                                | M03, once actual domain entities are written and package size/coupling can be judged from real content, not speculation. Not before — CAW-003 already scoped this wedge's domain model deliberately minimal, and splitting packages before any entity exists is premature architecture. | Open                                                    |
| OPEN-001-F | How should public `@zyppi/domain` schemas evolve and retain constitutional provenance? Specifically, what compatibility, succession, and historical-version rules apply to public domain exports, and should Runtime verification rely on package-build attestations, signed registry bundles, or another governed artifact? | Gemini council review during AMS-0202; refined by architectural review | M03 (Domain Model), before the first public domain entities or schemas are introduced                                                                                                                                                                                                   | Open                                                    |

## Rule

Adding an item here requires: the question, who raised it, and which milestone will actually need the answer. No item may be added "just in case" — if you can't name a trigger milestone, it doesn't belong here yet.

---

# Note:

** This document is only valid until the finish of M04, Afterward it need to be updated, ask to the updates if it become not valid**
