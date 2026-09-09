# WS-03A.2 — Hierarchy Classification Framework
**Constitutional Specification**
```
Status: LOCKED
Version: 1.0
Dependency:
WS-03A Cluster Architecture
WS-03B Parent Assignment Matrix
```
## Purpose
WS-03A.2 establishes the constitutional hierarchy model for the Zyppi Reality Graph.

The framework resolves the ambiguity of the term "parent" by separating hierarchy into distinct constitutional mechanisms.

No parent-child edge may exist without explicit hierarchy classification.

## Constitutional Principle
A parent-child relationship SHALL belong to exactly one hierarchy type.

**Hierarchy type determines:**
- Meaning
- Traversal behavior
- Validation rules
- Mutability
- Governance requirements
- Audit requirements

The Graph Core SHALL enforce hierarchy classification at creation time.

### HC-001 — Hierarchy Classification Requirement
Every parent-child edge SHALL be classified as exactly one of:
1. TAXONOMY
2. STRUCTURAL_CONTAINMENT
3. LIFECYCLE_GENEALOGY

No edge may exist without hierarchy classification.

**Result**

The meaning of every parent-child relationship becomes deterministic.

### HC-002 — Hierarchy Isolation Principle
A single edge SHALL belong to only one hierarchy type.

An edge SHALL NOT simultaneously represent:
- TAXONOMY and STRUCTURAL_CONTAINMENT
- TAXONOMY and LIFECYCLE_GENEALOGY
- STRUCTURAL_CONTAINMENT and LIFECYCLE_GENEALOGY

If multiple meanings are required, separate edges SHALL be created.

If separation is not possible, the connection SHALL be modeled as a Reified Relationship under `WS-04B`.

### HC-003 — Hierarchy Rule Matrix

Property  | TAXONOMY  | STRUCTURAL_CONTAINMENT  | LIFECYCLE_GENEALOGY
---|---|---|---
Purpose | Classification | Physical / Organizational Structure | Provenance / Lineage
Parent Cardinality | 1 | 1 | 1
Mutable | No | Yes | Restricted
Physical Meaning | No | Yes | Yes
Evidence Required | No | Optional | Mandatory
Traceability Critical | No | Situational | Yes
Lifecycle Lock | No | No | Yes


### HC-004 — Parent Assignment Matrix Extension
The Parent Assignment Matrix (WS-03B.1) SHALL contain a mandatory column:
- `Hierarchy_Type`

No parent assignment row is constitutionally valid without this field.

**Example:**

Child  | Parent  | Hierarchy_Type
---|---|---
Product Identity | Identity | `TAXONOMY`
Table | Dining Area | `STRUCTURAL_CONTAINMENT`
Batch | Product | `LIFECYCLE_GENEALOGY`


### HC-005 — Relationship Escalation Rule
A proposed parent-child edge SHALL pass exactly one of the following constitutional tests:
#### Taxonomy Test
`Child IS_A Parent`

**Example:**

Product Identity IS_A Identity

#### Structural Test
`Child IS_CONTAINED_BY Parent`

**Example:**

Table IS_CONTAINED_BY Dining Area

#### Genealogy Test
`Child DERIVED_FROM Parent`

**Example:**

Batch DERIVED_FROM Product

If none of these tests apply, the connection is NOT parentage.

The connection SHALL be modeled as a Reified Relationship.

**Examples include:**
- MARKETED_AS
- OWNED_BY
- ASSIGNED_TO
- RESOLVES_TO
- SERVED_BY
- OPERATES_OUT_OF
- MANUFACTURED_FOR
- AUTHORIZED_AS

These relationships belong to `WS-04B`.

### HC-006 — Constitutional Validation
The Graph Core SHALL enforce hierarchy classification during creation and import operations.

**Minimum required validation errors:**
- `HIERARCHY_TYPE_REQUIRED`
Raised when a parent-child edge lacks hierarchy classification.
- `MULTIPLE_HIERARCHY_TYPES_PROHIBITED`
Raised when an edge attempts to declare more than one hierarchy type.

### HC-007 — Type / Instance Separation
Taxonomy operates exclusively on entity types.

Structural Containment and Lifecycle Genealogy operate exclusively on entity instances.

#### Taxonomy

`Type → Type`

**Examples:**
```
Identity
 └── Physical Identity
  └── Product Identity

Organization
 └── Department Type
```
#### Structural Containment
`Instance → Instance`

**Examples:**
```
Organization A
 └── Department B

Location A
 └── Dining Area B
  └── Table C
```
#### Lifecycle Genealogy

`Instance → Instance`

**Examples:**
```
Product X
 └── Batch 001
  └── Package 001-01
```
Mixing type-level and instance-level nodes inside the same hierarchy edge is constitutionally prohibited.

When both representations are required, separate constitutional objects SHALL be used.

### HC-008 — Dual Matrix Principle
The Zyppi hierarchy system consists of two distinct constitutional matrices.

#### Matrix A — Type Hierarchy Matrix
**Purpose:**
- Classification
- Inheritance
- Schema Resolution
- Validation

**Contains:**

TAXONOMY edges only.

**Examples:**
- Identity Hierarchy Actor Hierarchy Compliance Hierarchy Event Hierarchy

#### Matrix B — Operational Parentage Matrix
**Purpose:**
- Physical Reality
- Organizational Structure
- Traceability
- Supply Chains
- Geography

**Contains:**
- STRUCTURAL_CONTAINMENT
- LIFECYCLE_GENEALOGY

**Examples:**
- Organization → Department
- Country → Governorate → City
- Product → Batch → Package

#### Constitutional Consequences
The hierarchy model is now formally separated into:
- Classification
- Containment
- Lineage

No future constitutional artifact may introduce a parent-child edge without hierarchy classification.

No relationship may be represented as parentage unless it passes one of the three hierarchy tests.

All existing and future Parent Assignment Matrices SHALL comply with HC-001 through HC-008.

## Ratification Outcome
`WS-03A.2` is hereby declared the constitutional authority governing hierarchy classification within the Zyppi Reality Graph.

----
```
Status: **LOCKED**
Authority Level: Constitutional
Supersedes: Informal Parentage Interpretation
**Required By:**
WS-03B Parent Assignment Matrix
WS-03C Cross-Cluster Relationship Matrix
WS-04B Relationship Registry
CL-17 Graph Core Validation Engine
```