# M05-PLAN — Registry Layer Constitutional Plan

**Plan ID:** M05-PLAN **Milestone:** M05 — Registry Layer **Status:** RATIFIED **Authority Level:** CAW Planning Artifact **Roadmap Authority:** `DOCS/CAW/CAW-011-Build-Order.md` **Primary Implementation Targets:** `packages/contracts`, `apps/api/src/registry`, `infra/` **Predecessor:** M03 — Domain Foundation **Parallel Milestones:** M04 — Runtime Skeleton; M06 — GS1 Digital Link Resolution **Primary Downstream Consumer:** M08 — Runtime Verification Pipeline **Prepared From:** `DOCS/CAW/M05/M05-PREP.md`, ratified CAW authority, current repository baseline, and Chair-authorized planning decisions **Date:** August 3, 2026

# 1. Purpose

M05 establishes Zyppi’s first persistent Registry infrastructure.

The purpose of the milestone is **not** to make PostgreSQL an author of constitutional meaning, move persistence concerns into the Domain or Runtime, construct a production API, implement GS1 resolution, generate evidence, or complete the Runtime verification pipeline.

The purpose is to establish a durable, explicit, and auditable persistence boundary through which already-defined constitutional state can be:

- represented in PostgreSQL;

- migrated through tracked and reviewable schema changes;

- retrieved through pure repository contracts;

- mapped explicitly from storage rows into domain records;

- assembled into an Active Constitutional View;

- returned through typed, fail-closed outcomes;

- preserved without silently inventing, defaulting, or normalizing constitutional truth.

M05 SHALL prove that stateful infrastructure can be introduced without weakening the architectural isolation established by the Domain and Runtime layers.

The resulting Registry Layer SHALL provide a controlled persistence seam for later integration while making no claim that the full verification flow is already operational.

M05 SHALL establish:

- the minimum PostgreSQL schema authorized by CAW-008;

- explicit database constraints and relational integrity;

- pure Registry repository contracts;

- a concrete PostgreSQL adapter;

- explicit row-to-domain mapping;

- deterministic and auditable migration execution;

- seed-data execution mechanics without inventing unratified seed content;

- real PostgreSQL integration evidence;

- a clean handoff to M08 for Runtime integration.

M05 SHALL NOT redefine the Domain model, contaminate the Runtime, or simulate downstream capabilities merely to demonstrate database activity.

# 2. Governing Authority and Planning Order

## 2.1 Authority Order

M05 implementation SHALL conform to the following authority hierarchy:

1.

Ratified constitutional documents and applicable constitutional locks and invariants.

2.

Ratified Engineering Constitution and active engineering standards, including:

- `CEngS-001`;

- `CEngS-002`;

- applicable CI, migration, testing, dependency, and repository rules.

3.

Active CAW authority:

- `CAW-003 — Domain Model`;

- `CAW-004 — Repository Map`;

- `CAW-007 — Runtime Contracts`;

- `CAW-008 — Registry Schema`;

- `CAW-011 — Build Order`.

4.

Ratified M03 Domain artifacts.

5.

Chair-authorized M05 planning decisions recorded in this plan.

6.

`M05-PREP`.

7.

This `M05-PLAN`.

8.

Individual AMS mandates.

9.

Implementation source code and tests.

No implementation convenience, database convention, driver behavior, ORM convention, generated schema, migration framework, or existing source-code precedent may override a higher authority.

Where a lower-level artifact conflicts with a higher authority, the higher authority SHALL govern.

## 2.2 Planning Sequence

The authorized M05 sequence is:
`M05-PREP     ↓ Source-Grounded Registry Reconnaissance     ↓ Chair Resolution of Planning Decisions     ↓ M05-PLAN     ↓ AMS-0501     ↓ IT-0501 — PostgreSQL Schema     ↓ AMS-0502     ↓ IT-0502 — Repository Interfaces     ↓ AMS-0503     ↓ IT-0503 — Registry Adapter     ↓ AMS-0504     ↓ IT-0504 — Seed Data     ↓ AMS-0505     ↓ IT-0505 — Migration Framework     ↓ M05 Closure Review `
`CAW-011` remains the sole M05 implementation roadmap.

This plan SHALL NOT create:

- an alternative M05 task hierarchy;

- replacement IT identifiers;

- parallel implementation tracks;

- a database sub-milestone taxonomy;

- a separate persistence roadmap;

- additional implementation tasks outside IT-0501 through IT-0505.

All implementation work SHALL remain attributable to one of the existing tasks:

- **IT-0501 — PostgreSQL Schema**

- **IT-0502 — Repository Interfaces**

- **IT-0503 — Registry Adapter**

- **IT-0504 — Seed Data**

- **IT-0505 — Migration Framework**

No AMS may silently broaden the scope established by this plan.

# 3. M05 Constitutional Responsibility

At M05, the Registry Layer has one architectural responsibility:

**Preserve and retrieve authorized constitutional state without authoring, completing, normalizing, or redefining constitutional truth.**

The Registry Layer SHALL:

- persist only the state authorized by the governing Registry schema;

- preserve the distinction between domain truth and storage representation;

- retrieve constitutional state through explicit contracts;

- map database rows into pure domain records explicitly;

- assemble the minimum Active Constitutional View required for one verification decision;

- distinguish valid identity absence from Registry failure;

- fail closed when required constitutional state is incomplete, inconsistent, corrupted, or unavailable;

- expose no database-driver types through pure contracts;

- remain outside the Runtime package;

- preserve database-level invariants through real PostgreSQL behavior;

- maintain auditable schema history.

The Registry Layer SHALL NOT:

- invent missing relationships;

- convert missing required state into valid empty collections;

- synthesize policies, standings, authorities, capabilities, evidence references, or referents;

- infer constitutional validity from storage defaults;

- make authorization or policy decisions;

- execute the Runtime pipeline;

- parse or normalize GS1 Digital Links;

- generate evidence;

- construct a complete execution receipt;

- expose raw database exceptions as application contracts;

- permit database implementation details to become Domain semantics.

