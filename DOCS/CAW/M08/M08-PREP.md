# M08-PREP — Runtime Verification Pipeline

**Version:** 1.2 **Status:** PROPOSED — COUNCIL RATIFICATION **Milestone:** M08 — Runtime Verification Pipeline **Phase:** Commerce Atlas Wedge — Phase 2 **Target Artifact:** `DOCS/CAW/M08/M08-PREP.md` **Supersedes:** M08-PREP v1.1 **Authority:** Zyppi Constitutional Council **Implementation Authority:** NONE **AMS-0801–AMS-0805:** WITHHELD pending applicable Council Gate resolution

# 1. Purpose

M08 is the milestone at which the Commerce Atlas Wedge Runtime evolves from the M04 constitutional execution skeleton into a functioning deterministic verification pipeline.

CAW-005 defines the M08 objective as:

Full Runtime execution: ACV → Evidence → Policy → Outcome → Receipt

with deterministic execution, replayability, and receipt generation as the principal acceptance signals.

M08-PREP establishes the constitutional and architectural baseline from which the M08 implementation mandates may subsequently be issued.

This document is a **preparation and governance artifact**.

It is **not an implementation mandate**.

No AMS-080x implementation may begin solely on the authority of this document.

# 2. Constitutional Position

M08 shall preserve the following Runtime boundary:
`Application / Infrastructure Layer     │     ├── Registry retrieval     ├── Evidence retrieval     ├── ACV retrieval     ├── physical dependency discovery     ├── persistence     └── operational observability              │              ▼        Explicit Runtime Input              │              ▼ ┌──────────────────────────────────────┐ │          packages/runtime            │ │                                      │ │  Admission                           │ │  Bundle Discovery                    │ │  Bundle Verification                 │ │  Dependency Resolution               │ │  Compatibility Validation            │ │  ACV Activation                      │ │  Resolution Graph Construction       │ │  Active Execution                    │ │  Receipt Materialization             │ │                                      │ │  Pure · Synchronous · Deterministic  │ │  Zero I/O · Explicit-input driven    │ └──────────────────────────────────────┘              │              ▼        ExecutionOutput `
The Runtime shall not:

- access PostgreSQL;

- access R2;

- access Redis;

- access the network;

- perform filesystem I/O;

- access an ambient system clock;

- access ambient randomness;

- persist receipts;

- derive constitutional truth from host state.

The Application layer may retrieve and assemble constitutional inputs, but the Runtime remains responsible for independently validating and interpreting those inputs.

# 3. M08 Objective

M08 shall complete the constitutional Runtime execution path required by the wedge:
`Execution Admission         ↓ Active Constitutional View         ↓ Evidence         ↓ Policy Context         ↓ Policy Evaluation         ↓ Outcome         ↓ ExecutionOutput         ↓ ExecutionReceipt `
The implementation shall complete the existing M04 Runtime pipeline.

M08 shall **not create a parallel Runtime architecture**.

The existing nine-stage M04 pipeline remains the structural foundation:

1. Admission

2. Bundle Discovery

3. Bundle Verification

4. Dependency Resolution

5. Compatibility Validation

6. ACV Activation

7. Resolution Graph Construction

8. Active Execution

9. Receipt Generation

M04 reconnaissance confirms that this nine-stage structure exists and that M04 intentionally left M05–M08 functionality outside its scope.

# 4. Authority Hierarchy

M08 implementation shall be governed by the following authority order:

1. Ratified CEngS standards applicable to Runtime execution.

2. Active CAW constitutional documents.

3. CAW-011 task identifiers and titles.

4. This M08-PREP after ratification.

5. Individual AMS mandates issued under this PREP.

6. Repository implementation evidence.

7. Implementation-agent interpretation.

An implementation agent may not use engineering convenience to override a higher-level authority.

Where implementation and documentation disagree:
`Record evidence → identify discrepancy → do not silently choose → escalate to Council `
This follows the evidence-before-interpretation discipline established by the M08 reconnaissance.

# 5. CAW-011 M08 Task Authority

CAW-011 currently defines:

ID

Official Title

Depends On

AMS

IT-0801

Wire ACV loading into pipeline

IT-0402, IT-0503

AMS-0801

IT-0802

