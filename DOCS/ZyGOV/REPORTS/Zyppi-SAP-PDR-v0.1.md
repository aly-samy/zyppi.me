# Zyppi Commerce Workspace
 
## GS1 for SAP — Product Requirements Document
 
### Draft v0.1 — Product Vision & Functional Definition
 
**Status:** Draft **Product:** Zyppi Commerce Workspace — GS1 Edition **Primary Environment:** SAP **Initial Domain:** GS1 Digital Identity / 2D Barcode Readiness **Target Milestone:** GS1 Sunrise 2027 **Document Purpose:** Define the optimum customer-facing product before technical/platform mapping.
  
# 1. Executive Summary
 
Zyppi Commerce Workspace is an SAP-native commerce capability designed to make GS1 adoption effectively invisible to the enterprise user.
 
The customer continues working inside the SAP environment they already know.
 
They continue creating and maintaining products in SAP.
 
They continue using their existing inventory, production, sales, warehouse, packaging and printing workflows.
 
The Commerce Workspace adds the missing GS1 capabilities around those workflows:
 
 
- discover and assess products;
 
- establish GS1 identity;
 
- assign and manage GTINs;
 
- create GS1 Digital Links;
 
- generate GS1-compatible 2D codes;
 
- manage product and packaging information;
 
- integrate codes into existing labels;
 
- print through existing SAP printing workflows;
 
- monitor readiness and exceptions;
 
- maintain product identity throughout its lifecycle;
 
- provide evidence and operational visibility.
 

 
The fundamental product principle is:
 
 
**The user should feel that SAP has simply become GS1-ready.**
 
 
Zyppi should be almost invisible.
 
The customer does not need to learn a new platform, maintain a second product database, or repeatedly move between systems.
  
# 2. Product Vision
 
## 2.1 Vision Statement
 
Make the transition to GS1 2D barcodes so simple that an SAP customer can move from uncertainty to operational GS1 readiness with essentially one decision:
 
 
**"Make my products GS1-ready."**
 
 
The ideal customer experience is:
 
**Install → Discover → Review → Activate → Print → Operate**
 
Everything after activation should largely disappear into existing SAP workflows.
  
# 3. The Problem
 
GS1 adoption is not difficult because organizations cannot generate a QR code.
 
The real problem is that GS1 identity intersects with an enormous amount of existing enterprise complexity:
 
 
- thousands or hundreds of thousands of products;
 
- existing internal identifiers;
 
- existing EAN/UPC numbers;
 
- packaging hierarchies;
 
- multiple brands;
 
- multiple companies;
 
- multiple countries;
 
- multiple plants;
 
- existing labels;
 
- existing printers;
 
- existing SAP workflows;
 
- incomplete product data;
 
- legacy processes;
 
- regulatory requirements;
 
- different organizational owners.
 

 
Most available solutions treat GS1 as another external system.
 
That creates:
 
**SAP → Export → External GS1 Tool → Generate → Download → Modify Label → Upload → Print**
 
The Commerce Workspace should eliminate this chain.
 
The desired experience is:
 
**SAP → GS1-ready SAP**
  
# 4. Product Thesis
 
The product is not fundamentally a QR-code generator.
 
It is a **Commerce Identity Workspace** initially focused on GS1.
 
The QR code is the visible output.
 
The underlying product value is the ability to connect:
 
**Enterprise Product → External Identity → Digital Link → Physical Representation → Operational Workflow**
 
The GS1 Edition is therefore the first commercial wedge into a much broader Commerce Workspace.
  
# 5. Strategic Objective
 
The immediate objective is to become the easiest path for SAP customers to prepare for GS1 Sunrise 2027.
 
The product should make migration sufficiently frictionless that the rational customer decision becomes:
 
 
"Why would I build or buy another GS1 integration when this is already inside SAP?"
 
  
# 6. Product Principles
 
## 6.1 SAP-native
 
The user should remain inside SAP for normal operations.
 
## 6.2 Zero-learning-curve
 
