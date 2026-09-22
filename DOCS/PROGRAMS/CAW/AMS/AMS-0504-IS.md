# AMS-0504-IS — Registry Seed System Implementation Specification

## FINAL CONSOLIDATED

Field

Value

**Document ID**

`AMS-0504-IS`

**Title**

Registry Seed System Implementation Specification — Final Consolidated

**Authority**

Derived from `AMS-0504-CDR` and `AMS-0504-PREP`; incorporates `AMS-0504-IS-A01`

**Status**

`FINAL CONSOLIDATED — PENDING FINAL COUNCIL RATIFICATION`

**Consolidation Authority**

Chair Determination — AMS-0504 Final Consolidation Decision

**Date**

August 4, 2026

**Implementation Status**

`NOT YET AUTHORIZED` — implementation mandate withheld pending final ratification

**Scope**

Registry seed-system mechanics only

**Production Seed Content**

`EXPLICITLY OUT OF SCOPE — NOT RATIFIED`

**Amendment Register**

`AMS-0504-IS-A01 — INCORPORATED`

## 1. Purpose

This specification is the single, consolidated technical implementation contract for the Registry Seed System under AMS-0504.

It converts the binding constitutional rulings of `AMS-0504-CDR` and the reconciled architectural findings of `AMS-0504-PREP` into a deterministic, implementation-ready engineering contract, and it incorporates in full the binding amendment `AMS-0504-IS-A01`.

This specification resolves every technical detail that must not be improvised by an implementation agent, including:

- the exact seed-manifest envelope;

- the strict JSON canonicalization boundary;

- the canonicalization and integrity model;

- the cryptographic signature model and signed-payload boundary;

- the trust-root structure and distribution model;

- the singular, explicit verification sequence;

- the Domain-owned equivalence boundary;

- the closed seed-execution outcome model;

- the PostgreSQL transaction, concurrency, and timeout model;

- the dependency-ordered persistence model;

- the test-fixture isolation model;

- the permitted package and file boundaries;

- the required verification and acceptance criteria.

This specification does not authorize the creation, approval, signing, or materialization of production Registry seed content.

This document supersedes all prior drafts of `AMS-0504-IS`. Upon final Council ratification, it becomes the sole implementation authority for AMS-0504 mechanics.

## 2. Governing Authority and Precedence

### 2.1 Authority Hierarchy

The following hierarchy governs this specification:

1. Ratified Zyppi constitutional authorities;

2. Applicable security and runtime constitutions;

3. `AMS-0504-CDR — Registry Seed System Chair Decision Resolution`;

4. This `AMS-0504-IS — Registry Seed System Implementation Specification (Final Consolidated)`;

5. `AMS-0504-PREP — Registry Seed System Constitutional Reconnaissance`;

6. Current authoritative Domain, Contract, Runtime, and Registry source definitions;

7. Current PostgreSQL schema and migrations;

8. Tests, examples, historical documents, and illustrative datasets.

Where an inconsistency exists, the higher authority prevails.

### 2.2 Role of This Specification

This document is an implementation contract, not a new constitutional authority.

It shall:

- operationalize settled Chair rulings;

- resolve technical details required for deterministic implementation;

- constrain implementation choices;

- define verifiable acceptance criteria.

It shall not:

- override constitutional authority;

- reopen ratified Chair decisions;

- authorize production seed content;

- create constitutional facts through implementation inference.

### 2.3 Relationship to the Incorporated Amendment

`AMS-0504-IS-A01` has been incorporated verbatim in substance into this consolidated specification. Where this document and any residual reading of the standalone amendment could differ, this consolidated document governs as the single authority. The amendment is retained in the amendment register solely for provenance.

## 3. Consolidation Record and Amendment Register

### 3.1 Consolidation Basis

This consolidation is issued under the Chair Determination for AMS-0504 final consolidation. The Chair disposition was:

`AMS-0504-IS` is APPROVED FOR FINAL CONSOLIDATION, but NOT YET RATIFIED AS THE IMPLEMENTATION AUTHORITY. The implementation mandate to Jules remains withheld until the consolidated specification resolves the Council findings and incorporates the technical corrections, and until one final Council ratification review is completed.

### 3.2 Amendment Register

Instrument

Relationship

Disposition

`AMS-0504-IS-A01`

Binding amendment to `AMS-0504-IS`

`INCORPORATED` — no longer read as a standalone authority

### 3.3 Consolidation Decisions Applied

This consolidation applies the following determinations from the Chair. Each is binding and is reflected in the sections cited.

#

Decision

Resolution

Location

CD-1

Verification precedence

Adopt A01 §3.4 as the singular, explicit sequence. Integrity verification precedes signature verification; on a manifest with both defects, `IntegrityRefusal` is returned before `AuthorityRefusal`.

§11

CD-2

Signature boundary

Signature covers the canonicalized manifest envelope excluding `signature` and excluding `records`; records are bound transitively through `integrityDigest`. The record corpus is canonicalized exactly once.

§8.5

CD-3

Transaction timeout

Fixed initial constitutional ceiling of `30,000 ms`, subject to future amendment based on measured production-scale seed workloads. Not an arbitrary implementation choice.

§13.6

CD-4

Trust-set structure

The trust set is a version-controlled immutable map of structured entries, not a bare `keyId → publicKey` map.

§8.2

CD-5

Fixture path

Canonical fixture path is `apps/api/src/registry/infrastructure/persistence/fixtures/`. The competing seed-local fixture namespace is eliminated.

§16.1, §17.5

CD-6

Strict JSON boundary

A01's complete prohibited-value list is incorporated; the distinction between runtime invalid-value refusal (`ValidationRefusal`) and constitutional incompatibility (halt for Chair review) is preserved.

§7.2, §7.6

CD-7

Expired-key behavior

Raw Ed25519 keys carry no intrinsic expiry; key age and deployment date do not imply revocation.

§8.8

### 3.4 Council Findings and Corrections Disposition

All Council findings and both technical corrections identified during review are resolved by this consolidation. No finding is carried forward as open. Specifically:

- The verification-sequence ambiguity is closed by the singular sequence in §11.

- The multi-defect outcome precedence is fixed in §11.4.

- The signature-boundary and double-canonicalization concern is closed by §8.5.

- The missing transaction-timeout value is closed by §13.6.

- The trust-set structure is closed by §8.2.

