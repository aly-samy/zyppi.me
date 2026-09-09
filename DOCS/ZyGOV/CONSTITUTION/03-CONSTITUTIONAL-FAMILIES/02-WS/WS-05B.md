# WS-05B — Master Registry Population Plan
---|---
---|---
Version: | 1.0
 Status: | RATIFIED
 Document Type: | Constitutional Execution Plan

**Prerequisites**
- WS-05A — Master Registry Population Charter (Ratified)
- WS-03F — Registry Population Hardening Amendment Package (Ratified)
- CFR-001 Constitutional Freeze
- Successor Workstreams
- WS-05C — Cluster Admission Rules
- WS-05D — Population Validation & Certification
- WS-05E — Population Completion & Sign-Off

# 1. Purpose
WS-05B defines the constitutional execution plan for constructing the Zyppi Master Registry.

It specifies the compiler execution model, execution phases, processing units, dependency resolution strategy, commit discipline, rollback behavior, and certification flow.

WS-05B does not define constitutional principles (WS-05A), cluster-specific admission rules (WS-05C), validation implementation (WS-05D), or certification governance (WS-05E).

# 2. Constitutional Compiler
WS-05B SHALL be implemented as a deterministic constitutional compiler whose execution is fully reproducible from the same ratified constitutional corpus.

Execution outcomes SHALL NOT depend upon:
- runtime state
- processing order
- thread scheduling
- machine architecture
- execution timing
- system clocks
- implementation-specific behavior

The compiler SHALL always produce identical canonical outputs when provided identical constitutional inputs.

The compiler compiles constitutional reality into executable canonical registry state.

# 3. Compiler Inputs
The compiler input SHALL consist exclusively of the ratified constitutional corpus.

## Inputs include:
- Constitutional Workstreams
- Constitutional Amendments
- Ratified Registry Definitions
- Supersession Register (SR-001)
- Canonical Schemas
- Canonical Predicate Registry
- Canonical Pattern Registry
- Canonical Trust Registry

No implementation artifacts SHALL be considered compiler input.

# 4. Compiler Execution Model
````
Ratified Constitutional Corpus
        │
        ▼
Phase 0
Constitution Verification
        │
        ▼
Phase 1
Active Constitutional View
        │
        ▼
Phase 2
Canonical Discovery
        │
        ▼
Phase 3
Dependency Resolution
        │
        ▼
Phase 4
Population
(Population Units → Commit Batches)
        │
        ▼
Phase 5
Certification
        │
        ▼
Master Registry
````

Each phase SHALL complete successfully before the next phase begins.

No phase SHALL partially execute.

# 5. Phase 0 — Constitution Verification
Population SHALL NOT begin until constitutional verification succeeds.

The compiler SHALL verify:
- WS-05A ratification
- WS-03F ratification
- SR-001 synchronization
- corpus annotation completion
- all WS-03F supersessions reflected within SR-001

Verification SHALL be performed using a cryptographic manifest representing the approved constitutional corpus.

If verification fails:
````
Compiler Status = ABORT

Error Code = 0x00F1
````

Population SHALL NOT begin.


# 6. Phase 1 — Active Constitutional View
The compiler SHALL construct an Active Constitutional View before discovery begins.

The Active Constitutional View SHALL:
- apply all supersessions
- remove deprecated concepts
- remove superseded clauses
- expose only currently active constitutional definitions

Population SHALL NEVER operate directly on raw constitutional documents.

Population SHALL always operate on the Active Constitutional View.

# 7. Phase 2 — Canonical Discovery
The compiler SHALL discover every admissible canonical registry object.

Discovery SHALL include:
- Registry Entities
- Reified Relationships
- Schemas
- Lifecycle Tracks
- Predicates
- Patterns
- Trust Definitions

Discovery SHALL NOT perform admission.

Discovery SHALL produce candidate Population Units only.

# 8. Phase 3 — Dependency Resolution
The compiler SHALL construct a constitutional dependency graph.

Dependency resolution SHALL determine execution order.

Execution SHALL respect:
- owning cluster dependencies
- schema dependencies
- predicate dependencies
- pattern dependencies
- mandatory reference dependencies

Ordering SHALL be dependency-driven.

No registry object SHALL execute before its required dependencies.

## 8.1 Deterministic Ordering
Dependency ordering SHALL be deterministic.

Where multiple independent Population Units occupy the same dependency depth, ordering SHALL be resolved by:
1. dependency depth
2. SHA-256 hash of canonical source text

No implementation-defined ordering SHALL be permitted.

# 9. Population Unit
A Population Unit is the smallest independently admissible compiler object.
A Population Unit SHALL produce exactly one canonical registry object.