The system should use concepts and workflows familiar to SAP users.
 
GS1 terminology should be progressively disclosed rather than forced upon the user.
 
## 6.3 Automation first
 
The system should perform bulk discovery, mapping, validation and generation automatically wherever confidence is sufficient.
 
## 6.4 Exceptions, not confirmations
 
Users should review problems rather than approve thousands of successful operations individually.
 
## 6.5 One product, multiple lenses
 
Different roles should see different experiences without creating separate products.
 
## 6.6 Existing workflow preservation
 
The module should adapt to existing SAP workflows rather than requiring organizations to redesign them.
 
## 6.7 Trust before convenience
 
Automatic operations must remain explainable, reversible where appropriate, and auditable.
 
## 6.8 Free GS1 entry
 
The base GS1 capability should be sufficiently frictionless to function as a distribution engine for the broader Commerce Workspace.
 
"Free" must not imply unauthorized or illegitimate GS1 identity issuance. Applicable GS1 licensing and membership requirements remain authoritative.
 
## 6.9 Invisible after activation
 
The ultimate success state is:
 
 
**Nothing happens because everything is working.**
 
  
# 7. Target Customers
 
### Primary
 
 
- SAP S/4HANA customers
 
- SAP ECC customers where technically supportable
 
- SAP Business One customers
 
- Manufacturers
 
- Consumer goods companies
 
- Food and beverage
 
- Retail suppliers
 
- Electronics
 
- Industrial products
 
- Pharma / medical devices
 
- Distributors
 
- 3PL organizations
 

 
### Secondary
 
 
- SAP implementation partners
 
- SAP consultants
 
- Master-data service providers
 
- GS1 consultants
 
- Enterprise compliance teams
 

  
# 8. Primary User Personas
 
## 8.1 Supply Chain / Operations Director
 
**Goal:** Make thousands of products GS1-ready quickly.
 
Needs:
 
 
- mass processing;
 
- readiness overview;
 
- automated mapping;
 
- exception management;
 
- compliance reporting.
 

  
## 8.2 Master Data Manager
 
**Goal:** Maintain correct product identity and attributes.
 
Needs:
 
 
- product-level GS1 status;
 
- GTIN management;
 
- attribute completeness;
 
- packaging hierarchy;
 
- change history;
 
- bulk editing.
 

  
## 8.3 Warehouse Operator
 
**Goal:** Print the correct label without interruption.
 
Needs:
 
 
- no new login;
 
- no new workflow;
 
- fast printing;
 
- reprinting;
 
- correct code automatically attached.
 

  
## 8.4 Production Manager
 
**Goal:** Ensure products leaving production carry valid identity.
 
Needs:
 
 
- production-triggered printing;
 
- packaging-level identity;
 
- batch/serial integration where applicable;
 
- exception notifications.
 

  
## 8.5 Compliance Officer
 
**Goal:** Know whether products are compliant and prove it.
 
Needs:
 
 
- readiness state;
 
- evidence;
 
- audit history;
 
- exportable reports;
 
- historical state.
 

  
## 8.6 Brand / Marketing Manager
 
**Goal:** Turn the GS1 Digital Link into a useful consumer-facing product connection.
 
Needs:
 
 
- destination preview;
 
- market-aware content;
 
- product experience;
 
- QR testing;
 
- basic scan intelligence.
 

  
## 8.7 SAP Administrator
 
**Goal:** Install and operate the capability safely.
 
Needs:
 
 
- controlled integration;
 
- authorization;
 
- monitoring;
 
- configuration;
 
- system health;
 
- minimal maintenance.
 

  
## 8.8 SAP Partner / Consultant
 
**Goal:** Deploy and manage the capability across multiple customers.
 
Needs:
 
 
- repeatable onboarding;
 
- templates;
 
- diagnostics;
 
- delegated administration;
 
- multi-client operational tooling.
 

  
# 9. The Core User Promise
 