The Registry is an operational persistence and retrieval layer.

It is **not** the source of constitutional meaning.

# 4. Core M05 Invariants

## 4.1 Domain Truth Remains Above Storage

`@zyppi/domain` remains the source of truth for:

- domain entities;

- value constraints;

- validation rules;

- domain relationships;

- constitutional record meaning.

The PostgreSQL schema SHALL represent and constrain authorized domain state, but SHALL NOT redefine domain semantics.

Database columns, defaults, generated values, triggers, indexes, or storage conventions SHALL NOT silently alter the meaning of a Domain artifact.

Where storage representation and Domain representation differ, the adapter SHALL perform an explicit and reviewable transformation.

The database SHALL NOT become the authoritative location for business or constitutional logic that belongs in the Domain.

## 4.2 Runtime Purity Is Non-Negotiable

`@zyppi/runtime` SHALL remain:

- pure;

- deterministic;

- in-memory;

- free of database clients;

- free of connection pools;

- free of SQL execution;

- free of migration logic;

- free of repository adapter implementations;

- free of storage configuration.

M05 SHALL NOT add:

- `postgres.js`;

- SQL utilities;

- database configuration;

- connection strings;

- repository implementations;

- persistence abstractions;

to `packages/runtime`.

The Runtime SHALL receive already-assembled constitutional state through its existing or future authorized execution inputs.

M05 creates the Registry seam; it does not wire the Registry into the Runtime pipeline.

Runtime integration remains a downstream responsibility.

## 4.3 I/O Containment

All PostgreSQL I/O SHALL remain inside the Application and Infrastructure layers.

The authorized M05 topology is:
`@zyppi/domain     │     │ defines pure constitutional entities     ▼ @zyppi/contracts     │     │ defines pure Registry ports and result contracts     ▼ apps/api/src/registry     │     │ owns postgres.js client access,     │ parameterized SQL, and row mapping     ▼ PostgreSQL Registry `
The Runtime remains outside the persistence dependency chain:
`PostgreSQL     │     ▼ apps/api/src/registry     │     │ assembles validated constitutional state     ▼ Future application orchestration     │     ▼ @zyppi/runtime `
The Runtime SHALL receive constitutional state, not a database client.

## 4.4 Partial Truth Is Not Valid Truth

An Active Constitutional View is an assembled constitutional snapshot.

It SHALL NOT be treated as valid merely because an identity row exists.

If an identity exists but required constitutional state is missing, inconsistent, corrupted, or cannot be mapped into valid Domain records, the Registry SHALL fail closed.

The adapter SHALL NOT conceal incomplete state through:
`standings: [] authorities: [] capabilities: [] applicablePolicies: [] relationships: [] `
when the empty value is actually the result of missing or broken required data.

An empty collection may be returned only when the governing model and the retrieved constitutional state establish that emptiness is itself valid and complete.

The adapter SHALL distinguish:

1.

**Identity absent**

- A valid lookup absence.

- The result is successful with a `null` value.

2.

**Identity present but required constitutional state incomplete or inconsistent**

- An invalid Registry state.

- The result is a typed failure.

3.

**Storage unavailable**

- An infrastructure failure.

- The result is a typed failure.

4.

**Storage/query/mapping failure**

- An operational or transformation failure.

- The result is a typed failure.

- Raw driver exceptions SHALL NOT cross the pure contract boundary.

## 4.5 Explicit Temporal Semantics

M05 SHALL NOT use database wall-clock functions such as:
`NOW() CURRENT_TIMESTAMP CURRENT_DATE LOCALTIMESTAMP `
to determine whether constitutional state is active, applicable, valid, suspended, or terminated.

M05 SHALL not introduce hidden time-dependent constitutional behavior through SQL predicates.

Constitutional state selection SHALL rely on the explicit fields and relationships authorized by the governing model.

If future constitutional requirements introduce point-in-time or temporal validity semantics, they SHALL be modeled through explicit authorized inputs and contracts rather than implicit database clock evaluation.

Database timestamps may be stored where authorized for record provenance and audit purposes.

They SHALL NOT be used as an unratified substitute for constitutional activation logic.

## 4.6 Append-Only Integrity

The Registry SHALL preserve the append-only requirements established for authorized immutable records.

The applicable tables, including:

- `evidence`;

- `execution_receipts`;

SHALL be protected against unauthorized application-level mutation.

M05 SHALL implement the required database-level restrictions using the approved PostgreSQL mechanism or combination of mechanisms.

The implementation SHALL demonstrate that application-level attempts to update or delete protected records fail against a real PostgreSQL instance.

Application convention alone is insufficient.

A comment stating “append-only” is insufficient.

A TypeScript interface without database enforcement is insufficient.

The invariant SHALL be demonstrable at the PostgreSQL boundary.

# 5. Ratified M05 Architecture Decisions

The following decisions are locked for M05 implementation.

## 5.1 M05-D01 — Contract and Adapter Placement

### Decision

Registry repository ports SHALL reside in:
`packages/contracts `
Concrete PostgreSQL Registry infrastructure SHALL reside under:
`apps/api/src/registry/ `
No new workspace package is authorized for M05.

### Required Boundary

`packages/domain     └── pure entities and validation  packages/contracts     └── pure Registry interfaces and typed outcomes  apps/api/src/registry     ├── PostgreSQL client ownership     ├── repository implementations     ├── parameterized SQL     ├── row types     └── explicit row-to-domain mapping  packages/runtime     └── no Registry driver, adapter, SQL, or connection dependency `

### Consequences

Repository ports SHALL NOT be placed in `@zyppi/domain`.

Repository ports SHALL NOT expose PostgreSQL types.

The PostgreSQL adapter SHALL NOT be placed in `packages/runtime`.

M05 SHALL NOT create:
`packages/registry-postgres packages/database packages/persistence packages/infra `
without a separate future architectural authorization.

## 5.2 M05-D02 — Persistence and Migration Topology

### Decision

M05 SHALL use:

- **Driver:** `postgres.js`;

- **Query model:** parameterized raw SQL;

