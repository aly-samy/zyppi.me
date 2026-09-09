# WS-03A.3 — CL-05 Referent Taxonomy Map
###### Revision 1 (Ratified)
```
**Status**: LOCKED
 **Classification**: Constitutional Taxonomy Specification
 **Cluster**: CL-05 Referent
 **Supersedes**: Draft Review Version
 **Authority**: Zyppi Reality Model (ZRM)
```
# 1. Purpose
This document defines the canonical taxonomy, principles, lifecycle rules, cardinality constraints, and relationship model for CL-05 Referent.

**The Referent cluster answers the question:**
> "What real thing does an Identity identify?"

A Referent is the actual subject, object, resource, document, location, person, organization, product, asset, or digital resource that exists within reality.

Identity represents.

Referent exists.

The constitutional separation between Identity and Referent is mandatory throughout the Zyppi Reality Model.

# 2. Constitutional Definition
## Definition
> A Referent is any thing, entity, object, resource, location, document, person, organization, or digital artifact that can be identified, referenced, interacted with, observed, verified, or acted upon.

# 3. Constitutional Principles
## CR-REF-01
A Referent SHALL represent a real thing.

A Referent may be physical, digital, documentary, organizational, or conceptual, but it must possess existence independent of its identifier.

## CR-REF-02
Identity and Referent SHALL remain separate concepts.

Identity represents.

Referent is represented.

## CR-REF-03
An Active Identity SHALL identify at most one Referent at a point in time.

A Pre-Commissioned Identity MAY identify zero Referents.

## CR-REF-04
Multiple Identities MAY identify the same Referent.

This principle is known as:
### Identity Convergence

**Examples**:
- GTIN
- Serial Number
- Internal SKU
- DPP Identifier
may all identify the same physical product.

## CR-REF-05
A Referent MAY exist without an Identity.

**This principle enables:**
- Dark Assets
- Uncommissioned Products
- Pre-registration Objects
- Legacy Infrastructure

## CR-REF-06
A Referent SHALL NOT require a digital representation to exist.
Digital representation is optional.
Existence is not.

## CR-REF-07
Events MAY reference Referents.

Referents SHALL NOT be owned by Events.

## CR-REF-08
A Referent classification MAY change throughout its lifecycle without requiring creation of a new Referent.

**Example:**
````
Vehicle for sale → Product
Same vehicle operating within a fleet → Asset
````
The Referent remains the same.

Only its classification changes.

## CR-REF-09
A Referent MAY be the subject of zero or more Events.

Events describe occurrences involving a Referent.

They do not define the Referent.

## CR-REF-10
Digital Referents remain valid Referents even if temporarily inaccessible.

Loss of access does not imply loss of existence.

# 4. Product vs Asset Classification
## Product
> A Product is primarily created for exchange, sale, distribution, or consumption.

**Examples:**
- Olive Oil Bottle
- Pharmaceutical Package
- Retail Product
- Industrial Component

## Asset
> An Asset is primarily created for operation, utilization, maintenance, or productivity.

**Examples:**
- Forklift
- Manufacturing Machine
- Fleet Vehicle
- Factory Equipment

## Classification Rule
Classification SHALL be determined by primary operational role within the current context.

Dual-role scenarios SHALL be modeled through relationships or reclassification.

# 5. Root Taxonomy
````
CL-05 Referent
│
├── Physical Referent
│
├── Document Referent
│
├── Digital Referent
│
└── Composite Referent
````

# 6. Physical Referent
## Physical Referent
Represents tangible real-world entities.

## Product
Represents goods created for exchange or consumption.

### Consumer Product
**Examples:**
- Food
- Beverage
- Electronics
- Apparel
### Industrial Product
**Examples:**
- Components
- Raw Materials
- Manufacturing Parts
### Pharmaceutical Product
**Examples:**
- Medicine
- Medical Device
- Vaccine

## Asset
Represents operational resources.
### Equipment
### Vehicle
### Machine
### Infrastructure Asset
### Natural Resource
**Examples:**
- Water Source
- Agricultural Field
- Mineral Resource

## Location
Represents physical places.
- Site
- Building
- Zone
- Room
- Point of Interest

## Person
Represents a human subject.
- Consumer
- Employee
- Citizen

## Organization
Represents legal or organizational entities.
- Brand
- Company
- Government Entity
- Non-Profit Organization