Wire Evidence loading into pipeline

IT-0801, IT-0704

AMS-0802

IT-0803

Generate Execution Receipt (full)

IT-0802, IT-0405

AMS-0803

IT-0804

Policy evaluation integration

IT-0803, IT-0404

AMS-0804

IT-0805

Pipeline replay tests

IT-0804

AMS-0805

These identifiers and titles remain authoritative unless CAW-011 is formally amended.

## 5.1 Logical Dependency Defect

The current chronological dependency order does not fully represent the data dependency required by the Runtime.

Receipt generation requires policy output.

Therefore the logical implementation dependency is:
`AMS-0801 ─┐ AMS-0802 ─┼──► AMS-0804 ───► AMS-0803 ───► AMS-0805           │           └─────────────────────────────── `
More precisely:
`ACV / Admission ──┐                   ├──► Policy Evaluation ───► Receipt Materialization ───► Replay Evidence ─────────┘ `
The M08 reconnaissance independently identified the same dependency defect: receipt materialization requires policy-derived fields including `policyVersion` and `decisionSummary`.

**Important:** this is a Council-gated interpretation, not a silent amendment to CAW-011.

G-0811 shall determine whether CAW-011 is formally amended or whether an interim Council interpretation authorizes the corrected logical sequence.

# 6. Source-of-Truth Contract Inventory

The following contracts constitute the M08 execution surface.

## 6.1 Execution Contracts

- `ExecutionRequest`

- `ExecutionContext`

- `ExecutionOutput`

- `ExecutionReceipt`

- `Outcome`

## 6.2 Constitutional State Contracts

- `ActiveConstitutionalView`

- `PolicyRecord`

- Constitution Version representation

## 6.3 Evidence Contracts

- `EvidenceBundle`

- `BundleVerificationReport`

- evidence references

- evidence hash/digest structures

## 6.4 Policy / Runtime Contracts

- `PolicyContext`

- `EvaluatorResult`

- `PipelineResult`

- `PipelineError`

- `LifecycleStage`

- `StageOverrideConfig`

These contracts are inherited contracts for M08.

No AMS may silently redefine their meaning.

Where a contract is insufficient for an M08 requirement, the deficiency must be reported and resolved through the applicable Council Gate or authorized contract amendment.

# 7. Execution Context Sufficiency

CEngS-001 §4 requires every Runtime execution to occur within an explicit Execution Context.

The required conceptual dimensions include:

- Execution Budget

- Policy Snapshot

- Authority Context

- Capability Context

- Evidence Context

- Constitution Version

- Execution Identifier

The currently observed `ExecutionContext` requires reconciliation against these dimensions.

The reconciliation shall explicitly determine the semantics of:
`budget entropy versions executionId constitutional temporal input `
No AMS may silently expand `ExecutionContext`.

This is governed by **G-0808**.

# 8. Application / Runtime Resolution Boundary

The Runtime is constitutionally responsible for deterministic resolution logic but is prohibited from physical I/O.

Therefore Runtime resolution shall be modeled as a deterministic state machine.

Where a required dependency is absent:
`Runtime    ↓ Missing dependency identified    ↓ Deterministic suspended result    ↓ Application retrieves dependency    ↓ Application constructs new explicit input    ↓ Runtime invoked again `
The Runtime may therefore **drive resolution semantics without performing retrieval I/O**.

A Runtime result indicating that additional material is required must be deterministic and explicit.

The Application layer may retrieve and assemble the required material.

The Application layer may not convert retrieval success into constitutional truth without the Runtime independently validating the supplied material.

# 9. Evidence Verification Boundary

M07 supplies the evidence retrieval and hash-verification foundation.

M08 shall preserve the following division:
`Application:     retrieve     assemble     transport  Runtime:     independently verify     evaluate     derive constitutional result `
An Application-layer field such as:
`verified: true `
is operational input only.

It is not constitutional proof.

The Runtime shall independently verify evidence integrity using deterministic, pure verification.

No Runtime stage may fetch or re-derive evidence from external infrastructure.

# 10. Temporal Semantics

Temporal validity is a recognized unresolved constitutional issue.

The CAW registry model contains temporal fields such as:
`valid_from valid_to `
while the M08 reconnaissance identifies the unresolved clock-drift problem and the existence of `OPEN-001-A`.