- **Mapping model:** explicit TypeScript row-to-domain mappers;

- **Migration format:** versioned plain SQL files;

- **Migration execution:** a minimal custom Node.js/TypeScript runner;

- **Migration tracking:** a PostgreSQL `schema_migrations` table.

### Prohibited M05 Persistence Models

M05 SHALL NOT introduce:

- Prisma;

- TypeORM;

- generated ORM clients;

- code-generated database schemas;

- hidden migration generation;

- lazy-loading entity models;

- ORM-managed domain entities;

- automatic relation hydration;

- database abstractions that conceal the executed SQL.

M05 SHALL NOT introduce a query builder.

Raw SQL is the approved query model for this milestone.

### Rationale

The M05 persistence layer must remain:

- explicit;

- inspectable;

- reviewable;

- dependency-light;

- auditable;

- free of hidden schema generation;

- free of implicit object hydration;

- free of storage abstractions that obscure row-to-domain behavior.

## 5.3 M05-D05 — Seed Fixture Content

### Decision

Seed-data **mechanics** are within M05 scope.

Seed-data **content** is not yet authorized.

The following historical examples remain:

**ILLUSTRATIVE ONLY — UNRATIFIED — NOT AUTHORIZED AS M05 SEED CONTENT**

- “Aura Labs”;

- “Aura Smart Ring v1”;

- GTIN `00860000000123`;

- any associated manufacturer;

- any associated policy;

- any associated standing;

- any associated authority or capability record.

M05 SHALL NOT promote these examples into:

- normative fixtures;

- production seed data;

- acceptance-test assumptions;

- required database records;

- constitutional examples.

### IT-0504 Boundary

IT-0504 MAY implement:

- seed execution infrastructure;

- deterministic seed-file discovery;

- idempotent execution mechanics;

- transaction behavior;

- provenance validation;

- explicit refusal to execute unapproved fixture content.

IT-0504 SHALL NOT be considered complete until authoritative seed content is separately approved and available.

The absence of approved seed content SHALL be recorded as a named dependency rather than hidden through invented data.

## 5.4 M05-D06 — ACV Retrieval Contract

### Decision

ACV retrieval SHALL use an explicit typed result model.

The minimum required observable semantics are:
`type RegistryResult<T> =   | {       ok: true;       value: T;     }   | {       ok: false;       error: RegistryError;     }; `
For ACV lookup:
`type AcvLookupResult =   | {       ok: true;       value: ActiveConstitutionalView | null;     }   | {       ok: false;       error: RegistryError;     }; `
The exact internal TypeScript representation may be finalized by AMS-0502 provided the required semantics remain unchanged.

### Required Outcome Semantics

Condition

Required Outcome

Identity does not exist

`{ ok: true, value: null }`

Identity exists and complete constitutional state is retrieved

`{ ok: true, value: ActiveConstitutionalView }`

Required constitutional state is missing, inconsistent, or invalid

`{ ok: false, error: IncompleteConstitutionalState }`

PostgreSQL service, connection, or pool is unavailable

`{ ok: false, error: StorageUnavailable }`

Query execution, row decoding, or storage transformation fails

Typed fail-closed Registry error; raw driver exception SHALL NOT cross the contract boundary

### Minimum Semantic Error Categories

M05 SHALL preserve these semantic distinctions:

- `IncompleteConstitutionalState`;

- `StorageUnavailable`;

- a typed storage/query/mapping failure category where required.

M05-PLAN does not freeze infrastructure-specific subcodes such as:
`PG_CONNECTION_REFUSED PG_POOL_EXHAUSTED PG_QUERY_TIMEOUT PG_ROW_DECODE_FAILED `
Those implementation details SHALL remain subordinate to the required semantic contract.

# 6. Authorized Registry Scope

M05 SHALL implement only the Registry schema and persistence responsibilities authorized by CAW-008 and CAW-011.

The Registry schema SHALL remain limited to the authorized minimum needed to support one verification flow.

The M05 schema scope includes the authorized Registry entities and relationships represented through the following table families:

- `identities`;

- `referents`;

- `evidence`;

- `policies`;

- `authorities`;

- `capabilities`;

- `standings`;

- `execution_receipts`;

- `schema_migrations`.

`schema_migrations` is operational migration metadata.

It SHALL NOT be treated as constitutional Registry state.

M05 SHALL use the field names, relationships, constraints, and persistence requirements authorized by CAW-008.

No future-proofing fields may be introduced merely because they might be useful later.

M05 SHALL NOT add:

- multi-tenant fields;

- organization partitioning;

- account ownership;

- user preferences;

- generic metadata blobs;

- speculative policy extensions;

- future execution fields;

- unratified lifecycle fields;

- caching fields;

- search indexes unrelated to the authorized flow;

- storage-provider implementation state;

- API transport state.

Any field not grounded in the authorized schema SHALL require separate authority before implementation.

# 7. Active Constitutional View Boundary

## 7.1 ACV Purpose

The Active Constitutional View is the minimum assembled constitutional state required for one verification decision.

M05 SHALL treat ACV assembly as a Registry retrieval and validation responsibility.

M05 SHALL NOT treat ACV assembly as:

- policy evaluation;

- Runtime execution;

- authorization;

- GS1 resolution;

- evidence generation;

- receipt generation.

# 7.2 ACV Content

The M05 Registry adapter SHALL retrieve and assemble the authorized ACV content:

- identity;

- relationships;

- standings;

- authorities;

- capabilities;

- evidence references;

- applicable policies.

The adapter SHALL map retrieved state into the corresponding authorized Domain representations.

The adapter SHALL not create substitute domain objects when required records are missing.

# 7.3 ACV Assembly Rules

The adapter SHALL:

1.

locate the identity using the supplied canonical reference;

2.

return successful absence when no identity exists;

3.

retrieve the required constitutional relationships associated with an existing identity;

4.

validate that retrieved records can be represented by the authorized Domain model;

5.

assemble the ACV only after required state is complete and valid;

6.

return a typed incomplete-state failure if required constitutional state cannot be assembled;

7.

