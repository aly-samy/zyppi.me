# ARM-P-001 — Product Profile Constitution

###### Status: RATIFIED

# 1. Purpose

ARM-P-001 defines the constitutional specialization of an Asset Reality that participates in exchange, consumption, use, licensing, or commercial distribution.

ARM-P-001 introduces no new constitutional primitives and inherits all principles of ARM-001.

---

# 2. Product Definition

A Product is an Asset Reality representing a designed, repeatable entity intended for exchange, consumption, use, licensing, or value delivery.

Products may be:

- Physical goods
- Raw materials
- Pharmaceuticals
- Food products
- Vehicles
- Spare parts
- Digital products
- Digital collectibles
- Software licenses
- Service packages

---

# 3. Product Reality Types

ARM-P-001 recognizes two Product Reality roles:

## Product Template

Represents the abstract product concept.

**Examples:**

- Coca-Cola 330ml Can
- Microsoft Office 365
- Travel Insurance Gold Plan

## Product Instance

Represents a specific realization of a Product Template.

**Examples:**

- Can Serial A8F93K2
- License Key 84XK-92JJ
- Policy #778812

Both Template and Instance are independent Asset Realities possessing independent zIDs.

Instances SHALL be connected to Templates through:

`instance_of`

---

# 4. Product Core Facets

The Product Profile SHALL permit the following core facets:

## Product Type

**Examples:**

- Physical
- Digital
- Service
- Raw Material

## Brand Relationship

Relationship to Organization Assets.

## Manufacturer Relationship

Relationship to Organization Assets.

## Composition Relationships

Relationships to constituent Product Realities.

## Version Relationships

Relationships to predecessor or successor Product Realities.

----

**No other facets are constitutionally required.**

---

# 5. Identity Model

External identifiers SHALL NOT constitute identity.

**Examples:**

- GTIN
- UPC
- SKU
- EAN
- Manufacturer Part Number
- Serial Number

These SHALL be represented through `CL-04` identity bindings.

The `zID` remains the sole canonical identity.

---

# 6. Product Relationships

The following constitutional relationship types are recognized:

- instance_of
- manufactured_by
- branded_by
- composed_of
- variant_of
- certified_by

Additional relationships may be defined by future profiles and projection specifications.

---

# 7. Product Observations

`ARM-P-001` inherits `CL-11`.

Recommended product observation vocabulary includes:

- Manufactured
- Packed
- Shipped
- Sold
- Returned
- Recycled
- Inspected
- Certified
- Recall Issued
- Remedy Applied

Observation vocabulary is extensible.

---

# 8. Computed Lifecycle

Products SHALL NOT store lifecycle state.

Lifecycle status SHALL be derived from observations.

**Examples:**

- Released
- Recalled
- Discontinued
- Expired
- Certified

These states are projections, not stored reality.

---

# 9. Projection Independence

`ARM-P-001` SHALL NOT contain:

- GS1 structures
- DPP structures
- EPCIS structures
- QR structures
- NFC structures
- Experience structures

These belong to projection and experience layers.

---

# 10. Constitutional Validation

`ARM-P-001` demonstrates that the Profile Architecture can specialize Asset Realities without introducing new constitutional primitives.

Future profiles SHALL follow the same pattern:

- Minimal facets
- Relationship vocabulary
- Observation vocabulary
- Computed lifecycle

No profile may modify `ARM-001` core concepts.
