# M06-PREP — M06 Preparation and Repository Readiness Report
 
## 1. Executive Verdict
 
Based on a comprehensive, read-only investigation of the Zyppi repository, **Milestone M06 — GS1 Digital Link Resolution** is determined to be:
 
 
**DISPOSITION B-R — READY FOR DETAILED PLANNING WITH STANDARDS-GOVERNANCE AND SEMANTIC-MODEL PRECONDITIONS**
 
 
The foundational work delivered by M03 — Domain Foundation, M04 — Runtime Skeleton, and M05 — Registry Layer is functionally complete, compiled, and structurally sound. The authorized repository verification suite completed successfully with **481 of 481 tests passing** after the required local PostgreSQL development dependency was initialized.
 
Detailed M06 architecture and task planning may proceed immediately. No inherited repository defect prevents planning.
 
However, implementation of `AMS-0601` must not begin until the following matters are established through the detailed planning process and approved at the appropriate governance level:
 
 
1. The authoritative GS1 standards, editions, publication dates, and applicable Application Identifier authority governing M06;
 
2. The approved M06 GS1 support profile;
 
3. The semantic boundary between the existing narrow `GS1Identifier` value object and any future structured GS1 Digital Link representation;
 
4. The required behavior for well-formed GS1 content outside the approved support profile;
 
5. The standards-constrained URI interpretation and canonicalization requirements;
 
6. The architecture and package placement of the pure interpretation layer and the Registry-backed resolution orchestration;
 
7. The provenance, availability, licensing, and integration strategy for applicable conformance materials.
 

 
The repository is therefore **ready to plan M06**, but the implementation contract is not yet sufficiently governed or specified to begin `AMS-0601`.
  
## 2. Mandate and Investigation Boundaries
 
This investigation was conducted under **Mandate ID: M06-PREP**.
 
**Authority:** Chair — Zyppi Constitutional Council **Program:** CAW-011 **Milestone:** M06 — GS1 Digital Link Resolution
 
The investigation was strictly limited to read-only repository reconnaissance intended to establish Zyppi’s exact architectural position before detailed M06 planning and before implementation work on `AMS-0601`.
 
### 2.1 Authorized Investigation Activities
 
Jules was authorized to:
 
 
- Inspect the repository state and package architecture;
 
- Inspect the M03 domain contracts and tests;
 
- Inspect the M04 Runtime and replay proof;
 
- Inspect the M05 Registry contracts, adapter, and integration tests;
 
- Search for existing GS1 and Digital Link behavior;
 
- Inspect relevant CAW, AMS, constitutional, and engineering artifacts;
 
- Execute the authorized verification suite;
 
- Record exact repository paths, symbols, commands, findings, and evidence;
 
- Report observed gaps without repairing them.
 

 
### 2.2 Prohibited Activities
 
Jules was not authorized to:
 
 
- Implement `AMS-0601`;
 
- Modify production code;
 
- Modify test code;
 
- Modify M03, M04, or M05 artifacts;
 
- Change package boundaries;
 
- Add dependencies;
 
- Change database schemas or migrations;
 
- Select GS1 standards or versions;
 
- Define the final M06 support profile;
 
- Make constitutional, standards-governance, or architecture decisions on behalf of the Chair;
 
- Ratify any implementation approach.
 

 
Any architectural concern identified during the investigation is recorded as evidence, an inference, or an unresolved planning matter rather than being repaired or decided within this report.
  
## 3. Repository Baseline
 
The Zyppi monorepo baseline was inspected before the report was created and verified again after the authorized investigation activities were completed.
 
### 3.1 Repository Identity
 
 
- **Current Branch:** `jules-3743838988093705821-24851811`
 
- **Starting Commit SHA:** `bd4cd3f51659be0e1dd1677803a808a35115bb60`
 
- **Ending Commit SHA:** `bd4cd3f51659be0e1dd1677803a808a35115bb60`
 
- **Working-Tree Status Before Report Creation:** Clean; no uncommitted modifications
 
- **Working-Tree Status After Report Creation:** Only `DOCS/CAW/M06/M06-PREP.md` was created
 
- **Node.js Version Used:** `v22.22.1`
 
- **Node.js Version Declared in `package.json`:** `20.19.0`
 
- **pnpm Version Used:** `10.30.3`
 
- **pnpm Version Declared in `package.json`:** `10.30.3`
 

 
### 3.2 Authorized Verification Suite
 
The full authorized verification suite was executed using:
 `pnpm run format:check && pnpm run lint && pnpm exec tsc -b && pnpm run runtime:purity && pnpm run boundary:all && pnpm run graph:validate && pnpm run test ` 
### 3.3 Verification Results
 
  
 
Verification
 
Result
 
   
 
Format Check
 
**PASS**
 
 
 
Linter
 
**PASS** — 0 warnings and errors
 
 
 
TypeScript Build
 
**PASS**
 
 
 
Runtime Purity Check
 
**PASS** — 3 source files analyzed; 0 violations
 
 
 
Package Boundary Checks
 
**PASS**
 
 
 
Dependency-Graph Validation
 
**PASS** — 9 workspace members; 50 source files
 
 
 
Unit and Integration Tests
 
**PASS** — 22 test files; 481 tests
 
  
 
