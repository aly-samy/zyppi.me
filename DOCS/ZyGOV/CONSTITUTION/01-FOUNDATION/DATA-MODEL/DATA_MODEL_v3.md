# Zyppi Data Model Bible v3
 
## Status
 
Controlled Document
 
## Last Updated
 
June 2026
 
## Depends On
 
 
- NORTH_STAR.md
 
- PRD.md
 
- TECH_ARCHITECTURE.md
 
- ZRM.md
 

  
# 1. Purpose
 
This document defines the business entities, ownership boundaries, semantic entities, relationship rules, and governance principles used throughout Zyppi.
 
The purpose of this document is not merely to model the application.
 
Its purpose is to model reality in a way that remains useful as products, interfaces, technologies, and distribution channels evolve.
 
Application schemas may change.
 
The Reality Model should endure.
  
# 2. Data Philosophy
 
Data outlives software.
 
Relationships outlive features.
 
Meaning outlives implementation.
 
Zyppi therefore separates:
 
### Operational State
 
The data required to run the platform.
 
Examples:
 
 
- Workspaces
 
- Links
 
- Domains
 
- Users
 
- Plans
 

 
and
 
### Reality Facts
 
The immutable facts describing what occurred in reality.
 
Examples:
 
 
- A human scanned a QR code.
 
- An AI agent requested information.
 
- A customer purchased a product.
 
- A package resolved to a digital identity.
 

 
Reality facts are captured once.
 
Understanding may evolve forever.
  
# PART I — OPERATIONAL DATA MODEL
 
# 3. Workspace
 
The workspace remains the primary ownership boundary.
 
Everything operational belongs directly or indirectly to a workspace.
 
Responsibilities:
 
 
- Billing
 
- Permissions
 
- Entitlements
 
- Ownership
 
- Configuration
 

 
Examples:
```
Workspace
  ├── Links  
  ├── Domains  
  ├── QR Codes  
  ├── Integrations  
  ├── API Keys  
  └── Users  
```
# 4. Link
 
A Link is a routing asset.
 
A Link is not a Reality Model entity.
 
A Link exists to execute traffic routing.
 
A Link may power:
 
 
- Smart Links
 
- Campaign Links
 
- Short Links
 
- QR Experiences
 
- NFC Experiences
 

  
# 5. Domain
 
Represents a branded namespace.
 
Examples:
 
 ```
- go.company.com
 
- music.artist.com
 
- qr.brand.com
 ```

 
Domains remain independent from links.
  
# 6. User
 
Represents a human platform identity.
 
Users do not own business data.
 
Workspaces own business data.
 
Users receive permissions.
  
# 7. Integrations
 
Represents external system connectivity.
 
Examples:
 
 
- GA4
 
- Meta
 
- HubSpot
 
- Shopify
 
- Zapier
 
- MCP
 

  
# 8. API Credentials
 
Represents machine access.
 
Examples:
 
 
- API Keys
 
- MCP Credentials
 
- OAuth Clients
 
- Webhook Secrets
 

  
# PART II — ZRM REALITY MODEL
 
# 9. Reality Model Overview
 
Zyppi captures reality through the Zyppi Reality Model (ZRM).
 
The ZRM is independent from products.
 
The ZRM answers:
 
> Who interacted?
 
> What was accessed?
 
> Where was it discovered?
 
> How was it reached?
 
> Why was it presented?
 
> What happened afterward?
  
# 10. Core Reality Entities
 
The Reality Model contains five foundational entities.
 
### Actor
 
The entity initiating an interaction.
 
Examples:
 
 
- Human
 
- Organization
 
- Device
 
- AI Agent
 

  
### Identity
 
The access mechanism.
 
Examples:
 
 
- QR Code
 
- NFC Tag
 
- Short Link
 
- GS1 Digital Link
 
- API Endpoint
 

  
### Referent
 
The thing being accessed.
 
Examples:
 
 
- Product
 
- Song
 
- Menu
 
- Website
 
- Digital Passport
 

  
### Surface
 
The environment where discovery occurred.
 
Examples:
 
 
- Product Package
 
- Restaurant Table
 
- Billboard
 
- Website
 
- Social Profile
 

  
### Campaign
 
The intentional distribution effort.
 
Examples:
 
 
- Ramadan Campaign
 
- Album Launch
 
- Product Promotion
 

  
# 11. Interactions
 
An Interaction is an immutable fact.
 
Interactions are first-class ledger records.
 
Interactions possess identity.
 
