# CEngS-000 — Engineering Navigation Index
**Version 2.0 · Status: RATIFIED · Supersedes CEngS-001–010 (v1.0 Draft), CES-005**

## Purpose
This is the only document every AI agent reads first. It defines no rules itself — it tells you which of the other documents to load for the task in front of you, in what order, and when to stop reading.

## Corpus Map

```
CORE (always load, every session — ~3 short documents)
├── CEngS-001  Engineering Constitution   (immutable law — what must always be true)
├── CEngS-002  Engineering Rules          (repo structure, boundaries, dependencies)
└── CEngS-003  AI Engineering Mandate     (how an AI agent operates: authority, task
                                            decomposition, context loading)

OPERATIONAL STANDARDS (load only the one relevant to the task)
├── CEngS-101  Testing & Verification Standard
├── CEngS-102  Review, CI/CD & Release Standard
├── CEngS-103  Performance & Benchmark Standard
├── CEngS-104  Observability & Operational Evidence Standard
└── CEngS-105  Documentation Standard

CHECKLISTS (load right before producing a deliverable)
├── CL-001  AI Coding / PR Checklist
└── CL-002  Release Checklist

IMPLEMENTATION GUIDES (product-specific — outside CEngS, load per feature area)
└── IG-xxx  e.g. IG-001 Commerce Atlas, IG-002 Runtime, IG-003 Identity Engine...
```

## Loading Algorithm

1. Load CEngS-001, CEngS-002, CEngS-003. Always. Every session. Nothing else is loaded by default.
2. Identify the task category from the table below.
3. Load only the Operational Standard(s) listed for that category.
4. Load the relevant Implementation Guide(s), if the task touches a specific product area.
5. Load the matching Checklist immediately before producing a deliverable (code, PR, release).
6. Do not load anything not listed here for the task at hand. If you believe you need something not listed, stop and say so rather than guessing.

## Task → Document Table

| Task | Load (in addition to Core) |
|---|---|
| Any general coding task | Core only |
| Writing or modifying tests | CEngS-101 |
| Opening a Pull Request | CEngS-102, CL-001 |
| Cutting a build or release | CEngS-102, CL-002 |
| Optimization / profiling work | CEngS-103 |
| Adding logs, metrics, traces, alerts | CEngS-104 |
| Writing docs / READMEs / API references | CEngS-105 |
| Implementing a specific product area | Core + relevant IG-xxx |
| Reviewing someone else's (or AI's) PR | CEngS-102, CL-001 |
| Deciding whether to migrate a package to Go | CEngS-103 §Migration Triggers |

## Governing Principle

Core is law. Operational Standards are procedure and may evolve. Implementation Guides are product knowledge, not constitutional. Checklists are not documents to reason about — they are documents to tick.

If a rule appears in two places in this corpus, that is a defect: file it, don't duplicate around it. Every rule below has exactly one home.

---
---

# CEngS-001 — Engineering Constitution
**Version 2.0 · Status: RATIFIED · Authority: Constitutional (immutable) · Depends On: ZRM-001, POL-001, SEC-001, RI-001, RI-006**

## 1. Purpose
This document is the immutable engineering law of Zyppi. It defines what must always be true of any implementation, regardless of language, framework, or team. It never governs procedure (see CEngS-002/101–105) and never governs business logic.

Everything in this document is permanent. If it needs to change, that is a constitutional amendment, not an edit.

## 2. Philosophy
Engineering implements Reality; it never modifies constitutional truth. Implementation adapts to the Constitution — never the reverse.

Engineering decisions are ordered by priority, and lower priorities never override higher ones:
1. Correctness
2. Determinism
3. Auditability
4. Security
5. Simplicity
6. Performance

Performance and developer convenience never override anything above them.

## 3. Constitutional Layers
Every implementation separates concerns into six layers. Dependencies point only downward (Presentation → Gateway → Application → Runtime → Persistence → Infrastructure). Reverse and circular dependencies are prohibited.

