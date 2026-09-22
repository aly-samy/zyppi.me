# M06-PLAN — GS1 Digital Link Resolution Constitutional Plan

Field

Value

**Document ID**

`M06-PLAN`

**Title**

GS1 Digital Link Resolution Constitutional Plan

**Program**

`CAW-011 — Commerce Atlas Wedge`

**Milestone**

`M06 — GS1 Digital Link Resolution`

**Revision**

`v0.1 — First Draft for Roundtable Review`

**Status**

`DRAFT — ROUND TABLE REVIEW`

**Authority**

Zyppi Constitutional Council

**Implementation Authority**

`NONE`

**Predecessor Authorities**

`CAW-003`, `CAW-008`, `CAW-011`, `M05-PLAN`, `M06-ADR`, `CCR-06-01`, `CRR-06-01`, `G-06-03`

**Repository Evidence**

`JRM-06-03 — Repository Evidence Package for G-06-03`

**Downstream Artifact**

`AMS-0601 — M06 Implementation Mandate`

**Date**

August 5, 2026

# 1. Purpose

M06 establishes the constitutional plan for resolving a supported GS1 Digital Link input into a Zyppi Registry result.

The milestone shall provide a deterministic resolution path that:

1. accepts a supported GS1 Digital Link input;

2. interprets the supported GS1 identifier content;

3. validates the applicable identifier structure;

4. derives the ratified M05/M06 registry key;

5. invokes the existing M05 Registry boundary using that key;

6. returns a typed and attributable resolution result;

7. preserves the constitutional separation between external carrier syntax, internal identity representation, Registry persistence, and Runtime execution.

M06 is a **resolution and interpretation milestone**. It does not redefine Identity, alter the Registry’s constitutional role, create a new identity model, or authorize instance-level identity.

# 2. Constitutional Position

## 2.1 M06 in the Commerce Atlas Wedge

M06 sits between an external GS1 Digital Link carrier and the M05 Registry.

Its constitutional responsibility is:

Interpret a supported external GS1 carrier representation and derive the ratified internal registry-key representation without transferring GS1 parsing or normalization responsibilities into M05.

The intended conceptual flow is:
`Supported GS1 Digital Link Input                 │                 ▼ M06 Pure Interpretation Layer                 │                 ├── Parse supported carrier structure                 ├── Extract supported GS1 identifier                 ├── Validate identifier                 ├── Normalize to the K1 registry-key contract                 └── Preserve supported qualifiers as interpretation context                 │                 ▼ ValidatedCanonicalIdentifier                 │                 ▼ M05 RegistryRepository.lookup(...)                 │                 ▼ Typed Registry Resolution Result `
M06 shall not bypass the Registry, query Registry storage directly, or duplicate M05 retrieval logic.

## 2.2 External Carrier Syntax and Internal Registry Identity

The GS1 Digital Link URI is an **external carrier syntax**.

The M05/M06 registry key is a **Zyppi internal representation contract**.

These concepts shall remain distinct.

The presence of a GTIN within a Digital Link URI does not make the complete URI the Zyppi Registry identity. M06 shall interpret the supported carrier and derive the internal registry key before invoking M05.

M06 shall not require M05 to:

- parse a GS1 Digital Link URI;

- extract Application Identifiers;

- validate GS1 syntax;

- strip URI components;

- normalize GTIN lengths;

- interpret qualifiers;

- perform GS1-specific canonicalization.

# 3. Scope

## 3.1 In Scope

M06 shall plan for:

1. supported GS1 Digital Link input interpretation;

2. extraction of the primary GTIN identifier;

3. GTIN structural validation;

4. modulo-10 validation according to the ratified M06 support profile;

5. deterministic normalization to the K1 registry-key representation;

6. supported qualifier interpretation;

7. separation of resolution key from qualifier context;

8. invocation of the existing `RegistryRepository` boundary;

9. typed resolution outcomes;

10. deterministic failure classification;