- The fixture-path inconsistency between prior §15.1 and §16.5 is closed by §16.1 and §17.5.

- The strict JSON boundary and the expired-key gap are closed by §7.2 and §8.8.

## 4. Binding Scope

### 4.1 Authorized Implementation Scope

Following final ratification and issuance of a separate implementation mandate, AMS-0504 may implement:

- Seed-manifest parsing and structural validation;

- Strict JSON boundary validation;

- RFC 8785 JSON Canonicalization Scheme processing;

- SHA-256 manifest-record integrity verification;

- Ed25519 signature verification;

- Verification against an application-distributed structured public-key trust set;

- Domain validation of all declared Registry records;

- Domain-owned record identity and semantic-equivalence helpers;

- Deterministic state classification;

- Dependency-ordered PostgreSQL insertion;

- Single-transaction, timeout-bounded seed materialization;

- Idempotent rerun detection;

- Closed outcome reporting;

- CLI execution and exit-code mapping;

- Test-only fixture support within the isolation rules defined by this specification;

- Unit, integration, boundary, and failure-mode tests.

### 4.2 Explicit Non-Goals

AMS-0504 shall not:

- create or materialize production Registry seed data;

- promote historical examples, documentation examples, or test fixtures into constitutional truth;

- invoke the Runtime pipeline;

- create an `ExecutionReceipt`;

- create a Genesis receipt;

- create a new seed-audit database table;

- perform `UPDATE` operations during seed execution;

- perform `DELETE` operations during seed execution;

- repair, normalize, infer, or complete manifest data;

- use the database as the authority trust root;

- use environment variables to define which authorities are trusted;

- introduce database, file-system, process-environment, or network I/O into `@zyppi/domain`;

- introduce seed orchestration into `@zyppi/runtime`;

- introduce production seed content into the repository.

## 5. Architectural Principles

The implementation shall comply with the following invariants.

**IS-P01 — Mechanics Are Not Authority.** The seed system is a controlled materialization mechanism. It may verify and execute approved facts but shall never author, infer, supplement, or repair those facts.

**IS-P02 — Verification Precedes Persistence.** All manifest authentication, integrity verification, structural validation, and Domain validation shall complete successfully before the implementation begins a database write transaction.

**IS-P03 — Fail Closed.** Any unknown, malformed, unverifiable, invalid, divergent, partial, or infrastructure-failed condition shall terminate execution without committing a database mutation.

**IS-P04 — Domain Owns Meaning.** Record identity and semantic equivalence are Domain concerns. PostgreSQL row equality, SQL coercion, JSON text equality, and storage metadata shall not define constitutional equivalence.

**IS-P05 — Persistence Is Mechanical.** The persistence layer shall execute parameterized SQL and enforce atomicity. It shall not define constitutional authority, semantic equivalence, canonicalization rules, or manifest meaning.

**IS-P06 — No Silent Repair.** The implementation shall not add missing fields, apply default values, coerce invalid values, reorder semantic collections, truncate or normalize values, repair malformed relationships, reconcile partial state, or overwrite divergent state.

**IS-P07 — Production Content Remains Unratified.** No implementation artifact created under AMS-0504 shall contain approved production Registry facts.

**IS-P08 — Canonicalization Is Serialization, Not Transformation.** RFC 8785 canonicalization is a serialization operation only. It shall never project, coerce, normalize, repair, infer, omit, substitute, or round values.

**IS-P09 — Single Canonicalization per Payload.** Each canonicalization payload is canonicalized exactly once per execution. The record corpus is canonicalized exactly once for integrity; the signature envelope is canonicalized exactly once for signature. No payload is canonicalized twice.

## 6. Seed Manifest Contract

### 6.1 Manifest Format

A seed manifest shall be a UTF-8 encoded JSON document.

The manifest shall conform to the following logical structure:
`{   "manifestId": "00000000-0000-0000-0000-000000000000",   "manifestVersion": "1.0.0",   "authorityReference": "zyppi:council:registry-seed:authority-reference",   "keyId": "zyppi-seed-ed25519-2026-v1",   "integrityAlgorithm": "SHA-256",   "integrityDigest": "0000000000000000000000000000000000000000000000000000000000000000",   "signatureAlgorithm": "Ed25519",   "signature": "base64-encoded-signature",   "records": {     "referents": [],     "identities": [],     "evidence": [],     "policies": [],     "authorities": [],     "capabilities": [],     "standings": []   } } `
The example above defines structure only. It contains no approved production content. The example `keyId` conforms to the binding convention in §8.3.

### 6.2 Required Manifest Fields

The manifest shall contain all of the following fields:

Field

Required Type

Meaning

`manifestId`

UUID string

Unique identifier for the manifest artifact

`manifestVersion`

Semantic Version string

Version of the manifest contract/content artifact

`authorityReference`

Non-empty string

Governance reference identifying the issuing authority

`keyId`

Non-empty string conforming to §8.3

Identifier of the authorized public key used for verification

`integrityAlgorithm`

Literal `"SHA-256"`

Integrity-digest algorithm

`integrityDigest`

64-character lowercase hexadecimal string

SHA-256 digest of the canonical `records` payload

`signatureAlgorithm`

Literal `"Ed25519"`

Manifest signature algorithm

`signature`

Base64 string

Ed25519 signature over the canonical signed envelope

`records`

Manifest record collection

Declared Registry facts to be validated and materialized

No additional top-level fields shall be accepted.

### 6.3 Manifest Version

`manifestVersion` identifies the manifest contract version and shall be validated as a strict Semantic Version value. AMS-0504 supports only `1.0.0`. Any other manifest version shall result in `ValidationRefusal`. Future manifest versions require an explicit constitutional or Chair-authorized compatibility decision. The implementation shall not infer forward compatibility.

### 6.4 Record Collections

The `records` object shall contain exactly the following collections:
`referents identities evidence policies authorities capabilities standings `
Every collection shall be present and shall be an array. An omitted collection, additional collection, non-array collection, duplicate record identity, or structurally invalid record shall result in `ValidationRefusal`. Empty arrays are valid.

### 6.5 Manifest Representation Is Authoritative

Where a Domain concept has a JSON representation, that representation shall be defined by the ratified manifest contract, not invented by the canonicalizer or the adapter.

- Timestamps are represented as manifest strings in the required canonical timestamp format.

- Identifiers are represented as manifest strings.

- Large numeric identifiers are represented as strings where the manifest contract requires string representation.