| Layer | Contains | Constitutional logic allowed? |
|---|---|---|
| 1. Presentation | UI, CLI, SDK, dashboards, mobile | No |
| 2. Gateway | HTTP/REST/GraphQL/gRPC, auth, routing, rate limiting, edge workers | No |
| 3. Application | Workflow orchestration, transactions, external integrations | No — no truth generation |
| 4. Runtime | Policy evaluation, evidence verification, authority resolution, capability validation, trust computation, decision generation, execution receipts | **Yes — this layer is sacred** |
| 5. Persistence | Database, object storage, search, queues, caches | No — persistence only |
| 6. Infrastructure | Cloud, containers, networking, monitoring, secrets, deployment | No — entirely replaceable |

## 4. The Runtime Is Isolated and Pure
The Constitutional Runtime (Layer 4) is a single, isolated package. This is the one rule from which most other rules in this document derive.

**The Runtime shall not depend on:** HTTP, web frameworks, ORMs, databases, filesystem, cloud SDKs, environment variables, logging frameworks, network APIs, message queues, or any OS service. It shall be executable entirely in memory, with no I/O of any kind.

**Every Runtime function is deterministic.** Identical inputs always produce identical outputs. Runtime functions never: read system time, generate random numbers, make network requests, read files, mutate external or shared state, or rely on implicit globals.

**Entropy is always explicit.** If time, randomness, external evidence, or cryptographic nonces are needed, they enter through the Execution Context as explicit parameters — never read implicitly.

**Every execution occurs within an explicit Execution Context**, containing: Execution Budget, Policy Snapshot, Authority Context, Capability Context, Evidence Context, Constitution Version, Execution Identifier. No hidden execution state is permitted.

**Every execution is replayable.** Identical inputs replayed at any later time produce identical outputs, identical hashes, and identical receipts. Non-replayable execution is unconstitutional.

**Canonical serialization is mandatory** for every constitutional artifact (hashes, receipts, evidence, execution outputs, policy snapshots). These are byte-identical across implementations and languages, per RI-001.

## 5. Independence Guarantees
- **Database independence:** the Runtime has no knowledge of database technology. Persistence occurs only through interfaces. Swapping Postgres for anything else requires zero Runtime changes.
- **Cloud independence:** the Runtime is independent of any specific cloud provider or SDK. Cloud providers are infrastructure only.
- **AI independence:** no constitutional logic depends on any AI model. LLMs may recommend; they never determine constitutional truth. Every AI-influenced decision requires deterministic verification.
- **Language independence:** programming languages are an implementation detail. The Runtime may be reimplemented in TypeScript, Go, Rust, or any future language. A migration must preserve behavior, hashes, receipts, replayability, and constitutional semantics exactly — see CEngS-103 for the evidence-based trigger process.

## 6. Security
Security follows SEC-001. Engineering never weakens a constitutional security guarantee for convenience, ever.

## 7. Errors Are Explicit
Silent failure is prohibited everywhere in the system. Every failure produces: an Error Code, a Reason, the Execution Stage, a Constitutional Reference, and Recovery Guidance.

## 8. Constitutional Failure Conditions
An implementation loses constitutional compliance the moment it:
- Introduces hidden state or implicit entropy
- Allows non-deterministic execution or violates replay guarantees
- Bypasses policy evaluation
- Allows AI to determine constitutional truth
- Violates dependency direction, or leaks infrastructure concerns into the Runtime

## 9. Ratification Criteria
Compliance with this document is binary. Partial compliance is non-compliance. An implementation satisfies CEngS-001 only if it satisfies every requirement above — no exceptions live in this document (exceptions, when ever needed, are handled procedurally under CEngS-102 and always time-boxed with a removal plan).

---
---

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

---
---