11. pure interpretation behavior;

12. independently authored implementation tests;

13. architectural and constitutional verification.

## 3.2 Explicitly Out of Scope

M06 shall not:

1. modify the M05 Registry schema solely to implement GS1 parsing;

2. move GS1 parsing or normalization into the M05 adapter;

3. redefine `Identity`;

4. create a new Registry identity type;

5. implement instance-level identity;

6. treat a serial number, lot/batch number, or expiration date as part of the M05 registry key;

7. persist qualifiers in the current M05 `canonical_reference` field;

8. authorize new qualifier storage in M05;

9. introduce a general GS1 Application Identifier engine;

10. implement unsupported GS1 carrier forms;

11. perform network resolution against external GS1 services;

12. import GS1 normative text into production source;

13. import external GS1 conformance fixtures without the required rights clearance;

14. authorize `AMS-0601`;

15. ratify production seed content.

# 4. Governing Decisions

## M06-D01 — Resolution Boundary

M06 shall be the constitutional interpretation and resolution boundary between supported GS1 Digital Link input and the M05 Registry.

M06 shall consume external carrier syntax and produce a Zyppi registry-key value suitable for M05 lookup.

M05 shall remain independent of GS1 carrier syntax.

## M06-D02 — Narrow GTIN Identity Model

The primary identifier handled by the M06 wedge shall remain a narrow GTIN value object.

M06 shall not expand the primary identifier model into a general container for arbitrary Application Identifiers, URI components, or instance-level qualifier combinations.

The GTIN is the identity-bearing component used by this wedge for product-class resolution.

## M06-D03 — Qualifiers Are Not Registry-Key Components

Supported qualifiers may be interpreted as contextual information associated with the incoming carrier.

Qualifiers shall not be incorporated into the M05/M06 registry key.

For the M06 wedge:

- GTIN determines the registry lookup key;

- serial, lot/batch, and expiration information do not alter that key;

- two supported inputs containing the same GTIN shall derive the same M05 registry key even when their qualifiers differ.

This decision does not create an instance-level identity model.

## M06-D04 — K1 Registry-Key Contract

The M05/M06 registry-key representation shall be:

**A normalized, exactly 14-digit GTIN string.**

The representation shall:

1. contain exactly fourteen ASCII decimal digits;

2. preserve leading zeroes;

3. contain no prefix;

4. contain no URI syntax;

5. contain no Application Identifier notation;

6. contain no qualifier information;

7. contain no whitespace;

8. be validated before Registry lookup.

Examples:

Input GTIN form

Registry-key representation

GTIN-8

Left-padded to 14 digits after validation

GTIN-12

Left-padded to 14 digits after validation

GTIN-13

Left-padded to 14 digits after validation

GTIN-14

Preserved as the 14-digit representation after validation

The exact implementation sequence shall be defined so that validation and normalization remain deterministic and unambiguous.

## M06-D05 — Normalization Location

GTIN normalization shall occur exclusively within M06’s pure interpretation layer.

Normalization shall occur before M05 lookup.

No normalization shall be added to:

- `PostgresRegistryRepository`;

- the M05 persistence adapter;

- M05 storage queries;

- `createValidatedCanonicalIdentifier`;

- database triggers or implicit database coercion.

The M05 lookup boundary shall receive an already-normalized and validated registry-key value.

## M06-D06 — M05 Lookup Preservation

M05 strict-equality lookup shall remain unchanged.

M06 shall invoke the Registry through the established repository contract.

M06 shall not:

- construct direct SQL queries;

- access the `identities` table directly;

- duplicate Registry retrieval behavior;

- introduce GS1-specific matching logic into M05.

The Registry remains responsible for Registry retrieval and constitutional-state assembly. M06 remains responsible for external interpretation and registry-key derivation.

## M06-D07 — Product-Class Resolution

The M06 wedge shall resolve product-class identity at the GTIN level.

A successful Registry lookup may return the constitutional Registry view associated with the normalized GTIN.