The implementation shall validate the manifest representation before canonicalization and before persistence. The implementation shall not accept a runtime `Date` and decide how to serialize it, nor accept a `BigInt` and decide whether to serialize it as a number or string.

### 6.6 Manifest Content Boundary

The structural contract is authorized. The values contained in a future production manifest are not authorized by this specification. The implementation may use synthetic test fixtures solely to verify mechanics under the isolation controls in §16.

## 7. Canonicalization, Strict JSON Boundary, and Integrity Contract

### 7.1 Governing Canonicalization Standard

RFC 8785 — JSON Canonicalization Scheme (JCS) is the exclusive canonicalization standard for AMS-0504.

The implementation shall not use:

- native `JSON.stringify()` as the canonical representation;

- custom key ordering or a hand-written “sorted JSON” approximation;

- adapter-local serialization;

- database JSON serialization;

- incidental JavaScript object serialization.

The implementation shall use a conformant RFC 8785 implementation, or a rigorously verified implementation demonstrated against authoritative RFC 8785 test vectors.

### 7.2 Strict JSON Value Boundary

Before JCS canonicalization is invoked, the payload to be canonicalized shall have passed explicit validation as a strict JSON value.

A valid canonicalization input consists only of:

- JSON objects;

- JSON arrays;

- strings;

- booleans;

- `null`; and

- finite JSON numbers representable under the governing JSON and RFC 8785 requirements.

The following values are prohibited as direct canonicalization inputs:

- `Date` objects;

- `BigInt` values;

- `Map` objects;

- `Set` objects;

- `Buffer` values;

- typed arrays;

- functions;

- symbols;

- class instances;

- `undefined`;

- `NaN`;

- positive or negative infinity;

- cyclic object graphs;

- values dependent on prototype behavior;

- values whose serialization depends on implementation-specific hooks; and

- any other non-JSON runtime value.

The presence of a prohibited value shall cause deterministic refusal. The implementation shall not convert the value into an alternative representation. No fallback serialization may be used.

### 7.3 Canonicalization Performs No Transformation

The canonicalization capability shall perform canonical serialization only. It shall not project, coerce, normalize, repair, infer, omit, substitute, round, stringify non-JSON values by custom convention, or otherwise alter the semantic representation supplied to it.

### 7.4 Canonical Integrity Payload

The integrity payload shall be the value of `manifest.records`.

The implementation shall:

1. extract the `records` value;

2. validate `records` against the strict JSON boundary (§7.2);

3. canonicalize `records` according to RFC 8785;

4. encode the canonical JSON as UTF-8 bytes;

5. compute SHA-256 over those exact bytes;

6. encode the digest as lowercase hexadecimal;

7. compare the computed value with `integrityDigest`.

The comparison shall be exact. Any mismatch shall result in `IntegrityRefusal`. No database transaction shall begin before integrity verification succeeds.

### 7.5 Digest Representation

The canonical digest representation shall be `64 lowercase hexadecimal characters`.

The implementation shall reject:

- uppercase hexadecimal;

- prefixed values such as `sha256-`;

- Base64 digests;

- shortened digests; and

- malformed values.

A digest that is malformed in representation is a structural envelope defect and is refused under §11 as `ValidationRefusal`. A digest that is well-formed but does not match the computed value is refused as `IntegrityRefusal`.

### 7.6 Canonicalization Failure Mapping

Failure to satisfy the canonicalization and strict JSON boundary shall be treated as follows:

- Malformed or structurally invalid manifest content → `ValidationRefusal`.

- Prohibited runtime or non-JSON value encountered in the canonicalization payload → `ValidationRefusal`.

- Failure of the computed JCS digest to match `integrityDigest` → `IntegrityRefusal`.

- Inability of a conforming implementation to perform canonicalization because the manifest representation is constitutionally underspecified, or because an authoritative Domain representation is incompatible with RFC 8785 without transformation → implementation halt and Chair review.

The final condition is a constitutional incompatibility, not a runtime refusal, and shall not be repaired locally.

### 7.7 Domain Compatibility Gate

Before the implementation is accepted, tests shall demonstrate that every supported Domain record representation can be processed through RFC 8785 without semantic coercion.

If a Domain representation is incompatible with RFC 8785, implementation shall halt for constitutional review. The persistence adapter shall not introduce compatibility transformations.

## 8. Cryptographic Authority, Trust-Root, and Signature Contract

### 8.1 Signature Algorithm

AMS-0504 shall use `Ed25519`. No alternative signature algorithm shall be implemented. Algorithm negotiation is prohibited.

### 8.2 Trust-Set Structure

The authoritative seed-verification trust set is a version-controlled, immutable map of structured entries. It is not a bare `keyId → publicKey` map.

Each trust-set entry shall be a structured record of the form:
`type SeedTrustKeyEntry = {   keyId: string;   algorithm: "Ed25519";   publicKey: string;   status: "active" | "revoked"; }; `
The trust set shall be defined in version-controlled application source as an immutable application trust set. It is public verification material and shall not contain private keys.

The trust set shall be:

- bounded by application-controlled, version-reviewed trust material;

- immutable for the lifetime of a running application artifact;

- independent of the Registry database;

- independent of deployment environment variables as a source of trust membership;

- auditable through the normal Zyppi source-review and deployment process.

### 8.3 Binding Key Identifier Convention

Every trusted seed-signing key shall have a stable `keyId` conforming to the convention:
`zyppi-seed-<algorithm>-<year>-v<version> `
The components are:

- `zyppi-seed` — fixed namespace prefix;

- `<algorithm>` — the normalized algorithm identifier approved by the governing cryptographic specification;

- `<year>` — the four-digit year in which the trust-key version was introduced;

- `v<version>` — a positive integer version within that key lineage.

An example conforming identifier is:
`zyppi-seed-ed25519-2026-v1 `
The identifier is an authority-routing and trust-set selection value. It is not itself cryptographic proof.

### 8.4 Public-Key and Signature Formats

Authorized public keys shall be represented as Base64-encoded raw Ed25519 public keys. Each decoded public key shall contain exactly `32 bytes`. Malformed keys shall be rejected during application initialization or trust-set construction.

The manifest `signature` shall be Base64-encoded. The decoded signature shall contain exactly `64 bytes`. Any malformed Base64 value or signature with an invalid decoded length shall result in `AuthorityRefusal`.

