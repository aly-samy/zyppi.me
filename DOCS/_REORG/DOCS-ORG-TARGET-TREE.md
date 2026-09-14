# DOCS-ORG-TARGET-TREE — Proposed Target Directory Architecture

**Status:** PROPOSED MIGRATION MAP (S00)
**Authority:** Founder / Chair
**Baseline SHA:** `2e954df5eeb0f10392e17841c8678a3deafc8591`

---

# 1. Executive Overview

This document presents the proposed target directory architecture for the reorganization of the `DOCS/` corpus.

The proposed taxonomy establishes a single, coherent, authority-aligned information architecture. It eliminates historical directory fragmentation while strictly preserving historical provenance, document identity, and brand succession rules (`ZYPPI-UNFICT-SUCCESSION-DECLARATION-001.md`).

---

# 2. Proposed Target Directory Hierarchy

```text
DOCS/
├── 00-START-HERE/                      # Navigation, indexes, and orientation
│   ├── README.md                       # Main corpus entrypoint
│   └── SPRINT-MIGRATION-MAP.md         # Master migration map
│
├── CONSTITUTION/                       # Normative constitutional specifications
│   ├── 01-FOUNDATION/                  # Declaration & Master Brand (e.g. ZUSD-001)
│   ├── 02-REALITY-CONSTITUTION/        # Reality Model & Core Law (e.g. ZRM-000..007)
│   ├── 03-CONSTITUTIONAL-FAMILIES/     # Primary Families (POL, SEC, RSN, PRJ, RI, SIOS, ARM, ECONO, CMM)
│   │   ├── 01-POL/                     # Policy Determination Family (S04)
│   │   ├── 02-SEC/                     # Trust & Evidence Family (S04)
│   │   ├── 03-RSN/                     # Reasoning & Epistemic Family (S04)
│   │   ├── 04-PRJ/                     # Projection Materialization Family (S05)
│   │   ├── 05-RI/                      # Runtime Execution Integration Family (S05)
│   │   ├── 06-SIOS/                    # SIOS Translation Family (S06)
│   │   ├── 07-ARM/                     # Asset Reality Model Family (S06)
│   │   ├── 08-ECONO/                   # Economic Architecture Family (S06)
│   │   └── 09-CMM/                     # Capability Maturity Model Family (S06)
│   ├── 04-SECONDARY-CONSTITUTIONAL-CONSTRUCTS/ # Secondary constructs (BINDING, DELEGATION, MARKETING)
│   ├── 05-DOMAIN-COMPOSITION/          # Domain Composition (Z-PROF Profile Architecture)
│   ├── 06-DOMAIN-CONSTITUTIONS/        # Domain Constitutions
│   │   └── COMMERCE/                   # Commerce Domain (Commerce Atlas CA-000..004)
│   ├── 07-APPLICATION-CONSTITUTIONS/   # Application & Standard Constitutions
│   │   └── COMMERCE/
│   │       └── GS1/                    # GS1 Standard Constitutions & Bridges
│   └── 08-INTERFACE-AND-IMPLEMENTATION-CONSTITUTIONS/ # Interface/Engine Specs (ZII, ZQE, ZyUX, DJ, ZRR, ZT, CEngS-001)
│       ├── ENGINEERING/
│       │   └── CEngS/                  # Immutable Engineering Constitution CEngS-001
│       └── ZII/                        # ZII & ZQE QR Engine specifications
│
├── GOVERNANCE/                         # Operational & Engineering Governance
│   ├── ENGINEERING/                    # Engineering Governance Standards (CEngS-002..105, Checklists)
│   └── CONSTITUTIONAL-DEVELOPMENT/     # Ratification support, workshop records, & candidate drafts
│
├── PROGRAMS/                           # Active & Historical Program Execution Tracks
│   ├── CAW/                            # Commerce Atlas Wedge (Core Specs & AMS Milestones M01–M08.5)
│   └── ZPROF-M08.5/                    # Z-PROF Architecture Deliverables (AMS-0851..0861)
│
├── EVIDENCE/                           # Verifiable Receipts, Audits, & Compliance Reports
│   ├── CCP-RECEIPTS/                   # Capability Closure Program (CCP) Receipts
│   └── MILESTONE-AUDITS/               # Formal Verification Reports & EVR Reports
│
├── REPORTS/                            # Executive Reports, State-of-Union, & Context Papers
│
├── EXPLORATORY/                        # Proposals, Exploratory Research, & Workshop Papers
│
├── PACKS/                              # Generated Full-Series Documentation Bundles
│   ├── CAW/                            # CAW full-series generated bundles
│   ├── CEngS/                          # CEngS full-series generated bundles
│   └── ZII/                            # ZII full-series generated bundles
│
├── ARCHIVE/                            # Preserved Historical Records & Consolidation Targets
│   └── DUPLICATES/                     # Consolidated Exact Byte-Identical Redundant Duplicates
│
└── _REORG/                             # S00 Migration Control Plane (Authoritative Reports)
    ├── DOCS-ORG-MASTER-REGISTER.md
    ├── DOCS-ORG-MASTER-REGISTER.csv
    ├── DOCS-ORG-TARGET-TREE.md
    └── DOCS-ORG-S00-REPORT.md
```

---

# 3. Fact vs. Target vs. Unresolved Decisions

## 3.1 Current Repository Fact

The current repository contains 461 physical files distributed across 7 top-level locations:

