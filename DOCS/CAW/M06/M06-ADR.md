# M06-ADR — GS1 Digital Link Resolution
 
## Constitutional Scope & Architecture Decision Record
 
  
 
Field
 
Value
 
   
 
**Document ID**
 
`M06-ADR`
 
 
 
**Title**
 
M06 — GS1 Digital Link Resolution: Constitutional Scope & Architecture Decision Record
 
 
 
**Status**
 
`RATIFIED — IMPLEMENTATION GATED`
 
 
 
**Authority**
 
Chair, Zyppi Constitutional Council
 
 
 
**Program**
 
CAW-011 — Commerce Atlas Wedge Build Order
 
 
 
**Milestone**
 
M06 — GS1 Digital Link Resolution
 
 
 
**Date**
 
August 5, 2026
 
 
 
**Implementation Authority**
 
**NOT YET GRANTED**
 
 
 
**Predecessor**
 
`DOCS/CAW/M06/M06-PREP.md`
 
 
 
**Next Required Artifact**
 
`G-06-01 — GS1 Standards Authority Verification`
 
  
  
# 1. Purpose
 
This record converts the repository findings of `M06-PREP` into the binding constitutional scope and architectural direction for M06.
 
It establishes:
 
 
1. what M06 is responsible for;
 
2. what M06 is not responsible for;
 
3. the semantic boundary between a GS1 identifier and a GS1 Digital Link;
 
4. the separation between pure GS1 interpretation and Registry-backed identity resolution;
 
5. the required distinction among invalidity, unsupported content, registry absence, registry failure, and successful resolution;
 
6. the standards-governance gate that must be completed before implementation planning; and
 
7. the architectural constraints from which the detailed M06 execution plan and `AMS-0601` shall be derived.
 

 
This record does **not** authorize implementation.
 
No production code, test code, package structure, dependency, or roadmap task is created or modified by this record.
  
# 2. Constitutional Position of M06
 
## 2.1 M06's Function
 
M06 is the constitutional bridge between an external GS1 Digital Link input and Zyppi's internal identity Registry.
 
Its function is:
 
 
**Interpret a GS1 Digital Link according to the governing GS1 standards, normalize the supported identity reference deterministically, and determine whether that identity is known to the Zyppi Registry.**
 
 
M06 performs **identification and resolution**.
 
M06 does not perform constitutional verification.
 
The conceptual flow is:
 `Untrusted GS1 Digital Link input               ↓       Parse and interpret               ↓        Validate structure               ↓       Normalize deterministically               ↓       Resolve against Registry               ↓ Typed resolution outcome ` 
M06 therefore answers:
 
 
**“What known Zyppi constitutional identity, if any, does this supported GS1 Digital Link resolve to?”**
 
 
M06 does not answer:
 
 
“Is the product authentic?”
 
 
 
“Is the identity trusted?”
 
 
 
“Is the identity constitutionally authorized?”
 
 
 
“Does the evidence prove the claim?”
 
 
Those questions belong to later constitutional stages.
  
## 2.2 M06's Position in the CAW
 
M06 remains the existing CAW milestone:
 `M05 — Registry Layer           ↓ M06 — GS1 Digital Link Resolution           ↓ M08 — Runtime Verification Pipeline ` 
M06 provides resolved identity information required by later Runtime verification work. It does not absorb Runtime verification responsibilities.
 
The authoritative M06 implementation sequence remains:
 
  
 
ID
 
Task
 
Dependency
 
   
 
`IT-0601`
 
GS1 Parser
 
`IT-0302`
 
 
 
`IT-0602`
 
GS1 Validator
 
`IT-0601`
 
 
 
`IT-0603`
 
Digital Link Normalizer
 
`IT-0601`
 
 
 
`IT-0604`
 
Identity Resolver
 
`IT-0603`, `IT-0503`
 
 
 
`IT-0605`
 
Parser Benchmarks
 
`IT-0604`
 
 
 
`IT-0606`
 
Replay Validation
 
`IT-0604`, `IT-0406`
 
  
 
This ADR does not create replacement tasks, alter task identifiers, or establish a parallel roadmap.
 
