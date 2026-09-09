# Zyppi Technical Architecture Bible

# Constitutional Metadata Compilation: Zyppi Technical Architecture Bible v4.1

## Constitutional Metadata Header

| Field | Value |
|-------|-------|
| Document ID | |
| Constitutional URI | |
| Canonical Name | ZYPPI_TECHNICAL_ARCHITECTURE_BIBLE_v4.2 |
| Document Family | Zyppi Constitutional Corpus |
| Title | Zyppi Technical Architecture Bible |
| Version | 4.2 |
| Status | Draft — Proposed for Ratification |
| Classification | Runtime Constitution |
| Normative Level | Normative |
| Domain | System Architecture |
| Constitutional Tier | Needs Ratification |
| Constitutional Role | Needs Ratification |
| Lifecycle | Active |
| Owner | Not Specified |
| Steward | Not Specified |
| Created | Not Specified |
| Last Updated | 2026-07 |
| Effective Date | Not Specified |
| Parent Document | FOUNDING-PRINCIPLES-v5.0.md (nearest constitutional parent) |
| Depends On | NORTH-STAR-v6.0.md, FOUNDING-PRINCIPLES-v5.0.md, PRD-v4.1.md |
| Required By | To Be Resolved During Repository Dependency Mapping |
| Related Documents | To Be Resolved During Repository Dependency Mapping |
| Supersedes | ZYPPI_TECHNICAL_ARCHITECTURE_BIBLE_v4.1 |
| Superseded By | To Be Resolved During Repository Dependency Mapping |
| Authority Scope | Needs Ratification |
| Amendment Policy | Constitutional Amendment Required |
| Compatibility | Not Specified |
| Keywords | Architecture, Subject, Object, Place, Event, Evidence, Context, Routing, Trust, Execution, Decision Engine, Event Ledger, Capabilities |
| Defines | Identity Layer, Context Layer, Decision Engine, Routing Layer, Event Ledger, Routing Intelligence, Enterprise Capabilities, Execution Layer, ADRs, Universal Execution Pipeline |
| Amendment Class | Primitive Reconciliation — see 00-RECONCILIATION-NOTE.md §8 |
| Change Log | Version 4.2: "Actor" context/input dimension retitled "Subject" throughout; Identity Layer's "Human identities" / "Organization identities" consolidated under "Subject identities" per North Star v6.0; one clarifying cross-reference added in §3 tying this document's engineering-level pipeline to North Star's vision-level Universal Execution Pipeline. No other substantive change from v4.1. |
| Constitutional Hash | Reserved |
| UUID | Reserved |

---

# Purpose

This document defines the constitutional architecture of Zyppi.

The North Star explains **why Zyppi exists.**

The Founding Principles explain **how Zyppi must evolve.**

The PRD explains **what Zyppi builds.**

The Technical Architecture Bible explains **how Zyppi is engineered.**

It defines:

- Engineering philosophy
- System boundaries
- Architectural principles
- Platform components
- Data ownership
- Operational constraints
- Long-term technical direction

Every engineering decision must move Zyppi toward becoming the Universal Trust Execution Platform.

---

# 1. Architecture Philosophy

Zyppi is not a website.

Zyppi is not a dashboard.

Zyppi is not a CMS.

Zyppi is not a Digital Product Passport platform.

Zyppi is not an ERP.

Zyppi is the **Identity and Routing Layer for Physical Products.**

It connects the physical world to existing digital systems through context-aware routing, immutable events, and trusted execution.

Every architectural decision should strengthen one or more of:

- Reality
- Identity
- Context
- Routing
- Trust
- Execution
- Reliability
- Simplicity

---

# 2. Constitutional Engineering Principles

## Principle 1 — Identity Before Everything
```
Every interaction begins with a permanent identity.
```
Without identity there is:

- no routing
- no events
- no trust
- no execution

> Identity is the root of the platform.

---

## Principle 2 — Context Creates Meaning
```
Identity alone is insufficient.

Every routing decision depends on context.
```
Context may include:

- Subject
- Geography
- Device
- Language
- Time
- Previous interactions
- Authentication state
- Permissions
- Product lifecycle
- Policies

> Context is gathered before any routing decision.

---

## Principle 3 — Routing Is Sacred
```
Routing is Zyppi's primary workload.

Nothing should unnecessarily delay or interfere with a routing decision.
```
A dashboard may be slow.

Analytics may lag.

Integrations may fail.

> Routing must continue.

---

## Principle 4 — Events Are Immutable Facts
```
Every meaningful interaction produces an immutable event.
```
Events are evidence.

They are never modified.

> Historical truth is append-only.

