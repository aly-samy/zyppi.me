# WS-02 — Core Entity Registry Specification
---|---
---|---
Version: | 2.0
 Status: | LOCKED
 Owner: | Zyppi Architecture Council
 Dependencies: | WS-01 Reality Model Foundation
 Next Dependency: | WS-03 Taxonomy & Hierarchy Matrix

## 1. Purpose
The purpose of WS-02 is to establish the constitutional framework governing all entities within the Zyppi ecosystem.

**This document defines:**
- What constitutes an entity.
- How entities are classified.
- How entities are identified.
- How entities relate to the Zyppi Reality Model (ZRM).
- How future entities may be introduced.
- How ontology consistency is maintained over time.

`WS-02` does not attempt to define every entity in the platform.

Instead, it establishes the governing structure under which all future entities must operate.

The complete list of entities is maintained separately in:
`WS-02A — Master Entity Registry.`

## 2. Scope
### WS-02 governs:
- Knowledge Graph entities
- Reality Graph entities
- Content entities
- Product entities
- GS1 entities
- Digital Product Passport entities
- AI-discoverability entities
- Semantic web entities
- Compliance entities
- 
### WS-02 does not govern:
- SaaS UI components
- Billing structures
- Internal implementation classes
- Database tables
- Technical code artifacts

## 3. Foundational Principle
**Everything in Zyppi must ultimately answer:**
> ## **Who** did **what**, using **which** identity, to access **which** referent, on **which** surface, under **which** campaign, through **which** system, resulting in **which** outcome?

**This is known as:**

> ## The Golden Question.

Every entity introduced into the registry must contribute directly or indirectly to answering this question.

## 4. Constitutional Primitives
The Zyppi Reality Model is built on eleven constitutional primitives.

These primitives are immutable.

No future workspace may add, remove, rename, merge, or split them without constitutional review.

### Primitive 01 — Actor
An entity capable of initiating, participating in, observing, or influencing reality.

**Examples:**
- Consumer
- Brand Owner
- AI Agent
- Regulator

### Primitive 02 — Surface
The physical or digital environment where interaction occurs.

**Examples:**
- Product Package
- Mobile Screen
- Retail Shelf

### Primitive 03 — Touchpoint
A mechanism through which an actor accesses an identity.

**Examples:**
- QR Code
- NFC Payload
- Deep Link

### Primitive 04 — Identity
The persistent digital representation of something.

**Examples:**
- Product Identity
- Location Identity
- Digital Product Passport

### Primitive 05 — Referent
The real-world or digital thing represented by an identity.

**Examples:**
- Product
- Location
- Asset
- Document

### Primitive 06 — Intent
A desired future outcome expressed by an actor.

**Examples:**
- Verify
- Buy
- Learn
- Register

### Primitive 07 — Intent Contract
A machine-readable declaration describing how an intent may be fulfilled.

**Examples:**
- Verification Contract
- Purchase Contract
- Registration Contract

### Primitive 08 — Campaign
A time-bound organizational structure grouping interactions, identities, touchpoints, and outcomes toward a common objective.

**Examples:**
- Product Launch
- Loyalty Program
- Sustainability Initiative

Campaign is a core domain concept.
Campaign is not an Identity.
Campaign is not a Referent.
Campaign is not a Context object.

### Primitive 09 — System
A mechanism capable of executing transactions.

**Examples:**
- Intent Resolution Engine
- Routing Engine
- ERP
- CRM

### Primitive 10 — Transaction
An execution event attempting to fulfill an intent.

**Examples:**
- Verification Transaction
- Registration Transaction
- Purchase Transaction

### Primitive 11 — Outcome
A state change produced by a transaction.

**Examples:**
- Verified
- Registered
- Authenticated
- Rejected

## 5. Reality Definition
Reality is not an entity.
Reality is not a primitive.
Reality has no identifier.

Reality is defined as:

> The accumulated state of all entities, relationships, transactions, outcomes, and temporal events across the graph.

Reality is the derived graph state of the Zyppi Reality Graph and is not represented as a registry entity or cluster.

Reality emerges from the graph.

It is never stored as a single record.

## 6. Reality Graph Definition
The Reality Graph is the canonical relationship structure used to preserve:
- Entity relationships
- State changes
- Transaction history
- Temporal evolution

Reality Graph is a Tier 1 Core Domain Concept.

It is not a product feature.

## 7. Entity Tier System
Every entity must belong to one of four tiers.

### Tier 0 — Constitutional Primitives
The foundational abstractions of the ZRM.

**Examples:**
- Actor
- Surface
- Identity

### Tier 1 — Core Domain Concepts
Universally recognizable concepts defining a market or industry.

**Examples:**
- Digital Product Passport
- Digital Twin
- GS1 Digital Link
- Product Identity

### Tier 2 — Product Concepts
Zyppi-specific implementations.

**Examples:**
- Intent Resolution Engine
- Smart Link
- Verification Contract

