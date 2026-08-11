# AMS-0804 — Final Transport Contract Resolution & Implementation Mandate

## M08 — Runtime Verification Pipeline

**Task ID:** IT-0804 — Policy Evaluation Integration **Activity:** Policy Evaluation Transport & Execution Integration **Status:** **RATIFIED — IMPLEMENTATION AUTHORIZED** **Governing Authority:** G-0805, G-0807, G-0813, G-0815 **Target Agent:** Jules — AI Software Engineer **Issuing Authority:** Zyppi Constitutional Council

## 1. Council Disposition

The Council has reviewed and closed the **AMS-0804 Transport Boundary Trace**.

The physical transport boundary is now resolved.

**AMS-0804 is UNPAUSED.**

Jules is authorized to implement the ratified transport and execution contracts described in this mandate.

No further architectural discovery or Council roundtable is required unless implementation reveals a direct contradiction with an existing ratified constitutional artifact.

The governing principle is:

**Upstream resolves constitutional meaning. Runtime materializes and executes that resolved meaning. Runtime never discovers missing policy dependencies.**

# 2. Final Constitutional Decisions

## Decision 1 — Topology Authority

**Upstream Constitutional Resolution is authoritative.**

The Application/upstream layer owns:

- policy applicability;

- dependency meaning;

- dependency resolution;

- construction of the explicit dependency topology.

The Runtime SHALL NOT:

- infer dependencies from policy content;

- infer dependencies from Policy IDs;

- infer dependencies from metadata;

- invent missing edges;

- silently substitute lexical ordering for missing topology.

## Decision 2 — CAW-011 Topology

The Council explicitly ratifies the CAW-011 policy universe as:

**`E = ∅`**

CAW-011 is therefore an explicitly edgeless policy graph.

This is a Council determination, not an inference from repository absence.

Accordingly:
`resolvedPolicyGraph.edges = [] `
is the authoritative CAW-011 representation.

### Critical distinction

The following states are different:
`resolvedPolicyGraph exists edges = []         ↓ E = ∅ `
versus:
`resolvedPolicyGraph absent         ↓ Topology unavailable / structural failure `
The Runtime MUST NOT interpret an absent graph as an empty graph.

# 3. Transport Owner

The authoritative Application → Runtime transport owner is:

**`ExecutionRequest`**

`ActiveConstitutionalView` SHALL NOT be modified.

`PolicyRecord` SHALL NOT be modified to contain dependency relationships.

`ExecutionContext` SHALL remain an execution-parameter container.

`PolicyContext` SHALL remain evaluation context and SHALL NOT become a topology carrier.

No parallel top-level pipeline parameter or duplicate execution bundle is authorized.

# 4. Authorized Contract Materialization

Jules SHALL introduce the minimum necessary immutable structural contracts.

The exact placement (`@zyppi/domain` vs `@zyppi/contracts`) SHALL follow the repository's existing dependency direction and ownership conventions. Do not introduce a new package solely for these contracts.

## 4.1 PolicyDependencyEdge

`export interface PolicyDependencyEdge {   readonly dependeeId: string;   readonly dependentId: string; } `
Semantics:

- `dependeeId` is the policy that must precede the dependent policy.

- `dependentId` is the policy that depends upon the dependee.

No additional semantic fields are authorized unless existing constitutional contracts require them.

## 4.2 ResolvedPolicyGraph

`export interface ResolvedPolicyGraph {   readonly edges: readonly PolicyDependencyEdge[]; } `
The graph is explicitly present in the execution request.

An empty `edges` array represents:
`E = ∅ `
No boolean such as:
`isExplicitlyEdgeless `
is authorized.

The graph object itself is the structural presence indicator.

## 4.3 ExecutionRequest Amendment

Amend the existing `ExecutionRequest` with exactly the necessary topology field:
`export interface ExecutionRequest {   readonly requestId: string;   readonly identity: IdentityRecord;   readonly activeConstitutionalView: ActiveConstitutionalView;   readonly evidenceBundle: EvidenceBundle;   readonly policyContext: PolicyContext;   readonly executionContext: ExecutionContext;   readonly resolvedPolicyGraph: ResolvedPolicyGraph; } `
The existing fields SHALL remain semantically unchanged.

## 4.4 ExecutionSequence

Stage 7 SHALL produce an immutable execution sequence consumed by Stage 8.

Use the repository's existing representation conventions. The conceptual contract is:
`export interface ExecutionSequence {   readonly orderedPolicies: readonly PolicyRecord[]; } `
If existing runtime contracts establish a more appropriate policy-ID-based representation, Jules may use that representation instead, provided that:

1. the sequence is immutable;

2. it contains only policies authorized by the ACV;

3. Stage 8 receives the sequence directly;

4. Stage 8 does not reconstruct or reorder it.

