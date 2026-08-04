# AMS-0504-PREP Amendment — CDR Reconciliation Mandate

**Mandate ID:** AMS-0504-PREP-AMEND-001 **Authority:** Chair, Zyppi Constitutional Council **Target:** Jules Google AI Agent **Status:** AUTHORIZED — READ-ONLY DOCUMENTATION RECONCILIATION **Date:** August 4, 2026 **Parent Artifact:** `DOCS/CAW/AMS/AMS-0504-PREP.md` **Governing Resolution:** `AMS-0504-CDR — Registry Seed System Chair Decision Resolution`

## 1. Mandate Purpose

Amend `DOCS/CAW/AMS/AMS-0504-PREP.md` so that it is fully reconciled with the ratified rulings of `AMS-0504-CDR`.

The current PREP correctly identified the unresolved architectural and governance questions surrounding Registry seed mechanics. Those questions have now been resolved by the Chair Decision Resolution. The purpose of this mandate is therefore **not to reopen those decisions**, redesign the seed system, or begin implementation.

The purpose is to convert the PREP from a reconnaissance document containing unresolved alternatives into an accurate, source-grounded implementation-readiness artifact governed by the ratified CDR.

The amended PREP must clearly distinguish:

- constitutional or ratified requirements;

- Chair-decided implementation authority;

- current repository facts;

- implementation constraints;

- remaining unratified production seed-content questions.

## 2. Authorized Scope

Jules is authorized to modify only:
`DOCS/CAW/AMS/AMS-0504-PREP.md `
The amendment may revise:

- the authority and source hierarchy;

- manifest-contract analysis;

- provenance and trust-root analysis;

- integrity and canonicalization analysis;

- semantic equivalence and idempotency analysis;

- seed outcome and state-disposition analysis;

- runtime and audit isolation analysis;

- implementation placement analysis;

- decision register;

- risk register;

- unresolved questions;

- proposed implementation scope;

- readiness verdict;

- appendices and structural templates.

The amendment must preserve useful reconnaissance findings where they remain compatible with the CDR.

## 3. Explicitly Unauthorized Work

This mandate does **not** authorize:

- creating or modifying production source code;

- creating a Registry seed executor;

- creating a seed CLI or runner;

- modifying `@zyppi/domain`;

- modifying `@zyppi/contracts`;

- modifying `@zyppi/runtime`;

- modifying `apps/api` implementation code;

- modifying package manifests or dependency declarations;

- modifying TypeScript configurations;

- modifying PostgreSQL migrations or database schemas;

- creating or applying any production seed corpus;

- creating or materializing constitutional Registry records;

- promoting historical examples, documentation examples, or test fixtures into seed authority;

- creating a production manifest;

- creating cryptographic keys;

- signing a manifest;

- introducing new database audit tables;

- implementing RFC 8785 or any other canonicalization library;

- implementing semantic equivalence comparators;

- changing test fixtures or test infrastructure.

Do not make opportunistic repository changes.

If the CDR requires a future implementation capability that does not currently exist, document the capability as an implementation requirement or dependency. Do not create it during this amendment.

## 4. Governing Authority and Precedence

The amended PREP must recognize `AMS-0504-CDR` as the governing Chair decision authority for the Registry Seed System.

The source hierarchy for the amended PREP must be:

1. Constitutional authorities and ratified governance instruments;

2. `AMS-0504-CDR` Chair rulings;

3. Ratified M05 planning decisions;

4. Current authoritative Domain and contract definitions;

5. Current implemented Runtime and Registry behavior;

6. Physical PostgreSQL schema and migrations;

7. Tests, examples, historical documents, and illustrative datasets;

8. Architectural inference, only where no higher authority settles the matter.

Where the CDR resolves an issue previously presented as an alternative, the PREP must no longer present that issue as open.

Do not retain superseded alternatives merely for symmetry or historical completeness. If historical context is useful, label it clearly as:

**Superseded reconnaissance alternative — not an active implementation option.**

## 5. Required CDR Reconciliation

### 5.1 Manifest Contract

Reconcile the PREP with the CDR’s ratified manifest-contract rulings.

The amended PREP must:

- identify the ratified manifest contract as binding implementation authority;

- remove language implying that the manifest format remains an unrestricted implementation choice;

- distinguish the **manifest mechanism** from **manifest content**;

- state that the existence of a structural contract does not authorize any production constitutional records;

- preserve the prohibition against inventing, completing, normalizing, or silently repairing manifest content.

If the CDR specifies exact field names, structures, or encoding rules, reproduce them faithfully. Do not rename, simplify, or reinterpret them.

If the CDR leaves a technical detail to a future implementation compatibility gate, preserve that distinction rather than declaring the detail fully settled.

