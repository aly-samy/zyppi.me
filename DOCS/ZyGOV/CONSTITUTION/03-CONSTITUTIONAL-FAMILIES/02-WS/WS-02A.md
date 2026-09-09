# WS-02A — MASTER ENTITY REGISTRY BLUEPRINT
---|---
---|---
Version: | 1.0 (LOCKED)
 Status: | APPROVED
 Document Type: | Constitutional Architecture Blueprint
 Predecessors: | WS-01 Constitutional Ontology + WS-01A Constitutional Amendment A-001, ZRM v1.1, North Star v4.x
 Successor: | WS-03 Entity Taxonomy & Hierarchy Validation

## DOCUMENT PURPOSE
`WS-02A` establishes the constitutional blueprint governing all entities within the Zyppi Reality Graph.

**This document defines:**
- Registry architecture
- Entity clustering model
- Constitutional cardinality rules
- Governance standards
- Metadata dimensions
- Identity lifecycle rules
- Canonical relationship framework
- Registry population constraints

`WS-02A` does not contain the complete entity population.

The full Master Entity Registry will only be generated after `WS-03` validates hierarchy, inheritance, cluster ownership, and relationship structures.

## SECTION 01 — CONSTITUTIONAL PRINCIPLES
The Zyppi Reality Graph is built on the principle that every entity must ultimately trace back to a constitutional primitive.

No entity may exist without constitutional lineage.

**The Reality Graph exists to answer:**
- Who?
- What?
- Where?
- How?
- Why?
- Under Which Context?
- What Happened?
- What Changed?
- What Is Now True?

### **Constitutional flow:**
```
Actor
↓
Surface
↓
Touchpoint
↓
Interaction
↓
Identity
↓
Referent
↓
Intent
↓
Intent Contract
↓
System
↓
Transaction
↓
Outcome
↓
Reality
```

This flow is the foundational execution path of the Zyppi ontology.

## SECTION 02 — REGISTRY METADATA MODEL
Every registry entity must contain the following metadata.

Field  | Description
---|---
Entity ID | Permanent canonical identifier
Entity Name | Human-readable entity name
Cluster | Primary cluster assignment
Tier | Constitutional importance
Origin | Origin of concept
Parent Entity | Immediate parent
Root Primitive | Constitutional root
Description | Canonical definition
Strategic Programs | Program tags
Status | Governance lifecycle
Created Date | Registry timestamp
Modified Date | Registry timestamp


## SECTION 03 — FOUR METADATA DIMENSIONS
The following dimensions are independent and must never be conflated.

### 3.1 Tier
Represents constitutional importance.

Tier  | Meaning
---|---
T0 | Constitutional Primitive
T1 | Core Domain Entity
T2 | Supporting Domain Entity
T3 | Implementation / Specialized Entity

Tier determines strategic importance.

Tier does not determine origin.

### 3.2 Origin
Represents where the concept comes from.

Origin | Meaning
---|---
Constitutional | Defined by Zyppi ontology
Industry | Defined by industry standards
Product | Defined by Zyppi implementation
External | Defined by third-party systems

**Examples:**
- Actor → Constitutional
- GTIN → Industry
- Routing Engine → Product
- CRM → External

### 3.3 Strategic Programs
Programs are metadata tags.

Programs do not create hierarchy.

Programs do not influence inheritance.

Programs may evolve without changing ontology.

**Approved program vocabulary:**
- Core
- Helios
- Atlas
- Mercury

No other program values are permitted without governance approval.

### 3.4 Status
Represents governance lifecycle.

**Allowed values:**
- Draft
- Active
- Deprecated

**Restrictions:**
- T0 entities cannot be deprecated.
- T1 constitutional entities cannot be deprecated.

Deprecation of constitutional entities requires constitutional amendment.

## SECTION 04 — REGISTRY CLUSTERS
The registry contains fifteen constitutional clusters.