### 3.4 Baseline Interpretation
 
The initial test execution could not complete because the required local PostgreSQL service was not running. After the local database dependency was initialized and the repository migration was applied, the full verification suite passed.
 
The initial failure is therefore classified as:
 
 
**LOCAL INFRASTRUCTURE PREREQUISITE NOT INITIALIZED**
 
 
It is not classified by this investigation as a repository code failure.
 
The final verified repository baseline is:
 
 
**HEALTHY — ALL AUTHORIZED VERIFICATION CHECKS PASS**
 
 
The report does not determine whether the local PostgreSQL setup requirements are fully documented or sufficiently reproducible outside the investigated environment. That question may be reviewed separately if development-environment reproducibility becomes a program concern.
  
## 4. CAW-011 and the M06 Contract
 
According to `DOCS/CAW/CAW-011-Build-Order.md`, **M06 — GS1 Digital Link Resolution** is the milestone responsible for establishing deterministic GS1 Digital Link interpretation and identity-resolution capability.
 
### 4.1 M06’s Core Role
 
M06 concerns **identification and resolution**.
 
At the conceptual level, its intended flow is:
 `GS1 Digital Link Input         ↓ Interpretation         ↓ Validation         ↓ Normalization         ↓ Registry-backed Identity Resolution         ↓ Resolved Identity or Typed Non-Resolution ` 
The exact internal representation, operation boundaries, package placement, and execution sequence remain subjects for detailed M06 planning.
 
### 4.2 Responsibilities Outside M06
 
M06 must not absorb responsibilities assigned to later or separate architectural layers, including:
 
 
- Evidence evaluation;
 
- Trust determination;
 
- Policy evaluation;
 
- Authority evaluation;
 
- Capability evaluation;
 
- Runtime verification;
 
- Receipt generation;
 
- HTTP or API delivery;
 
- Edge routing;
 
- QR-camera acquisition;
 
- Presentation or UI behavior.
 

 
These responsibilities remain outside the M06 boundary.
 
### 4.3 Required Semantic Distinctions
 
M06 planning must preserve the distinction between the following states:
 
 
1.  
**GS1 Digital Link interpretation validity** Whether the input can be interpreted according to the governing GS1 authority and the approved M06 support profile.
 
 
2.  
**Validated normalized identifier state** Whether the relevant identifier and supported components satisfy the applicable validation rules and have been represented in the approved normalized form.
 
 
3.  
**Known Registry identity** Whether the normalized resolution reference maps to a registered constitutional identity through the M05 Registry interface.
 
 
4.  
**Constitutional verification** Whether a resolved identity is authorized, verified, active, or otherwise valid under constitutional policy.
 
 

 
M06 may establish the first three states within its approved boundary. Constitutional verification remains outside M06.
 
A syntactically or structurally valid GS1 input is not automatically a known Registry identity. A known Registry identity is not automatically constitutionally verified.
 
### 4.4 Planned CAW-011 Work Items
 
The M06 work items listed in CAW-011 are:
 
 
1.  
**IT-0601 — GS1 Parser** Size: M Dependency: IT-0302
 
 
2.  
**IT-0602 — GS1 Validator** Size: S Dependency: IT-0601
 
 
3.  
**IT-0603 — Digital Link Normalizer** Size: S Dependency: IT-0601
 
 
4.  
**IT-0604 — Identity Resolver** Size: M Dependencies: IT-0603 and IT-0503
 
 
5.  
**IT-0605 — Parser Benchmarks** Size: S Dependency: IT-0604
 
 
6.  
**IT-0606 — Replay Validation** Size: S Dependencies: IT-0604 and IT-0406
 
 

 
These work-item names establish the intended capability sequence but do not by themselves settle the detailed semantic model or implementation architecture.
  
## 5. M03 Domain Foundation Readiness
 
The M03 domain contracts in `packages/domain/src/index.ts` were inspected to assess their readiness for M06.
 
### 5.1 Current `GS1Identifier` Contract
 
The current domain model is:
 `export type GS1Identifier = {   readonly gtin: string; }; ` 
The current domain package also exposes:
 `validateGS1Identifier(   input: unknown ): ValidationResult<GS1Identifier, GS1IdentifierValidationError> ` 
and:
 `serializeGS1Identifier(   identifier: GS1Identifier ): string ` 
The serializer produces a deterministic serialized representation using alphabetically ordered output.
 
### 5.2 Current Capability
 
The present `GS1Identifier` contract is a narrow GTIN value object.
 
The repository evidence establishes that it:
 
 
- Represents a GTIN value;
 
- Preserves significant leading zeroes;
 
- Enforces ASCII digit-only input;
 
- Accepts GTIN lengths of 8, 12, 13, and 14 digits;
 
- Applies a modulo-10 check-digit validation algorithm;
 
- Produces deterministic serialized output;
 
- Operates as a pure domain-level contract with no external dependency.
 

 
The existing tests cover valid GTIN lengths, leading-zero preservation, non-ASCII digit rejection, and check-digit behavior.
 
### 5.3 Important Conformance Limitation
 
The repository evidence demonstrates the current implementation and its tests. It does **not** independently establish conformity to a particular edition of the GS1 General Specifications because:
 
 
- No governing GS1 edition is pinned in the repository;
 