return a typed storage failure if the Registry cannot be accessed or queried reliably;

8.

return no partially assembled ACV.

The adapter SHALL NOT:

- return an ACV with fabricated records;

- replace missing required records with defaults;

- return a partial ACV alongside an error;

- silently discard invalid rows;

- silently ignore broken relationships;

- use an empty collection to hide a missing required relation;

- perform Runtime policy evaluation.

# 7.4 Standing and Applicability

M05 SHALL preserve retrieved standing and policy state as constitutional input.

M05 SHALL NOT decide whether a standing or policy outcome authorizes execution.

A suspended, terminated, inactive, or otherwise non-authorizing state SHALL be represented according to the authorized Domain model and passed to downstream constitutional evaluation.

The Registry retrieves constitutional state.

The Runtime and future authorized policy layers determine execution consequences.

# 8. Repository and Dependency Topology

## 8.1 `packages/domain`

Responsibilities:

- pure constitutional entities;

- pure validation;

- domain value definitions;

- domain relationships.

M05 SHALL NOT add:

- repository interfaces;

- database client types;

- SQL;

- PostgreSQL configuration;

- migration code;

- storage exceptions;

- adapter classes.

## 8.2 `packages/contracts`

Responsibilities:

- pure Registry repository interfaces;

- pure typed result contracts;

- Registry error semantics;

- ACV loading contracts;

- receipt persistence contracts where authorized.

Contracts SHALL:

- import only permitted pure types;

- expose no PostgreSQL types;

- expose no SQL fragments;

- expose no driver-specific errors;

- remain executable without a database.

## 8.3 `apps/api/src/registry`

Responsibilities:

- PostgreSQL client lifecycle ownership;

- `postgres.js` integration;

- repository implementations;

- parameterized SQL;

- row interfaces;

- row-to-domain mappers;

- storage error translation;

- ACV assembly.

The Registry implementation SHALL remain isolated from:

- API route definitions;

- HTTP response formatting;

- Runtime execution orchestration;

- migration execution;

- seed fixture authoring.

Suggested internal structure:
`apps/api/src/registry/ ├── client.ts ├── errors.ts ├── rows/ │   ├── identity-row.ts │   ├── referent-row.ts │   ├── evidence-row.ts │   ├── policy-row.ts │   ├── authority-row.ts │   ├── capability-row.ts │   ├── standing-row.ts │   └── receipt-row.ts ├── mappers/ │   ├── identity-mapper.ts │   ├── referent-mapper.ts │   ├── evidence-mapper.ts │   ├── policy-mapper.ts │   ├── authority-mapper.ts │   ├── capability-mapper.ts │   ├── standing-mapper.ts │   └── receipt-mapper.ts ├── repositories/ │   ├── postgres-identity-repository.ts │   ├── postgres-acv-repository.ts │   ├── postgres-evidence-repository.ts │   ├── postgres-policy-repository.ts │   └── postgres-receipt-repository.ts └── index.ts `
The exact file subdivision may be refined during implementation.

No file may collapse unrelated persistence concerns into an unreviewable monolith.

## 8.4 `infra/`

Responsibilities:

- versioned SQL migrations;

- migration runner;

- migration verification;

- seed execution mechanics;

- approved seed content when separately authorized.

Suggested structure:
`infra/ ├── migrations/ │   ├── 001_initial_registry_schema.sql │   └── ... ├── seeds/ │   └── approved-fixtures.sql ├── src/ │   ├── migrate.ts │   ├── rollback.ts │   ├── verify-migrations.ts │   └── seed.ts └── README.md `
The exact filenames may be finalized by AMS-0501 and AMS-0505.

Migration and seed code SHALL NOT be imported by the Runtime.

# 9. M05 Task Plan

## 9.1 Task Graph

The authorized task relationships are:
`M03 — Domain Foundation           │           ▼ IT-0501 — PostgreSQL Schema       ┌───┴────────┐       ▼            ▼ IT-0502         IT-0505 Repository      Migration Interfaces      Framework       │       ▼ IT-0503 Registry Adapter       │       ▼ IT-0504 Seed Data       │       ▼ M05 Closure Review `
The formal dependency graph remains governed by CAW-011.

No task may begin substantive implementation before its required predecessor state is accepted.

## 9.2 IT-0501 — PostgreSQL Schema

### Objective

Implement the minimum PostgreSQL schema authorized by CAW-008.

### Scope

IT-0501 SHALL:

- create the authorized Registry tables;

- define authorized primary keys;

- define authorized foreign-key relationships;

- define required uniqueness constraints;

- define required statuses and constrained values where authorized;

- define required storage fields;

- define authorized timestamps;

- establish append-only protections for immutable tables;

- create the initial versioned SQL migration.

### Required Outputs

At minimum:
`infra/migrations/001_initial_registry_schema.sql `
Additional migration support files may be introduced only where required by the approved migration topology.

### Required Invariants

The schema SHALL:

- conform to CAW-008;

- preserve referential integrity;

- reject invalid foreign-key relationships;

- prevent unauthorized mutation of append-only records;

- avoid unratified fields;

- avoid speculative multi-tenant structure;

- avoid hidden semantic defaults;

- remain compatible with the existing Domain model.

### Explicit Non-Goals

IT-0501 SHALL NOT:

- create API endpoints;

- create repository interfaces;

- install or configure Runtime persistence;

- implement ACV retrieval;

- implement GS1 parsing;

- implement R2 storage;

- create unratified seed content;

- construct execution receipts;

- introduce policy evaluation;

- create generic JSON persistence.

### Acceptance Criteria

IT-0501 is acceptable only when:

1.

the schema contains the complete authorized CAW-008 table scope;

2.

required foreign keys are enforced by PostgreSQL;

3.

required uniqueness and status constraints are demonstrable;

4.

append-only protections are enforced at the database boundary;

5.

the schema can be applied successfully to a real PostgreSQL instance;

6.

invalid relational writes fail;

7.

unauthorized updates and deletes against protected tables fail;

8.

no unratified schema fields are introduced;

9.

no Runtime source file imports database infrastructure.

