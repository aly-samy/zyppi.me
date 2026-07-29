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