Interactions possess timestamps.
 
Interactions possess provenance.
 
Interactions possess confidence.
 
Interactions are captured once.
 
Interactions are never mutated.
  
# 12. Outcomes
 
Outcomes represent measurable results resulting from interactions.
 
Examples:
 
 
- Purchase
 
- Reservation
 
- Signup
 
- Stream
 
- Download
 

 
Outcomes may occur immediately or long after the originating interaction.
 
Outcomes are linked through attribution relationships.
  
# 13. Relationships Create Meaning
 
Entities alone possess little value.
 
Meaning emerges from relationships.
 
Examples:
```
Actor  ── ACCESSED ──► Identity  

Identity  ── RESOLVES_TO ──► Referent  

Surface  ── PRESENTS ──► Identity  

Campaign  ── PROMOTES ──► Referent  

Interaction  ── ATTRIBUTED_TO ──► Campaign  

Interaction  ── GENERATED ──► Outcome  
```
The graph is the asset.
 
Not the node.
  
# PART III — PROJECTION MODEL
 
# 14. Capture Layer
 
Reality is first captured as immutable envelopes.
 
Canonical Context Envelope (CCE):

 `Capture → Validate → Store ` 

No interpretation occurs during capture.
 
Capture first.
 
Understand later.
  
# 15. Interaction Ledger
 
The ledger is the source of truth.
 
Characteristics:
 
 
- Immutable
 
- Append-only
 
- Auditable
 
- Bitemporal
 

 
Every captured interaction receives:
 
 
- interaction_id
 
- valid_time
 
- system_time
 

  
# 16. Semantic Projection Engine
 
The Semantic Projection Engine (SPE) transforms captured facts into queryable graphs.
 
Responsibilities:
 
 
- Graph construction
 
- Relationship generation
 
- Rollups
 
- Attribution chains
 
- Inference generation
 

 
Projection may evolve.
 
Facts remain unchanged.
  
# 17. Analytics as Projection
 
Analytics are not source data.
 
Analytics are projections.
 
Examples:
 
 
- Daily scans
 
- Country breakdowns
 
- Campaign ROI
 
- Attribution reports
 

 
Reports may be rebuilt.
 
Facts cannot.
  
# PART IV — GOVERNANCE
 
# 18. Ownership Rules
 
Every operational entity must answer:
 
 
- Who owns me?
 
- Who created me?
 
- Who may modify me?
 

 
Every reality fact must answer:
 
 
- Who asserted me?
 
- How was I observed?
 
- How confident are we?
 

  
# 19. Provenance and Confidence
 
Every captured fact should support:
 
### Provenance
 
Examples:
 
 
- QR Scan
 
- NFC Tap
 
- API Request
 
- Imported Record
 

 
### Confidence
 
Range:

 `0.0 → 1.0 ` 

Confidence represents certainty of correctness.
 
Confidence travels with facts.
  
# 20. Bitemporal Requirements
 
Reality facts support:
 
### Valid Time
 
When reality occurred.
 
### System Time
 
When Zyppi learned about it.
 
Both values are mandatory.
  
# 21. Naming Standards
 
Operational IDs:

 `ws_xxxxx lnk_xxxxx dom_xxxxx usr_xxxxx ` 

Reality IDs:
```
actor_xxxxx 
identity_xxxxx 
referent_xxxxx 
surface_xxxxx 
campaign_xxxxx 
interaction_xxxxx 
outcome_xxxxx  
```
Identifiers must be opaque.
 
Identifiers must never expose implementation details.
  
# 22. Future-Proofing Rules
 
Before creating a new entity ask:
 
 
1. Is this a new business object?
 
2. Is this already representable through relationships?
 
3. Can metadata solve this?
 
4. Does this duplicate existing meaning?
 
5. Will it still make sense in ten years?
 

 
Prefer relationships over proliferation.
 
Prefer durable concepts over temporary products.
  
# 23. Long-Term Data Vision
 
The long-term value of Zyppi is not:
 
 
- QR Codes
 
- Links
 
- Redirects
 
- Campaigns
 

 
Those are entry points.
 
The enduring asset is the Reality Graph.
 
A continuously expanding understanding of:
 
 
- Actors
 
- Identities
 
- Referents
 
- Surfaces
 
- Campaigns
 
- Interactions
 
- Outcomes
 

 
and the relationships between them.
 
The application serves customers.
 
The graph compounds intelligence.
 
The graph becomes Zyppi's durable strategic asset.