- No external GS1 authority has been incorporated into the current implementation contract;
 
- No authoritative GS1 conformance assessment was performed during this investigation;
 
- No applicable GS1 conformance corpus was used in this investigation.
 

 
Therefore, the current implementation may be described as:
 
 
**A tested GTIN value object implementing modulo-10 validation for the supported GTIN lengths**
 
 
It must not be described in this report as fully GS1-compliant or externally certified.
 
### 5.4 Current Structural Limitations
 
The current `GS1Identifier` contract does not itself represent:
 
 
- Additional GS1 primary identification keys;
 
- Serial Number;
 
- Lot or Batch;
 
- Expiration Date;
 
- Other key qualifiers;
 
- Data attributes;
 
- The original Digital Link URI;
 
- The original raw path or query components;
 
- A parsed URI-level structure;
 
- A normalized Digital Link representation.
 

 
These are repository facts about the current contract. They do not determine the correct future model.
 
### 5.5 Central Semantic-Model Question
 
The current repository contains a GTIN identifier value object. It does not contain a formal semantic model for a GS1 Digital Link as a structured object distinct from the identifier itself.
 
Detailed M06 planning must determine:
 
 
- Whether `GS1Identifier` should remain a narrow identifier value object;
 
- Whether M06 requires a separate structured Digital Link representation;
 
- Whether supported qualifiers and attributes belong inside an identifier model, a parsed-link model, or another representation;
 
- What information must be preserved from the original input;
 
- What normalized information is required for Registry resolution;
 
- Whether Registry lookup is based on a primary identifier alone or on a richer resolution reference.
 

 
No solution is selected by this report.
  
## 6. Existing GS1 and Digital Link Implementation Inventory
 
A repository-wide search was conducted for existing GS1 and Digital Link behavior.
 
### 6.1 Existing GS1 Identifier Validation and Serialization
 
**Path:** `packages/domain/src/index.ts`
 
**Classification:** **ACTIVE AND USABLE WITHIN CURRENT GTIN-ONLY SCOPE**
 
Repository evidence demonstrates:
 
 
- Pure and deterministic GTIN validation;
 
- Supported lengths of 8, 12, 13, and 14 digits;
 
- Modulo-10 check-digit validation;
 
- Deterministic serialization;
 
- No external dependencies.
 

 
The current implementation does not provide GS1 Digital Link URI parsing, URI normalization, qualifier handling, or broader AI handling.
 
### 6.2 Existing GS1 Identifier Tests
 
**Path:** `packages/domain/src/referent.test.ts`
 
**Classification:** **ACTIVE AND USABLE**
 
The `GS1Identifier` test suite includes 12 tests covering:
 
 
- Valid GTIN lengths;
 
- Significant leading-zero preservation;
 
- Rejection of non-ASCII digits;
 
- Check-digit behavior.
 

 
These tests provide evidence for the current domain contract. They are not a substitute for a future standards-traceable M06 conformance suite.
 
### 6.3 Existing Referent Model
 
**Path:** `packages/domain/src/index.ts`
 
**Classification:** **ACTIVE AND USABLE**
 
The repository contains the `ReferentRecord` model and validation supporting Product, Brand, and Manufacturer aggregates.
 
M06 planning must determine the exact relationship between:
 
 
- Parsed GS1 Digital Link information;
 
- Validated identifier information;
 
- Normalized resolution references;
 
- Registry identity records;
 
- Referent records.
 

 
### 6.4 Absence of Premature Digital Link Behavior
 
The repository search found no existing implementation of:
 
 
- GS1 Digital Link URI parsing;
 
- URI regular expressions;
 
- Percent-encoding behavior;
 
- Path-element interpretation;
 
- Query-parameter interpretation;
 
- Digital Link canonicalization;
 
- Digital Link normalization;
 
- Resolver stubs;
 
- Premature GS1 behavior embedded in Runtime, API delivery, Edge, or shared presentation layers.
 

 
**Classification:** **NO PREMATURE M06 IMPLEMENTATION FOUND**
 
This is a positive boundary finding. M06 behavior has not been prematurely distributed across unrelated layers.
  
## 7. M05 Registry Readiness
 
The M05 Registry Layer is implemented, compiled, and verified.
 
### 7.1 Registry Repository Port
 
**Path:** `packages/contracts/src/registry.ts`
 
The public Registry repository interface is:
 `export interface RegistryRepository {   lookup(     identifier: ValidatedCanonicalIdentifier,   ): Promise<RegistryResult<RetrievedRegistryState | null>>; } ` 
### 7.2 Registry Adapter
 
**Path:** `apps/api/src/registry/postgres-registry-repository.ts`
 
The `PostgresRegistryRepository` implementation:
 
 
- Uses the `postgres.js` driver;
 
- Performs strict equality matching against `identities.canonical_reference`;
 
- Executes the lookup under a `REPEATABLE READ READ ONLY` transaction;
 
- Operates asynchronously;
 
- Returns a typed Registry result.
 

 
### 7.3 Registry Result Behavior
 
The repository distinguishes:
 
 
- `RetrievedRegistryState` — a matching Registry state was retrieved;
 
- `null` — no matching identity was found;
 