### 8.5 Signed Payload Boundary

The signature shall cover the canonicalized manifest authority envelope, excluding both the `signature` field and the `records` field. The records are bound to the signature transitively through the `integrityDigest` field.

The signed payload shall be the RFC 8785 canonicalization of the following object:
`{   "manifestId": "...",   "manifestVersion": "1.0.0",   "authorityReference": "...",   "keyId": "...",   "integrityAlgorithm": "SHA-256",   "integrityDigest": "...",   "signatureAlgorithm": "Ed25519" } `
Both `signature` and `records` are omitted entirely from the signed payload.

Binding rationale:

`integrityDigest` is a member of the signed envelope and equals:
`SHA-256(RFC8785(records)) `
A valid signature therefore authenticates the declared digest, and integrity verification confirms the record corpus hashes to that digest. Any tampering with `records` changes the digest and breaks the integrity relationship. The record corpus is thereby authenticated without being canonicalized a second time.

The implementation shall:

1. construct the signed-envelope object using the manifest fields above;

2. omit `signature` and `records`;

3. canonicalize the object under RFC 8785;

4. encode the canonical result as UTF-8;

5. decode the Base64 signature;

6. verify the signature using the authorized Ed25519 public key identified by `keyId`.

The implementation shall not sign or verify raw source-file bytes.

### 8.6 Key Identifier Validation

A `keyId` shall be rejected if it is:

- absent;

- empty;

- malformed;

- outside the required namespace;

- syntactically nonconforming to §8.3;

- unknown to the immutable application trust set;

- marked revoked;

- not active for the requested verification operation; or

- associated with an algorithm incompatible with the manifest’s declared cryptographic algorithm.

Any such condition shall result in `AuthorityRefusal`.

The implementation shall not:

- guess a key;

- select a default key;

- fall back to another trusted key;

- infer an algorithm from signature length;

- search external key registries dynamically; or

- accept a key solely because it can verify a signature.

### 8.7 Algorithm Binding and Agility

The manifest cryptographic envelope shall declare its signature algorithm explicitly.

The implementation shall verify all of the following:

- the declared algorithm is recognized and authorized;

- the `keyId` resolves to a trusted key entry;

- the resolved key entry is authorized for the declared algorithm;

- the key’s actual cryptographic type is compatible with the declared algorithm;

- the signature encoding is valid for the declared algorithm;

- the signature verifies against the exact ratified canonical signed envelope.

Successful verification of a signature under an algorithm other than the declared and authorized algorithm shall not be accepted. Algorithm mismatch shall result in `AuthorityRefusal`.

Adding a new algorithm family, trust key, or key lineage requires:

- a formal specification amendment or successor instrument;

- explicit authorization of the algorithm;

- explicit definition of its key and signature encodings;

- review of its canonical signed-payload boundary;

- addition to the immutable trust set through reviewed source change; and

- deployment of an application artifact containing the newly authorized trust material.

The seeder shall not implement algorithm agility through permissive negotiation or runtime discovery.

### 8.8 Key Rotation, Revocation, and Expiry

Key rotation and revocation shall be explicit trust-set state changes.

- A key rotation shall not replace an existing trusted key implicitly. A new key shall receive a distinct `keyId`.

- Rotation may temporarily include multiple authorized public keys.

- Key removal shall require an explicit source change and review.

- A revoked key shall remain identifiable for audit purposes but shall not be accepted for new manifest verification.

- Revocation is expressed through the `status` field of the structured trust-set entry.

- Dynamic key revocation at runtime is outside the scope of AMS-0504.

- Emergency revocation is handled through a reviewed application release that marks the key revoked or removes it.

- No runtime key rotation mechanism is authorized.

Raw Ed25519 keys carry no intrinsic expiry. The implementation shall not infer revocation or invalidity from key age, certificate expiration, or deployment date unless such behavior is expressly defined by a future governing instrument.

### 8.9 Prohibited Trust Sources and Environment Boundary

The following shall not determine which signing authorities are trusted:

- PostgreSQL;

- environment variables;

- deployment configuration;

- remote configuration;

- runtime-discovered key endpoints;

- manifest-supplied public keys;

- user input; or

- database records.

Environment configuration may supply ordinary infrastructure configuration, such as the database connection string.

Environment configuration shall not:

- add, remove, or replace a trusted signing key;

- redefine a `keyId`; or

- select a different trust authority.

### 8.10 Authority Refusal Conditions

The following conditions shall produce `AuthorityRefusal`:

- missing `keyId`;

- malformed or nonconforming `keyId`;

- `keyId` outside the required namespace;

- unknown `keyId`;

- revoked or inactive `keyId`;

- algorithm mismatch between `keyId` entry and declared algorithm;

- missing signature;

- malformed signature;

- invalid signature length;

- unsupported signature algorithm;

- malformed authorized public key;

- signature-verification failure;

- trust-set initialization failure.

## 9. Domain Capability Contract

### 9.1 Domain Purity

The following capabilities may be added to `@zyppi/domain` only if required by the implementation:

- RFC 8785 canonicalization;

- Registry record identity extraction;

- Registry record semantic equivalence.

These capabilities shall be:

- pure;

- deterministic;

- synchronous;

- side-effect free;

- free of database imports;

- free of file-system imports;

- free of process-environment access;

- free of network access; and

- free of application-layer imports.

The canonicalization capability shall not contain Domain-specific projection rules.

If the current Domain model cannot be represented by the ratified manifest JSON contract without transformation, implementation shall halt for constitutional review. The adapter shall not introduce a compatibility layer.

### 9.2 Canonicalization API

The Domain package shall expose:
`canonicalizeJcs(value: unknown): string `
Behavior:

- accepts only strict JSON values (§7.2);

- returns the RFC 8785 canonical JSON representation;

- performs canonical serialization only;

- performs no semantic normalization, projection, or coercion;

- throws a typed Domain error for unsupported or non-canonicalizable values.

The function shall not calculate hashes and shall not perform cryptographic signature operations.

### 9.3 Record Identity API

The Domain package shall expose a typed identity helper for supported Registry record variants.

The final implementation shall:

- use a discriminated Registry-record union rather than untyped `unknown` values;

- return the record’s constitutional identity;

- be deterministic;

- reject unsupported record types; and

- reject records without a valid identity.

### 9.4 Semantic Equivalence API