M06 shall not infer:

- a unique physical product instance;

- ownership of a specific serialized item;

- current inventory state;

- product authenticity;

- supply-chain custody;

- batch validity;

- expiration suitability;

- regulatory compliance.

Those concerns are outside the current M06 wedge unless separately authorized.

## M06-D08 — Qualifier Preservation Boundary

The current M05 Registry does not provide a qualifier persistence channel.

Therefore:

1. M06 shall not claim that qualifiers are preserved by M05;

2. qualifier information, if represented by the M06 interpretation result, shall remain outside the current M05 registry-key field;

3. the exact M06 interpretation-context model shall be defined during implementation planning;

4. no qualifier persistence mechanism is authorized by this plan;

5. no future instance-level capability is implied or pre-authorized.

The plan may require the implementation design to distinguish:

- **resolution key** — the normalized GTIN used for M05 lookup;

- **interpreted context** — supported qualifier information associated with the input;

- **Registry result** — the result returned by M05.

These shall remain separate concepts.

## M06-D09 — Pure Interpretation

The M06 interpretation layer shall be:

- deterministic;

- synchronous;

- side-effect free;

- network independent;

- storage independent;

- Runtime independent;

- reproducible from its explicit input.

The interpretation layer shall not:

- call external GS1 services;

- access PostgreSQL;

- read the Registry;

- inspect system time unless an explicitly authorized date interpretation requires it;

- mutate input values;

- perform hidden normalization.

Any temporal behavior required for supported date interpretation shall be explicitly specified and separately tested.

## M06-D10 — Deterministic Interpretation Contract

For identical supported inputs and the same ratified support profile, M06 interpretation shall produce identical outputs.

The interpretation result shall be determined only by:

1. the input carrier;

2. the pinned M06 support profile;

3. the ratified identifier-validation rules;

4. the ratified normalization contract.

No external network state, Registry state, model inference, or non-deterministic process may alter the interpretation result.

## M06-D11 — Cross-Milestone Contract

The K1 representation is a binding cross-milestone contract between M06 and M05.

M06 shall produce the exact normalized 14-digit GTIN representation.

M05 shall continue to perform strict equality lookup against the same representation.

Future ratified M05 seed content shall use the same representation.

Existing mixed-format test values and non-production fixtures shall be aligned when implementation is authorized.

The contract does not itself ratify any existing seed content.

## M06-D12 — Registry-Key Uniqueness Invariant

The normalized K1 registry key shall identify at most one **active** M05 identity record at a given constitutional state.

The invariant is:

A normalized 14-digit GTIN shall not resolve simultaneously to more than one active M05 identity record.

This is an identity-resolution invariant, not a mandate for a particular database mechanism.

The implementation mechanism shall be selected under the appropriate schema and migration authority.

Permitted implementation mechanisms may include:

- database constraints;

- partial uniqueness constraints;

- Registry-level validation;

- another constitutionally approved enforcement mechanism.

No mechanism is selected by this plan.

Historical, decommissioned, retired, or otherwise inactive identity records are not automatically prohibited from sharing a registry key. Their lifecycle semantics must be governed explicitly rather than assumed from the active-resolution invariant.

# 5. M06 Support Profile

## 5.1 Primary Identifier

The M06 wedge supports GTIN as the primary identity-bearing identifier.

Supported structural GTIN forms shall be limited to:

- GTIN-8;

- GTIN-12;

- GTIN-13;

- GTIN-14.

All accepted forms shall be normalized to the K1 representation before Registry lookup.

## 5.2 Supported Application Identifiers

The implementation design shall support only the Application Identifiers authorized by the ratified M06 profile.

The current planning profile recognizes:

AI

Meaning

M06 role

`01`

GTIN

Primary identity-bearing identifier and registry-key source

`10`

Batch/Lot

Optional interpretation context; not part of registry key

`17`

Expiration date

Optional interpretation context; not part of registry key

`21`

Serial number