- `ok: false` — a closed Registry error occurred.
 

 
The observed Registry error taxonomy includes:
 
 
- `InfrastructureUnavailable`;
 
- `DataCorruption`.
 

 
The retrieved Registry state maps to the domain’s `ActiveConstitutionalView`, including:
 
 
- `IdentityRecord`;
 
- Ancestor `ReferentRecord` relationships;
 
- `StandingRecord[]`;
 
- `AuthorityRecord[]`;
 
- `CapabilityRecord[]`;
 
- Active `PolicyRecord[]`.
 

 
### 7.4 M05 Readiness Assessment
 
M05 provides a tested asynchronous Registry lookup capability suitable for use by a future M06 resolution orchestration layer.
 
The following M06 planning questions remain unresolved:
 
 
- What exact normalized value will M06 pass into `ValidatedCanonicalIdentifier`;
 
- Whether the current canonical-reference representation is sufficient for the approved GS1 support profile;
 
- Whether resolution depends only on a primary identifier or on a richer structured reference;
 
- Where the application boundary between pure interpretation and asynchronous Registry access will be placed;
 
- How Registry non-resolution and Registry infrastructure failures will be represented in the M06 result taxonomy.
 

 
No M05 remediation is required merely to begin M06 planning.
  
## 8. M04 Replay and Determinism Readiness
 
The M04 replay framework was inspected to assess its readiness for future M06 work.
 
### 8.1 Current Replay Capability
 
**Path:** `packages/runtime/src/pipeline.test.ts`
 
**Relevant Test Block:** `"Deterministic replay proof — AMS-0406"`
 
The current proof validates the 9-stage synchronous Runtime pipeline scaffold.
 
It compares repeated executions at the value level, including:
 
 
- `PipelineResult`;
 
- The trace of executed stages;
 
- `ReceiptOutcome` status;
 
- The unresolved-fields representation.
 

 
### 8.2 Current Architectural Boundary
 
The current replay proof is:
 
 
- Synchronous;
 
- In-memory;
 
- Isolated from persistence;
 
- Focused on the Runtime pipeline.
 

 
The M05 Registry lookup is:
 
 
- Asynchronous;
 
- Persistence-backed;
 
- Located outside the pure Runtime pipeline.
 

 
The repository therefore demonstrates an architectural difference between the current replay proof and the future M06 Registry-resolution capability.
 
### 8.3 Evidence-Based Planning Implication
 
Detailed M06 planning must define:
 
 
- Which M06 operations are pure and directly replayable;
 
- How asynchronous Registry access participates in the overall resolution flow;
 
- Whether replay validation covers only pure interpretation;
 
- Whether replay validation uses controlled Registry snapshots, deterministic test doubles, or another architecture;
 
- How Registry state and infrastructure outcomes are represented without compromising deterministic replay;
 
- Whether M06 resolution occurs before Runtime execution, at an application/orchestration boundary, or through another constitutionally permitted arrangement.
 

 
The existence of `activeConstitutionalView` within the current execution structure is evidence that the Runtime pipeline receives a constitutional view as input. It does not, by itself, determine the final M06 resolution architecture.
 
### 8.4 M04 Readiness Classification
 
 
**PARTIALLY READY — the existing deterministic replay framework is stable and reusable as a foundation, but the M06 replay boundary and integration design remain unresolved.**
 
 
No M04 defect blocks M06 planning.
  
## 9. Package Architecture and Purity Constraints
 
The repository’s constitutional engineering constraints require a strict separation between pure interpretation behavior and persistence-backed application behavior.
 
The following placement assessment records repository-compatible architectural constraints. It does not ratify final package placement.
 
  
 
M06 Concern
 
Required Architectural Property
 
Candidate Placement Status
 
   
 
GS1 Digital Link interpretation
 
Pure and deterministic; no I/O
 
Exact package to be determined during planning
 
 
 
GS1 validation
 
Pure and deterministic
 
Likely colocated with the approved identifier or parsed-link contract; exact design unresolved
 
 
 
GS1 normalization
 
Pure and deterministic
 
Exact package and representation unresolved
 
 
 
Typed M06 outcomes and errors
 
Shared, closed, and dependency-safe
 
Exact contract location to be designed
 
 
 
Registry-backed identity resolution
 
Asynchronous application or orchestration behavior using the M05 Registry port
 
Exact package and orchestration boundary unresolved
 
 
 
Conformance fixtures
 
Test-only and provenance-controlled
 
Storage and integration strategy to be planned
 
  
 
### 9.1 Architectural Constraints Established by Evidence
 
The following constraints are supported by the existing architecture:
 
 
- Pure parsing, validation, and normalization behavior must not perform database or network I/O;
 
- The M05 Registry repository interface is asynchronous;
 
- The Runtime pipeline preserves a pure execution boundary;
 
- M06 must not introduce circular package dependencies;
 
- M06 must not leak Registry I/O into pure domain behavior;
 
- M06 must preserve typed distinctions between invalid input, non-resolution, Registry failure, and later constitutional verification.
 

 
### 9.2 Architecture Matters Still Open
 
The following are not decided by this report:
 
 
- Whether the parser belongs in `packages/domain`, another pure package, or another constitutionally permitted location;
 
