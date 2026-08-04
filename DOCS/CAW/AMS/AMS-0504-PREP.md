# AMS-0504-PREP — Registry Seed System Constitutional Reconnaissance
 
**Status:** FINAL — CHAIR-RECONCILED **Authority:** AMS-0504-CDR **Readiness:** OUTCOME A-C **Implementation Status:** NOT YET AUTHORIZED **Production Seed Content:** NOT RATIFIED
  
## 1. Purpose, Authority, and Read-Only Scope
 
### 1.1 Objective
 
This document establishes the final constitutional and architectural reconnaissance for the Registry Seed System under **AMS-0504**.
 
Its purpose is to define the governing boundaries by which an authorized Registry seed corpus may eventually be:
 
 
- represented;
 
- authenticated;
 
- integrity-verified;
 
- structurally validated;
 
- semantically compared;
 
- atomically materialized;
 
- safely re-executed; and
 
- operationally evidenced;
 

 
without permitting the seed mechanism to invent, normalize, repair, reinterpret, or otherwise manufacture constitutional truth.
 
The Registry Seed System is a **controlled materialization mechanism**. It is not a constitutional author, policy engine, Runtime execution path, or autonomous reconciliation system.
 
### 1.2 Governing Authority
 
This PREP is governed by the following authority hierarchy:
 
 
1. Constitutional authorities and ratified governance instruments;
 
2. **AMS-0504-CDR — Registry Seed System Chair Decision Resolution**;
 
3. Ratified M05 planning decisions;
 
4. Current authoritative Domain and contract definitions;
 
5. Current implemented Runtime and Registry behavior;
 
6. Physical PostgreSQL schemas and migrations;
 
7. Tests, examples, historical documents, and illustrative datasets;
 
8. Architectural inference, only where no higher authority settles the matter.
 

 
Where this PREP conflicts with a constitutional authority or a binding Chair ruling, the higher authority prevails.
 
### 1.3 Authorized Scope of This PREP
 
This PREP is a **read-only constitutional and architectural reconciliation artifact**.
 
Its authorized scope is limited to:
 
 
- recording the current Registry baseline;
 
- reconciling AMS-0504-CDR rulings;
 
- defining constitutional boundaries;
 
- identifying implementation dependencies;
 
- establishing implementation gates;
 
- defining the required readiness disposition; and
 
- specifying the conditions under which a future implementation mandate may be issued.
 

 
This PREP does **not** itself authorize implementation.
 
### 1.4 Explicit Non-Goals
 
This PREP does not authorize:
 
 
- creating or editing a production seed executor;
 
- creating or editing a production seed CLI;
 
- creating or editing production seed manifests;
 
- materializing seed records in PostgreSQL;
 
- modifying Domain models, validators, contracts, Runtime behavior, or database schemas;
 
- implementing RFC 8785 canonicalization;
 
- implementing cryptographic signature verification;
 
- implementing Domain equivalence helpers;
 
- creating production trust material;
 
- promoting test fixtures or historical examples into constitutional seed content;
 
- introducing automatic repair, reconciliation, migration, `UPDATE`, or `DELETE` behavior into seed re-execution.
 

  
# 2. Current Repository Baseline
 
## 2.1 `@zyppi/domain`
 
The Domain package contains the pure Registry models, value structures, and synchronous validation behavior required to establish valid constitutional records.
 
The Domain package remains free of:
 
 
- database drivers;
 
- SQL;
 
- file-system access;
 
- environment access;
 
- network access;
 
- cryptographic key loading;
 
- deployment configuration; and
 
- infrastructure-specific side effects.
 

 
The Domain package may contain narrowly scoped, pure, deterministic capabilities required to express constitutional semantics. It must not become a seed executor or infrastructure boundary.
 
**Classification:** `CURRENT SOURCE FACT`
 
## 2.2 `@zyppi/contracts`
 
The Contracts package defines stable application boundaries, including Registry repository interfaces and Runtime receipt interfaces.
 
The seed system must not alter or reinterpret existing Runtime receipt contracts merely to represent administrative seed execution.
 
**Classification:** `CURRENT SOURCE FACT`
 
## 2.3 Registry Persistence
 
The Registry persistence implementation resides under:
 
`apps/api/src/registry/`
 
Current Registry persistence uses parameterized SQL and translates storage behavior into the established Registry error boundary.
 
Existing retrieval mappers are directional decoders from database representations into Domain structures. Their existence does not imply that they are suitable as generic bidirectional persistence abstractions.
 
**Classification:** `CURRENT SOURCE FACT`
  
# 3. Seed Authority Boundary
 
## 3.1 Mechanics Are Not Constitutional Authority
 
The Registry Seed System is an executor of approved authority. It must never become the author of constitutional facts.
 
The future seed system may:
 
 
- load an authorized manifest;
 
- verify manifest provenance;
 
- verify manifest integrity;
 
- validate manifest structure;
 
- validate records through authorized Domain capabilities;
 
- inspect relevant Registry state;
 