Optional interpretation context; not part of registry key

No other Application Identifier is implicitly supported.

An unrecognized Application Identifier shall not be silently accepted, ignored, or reclassified.

Its handling shall be explicitly defined as either:

- unsupported input; or

- a future profile extension.

## 5.3 GTIN Validation

M06 shall validate the GTIN using the ratified modulo-10 rule.

The operative calculation shall be right-anchored:

The rightmost data digit immediately preceding the check digit receives factor `3`, with factors alternating leftward between `3` and `1`.

The implementation shall not depend on ambiguous left-to-right table alignment.

Validation shall occur without numeric conversion that could remove leading zeroes.

GTIN values shall remain strings throughout interpretation and normalization.

## 5.4 GTIN Normalization

After successful structural and check-digit validation:

- GTIN-8 shall be left-padded with six zeroes;

- GTIN-12 shall be left-padded with two zeroes;

- GTIN-13 shall be left-padded with one zero;

- GTIN-14 shall remain unchanged.

The resulting value shall be exactly fourteen digits.

No other padding, truncation, coercion, or inferred correction is permitted.

Malformed input shall fail rather than being repaired.

## 5.5 AI 17 Expiration-Date Profile

AI 17 shall be interpreted as a supported qualifier context when present.

The implementation design shall distinguish:

1. structural validity of the `YYMMDD` representation;

2. calendar validity;

3. the semantic treatment of day `00`;

4. any sector-specific restriction applicable to the M06 support profile;

5. century determination.

The plan shall not silently invent a century-resolution algorithm where the governing evidence is incomplete.

If century determination is required by the implementation design, the design shall use an explicitly ratified rule or obtain additional authoritative evidence before implementation is authorized.

Day `00` shall not be silently converted without the governing support-profile decision being represented explicitly.

## 5.6 Unsupported and Malformed Inputs

M06 shall reject inputs that are:

- structurally malformed;

- missing the required GTIN;

- inconsistent with the supported carrier profile;

- invalid under the GTIN check-digit rule;

- incompatible with the supported Application Identifier profile;

- ambiguous under the defined interpretation rules;

- dependent on an unratified semantic assumption.

M06 shall not silently:

- discard malformed identifier content;

- correct invalid check digits;

- guess missing digits;

- infer omitted Application Identifiers;

- reinterpret unsupported carrier syntax;

- strip qualifiers to make an otherwise invalid input appear valid.

# 6. Required Architectural Model

The implementation specification shall define the following conceptual types or their constitutionally equivalent forms.

## 6.1 Input Carrier

Represents the original supported GS1 Digital Link input.

The original input shall remain distinguishable from the derived registry key.

## 6.2 Interpreted Identifier

Represents the validated GTIN before or during normalization.

The model shall preserve the identifier as a string and shall not permit loss of leading zeroes.

## 6.3 Normalized Registry Key

Represents the exact K1 contract:
`NormalizedGTIN14 = string of exactly 14 decimal digits `
The value passed to `RegistryRepository.lookup(...)` shall satisfy this contract.

## 6.4 Qualifier Context

Represents supported qualifier information interpreted from the input.

Qualifier context shall be distinct from:

- the registry key;

- the M05 identity record;

- the Registry result;

- instance-level identity.

The implementation specification shall determine whether qualifier context is:

- returned to the caller;

- retained only within the interpretation result;

- passed through an application-level response model.

This plan does not authorize persistence.

## 6.5 Resolution Result

The M06 result model shall distinguish at least:

1. successful interpretation and successful Registry resolution;

2. successful interpretation with no Registry match;

3. invalid or unsupported GS1 input;

4. Registry failure;

5. incomplete or constitutionally invalid Registry state.

These categories shall not be collapsed into one generic failure.

# 7. Resolution Outcome Semantics

## 7.1 Resolved

A result is `RESOLVED` when:

1. the input is valid under the M06 support profile;

2. the GTIN is successfully normalized to K1;