---

## Principle 5 — Intelligence Never Blocks Routing

Analytics.

AI.

Reporting.

Aggregation.

Enterprise workflows.

All consume routing events.

> None participate in the routing critical path.

---

## Principle 6 — Capabilities Over Applications

Applications solve today's problems.

Capabilities solve tomorrow's industries.

> Engineering should build reusable capabilities rather than application-specific logic.

---

## Principle 7 — Explainability Is Mandatory

Every routing decision should be explainable.

Every trust decision should be reproducible.

Every execution should produce evidence.

---

# 3. Universal Execution Pipeline

This is the engineering-level expression of North Star v6.0's vision-level Universal Execution Pipeline (Reality → Observation → Verification → Trust → Intent → Capability Discovery → AI Orchestration → Execution → Proof → Receipt). The two are not competing definitions: North Star describes what must constitutionally happen; this section describes the concrete architectural stages that make it happen. Identity resolves Subject/Object; Context Detection gathers Place and situational Evidence; the Decision Engine evaluates Trust and Intent; the Event Ledger is where Evidence is committed.

Every interaction follows the same architectural flow.

```
Identity

↓

Context Detection

↓

Decision Engine

↓

Destination Resolution

↓

Event Ledger

↓

Routing Intelligence

↓

Enterprise Capabilities

↓

AI Execution
```

No subsystem should bypass this pipeline.

---

# 4. Platform Architecture

The platform is composed of eight architectural layers.

---

## Layer 1 — Identity Layer

**Responsible for:**

- Product identities
- Subject identities (Human, Organization, AI Agent)
- Place identities
- Carrier abstraction
- GS1 Digital Links
- QR
- NFC

**Purpose:**

Provide permanent digital identities.

---

## Layer 2 — Context Layer

Responsible for understanding every interaction.

**Examples:**

- Who is interacting
- Where
- Which device
- Which permissions
- Previous history
- Product lifecycle
- Applicable policies

**Purpose:**

Transform identity into meaningful context.

---

## Layer 3 — Decision Engine

The Decision Engine is Zyppi's core.

**Responsibilities:**

- Evaluate context
- Evaluate routing policies
- Evaluate permissions
- Evaluate trust signals
- Select destination

The Decision Engine performs no business logic outside routing.

It only determines:

**Where should this interaction go?**

---

## Layer 4 — Routing Layer

**Responsible for:**

- Destination resolution
- Redirect execution
- Routing policies
- Deterministic execution
- Global routing

**Requirements:**

- Stateless
- Predictable
- Horizontally scalable
- Ultra-low latency

---

## Layer 5 — Event Ledger

Every routing decision becomes evidence.

**Responsibilities:**

- Immutable event storage
- Intent history
- Routing history
- Audit history
- Attribution

The Event Ledger is append-only.

It never rewrites history.

---

## Layer 6 — Routing Intelligence

Consumes the Event Ledger.

**Produces:**

- Analytics
- Trends
- Attribution
- Routing optimization
- Operational insights
- Enterprise intelligence

This layer compounds over time.

---

## Layer 7 — Enterprise Capabilities

Business capabilities are built on top of routing intelligence.

**Examples:**

- Warranty
- Product Authentication
- Recall Management
- Product Registration
- Digital Product Passport
- Dealer Routing
- Service Routing
- Compliance

These are routing policies—not separate products.

---

## Layer 8 — Execution Layer

Exposes Zyppi to the outside world.

Interfaces include:

- Dashboard
- APIs
- Webhooks
- MCP
- AI Agents
- Enterprise integrations

Humans and AI consume the same capabilities.

---

# 5. System Boundaries

## Zyppi Owns

- Permanent identities
- Routing rules
- Context evaluation
- Decision engine
- Destination references
- Policies
- Event ledger
- Intent history
- Routing intelligence
- Trust evidence
- Capability execution

---

## Zyppi Does NOT Own

- Manuals
- Videos
- Product media
- CRM data
- ERP records
- Warranty tickets
- Service cases
- Marketing content

Zyppi routes to systems.

It does not replace them.

---

# 6. Routing Architecture

Every request follows the same deterministic path.

```
Identity

↓

Load Context

↓

Evaluate Policies

↓

Evaluate Permissions

↓

Resolve Destination

↓

Execute Route

↓

Emit Event
```

Nothing else belongs in the critical execution path.

---

# 7. Decision Engine

The Decision Engine is responsible for determining the correct destination.

Inputs include:

- Product identity
- Subject
- Geography
- Device
- Language
- Authentication
- Previous events
- Product lifecycle
- Organization policies

**Output:**