- Whether validation extends the existing `GS1Identifier` contract or uses a separate parsed-link model;
 
- Whether normalization returns a string, a typed canonical object, or another representation;
 
- Whether a dedicated resolver package is necessary;
 
- Where the pure interpretation layer ends and Registry orchestration begins;
 
- How the M06 result model is exposed to later milestones.
 

 
These matters must be resolved during detailed M06 architecture and task planning.
  
## 10. GS1 Standards-Conformance Readiness
 
This section records the repository’s readiness to implement a standards-governed M06 capability. It does not itself determine the applicable external standards.
 
### 10.1 Governing Authority and Versioning
 
Repository search found no pinned reference to:
 
 
- A specific GS1 Digital Link URI Syntax standard edition;
 
- A specific GS1 General Specifications edition;
 
- A specific GS1 Application Identifier authority or registry snapshot;
 
- An effective publication date;
 
- An update or standards-governance mechanism;
 
- A repository-level traceability method connecting implementation rules to external GS1 requirements.
 

 
**Status:**
 
 
**EXTERNAL STANDARDS-GOVERNANCE DECISION REQUIRED**
 
 
Before implementation begins, the Chair must establish the authoritative external sources governing M06, including the applicable standards, editions, publication dates, and relevant AI authority.
 
No version should be selected by inference, memory, or illustrative example.
 
### 10.2 Declared GS1 Support Profile
 
Repository evidence establishes:
 
 
- The current domain contract structurally supports GTIN only;
 
- References to Serial, Lot, and Expiration appear in planning or preparatory materials;
 
- No final M06 support profile is formally declared;
 
- No supported-primary-key list is ratified;
 
- No supported qualifier or attribute list is ratified;
 
- No path-versus-query support profile is declared;
 
- No custom-domain or URI-stem policy is declared.
 

 
**Status:**
 
 
**CHAIR SCOPE DECISION REQUIRED**
 
 
The M06 support profile must define the intended supported surface without assuming either:
 
 
- a permanently narrow GTIN-only implementation; or
 
- immediate implementation of the complete GS1 AI universe.
 

 
### 10.3 AI Grammar and Extensibility
 
The current repository contains no:
 
 
- General GS1 AI grammar;
 
- Table-driven AI definition system;
 
- Schema-driven AI definition system;
 
- Broader typed AI representation;
 
- Policy for well-formed but unsupported AIs;
 
- Mechanism for preserving unsupported GS1 components.
 

 
The current GTIN-only value object cannot represent broader AI content.
 
**Status:**
 
 
**MISSING — A STANDARDS-GOVERNED REPRESENTATION AND VALIDATION STRATEGY MUST BE DESIGNED**
 
 
The report does not prescribe the implementation mechanism. The detailed plan may evaluate table-driven, schema-driven, typed-rule, or other approaches consistent with the approved support profile and constitutional architecture.
 
### 10.4 Identifier Validation
 
Current repository capability:
 
 
- GTIN digit-only validation: **IMPLEMENTED AND TESTED**
 
- GTIN lengths 8, 12, 13, and 14: **IMPLEMENTED AND TESTED**
 
- Modulo-10 check-digit behavior: **IMPLEMENTED AND TESTED**
 
- Validation of additional GS1 primary keys: **ABSENT**
 
- Validation of key qualifiers: **ABSENT**
 
- Validation of data attributes: **ABSENT**
 
- Date-format validation: **ABSENT**
 
- Serial and lot character-set validation: **ABSENT**
 
- Standards-version traceability: **ABSENT**
 

 
**Status:**
 
 
**PARTIALLY READY — CURRENT GTIN VALUE VALIDATION EXISTS, BUT THE M06 VALIDATION SURFACE IS NOT YET DEFINED OR IMPLEMENTED**
 
 
### 10.5 URI Interpretation and Normalization
 
Current repository capability:
 
 
- Digital Link path interpretation: **ABSENT**
 
- Digital Link query interpretation: **ABSENT**
 
- URI component handling: **ABSENT**
 
- Percent-encoding behavior: **ABSENT**
 
- Path and query equivalence rules: **ABSENT**
 
- Trailing-slash behavior: **ABSENT**
 
- AI ordering rules: **ABSENT**
 
- Canonical URI representation: **ABSENT**
 
- Raw-input preservation strategy: **ABSENT**
 
- Normalized Digital Link representation: **ABSENT**
 

 
**Status:**
 
 
**MISSING — REQUIREMENTS MUST BE DERIVED FROM THE SELECTED GOVERNING GS1 AUTHORITY AND APPROVED M06 SUPPORT PROFILE**
 
 
URI canonicalization is not treated as an unconstrained internal preference. Where the selected governing standard defines required behavior, M06 must implement that authority rather than inventing a competing rule.
 
### 10.6 Conformance Materials
 
Repository search found:
 
 
- No identified official GS1 conformance corpus;
 
- No standards-traceable Digital Link test suite;
 
- No repository-level conformance fixture provenance;
 
- A limited set of internal GTIN examples in `referent.test.ts` and `seed.test.ts`.
 

 
The internal examples support current repository behavior but do not establish broader GS1 standards conformance.
 
