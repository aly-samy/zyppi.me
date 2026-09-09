# WS-03A.2 Revision 1
# CL-04 Identity Taxonomy Map
---|---
---|---
Document ID: | WS-03A.2-R1
 Status: | Ratified Draft
 Classification: | Constitutional Taxonomy Specification
 Parent Document: | WS-03 — Taxonomy Framework Rules
 Related Documents: | WS-01 Constitutional Primitives, WS-02A Registry Blueprint, WS-03A.1 Event Taxonomy Map

## 1. Purpose
This document defines the canonical taxonomy for CL-04 Identity within the Zyppi Reality Model (ZRM).

The purpose of this taxonomy is to establish a universal structure for representing identifiable entities across physical, digital, organizational, regulatory, and commercial domains.

Identity serves as the resolution layer of the Reality Graph. Every Touchpoint, Transaction, Event, Compliance Record, Intelligence Artifact, and System Process ultimately resolves to one or more Identities.

**This document defines:**
- Identity hierarchy
- Identity classifications
- Identity relationships
- Identity lifecycle states
- Identity cardinality rules
- Identity governance requirements

## 2. Constitutional Definition
### CD-IDT-01
An Identity is a persistent record representing a uniquely distinguishable entity within the Reality Model.

**An Identity may represent:**
- a product
- an asset
- a person
- an organization
- a location
- a document
- a digital resource

Identity does not represent the physical thing itself.

Identity represents the persistent record through which the thing is referenced, resolved, managed, and interacted with.

### CD-IDT-02
An Identity SHALL remain stable even when attributes associated with the represented entity change.

**Examples:**
- Product price changes
- Ownership changes
- Product status changes
- Regulatory status changes

None of these constitute creation of a new Identity unless explicitly defined by taxonomy rules.

### CD-IDT-03
Identity is distinct from Actor.

Actor represents an entity performing an action.

Identity represents the persistent record describing an entity.

**Example:**
- A customer scanning a QR code acts as an Actor.
- The customer profile stored within Zyppi is a Person Identity.

## 3. Taxonomy Hierarchy
```
Identity (T0)

├── Product Identity (T1)
├── Asset Identity (T1)
├── Location Identity (T1)
├── Person Identity (T1)
├── Organization Identity (T1)
├── Document Identity (T1)
└── Digital Resource Identity (T1)
```

## 4. Product Identity
**Definition**
> Represents identifiable products and product instances.

### Product Family
Represents a product line or family.
**Examples:**
- Coca-Cola Original
- iPhone Series
- Olive Oil Premium Collection

### Product Variant
Represents a specific variation within a product family.

**Examples:**
- 500ml Bottle
- 1L Bottle
- Black Color Variant

### Batch Identity
Represents a manufacturing batch.

**Examples:**
- Production Batch A
- Production Batch B

### Lot Identity
Represents a production lot.

**Common in:**
- food
- pharmaceuticals
- cosmetics

### Serial Identity
Represents an individually serialized product instance.

**Examples:**
- Serialized luxury item
- Serialized medical device
- Serialized industrial equipment

## 5. Asset Identity
**Definition**
> Represents operational assets.

### Equipment
**Examples:**
- Forklift
- Printer
- Conveyor

### Vehicle
**Examples:**
- Truck
- Van
- Fleet Vehicle

### Device
**Examples:**
- Sensor
- Gateway
- IoT Device

### Machine
**Examples:**
- CNC Machine
- Production Robot
- Packaging Machine

### Infrastructure Asset
**Examples:**
- Power Station
- Water Pump
- Distribution Cabinet

## 6. Location Identity
**Definition**
> Represents physical locations and spatial structures.

### Site
**Examples:**
- Factory
- Warehouse
- Campus

### Building
**Examples:**
- Headquarters
- Distribution Center

### Floor
**Examples:**
- Floor 1
- Floor 2

### Zone
**Examples:**
- Storage Zone
- Production Zone

### Room
**Examples:**
- Laboratory
- Meeting Room

### Shelf
**Examples:**
- Shelf A
- Shelf B

### Table
**Examples:**
- Restaurant Table
- Workstation Table

## 7. Person Identity
**Definition**
> Represents identifiable individuals.

### Customer
Consumer or purchaser.

### Employee
Internal workforce member.

### Member
Association or community member.

### Patient
Healthcare-related identity.

### Citizen
Government-related identity.

## 8. Organization Identity
**Definition**
> Represents legal and organizational entities.

### Brand
Commercial brand identity.

### Company
Legal business entity.

### Department
Internal organizational unit.

### Partner
Partner organization.

### Distributor
Distribution organization.

### Government Entity
Government institution or agency.

## 9. Document Identity
**Definition**
> Represents identifiable documents, records, certifications, and regulatory artifacts. Document Identities may evolve through versions while maintaining identity continuity.

### Certificate
**Examples:**
- Authenticity Certificate
- Quality Certificate

### License
**Examples:**
- Manufacturing License
- Operating License