## 9.3 IT-0502 — Repository Interfaces

### Objective

Define pure Registry repository ports and typed result contracts.

### Scope

IT-0502 SHALL:

- create Registry repository interfaces in `packages/contracts`;

- define ACV retrieval contracts;

- define typed Registry result outcomes;

- define required semantic Registry errors;

- define repository methods required by the authorized Registry scope;

- preserve pure package boundaries.

### Required Contract Principles

Repository interfaces SHALL:

- use pure TypeScript and authorized Domain types;

- return typed outcomes;

- distinguish absence from failure;

- expose no driver-specific types;

- expose no SQL implementation;

- expose no PostgreSQL client;

- expose no raw infrastructure exceptions.

### Minimum Required Semantics

ACV lookup SHALL distinguish:
`Identity absent     → successful result with null value  Identity present and constitutional state complete     → successful result with ACV  Identity present but required state incomplete     → typed incomplete-state failure  Storage unavailable     → typed storage-unavailable failure  Query/mapping failure     → typed fail-closed Registry failure `

### Explicit Non-Goals

IT-0502 SHALL NOT:

- implement PostgreSQL queries;

- instantiate a database client;

- introduce an ORM;

- place ports in `packages/domain`;

- modify Runtime contracts;

- wire repositories into the Runtime;

- invent seed fixtures;

- define API routes.

### Acceptance Criteria

IT-0502 is acceptable only when:

1.

repository contracts reside in `packages/contracts`;

2.

the contracts compile without a PostgreSQL dependency;

3.

the contracts expose no driver-specific types;

4.

ACV absence is distinguishable from failure;

5.

incomplete constitutional state is distinguishable from storage unavailability;

6.

raw infrastructure exceptions cannot cross the contract boundary;

7.

contract tests demonstrate the required discriminated outcomes;

8.

no Domain package persistence concern has been introduced.

## 9.4 IT-0503 — Registry Adapter

### Objective

Implement the PostgreSQL Registry adapter using `postgres.js`, parameterized raw SQL, and explicit row-to-domain mapping.

### Scope

IT-0503 SHALL:

- instantiate and manage PostgreSQL client access inside `apps/api/src/registry`;

- implement the approved repository interfaces;

- execute parameterized SQL;

- retrieve authorized Registry records;

- map rows explicitly into Domain records;

- assemble complete ACVs;

- translate storage failures into typed Registry outcomes;

- preserve the partial-truth fail-closed invariant.

### Required Adapter Behavior

The adapter SHALL:

1.

receive a canonical identity reference;

2.

query the Registry using parameterized SQL;

3.

return successful absence when no identity exists;

4.

retrieve the authorized constitutional state associated with an existing identity;

5.

validate and map all required records;

6.

assemble an ACV only when required state is complete;

7.

return `IncompleteConstitutionalState` when required state is missing or inconsistent;

8.

return `StorageUnavailable` when PostgreSQL access is unavailable;

9.

translate other query or mapping failures into typed fail-closed outcomes;

10.

expose no raw `postgres.js` exception through the repository contract.

### Mapping Requirements

Each row-to-domain transformation SHALL be:

- explicit;

- local to the adapter;

- testable independently;

- reviewable without executing a database;

- free of hidden defaults;

- free of invented values.

The adapter SHALL NOT:

- use ORM entity hydration;

- silently omit invalid rows;

- create missing Domain records;

- substitute empty collections for required missing state;

- evaluate policy;

- authorize execution;

- invoke the Runtime pipeline;

- use database wall-clock functions to determine constitutional applicability.

### Real PostgreSQL Requirement

Adapter acceptance SHALL include integration testing against a real PostgreSQL instance.

`pg-mem` or another PostgreSQL emulator SHALL NOT be accepted as the sole proof of:

- foreign-key enforcement;

- append-only protection;

- permissions;

- migration behavior;

- PostgreSQL-specific SQL behavior.

Emulators may be used for narrow supplementary tests but SHALL NOT replace real PostgreSQL integration evidence.

### Acceptance Criteria

IT-0503 is acceptable only when:

1.

all approved repository interfaces are implemented;

2.

all SQL is parameterized;

3.

all storage rows are mapped through explicit mappers;

4.

valid complete state produces a valid ACV;

5.

missing identity produces successful `null` absence;

6.

missing required constitutional state produces `IncompleteConstitutionalState`;

7.

storage loss produces `StorageUnavailable`;

8.

malformed or unmappable storage state fails closed;

9.

raw driver exceptions do not cross the contract boundary;

10.

no Runtime package imports the adapter or driver;

11.

real PostgreSQL integration tests pass.

## 9.5 IT-0504 — Seed Data

### Objective

Implement deterministic and idempotent seed execution mechanics without inventing unratified fixture content.

### Scope

IT-0504 SHALL:

- establish the seed execution mechanism;

- define approved seed-file discovery;

- execute approved seed content deterministically;

- support idempotent application;

- provide clear provenance checks;

- fail explicitly when authorized seed content is unavailable.

### Seed Content Boundary

The current repository contains no ratified M05 wedge dataset.

Therefore:

- seed execution mechanics are authorized;

- seed content is deferred;

- historical illustrative examples are prohibited as normative seed data;

- IT-0504 cannot receive final completion acceptance until authoritative fixture content is approved.

### Required Seed Properties

The seed mechanism SHALL be:

- deterministic;

- idempotent;

- transactionally safe where supported;

- explicit about the seed source;

- free of random identifiers;

- free of generated constitutional records;

- free of hidden default content.

The seed mechanism SHALL NOT:

- generate random UUIDs;

- generate current-time constitutional records;

- synthesize product, brand, manufacturer, policy, standing, authority, or capability records;

- accept arbitrary dynamic JSON as a substitute for approved fixture provenance;

- silently create missing fixture relationships.

### Acceptance Criteria

The seed mechanics portion is acceptable only when:

1.

seed execution is deterministic;

2.

repeated execution does not duplicate approved records;

3.

seed execution identifies its authoritative input;

4.

missing or unapproved seed content fails explicitly;