The primary promise is:
 
 
**Connect your existing SAP products to GS1 without changing the way your people work.**
 
 
Secondary promise:
 
 
**Turn thousands of existing SAP products into GS1-ready products without manually processing them one by one.**
 
  
# 10. The Ideal First-Run Experience
 
The first-run experience is the most important product flow.
 
## Step 1 — Install
 
The administrator activates the Commerce Workspace.
 
No separate Zyppi account should be required for ordinary users.
  
## Step 2 — Discover
 
The Workspace evaluates the customer's SAP environment.
 
It identifies, where authorized and technically available:
 
 
- products;
 
- product types;
 
- existing identifiers;
 
- packaging information;
 
- units of measure;
 
- brands;
 
- countries;
 
- plants;
 
- existing labels;
 
- printing infrastructure;
 
- relevant product attributes.
 

 
The customer sees the result as a useful business summary rather than a technical data dump.
 
Example:
 
 
**23,481 products found**
 
18,426 appear relevant for GS1 activation 14,201 already contain candidate identifiers 3,184 require additional information 1,041 require manual review
 
  
# 11. The "15-Minute Readiness" Goal
 
The initial product should aim for a dramatic first-session result.
 
The target experience:
 
**Within approximately 15 minutes, the customer can understand:**
 
 
1. What products they have.
 
2. Which products can be activated automatically.
 
3. What information is missing.
 
4. Which existing identifiers can be retained/mapped.
 
5. What actions require human review.
 
6. What a finished GS1 label will look like.
 

 
The 15-minute figure is a product target, not a guarantee for every SAP environment.
  
# 12. Commerce Readiness Dashboard
 
The Workspace's primary entry point is the **Commerce Readiness Dashboard**.
 
Example:
 
 
## Commerce Readiness
 
**94% Ready**
 
18,426 products assessed 17,321 ready 1,105 require attention
 
### GS1
 
**96%**
 
✓ Identity assigned ✓ Digital Links available ⚠ 732 products missing required data ⚠ 41 packaging conflicts
 
**[Resolve Issues]**
 
**Sunrise 2027**
 
Ready: █████████████████░░ 94%
 
 
The score must always be explainable.
 
A user clicking the 94% figure must be able to determine exactly why the remaining 6% is not ready.
  
# 13. Onboarding Workflow
 
## Stage 1 — Company
 
Capture or identify:
 
 
- legal/company context;
 
- GS1 membership status;
 
- existing GS1 Company Prefixes;
 
- brands;
 
- countries;
 
- relevant organizational structures.
 

  
## Stage 2 — Product Discovery
 
Identify candidate products.
 
Filtering should include:
 
 
- material type;
 
- product hierarchy;
 
- brand;
 
- plant;
 
- country;
 
- sales organization;
 
- lifecycle status;
 
- packaging level.
 

  
## Stage 3 — Data Assessment
 
The system determines:
 
 
- available data;
 
- missing data;
 
- conflicting data;
 
- candidate mappings;
 
- existing identifiers;
 
- potential duplicate risks.
 

  
## Stage 4 — Mapping
 
The system proposes mappings between existing SAP information and GS1 requirements.
 
The user should see:
 
 
**Automatically mapped:** 96%
 
 
 
**Needs review:** 3%
 
 
 
**Cannot determine:** 1%
 
 
The user reviews exceptions rather than the entire dataset.
  
## Stage 5 — Identity
 
Where legally and operationally permitted:
 
 
- assign existing valid identifiers;
 
- allocate new identifiers;
 
- maintain identity relationships;
 
- identify packaging-level identities.
 

  
## Stage 6 — Digital Link
 
Generate the appropriate GS1 Digital Link representation.
 
The user does not need to manually construct the URI.
  
## Stage 7 — QR / 2D Code
 
Generate the required machine-readable representation.
 
The user can:
 
 
- preview;
 
- download where appropriate;
 
- attach to a product;
 
- place into a label;
 
- print.
 

  
## Stage 8 — Proof
 
Before completing onboarding, the customer should be able to:
 
 
1. See their own product.
 
2. See the generated code.
 
3. Print a real label.
 