**Status:**
 
 
**MISSING — APPLICABLE CONFORMANCE MATERIALS MUST BE IDENTIFIED AND GOVERNED**
 
 
Detailed planning must determine:
 
 
- Whether authoritative GS1 conformance tests, examples, or validation resources exist for the selected scope;
 
- Whether they are publicly available;
 
- Whether they are licensed or suitable for repository use;
 
- Whether they directly apply to Zyppi’s software surface;
 
- Whether internal fixtures must be derived from normative requirements;
 
- How each conformance fixture will retain traceable provenance.
 

 
The report does not assume that an official test corpus exists or that it should be imported directly into `packages/testing`.
 
### 10.7 Standards Statement
 
 
**Current implementation target:** GS1-standards conformance and independent conformance-testability. **Formal GS1 certification status:** Unconfirmed. No formal GS1 certification claim is authorized unless an applicable GS1 program, qualification scope, and verification path are independently established.
 
 
No formal GS1 certification claim is made by this report.
  
## 11. Consolidated Readiness and Gap Matrix
 
  
 
Area
 
Required Capability or Question
 
Current Repository Evidence
 
Status
 
Blocking Level
 
Required Next Action
 
   
 
**M03 Domain**
 
Represent the approved M06 identifier and Digital Link semantics
 
`GS1Identifier` currently contains only `gtin`
 
**PARTIALLY READY**
 
**SEMANTIC-MODEL PRECONDITION**
 
Determine whether the current identifier remains narrow and whether a separate structured Digital Link model is required
 
 
 
**M04 Replay**
 
Provide deterministic validation of the approved M06 behavior
 
Current proof is synchronous, in-memory, and Runtime-focused
 
**PARTIALLY READY**
 
**ARCHITECTURE PLANNING REQUIRED**
 
Define the M06 replay boundary and treatment of Registry state
 
 
 
**M05 Registry**
 
Resolve normalized references to Registry state
 
Typed asynchronous lookup and tested Postgres adapter exist
 
**READY AS A FOUNDATION**
 
**NONE FOR PLANNING**
 
Define the M06-to-M05 resolution reference and orchestration boundary
 
 
 
**GS1 Governing Authority**
 
Pin applicable standards, editions, dates, and AI authority
 
No governing external authority is recorded
 
**MISSING**
 
**EXTERNAL STANDARDS-GOVERNANCE PRECONDITION**
 
Establish authoritative sources before implementation
 
 
 
**M06 Support Profile**
 
Define supported primary keys, qualifiers, attributes, and URI forms
 
No ratified support profile exists
 
**MISSING**
 
**CHAIR SCOPE PRECONDITION**
 
Approve the M06 support boundary during detailed planning
 
 
 
**Unsupported Well-Formed Content**
 
Define behavior for content outside the approved support profile
 
No explicit policy found
 
**MISSING**
 
**ARCHITECTURE/POLICY PRECONDITION**
 
Define fail-closed, preserve, reject, or other standards-compatible behavior
 
 
 
**GS1 Interpretation Layer**
 
Parse the approved Digital Link surface
 
No implementation exists
 
**MISSING**
 
**IMPLEMENTATION WORK**
 
Design and implement after the support profile and governing authority are approved
 
 
 
**GS1 Validation Layer**
 
Validate the approved identifier and component surface
 
Current implementation covers only the existing GTIN value object
 
**PARTIALLY READY**
 
**IMPLEMENTATION WORK**
 
Design validation rules traceable to the selected authority
 
 
 
**GS1 Normalization Layer**
 
Produce the required canonical representation
 
No implementation or rule set exists
 
**MISSING**
 
**STANDARDS-CONSTRAINED DESIGN PRECONDITION**
 
Derive requirements from the selected authority and approved profile
 
 
 
**Conformance Materials**
 
Test M06 behavior against authoritative or traceable sources
 
No governed conformance corpus exists
 
**MISSING**
 
**CONFORMANCE-PLANNING PRECONDITION**
 
Identify applicable resources and establish fixture provenance
 
 
 
**Package Placement**
 
Place pure interpretation and async resolution without boundary violations
 
Existing architecture establishes purity and async separation but not M06 placement
 
**UNRESOLVED**
 
**DETAILED ARCHITECTURE DECISION**
 
Resolve during M06 planning under CEngS boundary rules
 
  
  
## 12. Decisions and Planning Resolutions Required Before AMS-0601
 
The following matters must be resolved before implementation begins. They are not all the same governance class.
 
  
 
Resolution ID
 
Matter
 
Governance Classification
 
Why It Matters
 
Consequence if Unresolved
 
Required Stage
 
   
 
**MR-06-01**
 
M06 GS1 Support Profile
 
**Chair scope decision**
 
Defines the supported primary keys, qualifiers, attributes, and URI forms
 
Implementation scope remains undefined
 
Detailed M06 planning
 
 
 
**MR-06-02**
 
Governing GS1 Authorities
 
**Chair standards-governance decision**
 
Establishes the normative sources, editions, dates, and AI authority
 
Validation and normalization cannot be standards-traceable
 
Detailed M06 planning before implementation
 
 
 
**MR-06-03**
 
Semantic Representation Boundary
 
**Core architecture decision requiring Chair review**
 
Determines the relationship between `GS1Identifier`, a parsed Digital Link model, qualifiers, attributes, and resolution references
 