- compare declared records with stored Domain records;
 
- atomically materialize an authorized record set; and
 
- return a deterministic execution outcome.
 

 
The future seed system must never:
 
 
- invent missing records;
 
- generate default constitutional values;
 
- infer omitted relationships;
 
- silently coerce invalid values;
 
- normalize malformed content;
 
- repair invalid manifests;
 
- reconcile divergent stored records;
 
- overwrite stored records during re-execution;
 
- delete stored records during re-execution;
 
- treat database state as the authority that validates the manifest; or
 
- promote examples, fixtures, or historical data into approved constitutional truth.
 

 
Any unauthorized, malformed, invalid, unverifiable, or semantically inconsistent input must result in a fail-closed outcome before an unauthorized database commit can occur.
 
**Classification:** `BINDING CHAIR DECISION`
  
# 4. Existing Seed Corpus and Candidate Artifact Audit
 
## 4.1 Production Seed Corpus
 
No approved production Registry seed corpus currently exists in the repository.
 
Production seed content remains outside the authorized scope of AMS-0504.
 
No example, fixture, test graph, historical record, or illustrative dataset may be treated as production seed authority.
 
## 4.2 Historical “Aura” Dataset
 
The historical examples involving:
 
 
- “Aura Labs”;
 
- “Aura Smart Ring v1”; and
 
- GTIN `00860000000123`;
 

 
are illustrative or historical material only.
 
They are not ratified constitutional facts and are prohibited from being promoted into production seed content.
 
**Classification:** `RATIFIED PLANNING DECISION`
 
## 4.3 Test Fixtures
 
Existing Domain, schema, integration, and infrastructure fixtures remain test-only artifacts.
 
They may be used to demonstrate or verify implementation mechanics only within explicitly isolated test boundaries.
 
They must not:
 
 
- become production manifests;
 
- become production trust material;
 
- be loaded by production seed execution;
 
- be interpreted as Council-approved constitutional content; or
 
- be promoted into production state without a separate ratification process.
 

  
# 5. Manifest Constitutional Contract
 
## 5.1 Constitutional Settlement
 
Under **AMS-0504-CDR**, the Registry Seed System shall use a structured JSON manifest as its constitutional manifest mechanism.
 
This settlement authorizes the **manifest model and its governing requirements**. It does not ratify any production seed content.
 
The following conceptual manifest elements are constitutionally required:
 
 
- manifest identity;
 
- manifest version;
 
- authority reference;
 
- integrity declaration;
 
- cryptographic provenance declaration;
 
- declared Registry record collections; and
 
- an unambiguous dependency model.
 

 
## 5.2 Contract Status
 
The manifest mechanism is constitutionally settled.
 
The exact implementation-level schema is not yet implementation-complete.
 
The following details must be fixed in a future implementation specification before code authorization:
 
 
- exact TypeScript contract;
 
- exact JSON Schema or equivalent structural validator;
 
- required versus optional fields;
 
- exact record collection names;
 
- exact nested record representations;
 
- exact dependency-order representation;
 
- exact signature envelope;
 
- exact key identifier representation;
 
- exact digest representation;
 
- exact canonicalization input boundary;
 
- exact signature input boundary; and
 
- exact version-compatibility rules.
 

 
No implementation engineer may infer or invent these details.
 
## 5.3 Manifest Content Status
 
A future manifest may be structurally valid without containing approved production constitutional content.
 
Production seed content remains:
 
`NOT RATIFIED`
 
No production manifest may be authored, signed, materialized, or represented as constitutional authority under AMS-0504 without a separate Council and Chair authorization.
  
# 6. Cryptographic Authority and Trust Root
 
## 6.1 Constitutional Trust Model
 
Manifest authority must be established through cryptographic verification against an authorized public-key trust root.
 
The database must not act as the trust root for the seed that initializes or modifies Registry state.
 
Private signing keys must remain external to:
 
 
- the source repository;
 
- application binaries;
 
- seed manifests;
 
- database state; and
 
- deployment artifacts intended for public distribution.
 

 
The public-key trust root is not secret. Its integrity, provenance, governance, and authorized distribution remain constitutionally significant.
 
## 6.2 Prohibited Authority Models
 
The following must not independently establish seed authority:
 
 
- database records;
 
- environment variables;
 
- deployment-time configuration drift;
 
- ad hoc static allow-lists;
 
- test configuration;
 
- ungoverned application configuration;
 
- undocumented public keys; or
 
- runtime-discovered authority sources.
 

 
Environment configuration may not determine **which authority is constitutionally trusted**.
 
A future implementation may use environment configuration only for non-authoritative operational concerns explicitly approved by the implementation specification, such as selecting an already-governed deployment profile. It may not use environment variables as the source of constitutional trust.
 
## 6.3 Required Trust-Material Specification
 
Before implementation authorization, the implementation specification must define:
 
 
1. the authorized signature algorithm;
 
2. the public-key algorithm;
 
3. the public-key encoding;
 
4. the signature encoding;
 
