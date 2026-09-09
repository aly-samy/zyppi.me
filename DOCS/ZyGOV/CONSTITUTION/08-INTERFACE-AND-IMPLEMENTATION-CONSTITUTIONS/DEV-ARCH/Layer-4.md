# Layer 4
 
## DEV-ROADMAP-001
 
**Developer Platform Documentation Roadmap**
 
**Purpose**
 
Defines the scope, organization, relationships, and writing order of every Developer Platform document.
 
This document is the navigation guide for Layer 4.
 
It introduces **no constitutional behavior.**
 
It references existing constitutional documents.
 
It defines documentation boundaries only.
  
It should cover:
 
# PART I — Philosophy
 
Why Layer 4 exists
 
Developer Experience principles
 
Design goals
 
Non-goals
 
Relationship to Layers 1–3
  
# PART II — Layer 4 Architecture
 
Explain the developer platform at a very high level.
 
Not technical.
 
Something like
 `Developer Journey         │         ▼ Developer Guides         │         ▼ Platform Interfaces         │  ┌──────┼─────────┐  │      │         │ SDK    API      CLI  │      │         │ Plugins Marketplace DevTools `  
# PART III — Consumer Personas
 
Who consumes Zyppi?
 
For example
 
 
1.  
Independent Developer
 
 
2.  
Startup
 
 
3.  
Enterprise
 
 
4.  
ERP Vendor
 
 
5.  
CMS Developer
 
 
6.  
Mobile Developer
 
 
7.  
IoT Developer
 
 
8.  
AI Agent Developer
 
 
9.  
Government
 
 
10.  
Healthcare
 
 
11.  
Manufacturing
 
 
12.  
System Integrator
 
 

 
Each persona links to journeys.
  
# PART IV — Developer Journeys
 
This becomes the heart of Layer 4.
 
Instead of organizing around documents...
 
organize around problems.
 
For example
 
Journey 1
 
Authenticate Product
 
Journey 2
 
Create Product Passport
 
Journey 3
 
Transfer Ownership
 
Journey 4
 
Issue Credential
 
Journey 5
 
Execute Blueprint
 
Journey 6
 
Integrate ERP
 
Journey 7
 
Build Mobile App
 
Journey 8
 
Deploy AI Agent
 
Journey 9
 
Federate Organizations
 
Journey 10
 
Publish Marketplace Plugin
 
Each journey should later point to every relevant specification.
  
# PART V — Platform Surface
 
Describe every public interface.
 
Not the implementation.
 
Only what exists.
 
Examples
 
SDKs
 
REST API
 
GraphQL
 
CLI
 
Plugins
 
Marketplace
 
Developer Portal
 
Playground
 
Webhooks
 
Events
 
Reference Apps
 
Documentation
  
# PART VI — Specification Catalog
 
This is the roadmap of actual documents.
 
For each document:
 
Purpose
 
Consumes
 
Produces
 
Dependencies
 
Writing Order
 
Example:
 
### PLATFORM-SPEC-001
 
Purpose
 
Developer platform philosophy
 
Consumes
 
North Star
 
ZRM
 
Founding Principles
 
Produces
 
Platform vision
 
Dependencies
 
None
  
### SDK-SPEC-001
 
Purpose
 
SDK philosophy
 
Consumes
 
Platform Spec
 
RI
 
POL
 
Produces
 
SDK conventions
  
### API-SPEC-001
 
Purpose
 
Public APIs
 
Consumes
 
SDK
 
Runtime
 
Identity
 
Produces
 
API contracts
 
...
 
Repeat for:
 
 
- CLI-SPEC-001
 
- PLUGIN-SPEC-001
 
- DEVTOOLS-SPEC-001
 
- MARKETPLACE-SPEC-001
 

  
# PART VII — Writing Order
 
This is extremely important.
 
Instead of randomly writing documents, freeze the sequence.
 
For example:
 `1 DEV-ROADMAP-001  2 PLATFORM-SPEC-001  3 SDK-SPEC-001  4 API-SPEC-001  5 CLI-SPEC-001  6 DEVTOOLS-SPEC-001  7 PLUGIN-SPEC-001  8 MARKETPLACE-SPEC-001 ` 
Each document should only depend on completed predecessors.
  
# PART VIII — Traceability Matrix
 
Show how every document maps back to the Constitution.
 
Example:
 
  
 
Layer 4 Document
 
Consumes
 
   
 
PLATFORM-SPEC-001
 
North Star, Founding Principles, ZRM
 
 
 
SDK-SPEC-001
 
PLATFORM-SPEC-001, RI, POL, SEC
 
 
 
API-SPEC-001
 
RI, SDK-SPEC-001
 
 
 
CLI-SPEC-001
 
SDK-SPEC-001
 
 
 
DEVTOOLS-SPEC-001
 
SDK, API
 
 
 
PLUGIN-SPEC-001
 
SDK, API, Federation
 
 
 
MARKETPLACE-SPEC-001
 
Plugin, Security
 
  
 
This guarantees Layer 4 never invents constitutional behavior.
  
## One refinement I would add
 
I would **not** call it "Developer Roadmap."
 
A roadmap usually implies time and milestones.
 
This document is really the **architecture of the documentation itself**.
 
I'd name it:
 
**DEV-ARCH-001 — Developer Platform Documentation Architecture**
 
or
 
**DEV-GUIDE-001 — Layer 4 Documentation Guide**
 
These names better reflect that it is a permanent architectural reference rather than a project schedule.
 
This document will become the table of contents, dependency graph, and writing guide for the entire Developer Platform layer, making every subsequent specification easier to write and maintain.