The Domain package shall expose:
`areRegistryRecordsEquivalent(   expected: RegistryRecord,   actual: RegistryRecord ): boolean `
The helper shall:

- require the same record variant;

- require the same constitutional identity;

- compare all constitutionally meaningful fields;

- ignore storage-only metadata;

- avoid database-specific representations;

- avoid JavaScript reference equality; and

- avoid raw serialized-string equality.

The helper shall not accept arbitrary `unknown` values. Both inputs shall already be validated Domain records.

### 9.5 Storage Metadata Exclusion

Database-only fields shall not participate in semantic equivalence, including:

- `created_at`;

- `updated_at`;

- database-generated sequence values;

- transaction identifiers; and

- storage row order.

A field may be excluded only because it is not represented as constitutional Domain state.

## 10. Manifest Validation Contract

### 10.1 Validation Scope

After successful authority and integrity verification, the implementation shall:

- validate the `records` container;

- validate every collection;

- validate every record through the authoritative Domain validator;

- reject duplicate identities within the manifest;

- validate all required inter-record references;

- construct a validated in-memory manifest model; and

- proceed to database state classification.

### 10.2 Duplicate Identities

Two records of the same record type shall not declare the same constitutional identity.

Duplicate identities shall result in `ValidationRefusal`.

The implementation shall not deduplicate records.

### 10.3 Referential Validation

Every manifest relationship required by the Domain model shall reference a valid declared or otherwise constitutionally resolvable record.

The implementation shall not:

- create missing referenced records;

- substitute a different identity;

- defer invalid references to PostgreSQL; or

- repair references after insertion.

Invalid relationships shall result in `ValidationRefusal`.

### 10.4 Validation Before Database Mutation

All manifest records shall complete structural and Domain validation before a database write transaction begins.

A manifest containing one invalid record shall produce no database mutation.

## 11. Consolidated Verification Sequence

### 11.1 Singular, Explicit Sequence

This section is the sole, binding verification sequence for AMS-0504. No alternative ordering is permitted.

For every seed manifest, the implementation shall execute, in exactly this order:

1.

**Load.** Load the manifest as untrusted input and parse it as JSON. A document that is not well-formed JSON → `ValidationRefusal`.

2.

**Envelope structure.** Validate the manifest envelope and required fields:

- all required fields present;

- correct types;

- no additional top-level fields;

- `records` containing exactly the seven required array collections.

Failure → `ValidationRefusal`.

3.

**Field formats.** Validate manifest field formats:

- `manifestId` is a UUID;

- `manifestVersion` is exactly `1.0.0`;

- `authorityReference` is non-empty;

- `keyId` is a non-empty string;

- `integrityAlgorithm` is `"SHA-256"`;

- `signatureAlgorithm` is `"Ed25519"`;

- `integrityDigest` is exactly 64 lowercase hexadecimal characters;

- `signature` is a non-empty string.

Failure → `ValidationRefusal`.

4.

**Strict JSON boundary.** Validate that every payload to be canonicalized—the `records` payload for integrity and the envelope payload for signature—is a strict JSON value (§7.2).

Presence of a prohibited value → `ValidationRefusal`.

5.

**Integrity.** Canonicalize `records` via RFC 8785, encode UTF-8, compute SHA-256, encode lowercase hexadecimal, and compare exactly to `integrityDigest`.

Mismatch → `IntegrityRefusal`.

6.

**Authority and signature.**

- Validate the `keyId` convention and namespace;

- resolve `keyId` against the immutable application trust set;

- confirm the entry is active and not revoked;

- confirm algorithm binding;

- decode the signature to exactly 64 bytes;

- construct the signed envelope (§8.5);

- canonicalize the signed envelope;

- verify the Ed25519 signature with the resolved public key.

Any failure → `AuthorityRefusal`.

7.

**Record validation.**

- Validate every record through the authoritative Domain validators;

- reject duplicate identities;

- validate inter-record references.

Failure → `ValidationRefusal`.

8.

**Transaction.** Begin the database transaction only after steps 1 through 7 have all succeeded.

9.

**State handling.** Inspect, compare, and, where authorized, materialize Registry state atomically within the timeout-bounded transaction (§13).

No database write may occur before completion of steps 1 through 7.

### 11.2 Signature Precedes Database Access

Signature verification shall occur before any database access.

No database connection used for seed writes shall be opened before steps 1 through 7 succeed.

### 11.3 Single Canonicalization Guarantee

The record corpus is canonicalized exactly once during step 5.

The signature envelope is canonicalized exactly once during step 6.

Neither payload is canonicalized more than once per execution.

### 11.4 Multi-Defect Outcome Precedence

Where a manifest carries more than one defect, the outcome is the one reached first by the mandated sequence in §11.1.

Because integrity verification occurs before authority and signature verification, a manifest that fails both integrity and authority returns:
`IntegrityRefusal `
before:
`AuthorityRefusal `
This precedence is binding and testable.

## 12. Database State Classification

### 12.1 Scope of Inspection

State classification applies exclusively to records declared in the currently loaded manifest.

Unrelated operational records and records belonging to other manifests shall not affect the state classification.

### 12.2 Required State Classes

The implementation shall classify the declared manifest records into one of the following states.

#### A. Empty

No declared manifest record exists in the database.

**Disposition:** Proceed to atomic materialization.

#### B. Fully Equivalent

Every declared manifest record exists and is semantically equivalent to its validated Domain representation.

**Disposition:** `AlreadyMaterialized`.

No database mutation shall occur.

#### C. Partial

At least one declared manifest record exists and at least one declared manifest record is absent.

**Disposition:** `PartialStateAnomaly`.

No database mutation shall occur.

#### D. Diverged

At least one declared manifest record exists with the same constitutional identity but is not semantically equivalent.

**Disposition:** `StateDiverged`.

No database mutation shall occur.

### 12.3 Classification Precedence

The implementation shall apply the following precedence:

1. `StateDiverged`;

2. `PartialStateAnomaly`;

3. `AlreadyMaterialized`;

4. Empty state.

If any matching stored record is semantically divergent, the result shall be `StateDiverged`, even if other declared records are absent.

This prevents a divergent constitutional identity from being hidden behind a broader partial-state classification.

### 12.4 State Inspection Requirements

Stored records shall be:

1. retrieved from PostgreSQL;

2. decoded through authoritative persistence mappers;

3. validated as Domain records; and

4. compared through the Domain semantic-equivalence helper.