3. M05 lookup succeeds;

4. M05 returns a complete and valid Registry result.

The response may include:

- the normalized registry key;

- the interpreted qualifier context;

- the Registry result;

- attributable resolution metadata.

## 7.2 Not Found

A result is `NOT_FOUND` when:

1. interpretation succeeds;

2. normalization succeeds;

3. M05 lookup succeeds;

4. no Registry identity is found for the normalized key.

`NOT_FOUND` is not an invalid GS1 input.

`NOT_FOUND` is not a Registry infrastructure failure.

## 7.3 Invalid Input

A result is `INVALID_INPUT` when the input cannot be interpreted under the supported M06 profile.

Examples include:

- malformed carrier structure;

- missing GTIN;

- invalid GTIN length;

- invalid GTIN check digit;

- unsupported Application Identifier;

- invalid qualifier structure;

- unsupported semantic condition.

The result shall identify the failure category without exposing unnecessary implementation details.

## 7.4 Registry Failure

A result is `REGISTRY_FAILURE` when M06 successfully derives the registry key but M05 cannot complete the lookup because of a Registry or storage failure.

M06 shall not convert this outcome into `NOT_FOUND`.

## 7.5 Incomplete Constitutional State

A result is `INCOMPLETE_CONSTITUTIONAL_STATE` when M05 reports that the identity exists but the associated Registry state is incomplete or invalid.

M06 shall preserve this distinction.

M06 shall not reconstruct, repair, or supplement the Registry state.

# 8. Dependency and Layering Rules

## 8.1 Permitted Dependency Direction

The intended dependency direction is:
`M06 Interpretation         │         ▼ M05 Registry Contract         │         ▼ M05 Registry Implementation `
M05 shall not depend on M06.

The Domain layer shall not depend on:

- API transport;

- PostgreSQL;

- external GS1 services;

- Runtime execution.

## 8.2 Prohibited Dependency Patterns

The implementation shall not:

- import PostgreSQL concerns into the M06 pure interpretation layer;

- import API request objects into the Domain interpretation model;

- make M05 aware of GS1 URI syntax;

- make Registry persistence responsible for GTIN normalization;

- introduce a reverse dependency from M05 into M06;

- embed external standards documents in executable source;

- use external network services as part of deterministic interpretation.

# 9. Data and Persistence Rules

## 9.1 M05 Storage

M05 storage remains responsible for storing and retrieving Registry identity records.

M06 shall not introduce GS1-specific persistence behavior into M05.

## 9.2 Canonical Reference Representation

Future ratified M05 seed content used by the M06 wedge shall store the normalized 14-digit GTIN representation.

Examples of values that shall not be used as the M06 registry key:
`gtin:00012345 https://id.gs1.org/01/09780201379626 01/09780201379626 urn:zyppi:ident:gs1:01:09780201379626 `
The exact K1 representation is:
`09780201379626 `
where the value is a validated, normalized fourteen-digit GTIN.

## 9.3 Existing Mixed Test Values

The repository currently contains mixed reference representations.

Implementation authorization shall include alignment of affected test and fixture values with the ratified K1 contract.

This alignment shall:

- not ratify production seed content;

- not import external GS1 fixtures;

- not alter the constitutional meaning of unrelated tests;

- preserve the distinction between test-only values and ratified Registry content.

# 10. Testing and Evidence Rules

## 10.1 Independent Test Authoring

M06 tests shall be independently authored from the ratified support profile and implementation contract.

Tests may include independently created examples covering:

- valid GTIN-8 normalization;

- valid GTIN-12 normalization;

- valid GTIN-13 normalization;

- valid GTIN-14 preservation;

- valid modulo-10 cases;

- invalid check digits;

- leading-zero preservation;

- supported qualifier extraction;

- qualifier exclusion from the registry key;

- malformed carrier inputs;

- unsupported Application Identifiers;

- Registry `NOT_FOUND`;

- Registry failure;