Do not introduce duplicate policy representations unnecessarily.

# 5. Execution Flow

The resulting constitutional flow SHALL be:
`APPLICATION / UPSTREAM         │         │ resolves policy topology         ▼ ExecutionRequest  ├── ActiveConstitutionalView  ├── EvidenceBundle  ├── PolicyContext  ├── ExecutionContext  └── ResolvedPolicyGraph           └── edges: []               for CAW-011         │         ▼ STAGE 1 — Admission         │         │ validates structural request         ▼ STAGE 4 — Dependency Resolution         │         │ consumes upstream-resolved meaning         ▼ STAGE 7 — Resolution Graph Materialization         │         ├── validate node references         ├── validate edge integrity         ├── detect cycles         ├── establish deterministic order         └── emit ExecutionSequence         │         ▼ STAGE 8 — Active Policy Execution         │         ├── consume ExecutionSequence         ├── evaluate policies         └── emit PolicyDecision[] `
The exact existing nine-stage pipeline architecture SHALL be preserved.

Do not restructure the pipeline merely to implement this mandate.

# 6. Stage 7 Authority

Stage 7 is responsible for **materialization**, not semantic discovery.

Stage 7 SHALL:

1. receive the explicit upstream topology;

2. verify that every referenced policy exists in `ActiveConstitutionalView.applicablePolicies`;

3. verify edge referential integrity;

4. reject invalid policy references;

5. detect cycles;

6. produce a deterministic topological execution sequence;

7. apply the existing constitutional deterministic tie-break rule where multiple nodes are simultaneously eligible;

8. return an immutable sequence.

Stage 7 SHALL NOT:

- invent edges;

- inspect policy text to discover dependencies;

- reinterpret policy semantics;

- treat missing topology as edgeless;

- modify the ACV;

- modify PolicyRecord;

- consume Stage 8 policy-evaluation budget.

For CAW-011, where `edges = []`, Stage 7 shall materialize the complete policy set into the deterministic sequence using the already-ratified deterministic ordering rule.

# 7. Stage 8 Authority

Stage 8 is an execution-only stage.

Stage 8 SHALL:

1. consume the immutable `ExecutionSequence`;

2. evaluate policies against the existing `PolicyContext`;

3. consume the existing policy-evaluation budget according to the constitutional budget rules;

4. emit the existing policy-decision representation.

Stage 8 SHALL NOT:

- discover dependencies;

- inspect graph edges;

- perform topological sorting;

- validate graph integrity;

- reconstruct the execution sequence;

- apply a second ordering algorithm.

Stage 8 must treat the sequence supplied by Stage 7 as authoritative.

# 8. Budget Boundary

Graph operations are not policy evaluation.

Therefore:

### Stage 7

The following SHALL NOT consume the Stage 8 atomic policy-evaluation budget:

- edge validation;

- referential-integrity checking;

- cycle detection;

- topological sorting;

- deterministic tie-breaking;

- sequence materialization.

### Stage 8

Policy evaluation SHALL consume the existing budget according to the already-ratified execution rules.

Do not introduce a new budget model.

Do not alter the meaning of the existing `ExecutionContext.budget` without explicit Council authorization.

# 9. Validation and Serialization

The new contract must participate in the repository's existing constitutional validation and serialization mechanisms.

Jules SHALL:

- extend `ExecutionRequest` validation;

- validate `ResolvedPolicyGraph`;

- validate every `PolicyDependencyEdge`;

- preserve non-coercion;

- preserve non-mutation;

- preserve deterministic serialization;

- preserve existing canonical key ordering;

- add negative tests for absent/malformed topology;

- add explicit tests for `edges: []`.

The validator MUST distinguish:
`graph present + edges [] `
from:
`graph absent `
The first is valid for CAW-011.

The second is a structural failure.

# 10. Application-Layer Assembly

The Application orchestrator SHALL explicitly construct the topology.

For CAW-011:
`resolvedPolicyGraph: {   edges: [], } `
This must be present in the `ExecutionRequest`.

Do not rely on:
`undefined `
or omission to represent an edgeless graph.

Do not infer the empty graph from:
`applicablePolicies.length > 0 `
or from absence of dependency records.

The explicit empty array is the authoritative representation.

# 11. Existing Contracts That Must Remain Unchanged

The following are explicitly protected:

### `ActiveConstitutionalView`

UNCHANGED.

It remains the Registry-derived constitutional snapshot.

### `PolicyRecord`

UNCHANGED.

No dependency fields shall be added to individual policy records.

### `PolicyContext`

UNCHANGED in semantic role.

It remains evaluation context.

### `ExecutionContext`

UNCHANGED in semantic role.

It remains execution-specific operational context.

No topology shall be inserted into it merely for convenience.

