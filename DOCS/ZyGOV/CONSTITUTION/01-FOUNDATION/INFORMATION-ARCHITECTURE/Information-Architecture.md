# Zyppi Information Architecture Bible
```
**Version:** 1.0  
**Status:** Living Document  
**Last Updated:** July 2026

**Depends On**

- `/NORTH_STAR.md`
- `/FOUNDING_PRINCIPLES.md`
- `/PRD.md`
- `/TECHNICAL_ARCHITECTURE_BIBLE.md`
```
---

# Purpose

This document defines how Zyppi represents, stores, derives, and governs information.

The **North Star** defines **why Zyppi exists**.

The **Founding Principles** define **what Zyppi believes**.

The **Product Requirements Document** defines **what Zyppi builds**.

The **Technical Architecture Bible** defines **how Zyppi executes**.

The **Information Architecture Bible** defines **how Zyppi understands reality**.

It establishes:

- The constitutional information model
- The immutable representation of reality
- Semantic projections
- Operational information
- Storage architecture
- Information governance

This document serves as the bridge between constitutional philosophy and technical implementation.

---

# Constitutional Principle

Reality exists independently of software.

Software cannot create reality.

Software can only:

- Observe reality
- Record events
- Preserve evidence
- Verify evidence
- Compute trust
- Execute capabilities

Information architecture exists to preserve this chain without distortion.

---

# The Constitutional Pipeline

Every interaction within Zyppi follows the same immutable information lifecycle.

```text
Observation
    ↓
Event
    ↓
Evidence
    ↓
Verification
    ↓
Trust
    ↓
Execution
```

Software never computes absolute truth.

Software verifies evidence.

Verification produces trust.

Trust authorizes execution.

---

# PART I — Constitutional Primitives

The platform recognizes only five constitutional primitives.

No product, feature, or implementation may introduce additional foundational primitives without a constitutional amendment.

---

## Subject

An autonomous participant capable of intention or agency.

**Examples**

- Human
- Organization
- AI Agent
- Autonomous System

**Role**

Subjects initiate or authorize actions.

---

## Object

A non-autonomous entity that exists independently of software.

**Examples**

- Product
- Vehicle
- Device
- Package
- NFC Tag
- QR Carrier
- Sensor

**Role**

Objects participate in events.

They do not possess autonomous intent.

---

## Place

A spatial or contextual environment in which events occur.

**Examples**

- Factory
- Warehouse
- Retail Store
- Geographic Location
- Distribution Center

**Role**

Places provide context.

---

## Event

A recorded occurrence representing a change or interaction involving constitutional primitives.

**Examples**

- Product Manufactured
- Product Scanned
- Ownership Changed
- Warranty Registered
- Route Executed
- Authentication Requested

**Role**

Events are immutable.

They are never rewritten.

---

## Evidence

The verifiable trace produced by an Event.

**Examples**

- Digital signatures
- Sensor readings
- Images
- Device metadata
- Network observations
- Cryptographic proofs
- GS1 Digital Link payloads

**Role**

Evidence enables verification.

Evidence is never inferred.

---

## Relationships Between Primitives

- Subjects interact with Objects.
- Objects exist within Places.
- Events connect Subjects, Objects, and Places.
- Evidence attests that Events occurred.

Everything else within Zyppi derives from these five primitives.

---

# PART II — Reality Representation

Reality is represented structurally.

It is never represented semantically.

The purpose of the Reality Representation is to preserve immutable relationships between constitutional primitives.

The current implementation uses a **Reality Graph**.

Future implementations may evolve without changing the constitutional model.

---

## Design Principles

Reality Representation is:

- Structural
- Immutable
- Append-only
- Cryptographically verifiable
- Technology independent

It contains:

- No operational configuration
- No AI inferences
- No user preferences
- No probabilities
- No business logic

Reality Representation records **what occurred**, not **what software believes**.

---

## Topological Rules

**Nodes**

- Subjects
- Objects
- Places
- Events
- Evidence

**Edges**

- Participation
- Occurrence
- Location
- Attribution
- Attestation

Relationships are append-only.

Historical topology is never rewritten.

---

# PART III — Semantic Projections

Semantic Projections derive meaning from Reality.

They are **not constitutional primitives**.

They may evolve continuously.

They may always be regenerated from immutable information.

---

## Identity Projection

Identity is not stored as a primitive.

Identity is projected from verified Evidence.

Identity represents the platform's confidence that a specific Subject controls, owns, or is authorized to interact with an Object or Place.

Identity may evolve as new Evidence is collected.

Carriers such as:

- QR Codes
- NFC
- RFID
- BLE
- GS1 Digital Links

are transport mechanisms.

They are **not identities**.

---

## Knowledge Graph

The Knowledge Graph is a semantic projection built upon the immutable Reality Representation.

It may contain:

- Relationships
- Confidence scores
- AI inferences
- Recommendations
- Behavioral patterns
- Semantic classifications

Unlike the Reality Representation:

- It is mutable.
- It may be incomplete.
- It may be incorrect.
- It evolves continuously.

The Knowledge Graph never alters Reality.

It only interprets it.

---

## Operational Views

