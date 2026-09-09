# WS-04B — Relationship Registry Architecture
---|---
---|---
Version: | 1.0
 Status: | RATIFIED & LOCKED
 Classification: | Constitutional Architecture
 Prerequisite: | WS-04A — Relationship Constitutional Framework

# 1. Purpose
This document defines the constitutional architecture governing the registration, storage, lifecycle, governance, and resolution of relationships within the Zyppi Reality Model (ZRM).

This workstream operationalizes the principles established in WS-04A and provides the authoritative implementation model for relationship management throughout the platform.

# 2. Constitutional Principles
## RP-006 — Governance Primacy
The Governance Layer SHALL be the authoritative source of truth for all Reified Relationships.

The Traversal Layer SHALL be a derived projection.

Any conflict SHALL be resolved in favor of the Governance Layer.

## RP-007 — Dual-Tier Relationship Architecture
Relationships SHALL exist in one of two constitutional tiers:
### Tier-1: Structural Edges
Topology-only relationships used for structural navigation and physical reality mapping.

### Tier-2: Reified Relationships
Governed relationships requiring auditability, evidence, lifecycle management, authority validation, or supersession.

# 3. Canonical Relationship Model
## Tier-1 Structural Edge
**Structural Edges SHALL:**
- Exist only within the Traversal Layer.
- Possess no UUID.
- Possess no lifecycle.
- Possess no supersession.
- Possess no governance record.
- Possess no evidence requirements.

**Identity SHALL be:**
````
(source_id, predicate_id, target_id)
````
**Examples:**
- Package **HOSTS** QR_Code
- Menu **CONTAINS** Menu_Item
- Table **DISPLAYS** QR_Code

## Tier-2 Reified Relationship
Reified Relationships SHALL:
- Possess immutable identity.
- Support evidence.
- Support lifecycle management.
- Support supersession.
- Maintain governance records.
- Support auditability.

**Examples:**
- Company **OWNS** Asset
- Manufacturer **CERTIFIES** Product
- Employee **EMPLOYED_BY** Organization

# 4. Relationship Identity Model
## Structural Edge Identity
Identity SHALL be:
````
(source_id, predicate_id, target_id)
````
Structural Edges SHALL NOT receive UUIDs.

## Reified Relationship Identity
Every Reified Relationship SHALL receive:
````
relationship_id : UUIDv7
````
**Requirements:**
- Globally unique
- Immutable
- Permanently assigned
- Never reused
- Not derived from relationship content

# 5. Relationship Lifecycle
Relationship mutation is constitutionally prohibited.

Changes SHALL occur through supersession only.

## Valid Relationship States
---|---
---|---
ACTIVE | Current authoritative relationship.
SUPERSEDED | Replaced by a newer relationship.
SUSPENDED | Temporarily inactive.
DISPUTED | Under formal challenge.
TERMINATED | Relationship ended without replacement.

# 6. Supersession Architecture
Supersession SHALL be metadata.

Supersession SHALL NOT be represented as a relationship.

**The following structure is mandatory:**
````
relationship_id
supersession_chain_id
supersedes_id
superseded_by_id
supersession_rationale
````

## Supersession Rules
- Supersession chains SHALL be linear.
- Branching chains are prohibited.
- Conflicting supersession claims SHALL create a Supersession Conflict requiring constitutional resolution.

# 7. RelationshipInstance Schema
## RelationshipInstance
````
relationship_id
source_entity_id
predicate_id
target_entity_id
status
created_at
created_by
valid_from
valid_to
supersession_chain_id
supersedes_id
superseded_by_id
supersession_rationale
supporting_transaction_ids[]
authority_reference
governance_metadata
````

# 8. Predicate Registry
##  **Ownership:**
- CL-17 Graph Core

## **Predicate Lifecycle**
- PROPOSED
- UNDER_REVIEW
- ACTIVE
- DEPRECATED
- RETIRED