The Runtime shall not access ambient wall-clock time.

Until G-0801 is resolved:

- no AMS may invent temporal semantics;

- no policy evaluator may call `Date.now()`;

- no policy evaluator may call `new Date()` for constitutional evaluation;

- no receipt hash may depend on ambient execution time;

- temporal policy evaluation must fail closed if the required explicit temporal input is unavailable.

G-0801 shall determine the constitutional temporal representation.

Any temporal value used by the Runtime must enter through explicit execution input.

# 11. `executionTime`

The existing receipt/persistence surface includes execution-duration information.

Its constitutional meaning remains unresolved.

The following distinction shall be preserved:
`Constitutional execution semantics         ≠ Host performance metadata `
Until G-0802 is resolved, `executionTime` shall not be treated as deterministic constitutional material.

It shall not participate in `deterministicHash` unless explicitly authorized.

G-0802 shall determine:

- whether `executionTime` means duration or timestamp;

- whether it is constitutional or operational;

- whether it is included in any hash;

- its canonical representation;

- its relationship to the existing persistence field `execution_time_ms`.

# 12. Complete ExecutionOutput Contract

M08 does not merely produce a receipt.

The Runtime output is the complete:
`ExecutionOutput `
The M08 baseline recognizes the following components:
`ExecutionOutput {     outcome     executionReceipt     evidenceReferences     trustResult     policyDecisions     diagnostics } `
Every component must be deterministic or explicitly classified as operational/non-constitutional.

M08 shall not introduce an incomplete placeholder output while claiming the Runtime contract is complete.

# 13. Outcome

The wedge currently exposes verification outcome semantics through:
`verified unverified rejected `
The mapping between:
`evidence state + policy decisions + Runtime execution state `
and:
`Outcome `
shall be explicit and deterministic.

No AMS may invent outcome precedence.

This mapping is included in **G-0807**.

# 14. TrustResult

CAW-006 exposes:
`trustStatus:     definite     probable     possible     uncertain     speculative `
M08 must establish the Runtime-side `TrustResult` semantics before M09 is allowed to invent a mapping.

G-0806 shall define:

- `TrustResult` structure;

- evidence-to-trust semantics;

- policy-to-trust semantics;

- Outcome-to-trust semantics;

- deterministic mapping to CAW-006 `trustStatus`;

- hash participation;

- replay comparison semantics.

No M09 implementation may independently invent the trust mapping.

# 15. Policy Evaluation Contract

M08 shall integrate policy evaluation without creating an unrestricted general-purpose policy engine.

The wedge policy surface must remain minimal.

G-0807 shall define:

- `PolicyContext`;

- applicable policy selection;

- `PolicyDecision`;

- `EvaluatorResult`;

- evaluation ordering;

- policy precedence;

- inactive-policy handling;

- unsupported-policy handling;

- fail-closed behavior;

- Outcome mapping;

- `decisionSummary` derivation;

- temporal-policy handling;

- execution-budget interaction.

Policy semantics are constitutional behavior and may not be invented by an AMS implementation agent.

# 16. Multiple Applicable Policies

The current receipt surface contains a singular:
`policyVersion `
while the Active Constitutional View may contain multiple applicable policies.

This ambiguity is explicitly unresolved.

G-0815 shall determine the semantics of `policyVersion`.

Possible representations may include:

- primary policy version;

- policy-set version;

- ACV policy snapshot version;

- deterministic digest of applicable policy identities and versions;

- another Council-approved representation.

No implementation agent may select one silently.

# 17. `decisionSummary`

`decisionSummary` must be deterministic, bounded, and canonically constructed.

Free-form operational prose shall not be introduced into constitutional receipt material.

G-0816 shall define:

- derivation from `PolicyDecision[]`;

- deterministic ordering;

- bounded representation;

- error representation;

- canonical serialization;

- hash inclusion;

- relationship to CAW-008 `decision_summary`;

- relationship between domain representation and persistence representation.

CAW-008 currently represents `decision_summary` as `jsonb`; this must be reconciled with the Runtime contract before receipt persistence is authorized.

# 18. Diagnostics

Diagnostics are divided into two classes.

## 18.1 Constitutional Diagnostics

