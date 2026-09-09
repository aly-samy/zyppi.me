# WS-05A — Master Registry Population Charter
```
**Version:**        1.0 (Ratified)
**Status:**         RATIFIED
**Document Type:**  Constitutional Charter
**Prerequisite:**   WS-03F ratified, closure conditions confirmed complete
**Successor:**      WS-05B — Master Registry Population Plan
```
---

## 1. Purpose

WS-05A establishes the constitutional charter governing admission of entities into the Zyppi Master Registry. It defines the principles, invariants, admission discipline, and completion criteria that all subsequent population work must satisfy.

WS-05A does not perform population. It does not define execution order, batching, or scheduling. It defines the rules any population plan must obey.

## 2. Scope

**In scope:** 

Guiding principles, admission discipline, population invariants, the freeze gate, completion criteria.

**Out of scope:** 

The dependency DAG, execution batches, bootstrap sequencing, cluster-by-cluster admission guides, and validation tooling. These belong to WS-05B (Population Plan), WS-05C (Population Rules), and WS-05D (Population Validation) respectively, where they can evolve without requiring amendment to this charter.

## 3. Constitutional Prerequisites

WS-05A operates under the frozen constitutional foundation established by CFR-001. 

Population SHALL NOT begin until WS-03F is ratified and its closure conditions — SR-001 supersession entries and corpus annotation of superseded clauses — are independently confirmed complete. 

A registry built against unsynchronized source text inherits that inconsistency permanently, per the permanence of ZE identifiers under Principle 4.9.

## 4. Guiding Principles

- 4.1 **Reality First** — Registry reflects reality, not convenience.
- 4.2 **Canonical Before Convenient** — Canonical definitions precede derived or optimized forms.
- 4.3 **Deterministic Population** — Two independent teams given identical inputs produce identical results.
- 4.4 **Dependency-Ordered Population** — Dependencies must be satisfied before dependent entities are admitted.
- 4.5 **Zero Ontology Expansion** — No new constitutional concepts are introduced during population.
- 4.6 **Registry Minimalism** — Admit only what is constitutionally required.
- 4.7 **Population Before Inference** — Entities exist before interpretations about them are generated.
- 4.8 **Identity Before Relationship** — Relationships reference only existing identities.
- 4.9 **Every ZE Identifier Is Permanent** — Once minted, never changed.
- 4.10 **Failed Admission Is Preferable to Incorrect Admission** — Reject ambiguous cases.

## 5. Admission Discipline

### **AD-001 — Conservative Admission.** 
Nothing enters the Master Registry because it exists. An object SHALL be admitted only if all of the following hold:

- a constitutional owner (cluster) exists
- a canonical identity format (ZE prefix) exists
- a governing schema exists
- a canonical lifecycle set exists (§6, INV-005)
- uniqueness can be proven
- an admission authority is established

Absent any one condition, the object remains outside the registry.

### **AD-002 — Exclusion of Non-Constitutional Concepts.** 
Implementation concepts, derived views, UI abstractions, temporary objects, graph projections, execution state, cache objects, workflow state, and convenience models SHALL NOT be admitted unless explicitly ratified. This exclusion governs generic file, upload, or UI-document objects. It does not extend to Document Identity (CL-04, per WS-03A.2 §9, subtypes Certificate, License, Contract, Policy, Report), which remains a ratified constitutional concept and is unaffected by this rule.

### **AD-003 — The Permanence Test.** 
Every population decision SHALL answer an objective binary: 
> is this object a ratified constitutional entity as defined by the seventeen-cluster architecture and the foundational ontology? 

If the answer is not unequivocally yes, the object does not enter WS-05. ZE identifiers are not granted based on system utility; they are granted based on constitutional reality.

## 6. Population Invariants

### **INV-001 — Dependency-Driven Population.** 
Population SHALL be dependency-driven. 

No Registry Entity SHALL be admitted before every constitutional dependency required for its valid admission — including owning cluster, referenced canonical registries, required predicates, required patterns, and mandatory referenced entities — already exists, or is admitted within the same validated atomic batch.

#### *Atomic Batch Constraint:* 
an "atomic batch" exception is strictly limited to constitutional structures where sequential admission is mathematically impossible due to genuine mutual dependency. No such case is currently known to exist within the ratified corpus — inverse predicates (RC-013) are a single stored relationship with two semantic labels, not two co-dependent objects, and do not qualify. 

Any future invocation of this exception SHALL carry an explicit burden of proof demonstrating mathematical impossibility of sequential admission. 

Parent-child or hierarchical dependencies SHALL NOT be bundled into simultaneous atomic batches to bypass prior-existence requirements.

#### **INV-002 — Registry Before Relationship.** 
Population SHALL proceed: Identity before Relationship before Inference before Graph Projection. No relationship SHALL reference an object that does not already exist or is not co-admitted in the same atomic batch under INV-001.

### **INV-003 — Population/Instantiation Separation.** 
Population creates canonical registry definitions. Instantiation creates runtime records. 

These are distinct operations and SHALL NOT be conflated. 

A dependency computed from runtime relationships is not valid evidence for a population-order dependency. 

**Example:** 

CL-06 Intent's twelve canonical types require no prerequisite for registry population, even though a runtime Intent instance requires an Actor, Identity, and Transaction context.

*Schema/Runtime Firewall:* during Master Registry Population, canonical entity definitions SHALL NOT contain hardcoded references to runtime entity instances (e.g., a canonical Contract template SHALL NOT require a specific runtime CL-04 identity_id for admission). 

Relationships defined during Population SHALL be constrained strictly to type-to-type or schema-to-schema dependencies.