5. the key identifier format;
 
6. the governed location of authorized public-key trust material;
 
7. the public-key distribution model;
 
8. key rotation behavior;
 
9. key revocation behavior;
 
10. unknown-key behavior;
 
11. expired-key behavior, if applicable; and
 
12. the exact signature verification sequence.
 

 
The trust-material location must be a governed, version-controlled, reviewable artifact or an equivalent ratified authority-distribution mechanism.
 
The implementation engineer must not select these cryptographic properties independently.
 
## 6.4 Authority Verification Boundary
 
Any of the following must result in `AuthorityRefusal` before database writes:
 
 
- missing required signature;
 
- malformed signature;
 
- unknown authority;
 
- unknown key identifier;
 
- unauthorized public key;
 
- invalid signature;
 
- unverifiable signature;
 
- invalid authority reference;
 
- revoked authority;
 
- unsupported cryptographic algorithm; or
 
- any failure that prevents authoritative provenance from being established.
 

  
# 7. Canonicalization and Integrity
 
## 7.1 Governing Canonicalization Standard
 
Manifest canonicalization shall conform to:
 
**RFC 8785 — JSON Canonicalization Scheme (JCS)**
 
Native `JSON.stringify()` behavior is prohibited as the basis for constitutional integrity verification or cryptographic signing.
 
A locally invented “sorted JSON” implementation is not equivalent to RFC 8785 and is prohibited.
 
## 7.2 Canonicalization Requirements
 
The implementation must use a conformant RFC 8785 implementation or a rigorously verified implementation whose behavior is demonstrated against authoritative RFC 8785 test vectors.
 
The implementation must not substitute:
 
 
- alphabetical key sorting alone;
 
- custom number formatting;
 
- custom string normalization;
 
- adapter-specific serialization;
 
- database serialization;
 
- JavaScript engine behavior; or
 
- undocumented JSON normalization.
 

 
The implementation specification must identify the exact canonicalization dependency or implementation and define its verification requirements.
 
## 7.3 Integrity Boundary
 
The exact canonical payload covered by `integrityDigest` must be explicitly defined before implementation.
 
The integrity boundary must:
 
 
- be deterministic;
 
- exclude the digest field itself;
 
- avoid self-referential serialization;
 
- be unambiguous across implementations;
 
- remain independent of database representation; and
 
- be stable across supported runtime environments.
 

 
The implementation specification must state whether the digest covers:
 
 
- the declared `records` payload only;
 
- a defined manifest projection; or
 
- another explicitly bounded canonical payload.
 

 
The implementation engineer must not choose this boundary.
 
## 7.4 Integrity Verification
 
The implementation must:
 
 
1. construct the exact constitutionally specified integrity payload;
 
2. canonicalize that payload using RFC 8785;
 
3. compute the specified cryptographic digest;
 
4. compare the computed value against the declared integrity value using the specified representation; and
 
5. refuse execution if verification fails.
 

 
Any integrity mismatch must produce:
 
`IntegrityRefusal`
 
No database write may begin before integrity verification succeeds.
 
## 7.5 Domain Compatibility Gate
 
Before implementation authorization, the implementation specification must demonstrate that all supported Domain record representations are compatible with the selected JCS implementation.
 
No adapter-local coercion, normalization, or representation repair may be introduced to force compatibility.
 
Any incompatibility between authoritative Domain representations and the required canonicalization model must halt implementation and return the matter for constitutional review.
  
# 8. Signature Envelope and Verification Boundary
 
## 8.1 Required Specification
 
The exact signature payload remains an implementation dependency and must be settled before implementation.
 
The future implementation specification must define:
 
 
- whether the signature covers the entire manifest or a defined projection;
 
- which fields are included;
 
- which fields are excluded;
 
- whether the integrity digest is included;
 
- whether the authority reference is included;
 
- whether the manifest identity and version are included;
 
- whether the signature field itself is excluded;
 
- the canonicalization process applied before signing; and
 
- the exact byte sequence presented to the signature verifier.
 

 
## 8.2 Anti-Ambiguity Rule
 
The signature boundary and integrity boundary must be independently explicit.
 
The implementation must not assume that:
 
 
- a signature over `records` is equivalent to a signature over the manifest;
 
- an integrity digest automatically establishes authority;
 
- an authority reference is trusted merely because it appears in a manifest; or
 
- a valid signature automatically proves that the correct manifest version or authority context was used.
 

 
## 8.3 Implementation Gate
 
No production seed implementation may begin until the cryptographic envelope is specified in a reviewable implementation contract.
  
# 9. Domain Validation and Semantic Equivalence
 
## 9.1 Domain Ownership
 
Registry identity, record validity, and semantic equivalence are Domain concerns.
 
PostgreSQL primary-key equality, raw column equality, JSON text equality, row ordering, or database-specific coercion must not independently define constitutional equivalence.
 
The persistence layer is responsible for retrieving and decoding stored records. The Domain layer is responsible for determining whether two valid representations express the same constitutional record.
 