Any implementation decomposition shall remain attributable to these CAW work items.
  
# 3. Binding Architectural Decisions
 
## M06-D01 — M06 Is Identification and Resolution, Not Verification
 
**Status:** `RATIFIED`
 
M06 establishes only the following:
 
 
1. whether an input can be interpreted under the pinned GS1 rules;
 
2. whether the interpreted content is within the approved M06 support profile;
 
3. what deterministic normalized identity reference results; and
 
4. whether the Registry contains a corresponding constitutional identity.
 

 
M06 shall not evaluate:
 
 
- evidence;
 
- authenticity;
 
- trust;
 
- standing;
 
- authority;
 
- capability;
 
- policy;
 
- constitutional authorization;
 
- Runtime outcomes; or
 
- execution receipts.
 

 
A successful M06 resolution is a **Registry lookup result**, not a verification result.
 
No M06 type, API, test name, documentation statement, or downstream integration may represent successful resolution as “verified,” “trusted,” “authentic,” or “authorized.”
  
## M06-D02 — `GS1Identifier` Remains a Narrow Identifier Value Object
 
**Status:** `RATIFIED`
 
The existing M03 `GS1Identifier` represents the validated GTIN identity value.
 
It shall remain semantically narrow.
 
It shall not be widened to contain:
 
 
- serial numbers;
 
- lot or batch values;
 
- expiration dates;
 
- URI routing information;
 
- arbitrary Application Identifiers;
 
- URI host or path information; or
 
- other Digital Link context.
 

 
The reason is constitutional rather than merely technical:
 
 
**An identifier is not a transport representation, routing mechanism, or contextual container.**
 
 
A GTIN identifies a product class. A Digital Link is a structured external representation that may contain a primary identifier together with qualifiers, attributes, and routing information.
 
Conflating these categories would make the identity model dependent on a particular external transport syntax and would obscure the distinction between identity and contextual data.
 
M06 shall therefore introduce a separate Digital Link interpretation model above the existing identifier value object.
 
The exact TypeScript symbol names and final field structure remain implementation-planning decisions. They shall be defined in `M06-PLAN` after the governing GS1 standards are pinned.
  
## M06-D03 — Digital Link Context Is Separate from Identity
 
**Status:** `RATIFIED`
 
The M06 interpretation model shall distinguish, at minimum:
 `GS1 Digital Link interpretation ├── primary identifier ├── supported qualifiers and attributes ├── recognized but unsupported content, where applicable ├── deterministic normalized representation └── source-input diagnostic context ` 
The primary identifier remains the identity-bearing component.
 
Qualifiers and attributes may affect later product-instance, evidence, or verification operations, but they shall not silently become identity components in M06.
 
The exact treatment of individual Application Identifiers shall be governed by the approved M06 support profile and the pinned GS1 standards.
  
## M06-D04 — No Silent Data Destruction
 
**Status:** `RATIFIED`
 
M06 shall not silently:
 
 
- discard parsed GS1 content;
 
- ignore an Application Identifier merely because the current wedge does not resolve on it;
 
- remove qualifiers without representing that they were present;
 
- rewrite unknown content into a supported meaning;
 
- guess the intended identifier; or
 
- partially resolve a link while concealing unsupported content that could materially change its interpretation.
 

 
However, this rule does **not** authorize an unbounded “implement every GS1 Application Identifier” requirement.
 
The M06 wedge remains bounded.
 
The governing rule is:
 
 
**Interpret according to the pinned GS1 authority; preserve recognized information required for faithful interpretation; resolve only the approved M06 support profile; never silently discard or invent meaning.**
 
 
The detailed representation of unsupported or unhandled content shall be determined only after:
 
 
1. the governing GS1 standards are pinned;
 
2. the M06 support profile is ratified; and
 
3. the relevant GS1 syntax and AI rules are evidenced.
 

 
Until those gates are complete, no implementation agent may invent an `UnsupportedWellFormedAI` schema, arbitrary catch-all map, or unsupported-content policy.
  
## M06-D05 — Pure Interpretation Is Separate from Registry Resolution
 
**Status:** `RATIFIED`
 
M06 consists of two constitutionally distinct concerns.
 