5.

no illustrative Council example is promoted into a fixture;

6.

the mechanism can execute an approved fixture when one is supplied;

7.

the deferred fixture-content dependency is documented.

IT-0504 SHALL remain **conditionally incomplete** until authoritative seed content is ratified and successfully executed.

M05 itself SHALL NOT close while this dependency remains unresolved.

## 9.6 IT-0505 — Migration Framework

### Objective

Establish a minimal, explicit, sequential, tracked, and verifiable SQL migration framework.

### Scope

IT-0505 SHALL:

- discover versioned SQL migrations;

- apply migrations in deterministic sequence;

- record applied migrations in `schema_migrations`;

- prevent accidental duplicate application;

- provide migration status inspection;

- provide an approved rollback mechanism;

- support local and CI execution;

- verify that the database state matches the expected migration history.

### Required Commands

The exact script names may be finalized during implementation, but the repository SHALL expose equivalent capabilities to:
`pnpm db:migrate pnpm db:rollback pnpm db:status pnpm db:verify `

### Migration Rules

Migrations SHALL:

- be versioned;

- have stable ordering;

- be stored as plain SQL;

- be applied sequentially;

- be recorded transactionally where supported;

- be reviewable without generated tooling;

- remain immutable after application;

- provide explicit rollback behavior or an approved compensating migration model.

The migration runner SHALL NOT:

- generate schema automatically;

- infer schema changes from TypeScript;

- execute hidden DDL;

- silently skip failed migrations;

- mark a failed migration as applied;

- permit out-of-order application without explicit authorization.

### Acceptance Criteria

IT-0505 is acceptable only when:

1.

migrations execute against a real PostgreSQL instance;

2.

migration order is deterministic;

3.

applied versions are recorded;

4.

repeated execution is safe and does not reapply completed migrations;

5.

a failed migration does not produce a false success state;

6.

rollback or approved compensating migration behavior is demonstrable;

7.

migration status is inspectable;

8.

CI can execute migration verification;

9.

the initial Registry schema is reproducibly established from an empty database.

# 10. M05 Integration and Verification Strategy

M05 SHALL use layered verification.

## 10.1 Pure Unit Verification

Unit tests SHALL cover:

- repository result contracts;

- Registry error discrimination;

- row-to-domain mappers;

- malformed row handling;

- missing required state;

- valid empty state where explicitly authorized;

- ACV assembly logic;

- deterministic seed mechanics;

- migration ordering logic.

Pure unit tests SHALL not require a live database unless testing a PostgreSQL-specific invariant.

## 10.2 Real PostgreSQL Integration Verification

Integration tests SHALL use a real PostgreSQL environment.

They SHALL verify:

- schema migration from an empty database;

- foreign-key enforcement;

- uniqueness constraints;

- required status constraints;

- append-only restrictions;

- repository queries;

- ACV assembly;

- identity absence behavior;

- incomplete-state behavior;

- storage failure translation where testable;

- idempotent migration execution;

- approved seed execution when fixture content becomes available.

## 10.3 Boundary Verification

The existing repository gates SHALL continue to verify:

- Runtime purity;

- package dependency boundaries;

- graph validity;

- TypeScript project integrity;

- formatting;

- linting;

- test correctness.

M05 SHALL add no exception that weakens these gates.

## 10.4 Failure-Mode Verification

The test suite SHALL prove that:

Failure Condition

Required Behavior

Unknown canonical reference

Successful `null` absence

Existing identity with missing required relation

`IncompleteConstitutionalState`

Invalid row-to-domain transformation

Typed fail-closed Registry error

PostgreSQL unavailable

`StorageUnavailable`

Protected record update attempted

PostgreSQL rejects the operation

Protected record delete attempted

PostgreSQL rejects the operation

Migration fails

Migration is not falsely recorded as successful

Migration rerun

Completed migration is not reapplied

Seed content unavailable

Explicit failure or blocked state

Seed rerun

No duplicate authorized records

Runtime imports PostgreSQL

Existing purity/boundary gates fail

# 11. M05 Milestone Acceptance Gate

M05 is complete only when all of the following are true.

## 11.1 Schema

- The authorized CAW-008 Registry schema exists.

- The schema is reproducible from versioned migrations.

- Required foreign keys and constraints are enforced.

- No unauthorized schema fields exist.

- Append-only protections are demonstrable against real PostgreSQL.

## 11.2 Contracts

- Registry repository ports reside in `packages/contracts`.

- Contracts remain pure.

- Contracts expose no database-driver types.

- ACV absence is distinguishable from failure.

- Incomplete constitutional state is distinguishable from storage failure.

## 11.3 Adapter

- The PostgreSQL adapter resides in `apps/api/src/registry`.

- `postgres.js` is contained outside pure packages.

- All SQL is parameterized.

- Row-to-domain mapping is explicit.

- Complete state produces a complete ACV.

- Partial required state fails closed.

- Raw driver errors do not cross the contract boundary.

## 11.4 Migrations

- Versioned SQL migrations execute sequentially.

- Migration state is tracked.

- Repeated execution is safe.

- Failed migrations are not falsely recorded.

- Migration verification runs in the supported environment.

## 11.5 Seed Data

- Seed execution mechanics are implemented.

- Seed execution is deterministic and idempotent.

- No unratified fixture content is invented.

- Authoritative fixture content has been approved and successfully executed.

The final condition is mandatory for M05 closure.

Until authoritative seed content is approved and validated, M05 SHALL remain open with a scoped corrective dependency.

## 11.6 Integration

- Real PostgreSQL integration tests pass.

- ACV retrieval behavior is verified.

- Database invariants are demonstrated.

- Runtime purity remains intact.

- No future milestone capability has been prematurely implemented.

# 12. Required Repository Verification Gates

Before any AMS implementation is accepted, the applicable repository verification commands SHALL be executed and recorded.