## 9.2 Required Domain Capability
 
The current Domain boundary lacks the required closed semantic-equivalence capability.
 
A future implementation may introduce a narrowly scoped, pure, deterministic Domain capability only after its exact contract is specified.
 
The capability must:
 
 
- operate on validated Domain record types;
 
- preserve record-type distinctions;
 
- define constitutionally meaningful fields;
 
- exclude storage-only metadata;
 
- avoid `unknown`-based semantic ambiguity;
 
- remain free of database, file-system, network, environment, and infrastructure imports; and
 
- be independently unit-tested.
 

 
The future API must be typed and closed.
 
The following is prohibited as a final contract:
 `areRecordsEqual(a: unknown, b: unknown): boolean ` 
The final implementation specification must instead define either:
 
 
- a discriminated Registry record union with a typed comparator; or
 
- dedicated typed comparators for each Registry record category.
 

 
The implementation engineer must not decide which fields are semantically meaningful.
 
## 9.3 Storage-Only Metadata
 
Storage-only fields must not influence constitutional equivalence unless a future constitutional authority explicitly declares them meaningful.
 
Examples may include:
 
 
- database-generated timestamps;
 
- storage transaction identifiers;
 
- internal row metadata;
 
- database-specific serialization details; and
 
- infrastructure-generated audit values.
 

 
Their exclusion must be implemented through the typed Domain semantic model, not through ad hoc seeder filtering.
 
## 9.4 Stored-State Validation
 
Before semantic comparison:
 
 
1. stored rows must be retrieved;
 
2. stored rows must be decoded into Domain structures;
 
3. decoded structures must pass applicable Domain validation; and
 
4. only then may semantic comparison occur.
 

 
A stored row that cannot be decoded or validated must not be treated as equivalent or merely missing.
 
It must produce the constitutionally specified failure outcome for invalid or corrupted stored state, as defined in the future implementation contract.
  
# 10. Determinism, Idempotency, and State Classification
 
## 10.1 Manifest-Scoped State Evaluation
 
Seeder state evaluation applies exclusively to records declared by the manifest currently being executed.
 
Unrelated Registry records do not create a partial-state anomaly merely because they exist in the database.
 
The seeder must not infer that the entire Registry database is intended to equal the contents of one manifest.
 
## 10.2 Empty Manifest State
 
**Condition:**
 
No declared manifest record is present in the relevant Registry state.
 
**Disposition:**
 
The seeder may proceed to dependency-ordered atomic materialization after all authority, integrity, structural, and Domain validation gates have succeeded.
 
**Outcome:**
 
`Success` upon successful commit.
 
## 10.3 Fully Equivalent State
 
**Condition:**
 
Every declared manifest record is present and semantically equivalent under the authorized Domain comparison capability.
 
**Disposition:**
 
Perform no write.
 
**Outcome:**
 
`AlreadyMaterialized`
 
This is a successful idempotent no-op.
 
## 10.4 Partial-State Anomaly
 
**Condition:**
 
Some, but not all, records declared by the current manifest are present.
 
**Disposition:**
 
Fail closed.
 
The seeder must not:
 
 
- complete the missing subset;
 
- repair the existing subset;
 
- reconcile records;
 
- perform `UPDATE`;
 
- perform `DELETE`; or
 
- infer the cause of the partial state.
 

 
**Outcome:**
 
`PartialStateAnomaly`
 
The partial-state rule applies only to the manifest-declared record set.
 
## 10.5 Diverged State
 
**Condition:**
 
A declared record has a matching constitutional identity in storage but is not semantically equivalent.
 
**Disposition:**
 
Fail closed.
 
The seeder must not overwrite, update, delete, or repair the stored record.
 
**Outcome:**
 
`StateDiverged`
 
## 10.6 Invalid Stored State
 
If a stored record matching a declared identity cannot be decoded or validated as a legitimate Domain record, the implementation must fail closed.
 
The exact outcome classification must be fixed in the implementation contract. It must not be silently mapped to:
 
 
- missing state;
 
- equivalent state;
 
- partial state; or
 
- a recoverable normalization path.
 

  
# 11. Transaction and Concurrency Boundary
 
## 11.1 Atomicity Requirement
 
A successful materialization must be atomic.
 
All manifest records intended for one execution must be committed as one authorized transaction or not committed at all.
 
Any failure before commit must result in rollback.
 
No partial manifest materialization may be accepted as a successful outcome.
 
## 11.2 Required Concurrency Specification
 
The future implementation contract must explicitly define:
 
 
- transaction isolation level;
 
- state-inspection boundary;
 
- concurrency-control mechanism;
 
- behavior when another transaction modifies relevant records;
 
- unique-constraint conflict behavior;
 
- serialization-conflict behavior;
 
- retry policy;
 
- whether retries are prohibited or bounded;
 
- transaction timeout behavior; and
 
- final outcome mapping.
 

 
The phrase “unique constraints will throw” is not a sufficient concurrency model.
 
## 11.3 Fail-Closed Concurrency Rule
 