### A. Pure GS1 Interpretation
 
The following operations shall be:
 
 
- synchronous;
 
- deterministic;
 
- side-effect free;
 
- free of infrastructure dependencies; and
 
- independently testable.
 

 
They include:
 
 
- parsing;
 
- structural interpretation;
 
- identifier validation;
 
- Application Identifier validation within the approved profile;
 
- deterministic normalization; and
 
- typed syntax or validation outcomes.
 

 
These operations belong to the pure domain side of the architecture.
 
### B. Registry-Backed Resolution
 
The following operation is asynchronous application orchestration:
 `normalized supported identity reference                  ↓        RegistryRepository.lookup(...)                  ↓ typed Registry-backed resolution result ` 
Registry resolution may depend on persistence and therefore shall not be embedded in the pure interpretation model.
 
The resolver shall compose:
 
 
1. the pure M06 interpretation result; and
 
2. the existing M05 Registry repository contract.
 

 
The resolver shall not duplicate:
 
 
- URI parsing;
 
- GS1 validation;
 
- canonicalization;
 
- Registry persistence behavior; or
 
- constitutional verification.
 

  
## M06-D06 — `packages/runtime` Remains Outside M06 Implementation
 
**Status:** `RATIFIED`
 
M06 shall not add GS1 parsing, URI normalization, Registry I/O, or resolution orchestration to `packages/runtime`.
 
The Runtime remains constitutionally isolated and pure.
 
M06 resolution occurs before the later Runtime verification flow.
 
The Runtime shall receive the appropriate resolved constitutional state through its established execution boundary when M08 wires the complete verification pipeline.
 
M06 shall not prematurely modify Runtime behavior merely to demonstrate resolution.
 
Any existing planning material that appears to place M06 parsing or Registry resolution inside `packages/runtime` shall be treated as a documentation inconsistency requiring review before implementation. It shall not override this ADR, CAW scope, or CEngS purity rules.
  
## M06-D07 — Resolution Does Not Imply Verification
 
**Status:** `RATIFIED`
 
The following states are constitutionally distinct:
 `GS1 input is interpretable           ≠ identity reference is valid and normalized           ≠ identity is present in the Zyppi Registry           ≠ identity is constitutionally verified ` 
M06 may establish the first three states.
 
M06 shall not establish the fourth.
 
A Registry record may be found while later evidence, policy, standing, authority, capability, or Runtime evaluation produces a denied, unavailable, or otherwise non-verified result.
 
No successful M06 resolution may bypass later constitutional evaluation.
  
# 4. Standards Sovereignty and Governance
 
## M06-D08 — GS1 Is the External Authority for GS1 Interpretation
 
**Status:** `RATIFIED WITH PRE-IMPLEMENTATION GATE`
 
GS1 rules govern the interpretation of GS1 identifiers and Digital Link syntax.
 
Zyppi shall not invent alternative rules for:
 
 
- Application Identifier meaning;
 
- identifier lengths;
 
- check-digit validation;
 
- AI-specific value formats;
 
- Digital Link URI structure;
 
- canonicalization; or
 
- equivalence between alternate GS1 representations.
 

 
Zyppi constitutional rules govern:
 
 
- package boundaries;
 
- purity;
 
- determinism;
 
- typed failure behavior;
 
- Registry resolution;
 
- constitutional identity;
 
- evidence;
 
- policy;
 
- Runtime execution; and
 
- receipts.
 

 
The standards boundary is therefore:
 `GS1 authority     ↓ How the external identifier and Digital Link are interpreted  Zyppi constitutional authority     ↓ How the interpreted result is represented, resolved, evaluated, executed, evidenced, and governed ` 
If an actual conflict is identified between a GS1 normative requirement and a Zyppi constitutional requirement, the conflict shall be reported to the Chair.
 
No implementation agent may silently choose one authority over the other.
  
## G-06-01 — Governing GS1 Standards Verification
 
**Status:** `MANDATORY — BLOCKS M06 IMPLEMENTATION PLANNING`
 
Before `M06-PLAN` or `AMS-0601` is drafted, a standards-verification artifact shall establish the exact external authorities governing M06.
 