These are part of `ExecutionOutput`.

They must be:

- deterministic;

- bounded;

- canonically serialized;

- independent of ambient host state;

- free of secrets;

- free of ambient timestamps;

- free of stack traces unless their representation is explicitly deterministic.

## 18.2 Operational Diagnostics

Application and infrastructure may maintain operational:

- logs;

- traces;

- metrics;

- performance data.

These do not become constitutional hash material unless explicitly authorized.

G-0817 shall determine:

- constitutional diagnostic fields;

- operational diagnostic fields;

- canonical representation;

- `outputHash` participation;

- `deterministicHash` participation.

# 19. Cryptographic Hash Domains

M08 shall not permit ad-hoc hash construction.

The final specification under G-0809 shall establish:

- hash algorithm;

- byte encoding;

- canonical serializer;

- exact input domain;

- field inclusion/exclusion;

- nested object ordering;

- collection ordering;

- treatment of absent/null values;

- relationship between evidence digests and `evidenceHash`;

- anti-circularity rules.

The relevant domains are:
`inputHash outputHash evidenceHash deterministicHash `
A receipt must never hash itself recursively.

The constitutional envelope must therefore distinguish the hashed execution payload from envelope metadata.

A candidate architecture for Council resolution is:
`ExecutionOutput Payload         │         ▼ Canonical Serialization         │         ▼ deterministicHash         │         ▼ ExecutionReceipt Envelope `
This diagram is a design candidate, not a ratified cryptographic rule.

G-0809 controls the final construction.

# 20. Execution Identity

The following identities must not be conflated:
`Execution Identity Receipt Identity Operational Trace Identity `
The current `executionId` and `receiptId` semantics require explicit Council determination.

G-0803 governs `receiptId`.

G-0814 governs `executionId`.

G-0814 shall determine:

- source;

- explicit-input versus derived identity;

- deterministic versus operational uniqueness;

- relationship to CEngS observability requirements;

- hash participation;

- replay semantics;

- relationship between execution and receipt correlation.

No random UUID or ambient timestamp may be introduced into constitutional hashing without explicit authorization.

# 21. Execution Budget

The Runtime must terminate deterministically.

Hardware-dependent measures such as:
`CPU cycles milliseconds host memory allocation `
must not define constitutional execution budget semantics.

G-0813 shall establish deterministic semantic accounting.

The candidate semantic model is a **Resolution Step Limit**, in which budget consumption is tied to explicit constitutional operations such as:

- constitutional node traversal;

- policy evaluation;

- cryptographic signature verification;

- other Council-approved semantic operations.

The exact decrement rules remain gated.

Budget exhaustion shall be:
`deterministic explicit fail-closed replay-stable `
No unbounded graph traversal or policy evaluation loop may be introduced while budget semantics remain unresolved.

# 22. M04 Nine-Stage Pipeline Mapping

M08 shall complete the existing M04 pipeline rather than bypass it.

The mapping to M08 responsibilities shall be established under G-0812.

At minimum:

M04 Stage

M08 Concern

Admission

Execution Context / input validation

Bundle Discovery

Deterministic dependency discovery state

Bundle Verification

Evidence/bundle integrity

Dependency Resolution

Constitutional dependency graph

Compatibility Validation

Applicable constitutional compatibility

ACV Activation

Active Constitutional View

Resolution Graph Construction

Deterministic graph

Active Execution

Policy/evaluation semantics

Receipt Generation

ExecutionOutput / ExecutionReceipt

The existing Stage 9 deferred behavior must not silently bypass constitutionally required receipt generation once M08 becomes active.

No second pipeline may be created.

# 23. Error Semantics

M08 Runtime errors shall satisfy CEngS-001 §7.

Every failure shall produce, at minimum:
`Error Code Reason Execution Stage Constitutional Reference Recovery Guidance `
The existing `PipelineError` / `PipelineResult` contracts shall be reused where sufficient.

If insufficient, the required extension must be explicitly authorized.

Failures shall be:

- deterministic;

- explicit;

- stage-attributed;

- fail-closed;

- replayable.

Failure paths are constitutional execution results and must therefore be included in replay verification.

# 24. Application-Layer Deterministic Assembly

Application-layer retrieval may be asynchronous.