The implementation may distort existing domain semantics or create avoidable downstream breakage
 
Detailed M06 architecture
 
 
 
**MR-06-04**
 
Well-Formed but Unsupported GS1 Content
 
**Architecture and policy decision**
 
Defines behavior for valid external content outside the approved M06 support profile
 
Parser behavior may become inconsistent, lossy, or silently permissive
 
Detailed M06 architecture
 
 
 
**MR-06-05**
 
URI Interpretation and Canonicalization
 
**Standards-constrained design decision**
 
Defines path/query handling, encoding behavior, ordering, and canonical representation
 
Equivalent inputs may resolve inconsistently or produce incompatible references
 
After governing authority and support profile are established
 
 
 
**MR-06-06**
 
Pure Interpretation and Registry Orchestration Boundary
 
**Detailed architecture decision**
 
Separates deterministic interpretation from asynchronous M05 access
 
Purity, replayability, and package boundaries may be compromised
 
Detailed M06 architecture
 
 
 
**MR-06-07**
 
Conformance Material Strategy
 
**Standards and test-governance decision**
 
Establishes authoritative sources, fixture provenance, availability, and integration method
 
Conformance claims cannot be independently tested or audited
 
Detailed M06 test planning
 
 
 
**MR-06-08**
 
Package Placement
 
**Detailed architecture decision**
 
Places M06 components within the existing dependency and purity rules
 
Circular dependencies or layer leakage may result
 
Detailed M06 architecture
 
  
 
### 12.1 Decision Dependency
 
The resolutions have a logical order:
 `MR-06-01 — Support Profile             │             ├───────────────┐             ▼               ▼ MR-06-02 — Governing    MR-06-03 — Semantic Authorities             Representation Boundary             │               │             └───────┬───────┘                     ▼        MR-06-04 — Unsupported Content                     │                     ▼        MR-06-05 — URI Interpretation              and Canonicalization                     │           ┌─────────┴─────────┐           ▼                   ▼ MR-06-06 — Resolution   MR-06-07 — Conformance Architecture            Material Strategy           │                   │           └─────────┬─────────┘                     ▼        MR-06-08 — Package Placement                     │                     ▼         Approved M06 Architecture                     │                     ▼           AMS-0601 Implementation ` 
This diagram is a planning dependency map, not an implementation sequence.
  
## 13. M06 Dependency and Execution Map
 
The CAW-011 work-item sequence remains:
 `      [M06 Standards and Architecture Planning]                           │                           ▼                [IT-0601 — GS1 Parser]                           │                           ▼              [IT-0602 — GS1 Validator]                           │                           ▼        [IT-0603 — Digital Link Normalizer]                           │              ┌────────────┴────────────┐              ▼                         ▼  [IT-0604 — Identity Resolver] [IT-0605 — Benchmarks]              │              ▼       [IT-0606 — Replay Validation] ` 
The detailed plan must establish the actual implementation dependencies after the governing standards, support profile, semantic model, and architecture are approved.
 
The work-item names must not be interpreted as pre-approving:
 
 
- A specific parser architecture;
 
- A specific domain model;
 
- A specific package;
 
- A specific normalization representation;
 
- A specific Registry orchestration strategy;
 
- A specific conformance-test source.
 

  
## 14. Final Readiness Assessment
 
### 14.1 Repository Baseline
 
**Status: READY**
 
The repository is healthy after the required local PostgreSQL development dependency was initialized.
 
All authorized checks pass:
 
 
- Formatting;
 
- Linting;
 
- Type checking;
 
- Runtime purity;
 
- Package boundaries;
 
- Dependency graph validation;
 
- Unit tests;
 
- Integration tests.
 

 
### 14.2 M03 Domain Foundation
 
**Status: PARTIALLY READY**
 
The existing GTIN value object is robust within its current repository-defined scope.
 
However, the repository does not yet contain a semantic model for a structured GS1 Digital Link distinct from the GTIN identifier. Detailed M06 planning must resolve this boundary before implementation.
 
### 14.3 M04 Runtime and Replay Foundation
 
**Status: PARTIALLY READY**
 
The deterministic Runtime replay framework is stable and provides a useful foundation.
 
The relationship between M06’s pure interpretation behavior, asynchronous Registry access, and replay validation remains an architecture-planning matter.
 
### 14.4 M05 Registry Foundation
 
**Status: READY AS A FOUNDATION**
 
The Registry contracts and Postgres adapter provide a tested asynchronous lookup capability.
 
M06 must still define the exact normalized resolution reference and the application/orchestration boundary through which the Registry is used.
 
### 14.5 GS1 Standards-Governance Readiness
 
**Status: MISSING**
 
The repository does not identify:
 
 
- The governing GS1 standards;
 
- Their editions or publication dates;
 
- The applicable AI authority;
 
- The approved support profile;
 
- The applicable canonicalization requirements;
 
- The conformance material source and provenance strategy.
 

 
These are not repository defects. They are unresolved standards-governance and planning prerequisites.
 
### 14.6 Readiness to Plan M06
 
**Status: READY**
 
The repository evidence is sufficient to begin detailed M06 standards analysis, semantic architecture, package-boundary design, task decomposition, and implementation planning.
 
### 14.7 Readiness to Implement AMS-0601
 