### **INV-004 — Deterministic Population.** 
Two independent teams given identical inputs SHALL produce identical ZE identifiers and identical canonical records. 

No subjective modeling decision SHALL be required during admission.

### **INV-005 — Canonical Lifecycle Set.** 
An entity's lifecycle governance SHALL be expressed as one or more named Lifecycle Tracks, not a single lifecycle field. Each track SHALL declare: name, owner, state machine, transition rules, and authority. 

Where multiple tracks exist on one record, they SHALL operate independently except where a constitutional clause establishes an explicit constraint between them (example: WS-03F-003's Identity Lifecycle and Authority Lifecycle tracks on a single CL-04 record, constrained such that the Authority Lifecycle SHALL NOT be Active while the Identity Lifecycle is Decommissioned or Archived).

### **INV-006 — Infrastructure/Derived Registry Split (CL-17).** 
CL-17 Graph Core SHALL be treated as two functional categories for admission purposes. Infrastructure Registries (Predicate Registry, Pattern Registry, Trust Registry) are prerequisites and participate in dependency validation under INV-001. Derived Registries (Reality Claim Index, Graph Snapshot Registry, Structural Edge Index) are computed outputs, rebuildable from authoritative sources, and SHALL NOT gate admission of any other entity.

### **INV-007 — CL-12 Reference-Driven Admission.** 
A CL-12 Strategic entity SHALL NOT be admitted until every canonical entity referenced by its Primary Conceptual Home (per TR-006) already exists in the registry. 

CL-12 SHALL NOT be assigned a fixed population level; its admission point is determined entity-by-entity by this rule.

### **INV-008 — Registry Immutability.** 
Once admitted, the constitutional identity of a Registry Entity SHALL NOT be replaced or repurposed.

**Permitted:** lifecycle transitions, metadata enrichment, evidence additions, relationship additions.

**Forbidden:** changing constitutional owner, changing ZE identifier, changing canonical meaning, changing entity type.

Where constitutional identity must change, the correct operation is supersession, not mutation: the prior entity transitions to a superseded state and a new entity receives a new ZE identifier. 

This invariant does not introduce a new supersession mechanism — it generalizes the existing per-cluster mechanisms already established (WS-04B §6 for Reified Relationships, CD-TXN-06 for Transactions) into a single registry-wide rule.

This invariant does not apply where a cluster's own constitutional rules already prohibit any identity change for that entity type. 

CL-11 Events are immutable and explicitly prohibited from supersession (CD-EVT-03 through CD-EVT-05); for Events, no constitutional-identity-change scenario can arise, and INV-008 is satisfied vacuously.

### **INV-009 — Independent Process Carve-Out. **
No ratified or future WS-05 document SHALL define an independent execution pipeline, terminology set, or vocabulary for an operation already governed by another ratified constitutional document.

This restriction does NOT prohibit a document from defining a genuinely independent process deliberately designed to avoid shared state or execution logic where such independence is required for correctness, security, or constitutional verification.

Any document invoking this carve-out SHALL: 
- (1) explicitly identify the existing process from which it diverges; 
- (2) explain why shared state or shared execution logic would compromise the protected property; 
- (3) provide a constitutional justification artifact supporting the independence requirement.

**Example:** 

WS-05D Validation intentionally diverges from WS-05B Population because a validator reusing compiler state cannot reliably detect compiler defects (Self-Trust Exploit).

This invariant governs identical operations only and SHALL NOT prohibit independent processes justified under the above conditions.

## 7. Freeze Gate

Upon commencement of WS-05B execution, the following SHALL be frozen: cluster ownership, entity admission criteria, canonical identity format, registry prefixes, Predicate Registry, and Pattern Registry.

No ad-hoc modification is permitted. 

Corrections required after freeze SHALL proceed exclusively through the existing Constitutional Amendment process (the CA / WS amendment workflow already established and exercised in CA-001 through CA-005 and WS-03F). 

No separate emergency mechanism is created by this charter; none is required, since the existing process already provides a working, bounded path for correction.

## 8. Completion Criteria

Population is complete when every constitutional entity satisfies all of the following:

- has a canonical owner
- has a canonical schema
- has a canonical lifecycle set (INV-005)
- has a canonical ZE prefix
- has a canonical admission authority
- passes uniqueness validation
- passes dependency validation (INV-001)
- passes referential integrity validation
- passes constitutional consistency validation
- has zero unresolved blockers

## 9. Out-of-Scope Definitions

The following are explicitly excluded from this charter and deferred to the named successor workstream:

- Dependency DAG and specific cluster-to-cluster ordering → WS-05B
- Execution batching and bootstrap strategy → WS-05B
- Cluster-by-cluster admission guides → WS-05C
- Validation tooling and consistency checks → WS-05D
- Certification and sign-off procedure → WS-05E

## 10. Authorization

Ratification of WS-05A authorizes commencement of WS-05B drafting. It does not, by itself, authorize population execution — that authorization is granted only upon WS-05B's own ratification and confirmation that the Section 3 prerequisites remain satisfied.

## Lock Certification

| Element | Status |
|---|---|
| Constitutional scope boundary (charter vs. implementation) | 🔒 LOCKED |
| Guiding Principles (4.1–4.10) | 🔒 LOCKED |
| Admission Discipline (AD-001–AD-003) | 🔒 LOCKED |
| Population Invariants (INV-001–INV-009) | 🔒 LOCKED |
| Freeze Gate | 🔒 LOCKED |
| Completion Criteria | 🔒 LOCKED |
| Out-of-Scope Definitions | 🔒 LOCKED |

**Status: RATIFIED**
**Next Authorized Workstream: WS-05B — Master Registry Population Plan**