The baseline M05 gate set is:
`pnpm format:check pnpm lint pnpm exec tsc -b pnpm runtime:purity pnpm boundary:all pnpm graph:validate pnpm test --run `
M05 SHALL add the approved database verification commands when introduced, including equivalent capabilities for:
`pnpm db:migrate pnpm db:status pnpm db:verify `
Where seed content is authorized:
`pnpm db:seed `
The exact command implementation may evolve, but the observable verification responsibilities SHALL remain.

No AMS may claim acceptance solely because TypeScript compiles.

No database task may claim acceptance solely because SQL parses.

No append-only invariant may claim acceptance without real PostgreSQL evidence.

# 13. Explicit M05 Non-Goals

M05 SHALL NOT implement the following.

## 13.1 Runtime Integration

M05 SHALL NOT:

- wire ACV loading into the Runtime pipeline;

- invoke Runtime execution from the Registry;

- modify Runtime stage behavior;

- create database-aware Runtime types;

- introduce database I/O into `packages/runtime`.

Runtime integration belongs to M08.

## 13.2 GS1 Resolution

M05 SHALL NOT:

- parse GS1 Digital Link URLs;

- normalize GS1 identifiers;

- resolve GS1 application identifiers;

- validate Digital Link URL structures;

- implement GS1 resolution graphs.

M06 owns GS1 resolution.

M05 may perform direct Registry lookup using an already-provided canonical reference.

## 13.3 Evidence Storage

M05 SHALL NOT:

- upload evidence;

- download evidence;

- integrate R2;

- implement object storage;

- hash or generate evidence artifacts.

M05 may store authorized evidence references only.

Evidence generation and storage integration belong to M07.

## 13.4 Full Receipt Construction

M05 SHALL NOT:

- construct the complete execution receipt;

- resolve all receipt fields;

- implement receipt verification;

- implement replay-at-scale;

- claim that receipt persistence equals receipt generation.

M05 may provide the authorized persistence seam for receipts without constructing constitutional receipt truth.

Full receipt construction and verification remain downstream responsibilities.

## 13.5 API and Transport

M05 SHALL NOT:

- create REST endpoints;

- create HTTP request handlers;

- define public Registry routes;

- implement transport authentication;

- expose database records directly as API responses.

The adapter may reside under `apps/api`, but its existence SHALL NOT be treated as authorization to implement the API surface.

## 13.6 Caching and Edge Infrastructure

M05 SHALL NOT:

- introduce Redis;

- introduce edge caching;

- implement Cloudflare Workers;

- implement request routing;

- introduce cache-derived constitutional state.

These responsibilities remain outside M05.

## 13.7 Unauthorized Persistence Expansion

M05 SHALL NOT:

- create a new workspace persistence package;

- introduce an ORM;

- introduce a query builder;

- add generated database clients;

- add speculative tables;

- add speculative columns;

- add multi-tenancy;

- add generic metadata storage;

- add dynamic JSON fixture ingestion;

- add database-clock constitutional evaluation.

# 14. M05 Completion Criteria

M05 is eligible for closure only if:

1.

Every CAW-011 M05 task has an implementation submission and independent acceptance audit.

2.

IT-0501 implements the authorized Registry schema without unratified expansion.

3.

IT-0502 establishes pure repository contracts in `packages/contracts`.

4.

IT-0503 implements the PostgreSQL adapter in `apps/api/src/registry`.

5.

IT-0504 provides deterministic seed mechanics and executes approved fixture content.

6.

IT-0505 provides a tracked, sequential, verifiable migration framework.

7.

The Registry never invents or silently completes constitutional truth.

8.

Missing identity is represented as valid absence.

9.

Incomplete required constitutional state fails closed.

10.

Storage failure fails closed.

11.

Raw driver errors do not cross pure contract boundaries.

12.

ACV assembly produces no partial success outcome.

13.

Append-only protections are enforced by real PostgreSQL.

14.

Real PostgreSQL integration tests pass.

15.

Runtime purity and dependency boundaries remain intact.

16.

No M06, M07, M08, M09, or M10 capability has been prematurely modeled or implemented.

17.

All repository verification gates pass.

18.

All implementation and audit documentation matches the final source state.

No partial milestone closure is authorized.

If any criterion fails, the failure SHALL be recorded as scoped corrective work before closure.

# 15. Deferred Responsibilities and Future Ownership

The following responsibilities remain outside M05.

Responsibility

Future Owner

M05 Relationship

GS1 Digital Link parsing and normalization

M06

M05 accepts an already-provided canonical reference only

GS1 resolution behavior

M06

No implementation in M05

Evidence generation

M07

M05 stores authorized evidence references only

Object-storage integration

M07

No R2 implementation

ACV loading wired into Runtime

M08

M05 provides the adapter seam only

Full Runtime verification orchestration

M08

Not implemented

Full execution receipt generation

M08

M05 provides no receipt construction

Receipt verification

M08

Not implemented

Replay-at-scale

M08 or later authorized work

Not implemented

Public API routes

M09

Not implemented

Edge routing and caching

M10

Not implemented

Authoritative M05 wedge seed content

Chair-approved fixture authority

IT-0504 remains blocked until approved

The deferred seed-content dependency SHALL be preserved explicitly until resolved.

# 16. Risk Register and Controls

Risk ID

Risk

Required Control

M05-R01

Database dependencies leak into Runtime

Existing Runtime purity and dependency-boundary gates remain mandatory

M05-R02

Storage schema redefines Domain semantics

Domain remains authoritative; explicit row-to-domain mapping is required

M05-R03

Repository contracts expose driver types

Contracts remain pure and driver-independent

M05-R04

Missing state is normalized into empty collections

Partial truth fails closed

M05-R05

Raw PostgreSQL errors leak across contracts

Adapter translates failures into typed Registry outcomes

M05-R06

ORM behavior hides SQL or schema changes

Raw parameterized SQL and plain SQL migrations are mandatory

M05-R07

Migration history becomes nondeterministic

Stable version ordering and tracked application are mandatory

M05-R08

Append-only behavior exists only in application code

Real PostgreSQL enforcement and integration tests are mandatory

M05-R09

Unratified seed examples become pseudo-truth

Seed content remains blocked pending explicit approval