# CEngS-003 — AI Engineering Mandate
**Version 2.0 · Status: RATIFIED · Authority: Engineering Standard · Depends On: CEngS-001, CEngS-002**
**Supersedes and merges legacy: CEngS-003 (AI Engineering Mandate), CEngS-007 (Implementation Navigation & Task Decomposition), CEngS-008 (AI Context Loading & Knowledge Resolution)**

## 1. Purpose
This is the operating manual for every AI coding agent (model- and vendor-independent — applies equally to Claude, GPT, Gemini, Jules, Antigravity, Codex, or any future system). It governs three things that were previously three separate documents, because they are one continuous process: **what an AI may decide, how it breaks work down, and how it loads knowledge before acting.**

## 2. Authority Split
**Only a human may:** ratify architecture, approve constitutional changes, merge constitutional modifications, accept strategic trade-offs, approve production deployment.

**AI may:** generate code, tests, documentation; refactor; explain; suggest; optimize with evidence; generate benchmarks, migration plans, API specs.

**AI shall never:** invent constitutional rules, redesign architecture without instruction, silently change behavior, bypass testing or security controls, introduce undocumented dependencies or breaking changes, assume missing requirements, or guess constitutional intent. If a required fact is missing, **stop and report it — do not fabricate it.**

## 3. Task Hierarchy — Navigate, Don't Leap
Implementation specifications are hierarchical. An AI agent never attempts to implement an entire specification at once; it descends the hierarchy to the smallest independently buildable unit and implements only that.

```
Phase (major milestone, e.g. "Commerce Atlas")
  ↓
Milestone (measurable deliverable, e.g. "Identity Resolution")
  ↓
Task (a coherent objective, hours–days, e.g. "Implement Digital Link Parser")
  ↓
Work Item (the only level an AI implements directly, e.g. "Implement GTIN extraction")
```

An agent never receives a Phase or Milestone as a direct mandate. It receives one Task, or — for complex tasks — one Work Item at a time. Skipping levels is not permitted.

**Every Work Item is atomic:** single responsibility, independently implementable, testable, reviewable, and completable. If it needs multiple unrelated objectives, split it.

**Work Item structure** (what a mandate must specify): Identifier · Objective (one sentence) · Inputs (specs, interfaces, schemas, dependencies) · Outputs (files, tests, docs, benchmarks) · Constraints (constitutional rules, performance, security, determinism) · Acceptance Criteria · Test Requirements · Dependencies · Complexity estimate (XS–XL).

**Completion is bottom-up:** a Task is done only when every Work Item beneath it is done; a Milestone only when every Task is done; a Phase only when every Milestone is done. Partial completion never marks a higher level complete.

**Dependencies before implementation.** If a dependency is incomplete, stop and report it — never fabricate a temporary stand-in. Work Items may run in parallel only with no shared dependency, no shared mutable state, and no simultaneous interface changes; otherwise, sequential.

## 4. The Implementation Cycle
For every Work Item, in order, with no step skipped:

```
Understand → Load context (§5) → Validate prerequisites → Plan → Implement
  → Test → Replay-verify → Benchmark → Update docs → Submit for review
```

A Work Item is done only when: it compiles, all tests pass, replay tests pass, benchmarks are recorded, docs are updated, architectural boundaries hold, no constitutional violations exist, and CI passes.

## 5. Context Loading — Load the Least, Not the Most
Context is a constitutional resource. Wrong or excessive context produces wrong software and higher hallucination risk. **Never load the entire corpus by default.**

**Authority order** (higher always overrides lower; code conforms to documents, never the reverse):
North Star → Founding Principles → Constitutional documents (POL, RI, SEC, WS…) → Engineering Standards (CEngS) → Implementation Specs → API Contracts → DB Schemas → Source Code → Tests.

