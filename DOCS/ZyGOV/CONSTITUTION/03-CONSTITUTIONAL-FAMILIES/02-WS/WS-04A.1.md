# WS-04A.1
# Relationship Nature & Classification Framework

# Section 1 — Purpose
This workstream defines the constitutional nature of Relationships within the Zyppi Reality Graph and establishes the classification framework governing Structural Edges and Reified Relationships.

# Section 2 — Relationship Nature Immutability (RP-001)
The constitutional nature of a Relationship SHALL be immutable.

A Relationship classified as Structural SHALL remain Structural for its entire existence.

A Relationship classified as Reified SHALL remain Reified for its entire existence.

No constitutional mechanism exists for converting one type into the other.

# Section 3 — Relationship Classes
The platform recognizes exactly two constitutional relationship classes.

## Class A — Structural Edge
A Structural Edge represents topology.

Structural Edges describe composition, containment, membership, connectivity, hierarchy, or other topological facts.

### Structural Edges:
- Carry no independent identity.
- Carry no lifecycle state.
- Carry no authority metadata.
- Carry no governance metadata.
- Carry no evidence ownership.
- Carry no supersession chain.
- Cannot be externally referenced.

**Examples:**
- Product **CONTAINS** Ingredient
- Building **CONTAINS** Floor
- Floor **CONTAINS** Room
- Surface **HOSTS** Touchpoint


## Class B — Reified Relationship
A Reified Relationship represents a governed relationship requiring auditability.

### Reified Relationships:
- Possess independent identity.
- Carry lifecycle governance.
- Carry authority metadata.
- Support supersession.
- Support evidence indexing.
- Support provenance.
- Support auditability.

**Examples:**
- Organization **OWNS** Asset
- Venue **HOSTS** Event
- Identity **ASSIGNED_TO** Role
- Product **CERTIFIED_BY** Authority

# Section 4 — Relationship Classification Framework
## RP-004 — Entity-Type Pattern Resolution
Relationship classification SHALL be performed using canonical Entity Types.

### Pattern Structure:
````
(Source Entity Type, Relationship Type, Target Entity Type)
````

**Examples:**
````
(Product, CONTAINS, Ingredient)
````
````
(Organization, OWNS, Asset)
````
````
(Venue, HOSTS, Event)
````

Cluster-level classification is prohibited.

Attribute-qualified classification is prohibited.

### Pattern Registry
Every relationship pattern SHALL be registered.

**Required fields:**
````
pattern_id
source_entity_type
relationship_type
target_entity_type
classification
pattern_rationale
pattern_rationale
````

Every Pattern Registry entry SHALL include a rationale explaining the constitutional basis for its classification.

**Example:**

---|---
---|---
Pattern: | (Venue, HOSTS, Event)
Classification: |  Reified
Rationale: | Event hosting is temporal, contractual, and generates auditable obligations.

# Section 5 — Structural Edge Lifecycle Prohibition
## RP-005
Structural Edges SHALL NOT possess lifecycle state.

Structural Edges SHALL NOT contain:
````
status
valid_from
valid_to
supersedes
lifecycle_state
authority_state
````

Changes to topology SHALL be represented through graph versioning rather than lifecycle mutation.

Lifecycle governance SHALL be reserved exclusively for Reified Relationships.

# Section 6 — Relationship Inheritance
## IR-001 — Pattern Inheritance
Relationship Patterns SHALL be inherited by subtypes.

A Pattern applies to all constitutional descendants unless explicitly overridden.

## IR-002 — Override Specificity
More specific Patterns SHALL override more general Patterns.

The most specific matching Pattern is authoritative.

## IR-003 — Predicate Isolation
Inheritance SHALL NOT cross predicate boundaries.

Inheritance applies only within the same relationship type.

## IR-004 — Instance Inheritance Prohibition
Relationship instances SHALL NEVER be inherited.

The existence of a relationship between Entity A and Entity B SHALL NOT imply the existence of a relationship between any descendant, ancestor, affiliate, subsidiary, or related entity.

Pattern inheritance is permitted.
Instance inheritance is constitutionally prohibited.

# Section 7 — Evidence Architecture
## Q17 — Dual-Source Evidence Model
### Principle
- Transactions own evidence.
- Relationships index evidence.

### Transaction Evidence
Every authoritative determination SHALL be recorded through a Transaction.

Transactions SHALL contain:

`evidence_bundle_id`

The evidence bundle represents the evidence used to support that specific determination.

Transactions are the authoritative evidence container.

### Relationship Evidence Index
Reified Relationships SHALL contain:
````
supporting_transaction_ids[]
````

This array indexes all Transactions that affected the Relationship.

This enables complete chronological reconstruction of the evidence chain.

### Optional Evidence Acceleration
Reified Relationships MAY contain:
````
evidence_summary_refs[]
````

These references exist solely for query optimization.

They SHALL NOT be considered authoritative evidence records.

### Constitutional Rule
Authoritative evidence SHALL reside in Transactions.

Relationships SHALL function as evidence indexes.

# Section 8 — Structural Edge Schema
Structural Edges possess no independent identity.

Identity is defined solely by the tuple:
````
(source_entity_id, relationship_type, target_entity_id)
````

## Structural Edge schema:
````
source_entity_id
relationship_type
target_entity_id
````
- No UUID is permitted.
- No lifecycle metadata is permitted.
- No governance metadata is permitted.
- No evidence metadata is permitted.

# Section 9 — Reified Relationship Schema
Reified Relationships are constitutional objects.

Required fields:
````
relationship_id
source_entity_id
relationship_type
target_entity_id
pattern_id
origin_transaction_id
supporting_transaction_ids[]
authority_domain
authority_level
status
valid_from
valid_to
supersedes_relationship_id
established_at
````

Optional fields:
````
evidence_summary_refs[]
finality
parties[]
metadata
````

# Section 10 — Promotion Prohibition
Structural Edges SHALL NOT be promoted into Reified Relationships.

Governance obligations SHALL create new Reified Relationships while preserving existing topology.

This rule is derived from `RP-000`.

# Section 11 — Temporal Graph Versioning
Historical topology SHALL be preserved through graph versioning.

Topology changes SHALL be represented by graph-state evolution rather than lifecycle mutation of Structural Edges.

Temporal reconstruction SHALL occur through graph snapshots maintained by the Graph Core.

# Section 12 — Constitutional Lock Certification
The following principles are constitutionally locked:

- RP-000 Relationship Reality Principle
- RP-001 Relationship Nature Immutability
- RP-004 Entity-Type Pattern Resolution
- RP-005 Structural Edge Lifecycle Prohibition
- IR-001 Pattern Inheritance
- IR-002 Override Specificity
- IR-003 Predicate Isolation
- IR-004 Instance Inheritance Prohibition
- Dual-Source Evidence Architecture
- Structural Edge Identity Prohibition
- Promotion Prohibition

###### Status: LOCKED

Amendment Required For Future Modification: **YES**