It shall record:
 
 
1. the exact title of the GS1 Digital Link URI Syntax standard;
 
2. the exact edition, version, publication date, or effective revision;
 
3. the authoritative publication source;
 
4. the exact GS1 General Specifications edition governing the supported identifier and AI validation rules;
 
5. the authoritative GS1 Application Identifier registry source;
 
6. the registry version, publication state, or reproducible snapshot method;
 
7. the specific normative sections relevant to the M06 support profile;
 
8. the provenance and licensing status of any proposed conformance fixtures; and
 
9. any ambiguity, conflict, or unavailable source.
 

 
The verification artifact shall distinguish:
 
 
- normative GS1 requirements;
 
- informative GS1 material;
 
- Zyppi constitutional decisions; and
 
- implementation choices.
 

 
No edition, date, URI rule, AI rule, or canonicalization behavior may be selected from memory, inference, illustrative examples, or an AI-generated assumption.
  
## M06-D09 — Conformance, Not Unverified Certification
 
**Status:** `RATIFIED`
 
The M06 engineering target is:
 
 
**GS1-standards conformance and independent conformance-testability within the approved M06 support profile.**
 
 
M06 does not authorize any claim that Zyppi is:
 
 
- formally GS1-certified;
 
- a GS1-certified resolver;
 
- an officially certified GS1 software product; or
 
- approved by GS1 under any certification program.
 

 
No certification claim is authorized unless all of the following are independently established:
 
 
1. an applicable GS1 certification, qualification, or approval program exists;
 
2. the program applies to Zyppi's actual software surface;
 
3. the qualification scope is documented;
 
4. the required verification process is completed; and
 
5. the resulting status is evidenced and approved through the appropriate Zyppi governance process.
 

 
Passing internal tests or standards-derived conformance tests shall not be described as certification.
  
# 5. M06 Support Profile
 
## 5.1 Current Constitutional Direction
 
The M06 wedge is centered on:
 
 
- **GTIN as the primary identity reference**; and
 
- the Digital Link context required by the real Commerce Atlas verification flow.
 

 
The existing planning direction identifies the following contextual values for standards verification and support-profile assessment:
 
  
 
GS1 AI
 
Meaning
 
Current Planning Status
 
   
 
`01`
 
GTIN
 
Primary identity candidate
 
 
 
`21`
 
Serial Number
 
Candidate supported qualifier
 
 
 
`10`
 
Lot or Batch
 
Candidate supported attribute
 
 
 
`17`
 
Expiration Date
 
Candidate supported attribute
 
  
 
These entries are **planning candidates**, not yet an implementation authorization.
 
Their exact syntax, validation rules, URI placement, normalization behavior, and support status shall be confirmed through `G-06-01`.
  
## 5.2 Bounded Wedge Rule
 
M06 shall implement the minimum standards-conformant profile required to prove the CAW end-to-end flow.
 
M06 shall not expand into a complete implementation of every GS1 primary key, qualifier, attribute, or Application Identifier merely because the architecture must remain extensible.
 
The governing principle is:
 
 
**Extensible by design; bounded by the ratified wedge.**
 
 
Future GS1 support shall be added through explicit profile amendments, with:
 
 
- standards evidence;
 
- domain-model review;
 
- compatibility analysis;
 
- test expansion; and
 
- a defined constitutional task.
 

 
No implementation agent may expand the support profile opportunistically.
  
## 5.3 Unsupported Content Rule
 
The final unsupported-content policy shall be ratified in `M06-PLAN` after `G-06-01`.
 
That policy shall explicitly distinguish:
 
 
1. malformed or invalid GS1 syntax;
 
2. syntactically valid content outside the approved M06 profile;
 
3. recognized GS1 content that is not yet supported by the wedge;
 
4. content that cannot be faithfully interpreted under the pinned standards; and
 
5. content that is supported and eligible for Registry resolution.
 

 
The policy shall define:
 
 
- whether Registry lookup is permitted;
 
- what information must be preserved;
 
- what typed outcome is returned;
 
- what diagnostics are exposed;
 
- whether any partial interpretation is allowed; and
 