# 7. Document Referent
Represents documents that exist as identifiable resources.
## Certificate
Examples:
- ISO Certificate
- Organic Certificate

## License
Examples:
- Operating License
- Software License

## Contract
Examples:
- Supply Agreement
- Warranty Contract

## Policy
Examples:
- Privacy Policy
- Return Policy

## Report
Examples:
- Audit Report
- Inspection Report

## Regulatory Filing
Examples:
- Customs Filing
- Compliance Submission
- Regulatory Declaration

# 8. Digital Referent
Represents digital resources.
## Web Page

## Media Asset
Examples:
- Image
- Video
- Audio

## Dataset
Examples:
- Analytics Dataset
- Product Dataset

## API Resource
Examples:
- REST Endpoint
- GraphQL Endpoint

## Knowledge Asset
Examples:
- Documentation
- Knowledge Base

## AI Resource
Examples:
- Agent
- Model
- Prompt Asset

# 9. Composite Referent
Composite Referents are physical assemblies composed of independently identifiable Referents.

A Composite Referent SHALL possess existence as a real-world addressable entity.

Composite Referents SHALL NOT be used as abstract grouping mechanisms.

Relationships SHALL be used for abstract groupings.

## Product Bundle
Example:
- Retail Gift Bundle

## Asset System
Example:
- Production Line

## Building Complex
Example:
- University Campus

## Multi-Component Assembly
Example:
- Aircraft Engine Assembly

# 10. Explicit Exclusions
The following SHALL NOT be classified as Referents.
## Event
Belongs to CL-11 Event.

**Examples:**
- Product Recall
- Inspection
- Purchase
- Verification

## Intent
Belongs to CL-06 Intent.

**Examples:**
- Buy
- Verify
- Transfer

## Transaction
Belongs to CL-09 Transaction.

**Examples:**
- Purchase Transaction
- Transfer Transaction

## Outcome
Belongs to CL-10 Outcome.

**Examples:**
- Ownership Granted
- Product Verified

## Identity
Belongs to CL-04 Identity.

**Examples:**
- GTIN
- Serial Number
- QR Identity
- DPP Identity
- Digital Twin

# 11. Digital Twin Clarification
Digital Twin SHALL remain classified under CL-04 Identity.

**Rationale:**
A Digital Twin is a persistent digital representation of a Referent.

It is not the Referent itself.

**Example:**
````
Factory Machine = Referent
````
````
Factory Machine Digital Twin = Identity
````
**The relationship is:**
````
Identity → IDENTIFIES → Referent
````

# 12. DPP Clarification
Digital Product Passport (DPP) SHALL remain classified under CL-04 Identity.

A DPP is a regulatory identity artifact.

It is not a Referent.

The DPP identifies or describes a Product Referent.

**Example:**
````
DPP Identity → IDENTIFIES → Physical Product Referent
````
Associated compliance documents may exist as Document Referents.

The DPP itself SHALL NOT be duplicated into CL-05.

# 13. Canonical Relationships
## IDENTIFIES
Identity → Referent

## PART_OF
Referent → Referent

## CONTAINS
Referent → Referent

## RELATED_TO
Referent → Referent

## DERIVED_FROM
Referent → Referent

## REPLACED_BY
Referent → Referent

# 14. Lifecycle States
````
Draft
→ Pre-Commissioned
→ Active
→ Suspended
→ Decommissioned
→ Archived
````

## Lifecycle Rules
### CR-REF-L01
Archived Referents SHALL be read-only.

### CR-REF-L02
Decommissioned Referents SHALL NOT initiate new Transactions.

### CR-REF-L03
Historical Events SHALL remain permanently linked to Archived Referents.

# 15. Canonical Reality Flow
````
Actor
→ Event
→ Identity
→ Referent
→ Intent
→ Intent Contract
→ Transaction
→ Outcome
→ Intelligence
````
Referent represents the object of reality upon which intentions, transactions, outcomes, and intelligence ultimately operate.

# 16. Ratification
This document formally ratifies:
- Product vs Asset distinction
- Identity Convergence principle
- Dark Asset principle
- Digital Twin remaining in CL-04
- DPP remaining in CL-04
- Document Referent taxonomy
- Digital Referent taxonomy
- Composite Referent restrictions
- Referent lifecycle model
- Referent relationship model

**CL-05 Referent Taxonomy Map is hereby LOCKED.**