**Status: NOT READY**
 
Implementation must not begin until the resolutions identified in Section 12 have been completed and incorporated into an approved M06 architecture and implementation plan.
  
## 15. Final Disposition
 
# DISPOSITION B-R
 
## READY FOR DETAILED PLANNING WITH STANDARDS-GOVERNANCE AND SEMANTIC-MODEL PRECONDITIONS
 
The M03, M04, and M05 foundations are healthy and sufficient to begin detailed M06 architecture and task planning.
 
No inherited repository defect blocks planning.
 
However, `AMS-0601` implementation must not begin until:
 
 
1. The governing GS1 authorities are established;
 
2. The M06 support profile is approved;
 
3. The semantic relationship between the existing `GS1Identifier` and any structured Digital Link representation is defined;
 
4. The behavior for well-formed but unsupported GS1 content is established;
 
5. URI interpretation and canonicalization requirements are derived from the governing authority;
 
6. The pure interpretation and asynchronous Registry-resolution boundary is designed;
 
7. The conformance-material and fixture-provenance strategy is approved;
 
8. The final package placement complies with constitutional dependency and purity rules.
 

 
No immediate repository code remediation is required to begin this planning work.
 
The next program step is therefore:
 
 
**External standards verification and detailed M06 semantic architecture — not implementation of AMS-0601.**
 
  
# Appendix A — Repository Evidence Index
 
 
- **CAW-011 Build Order:** `DOCS/CAW/CAW-011-Build-Order.md`
 
- **M03 Domain Contracts:** `packages/domain/src/index.ts` 
 
  - `GS1Identifier`
 
  - `validateGS1Identifier`
 
  - `serializeGS1Identifier`
 
  - `ReferentRecord`
 

 
 
- **M03 Domain Tests:** `packages/domain/src/referent.test.ts` 
 
  - `GS1Identifier` test suite
 

 
 
- **M04 Replay Proof:** `packages/runtime/src/pipeline.test.ts` 
 
  - `"Deterministic replay proof — AMS-0406"`
 

 
 
- **M05 Registry Repository Port:** `packages/contracts/src/registry.ts` 
 
  - `RegistryRepository`
 

 
 
- **M05 Registry Adapter:** `apps/api/src/registry/postgres-registry-repository.ts` 
 
  - `PostgresRegistryRepository`
 
  - `lookup`
 

 
 
- **M05 Registry Integration Tests:** `apps/api/src/registry/postgres-registry.integration.test.ts`
 

  
# Appendix B — Commands Executed
 
All commands were executed from the workspace root.
 
## B.1 Initial Test Execution
 `pnpm run test ` 
**Initial Result:**
 `PostgresError: connect ECONNREFUSED 127.0.0.1:5432 ` 
**Classification:**
 
The required local PostgreSQL service was not running or initialized in the investigation environment.
 
This was treated as a local infrastructure prerequisite rather than a repository code failure.
 
## B.2 Local PostgreSQL Initialization
 `# Adjusted Docker daemon to use the vfs storage driver # to support container mounting in the investigation sandbox echo '{"storage-driver": "vfs"}' | sudo tee /etc/docker/daemon.json sudo systemctl restart docker  # Started PostgreSQL 16 Alpine using the environment # values aligned with the repository CI configuration docker run \   --name pg-test \   -e POSTGRES_DB=zyppi_test \   -e POSTGRES_USER=zyppi_test \   -e POSTGRES_PASSWORD=zyppi_test \   -p 5432:5432 \   -d postgres:16-alpine ` 
## B.3 Database Migration
 `pnpm db:migrate ` 
**Result:**
 
One migration was successfully applied:
 `001_initial_registry_schema.sql ` 
The migration created:
 
 
- `referents`;
 
- `identities`;
 
- `evidence`;
 
- `policies`;
 
- `authorities`;
 
- `capabilities`;
 
- `standings`;
 
- `execution_receipts`;
 
- `schema_migrations`.
 

 
## B.4 Full Verification Suite
 `pnpm install -w  pnpm run format:check && \ pnpm run lint && \ pnpm exec tsc -b && \ pnpm run runtime:purity && \ pnpm run boundary:all && \ pnpm run graph:validate && \ pnpm run test ` 
**Final Outcome: PASS**
 
 
- 22 test files passed;
 
- 481 tests passed;
 
- Database integration and seed-system tests completed successfully.
 

  
# Appendix C — Relevant Paths, Symbols, and Tests
 
 
- **`GS1Identifier` Type:** `packages/domain/src/index.ts`, line 67
 
- **`validateGS1Identifier`:** `packages/domain/src/index.ts`, line 440
 
- **`serializeGS1Identifier`:** `packages/domain/src/index.ts`, line 1083
 
- **`RegistryRepository`:** `packages/contracts/src/registry.ts`, line 45
 
- **Registry Lookup Implementation:** `apps/api/src/registry/postgres-registry-repository.ts`, line 34
 
- **M04 Replay Proof:** `packages/runtime/src/pipeline.test.ts`, line 527
 
- **GS1 Identifier Tests:** `packages/domain/src/referent.test.ts`
 
- **M05 Registry Integration Tests:** `apps/api/src/registry/postgres-registry.integration.test.ts`