Cluster | Name | Purpose
---|---|---
CL-01 | Actor | Participants in reality
CL-02 | Surface | Interaction environments
CL-03 | Touchpoint | Access mechanisms
CL-04 | Identity | Persistent representations
CL-05 | Referent | Things being represented
CL-06 | Intent | Desired outcomes
CL-07 | Intent Contract | Fulfillment rules
CL-08 | System | Execution mechanisms
CL-09 | Transaction | Executions
CL-10 | Outcome | State changes
CL-11 | Intelligence | Context, understanding, and Interaction
CL-12 | Strategic Categories | Cross-cutting authority concepts
CL-13 | Temporal | Time governance
CL-14 | Compliance & Standards | External standards
CL-15 | Schema & Semantic Web | AI and crawler governance

### Target registry size:
360–400 entities

### Under CL-12 (Strategic Categories):

> **Note:** Strategic Categories are leaf‑node strategic framing concepts and never own entities. They are overlays, not inheritance roots.

### Under CL-14 (Compliance & Standards):

> **Note:** Compliance entities must follow the formal inheritance hierarchy defined in WS‑03 Section 04 (Compliance Cluster Hierarchy Requirement). No flat structures are permitted.


## SECTION 05 — CLUSTER ROOTS
Cluster | Root
---|---
Actor | Actor
Surface | Surface
Touchpoint | Touchpoint
Identity | Identity
Referent | Referent
Intent | Intent
Intent Contract | Intent Contract
System | System
Transaction | Transaction
Outcome | Outcome
Intelligence | Intelligence
Strategic Categories | Cross-Cutting
Temporal | Cross-Cutting
Compliance | External Authority
Schema | Semantic Governance


## SECTION 06 — INTELLIGENCE CLUSTER STRUCTURE
### Constitutional Amendment A-001
- **Approved.**

The Intelligence cluster uses a single-root model.
```
Intelligence (T0)
│
├── Context (T1)
├── Trust (T1)
├── Confidence (T1)
├── Resolution (T1)
├── Signal (T1)
├── Event (T1)
|      └── Interaction (T1)
├── Fact (T1)
├── Attribution (T1)
├── Journey (T1)
├── Reality Graph (T1)
│
├── Cohort (T2)
├── Segment (T2)
├── Funnel (T2)
├── Pattern (T2)
├── Anomaly (T2)
├── Insight (T2)
├── Recommendation (T2)
├── Forecast (T2)
```
This replaces the previous multi-root model.

### Purpose:
- eliminate inheritance ambiguity
- improve ontology consistency
- improve AI reasoning
- simplify WS-03 validation

## SECTION 07 — CAMPAIGN CLASSIFICATION
Campaign is no longer classified as a Referent.

**Campaign is classified as:**
```
Intelligence
└── Context
    └── Campaign
```
**Campaign answers:**
- Under which context?

**not**
- What thing?

Campaign Identity remains a valid Identity subtype.

**Therefore:**

`Campaign ≠ Campaign Identity`

These are separate concepts.

## SECTION 08 — INTERACTION ENTITY
Interaction is a first-class constitutional entity.

### Position:
```
Touchpoint
↓
Interaction
↓
Identity
```
### Interaction represents:
- Scan
- Tap
- Click
- Open
- Invocation
- Contact Event

Signals are generated from Interactions.
Attribution begins at Interaction.

Interaction becomes a mandatory entity in WS-03.

## SECTION 09 — CONSTITUTIONAL CARDINALITY RULES

Rule | Relationship | Cardinality
---|---|---
CR-001 | Actor initiates Interactions through Touchpoints | 1:N
CR-002 | Surface hosts Touchpoint | 1:N
CR-003 | Touchpoint generates Interaction | 1:N
CR-004 | Interaction resolves Identity | 1:1
CR-005 | Identity represents Referent | 0..1
CR-006 | Referent may possess Identities | 0..N
CR-007 | Identity governed by Intent Contracts | 0..N
CR-008 | Intent Contracts govern Transactions | 1..N
CR-009 | Transactions produce Outcomes | 1..N
CR-010 | Outcomes generate Signals | 1..N
CR-011 | Signals generate Intelligence | N..N


## SECTION 10 — IDENTITY LIFECYCLE
Identity lifecycle is independent of Referent lifecycle.