Exactly one routing decision.

The engine never:

- Calls external APIs
- Performs analytics
- Generates reports
- Executes enterprise workflows

Its sole responsibility is deterministic destination selection.

---

# 8. Destination Architecture

Destinations are references.

Not hosted experiences.

Destination types include:

- Websites
- Deep links
- Dealer portals
- ERP screens
- CRM systems
- DPP portals
- Service manuals
- APIs

Zyppi stores destination references.

Never destination content.

---

# 9. Fallback Rendering

When no customer destination exists, Zyppi renders a lightweight fallback page.

The renderer may display:

- Product identity
- Warranty registration
- Structured DPP information
- Basic product details
- Brand identity

The renderer is configuration-driven.

It is not a CMS.

It is not a content platform.

---

# 10. Event Architecture

Events are constitutional records.

Every meaningful action emits immutable events.

**Examples:**

- Product Registered
- Identity Created
- QR Generated
- Digital Link Resolved
- Route Executed
- Policy Updated
- Trust Evaluated
- Capability Executed
- Workspace Created
- AI Execution Completed

Events enable:

- Auditability
- Analytics
- AI
- Automation
- Enterprise workflows

---

# 11. Data Architecture

Operational state and historical evidence remain separate.

## Operational Store

Stores current state.

Optimized for transactional workloads.

---

## Event Ledger

Stores immutable historical facts.

Append-only.

Source of truth for history.

---

## Analytics Store

Derived from events.

Optimized for reporting.

Never participates in routing.

---

## Cache

Accelerates reads.

Never becomes the source of truth.

---

# 12. Security Architecture

## Zero Trust

Every request is authenticated.

Every request is authorized.

Internal services receive no implicit trust.

---

## Least Privilege

Every participant receives the minimum permissions required.

---

## Explainable Authorization

Every authorization decision is reproducible.

---

## Auditability

Every state change records:

- Who
- What
- When
- Why
- Result

---

## Secret Isolation

Secrets never appear in:

- Logs
- Events
- Analytics
- Client applications

---

# 13. Reliability Standards

## Routing

**Target:**

99.99%

---

## Identity Resolution

Ultra-low latency.

---

## APIs

99.9%

---

## Dashboard

99.9%

---

## Event Delivery

At-least-once delivery.

---

## Analytics Freshness

Under 60 seconds.

---

## Trust Evaluation

Deterministic.

---

# 14. AI-Native Architecture

AI is a constitutional participant.

AI interacts through:

- MCP
- APIs
- Capability discovery
- Enterprise workflows

AI follows the same execution pipeline as humans.

It never bypasses:

- Identity
- Context
- Policies
- Routing
- Trust

---

# 15. Integration Architecture

Integrations extend platform capabilities.

Supported categories:

## Enterprise

- ERP
- CRM
- PLM

---

## Commerce

- Shopify
- Commerce platforms

---

## Identity

- Identity Providers
- Verifiable Credentials

---

## Automation

- Zapier
- Make
- n8n

---

## Analytics

- GA4
- Meta
- Enterprise BI

---

## AI

- MCP
- AI ecosystems

Every integration must strengthen routing or execution.

Not replace them.

---

# 16. Architecture Decision Records (ADR)

Every major architectural decision requires an ADR.

**Structure:**

- Context
- Decision
- Alternatives
- Consequences
- Constitutional Alignment

**Examples:**

- ADR-001 Identity Architecture
- ADR-002 Decision Engine
- ADR-003 Event Ledger
- ADR-004 Routing Engine
- ADR-005 Capability Graph
- ADR-006 Trust Engine
- ADR-007 AI Execution

---

# 17. Technical Decision Framework

Before introducing any technology, ask:

1. Does it strengthen permanent identity?
2. Does it improve context awareness?
3. Does it simplify routing?
4. Does it preserve deterministic execution?
5. Does it strengthen the Event Ledger?
6. Does it improve explainability?
7. Does it reduce operational complexity?
8. Does it avoid feature gravity?
9. Can existing infrastructure already solve this?

If the answer is predominantly **No**, the proposal should be rejected.

---

# 18. Long-Term Technical Vision

Today's Zyppi routes users to the correct destination.

Tomorrow, it becomes the trusted execution layer connecting physical reality, enterprise systems, and AI.

Its long-term evolution is:

```
Identity

↓

Context

↓

Decision

↓

Routing

↓

Events

↓

Routing Intelligence

↓

Enterprise Capabilities

↓

Trust

↓

Autonomous AI Execution
```

Every technical decision should move the platform toward that future while preserving the platform's core promise:

**Identify once. Route forever.**