The seeder must not automatically reinterpret a concurrent conflict as:
 
 
- successful materialization;
 
- `AlreadyMaterialized`;
 
- partial-state repair; or
 
- semantic equivalence.
 

 
Any retry or re-evaluation behavior must be explicitly specified and must re-run the required authority, integrity, state, and equivalence checks within the authorized transaction model.
 
## 11.4 Persistence Mechanism
 
The future implementation may use direct parameterized SQL for dependency-ordered insertion.
 
The implementation must not create a generic bidirectional mapper merely for seeding.
 
Directional persistence encoders may be introduced only where necessary and must remain mechanically separated from retrieval decoders.
  
# 12. Seeder Outcome Taxonomy
 
## 12.1 Constitutional Outcome Categories
 
The seeder outcome model contains three categories:
 
 
1. successful outcomes;
 
2. constitutional or validation refusals; and
 
3. operational or infrastructure failures.
 

 
Infrastructure failure is not a constitutional refusal.
 
## 12.2 Closed Outcome Set
 
The following eight outcomes are constitutionally recognized:
 
### 1. `Success`
 
**Meaning:** The authorized manifest was verified, validated, and fully materialized in a committed atomic transaction.
 
**Category:** Successful outcome.
 
**CLI exit code:** `0`
 
### 2. `AlreadyMaterialized`
 
**Meaning:** Every record declared by the manifest already exists and is semantically equivalent.
 
No write occurs.
 
**Category:** Successful idempotent outcome.
 
**CLI exit code:** `0`
 
### 3. `StateDiverged`
 
**Meaning:** A declared record has a matching identity in storage but is not semantically equivalent.
 
**Category:** Constitutional state refusal.
 
**CLI exit code:** `2`
 
### 4. `PartialStateAnomaly`
 
**Meaning:** Some, but not all, records declared by the current manifest are present.
 
**Category:** Constitutional state refusal.
 
**CLI exit code:** `3`
 
### 5. `IntegrityRefusal`
 
**Meaning:** The declared integrity value cannot be verified against the exact constitutionally specified canonical payload.
 
**Category:** Integrity refusal.
 
**CLI exit code:** `4`
 
### 6. `AuthorityRefusal`
 
**Meaning:** Manifest provenance cannot be established under the authorized public-key trust root.
 
**Category:** Authority refusal.
 
**CLI exit code:** `5`
 
### 7. `ValidationRefusal`
 
**Meaning:** The manifest structure or one or more declared records fail the authorized structural or Domain validation rules.
 
**Category:** Validation refusal.
 
**CLI exit code:** `6`
 
### 8. `InfrastructureFailure`
 
**Meaning:** Execution cannot complete because of an operational failure such as database unavailability, connection failure, timeout, transaction failure, or another infrastructure-level condition.
 
**Category:** Operational failure.
 
**CLI exit code:** `1`
 
## 12.3 Outcome Mapping Rule
 
The future implementation must define a closed, typed discriminated union corresponding to this taxonomy.
 
The CLI must map outcomes deterministically.
 
The CLI must not expose raw database driver errors, secret values, private cryptographic material, or internal infrastructure details.
  
# 13. Runtime and Receipt Isolation
 
## 13.1 Seeder-Runtime Separation
 
Registry seeding is an administrative bootstrap and materialization operation.
 
It must not:
 
 
- invoke the request-driven Runtime;
 
- fabricate Runtime requests;
 
- construct artificial Active Constitutional Views;
 
- invoke Runtime policy evaluation merely to seed data; or
 
- create synthetic Runtime decisions.
 

 
## 13.2 Execution Receipts
 
The Registry Seed System must not create a standard Runtime `ExecutionReceipt`.
 
Runtime receipts remain reserved for their constitutionally defined Runtime execution boundary.
 
## 13.3 Administrative Evidence Baseline
 
AMS-0504 does not authorize:
 
 
- a Genesis receipt;
 
- a new Runtime receipt type;
 
- a new Registry audit table;
 
- a new seed-audit database schema; or
 
- a synthetic execution evidence graph.
 

 
The evidence baseline for this milestone consists of:
 
 
- authorized manifest provenance;
 
- cryptographic verification results;
 
- integrity verification results;
 
- deterministic execution logs;
 
- deployment records;
 
- source-control history; and
 
- committed or rolled-back database transaction state.
 

 
Future administrative audit artifacts require separate authorization.
  
# 14. Seeded-Record Lifecycle
 
## 14.1 No Seed-Specific Identity
 
Seeded Registry records are ordinary constitutional Registry facts.
 
They must not receive an implicit or invented lifecycle classification solely because they entered the database through the seed mechanism.
 
No `is_seed`, `seed_source`, or equivalent hybrid metadata may be introduced without separate constitutional authorization.
 
## 14.2 Lifecycle Governance
 
Record lifecycle remains governed by the applicable Domain model, constitutional status, validity periods, and authorized Registry evolution mechanisms.
 