### 5.2 Authority Trust Root

Reconcile the PREP with the ratified authority and trust-root model.

The amended PREP must:

- treat the CDR-selected cryptographic authority model as binding;

- identify the authorized public-key trust material as the verification trust root;

- state that private signing material is not part of the application repository or seed executor;

- prohibit the database from acting as the authority source for the seed that initializes the database;

- prohibit environment configuration from becoming the authoritative source of seed legitimacy;

- remove static allow-lists and environment-based authority registries as active alternatives if the CDR rejected them;

- state that an unsigned, unverifiable, unknown-authority, malformed, or cryptographically invalid manifest must be refused before any database write is attempted.

The PREP must not invent key formats, key identifiers, signature algorithms, rotation procedures, or key-management infrastructure beyond what the CDR explicitly authorizes.

Any such detail not settled by the CDR must be marked as an implementation specification requirement, not silently designed in the PREP.

### 5.3 Canonicalization and Integrity

Reconcile the PREP with the CDR’s canonicalization and integrity rulings.

The amended PREP must:

- identify the CDR-selected canonicalization standard as the governing standard;

- remove any suggestion that arbitrary `JSON.stringify()` output is an acceptable integrity basis;

- prohibit seed-specific, adapter-local canonicalization rules;

- state that integrity verification must operate over the exact canonical representation required by the governing standard;

- distinguish canonicalization from cryptographic hashing and signature verification;

- state that canonicalization incompatibility is a blocking compatibility failure, not an invitation to introduce local patches or alternate serialization rules.

If the CDR requires RFC 8785/JCS compatibility:

- identify RFC 8785/JCS as the governing canonicalization standard;

- state that implementation must verify compatibility with the actual Domain record shapes and values before relying on it;

- state that incompatible Domain representations must halt implementation for constitutional review;

- prohibit adapter-level coercion, normalization, or custom serialization as a workaround.

The PREP must not claim that native JavaScript serialization is inherently nondeterministic without source-specific support. The relevant requirement is that native serialization is **not the ratified canonical representation** and therefore cannot substitute for the governing standard.

### 5.4 Domain-Owned Semantic Equivalence

Reconcile the PREP with the CDR’s ruling that semantic equivalence belongs above the persistence adapter.

The amended PREP must state that:

- record identity, semantic equivalence, and divergence are application/domain concerns;

- database primary-key equality is not sufficient to establish constitutional equivalence;

- storage representations must be decoded and validated before semantic comparison;

- storage-only metadata must be excluded from constitutional equivalence where the governing model requires;

- PostgreSQL types, SQL representations, row ordering, and database-specific coercions must not define constitutional equivalence;

- the persistence layer supplies authoritative stored facts and atomic transaction behavior but does not author the meaning of equivalence.

If a canonical Domain comparison capability is required but absent, identify it as a **required implementation dependency or authorized implementation addition**, according to the CDR.

Do not leave this issue categorized as an unresolved Chair decision if the CDR has already settled ownership and required behavior.

Do not implement the comparator during this amendment.

### 5.5 Seed Outcome Taxonomy

Reconcile the PREP with the CDR’s ratified seed outcome taxonomy.

The amended PREP must:

- identify the CDR-approved outcomes and refusal states as binding;

- remove provisional wording such as “e.g.” or “proposed outcomes” where the CDR has settled exact names;

- distinguish successful completion, already-materialized state, divergence, partial-state anomaly, integrity refusal, authority refusal, validation refusal, and infrastructure failure according to the CDR;

- state that outcome semantics belong to the seed orchestration boundary and must not be confused with the Runtime’s `ExecutionReceipt` model;

- avoid prematurely placing the seed outcome taxonomy into `@zyppi/contracts` unless the CDR explicitly requires that placement.

The PREP must not require exceptions as the only internal control-flow mechanism.

The binding requirement is:

Every refusal or failure condition must produce a deterministic, terminal, fail-closed result that prevents any database commit.

Implementation may use controlled exceptions, discriminated results, or another authorized internal mechanism, provided the externally required behavior is preserved.

### 5.6 Idempotency, Partial State, and Divergence

The amended PREP must preserve and clarify the CDR’s state model.

It must state that:

- a fully equivalent materialized state is a successful, non-modifying idempotent outcome;

- a non-equivalent record with the same constitutional identity is a terminal divergence condition;

- an unexpected partially materialized state is a terminal integrity anomaly;

- partial state must not be automatically completed, healed, reconciled, normalized, or repaired;

- seed re-execution must not perform `UPDATE` or `DELETE` operations to force conformance;

- state divergence and unexpected partial state must prevent commit;

- database constraints are enforcement mechanisms, not the constitutional definition of idempotency.