### Tier 3 — Contextual & External Concepts
External standards, regulations, frameworks, metadata, and ecosystem components.

**Examples:**
- GTIN
- EPCIS
- ESPR
- JSON-LD

## 8. Registry Clusters
Entities are organized into fifteen registry clusters.

---|---
---|---
Cluster 01 — Actor Registry | Code: **ACT**
Cluster 02 — Surface Registry| Code: **SRF**
Cluster 03 — Touchpoint Registry | Code: **TPT**
Cluster 04 — Identity Registry | Code: **IDT**
Cluster 05 — Referent Registry | Code: **REF**
Cluster 06 — Intent Registry | Code: **INT**
Cluster 07 — Intent Contract Registry | Code: **ICT**
Cluster 08 — System Registry | Code: **SYS**
Cluster 09 — Transaction Registry | Code: **TXN**
Cluster 10 — Outcome Registry | Code: **OUT**
Cluster 11 — Intelligence Registry | Code: **ILG**
Cluster 12 — Strategic Category Registry | Code: **STR**
Cluster 13 — Temporal Registry | Code: **TMP**
Cluster 14 — Compliance & Standards Registry | Code: **CMP**
Cluster 15 — Schema & Semantic Registry | Code: **SCH**

## 9. Canonical ID Standard
Every entity must possess a permanent identifier.
### Format:

`ZE-[CLUSTER]-[SEQUENCE]`

**Examples:**
- ZE-ACT-001
- ZE-IDT-001
- ZE-TPT-001
- ZE-CMP-001

Identifiers are immutable.

Identifiers may never be reused.

Deleted entities remain reserved forever.

## 10. Naming Convention
### Actor

`Noun`

**Example:**
- Consumer
- Brand Owner
- AI Agent

### Touchpoint

`Noun`

**Example:**
- QR Code
- NFC Payload
- Deep Link

### Identity

`Noun + Identity`

**Example:**
- Product Identity
- Location Identity
- Asset Identity

### Intent

`Verb`

**Example:**
- Verify
- Buy
- Register
- Learn

### Contract

`Verb Root + Contract`

**Example:**
- Verification Contract
- Registration Contract
- Purchase Contract

### Transaction

`Verb Root + Transaction`

**Example:**
- Verification Transaction
- Purchase Transaction

### Outcome

`Past Participle`

**Example:**
- Verified
- Purchased
- Authenticated
- Rejected

## 11. Digital Twin Policy
Digital Twin is a Tier 1 Core Domain Concept.
### Approved subtypes:
- Product Digital Twin
- Asset Digital Twin
- Process Digital Twin
- Location Digital Twin

Future subtypes require council approval.

## 12. Dual-Role Entity Policy
Some concepts may exist in multiple architectural contexts.

**Examples:**
- Digital Product Passport
- GS1 Digital Link
- Intent Contract

**Rule:**
A concept may appear in multiple registries only when each appearance serves a distinct semantic purpose.

Cross-references must be explicitly documented.

Duplicate meanings are prohibited.

## 13. Intelligence Layer Policy
Intelligence is not a constitutional primitive.

**Intelligence is derived from:**
- Signals
- Transactions
- Outcomes
- Relationships
- Temporal events

**Examples:**
- Attribution
- Trust Score
- Pattern
- Anomaly
- Recommendation

## 14. Entity Admission Rules

**A new entity may be admitted only if:**
1. It answers part of the Golden Question.
2. It cannot be represented as an attribute.
3. It has durable meaning.
4. It is likely to exist for multiple years.
5. It participates in relationships.
6. It provides SEO, commercial, AI, operational, or compliance value.

Failure of any condition requires rejection.

## 15. Governance Rules
### New entities require:
- Definition
- Parent cluster
- Tier assignment
- Relationship mapping
- Justification
- Unique identifier

Changes to Tier 0 primitives require Constitutional Review.

All other changes require Architecture Council approval.

## 16. Locked Decisions
The following decisions are permanently locked:
- ✓ Eleven constitutional primitives
- ✓ Campaign promoted to core domain concept
- ✓ Reality is not an entity
- ✓ Reality has no identifier
- ✓ Reality Graph is Tier 1
- ✓ Fifteen registry clusters
- ✓ Four-tier classification model
- ✓ ZE canonical identifier format
- ✓ Digital Twin Tier 1 classification
- ✓ Digital Twin subtype model
- ✓ Intelligence is derived, not primitive
- ✓ Temporal registry established
- ✓ Compliance registry established
- ✓ Schema registry established

## 17. Exit Criteria
**`WS-02` is considered complete when:**
1. Registry architecture is frozen.
2. Tier model is frozen.
3. Cluster model is frozen.
4. Naming standards are frozen.
5. Identifier standards are frozen.
6. Governance rules are frozen.
7. Constitutional primitives are frozen.

----

**Upon completion, work proceeds to:**
_WS-03 — Taxonomy & Hierarchy Matrix._
Status: **LOCKED**.