Storage-row comparison is prohibited.

If a stored row cannot be decoded or validated as a Domain record, the result shall be `InfrastructureFailure`.

The implementation shall not attempt to repair the stored row.

## 13. Transaction and Concurrency Contract

### 13.1 Transaction Requirement

State inspection and materialization shall occur within one PostgreSQL transaction.

The transaction shall use:
`READ WRITE SERIALIZABLE `
isolation.

The implementation shall use the PostgreSQL transaction mechanism provided by `postgres.js`.

### 13.2 Required Transaction Flow

Within one transaction, the implementation shall:

- inspect all manifest-declared identities;

- decode and validate any matching stored records;

- classify the state;

- if fully equivalent, complete without writes;

- if partial or diverged, terminate without writes;

- if empty, insert the complete manifest in dependency order;

- commit only after every insertion succeeds.

### 13.3 Serialization Failure

A PostgreSQL serialization failure shall result in `InfrastructureFailure`.

The seeder shall not automatically retry.

Automatic retry is prohibited because a retry could conceal a concurrent state transition and make the final execution history ambiguous.

An operator may invoke a new explicit seed execution after the conflicting operation has completed.

### 13.4 Constraint Failure

Any unexpected PostgreSQL constraint failure shall:

- abort the transaction;

- produce no partial commit; and

- return `InfrastructureFailure`.

The implementation shall not translate an unexpected constraint failure into successful idempotency.

### 13.5 No Partial Commit

The implementation shall not use:

- per-record transactions;

- partial commits;

- savepoint-based partial success; or

- best-effort insertion.

The manifest is materialized as one atomic unit.

### 13.6 Mandatory Transaction Timeout

Registry seed execution shall operate under an explicit, finite transaction timeout.

The implementation shall not rely solely on:

- PostgreSQL server defaults;

- driver defaults;

- operating-system socket defaults;

- cloud-provider defaults; or

- unbounded transaction behavior.

The authoritative timeout value is:
`const SEED_TRANSACTION_TIMEOUT_MS = 30_000; `
This is a fixed initial constitutional ceiling of `30,000 ms`.

It is subject to future amendment based on measured production-scale seed workloads.

The value shall not be chosen ad hoc by the implementation agent, and no arbitrary alternative value is authorized.

The timeout shall have a single authoritative definition.

The implementation shall not create competing timeout values across:

- the CLI;

- the seeder;

- the repository; or

- the database adapter.

### 13.7 Timeout Enforcement

The timeout control shall apply to the database transaction itself, including:

- state inspection;

- semantic comparison;

- dependency-ordered insertion;

- constraint evaluation;

- commit; and

- any database operation required to complete the atomic seed transaction.

The implementation may use PostgreSQL transaction-local controls, driver-level controls, or a combination of both, provided the resulting behavior:

- satisfies the single authoritative timeout contract;

- does not weaken atomicity; and

- does not permit partial commit.

### 13.8 Timeout Outcome

A transaction timeout, statement timeout, connection timeout, or equivalent infrastructure interruption shall produce `InfrastructureFailure`.

The transaction shall be rolled back or otherwise confirmed not committed before the seeder reports the terminal outcome.

The implementation shall not:

- automatically retry;

- continue from the interrupted operation;

- resume a partially completed manifest;

- downgrade the failure to success;

- reinterpret the failure as `PartialStateAnomaly` without a subsequent independent state inspection; or

- perform automatic repair.

A later, separately initiated seed execution may inspect the resulting database state according to the normal state taxonomy.

### 13.9 Serialization, Deadlock, Lock, and Timeout Failures

A serialization failure, deadlock, lock timeout, or transaction timeout shall:

- terminate the current execution;

- prevent commit;

- produce `InfrastructureFailure`; and

- require an explicit subsequent invocation if another attempt is desired.

No automatic retry loop is authorized.

## 14. Dependency-Ordered Persistence

### 14.1 Required Insertion Order

Subject to verification against the authoritative physical foreign-key graph, the default insertion order shall be:
`referents identities evidence policies authorities capabilities standings `
Before implementation, this order shall be verified against the current authoritative migration.

If the migration establishes a different dependency graph:

1. the physical schema shall govern;

2. this specification shall be amended before implementation proceeds; and

3. the implementation agent shall not silently choose a different order.

### 14.2 Parameterized SQL

All persistence operations shall use parameterized SQL through `postgres.js`.

String-concatenated SQL is prohibited.

### 14.3 Persistence Responsibility

The persistence layer may:

- encode validated Domain values into database parameters;

- execute dependency-ordered inserts;

- enforce transaction boundaries; and

- decode stored rows through existing authoritative mappers.

The persistence layer shall not:

- validate constitutional authority;

- perform signature verification;

- define semantic equivalence;

- canonicalize manifests;

- generate missing records; or

- repair invalid data.

### 14.4 No Update or Delete

The seeder shall contain no `UPDATE` or `DELETE` operation.

A rerun shall either:

- return `AlreadyMaterialized`;

- return a terminal refusal; or

- materialize an entirely absent manifest atomically.

## 15. Closed Seeder Outcome Contract

### 15.1 Outcome Union

The implementation shall expose the following closed result model:
`type SeedExecutionOutcome =   | {       kind: "Success";       manifestId: string;       materializedRecordCount: number;     }   | {       kind: "AlreadyMaterialized";       manifestId: string;       materializedRecordCount: number;     }   | {       kind: "StateDiverged";       manifestId: string;       reasonCode: string;     }   | {       kind: "PartialStateAnomaly";       manifestId: string;       presentRecordCount: number;       absentRecordCount: number;     }   | {       kind: "IntegrityRefusal";       manifestId?: string;       reasonCode: string;     }   | {       kind: "AuthorityRefusal";       manifestId?: string;       reasonCode: string;     }   | {       kind: "ValidationRefusal";       manifestId?: string;       reasonCode: string;     }   | {       kind: "InfrastructureFailure";       reasonCode: string;     }; `
The exact exported type names may differ only if the implementation mandate explicitly approves the change.

The union shall remain closed.

### 15.2 Outcome Meanings

Outcome

Meaning

Database Mutation

`Success`

Entire previously absent manifest was atomically materialized

Yes

`AlreadyMaterialized`

Every declared record already exists and is semantically equivalent

No

`StateDiverged`

At least one declared identity exists with non-equivalent meaning

No