The PREP must not reintroduce the earlier proposal that missing records in a partial state may be inserted automatically.

That proposal is superseded by the CDR’s fail-closed disposition.

### 5.7 Transaction and Persistence Boundaries

The amended PREP must retain the approved persistence model while preserving constitutional ownership boundaries.

It must state that:

- all authorized seed writes for one manifest occur inside one atomic read-write transaction;

- any terminal verification, validation, equivalence, divergence, or persistence failure prevents commit and causes rollback where a transaction has begun;

- dependency ordering is mechanical persistence behavior and does not define constitutional authority;

- database constraints may enforce physical integrity but may not substitute for application/domain verification;

- the seeder may use direct, parameterized SQL for controlled persistence;

- existing read mappers are one-way decoders and must not be misrepresented as complete write encoders;

- a generic bidirectional mapper must not be introduced merely for symmetry unless separately justified and authorized.

Do not prescribe an ORM or create one.

### 5.8 Runtime and Receipt Isolation

The amended PREP must state unequivocally that:

- Registry seeding is an administrative bootstrap operation;

- seed execution must not invoke the Runtime pipeline;

- seed execution must not fabricate a pseudo-request to obtain a Runtime decision;

- seed execution must not create a standard `ExecutionReceipt`;

- Runtime receipts remain reserved for the Runtime’s authorized request-evaluation model.

If the CDR selected “no new audit artifact in AMS-0504,” the PREP must record that ruling and remove any implication that a Genesis receipt or new administrative table is required in this milestone.

If the CDR explicitly authorized a separate future bootstrap audit artifact, the PREP must identify it as a separate authorized concern and must not implement or design its database schema during this amendment unless the CDR itself specifies it.

Do not leave Genesis receipt status as an unresolved Chair decision if the CDR settled it.

### 5.9 Test and CI Isolation

Reconcile the PREP with the CDR’s defense-in-depth isolation requirements.

The amended PREP must require:

- explicit and separate production-manifest paths;

- explicit and separate test-fixture paths;

- no recursive or ambient manifest discovery;

- production execution to reject test fixture paths, formats, and extensions;

- separate test execution entry points;

- test database safeguards;

- CI verification that synthetic fixtures cannot be selected by production execution;

- no production seed content in the test fixture corpus;

- no test fixture promoted to constitutional authority merely because it is structurally valid.

Do not state that fixture files must necessarily be physically excluded from every production build unless the CDR explicitly requires that build-level exclusion.

The required property is **execution unreachability and verified isolation**, not a particular bundling mechanism.

### 5.10 Implementation Placement

Reconcile the PREP with the CDR-approved responsibility separation.

The amended PREP must distinguish:

- seed orchestration and verification;

- manifest loading;

- authority and signature verification;

- canonicalization and integrity verification;

- Domain validation and semantic comparison;

- mechanical PostgreSQL persistence;

- administrative entry-point behavior.

The PREP must not prematurely freeze arbitrary filenames if the CDR did not do so.

It may identify approved placement boundaries and candidate module responsibilities, but must label non-ratified filenames as implementation choices.

No seed logic may be placed in:
`packages/domain/ packages/contracts/ packages/runtime/ `
except where the CDR explicitly authorizes a narrowly scoped Domain capability required for canonicalization or semantic equivalence.

Do not broaden that exception.

## 6. Decision Register Requirements

Revise the decision register so that it accurately reflects the CDR.

For every decision resolved by the CDR:

- change the status from unresolved, proposed, or Chair decision required to **RATIFIED BY AMS-0504-CDR**;

- cite the applicable CDR ruling identifier;

- state the binding disposition;

- remove rejected alternatives from active disposition columns;

- preserve provenance classification accurately.

The revised register must not continue to mark the following categories as open if the CDR settled them:

- manifest contract;

- authority trust root;

- canonicalization standard;

- integrity verification basis;

- semantic-equivalence ownership;

- seed outcome taxonomy;

- partial-state disposition;

- Runtime receipt exclusion;

- audit baseline;

- implementation responsibility boundaries.

Any genuinely unresolved detail must satisfy all of the following:

1. it is not decided by the CDR;

2. it is necessary for implementation;

3. it cannot be resolved by faithful application of the CDR;

4. it is explicitly labeled with its required decision authority.

Do not manufacture new Chair decisions merely because implementation details remain.

## 7. Risk Register Requirements

Revise the risk register to reflect the CDR’s controls.

The amended register must include, where applicable:

- unauthorized or unverifiable manifest authority;

- signature or trust-root verification failure;

- canonicalization incompatibility;

- integrity mismatch;

- unauthorized manifest-content fabrication;

- promotion of historical or test data;

