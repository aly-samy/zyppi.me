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