- how deterministic normalization is maintained.
 

 
Until that policy is ratified, implementation shall not assume that all unsupported content is either rejected, ignored, preserved in a generic map, or partially resolved.
  
# 6. Canonicalization and Registry-Key Contract
 
## M06-D10 — Canonicalization Is Standards-Derived
 
**Status:** `RATIFIED WITH IMPLEMENTATION DETAIL DEFERRED`
 
M06 normalization shall be:
 
 
- deterministic;
 
- explicit;
 
- reproducible;
 
- independently testable; and
 
- derived from the pinned GS1 authority.
 

 
M06 shall not invent canonicalization rules based solely on implementation convenience.
 
The final normalization contract shall define, only after `G-06-01`:
 
 
- accepted URI forms;
 
- scheme and host treatment;
 
- path interpretation;
 
- query interpretation;
 
- AI ordering where applicable;
 
- percent-encoding behavior;
 
- trailing-slash behavior;
 
- equivalent representation handling;
 
- canonical serialization;
 
- primary identifier representation; and
 
- the exact normalized Registry reference.
 

  
## M06-D11 — Registry-Key Compatibility Is a Cross-Milestone Contract
 
**Status:** `RATIFIED`
 
The normalized identity reference produced by M06 must be compatible with the canonical references stored and queried through the M05 Registry.
 
The exact Registry-key representation shall not be invented independently by:
 
 
- the parser;
 
- the normalizer;
 
- seed data;
 
- the Registry adapter; or
 
- downstream Runtime work.
 

 
The final key contract shall be documented in `M06-PLAN` and tested end to end.
 
If the current M05 seed or persistence representation conflicts with the standards-derived M06 canonical representation, the conflict shall be reported as a cross-milestone compatibility issue.
 
It shall not be corrected silently by adding ad hoc conversion logic.
  
# 7. Typed Outcome Taxonomy
 
## M06-D12 — Materially Different Outcomes Shall Remain Distinct
 
**Status:** `RATIFIED`
 
M06 shall preserve the following conceptual distinctions:
 
  
 
State
 
Meaning
 
Registry Lookup
 
   
 
**Invalid Digital Link**
 
Input cannot be interpreted or validated under the pinned GS1 rules
 
No
 
 
 
**Valid but Unsupported Content**
 
Input is interpretable but outside the approved M06 support profile
 
Defined by final support policy
 
 
 
**Valid and Unregistered**
 
Supported identity is valid and normalized, but the Registry reports successful absence
 
Yes
 
 
 
**Resolved Identity**
 
Supported identity is valid, normalized, and present in the Registry
 
Yes
 
 
 
**Registry Failure**
 
Registry operation cannot provide a valid result because of a typed infrastructure or data-integrity failure
 
Attempted
 
  
 
These states shall not be collapsed.
 
In particular:
 `Invalid input     ≠ Unsupported content     ≠ Identity absent     ≠ Registry failure     ≠ Identity resolved ` 
Registry absence is not infrastructure failure.
 
Registry failure is not identity absence.
 
Identity resolution is not constitutional verification.
  
## 7.1 Typed Failure Requirements
 
M06 failures shall be:
 
 
- explicit;
 
- typed;
 
- deterministic where the same input and declared context are used;
 
- safe to expose through later application boundaries; and
 
- free of raw infrastructure implementation details.
 

 
M06 shall not:
 
 
- throw unclassified parser behavior across a public boundary;
 
- expose raw database-driver errors;
 
- convert infrastructure failure into “not found”;
 
- convert unsupported content into malformed input without an explicit policy basis;
 
- repair invalid identifiers;
 
- guess missing values; or
 
- synthesize a Registry identity.
 

 
The exact public TypeScript union names shall be defined during detailed planning.
  
# 8. Package Placement and Dependency Direction
 
## 8.1 Binding Placement
 
  
 
Concern
 
Constitutional Placement
 
   
 
Digital Link interpretation model
 
Pure domain layer
 
 
 
GS1 parser
 
Pure domain layer
 
 
 
GS1 validation
 
Pure domain layer
 
 
 
Deterministic normalization
 
Pure domain layer
 
 
 
Typed interpretation outcomes
 