However, asynchronous retrieval order must never determine constitutional collection ordering.

Before invoking Runtime, the Application layer shall construct an `ExecutionRequest` whose logically equivalent collections have deterministic ordering.

Therefore:
`parallel retrieval       ↓ deterministic assembly       ↓ canonical Runtime input       ↓ pure execution `
is permitted.
`parallel retrieval       ↓ arrival-order-dependent Runtime input `
is prohibited.

# 25. Receipt Persistence

The Runtime shall never persist receipts.

Receipt persistence, if authorized, occurs outside:
`packages/runtime `
through the Application/Repository/Infrastructure boundary.

G-0810 shall determine whether M08:

### Option A

Materializes the receipt only.

### Option B

Materializes and persists the receipt through an authorized external persistence mechanism.

If Option B is selected, persistence must receive an explicit task or AMS scope authorization.

It may not be silently added to AMS-0803.

CAW-008 currently defines an append-only `execution_receipts` persistence surface, but persistence ownership remains a separate question from Runtime materialization.

# 26. M08 / M12 Replay Boundary

M08 shall establish deterministic replay correctness at the functional pipeline level.

M12 owns replay hardening and the 10,000-run CI replay gate.

CAW-011 explicitly assigns:
`IT-1204 — CI integration — 10,000-run replay gate `
to M12.

Therefore CAW-012 worked examples referring to 10,000-run replay shall not override the M08/M12 boundary.

M08 replay shall include:

- successful executions;

- rejected executions;

- unverified executions;

- explicit failure paths;

- repeated isolated invocations;

- canonicalization permutations where applicable;

- equivalent property-order variants;

- stable collection-order normalization.

# 27. Administrative Synchronization

Before AMS implementation authority is issued, the following synchronization shall be completed.

### Required

- [ ] Commit M07 closure evidence verbatim.

- [ ] Correct CAW-008 adapter-location documentation defect.

- [ ] Update CAW-000 current milestone/status pointer.

- [ ] Synchronize CAW-011 milestone/task statuses with closure evidence.

- [ ] Correct or annotate the reconnaissance's conflicting IT-080x task table.

- [ ] Formally address the CAW-011 logical dependency defect under G-0811.

- [ ] Refresh, reaffirm, or formally extend OPEN-001 beyond its stated M06 validity limitation.

- [ ] Annotate CAW-012 worked examples where they conflict with M08 scope, M12 replay ownership, or unresolved M08 gates.

- [ ] Confirm M08 artifact is stored under an M08-scoped path.

The M08 reconnaissance's alternate IT-080x naming is evidence from reconnaissance and is not authoritative over CAW-011. The official CAW-011 titles remain controlling unless amended.

# 28. Normative Corpus Discipline

The M08 reconnaissance records repository evidence separately from documents that could not be verified in the repository.

For M08 engineering execution, the active implementation authority shall be the ratified CEngS corpus and active CAW corpus unless the Council formally designates additional documents.

Council-supplied documents may inform deliberation without automatically becoming repository implementation evidence.

No implementation agent may treat a draft or externally supplied document as binding merely because it was provided for Council review.

G-0805 shall confirm the normative corpus applicable to M08.

# 29. M08 Non-Goals

M08 does not authorize:

- new public API endpoints;

- API-layer product contracts;

- Edge Worker changes;

- Verified Product Experience work;

- UI implementation;

- production deployment changes;

- M12-scale replay infrastructure;

- M13 performance baselines;

- M14 compliance closure;

- M15 wedge-completion work;

- Runtime persistence;

- unrestricted policy-engine expansion;

- multi-wedge architecture;

- multi-tenant architecture.

M09–M15 retain their own milestone authority under CAW-005/CAW-011. CAW-005 defines M08 as the Runtime pipeline milestone and M12 separately as deterministic replay at scale.

# 30. Implementation Authorization Boundary

No implementation mandate may be issued from this PREP alone.

Every AMS mandate shall:

1. identify the exact CAW-011 task;

2. identify the applicable M08-PREP sections;

3. identify applicable Council Gates;

4. explicitly preserve unresolved gates;

5. define its evidence requirements;

6. define its test requirements;

7. require fail-closed behavior where applicable;

8. prohibit unauthorized contract expansion.