4. Scan it with a phone.
 
5. See the expected destination.
 

 
This is the first major **Magic Moment**.
  
# 14. Product Identity Workspace
 
Every activated product receives a GS1 identity view.
 
Example:
 
### Product
 
**Material:** 1004592 **Description:** Premium Olive Oil 500ml
 
### Identity
 
**GTIN:** 00123456789012
 
**Status:** Ready
 
### Digital Link
 
`https://...`
 
### Code
 
QR preview
 
### Packaging
 
 
- Each
 
- Case
 
- Pallet
 

 
### Print
 
 
- Label template
 
- Printer
 
- Last print
 
- Reprint
 

 
### History
 
 
- Identity created
 
- Identity changed
 
- QR generated
 
- Label printed
 
- Status changes
 

  
# 15. Product CRUD
 
The Workspace should support product-level operations appropriate to GS1.
 
Users can:
 
 
- create;
 
- view;
 
- edit;
 
- activate;
 
- suspend;
 
- decommission;
 
- search;
 
- filter;
 
- bulk edit.
 

 
However, product lifecycle semantics must respect the distinction between ordinary enterprise data changes and permanent external identity history.
 
A product being deleted from SAP must not automatically imply that its historical external identity disappears.
  
# 16. Bulk Operations
 
Bulk processing is a core capability.
 
Users should be able to:
 
 
- select thousands of products;
 
- apply rules;
 
- assign identities;
 
- generate codes;
 
- validate;
 
- print;
 
- export results;
 
- resolve exceptions.
 

 
Example:
 
 
**Select:** All Finished Goods / Brand X / Retail
 
 
 
4,380 products selected
 
 
 
4,377 can be processed automatically
 
 
 
3 require review
 
 
**[Process 4,377]**
  
# 17. Rule-Based Processing
 
The Workspace should support business rules such as:
 
 
Material Type = Finished Goods Brand = X Sales Region = EU Packaging Level = Unit
 
 
→ Apply GS1 configuration.
 
Rules should operate on sets rather than requiring individual product decisions.
  
# 18. Packaging Hierarchy
 
GS1 identity must not be treated as a flat product attribute.
 
The Workspace should support relationships such as:
 
**Each → Inner → Case → Pallet**
 
The interface should visualize these relationships.
 
For each level, users can see:
 
 
- identity;
 
- quantity;
 
- packaging type;
 
- status;
 
- associated code;
 
- print configuration.
 

  
# 19. QR / 2D Code Generator
 
The generator should support:
 
 
- GS1 Digital Link;
 
- appropriate GS1 data structures;
 
- preview;
 
- validation;
 
- image rendering;
 
- print integration;
 
- bulk generation.
 

 
The product should never present "QR generation" as merely creating an arbitrary QR image.
 
The code is a machine-readable representation of an underlying product identity.
  
# 20. Label Integration
 
This is a critical differentiator.
 
The customer should not have to:
 
 
1. export QR;
 
2. open Illustrator;
 
3. edit artwork;
 
4. upload artwork;
 
5. manually print.
 

 
Instead:
 
 
**Existing SAP label + GS1 identity = finished label**
 
 
The Workspace should support existing SAP output and printing mechanisms wherever technically feasible.
  
# 21. Print Center
 
The Print Center provides:
 
 
- print;
 
- reprint;
 
- test print;
 
- print history;
 
- printer selection;
 
- template selection;
 
- failed-print queue;
 
- verification.
 

 
The user experience should remain familiar to existing SAP users.
  
# 22. Print Verification
 
Before production use, the system should be able to verify:
 
 
- code structure;
 
- required data;
 
- dimensions;
 
- quiet zone;
 
- placement;
 
- rendering;
 
- basic scanability criteria.
 

 
Where supported, the system should enable a practical:
 
 
**Print → Scan → Verify**
 
 
loop.
  
# 23. Monitoring
 
The Workspace continuously monitors operational state.
 
Examples:
 
 
- missing identity;
 
- invalid configuration;
 