**Before writing any code, answer:** What am I building? Which constitutional module governs it? Which CEngS standards apply (use CEngS-000's table)? Which spec defines it? Which APIs/DB entities are affected? What tests already exist? **If any answer is unknown, stop.**

**Rules:**
- Load only what CEngS-000's task table says to load for this task — nothing more, by default.
- Only `ACTIVE` documents govern implementation; deprecated/archived/experimental documents never override active authority.
- If two loaded documents conflict, **stop, report the conflict, and wait for a human.** Never guess, merge, reinterpret, or silently pick one.
- If required information doesn't exist anywhere, stop, name the missing specification, and mark the item blocked. Never fabricate a requirement.
- If context exceeds the model's window: load highest authority first; summarize lower-priority material only in ways that preserve constitutional meaning exactly; never summarize constitutional law itself; a summary never substitutes for the authoritative source when precision matters.
- Cross-module work: identify entry module, exit module, shared contracts/entities, and integration boundaries explicitly. Never assume behavior of a module you haven't loaded.

**Context Receipt.** Before implementing, produce a short receipt: Work Item ID, documents loaded (with versions), dependency graph, any missing dependencies, any blocked items. This receipt is itself implementation evidence — keep it with the PR.

## 6. Mandate Template (for humans writing tasks for AI)
```
Objective:        <single measurable goal>
Background:       <business + constitutional context>
Scope:             <what SHALL be implemented>
Out of Scope:      <what SHALL NOT be touched>
Inputs:            <files, interfaces, schemas>
Constraints:       <CEngS references, perf/security limits, arch boundaries>
Acceptance Criteria: <observable completion conditions>
Definition of Done:  <required artifacts — see §4>
```

## 7. Deliverable & Response Format
Every implementation includes: production code, tests, documentation, migration notes (if any), performance and security considerations, known limitations, suggested future work. Unless told otherwise, respond with: Summary → Implementation Plan → Code Changes → Tests → Documentation Updates → Risks → Future Improvements.

## 8. Compliance
Any AI-generated contribution that violates this standard is rejected until corrected — regardless of which model produced it. No implementation may depend on model-specific behavior.

---
---

# CEngS-101 — Testing & Verification Standard
**Version 2.0 · Status: RATIFIED · Authority: Operational Standard · Depends On: CEngS-001, CEngS-002, CEngS-003**
**Supersedes: CES-005 "Constitutional Testing Standard" (legacy typo'd prefix — same document)**

## 1. Purpose
Testing proves behavior, not coverage. Coverage is a metric; correctness is the objective. Passing tests are constitutional evidence of correctness, determinism, security, replayability, and performance.

## 2. The Testing Pyramid
Every feature is validated through, in order: Static Analysis → Unit Tests → Property Tests → Integration Tests → Deterministic Replay → Security Tests → Performance Tests → Constitutional Conformance Suite.

| Layer | What it proves | Required for |
|---|---|---|
| Static analysis | Types, lint, dependency direction, no circular deps, no forbidden imports | Every commit |
| Unit tests | Every public function's inputs, outputs, boundaries, errors, edge cases | Every function |
| Property tests | Invariants hold across generated inputs (identity, graph consistency, policy evaluation, capability propagation, authority resolution, evidence verification) | Critical algorithms |
| Integration tests | Cross-package behavior | Every feature |
| Deterministic replay | Identical inputs + identical Execution Context → identical outputs, hashes, receipts | Every Runtime execution — mandatory, a failure here is a constitutional violation, not a bug |
| Cross-implementation conformance | Independent language implementations (TS/Go/Rust/future) produce byte-identical artifacts, per RI-001 canonical serialization | Runtime, whenever multiple implementations exist |
| Security tests | Auth, injection, input/output validation, privilege escalation, secrets leakage, dependency vulns | Every release |
| Performance tests | See CEngS-103 | Every release |
| Mutation testing | Test suite detects intentional behavioral mutations | Critical Runtime modules, recommended |
| Failure / stress tests | Graceful behavior under DB/cache/network failure, invalid evidence, expired authority, policy conflict, sustained load | Critical components |
| Regression tests | Every fixed defect gets a permanent test; it never silently reappears | Every bugfix |

## 3. Coverage Guidance (risk-based, not a target to game)
Runtime: 100% · Policy Engine: 100% · Security Components: 100% · SDKs: ≥95% · Application Services: ≥90% · UI: ≥80%. Coverage never substitutes for correctness — a 100%-covered test that doesn't assert the right thing proves nothing.

## 4. AI-Generated Code
AI-generated code always ships with unit, integration, and replay tests plus documentation examples. Code without tests is rejected on sight — this is non-negotiable regardless of how small the change looks.

## 5. Constitutional Conformance Suite
Every release runs the full suite, verifying: CEngS compliance, POL/SEC/RI compliance, replay compliance, canonical serialization, execution receipts, dependency boundaries, architecture rules. Result is binary — pass or fail, no partial credit.

## 6. Evidence
Every test run and release produces immutable Test Evidence: version, commit, environment, execution time, results, benchmarks, replay hashes, conformance status. This evidence is retained as a constitutional artifact (see CEngS-104 for retention).

## 7. Release Gate
A release does not proceed unless: all mandatory tests pass, replay tests pass, the conformance suite passes, security scans pass, benchmarks remain acceptable, docs are current, and zero constitutional violations remain. (Full release process: CEngS-102.)


---
---

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
| Severity | Meaning | Effect |
|---|---|---|
| Critical | Violates constitutional law | Merge prohibited |
| High | Security or architectural violation | Merge prohibited |
| Medium | Maintainability/quality concern | Must fix before release |
| Low | Minor improvement | May merge with documented rationale |

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

---
---

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

---
---

# CEngS-104 — Observability & Operational Evidence Standard
**Version 2.0 · Status: RATIFIED · Authority: Operational Standard · Depends On: CEngS-001, CEngS-101, CEngS-102, CEngS-103**
**Supersedes: CEngS-010**

## 1. Purpose
An execution that cannot be observed cannot be constitutionally verified. Observability reveals system behavior; it never alters it, and it never becomes business logic.

## 2. The Four Pillars
Logs → Metrics → Traces → Execution Receipts → Operational Evidence. No single pillar is sufficient alone; each complements the others.

## 3. Logging
Structured JSON only in production — plain text logs are prohibited. Every entry includes: timestamp, service name, environment, version, build ID, commit SHA, correlation ID, execution ID (if applicable), severity, component, message. Levels: TRACE/DEBUG/INFO/WARN/ERROR/FATAL, matched honestly to actual operational impact.

**Never log:** passwords, secrets, private keys, auth tokens, or unredacted PII.

## 4. Metrics, Tracing, Correlation
Every critical component publishes: request count, latency, CPU, memory, queue length, error rate, retry count, cache hit ratio, DB connections, receipt generation rate.

Distributed tracing (trace ID, span ID, parent span, Execution Context, receipt correlation) reconstructs the complete path of any execution. Every Runtime execution gets a unique Execution ID that correlates its logs, metrics, traces, execution receipt, build receipt, release receipt, and any incident reports.

**Execution Receipts (RI-006) remain the constitutional artifact.** Operational logs reference them; they never replace them.

## 5. Health, Alerting, Incidents
Every service exposes a health endpoint (Healthy → Degraded → Unavailable), with no sensitive data exposed. Alerts fire on: repeated failures, high latency, replay failures, security violations, infra failures, resource exhaustion, abnormal restart frequency.

Every incident produces an **Incident Record**: ID, detection time, affected services, impact, root cause, resolution, recovery time, related receipts/deployments, lessons learned.

## 6. Audit Trail & Privacy
Every administrative action (config changes, role/policy changes, deployment approvals, emergency overrides) generates tamper-evident audit evidence. Observability always respects privacy — mask or redact sensitive data; expose PII only when explicitly authorized.

## 7. AI & Infrastructure Observability
Every AI-assisted operation records: model, model version, prompt/response identifiers, execution time, confidence (if available), failure reason — AI outputs stay traceable. Infrastructure metrics (CPU, memory, storage, network, availability, container/worker/DB health) are tracked separately from application metrics.

## 8. Retention, Integrity, Continuity
Evidence retention follows documented, versioned, legally-compliant policy; deletion is auditable. Evidence is immutable where required, chronologically ordered, traceable, versioned, and periodically integrity-checked. Monitoring is continuous by default — disabling it requires explicit authorization, and critical Runtime components never run without observability.

## 9. Definition of Constitutional Observability
A system demonstrates it when: every execution is traceable, behavior is measurable, evidence is complete and trustworthy, failures are observable, administrative actions are auditable, and monitoring preserves rather than alters behavior. An implementation that cannot correlate executions across logs/metrics/traces/receipts, or produce auditable operational history, is non-compliant for production.


---
---

# CEngS-105 — Documentation Standard
**Version 2.0 · Status: RATIFIED · Authority: Operational Standard · Depends On: CEngS-001, CEngS-002**
**Supersedes: documentation clauses previously duplicated across legacy CEngS-001/002/003/004**

## 1. Purpose
Every public package and API documents itself well enough that a new engineer — human or AI — can use it correctly without reading the source. Documentation evolves with the implementation; it is never allowed to fall behind it.

## 2. Package Documentation
Every public package includes: Purpose, Architecture, Public API, Examples, Dependencies, Limitations.

## 3. Public API Documentation
Every public function/endpoint includes: Purpose, Parameters, Return values, Errors, Examples, and version history where the API has changed.

## 4. Required at PR Time
Any PR that adds or changes public behavior updates: the package doc, the API doc, and — for breaking changes — migration notes. A PR that changes behavior without a corresponding doc update fails review (CEngS-102 §4).

## 5. Compliance
Documentation completeness is checked as part of the standard review gate (CEngS-102). It is not a separate approval step.

---
---

# CL-001 — AI Coding / PR Checklist
**One page. Run this immediately before opening a PR. Full rules: CEngS-102.**

- ☐ Mandate/Work Item followed exactly — no scope drift, no invented requirements
- ☐ `packages/runtime` stays pure — no HTTP, SQL/ORM, filesystem, cloud SDK, env vars, logging, randomness, or system time inside it
- ☐ No new dependency without documented justification
- ☐ Deterministic — no implicit entropy; canonical serialization intact
- ☐ Replay tests pass — identical inputs → identical outputs/hashes/receipts
- ☐ Layer boundaries respected, no circular dependencies
- ☐ Unit + integration + replay tests included and passing
- ☐ Benchmarks recorded where applicable, no unreviewed regression
- ☐ Security preserved — auth, input/output validation, no secrets in code
- ☐ Docs updated (package, API, migration notes if breaking)
- ☐ Constitutional references cited for any nontrivial decision
- ☐ No unresolved TODOs, no hidden assumptions
- ☐ CI green

If any box is unchecked, the PR is not ready — say so plainly rather than opening it anyway.

---
---

# CL-002 — Release Checklist
**One page. Run this before any production release. Full rules: CEngS-102 §7–11.**

- ☐ Compilation succeeds, zero warnings
- ☐ All unit/integration tests pass
- ☐ Replay tests pass — every hash matches
- ☐ Constitutional Conformance Suite passes (CEngS-101 §5)
- ☐ Security scan (deps, secrets, license, SBOM, container) passes
- ☐ Benchmarks within policy, no unreviewed regression (CEngS-103)
- ☐ Docs synchronized (CEngS-105)
- ☐ Artifacts signed
- ☐ Build Receipt generated
- ☐ Rollback path verified (single command, previous artifact available, schema-compatible)
- ☐ Migrations (if any) versioned, tested, reviewed
- ☐ Human approval recorded
- ☐ Release Receipt generated

Only after every box is checked does the artifact become an Active Constitutional Artifact.