### **Allowed states:**
```
Draft
↓
Pre-Commissioned
↓
Assigned
↓
Active
↓
Suspended
↓
Decommissioned
↓
Archived
```
**Rules:**
- Identity may exist before Referent.
- Identity may outlive Referent.
- Identity may exist permanently for audit purposes.
- Decommissioned identities are read-only.
- Archived identities are read-only.
- No new transactions may be initiated against Decommissioned or Archived identities.

**This supports:**
- GS1 Serialization
- Digital Product Passports
- Supply Chain Traceability
- Historical Audit Trails

## SECTION 11 — DARK ASSET RESOLUTION
- Dark Asset is not an entity.
- Dark Asset is not a cluster.
- Dark Asset is not a registry row.

### Definition:
> Referent with zero associated identities.

**Representation:**
```
Referent
+
Identity Count = 0
```
Dark Asset is a state.

Dark Asset is an analytics classification.

Dark Asset is not part of the ontology.

`Open Question Q5 is CLOSED.`

## SECTION 12 — REALITY GOVERNANCE
Reality remains a constitutional primitive.

Reality does not require its own cluster.

**Reason:**
Reality is the accumulated state
produced by Outcomes.

Reality is not a domain.

Reality is not a business object.

Reality is the aggregate state of the graph itself.

**Therefore:**

`Reality = Constitutional Primitive`

`Reality Cluster = Not Required`

`Reality Graph = Intelligence Entity`


## SECTION 13 — GOVERNANCE RULES
ID | Rule
---|---
GR-001 | Surface ≠ Touchpoint
GR-002 | Identity ≠ Referent
GR-003 | One Entity = One Canonical ID
GR-004 | AI Agent = Actor
GR-005 | LLM / MCP Server = System
GR-006 | Intent is First-Class
GR-007 | Relationships Are Typed
GR-008 | Temporal Fields Mandatory
GR-009 | ZE IDs Are Permanent
GR-010 | Product SaaS Concepts Excluded
GR-011 | Programs Are Metadata Only
GR-012 | T0 Entities Cannot Be Deprecated
GR-013 | T1 Constitutional Entities Cannot Be Deprecated
GR-014 | Compliance Entities Are External Authorities
GR-015 | Dual-Role Concepts Use One Canonical Entity
GR-016 | No Circular Inheritance
GR-017 | No Orphan Entities
GR-018 | Every Entity Must Trace To A Constitutional Primitive


## SECTION 14 — REGISTRY POPULATION CONSTRAINTS
`WS-03` and `WS-02B` must satisfy all of the following:
- No orphan entities
- No duplicate entities
- No circular inheritance
- No conflicting parents
- No duplicated strategic concepts
- Single canonical ownership
- One primary cluster per entity
- Typed relationships only
- Constitutional traceability for every entity
- Program tags cannot alter hierarchy

## SECTION 15 — DEFERRED QUESTIONS
The following topics are intentionally deferred:
- Strategic Category splitting
- Compliance sub-clustering
- Future Program expansion
- Dark Asset commercialization
- Additional Intelligence specializations

These do not block WS-03.

## WS-02A LOCK CERTIFICATION
---|---
Document: | WS-02A Master Entity Registry Blueprint
 Version: | 1.0
 Status: | **LOCKED**

### Locked Components
- Constitutional cluster model
- Metadata model
- Tier model
- Origin model
- Strategic Program model
- Status model
- Intelligence architecture
- Campaign classification
- Interaction entity
- Identity cardinality
- Identity lifecycle
- Governance rules
- Reality governance
- Dark Asset resolution

### Registry Capacity
-  360–400 entities

### Canonical Identifier Format

`ZE-[CLUSTER]-[SEQUENCE]`

## Constitutional Amendment
WS-01 Amendment A-001
(Intelligence Single-Root Model)
> **APPROVED**

----

### Next Workstream
WS-03 — Entity Taxonomy & Hierarchy Validation
**Objective:**
- Validate parent-child inheritance
- Validate cluster ownership
- Validate canonical placement
- Validate relationship structures
- Validate Interaction integration
- Validate Intelligence hierarchy
- Validate dual-role entity strategy

----

`WS-02A v1.0` is hereby **LOCKED** and becomes the governing blueprint for all subsequent registry work.