- incomplete Registry state.

## 10.2 External Fixture Restriction

Until the required legal and rights review is complete, implementation work shall not:

- copy external GS1 conformance fixtures into the repository;

- import external GS1 test-suite content;

- reproduce normative GS1 text in source or tests beyond what is explicitly authorized;

- treat public web availability as permission to copy.

The restriction does not prohibit independently authored tests.

## 10.3 Required Test Properties

The implementation test suite shall establish:

### Determinism

Identical supported input shall produce identical interpretation output.

### Purity

Interpretation shall perform no network, database, filesystem, clock, or hidden-state access.

### Normalization

All supported GTIN lengths shall derive the exact K1 representation.

### Leading-Zero Preservation

No accepted GTIN shall lose leading zeroes.

### Key Separation

Qualifiers shall not alter the normalized registry key.

### M05 Boundary Preservation

M05 shall receive only the normalized registry-key representation.

### Outcome Separation

Invalid input, not found, Registry failure, and incomplete constitutional state shall remain distinguishable.

# 11. Security and Reliability Requirements

M06 shall:

1. treat all external input as untrusted;

2. reject malformed carrier syntax deterministically;

3. avoid uncontrolled parsing complexity;

4. impose explicit input-size and structural limits during implementation design;

5. avoid external network dependencies during interpretation;

6. avoid leaking internal Registry details through invalid-input responses;

7. preserve typed error categories;

8. avoid hidden fallback behavior.

The implementation design shall include adversarial cases for:

- malformed percent encoding;

- repeated or conflicting supported Application Identifiers;

- ambiguous path structures;

- unexpected query or fragment components;

- duplicate qualifiers;

- invalid character encodings;

- oversized inputs;

- valid-looking identifiers with invalid check digits.

The exact accepted Digital Link syntax profile shall be specified before implementation.

# 12. Non-Goals and Deferred Decisions

The following remain deferred:

1. instance-level identity;

2. GTIN-plus-serial Registry identity;

3. qualifier persistence;

4. lot-level Registry resolution;

5. expiration-based authorization or business decisions;

6. external GS1 network resolution;

7. support for Application Identifiers outside the approved profile;

8. generalized GS1 parsing;

9. Registry schema enforcement mechanism for active-key uniqueness;

10. lifecycle rules for historical reuse of external identifiers;

11. production seed ratification;

12. external GS1 fixture import.

No deferred item may be implemented by implication.

Each requires an attributable future decision.

# 13. Implementation Deliverable Requirements

Before `AMS-0601` may be issued, this plan shall be reviewed and its open decision register resolved.

If implementation is authorized, `AMS-0601` shall define:

1. exact module and package placement;

2. exact input and output types;

3. exact supported Digital Link syntax profile;

4. exact Application Identifier parsing behavior;

5. exact GTIN validation sequence;

6. exact normalization sequence;

7. exact qualifier-context model;

8. exact error taxonomy;

9. exact Registry invocation path;

10. exact test matrix;

11. exact dependency constraints;

12. exact repository files authorized for modification;

13. exact migration authority, if any;

14. exact uniqueness-enforcement mechanism, if selected.

`AMS-0601` shall not reopen the K1 contract unless a new Council decision explicitly authorizes reconsideration.

# 14. Roundtable Review Questions

The following questions require explicit review before ratification.

## RT-01 — Digital Link Syntax Boundary

What exact GS1 Digital Link URI forms are accepted by the M06 wedge?

The final plan must determine:

- permitted scheme or schemes;

- permitted host behavior;

- path-only versus absolute URI support;

- treatment of query parameters;

- treatment of fragments;

- percent-encoding requirements;

- duplicate Application Identifier behavior.

## RT-02 — AI 17 Day `00`

What exact M06 support-profile policy applies to AI 17 day `00`?

The final decision must distinguish:

- structural acceptance;

- semantic interpretation;

- sector-specific restrictions;

- calendar conversion behavior;