- `DOCS/CAW` (196 files)
- `DOCS/CEngS-v2` (15 files)
- `DOCS/Commerce-Atlas` (11 files)
- `DOCS/M08.5` (3 files)
- `DOCS/ZII` (11 files)
- `DOCS/ZyGOV` (224 files)
- `DOCS/ZYPPI-UNFICT-SUCCESSION-DECLARATION-001.md` (1 root file)

## 3.2 Proposed Target Structure

Under the proposed taxonomy, all files are grouped into 9 clean top-level directories:

- `DOCS/00-START-HERE/`
- `DOCS/CONSTITUTION/`
- `DOCS/GOVERNANCE/`
- `DOCS/PROGRAMS/`
- `DOCS/EVIDENCE/`
- `DOCS/REPORTS/`
- `DOCS/EXPLORATORY/`
- `DOCS/PACKS/`
- `DOCS/ARCHIVE/`

## 3.3 Unresolved Chair Decisions

The following architectural mappings are marked provisional pending Chair confirmation:

1. **Commerce Atlas Placement:** Placed in `DOCS/CONSTITUTION/06-DOMAIN-CONSTITUTIONS/COMMERCE/COMMERCE-ATLAS/` (Sprint S11).
2. **CEngS-001 vs CEngS Standards:** CEngS-001 placed in `DOCS/CONSTITUTION/08-.../ENGINEERING/CEngS/`, operational standards placed in `DOCS/GOVERNANCE/ENGINEERING/` (Sprint S11).
3. **CAW Program Execution:** Placed in `DOCS/PROGRAMS/CAW/` (Sprints S12, S13A, S13B).
4. **ZII / ZQE Placement:** Placed in `DOCS/CONSTITUTION/08-INTERFACE-AND-IMPLEMENTATION-CONSTITUTIONS/ZII/` (Sprint S10).

---

# 4. Major Tree Mapping Matrix

| Current Directory                                                        | Target Directory                                                       | Primary Sprint | Rationale                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------- | ------------------------------------------------------ |
| `DOCS/ZYPPI-UNFICT-SUCCESSION-DECLARATION-001.md`                        | `DOCS/CONSTITUTION/01-FOUNDATION/`                                     | `S01`          | Governing master brand succession declaration ZUSD-001 |
| `DOCS/ZyGOV/CONSTITUTION/01-FOUNDATION/`                                 | `DOCS/CONSTITUTION/01-FOUNDATION/`                                     | `S01`          | Foundation constitutional layer                        |
| `DOCS/ZyGOV/CONSTITUTION/02-REALITY-CONSTITUTION/`                       | `DOCS/CONSTITUTION/02-REALITY-CONSTITUTION/`                           | `S02`          | Reality Model (ZRM) specs                              |
| `DOCS/ZyGOV/CONSTITUTION/03-CONSTITUTIONAL-FAMILIES/`                    | `DOCS/CONSTITUTION/03-CONSTITUTIONAL-FAMILIES/`                        | `S03`..`S06`   | Primary constitutional families                        |
| `DOCS/ZyGOV/CONSTITUTION/04-SECONDARY-CONSTITUTIONAL-CONSTRUCTS/`        | `DOCS/CONSTITUTION/04-SECONDARY-CONSTITUTIONAL-CONSTRUCTS/`            | `S07`          | Secondary constructs                                   |
| `DOCS/ZyGOV/CONSTITUTION/05-DOMAIN-COMPOSITION/`                         | `DOCS/CONSTITUTION/05-DOMAIN-COMPOSITION/`                             | `S08A`         | Domain Composition (Z-PROF)                            |
| `DOCS/ZyGOV/CONSTITUTION/08-INTERFACE-AND-IMPLEMENTATION-CONSTITUTIONS/` | `DOCS/CONSTITUTION/08-INTERFACE-AND-IMPLEMENTATION-CONSTITUTIONS/`     | `S09`, `S10`   | Interface & Engine specifications                      |
| `DOCS/CEngS-v2/CEngS-001...`                                             | `DOCS/CONSTITUTION/08-.../ENGINEERING/CEngS/`                          | `S11`          | CEngS-001 Engineering Constitution                     |
| `DOCS/CEngS-v2/CEngS-002...`                                             | `DOCS/GOVERNANCE/ENGINEERING/`                                         | `S11`          | CEngS v2.0 Engineering Governance Standards            |
| `DOCS/Commerce-Atlas/`                                                   | `DOCS/CONSTITUTION/06-DOMAIN-CONSTITUTIONS/COMMERCE/`                  | `S11`          | Commerce Domain Constitutions                          |
| `DOCS/ZII/`                                                              | `DOCS/CONSTITUTION/08-INTERFACE-AND-IMPLEMENTATION-CONSTITUTIONS/ZII/` | `S10`          | ZII/ZQE implementation constitution                    |
| `DOCS/M08.5/`                                                            | `DOCS/PROGRAMS/ZPROF-M08.5/`                                           | `S08B`         | Z-PROF M08.5 deliverables                              |
| `DOCS/CAW/Core/`                                                         | `DOCS/PROGRAMS/CAW/CORE/`                                              | `S12`          | Commerce Atlas Wedge Core                              |
| `DOCS/CAW/AMS/` & `M01-M08`                                              | `DOCS/PROGRAMS/CAW/AMS/`                                               | `S13A`, `S13B` | CAW AMS Milestones                                     |
| `DOCS/CAW/CCP/`                                                          | `DOCS/EVIDENCE/CCP-RECEIPTS/`                                          | `S13C`         | Capability Closure Program Receipts                    |