- missing attributes;
 
- identity conflicts;
 
- failed generation;
 
- failed synchronization;
 
- failed printing;
 
- changed product data;
 
- packaging changes.
 

 
Users should not receive noise.
 
Only actionable issues should interrupt normal workflows.
  
# 24. Exception Center
 
The exception model is central to the UX.
 
Instead of:
 
 
"Review 18,426 products."
 
 
The system should say:
 
 
**18,423 products ready**
 
**3 need your attention**
 
 
Examples:
 
 
- Missing required attribute.
 
- Existing identifier conflict.
 
- Ambiguous packaging hierarchy.
 
- Invalid configuration.
 
- Print template unavailable.
 

 
Every exception should have:
 
**Problem → Explanation → Recommended action → Fix → Verification**
  
# 25. Notifications
 
Notifications should be SAP-native where possible.
 
Example:
 
 
**Product 1004592 needs attention**
 
Net content is missing.
 
**[Fix now]**
 
 
After correction:
 
 
✓ Product is now GS1 Ready.
 
  
# 26. Search
 
The Workspace should support searching by:
 
 
- SAP material number;
 
- GTIN;
 
- brand;
 
- description;
 
- product hierarchy;
 
- packaging level;
 
- status;
 
- country;
 
- identifier;
 
- Digital Link.
 

 
Users should be able to search using the identifier they already know.
  
# 27. Roles and Views
 
The same Workspace should adapt to the user.
 
### Operator
 
Minimal:
 
**Print / Reprint / Scan**
 
### Master Data
 
Detailed product and identity management.
 
### Compliance
 
Evidence, readiness and history.
 
### Management
 
Aggregate readiness and progress.
 
### Marketing
 
Consumer destination and experience.
 
### Administrator
 
Configuration and integration.
  
# 28. Consumer Experience
 
The GS1 Digital Link should eventually become more than a compliance destination.
 
The Workspace should provide a controlled preview:
 
 
**What will the customer see after scanning?**
 
 
The user can test:
 
 
- mobile experience;
 
- destination;
 
- language;
 
- market;
 
- product.
 

 
This should remain secondary to the core GS1 functionality in V1.
  
# 29. Analytics
 
The initial analytics layer should focus on useful operational intelligence.
 
Potential metrics:
 
 
- products activated;
 
- products ready;
 
- codes generated;
 
- labels printed;
 
- failures;
 
- exceptions;
 
- scans where legitimately available.
 

 
Analytics should never be confused with constitutional or authoritative identity state.
  
# 30. Audit & History
 
Every significant identity operation should be traceable.
 
Examples:
 
 
- who activated the product;
 
- when identity was assigned;
 
- what changed;
 
- who changed it;
 
- which code was generated;
 
- when it was printed;
 
- which version was active;
 
- when it was suspended/decommissioned.
 

 
Historical identity must remain intelligible even when the corresponding SAP product record changes.
  
# 31. Multi-Company / Multi-Brand
 
Enterprise customers may have:
 
 
- multiple legal entities;
 
- multiple brands;
 
- multiple GS1 prefixes;
 
- multiple countries;
 
- multiple SAP company codes.
 

 
The Workspace must prevent accidental cross-assignment.
 
Example:
 
 
Product belongs to Brand A.
 
 
 
Brand A is associated with Prefix A.
 
 
 
Prefix B cannot be used without explicit authorization.
 
  
# 32. Internationalization
 
The product should be designed for:
 
 
- multiple countries;
 
- multiple languages;
 
- different GS1 member organizations;
 
- different regulatory contexts;
 
- different units of measure;
 
- regional product requirements.
 

  
# 33. Failure Philosophy
 
The module must fail safely.
 
If the commerce service is unavailable:
 
 
- existing SAP workflows should not unexpectedly corrupt;
 
- already-established identity should remain recognizable;
 
- printing behavior should be predictable;
 
- queued work should be recoverable;
 
- users should receive clear status;
 
- no silent identity mutation should occur.
 

  
# 34. Security & Trust
 