A canonical registry object SHALL be one of:
- one ZE-prefixed Registry Entity

or
- one UUIDv7 Reified Relationship

Each Population Unit SHALL include:
- canonical owner
- canonical schema
- lifecycle track(s)
- canonical references
- validation state
- admission authority
- compiler evidence

Population Units SHALL execute independently unless explicitly admitted under the Atomic Batch Exception defined by WS-05A INV-001.

# 10. Commit Batch
A Commit Batch is an ordered collection of one or more Population Units.

**Default cardinality:**
````
1 Commit Batch
=
1 Population Unit
````
Expansion beyond one Population Unit SHALL require satisfaction of WS-05A INV-001 Atomic Batch conditions.

Commit Batches SHALL exist only where sequential admission is mathematically impossible due to proven mutual dependency.

Developer convenience SHALL NEVER justify batch expansion.

# 11. Commit & Rollback Strategy
Execution SHALL follow:
````
Validate

↓

Commit Batch

↓

Success
    Commit

Failure
    Full Rollback
````
Partial commits SHALL NOT exist.

Rollback scope SHALL always equal Commit Batch scope.

Rollback SHALL restore the registry to its exact pre-batch state.

Execution SHALL be resumable from the next unapplied Commit Batch.

# 12. Relationship Population
Relationship population SHALL follow entity population.

Reified Relationships SHALL participate in the same Population Unit, Commit Batch, validation, and rollback model as Registry Entities.

Relationships SHALL satisfy:
- authority validation
- evidence validation
- predicate validation
- pattern validation
- referential integrity validation
before admission.

# 13. UUID Population Rule
Reified Relationship UUIDv7 values SHALL be generated entirely deterministically from canonical relationship content — both the timestamp component and the entropy component. Neither component SHALL be derived from runtime randomness or wall-clock time.

The canonical seed for deterministic generation SHALL be: `source_entity_id + relationship_type + target_entity_id + schema_version`, deterministically hashed and mapped into the UUIDv7 bit layout. This preserves UUIDv7 structural validity while guaranteeing that two independent compiler executions, given identical inputs, produce bit-identical relationship_id values.

Runtime system clocks and any non-deterministic entropy source SHALL be reserved exclusively for Instantiation, never for Population. Fixing only the timestamp component is insufficient to satisfy INV-004 and SHALL NOT be considered compliant.

# 14. Population / Instantiation Separation
Population creates canonical registry definitions.

Instantiation creates runtime records.
These operations SHALL remain permanently separated.

Canonical registry definitions SHALL NOT contain hardcoded runtime instance references.

Population relationships SHALL reference only:
- canonical types
- canonical schemas
- canonical definitions

Runtime entity instances SHALL NEVER be prerequisites for canonical population.

# 15. Compiler Outputs
The compiler SHALL produce:
## Primary Output
### Master Registry
containing canonical Registry Entities and Reified Relationships.

## Derived Outputs
Derived outputs SHALL map exclusively to WS-05A INV-006.
Compiler Output | Permitted Destination
---|---
Reality Graph Projection | Reality Claim Index
Historical Projection | Graph Snapshot Registry
Structural Projection | Structural Edge Index

No additional derived constitutional outputs SHALL exist.

Caches, temporary projections, UI models, and search abstractions SHALL NOT become constitutional artifacts.

# 16. Certification
Certification SHALL execute WS-05A Section 8 Completion Criteria directly.

Certification SHALL NOT redefine or paraphrase those criteria.

Population SHALL be certified complete only when every registry object satisfies WS-05A Section 8 without exception.

# 17. Failure Handling
Compiler failures SHALL terminate execution immediately.

Failed Population Units SHALL NOT be admitted.

Failed Commit Batches SHALL NOT partially commit.

Population SHALL resume only after the underlying constitutional or validation failure has been corrected.

Failed admission is constitutionally preferable to incorrect admission.

# 18. Handover
Successful completion of WS-05B authorizes:
- WS-05C — Cluster Admission Rules
- WS-05D — Population Validation & Certification
- WS-05E — Final Registry Certification

WS-05B authorizes planning and execution architecture only.

It does not independently certify Master Registry completeness.

# 19. Final Disposition
WS-05B establishes the deterministic execution plan that transforms the ratified constitutional corpus into the canonical Master Registry.

The compiler SHALL operate as a reproducible constitutional compilation process.

Every registry object SHALL be admitted through dependency-driven execution, deterministic validation, complete rollback safety, and constitutional certification.

No ontology expansion, implementation convenience, or runtime behavior SHALL alter compiler output.

---|---
---|---
Status: | ✅ RATIFIED
Next Authorized Workstream: | WS-05C — Cluster Admission Rules