Operational Views provide application-specific representations.

Examples include:

- Dashboards
- Search indexes
- Customer portals
- Analytics dashboards
- Reports
- Product pages

Operational Views are derived projections.

They never become the source of truth.

---

## Analytics Projections

Analytics are derived from Events.

Examples include:

- Click counts
- Scan trends
- Geographic distribution
- Funnel analysis
- Attribution models

Analytics summarize reality.

They do not define it.

---

## AI Memory

AI Memory represents contextual knowledge accumulated from historical Evidence.

Examples include:

- Workflow preferences
- Operational recommendations
- Suggested capabilities
- Predicted routing behavior

AI Memory is probabilistic.

It derives authority from Evidence, not from itself.

---

# PART IV — Operational Model

Operational constructs exist to operate the platform.

They are **not constitutional primitives**.

They never redefine reality.

Operational constructs include:

- Workspaces
- Organizations
- Memberships
- API Keys
- Integrations
- Destinations
- Routing Rules
- Policies
- Plans
- Entitlements
- Settings
- Automation Workflows
- Capability Configurations

---

## Operational Principle

Operational constructs command actions.

They do not become reality.

**Example**

```text
Policy Created
        ↓
Operational Configuration
```

Later:

```text
Policy Evaluated
        ↓
Event Created
        ↓
Evidence Recorded
```

The policy remains operational.

The evaluation becomes historical reality.

---

## Routing Policies

Routing policies exist solely to influence future routing decisions.

They are mutable.

Their evaluations produce immutable Events.

---

## Destination References

Destinations are operational references.

Examples include:

- URLs
- APIs
- Deep Links
- ERP Pages
- CRM Records
- DPP Portals

Destinations may change.

Historical Events remain unchanged.

---

# PART V — Storage & Persistence Architecture

Information storage follows strict separation of responsibilities.

---

## 1. Operational Store

Stores mutable application state.

Examples include:

- Users
- Organizations
- Policies
- Destinations
- Plans
- Workspace Settings

Optimized for transactional workloads.

---

## 2. Event Ledger

The Event Ledger is the immutable historical record.

Characteristics:

- Append-only
- Ordered
- Auditable
- Durable

Every Event enters the Event Ledger exactly once.

---

## 3. Evidence Store

Stores verifiable Evidence associated with Events.

Examples include:

- Digital signatures
- Images
- Cryptographic attestations
- Sensor payloads
- Device metadata

Evidence may be large.

Evidence remains immutable.

---

## 4. Reality Representation

Stores structural relationships between constitutional primitives.

The current implementation uses a Reality Graph.

Future implementations may differ while preserving constitutional semantics.

---

## 5. Projection Stores

Projection Stores support:

- Analytics
- Search
- AI
- Dashboards
- Knowledge Graph
- Identity Projection

Projection Stores are disposable.

They can always be rebuilt from the Event Ledger and the Reality Representation.

---

## 6. Cache Layer

Caches improve performance.

Caches are never authoritative.

They accelerate retrieval.

They do not define reality.

---

# PART VI — Information Governance & Lifecycle

Information governance ensures that Zyppi remains trustworthy over time.

---

## Provenance

Every derived piece of information must trace back to:

- Event
- Evidence

No derived information exists without provenance.

---

## Lineage

Every transformation must be explainable.

The complete derivation chain must remain observable.

---

## Verification

Evidence may be verified repeatedly.

Verification algorithms may improve.

Evidence never changes.

---

## Trust

Trust is computed.

Trust is never stored as immutable reality.

Trust may increase or decrease as new Evidence becomes available.

---

## Schema Evolution

Information models evolve.

Constitutional primitives do not.

Backward compatibility must preserve historical meaning.

---

## Retention

Operational data may expire.

Historical Events must follow constitutional retention policies.

Evidence retention depends upon legal, regulatory, and business requirements.

---

## Legal Hold

Historical information subject to legal requirements must remain immutable.

Legal holds override retention schedules.

---

## Data Sovereignty

Information storage must respect jurisdictional requirements.

Geographic boundaries are constitutional operational constraints.

---

## Auditability

Every projection must trace back to:

- Source Event
- Source Evidence

Nothing derived may become unauditable.

---

# Information Hierarchy

```text
Reality
    ↓
Observation
    ↓
Event
    ↓
Evidence
    ↓
Verification
    ↓
Trust
    ↓
Execution
    ↓
Knowledge
    ↓
Capabilities
```

Reality remains immutable.

Knowledge evolves.

Capabilities execute.

---

# Long-Term Vision

The enduring asset of Zyppi is not software.

It is the continuously expanding body of verifiable information describing interactions between reality and digital systems.

The long-term evolution of the platform is:

```text
Reality
    ↓
Events
    ↓
Evidence
    ↓
Verification
    ↓
Trust
    ↓
Knowledge
    ↓
Capabilities
    ↓
Autonomous Execution
```
---

> Every new capability should strengthen this information architecture without compromising its constitutional principles.
>
> **Software may evolve**.
>
> **Storage technologies may evolve**.
>
> **AI may evolve**.
>
> ... The **constitutional information model** *must* **remain stable**.