The product will operate around commercially sensitive product information.
 
Requirements include:
 
 
- least-privilege access;
 
- SAP authorization integration;
 
- secure authentication;
 
- encrypted communication;
 
- tenant isolation;
 
- controlled data exposure;
 
- auditable administrative operations.
 

 
The product should never require more enterprise data than necessary for the requested capability.
  
# 35. "Free GS1" Strategy
 
The GS1 Edition is intended to be the adoption wedge.
 
The customer should be able to obtain substantial GS1 operational value without first purchasing a broad commerce platform.
 
The free capability should include enough functionality to solve the immediate problem:
 
 
- product assessment;
 
- GS1 readiness;
 
- identity management;
 
- Digital Link;
 
- code generation;
 
- basic printing;
 
- monitoring.
 

 
The broader commercial opportunity comes later through additional capabilities.
 
The product must avoid creating an artificial crippled experience merely to force payment.
  
# 36. Future Commerce Workspace
 
The initial workspace is GS1-focused.
 
The product architecture and UX should nevertheless leave room for additional commerce capabilities.
 
Potential future areas:
 
 
- Digital Product Passport;
 
- product traceability;
 
- EPCIS;
 
- sustainability;
 
- EUDR;
 
- carbon information;
 
- consumer product experiences;
 
- authentication;
 
- resale;
 
- marketplaces;
 
- product intelligence.
 

 
These are **future capabilities**, not V1 requirements.
  
# 37. The Six Laws of the Product
 
The product should be judged against six laws.
 
### Law 1 — Proof before configuration
 
The first session should produce something tangible.
 
### Law 2 — Rules over items
 
Process thousands of products through rules.
 
### Law 3 — SAP is the verb; GS1 is the capability
 
Users should not feel that they are operating a separate GS1 application.
 
### Law 4 — Trust the print
 
The final physical output must be treated as a serious operational artifact.
 
### Law 5 — Serve the ecosystem
 
The product must eventually support enterprises, consultants, partners and multi-company operations.
 
### Law 6 — Steady state is silence
 
After activation, the ideal product becomes nearly invisible.
  
# 38. Magic Moments
 
The product should intentionally create several moments where its value becomes immediately obvious.
 
### Magic Moment 1
 
The customer clicks:
 
**Make my products GS1-ready**
 
and sees thousands of products assessed automatically.
 
### Magic Moment 2
 
The readiness score rises dramatically after automated processing.
 
### Magic Moment 3
 
The customer's own product receives its GS1 identity.
 
### Magic Moment 4
 
A real label prints through their existing SAP workflow.
 
### Magic Moment 5
 
The customer scans the printed code with an ordinary phone.
 
### Magic Moment 6
 
Weeks later, employees are still using SAP exactly as before.
 
The GS1 capability simply works.
  
# 39. Success Metrics
 
## Adoption
 
 
- Number of SAP installations activated.
 
- Activation-to-first-product time.
 
- Activation-to-first-print time.
 

 
## Usability
 
 
- Median onboarding completion time.
 
- Percentage of products processed automatically.
 
- Percentage of users requiring support.
 
- Number of manual steps per product.
 

 
## Operational
 
 
- Identity assignment success rate.
 
- QR generation success rate.
 
- Print success rate.
 
- Exception resolution time.
 
- Synchronization failure rate.
 

 
## Customer Value
 
 
- Percentage of products GS1-ready.
 
- Time saved versus manual GS1 onboarding.
 
- Number of products activated per customer.
 
- Percentage of customers remaining operational after activation without support.
 

 
## Strategic
 
 
- Number of SAP customers entering the Zyppi Commerce ecosystem.
 
- Conversion from GS1 capability to additional Commerce Workspace capabilities.
 

  
# 40. Definition of Product Success
 
The product succeeds when a customer can truthfully say:
 
 
"We didn't implement another system. SAP just became GS1-ready."
 
 
The ultimate test is not whether users understand Zyppi.
 
It is whether they **don't need to**.
  