- whether the wedge returns raw structural context or a resolved calendar date.

## RT-03 — Century Determination

Does the initial M06 wedge need to convert AI 17 `YYMMDD` into a full calendar date?

If yes, the governing century-determination rule must be explicitly established before implementation.

If no, the implementation may preserve the structural value without claiming a fully resolved century.

## RT-04 — Qualifier Output

Should supported qualifiers be returned to the M06 caller as:

1. raw interpreted strings;

2. typed structured values;

3. both raw and typed representations;

4. internal interpretation metadata only?

The decision shall not authorize persistence.

## RT-05 — Active-Key Uniqueness Enforcement

What mechanism shall enforce the invariant that one normalized GTIN resolves to at most one active M05 identity?

Possible mechanisms include:

- database-level partial uniqueness;

- Registry-level validation;

- another approved enforcement mechanism.

The mechanism shall be selected under the proper schema authority.

## RT-06 — Unsupported Application Identifiers

Should the presence of an otherwise valid but unsupported Application Identifier:

1. invalidate the complete input;

2. be rejected only when required for interpretation;

3. be preserved as unsupported context;

4. be handled by a future profile extension?

The final rule shall be deterministic.

## RT-07 — Carrier Canonicalization

Does M06 require canonicalization of the external Digital Link URI itself?

The preliminary position is:

No carrier canonicalization is required for Registry lookup because M06 derives K1 from the interpreted GTIN rather than using the complete URI as the Registry key.

The final plan must confirm whether limited carrier normalization is nevertheless required to parse equivalent supported forms consistently.

# 15. Acceptance Criteria

M06-PLAN may proceed to ratification only when the Council confirms that:

- [ ] M06’s responsibility is clearly separated from M05;

- [ ] K1 is stated as the exact cross-milestone registry-key contract;

- [ ] normalization is located exclusively in M06’s pure interpretation layer;

- [ ] M05 strict-equality lookup remains unchanged;

- [ ] the GTIN support profile is explicit;

- [ ] the modulo-10 rule is unambiguous;

- [ ] leading-zero behavior is explicit;

- [ ] supported qualifiers are distinguished from the registry key;

- [ ] qualifier persistence is not implied;

- [ ] instance-level identity is not implied;

- [ ] resolution outcomes are typed and non-collapsing;

- [ ] Registry failure is distinct from `NOT_FOUND`;

- [ ] incomplete constitutional state is preserved as a distinct outcome;

- [ ] unsupported Application Identifier behavior is decided;

- [ ] AI 17 day `00` policy is decided;

- [ ] century determination is either specified or explicitly excluded;

- [ ] external fixture restrictions are preserved;

- [ ] independently authored testing is authorized;

- [ ] the active-key uniqueness invariant is accepted;

- [ ] the enforcement mechanism is assigned to the appropriate authority;

- [ ] no implementation authority is granted by the plan itself.

# 16. Downstream Authorization State

`CRR-06-01 Research and support-profile baseline         │         ▼ G-06-03 K1 registry-key contract         │         ▼ M06-PLAN v0.1 DRAFT — ROUND TABLE REVIEW         │         ├── Roundtable review         ├── Open decisions resolved         ├── Council revision         └── Ratification         │         ▼ AMS-0601 NOT AUTHORIZED         │         ▼ M06 implementation NOT AUTHORIZED `
This draft authorizes no code, no repository modification, no schema migration, no production seed content, and no implementation work.

# 17. Draft Status

**Status:** `DRAFT — ROUND TABLE REVIEW`

This document is a constitutional planning draft.

It does not:

- authorize implementation;

- issue `AMS-0601`;

- modify M05;

- ratify seed data;

- select a database uniqueness mechanism;

- authorize external GS1 fixture import;

- create instance-level identity;

- establish qualifier persistence.

The Council shall review the draft, resolve the Roundtable Review Questions, revise the plan where required, and determine whether the document is ready for ratification.

**End of M06-PLAN v0.1**