## 14.3 Re-Execution Restriction
 
A seed re-execution is not a record migration or state-repair mechanism.
 
It must not perform `UPDATE` or `DELETE` operations to force stored state to match a manifest.
 
Any authorized evolution of seeded constitutional facts must occur through a separately authorized mechanism.
  
# 15. Test and Build Isolation
 
## 15.1 Test Fixtures
 
Synthetic manifests may be used to verify seed mechanics.
 
Such fixtures must remain:
 
 
- test-only;
 
- non-authoritative;
 
- isolated from production manifest discovery;
 
- isolated from production trust material;
 
- excluded from production seed execution; and
 
- incapable of being promoted by accidental path resolution.
 

 
## 15.2 Path and Packaging Gate
 
The exact fixture location must be determined from the repository’s actual build, test, packaging, and deployment conventions.
 
No fixture path becomes binding merely because it appears in an earlier reconnaissance draft.
 
Before implementation authorization, the implementation specification must demonstrate that test fixtures:
 
 
- are not included in production application packages unless explicitly required and controlled;
 
- cannot be discovered by production manifest loading;
 
- cannot be loaded through production CLI arguments;
 
- cannot be mistaken for production constitutional content; and
 
- remain distinguishable through both path and execution context.
 

 
## 15.3 Environment Safeguards
 
Test execution may use environment checks as an operational safety control.
 
Such checks do not establish constitutional authority.
 
The implementation specification must define:
 
 
- test database identification;
 
- test execution entry points;
 
- production execution entry points;
 
- fixture-loading restrictions;
 
- database safety checks; and
 
- CI enforcement.
 

 
## 15.4 Production Content Prohibition
 
No production seed content may be introduced into the test fixture corpus.
 
No test fixture may be represented as Council-approved constitutional content.
  
# 16. Package and Responsibility Boundaries
 
## 16.1 Seed Orchestration
 
Future seed orchestration belongs within the application infrastructure boundary under:
 
`apps/api/src/registry/`
 
The exact file names and internal module layout remain implementation decisions.
 
## 16.2 Domain Boundary
 
The Domain package may contain only narrowly scoped, pure, deterministic capabilities required to express:
 
 
- typed semantic equivalence; and
 
- canonicalization behavior, if the final implementation architecture assigns RFC 8785 capability to Domain.
 

 
The final package placement of JCS functionality must be justified by purity and dependency rules.
 
The Domain package must not contain:
 
 
- seed file loading;
 
- manifest path resolution;
 
- database access;
 
- SQL;
 
- public-key loading;
 
- environment access;
 
- deployment configuration;
 
- CLI behavior;
 
- transaction orchestration; or
 
- infrastructure logging.
 

 
## 16.3 Contracts Boundary
 
The Contracts package may contain stable seed outcome contracts only if the future implementation specification determines that those outcomes form a cross-package application boundary.
 
The Contracts package must not contain infrastructure implementation behavior.
 
## 16.4 Runtime Boundary
 
The Runtime package must remain isolated from seed execution.
 
No seed-specific Runtime pathway may be introduced.
 
## 16.5 Persistence Boundary
 
Persistence is responsible only for:
 
 
- transactional state inspection;
 
- retrieval of relevant stored records;
 
- mechanical decoding;
 
- authorized parameterized insertion;
 
- transaction commit;
 
- transaction rollback; and
 
- infrastructure error translation.
 

 
Persistence must not define constitutional semantic equivalence or authority.
  
# 17. Decision Register
 
  
 
Decision ID
 
Topic
 
Final Disposition
 
Classification
 
Further Chair Decision
 
   
 
AMS-0504-PREP-D01
 
Seed authority boundary
 
Seeder executes approved authority and must not author truth.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D02
 
Production seed corpus
 
No production corpus is approved. Historical examples remain prohibited.
 
RATIFIED
 
No
 
 
 
AMS-0504-PREP-D03
 
Manifest mechanism
 
Structured JSON manifest mechanism is constitutionally settled. Exact implementation schema remains gated.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D04
 
Manifest authority
 
PKI verification against governed public-key trust material is required.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D05
 
Canonicalization
 
RFC 8785 JCS is mandatory. Native serialization and custom sorted JSON are prohibited.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D06
 
Integrity boundary
 
Exact canonical payload must be fixed before implementation.
 
IMPLEMENTATION GATE
 
No
 
 
 
AMS-0504-PREP-D07
 
Signature boundary
 
Exact signed payload and cryptographic envelope must be fixed before implementation.
 
IMPLEMENTATION GATE
 
No
 
 
 
AMS-0504-PREP-D08
 
Semantic equivalence
 
Typed Domain-owned semantic equivalence is required.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D09
 
Domain helper design
 
Exact typed comparator contract must be specified before implementation.
 
IMPLEMENTATION GATE
 
No
 
 
 
AMS-0504-PREP-D10
 
Idempotency
 
Fully equivalent manifest state returns `AlreadyMaterialized` without writes.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D11
 
Divergence
 