M05-R10

Database wall-clock logic creates hidden temporal behavior

No database clock functions may determine constitutional applicability

M05-R11

M05 absorbs M06–M10 responsibilities

Explicit non-goal enforcement and task-scoped AMS review

M05-R12

A new persistence package alters the approved topology

No new workspace package is authorized

M05-R13

Real PostgreSQL behavior is replaced by an emulator

Real PostgreSQL is mandatory for invariant acceptance

M05-R14

Adapter becomes an unreviewable monolith

Separate client, repository, row, and mapper responsibilities

M05-R15

Seed mechanics silently generate constitutional data

No random or synthesized constitutional fixture generation

# 17. Required AMS Sequence

The authorized AMS sequence is:
`AMS-0501 — PostgreSQL Schema     ↓ AMS-0502 — Registry Repository Interfaces     ↓ AMS-0503 — PostgreSQL Registry Adapter     ↓ AMS-0504 — Deterministic Seed Mechanics and Authorized Fixture Integration     ↓ AMS-0505 — Registry Migration Framework `
Each AMS SHALL:

- identify its exact CAW-011 task;

- cite the governing CAW and Engineering authority available in the repository;

- identify applicable Chair-authorized M05 decisions;

- define only the task’s approved scope;

- list exact expected file changes;

- identify package and dependency boundaries;

- define public and internal contracts;

- state explicit non-goals;

- define observable acceptance criteria;

- define required unit and integration tests;

- identify unresolved dependencies;

- prohibit unrelated repository changes;

- preserve Runtime purity;

- preserve Domain purity;

- preserve the approved persistence topology.

No AMS may:

- broaden its task into another IT responsibility;

- introduce an unauthorized package;

- replace raw SQL with an ORM or query builder;

- invent seed content;

- wire the Registry into Runtime execution;

- implement future-milestone functionality.

# 18. Immediate Next Action

The next authorized action is:

**Draft `AMS-0501 — PostgreSQL Schema` for IT-0501 only.**

AMS-0501 SHALL:

1.

inspect the final M03 Domain entities relevant to Registry persistence;

2.

reconcile the authorized CAW-008 table definitions with the actual Domain model;

3.

identify the exact SQL migration files required;

4.

define all required keys, foreign keys, constraints, indexes, and append-only protections;

5.

identify the real PostgreSQL test environment required;

6.

define schema acceptance tests;

7.

preserve the boundary between Domain semantics and storage representation;

8.

avoid creating any repository interface, adapter, seed content, Runtime integration, or API route.

AMS-0501 SHALL NOT:

- implement repository ports;

- install PostgreSQL access in the Runtime;

- implement ACV retrieval;

- create the PostgreSQL adapter;

- create seed fixtures;

- implement the migration runner;

- create API endpoints;

- implement GS1 resolution;

- implement evidence storage;

- construct execution receipts.

# 19. Council Decision Record

The following decisions are locked by this plan:

1.

`CAW-011` remains the sole M05 implementation roadmap.

2.

M05-PREP is complete and does not require repetition.

3.

M05 introduces persistent infrastructure without weakening Domain or Runtime purity.

4.

PostgreSQL is a Registry storage and retrieval mechanism, not an author of constitutional meaning.

5.

`packages/domain` remains a pure Domain package and SHALL not contain repository ports.

6.

Registry repository contracts SHALL reside in `packages/contracts`.

7.

No new workspace persistence package is authorized.

8.

PostgreSQL adapter implementation SHALL reside under `apps/api/src/registry`.

9.

`postgres.js` is the approved PostgreSQL driver.

10.

Parameterized raw SQL is the approved M05 query model.

11.

Query builders and ORMs are not authorized for M05.

12.

Row-to-domain mapping SHALL be explicit and testable.

13.

Plain versioned SQL is the approved migration format.

14.

A minimal custom migration runner is the approved migration execution model.

15.

Migration state SHALL be tracked in `schema_migrations`.

16.

Real PostgreSQL integration is required for database invariant acceptance.

17.

PostgreSQL emulators SHALL not be the sole acceptance environment.

18.

Missing identity is a valid successful absence.

19.

Incomplete required constitutional state SHALL fail closed.

20.

Storage unavailability SHALL fail closed.

21.

Raw driver exceptions SHALL not cross the repository contract boundary.

22.

Partial constitutional state SHALL not be normalized into valid empty collections.

23.

M05 SHALL not use database wall-clock functions to determine constitutional applicability.

24.

Seed execution mechanics are in scope.

25.

Seed fixture content remains blocked pending explicit authority.

26.

“Aura Labs,” “Aura Smart Ring v1,” and GTIN `00860000000123` remain illustrative and unauthorized as M05 seed content.

27.

M05 SHALL not wire Registry loading into the Runtime pipeline.

28.

M05 SHALL not implement GS1 resolution, evidence generation, full receipt construction, API routing, or edge infrastructure.

29.

Every M05 task SHALL remain narrow and attributable to its CAW-011 IT identifier.

30.

M05 closure requires authoritative seed content and successful seed verification.

# 20. Final Plan Statement

M05 is a constitutional Registry Layer, not a database-centric rewrite of Zyppi.

Its success is not measured by:

- the number of tables created;

- the amount of SQL written;

- the number of database abstractions introduced;

- the complexity of its migration tooling;

- the amount of infrastructure connected.

Its success is measured by whether the repository gains a durable persistence boundary that:

- preserves Domain authority;

- contains all I/O outside the Runtime;

- represents only authorized Registry state;

- retrieves rather than invents constitutional truth;

- distinguishes absence from failure;

- rejects incomplete constitutional state;

- maps storage state explicitly into Domain records;

- produces complete Active Constitutional Views or explicit failures;

- enforces immutable-record protections at the database boundary;

- records schema evolution transparently;

- remains compatible with future Runtime integration;

- avoids premature implementation of downstream capabilities.

M05 SHALL make constitutional state persistable and retrievable without making persistence the author of constitutional truth.

**M05 is ready to proceed through the authorized AMS sequence, beginning with AMS-0501.**