`PartialStateAnomaly`

Some declared records exist and others are absent

No

`IntegrityRefusal`

Canonical SHA-256 integrity verification failed

No

`AuthorityRefusal`

Trust-root or signature verification failed

No

`ValidationRefusal`

Manifest structure, record validation, relationship validation, or strict JSON boundary failed

No

`InfrastructureFailure`

Database, timeout, or unexpected infrastructure operation failed

No committed mutation

### 15.3 CLI Exit Codes

The CLI shall map outcomes as follows:

Outcome

Exit Code

`Success`

`0`

`AlreadyMaterialized`

`0`

`InfrastructureFailure`

`1`

`StateDiverged`

`2`

`PartialStateAnomaly`

`3`

`IntegrityRefusal`

`4`

`AuthorityRefusal`

`5`

`ValidationRefusal`

`6`

No other exit code is authorized.

### 15.4 Error Exposure

The CLI may emit:

- the outcome kind;

- a stable reason code;

- the manifest identifier where available; and

- safe operational context.

The CLI shall not expose:

- database credentials;

- private keys;

- raw database connection strings;

- driver stack traces by default;

- internal SQL text; or

- sensitive deployment configuration.

## 16. Test Fixture and Execution Isolation

### 16.1 Fixture Location

Test-only manifests shall reside under the canonical fixture path:
`apps/api/src/registry/infrastructure/persistence/fixtures/ `
Every test fixture shall use:
`.fixture.json `
as its filename suffix.

This is the sole authorized fixture location.

No competing seed-local fixture namespace is authorized.

### 16.2 Production Manifest Separation

Production manifest paths shall be structurally separate from test-fixture paths.

No production manifest shall exist under the fixture directory.

No fixture shall be accepted by the production CLI.

### 16.3 Explicit Execution Modes

The implementation shall expose separate execution modes:

- production mode; and

- test-fixture mode.

The mode shall be selected by the executable entry point, not by manifest content.

A production execution path shall reject `.fixture.json` files.

A test-fixture execution path shall reject non-fixture manifest paths.

### 16.4 Test Database Guard

Fixture execution shall verify that the active database is the dedicated test database.

The implementation shall require:
`PGDATABASE === "zyppi_test" `
for test-fixture execution.

If the condition is not met, execution shall fail closed before opening a write transaction.

### 16.5 Fixture Authority

Synthetic test fixtures may contain test-only signing material and test-only public keys.

Test trust material shall be isolated from production trust material.

A test key shall not appear in the production trust set.

A production key shall not be embedded in a test fixture.

### 16.6 No Fixture Promotion

The implementation shall not provide any mechanism that:

- copies a fixture into a production manifest location;

- converts a fixture into production authority;

- signs a fixture using production authority; or

- treats fixture content as constitutional truth.

## 17. Package and File Boundaries

### 17.1 `@zyppi/domain`

Permitted:

- pure RFC 8785 canonicalization helper;

- typed Registry-record identity helper;

- typed Registry-record semantic-equivalence helper;

- unit tests for those pure capabilities.

Prohibited:

- PostgreSQL imports;

- `postgres.js`;

- file-system access;

- environment access;

- cryptographic trust-root configuration;

- manifest loading;

- signature verification;

- seed orchestration.

### 17.2 `@zyppi/contracts`

Permitted only if required by the implementation contract:

- stable seed-execution outcome types;

- stable seed-executor interface.

No seed contract shall be added unless the implementation requires an application-facing boundary.

The implementation shall not add speculative public contracts.

### 17.3 `@zyppi/runtime`

No AMS-0504 implementation code shall be added.

The seeder shall not invoke Runtime services.

### 17.4 `apps/api/src/registry/`

Permitted:

- manifest loader;

- manifest-envelope validation;

- strict JSON boundary validation;

- signature verification;

- integrity verification;

- trust-set construction;

- seed orchestration;

- PostgreSQL state inspection;

- transactional insertion;

- CLI entry point;

- persistence encoders;

- integration tests.

### 17.5 Recommended File Organization

The implementation should use a responsibility-oriented structure equivalent to:
`apps/api/src/registry/   seed/     seed-manifest.ts     seed-manifest-loader.ts     seed-authority.ts     seed-integrity.ts     seed-outcomes.ts     postgres-registry-seeder.ts     seed-cli.ts   infrastructure/     persistence/       fixtures/         *.fixture.json `
Exact filenames may vary.

Responsibility boundaries shall not vary without approval.

Test fixtures reside only under the canonical fixture path in §16.1.

No fixtures directory is authorized under `seed/`.

### 17.6 Trust-Set Placement

The immutable production trust set shall reside in application source under a clearly named module equivalent to:
`apps/api/src/registry/seed/seed-trust-set.ts `
It shall contain:

- the structured trust-set entries defined in §8.2; and

- public verification material only.

It shall not contain private keys.

## 18. Required Verification

### 18.1 Unit Tests

The implementation shall include tests for:

- RFC 8785 canonicalization determinism;

- canonicalization of nested objects and arrays;

- canonicalization failure behavior;

- strict JSON boundary refusal for each prohibited value class;

- SHA-256 digest generation;

- exact lowercase-hex digest comparison;

- Ed25519 signature verification over the signed envelope excluding `records`;

- valid signature acceptance;

- invalid signature rejection;

- unknown key rejection;

- malformed key rejection;

- revoked key rejection;

- algorithm-mismatch rejection;

- malformed signature rejection;

- manifest-envelope validation;

- unsupported manifest version rejection;

- unsupported algorithm rejection;

- duplicate identity rejection;

- Domain semantic equivalence;

- Domain semantic inequality;

- exclusion of storage-only metadata;

- outcome-to-exit-code mapping.

### 18.2 Integration Tests

Integration tests against PostgreSQL shall demonstrate:

- Empty database produces `Success`;

- all manifest records are committed atomically;

- a valid rerun produces `AlreadyMaterialized`;

- no rows are modified during `AlreadyMaterialized`;

- a divergent stored record produces `StateDiverged`;

- a partial declared-manifest state produces `PartialStateAnomaly`;

- unrelated database records do not produce a partial-state anomaly;

- invalid integrity digest produces `IntegrityRefusal`;

- invalid signature produces `AuthorityRefusal`;

- unknown key produces `AuthorityRefusal`;

- invalid Domain record produces `ValidationRefusal`;