## **Deprecation Requirements**
Every deprecated predicate SHALL define:
````
deprecated_in_favour_of
sunset_date
````

## Predicate Rules
- Predicates SHALL be immutable once ACTIVE.
- Predicates SHALL NOT be modified.
- Predicates SHALL be replaced through admission of new predicates.
- Historical usage SHALL remain valid indefinitely.

# 9. Relationship Pattern Registry
- Every relationship SHALL conform to an approved Pattern Registry entry.
- Relationships without approved patterns SHALL be rejected.

## Pattern Schema
````
pattern_id
source_cluster_type
predicate_id
target_cluster_type
constitutional_tier
evidence_required
authority_required
specificity_level
status
rationale
admitted_at
````
**constitutional_tier**
Allowed values:
- STRUCTURAL
- REIFIED

**evidence_required**
Allowed values:
- NONE
- RECOMMENDED
- MANDATORY

# 10. Active Relationship Index (ARI)
**Ownership:**
- CL-17 Graph Core
**Purpose:**
Current-state truth resolution.

## Resolution Rules
Current-state queries SHALL use ARI.

- Historical queries SHALL use:
- Relationship Registry
- Supersession Index

ARI updates SHALL occur atomically with relationship creation or supersession.

An out-of-sync ARI SHALL be considered a constitutional error.

# 11. Storage Architecture
## Governance Layer
Authoritative storage.

**Contains**:
- Reified Relationships
- Supersession metadata
- Evidence references
- Authority references

## Traversal Layer
Derived projection.

**Contains**:
### Structural Edges
Active Reified Relationship projections

The Traversal Layer SHALL be read-only.

The Traversal Layer SHALL NOT be authoritative.

# 12. Evidence Architecture
Evidence requirements SHALL be governed by Pattern Registry entries.

## Allowed Evidence Modes
- NONE
- RECOMMENDED
- MANDATORY

## Allowed Evidence Types
- Transaction
- Event
- Document
- Certificate
- External Credential
- Human Expert Rationale

## Human Expert Rationale Requirements
````
asserted_by
timestamp
authority_reference
````

## Confidence Rule
- Confidence values SHALL NOT be stored on Relationships.
- Confidence belongs exclusively to Intelligence Objects.

# 13. Structural Edge Index
Amendment A-001
Status: RATIFIED

CL-17 SHALL maintain a Structural Edge Index.
## Purpose:
- Existence validation
- Topology lookup
- Query acceleration

**The Structural Edge Index SHALL NOT:**
- Confer identity
- Confer lifecycle
- Confer supersession
- Confer governance
- Confer audit history
- Confer constitutional objecthood

The Structural Edge Index SHALL be rebuildable from authoritative sources.

Authoritative sources remain:
- Entity Definitions
- Pattern Registry

# 14. CL-17 Responsibilities
CL-17 SHALL own:
- Predicate Registry
- Relationship Pattern Registry
- Relationship Registry
- Active Relationship Index
- Supersession Index
- Graph Snapshot Registry
- Structural Edge Index

CL-17 SHALL NOT own:
- Entities
- Transactions
- Events
- Intelligence Objects
- Contracts
- Domain Data

# 15. Tenant Governance
Tenants MAY:
- Instantiate approved relationships
- Attach evidence
- Attach metadata
- Propose additions

Tenants SHALL NOT:
- Create predicates
- Modify predicates
- Create constitutional patterns
- Modify constitutional patterns

Ontology governance remains global.

# 16. Admission Workflow
All predicate and pattern admissions SHALL follow:
- Proposal
- Impact Analysis
- Constitutional Review
- Simulation
- Ratification
- Admission

## Predicate Admission
- Requires constitutional review.

## Reified Pattern Admission
- Requires constitutional review.

## Structural Pattern Admission
- Requires platform review and validation.

# 17. Constitutional Lock
WS-04B is hereby RATIFIED.

All decisions contained herein SHALL be considered constitutional architecture.

Modification requires a future constitutional amendment process.

###### Status: LOCKED.