- semantic-equivalence errors;

- unexpected partial state;

- state divergence;

- unsafe overwrite or mutation;

- transaction failure or rollback;

- test-fixture contamination;

- Runtime/receipt coupling.

For each risk:

- identify the applicable CDR control;

- distinguish mitigated risks from unresolved risks;

- avoid marking a risk “resolved” merely because a policy has been declared;

- retain implementation verification where the control still requires tests.

## 8. Required Readiness Verdict

Replace the current readiness verdict with:

# OUTCOME A — MECHANICS AUTHORIZED; PRODUCTION SEED CONTENT NOT YET RATIFIED

The justification must state all of the following:

1.

The CDR has resolved the constitutional and architectural decisions required to authorize implementation of seed mechanics.

2.

AMS-0504 implementation may proceed under the CDR’s binding constraints.

3.

Production seed content remains absent and unratified.

4.

AMS-0504 implementation must not invent, generate, infer, normalize, or materialize production constitutional records.

5.

Test-only synthetic fixtures may be used solely to verify mechanics within the approved isolation boundary.

6.

The existence of an authorized seed mechanism does not constitute authorization of any specific production manifest or Registry record.

7.

Any implementation compatibility failure involving the ratified canonicalization, trust, or Domain-equivalence model must fail closed and return for constitutional review rather than being repaired locally.

The verdict must not say that production seeding itself is ready to execute.

The authorized conclusion is:

**Seed mechanics are authorized for implementation; production seed authority and production seed content remain separately governed and are not authorized by this PREP amendment.**

## 9. Required Final Consistency Review

Before submission, perform a complete internal consistency review of the amended PREP.

Verify that:

- no section contradicts the CDR;

- no superseded alternative remains presented as active;

- no unresolved Chair decision remains where the CDR has ruled;

- no implementation inference is mislabeled as constitutional authority;

- no proposed technical mechanism is presented as ratified unless the CDR ratified it;

- no production seed content appears in the document;

- no historical Aura example is promoted or normalized;

- no test fixture is described as constitutional truth;

- no code, configuration, schema, or test files were modified;

- the decision register, risk register, implementation scope, and readiness verdict agree with one another;

- the document remains clear about the distinction between **mechanics authorization** and **production-content authorization**.

## 10. Required Validation

Run only the validation necessary to confirm the authorized documentation change.

At minimum:

- inspect the repository diff;

- confirm that only `DOCS/CAW/AMS/AMS-0504-PREP.md` changed;

- perform a terminology and cross-reference review;

- verify that all CDR rulings are represented accurately;

- verify that the readiness verdict is exactly:

`OUTCOME A — MECHANICS AUTHORIZED; PRODUCTION SEED CONTENT NOT YET RATIFIED `
Do not modify source code merely to make unrelated checks pass.

If repository-wide checks are run, report their results but do not expand the scope to repair unrelated failures.

## 11. Required Submission

Submit:

1. The amended file:

`DOCS/CAW/AMS/AMS-0504-PREP.md `

1. A concise reconciliation report containing:

- files modified;

- confirmation that no production or test code changed;

- CDR rulings incorporated;

- superseded PREP positions removed or relabeled;

- genuinely remaining implementation dependencies, if any;

- final readiness verdict;

- validation performed;

- any blocking discrepancy between the CDR and current repository authority.

1. A final compliance statement using this form:

**AMS-0504-PREP has been reconciled with the ratified AMS-0504-CDR. Seed mechanics are authorized for implementation under the CDR’s binding safeguards. No production seed corpus, production manifest, or constitutional Registry content has been created, approved, or materialized.**

## 12. Stop Conditions

Stop and report to the Chair without making speculative changes if:

- the CDR conflicts with a higher constitutional authority;

- the CDR references a capability that cannot be located or interpreted from the governing artifacts;

- the CDR’s exact manifest, trust, canonicalization, or outcome requirements are internally inconsistent;

- implementing the CDR’s wording in the PREP would require inventing missing constitutional rules;

- the current repository contradicts a CDR ruling in a way that cannot be documented without deciding architecture;

- the amendment would require changing any file outside the authorized PREP path.

Do not resolve these conditions through inference.

## 13. Definition of Done

This mandate is complete only when:

- `AMS-0504-PREP.md` accurately reflects the ratified CDR;

- resolved decisions are no longer represented as open;

- the amended PREP clearly separates ratified mechanics from unratified production content;

- the decision and risk registers are reconciled;

- the final verdict is **OUTCOME A** exactly as specified;

- only the authorized PREP document was modified;

- no implementation code, production seed data, test data, schema, or configuration was created or changed;

- the final submission includes the required reconciliation report and compliance statement.

**End of Mandate**