Each implementation agent shall produce a Context Receipt before implementation in accordance with CEngS-003 §5.

Each implementation PR shall satisfy CL-001 and the applicable CEngS-102 review/release gates.

A mandate must stop and escalate if implementation requires a decision that remains Council-gated.

# 31. M08 Verification Baseline

M08 verification shall cover:

## Runtime Purity

- zero I/O;

- zero network access;

- zero database access;

- zero object-store access;

- no ambient clock;

- no ambient randomness;

- synchronous deterministic execution.

The reconnaissance found no production usage of `Date.now()`, `new Date()`, `Math.random()`, or `crypto.randomUUID()` inside the Runtime source, which establishes the current purity baseline.

## Determinism

Identical:
`ExecutionRequest + ExecutionContext + constitutional inputs `
must yield identical:
`ExecutionOutput + constitutional hashes + receipt material `
subject to the final Council-approved hash domains.

## Evidence

- independent Runtime verification;

- invalid evidence rejection;

- hash mismatch rejection;

- deterministic evidence references.

## Policy

- deterministic evaluation;

- explicit policy selection;

- fail-closed unsupported policy handling;

- deterministic Outcome;

- deterministic TrustResult.

## Receipt

- complete field population;

- canonical serialization;

- hash-domain correctness;

- anti-circularity;

- deterministic replay.

## Errors

- deterministic failure classification;

- stage attribution;

- constitutional reference;

- recovery guidance.

# 32. Acceptance Boundary

M08 may be declared complete only when:

1. the M04 nine-stage pipeline is correctly completed under G-0812;

2. ACV loading is integrated;

3. Evidence loading is integrated;

4. Runtime evidence verification is independent;

5. policy evaluation is integrated according to the ratified wedge policy semantics;

6. deterministic Outcome semantics are implemented;

7. deterministic TrustResult semantics are implemented;

8. complete `ExecutionOutput` is produced;

9. ExecutionReceipt materialization is deterministic;

10. approved hash domains are implemented;

11. receipt/output circularity is eliminated;

12. execution and receipt identity semantics are implemented;

13. budget enforcement is deterministic;

14. failure paths are deterministic and fail-closed;

15. functional replay passes;

16. applicable CI, architecture, purity, boundary, unit, integration, and replay gates pass;

17. applicable CEngS-101/102 requirements pass;

18. all Council Gates applicable to the implemented AMS scope are resolved;

19. required administrative synchronization is complete.

The 10,000-run replay gate remains a M12 responsibility.

# 33. Council Gate Register

Gate

Subject

Status

**G-0801**

OPEN-001-A temporal semantics; requires OPEN-001 refresh/reaffirmation

OPEN

**G-0802**

`executionTime` semantics and hash treatment

OPEN

**G-0803**

Deterministic `receiptId` semantics

OPEN

**G-0804**

Complete deterministic receipt field set

OPEN

**G-0805**

Normative corpus authority for M08

OPEN

**G-0806**

`ExecutionOutput` / `TrustResult` semantics and CAW-006 mapping

OPEN

**G-0807**

Minimal wedge policy catalog, evaluation semantics, and Outcome mapping

OPEN

**G-0808**

`ExecutionContext` sufficiency, including identity, entropy, versions, temporal input

OPEN

**G-0809**

Hash-domain and anti-circularity specification

OPEN

**G-0810**

Receipt persistence scope

OPEN

**G-0811**

CAW-011 dependency correction / interim interpretation

OPEN

**G-0812**

M04 nine-stage pipeline completion mapping

OPEN

**G-0813**

Deterministic execution-budget semantics

OPEN

**G-0814**

`executionId` semantics and observability/determinism relationship

OPEN

**G-0815**

`policyVersion` semantics for multiple policies

OPEN

**G-0816**

`decisionSummary` canonical construction

OPEN

**G-0817**

Diagnostics canonicalization and hash inclusion

OPEN

# 34. Advisory Gate Resolution Order

The following is advisory rather than itself constitutional authority.