Domain-facing contract, subject to existing package boundaries
 
 
 
Registry repository interface
 
Existing M05 contracts boundary
 
 
 
Resolver orchestration
 
Application layer
 
 
 
PostgreSQL access
 
Existing M05 persistence adapter
 
 
 
Runtime verification
 
Deferred to M08
 
 
 
HTTP/API exposure
 
Deferred to M09
 
 
 
Edge routing
 
Deferred to M10
 
 
 
User experience and scanning
 
Deferred to M11
 
  
 
The detailed plan shall use the repository's actual public package interfaces and dependency rules.
 
It shall not create a new package merely to express a conceptual separation unless the existing package architecture proves insufficient and the Chair explicitly approves that architectural change.
  
## 8.2 Dependency Direction
 
The intended dependency flow is:
 `Application Resolution Orchestrator                 ↓        Contracts / Ports                 ↓        Pure Domain Model ` 
The pure domain model shall not depend on:
 
 
- the API application;
 
- PostgreSQL;
 
- database drivers;
 
- HTTP;
 
- environment configuration;
 
- network clients;
 
- Runtime implementation details; or
 
- hidden infrastructure state.
 

 
The resolver may depend on the existing Registry port but shall not depend directly on database implementation details beyond the established application boundary.
 
No circular dependency is permitted.
  
# 9. Determinism, Replay, and Test Strategy
 
## M06-D13 — Interpretation Must Be Directly Deterministic
 
**Status:** `RATIFIED`
 
For identical input and identical pinned standards/profile configuration:
 `same input     ↓ same interpretation     ↓ same validation result     ↓ same normalized representation ` 
The pure interpretation layer shall be directly replayable without a live database.
 
Its tests shall prove:
 
 
- stable parsing;
 
- stable validation;
 
- stable normalization;
 
- stable typed failures;
 
- stable canonical serialization; and
 
- absence of hidden state or implicit entropy.
 

  
## M06-D14 — Resolution Replay Requires a Declared Registry State
 
**Status:** `RATIFIED`
 
Registry-backed resolution is deterministic only relative to a declared Registry state.
 
Resolution replay shall therefore use controlled and reproducible Registry conditions, such as:
 
 
- a seeded test database with an explicitly defined state; or
 
- a typed Registry test double representing an explicit snapshot.
 

 
The replay invariant is:
 `same Digital Link input + same pinned standards/profile + same declared Registry state     ↓ same typed resolution outcome ` 
Live database timing, mutable production state, and uncontrolled infrastructure behavior shall not be treated as deterministic replay inputs.
  
## M06-D15 — Standards Conformance and Constitutional Behavior Are Separate Evidence Classes
 
**Status:** `RATIFIED`
 
M06 shall maintain separate test evidence for:
 
### A. GS1 Standards-Conformance Tests
 
These prove:
 
 
**“Does the supported M06 interpretation profile follow the pinned GS1 requirements?”**
 
 
Each fixture shall have traceable provenance to:
 
 
- the relevant GS1 requirement;
 
- an authorized GS1 example;
 
- an approved standards-derived test source; or
 
- a documented internal derivation from a cited normative rule.
 

 
Fixture licensing and redistribution rights shall be verified before importing external corpora.
 
### B. Zyppi Constitutional-Behavior Tests
 
These prove:
 
 
**“Does M06 behave according to Zyppi's constitutional rules?”**
 
 
They shall cover:
 
 
- typed outcomes;
 
- fail-closed behavior;
 
- no silent data loss;
 
- absence-versus-failure distinction;
 
- deterministic normalization;
 
- Registry-boundary behavior;
 
- package purity;
 
- dependency direction;
 
- replay behavior; and
 
- non-verification of resolution results.
 

 
Passing one suite does not substitute for passing the other.
 
Neither suite constitutes a formal GS1 certification claim.
  
# 10. Explicit M06 Non-Goals
 
M06 shall not implement:
 
 
- constitutional verification;
 
- evidence retrieval;
 
- evidence hashing;
 
- trust evaluation;
 
- policy evaluation;
 
- standing evaluation;
 
- authority evaluation;
 
- capability evaluation;
 
- Runtime execution;
 