### Contract
**Examples:**
- Service Agreement
- Supplier Contract

### Passport
**Examples:**
- Product Passport
- Asset Passport

### Policy
**Examples:**
- Privacy Policy
- Sustainability Policy

### Report
**Examples:**
- Audit Report
- Inspection Report

### Digital Product Passport (DPP)
Represents a machine-readable regulatory document describing a product.

A DPP is not a Product Identity.

A DPP is a Document Identity linked to one or more Product Identities.

**Examples:**
- ESPR Product Passport
- Battery Passport
- Circular Economy Passport

## 10. Digital Resource Identity
**Definition**
> Represents managed digital resources.

### Web Page
**Examples:**
- Product Landing Page
- Support Page

### Media Asset
**Examples:**
- Image
- Video
- Audio

### API Endpoint
**Examples:**
- Product API
- Verification API

### Dataset
**Examples:**
- Analytics Dataset
- Product Dataset

### Knowledge Asset
**Examples:**
- Knowledge Base Article
- Technical Documentation

### AI Resource
**Examples:**
- AI Agent
- AI Model
- AI Workflow

### Campaign
**Examples:**
- Marketing Campaign
- Product Launch Campaign
- Loyalty Campaign

## 11. Identity Relationships
The following canonical relationships are approved.

- IDENTIFIES
- PART_OF
- RELATED_TO
- DERIVED_FROM
- REPLACED_BY
- OWNS
- CERTIFIED_BY


### IDENTIFIES
Connects an Identity to its Referent.

**Example:**
```
Product Identity
`IDENTIFIES`
Physical Product
```

### PART_OF
Represents hierarchical membership.

**Example:**
```
Serial Identity
`PART_OF`
Batch Identity
```

### RELATED_TO
Represents non-hierarchical associations.

**Example:**
```
Product Identity
`RELATED_TO`
Warranty Document
```

### DERIVED_FROM
Represents lineage.

**Example:**
```
Product Variant
`DERIVED_FROM`
Product Family
```

### REPLACED_BY
Represents succession.

**Example:**
```
Product Version 1
`REPLACED_BY`
Product Version 2
```

### OWNS
Represents ownership relationships.

**Example:**
```
Customer Identity
`OWNS`
Product Identity
```

### CERTIFIED_BY
Represents certification authority relationships.

**Example:**
```
Product Identity
`CERTIFIED_BY`
Compliance Authority
```

## 12. Identity Lifecycle
All Identity records SHALL operate within the following lifecycle model.
```
Draft
↓
Pre-Commissioned
↓
Commissioned
↓
Active
↓
Suspended
↓
Decommissioned
↓
Archived
```

### Draft
Identity exists but is incomplete.

### Pre-Commissioned
Identity has been created but is not yet associated with a live referent.
**Examples:**
- Printed QR not yet attached
- Product record before manufacturing

### Commissioned
Identity has been assigned to a referent.

### Active
Identity is operational.

### Suspended
Identity remains valid but is temporarily inactive.

### Decommissioned
Identity is permanently removed from operational use.

### Archived
Identity retained for historical purposes only.

## 13. Cardinality Rules
### CR-IDT-01
An Identity SHALL identify one primary Referent at a given point in time.

### CR-IDT-02
A Referent MAY possess multiple associated Identities.

**Examples:**
- GTIN
- Serial Number
- Internal SKU
- DPP Identifier

### CR-IDT-03
An Identity MAY exist without an associated Referent while in Draft or Pre-Commissioned state.

### CR-IDT-04
An Archived or Decommissioned Identity SHALL be read-only.

### CR-IDT-05
No new Transactions may be initiated against an Archived or Decommissioned Identity.

## 14. Governance Rules
### GR-IDT-01
Every Identity SHALL possess a globally unique identifier.

### GR-IDT-02
Identity type SHALL remain immutable after commissioning.

### GR-IDT-03
Identity lineage SHALL remain permanently auditable.

### GR-IDT-04
Identity deletion is prohibited.
Identities may only transition to:
- Decommissioned
- Archived
states.

### GR-IDT-05
Identity relationships SHALL be preserved throughout the lifecycle of the Identity.

## 15. Canonical Examples
### Example 1 — Consumer Product
```
Product Identity
    └── Serial Identity

Document Identity
    └── Digital Product Passport
```
**Relationship:**
```
Serial Identity
`RELATED_TO`
Digital Product Passport
```

### Example 2 — Manufacturer
```
Organization Identity
    └── Company

Organization Identity
    └── Brand
```

### Example 3 — GS1 Product
```
Product Family
    ↓
Product Variant
    ↓
Batch Identity
    ↓
Serial Identity
```

## 16. Ratification Statement
This document establishes the constitutional taxonomy for CL-04 Identity within the Zyppi Reality Model.

All future entities classified within CL-04 SHALL conform to the hierarchy, lifecycle rules, cardinality requirements, and governance constraints defined herein.

No subordinate specification may redefine Identity classifications established by this document.