A preferred sequence is:
`G-0805 — Normative corpus authority         ↓ G-0811 — CAW-011 dependency correction         ↓ G-0812 — M04 pipeline mapping         ↓ G-0808 — ExecutionContext sufficiency         ↓ G-0807 — Policy catalog and evaluation semantics         ↓ G-0801 — Temporal semantics         ↓ G-0806 — ExecutionOutput / TrustResult         ↓ G-0809 — Hash domains         ↓ G-0802 — executionTime         ↓ G-0803 — receiptId         ↓ G-0814 — executionId         ↓ G-0815 — policyVersion         ↓ G-0816 — decisionSummary         ↓ G-0817 — diagnostics         ↓ G-0810 — receipt persistence         ↓ G-0813 — execution budget         ↓ G-0804 — complete receipt field set `
Gates may be resolved concurrently where dependencies permit.

No gate may be considered resolved merely because an implementation convention has been selected.

# 35. PREP Ratification vs. Implementation Authorization

M08-PREP may be ratified as the constitutional design baseline while Council Gates remain open.

Ratification means:

- the preparation architecture is accepted;

- the Runtime/Application boundary is accepted;

- the M04 pipeline completion approach is accepted;

- the Council Gate register is accepted;

- the administrative synchronization requirements are accepted;

- the distinction between preparation and implementation authority is accepted.

Ratification does **not** mean:

- OPEN-001-A is resolved;

- temporal semantics are resolved;

- hash domains are resolved;

- policy semantics are resolved;

- TrustResult semantics are resolved;

- ExecutionContext sufficiency is resolved;

- receipt identity semantics are resolved;

- AMS-0801–AMS-0805 are authorized;

- production Runtime code may be modified.

Implementation authorization for any AMS requires:

1. ratified M08-PREP;

2. resolution of every applicable Council Gate;

3. completion of required administrative synchronization;

4. a separate AMS implementation mandate.

# 36. Required AMS Sequence After Gate Resolution

The CAW-011 task identifiers remain unchanged.

Subject to G-0811, the implementation dependency shall be interpreted as:
`AMS-0801 ─┐           ├──► AMS-0804 ───► AMS-0803 ───► AMS-0805 AMS-0802 ─┘ `
The official CAW-011 task titles remain:
`AMS-0801     Wire ACV loading into pipeline  AMS-0802     Wire Evidence loading into pipeline  AMS-0803     Generate Execution Receipt (full)  AMS-0804     Policy evaluation integration  AMS-0805     Pipeline replay tests `
No title or identifier is changed by this PREP.

# 37. Final Council Disposition

## Recommended Disposition

`RATIFY M08-PREP v1.2 AS THE M08 CONSTITUTIONAL DESIGN BASELINE AFTER THE DOCUMENTARY CORRECTIONS IDENTIFIED IN THIS VERSION.  MAINTAIN WITHHOLDING ON AMS-0801 THROUGH AMS-0805. `
The following administrative corrections are part of the final preparation state:

- M08-scoped artifact path;

- CAW-012 worked-example annotation;

- G-0805 priority clarification;

- expanded G-0809;

- complete Runtime/policy/pipeline contract inventory;

- expanded G-0808;

- Context Receipt and CL-001 requirements;

- CI acceptance requirement;

- explicit receipt-persistence task authorization;

- operational-observability boundary.

# 38. Constitutional Status

**M08-PREP v1.2**

**Disposition:** PROPOSED FOR RATIFICATION **Design Baseline:** YES, upon ratification **Implementation Authority:** NO **AMS-0801:** WITHHELD **AMS-0802:** WITHHELD **AMS-0803:** WITHHELD **AMS-0804:** WITHHELD **AMS-0805:** WITHHELD

**Council Gates:** G-0801–G-0817 OPEN

**Next governance action:** Ratify this PREP as the M08 design baseline and begin Council Gate resolution, preferably beginning with G-0805 and G-0811.

# 39. Source Boundary

This PREP distinguishes:
`Constitutional authority         ≠ Repository evidence         ≠ Council deliberation         ≠ Implementation convention `
Where repository reconnaissance identified a discrepancy, this document records the discrepancy rather than silently resolving it.

CAW-011 remains authoritative for M08 task identifiers and titles. The M08 reconnaissance remains evidence describing the observed repository state and discrepancies.

M08 therefore proceeds under the constitutional principle:

**No implementation agent may invent constitutional semantics to close an unresolved Council Gate.**