Diverged records fail closed; no `UPDATE` or `DELETE`.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D12
 
Partial state
 
Partial-state evaluation is manifest-scoped and fails closed.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D13
 
Transaction model
 
Full materialization must be atomic. Exact concurrency mechanism remains gated.
 
BINDING / GATE
 
No
 
 
 
AMS-0504-PREP-D14
 
Persistence pattern
 
Direct parameterized SQL is permitted; generic bidirectional mappers are not required.
 
RATIFIED
 
No
 
 
 
AMS-0504-PREP-D15
 
Outcome taxonomy
 
Closed eight-outcome taxonomy is required.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D16
 
Infrastructure failure
 
Infrastructure failure is an operational failure, not a constitutional refusal.
 
CHAIR RECONCILIATION
 
No
 
 
 
AMS-0504-PREP-D17
 
Runtime isolation
 
Seeder must not invoke Runtime or create an ExecutionReceipt.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D18
 
Audit baseline
 
No new Genesis receipt or audit schema is authorized.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D19
 
Test isolation
 
Test fixtures must be physically and operationally isolated. Exact path requires repository-based verification.
 
IMPLEMENTATION GATE
 
No
 
 
 
AMS-0504-PREP-D20
 
Production content
 
Production seed content remains unratified and blocked.
 
BINDING
 
No
 
 
 
AMS-0504-PREP-D21
 
Implementation authorization
 
No implementation may begin until all required implementation gates are resolved and reviewed.
 
BINDING
 
No
 
  
  
# 18. Remaining Implementation Gates
 
The following items are not unresolved constitutional questions.
 
They are mandatory implementation specifications that must be completed before implementation authorization.
 
## Gate 1 — Exact Manifest Contract
 
Define:
 
 
- exact TypeScript types;
 
- exact structural validation schema;
 
- required fields;
 
- optional fields;
 
- record collection structure;
 
- dependency representation;
 
- versioning rules; and
 
- compatibility rules.
 

 
## Gate 2 — Cryptographic Envelope
 
Define:
 
 
- signature algorithm;
 
- public-key algorithm;
 
- key encoding;
 
- signature encoding;
 
- key identifier;
 
- authorized trust-material distribution;
 
- key rotation;
 
- key revocation;
 
- signed payload boundary; and
 
- verification sequence.
 

 
## Gate 3 — Integrity Contract
 
Define:
 
 
- exact integrity payload;
 
- exact digest algorithm;
 
- exact digest representation;
 
- canonicalization sequence;
 
- exclusion of self-referential fields; and
 
- RFC 8785 conformance verification.
 

 
## Gate 4 — Domain Equivalence Contract
 
Define:
 
 
- closed Registry record type boundary;
 
- typed comparator API;
 
- constitutionally meaningful fields;
 
- storage-only exclusions;
 
- cross-type behavior; and
 
- required unit-test matrix.
 

 
## Gate 5 — Stored-State Corruption Mapping
 
Define the deterministic outcome for stored records that:
 
 
- cannot be decoded;
 
- fail Domain validation;
 
- violate expected Registry invariants; or
 
- cannot be semantically evaluated.
 

 
## Gate 6 — Transaction and Concurrency Contract
 
Define:
 
 
- transaction isolation;
 
- concurrency-control mechanism;
 
- conflict behavior;
 
- retry behavior;
 
- timeout behavior;
 
- rollback behavior; and
 
- deterministic outcome mapping.
 

 
## Gate 7 — Dependency Materialization Order
 
Verify the exact insertion order against:
 
 
- current foreign-key relationships;
 
- Registry dependency rules;
 
- immutable-table constraints; and
 
- transaction requirements.
 

 
## Gate 8 — Test, Build, and Packaging Isolation
 
Demonstrate:
 
 
- fixture location;
 
- fixture exclusion or controlled packaging;
 
- production loader restrictions;
 
- test database protections;
 
- CI enforcement; and
 
- prevention of production fixture leakage.
 

 
## Gate 9 — Outcome Interface and CLI Contract
 
Define:
 
 
- typed discriminated union;
 
- internal error mapping;
 
- CLI output rules;
 
- deterministic exit-code mapping;
 
- secret redaction; and
 
- operational logging behavior.
 

  
# 19. Future Implementation Scope
 
Once all implementation gates are resolved and accepted, a future AMS-0504 implementation mandate may authorize:
 
 
- manifest loading;
 
- structural manifest validation;
 
- public-key trust-root verification;
 
- cryptographic signature verification;
 
- RFC 8785 canonicalization;
 
- integrity verification;
 
- Domain record validation;
 
- typed Domain semantic equivalence;
 
- manifest-scoped state inspection;
 
- atomic dependency-ordered insertion;
 
- deterministic outcome generation;
 
- CLI integration;
 
- isolated synthetic test fixtures;
 
- unit tests;
 
- integration tests;
 
- transaction and concurrency tests;
 
- cryptographic conformance tests; and
 
- build and CI safety checks.
 

  
# 20. Future Implementation Non-Goals
 