# 12. No Silent Defaults

The following implementations are expressly prohibited:
`edges ?? [] `
when used to silently convert missing topology into an empty graph.

Also prohibited:
`policies.sort((a, b) => a.policyId.localeCompare(b.policyId)) `
as an implicit substitute for an absent dependency graph.

Lexicographical ordering may be used **only as the already-authorized deterministic tie-break within a valid graph materialization**, including the explicitly edgeless CAW-011 graph.

It must never be used to manufacture topology.

# 13. Required Tests

Jules SHALL add or update tests covering at minimum:

### Structural

- valid `ResolvedPolicyGraph`;

- valid empty `edges: []`;

- missing `resolvedPolicyGraph`;

- malformed graph;

- malformed edge;

- unknown `dependeeId`;

- unknown `dependentId`.

### Graph

- valid single dependency;

- valid multi-node DAG;

- deterministic ordering;

- multiple simultaneously eligible nodes;

- cycle rejection;

- self-dependency rejection.

### CAW-011

- explicit `edges: []`;

- all applicable policies become eligible;

- deterministic policy ordering;

- no dependency discovery;

- no policy-evaluation budget consumed by Stage 7.

### Stage Boundary

- Stage 7 produces the authoritative sequence;

- Stage 8 consumes that sequence;

- Stage 8 does not reorder it;

- Stage 8 does not inspect or reconstruct dependency edges.

### Regression

All existing repository validation, build, boundary, purity, and test suites must remain passing.

# 14. Implementation Constraints

Jules is authorized to modify only what is necessary to implement this decision.

### Authorized

- topology contract;

- `ExecutionRequest`;

- validators;

- serializers;

- Application request assembly;

- Stage 7 implementation;

- Stage 8 integration;

- relevant tests;

- narrowly necessary supporting types.

### Not authorized

- redesigning the Registry schema;

- modifying `PolicyRecord` semantics;

- modifying ACV semantics;

- creating a new package without necessity;

- introducing a new execution envelope;

- introducing topology inference;

- changing constitutional budget semantics;

- changing unrelated M08 stages;

- changing governing documents;

- resolving unrelated repository issues under this task.

If an existing contract prevents implementation of this mandate, STOP at that specific conflict and report the evidence rather than redesigning around it.

# 15. Verification Requirements

Upon implementation, Jules SHALL provide a verification report containing:

1. changed files;

2. contract changes;

3. Stage 7 behavior;

4. Stage 8 behavior;

5. CAW-011 explicit `edges: []` evidence;

6. validation behavior for missing topology;

7. cycle and referential-integrity tests;

8. budget-boundary evidence;

9. complete test/build/lint results;

10. final commit SHA.

The report must distinguish:

- repository facts;

- implementation facts;

- verification results;

- architectural interpretation.

# 16. Completion Condition

AMS-0804 implementation is complete only when:

- the topology contract is materialized;

- `ExecutionRequest` transports it explicitly;

- CAW-011 transports `edges: []`;

- Stage 7 validates and materializes the execution sequence;

- Stage 8 consumes that sequence without rediscovery;

- no prohibited semantic defaults exist;

- all required tests pass;

- existing constitutional boundaries remain intact;

- Jules submits the verification report.

# 17. Final Council Decision

**AMS-0804 — TRANSPORT BOUNDARY: CLOSED**

Decision

Ratified Result

Topology Authority

Upstream Constitutional Resolution

Runtime Discovery

**PROHIBITED**

Transport Owner

`ExecutionRequest`

Graph Contract

`ResolvedPolicyGraph`

Edge Contract

`PolicyDependencyEdge`

ACV

**UNCHANGED**

PolicyRecord

**UNCHANGED**

CAW-011

**Explicitly Edgeless — `E = ∅`**

Empty Graph Representation

`edges: []`

Missing Graph

**Structural Failure**

Stage 7

Validate + Materialize

Stage 8

Execute Sequence Only

Stage 7 Evaluation Budget

**0**

Stage 8 Budget

Existing constitutional rule

Boolean Edgeless Flag

**PROHIBITED**

Silent `undefined → []`

**PROHIBITED**

Lexical Ordering

Tie-break only, never topology inference

Implementation Status

**AUTHORIZED**

## DIRECTIVE TO JULES

**Proceed with implementation of AMS-0804 exactly within the boundaries of this mandate.**

Do not reopen the architectural decision.

Do not infer additional constitutional semantics.

Do not modify ACV or PolicyRecord.

Do not create redundant representations.

Implement, test, verify, and return the evidence report.

**AMS-0804 is hereby UNPAUSED.**

**Issued by:** Zyppi Constitutional Council **Authority:** Chair, Zyppi Constitutional Council **Disposition:** **RATIFIED — IMPLEMENTATION AUTHORIZED**