- execution-receipt generation;
 
- HTTP endpoints;
 
- API request or response models;
 
- Edge routing;
 
- QR-camera acquisition;
 
- scanner hardware integration;
 
- presentation or UI behavior;
 
- product-response rendering;
 
- identity creation;
 
- automatic Registry seeding;
 
- identifier repair;
 
- identifier guessing;
 
- identity substitution;
 
- federation;
 
- complete GS1 AI coverage; or
 
- an unverified GS1 certification program.
 

 
Any requirement outside these boundaries requires explicit constitutional review and an attributable CAW task.
  
# 11. Required Gates Before Implementation
 
## Gate G-06-01 — Standards Authority Verification
 
**Required before:** `M06-PLAN`
 
The exact GS1 governing editions, sources, AI registry basis, and relevant normative rules must be evidenced.
 
**Status:** `OPEN — BLOCKING`
  
## Gate G-06-02 — M06 Support Profile Ratification
 
**Required before:** `M06-PLAN`
 
The Chair must ratify:
 
 
- supported primary identifier(s);
 
- supported qualifiers and attributes;
 
- accepted Digital Link forms;
 
- unsupported-content behavior;
 
- validation scope; and
 
- the exact resolution eligibility rule.
 

 
**Status:** `OPEN — BLOCKING`
  
## Gate G-06-03 — Canonical Registry-Key Contract
 
**Required before:** `AMS-0601`
 
The standards-derived normalized identity reference must be reconciled with the existing M05 Registry canonical-reference contract.
 
**Status:** `OPEN — BLOCKING`
  
## Gate G-06-04 — Detailed M06 Execution Plan
 
**Required before:** `AMS-0601`
 
`M06-PLAN` shall define, for every existing CAW task:
 
 
- objective;
 
- constitutional authority;
 
- exact scope;
 
- package placement;
 
- public symbols;
 
- input and output contracts;
 
- typed errors;
 
- file-level change plan;
 
- dependency direction;
 
- unit tests;
 
- integration tests;
 
- replay tests;
 
- conformance tests;
 
- benchmark requirements;
 
- documentation requirements;
 
- acceptance criteria; and
 
- explicit non-goals.
 

 
**Status:** `NOT STARTED — BLOCKING`
  
# 12. Implementation Authorization Status
 
## Current Status
 `M06 repository reconnaissance             ✓ COMPLETE  M06 constitutional scope             ✓ RATIFIED  M06 standards authority verification             ✗ REQUIRED  M06 support profile             ✗ REQUIRED  M06 canonical Registry-key contract             ✗ REQUIRED  M06 detailed execution plan             ✗ REQUIRED  AMS-0601             ✗ NOT AUTHORIZED ` 
`AMS-0601` shall not be drafted or issued until Gates `G-06-01` through `G-06-04` are completed.
 
No AI implementation agent may infer the missing decisions.
  
# 13. Final Chair Determination
 
M06 is constitutionally defined as:
 
 
**A bounded, standards-governed, deterministic GS1 Digital Link interpretation and Registry identity-resolution milestone.**
 
 
M06 shall:
 
 
- preserve the semantic distinction between identity and Digital Link context;
 
- retain `GS1Identifier` as a narrow GTIN value object;
 
- introduce a separate Digital Link interpretation model;
 
- keep parsing, validation, and normalization pure;
 
- keep Registry resolution asynchronous and outside the Runtime;
 
- distinguish invalidity, unsupported content, Registry absence, Registry failure, and successful resolution;
 
- preserve information required for faithful interpretation without expanding the wedge into an unbounded GS1 implementation;
 
- derive GS1 behavior from pinned external authority rather than internal assumptions;
 
- remain strictly separate from constitutional verification; and
 
- preserve the original CAW-011 M06 task sequence.
 

 
The next authorized action is:
 
 
**Create `G-06-01 — GS1 Standards Authority Verification` as a read-only standards-research and citation artifact.**
 
 
After `G-06-01`, the Chair shall ratify the final M06 support profile and canonical Registry-key contract.
 
Only then may `M06-PLAN` be drafted.
 
Only after `M06-PLAN` is ratified may `AMS-0601` be issued.