The future implementation must not:
 
 
- create production seed content;
 
- invent constitutional Registry records;
 
- promote historical examples;
 
- promote test fixtures;
 
- invoke Runtime;
 
- create an `ExecutionReceipt`;
 
- create a Genesis receipt;
 
- create a new audit schema;
 
- introduce automatic state repair;
 
- perform `UPDATE` on seed re-execution;
 
- perform `DELETE` on seed re-execution;
 
- use the database as the trust root;
 
- use environment configuration as the source of constitutional authority;
 
- use native `JSON.stringify()` as constitutional canonicalization;
 
- use a hand-written sorted-JSON approximation of RFC 8785;
 
- introduce infrastructure imports into Domain;
 
- introduce seed logic into Runtime; or
 
- silently normalize malformed manifests or stored records.
 

  
# 21. Readiness Verdict
 
## VERDICT
 
`OUTCOME A-C — CONSTITUTIONAL MECHANICS AUTHORIZED; IMPLEMENTATION CONTRACT RECONCILIATION REQUIRED; PRODUCTION SEED CONTENT NOT RATIFIED`
 
## 21.1 Meaning
 
### A — Constitutional Mechanics Authorized
 
AMS-0504-CDR has resolved the constitutional direction governing:
 
 
- seed authority;
 
- PKI trust-root requirements;
 
- RFC 8785 canonicalization;
 
- Domain-owned semantic equivalence;
 
- idempotency;
 
- divergence handling;
 
- partial-state handling;
 
- atomicity;
 
- Runtime isolation;
 
- receipt isolation;
 
- outcome taxonomy; and
 
- production-content prohibition.
 

 
### C — Implementation Contract Reconciliation Required
 
The constitutional rulings must still be converted into a complete, deterministic, reviewable implementation specification.
 
The implementation gates in Section 18 are mandatory.
 
No production seed implementation is authorized until those gates are completed and accepted.
 
### Production Seed Content Not Ratified
 
No production Registry seed corpus is approved.
 
No production constitutional records may be authored, signed, materialized, or represented as authorized seed content under AMS-0504.
  
# 22. Final Chair Disposition
 
This PREP is accepted as the final constitutional reconnaissance and reconciliation artifact for AMS-0504.
 
The PREP establishes the constitutional mechanics and the mandatory implementation gates.
 
It does not authorize production implementation.
 
The next permitted action is the creation of a dedicated implementation-contract reconciliation artifact or specification that resolves every gate in Section 18 without altering constitutional rulings.
 
Only after that specification is reviewed and accepted may a separate implementation mandate be issued.
  
# Appendix A — Authority Classification
 
## BINDING CHAIR DECISION
 
A ruling settled by AMS-0504-CDR and not open to implementation-level reinterpretation.
 
## CONSTITUTIONALLY SETTLED
 
A requirement established by higher constitutional authority.
 
## RATIFIED PLANNING DECISION
 
A ratified planning boundary governing scope or architectural direction.
 
## CURRENT SOURCE FACT
 
A verified characteristic of the present repository, Domain model, contract boundary, Runtime behavior, or database implementation.
 
## IMPLEMENTATION GATE
 
A required technical specification that must be completed before implementation authorization but does not reopen the constitutional ruling.
 
## CHAIR RECONCILIATION
 
A correction made to remove contradiction, ambiguity, stale language, or unsafe implementation latitude.
  
# Appendix B — Implementation Authorization Checklist
 
Implementation remains blocked until all of the following are complete:
 
 
- [ ] Exact manifest schema accepted.
 
- [ ] Structural validation contract accepted.
 
- [ ] Manifest versioning rules accepted.
 
- [ ] Signature algorithm accepted.
 
- [ ] Public-key format accepted.
 
- [ ] Signature encoding accepted.
 
- [ ] Key identifier format accepted.
 
- [ ] Governed trust-material location accepted.
 
- [ ] Key rotation behavior accepted.
 
- [ ] Key revocation behavior accepted.
 
- [ ] Exact signed payload accepted.
 
- [ ] Exact integrity payload accepted.
 
- [ ] Digest algorithm and representation accepted.
 
- [ ] RFC 8785 implementation selected.
 
- [ ] RFC 8785 conformance tests defined.
 
- [ ] Domain compatibility with JCS demonstrated.
 
- [ ] Typed Domain equivalence API accepted.
 
- [ ] Semantic field definitions accepted.
 
- [ ] Invalid stored-state outcome accepted.
 
- [ ] Transaction isolation accepted.
 
- [ ] Concurrency-control mechanism accepted.
 
- [ ] Conflict and retry behavior accepted.
 
- [ ] Dependency insertion order verified.
 
- [ ] Fixture isolation demonstrated.
 
- [ ] Production packaging safety demonstrated.
 
- [ ] Closed outcome union accepted.
 
- [ ] CLI behavior and exit-code mapping accepted.
 
- [ ] Production seed content remains excluded.
 

  
**END OF AMS-0504-PREP**