# 41. V1 Scope
 
### Must Have
 
 
- SAP-native entry point
 
- onboarding
 
- product discovery
 
- readiness assessment
 
- GS1 identity management
 
- GTIN handling
 
- Digital Link generation
 
- QR/2D generation
 
- product CRUD
 
- bulk operations
 
- packaging hierarchy
 
- label integration
 
- printing
 
- monitoring
 
- exception handling
 
- basic audit/history
 
- role-based views
 
- secure authentication/integration
 

 
### Should Have
 
 
- first-run automated mapping
 
- print verification
 
- mobile scan verification
 
- consumer preview
 
- multi-brand support
 
- multi-prefix support
 
- advanced bulk rules
 
- readiness reporting
 

 
### Could Have
 
 
- scan analytics
 
- consultant mode
 
- advanced label validation
 
- mobile companion
 
- advanced consumer experience
 

 
### Explicitly Deferred
 
 
- DPP implementation
 
- EUDR implementation
 
- full EPCIS implementation
 
- ESG platform
 
- carbon platform
 
- broad marketplace functionality
 
- unrelated commerce wedges
 

  
# 42. Product Boundary
 
This PRD intentionally defines the **customer-facing product**, not the underlying Zyppi constitutional implementation.
 
The following questions are deliberately deferred:
 
 
- Which Zyppi layer owns each operation?
 
- How ZRM represents the product state.
 
- How SIOS governs the capability.
 
- How the Commerce Atlas Runtime executes requests.
 
- Exact Registry contracts.
 
- Exact Evidence structures.
 
- SAP-to-Zyppi transport architecture.
 
- Synchronous versus asynchronous integration.
 
- BTP versus other deployment models.
 
- Exact ABAP/API implementation.
 
- Constitutional milestone mapping.
 

 
Those questions belong to the subsequent **Platform & Constitutional Mapping phase**.
 
The product must first be sufficiently clear that those architectural decisions can be evaluated against it.
  
# 43. North-Star User Journey
 
The complete V1 journey can ultimately be reduced to:
 
**Install**
 
↓
 
**Open Commerce Workspace**
 
↓
 
**Assess SAP Products**
 
↓
 
**"18,426 products found"**
 
↓
 
**"17,900 can be activated automatically"**
 
↓
 
**Review Exceptions**
 
↓
 
**Activate GS1**
 
↓
 
**GTINs / Identities Assigned**
 
↓
 
**Digital Links Generated**
 
↓
 
**QR Codes Generated**
 
↓
 
**Existing SAP Label Updated**
 
↓
 
**Print**
 
↓
 
**Scan**
 
↓
 
**Verified**
 
↓
 
**Monitor**
 
↓
 
**Operate Normally**
 
The ideal endpoint is not another dashboard.
 
It is:
 
 
**SAP continues working exactly as before — except the enterprise is now GS1-ready.**
 
  
# 44. Product Positioning
 
Externally, the product should not initially be marketed as:
 
 
"A Zyppi GS1 integration."
 
 
The stronger positioning is:
 
 
**GS1 for SAP. Without the GS1 project.**
 
 
Or:
 
 
**Make SAP GS1-ready.**
 
 
The customer's mental model should be an SAP capability, not a new technology platform.
 
Zyppi can remain the technology behind the experience.
  
# 45. The Core Strategic Insight
 
The most important conclusion of this PRD is that **GS1 is the entry point, not the product's ultimate identity**.
 
The product begins with an urgent, concrete problem:
 
 
"I need my SAP products ready for GS1 Sunrise 2027."
 
 
It solves that problem exceptionally well.
 
But the resulting Workspace establishes a reusable relationship between:
 
**Enterprise product data**
 
and
 
**external commerce identity**
 
That relationship can later support additional commerce capabilities without forcing the customer to start another transformation project.
 
Therefore:
 
 
**GS1 is the wedge. Commerce Workspace is the product.**
 
**The user's SAP environment is the home.**
 
**Zyppi is the invisible capability behind it.**