- any insertion failure produces a complete rollback;

- serialization conflict produces `InfrastructureFailure`;

- transaction timeout produces `InfrastructureFailure` with confirmed rollback;

- a manifest with both integrity and authority defects produces `IntegrityRefusal`;

- no `UPDATE` statement is executed;

- no `DELETE` statement is executed;

- no `ExecutionReceipt` is created.

### 18.3 Fixture Isolation Tests

Tests shall prove:

- production mode rejects `.fixture.json`;

- test mode rejects production manifest paths;

- test-fixture execution rejects a database other than `zyppi_test`;

- production trust material is not available to test fixtures;

- test trust material is not available to production execution.

### 18.4 Boundary Tests

Automated boundary checks shall confirm:

- `@zyppi/domain` contains no infrastructure imports;

- `@zyppi/runtime` contains no seed implementation;

- no private key exists in the repository;

- no production seed content is introduced;

- no database schema change is required;

- no Runtime receipt is created.

## 19. Acceptance Criteria

AMS-0504 implementation shall be accepted only if all of the following are true.

### AC-01 — Authority Verification

A manifest signed by an authorized Ed25519 key is accepted.

A manifest signed by an unauthorized or unknown key is refused before database access.

### AC-02 — Integrity Verification

The SHA-256 digest of RFC 8785-canonicalized `records` is verified exactly.

Any mismatch is refused before database access.

### AC-03 — Domain Validation

Every record is validated before a database write transaction begins.

No invalid manifest produces a database mutation.

### AC-04 — Atomic Materialization

An entirely absent valid manifest is inserted as one transaction.

Any insertion failure rolls back all inserted records.

### AC-05 — Idempotency

A fully equivalent rerun produces `AlreadyMaterialized` and performs no mutation.

### AC-06 — Divergence Protection

A matching identity with non-equivalent Domain meaning produces `StateDiverged`.

No overwrite occurs.

### AC-07 — Partial-State Protection

A mixture of present and absent records within the loaded manifest produces `PartialStateAnomaly`.

No completion occurs.

### AC-08 — Unrelated-State Isolation

Unrelated operational records do not affect the classification of the loaded manifest.

### AC-09 — No Mutation on Refusal

Every refusal outcome leaves the database without a committed mutation.

### AC-10 — Runtime Isolation

The seeder does not invoke Runtime execution and does not create an `ExecutionReceipt`.

### AC-11 — Fixture Isolation

Test fixtures cannot be executed through the production path.

### AC-12 — Production Content Exclusion

No production Registry seed corpus is introduced.

### AC-13 — Package Purity

Domain helpers remain pure and infrastructure-free.

### AC-14 — Closed Outcome Model

Every execution terminates in exactly one of the eight defined outcomes.

### AC-15 — Verification Completion

All required:

- formatting;

- linting;

- compilation;

- package-boundary checks;

- dependency checks;

- unit tests;

- integration tests; and

- repository-specific verification commands

pass.

### AC-16 — Singular Verification Sequence

Execution follows the exact sequence in §11.1.

A manifest with both integrity and authority defects returns `IntegrityRefusal`.

### AC-17 — Signature Boundary

The signature is verified over the envelope excluding `signature` and `records`.

The record corpus is canonicalized exactly once per execution.

### AC-18 — Timeout Bound

The seed transaction is bounded by:
`SEED_TRANSACTION_TIMEOUT_MS = 30_000 `
A timeout produces `InfrastructureFailure` with confirmed rollback and no retry.

## 20. Implementation Prohibitions

The implementation agent shall not:

- alter the constitutional meaning of Registry records;

- add unapproved production seed data;

- infer missing manifest values;

- silently coerce invalid values;

- project `Date`, `BigInt`, or other runtime values during JCS canonicalization;

- use `JSON.stringify()` as a substitute for RFC 8785;

- introduce custom serialization fallbacks;

- add fallback signature algorithms;

- add algorithm negotiation;

- infer or default a trusted signing key;

- select a key based only on successful signature verification;

- dynamically add trust keys through environment configuration;

- negotiate or discover cryptographic algorithms at runtime;

- use environment variables as a mutable trust root;

- use PostgreSQL as the authority trust root;

- accept manifest-provided public keys;

- use an unspecified or unbounded transaction timeout;

- automatically retry serialization, lock, deadlock, or timeout failures;

- automatically repair partial state;

- update divergent records;

- delete existing records;

- create an `ExecutionReceipt`;

- add a Genesis receipt;

- add an audit database table;

- introduce I/O into `@zyppi/domain`;

- introduce seed logic into `@zyppi/runtime`;

- materialize production seed content;

- broaden the implementation beyond this specification without a new Chair decision.

## 21. Implementation Readiness Verdict

### VERDICT

**`OUTCOME B — IMPLEMENTATION CONTRACT CONSOLIDATED; MECHANICS MAY PROCEED ONLY AFTER FINAL COUNCIL RATIFICATION AND ISSUANCE OF A SEPARATE IMPLEMENTATION MANDATE; PRODUCTION SEED CONTENT REMAINS NOT RATIFIED`**

### Basis

This consolidated specification:

- preserves the binding constitutional rulings of `AMS-0504-CDR`;

- operationalizes the reconciled findings of `AMS-0504-PREP`;

- incorporates `AMS-0504-IS-A01` in full;

- resolves the Council findings and technical corrections through the Chair’s consolidation decisions;

- defines the strict JSON boundary;

- defines the singular verification sequence;

- defines the corrected signature boundary;

- defines the structured immutable trust set;

- defines the bounded transaction timeout;

- defines the canonical fixture path; and

- defines the closed eight-outcome contract.

No production Registry seed content is authorized by this verdict.

### Implementation Authorization Remains Withheld

The implementation mandate to Jules shall not be issued until this consolidated specification:

1. completes one final Council ratification review; and

2. is ratified as the implementation authority.

## 22. Chair Ratification Clause

Upon final Council ratification:

- This document becomes the binding technical implementation contract for AMS-0504 and the sole implementation authority;

- the implementation agent shall implement only the mechanics defined herein, without interpretation or technical invention;

- any conflict with a higher constitutional authority shall halt implementation and be escalated;

- any required deviation from this specification shall require a documented Chair amendment;

- production seed content shall remain prohibited pending separate Council authorization.

**End of `AMS-0504-IS — Registry Seed System Implementation Specification — Final Consolidated`**
