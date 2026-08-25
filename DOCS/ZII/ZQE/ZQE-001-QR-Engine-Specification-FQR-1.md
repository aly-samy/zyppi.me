# ZQE-001 — QR Engine Specification / FQR-1

**Version:** `1.0`
**Status:** `RATIFIED`
**Lifecycle:** `ACTIVE`
**Program:** `ZII — Zyppi Interaction Infrastructure`
**Engine:** `ZQE — Zyppi QR Engine`
**Authority Class:** `Engine Specification / Technical Profile Contract`
**Higher Authority:** `Zyppi Constitution · CEngS · ZII-001 v1.0`
**Depends On:** `ZII-000 v1.0 · ZII-001 v1.0`
**Roadmap Source:** `ZQE-PLAN v0.2 — RATIFIED · ACTIVE`
**Engineering Companion:** `ZQE QR Engineering Manual v0.4 — Standard-Readiness Corrective Edition`
**Standard-Readiness Evidence:** `ZQE-M00-SRR v1.0 — CLOSED · PASS`
**Normative External Standard:** `ISO/IEC 18004:2024 — QR Code bar code symbology specification, Edition 4`
**Supersedes:** `ZQE-001 v0.1–v0.3 candidate drafts`
**Repository:** `aly-samy/zyppi.me`
**Implementation Authority:** `NONE — canonical implementation requires bounded AMS authority and lawful package admission`
**Effective Date:** `25 August 2026`

---

# 1. Purpose

ZQE-001 defines the authoritative technical boundary and first bounded profile of the Zyppi QR Engine.

It answers:

> **What must ZQE accept, what must it produce, what deterministic behavior is frozen for FQR-1, what must it never infer, and what evidence is required before the first ZQE QR may be accepted?**

ZQE-001 is intentionally smaller than the engineering manual.

**v1.0 ratification basis:** incorporates the accepted Standard-Readiness Review correction to mask-candidate scoring order and freezes the resulting FQR-1 authority. It does not broaden FQR-1.

The engineering manual explains **how to implement** the required QR mechanics.

ZQE-001 defines **what the implementation is allowed and required to mean**.

If the engineering manual conflicts with this specification, this specification governs.

If this specification conflicts with higher Zyppi authority, the higher authority governs.

If a future direct full-2024 normative audit identifies a contradiction, this specification SHALL be amended before any stronger direct ISO-conformance claim is made.

---

# 2. Scope

This version governs only the first ZQE vertical slice:

> **FQR-1 — First Real-World Interoperable ZQE QR**

FQR-1 is a deliberately fixed QR Code Model 2 encoder profile.

This document does not define the complete future ZQE feature set.

---

# 3. ZQE Authority Boundary

ZQE is technical interaction infrastructure.

For QR, ZQE owns:

- QR encoding mechanics;
- the native `QrSymbol` technical artifact;
- QR-specific deterministic profile choices;
- QR renderer boundaries;
- technical conformance;
- QR interoperability evidence;
- QR implementation diagnostics.

ZQE does not own:

- Reality;
- Identity;
- Referents;
- Events;
- Evidence in the constitutional sense;
- Trust;
- Policy;
- authorization;
- constitutional Capability;
- Runtime execution;
- GS1 semantics;
- Digital Link validation;
- Trade Item meaning;
- zTOUCH meaning;
- ZPI meaning.

The governing rule is:

> **ZQE may encode bytes that carry meaning. ZQE SHALL NOT decide what those bytes mean.**

---

# 4. Mechanism / Meaning Invariant

A supplied payload may contain:

- a URL;
- a GS1 Digital Link;
- JSON;
- arbitrary binary material;
- application-specific bytes;
- future Zyppi addressing material.

ZQE treats the payload as caller-supplied technical data.

For example:

```text
https://id.gs1.org/01/09520123456788
```

is, to `qr-core`, only a byte sequence.

ZQE SHALL NOT infer from it:

- GTIN validity;
- GS1 conformance;
- Product Identity;
- Trade Item existence;
- ownership;
- authenticity;
- safety;
- authorization;
- trust;
- evidence;
- physical presence.

---

# 5. Engine Composition

The initial ZQE composition is:

```text
Byte Sequence
    ↓
@zyppi/qr-core
    ↓
QrSymbol
    ↓
@zyppi/qr-svg
    ↓
Canonical SVG
```

The compiler and renderer are separate technical responsibilities.

`qr-svg` SHALL consume `QrSymbol`.

It SHALL NOT reconstruct QR encoding semantics.

---

# 6. API-Ready / API-Unaware Rule

ZQE SHALL expose a clean public technical boundary that can later be called by:

- application services;
- REST adapters;
- SDK adapters;
- MCP adapters;
- tests;
- future domain surfaces.

ZQE SHALL NOT depend upon those public-interface technologies.

The dependency direction is:

```text
REST / SDK / MCP / Application
            ↓
           ZQE
```

never:

```text
ZQE
 ↓
REST / SDK / MCP
```

FQR-1 does not authorize a public QR API endpoint.

---

# 7. Core Input Contract

The canonical semantic input to the compiler is:

> **an explicit finite byte sequence plus an explicit ZQE profile**

The core engine SHALL NOT accept a text string and silently choose a character encoding.

For the TypeScript reference implementation, the expected byte container is conceptually:

```ts
Uint8Array;
```

The implementation SHALL prevent caller mutation from altering an active or completed compilation.

The exact copying/storage technique is implementation-defined provided the ownership and determinism invariants hold.

---

# 8. FQR Technical Profile

The first bounded profile identifier is:

```text
zqe/fqr1
```

`zqe/fqr1` is an FQR milestone profile.

It does **not** reserve or define a future stable `zqe/1` profile.

The candidate FQR profile is:

| Property                    | Value                          |
| --------------------------- | ------------------------------ |
| Symbology                   | `QR Code Model 2`              |
| Normative Standard          | `ISO/IEC 18004:2024 Edition 4` |
| QR Version                  | `3`                            |
| Matrix Size                 | `29 × 29 modules`              |
| Error Correction            | `M`                            |
| Encoding Mode               | `Byte`                         |
| Maximum Payload             | `42 bytes`                     |
| Data Codewords              | `44`                           |
| ECC Codewords               | `26`                           |
| Total Codewords             | `70`                           |
| Error-Correction Blocks     | `1`                            |
| Remainder Bits              | `7`                            |
| Automatic Version Selection | `PROHIBITED`                   |
| Automatic Mode Selection    | `PROHIBITED`                   |
| Automatic ECC Selection     | `PROHIBITED`                   |

These standards-sensitive constants remain **candidate-frozen** in v0.1 until the M00 normative-verification receipt passes.

No implementer may silently alter them.

---

# 9. Capacity Behavior

For `zqe/fqr1`:

```text
0..42 input bytes
→ eligible for compilation
```

```text
43+ input bytes
→ deterministic failure
```

Overflow SHALL NOT cause:

- silent truncation;
- implicit Version 4 selection;
- implicit mode optimization;
- implicit compression;
- implicit ECC change.

The only valid FQR overflow behavior is explicit failure.

---

# 10. Compiler Operation

The engine shall provide one public compilation capability with semantics equivalent to:

```text
compileQr(
  explicit byte sequence,
  zqe/fqr1
)
→ QrSymbol | ZqeError
```

The exact TypeScript function signature may evolve during implementation provided the public semantics remain equivalent.

Compilation SHALL be:

- pure with respect to external state;
- deterministic;
- free of network access;
- free of database access;
- free of filesystem dependency;
- free of environment-derived behavior;
- free of system-time dependency;
- free of randomness;
- free of hidden mutable global state.

This purity does not make ZQE part of the Constitutional Runtime.

> **Purity ≠ Runtime membership.**

---

# 11. FQR Compilation Invariants

For every successful `zqe/fqr1` compilation:

1. the input is the exact caller-supplied byte sequence;
2. the profile is explicit;
3. the symbol is QR Code Model 2;
4. the symbol version is 3;
5. the symbol is 29×29 modules;
6. ECC is M;
7. Byte mode is used;
8. the encoder does not optimize or switch modes;
9. the encoder does not promote the QR version;
10. the encoder produces the complete FQR-required data/ECC structure;
11. all applicable QR data modules are assigned exactly once;
12. all eight QR masks are evaluated;
13. exactly one mask is selected deterministically;
14. format information is consistent with ECC M and the selected mask;
15. the returned artifact is a complete `QrSymbol`;
16. the returned artifact excludes renderer-owned quiet zone;
17. identical input bytes + identical profile produce identical `QrSymbol` semantics and module state.

---

# 12. Native Artifact — `QrSymbol`

`QrSymbol` is the native canonical technical artifact of ZQE compilation.

It is not:

- a PNG;
- an SVG;
- a URL;
- a GS1 representation;
- constitutional Reality;
- constitutional Evidence;
- an Execution Receipt.

The minimum public meaning of `QrSymbol` is:

```text
QrSymbol
├── model
├── version
├── size
├── error-correction level
├── selected mask
└── complete module state
```

For `zqe/fqr1`:

```text
model            = QR Code Model 2
version          = 3
size             = 29
error correction = M
mask             = integer 0..7
modules          = complete 29×29 light/dark state
```

---

# 13. QrSymbol Immutability

After successful compilation:

> **No supported public operation may mutate an existing `QrSymbol`.**

A consumer SHALL NOT receive a public mutable reference capable of changing the canonical module state.

This specification does not require one particular TypeScript mechanism.

Permitted implementation techniques include:

- defensive copying;
- private backing state;
- immutable accessors;
- read-only wrappers;
- another mechanism that proves the invariant.

## 13.1 Profile Provenance Is Not QrSymbol State

The generating Technical Engine Profile identifier (for FQR-1, `zqe/fqr1`) is **compilation provenance**, not intrinsic QR symbol state.

Therefore ZQE-001 does **not** require `profileId` to be embedded inside `QrSymbol`.

Two different future profiles could legitimately produce the same standards-valid QR matrix. That fact demonstrates that profile identity and symbol identity are different concerns.

The active profile identifier SHALL instead remain available through:

- the explicit compilation input/context;
- optional technical compilation diagnostics;
- the FQR evidence bundle.

A higher-level wrapper MAY carry `{ profileId, symbol }` where useful, but `QrSymbol` itself remains the native QR technical artifact.

---

# 14. Quiet-Zone Boundary

The QR quiet zone is not part of `QrSymbol`.

For FQR-1:

```text
QrSymbol
= exactly 29×29 QR modules
```

The reference renderer owns the presentation margin.

The canonical FQR renderer SHALL provide a four-module light quiet zone around the QR symbol.

Therefore the logical rendered grid is:

```text
29 + 4 + 4 = 37 modules
```

This separation prevents presentation geometry from contaminating the native QR artifact.

---

# 15. Canonical SVG Renderer Contract

The first ZQE renderer is a deterministic canonical SVG renderer.

Its architecture is:

```text
QrSymbol
    ↓
qr-svg
    ↓
SVG text / bytes
```

For identical:

- `QrSymbol`;
- renderer profile;
- renderer options;

the canonical renderer SHALL produce byte-identical output.

The FQR canonical renderer SHALL avoid accidental entropy including:

- timestamps;
- random identifiers;
- nondeterministic attribute ordering;
- environment-specific formatting;
- runtime-derived metadata;
- fractional module placement.

FQR canonical module geometry SHALL use integer coordinates.

Decorative QR behavior is outside this contract.

---

# 16. Renderer Non-Scope

The canonical FQR renderer SHALL NOT introduce:

- logos;
- gradients;
- rounded modules;
- frames;
- embedded artwork;
- random decoration;
- animated QR;
- visual transformations that alter the native QR module state.

Future styling layers may exist only under separate authority and conformance evidence.

---

# 17. Mask Selection Determinism

The implementation SHALL evaluate all eight applicable QR mask patterns.

The selected mask SHALL minimize the governed QR penalty score.

## 17.1 Tie Rule

Candidate ZQE deterministic choice:

> **If multiple masks have the identical minimum score, `zqe/fqr1` selects the numerically lowest mask ID.**

This rule is candidate-frozen in v0.1 and becomes final only after NVR confirms that the governing standard leaves such a deterministic implementation choice permissible.

No runtime entropy or implementation-order ambiguity may influence mask selection.

## 17.2 Candidate Scoring Order

For `zqe/fqr1`, mask evaluation SHALL follow the conservative standard-ready sequence:

1. apply one candidate data mask to the encoding/data region only;
2. keep Format Information cells reserved and unwritten for candidate scoring;
3. compute the governed penalty score for that candidate state;
4. repeat for all eight mask IDs;
5. select the minimum-score mask, applying Section 17.1 if tied;
6. only after mask selection, generate and write the final Format Information for ECC M + selected mask.

Therefore:

> **Candidate Format Information SHALL NOT be injected into the matrix before penalty scoring in `zqe/fqr1`.**

This rule follows the Standard-Readiness Review's conservative reading of the QR encoding sequence: data masking/selection precedes final Format and Version Information.

A future direct full-2024 normative audit may confirm or refine the rationale, but no implementation may reverse this order without an explicit ZQE-001 amendment.

---

# 18. Error Contract

Silent failure is prohibited.

Every public ZQE failure SHALL preserve:

- `code`;
- `reason`;
- `stage`;
- `reference`;
- `recovery`.

The FQR error stage vocabulary is bounded to:

```text
input_validation
data_encoding
ecc_generation
block_interleaving
matrix_construction
data_placement
mask_evaluation
format_generation
symbol_finalization
rendering
```

The exact TypeScript error class hierarchy is implementation-defined.

---

# 18.1 TypeScript Surface Guidance

The TypeScript reference surface SHOULD use `readonly` properties and read-only public views where they improve compile-time safety.

However:

> **TypeScript `readonly` is not, by itself, the proof of QrSymbol immutability.**

The governing invariant remains Section 13: no supported public operation or exposed mutable backing reference may alter an existing `QrSymbol`.

---

# 19. Minimum FQR Error Cases

At minimum, the implementation SHALL distinguish:

```text
QR_INVALID_INPUT
QR_PROFILE_UNSUPPORTED
QR_CAPACITY_EXCEEDED
QR_INTERNAL_INVARIANT
QR_RENDER_INVALID_SYMBOL
```

Example capacity error semantics:

```text
code:
QR_CAPACITY_EXCEEDED

reason:
Input contains <N> bytes; zqe/fqr1 supports at most 42 bytes.

stage:
input_validation

reference:
ZQE-001 / FQR capacity rule

recovery:
Provide 42 bytes or fewer, or use a future explicitly authorized profile.
```

Errors SHALL report byte length, not character count.

---

# 20. Fail-Closed Internal Invariants

The implementation SHALL stop rather than manufacture output when an internal QR invariant fails.

Examples include:

- generated data codeword count differs from 44;
- generated ECC count differs from 26;
- total codeword count differs from 70;
- matrix size differs from 29;
- function/data-region accounting is inconsistent;
- not all source codeword bits are consumed;
- the data-region size does not equal codeword bits plus remainder bits;
- selected mask falls outside 0..7;
- format information cannot be generated consistently.

Unexpected unassigned data modules SHALL NOT be silently filled as a recovery mechanism.

---

# 21. Engineering Companion

Detailed QR mathematics and TypeScript implementation mechanics live in:

> **ZQE QR Engineering Manual v0.4 — Standard-Readiness Corrective Edition**

The manual supplies implementation guidance for:

- bitstream construction;
- Byte-mode count handling;
- capacity padding;
- GF(256);
- Reed–Solomon;
- block structure;
- interleaving;
- function-pattern construction;
- alignment positioning;
- format/version BCH;
- data placement;
- remainder bits;
- all eight mask predicates;
- penalty scoring;
- immutable artifact design;
- SVG rendering;
- property tests;
- strict-verifier requirements.

The engineering manual is subordinate to ZQE-001 and is not independently constitutional or normative authority.

The manual itself states that the authorized ZQE specification and final normative-verification record override it if conflict appears.

---

# 22. FQR Acceptance Fixtures

The FQR acceptance corpus is cryptographically frozen here.

| Fixture | Payload                                       | Byte Length | Expected               | SHA-256                                                            |
| ------- | --------------------------------------------- | ----------: | ---------------------- | ------------------------------------------------------------------ |
| A       | `HELLO ZYPPI`                                 |          11 | SUCCESS                | `bd68ab3476a08c12c26492389e317096619c54a3fb7e61d13e1047ee2502e843` |
| B       | `https://id.gs1.org/01/09520123456788`        |          36 | SUCCESS                | `6eba966218ef0703cf47ee9079e4a3903bd315c4aa0c1544b5b64954ee5bccbd` |
| C       | `ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001`  |          42 | SUCCESS                | `50c21a65588849150446e953cf26a67ea7a80296ea15b944dbf2803df414eac6` |
| D       | `ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001X` |          43 | `QR_CAPACITY_EXCEEDED` | `a6104165e93c8dfb8ed375409a4dc31912c22e68aacfa999b350dbbe2139f93f` |
| E       | `ZYPPI-FQR1-INTERIOR-TEST-2026`               |          29 | SUCCESS                | `725860310bdc78b647e494537b54674af8794f04a5965b81dbe178432d88b7f4` |

The hash identifies the exact input byte sequence used by the fixture.

Fixture B SHALL remain opaque to ZQE.

Its presence does not authorize GS1 logic inside `qr-core`.
---

# 23. Testing Contract

FQR implementation SHALL satisfy the applicable CEngS testing requirements.

Required test classes include:

- static analysis;
- unit tests;
- property tests;
- boundary tests;
- negative controls;
- integration tests;
- deterministic repetition tests;
- strict structural verification;
- independent decoder interoperability;
- renderer determinism tests.

Property testing is mandatory for critical QR algorithms.

---

# 24. Required FQR Properties

At minimum:

```text
same input + same profile
→ same data codewords

same input + same profile
→ same ECC

same input + same profile
→ same selected mask

same input + same profile
→ same QrSymbol

same QrSymbol + same renderer profile
→ byte-identical SVG
```

For payload boundaries:

```text
0..42 bytes
→ compile eligibility
```

```text
43+ bytes
→ deterministic capacity failure
```

For successful generated inputs:

```text
independent_decode(
  render(
    compile(payload)
  )
)
=
original payload
```

---

# 25. Strict Structural Verification

External decoder success alone is insufficient.

FQR acceptance SHALL include a test-side strict verifier logically and implementation-wise independent from the production encoder.

The verifier SHALL NOT establish mask correctness merely by checking that:

```text
QrSymbol.mask
=
format-information mask identifier
```

That proves only internal self-consistency.

For FQR-1 the verifier SHALL independently verify, at minimum:

- QR Model 2 / Version 3 geometry;
- 29×29 dimensions;
- required finder/separator patterns;
- timing patterns;
- Version-3 alignment pattern;
- fixed dark module;
- format information validity and ECC/mask declaration;
- data traversal coverage;
- total extractable codeword count;
- Version-3 remainder-bit behavior;
- Reed–Solomon consistency for the extracted stream;
- **selected-mask optimality under the verified FQR scoring policy**.

## 25.1 Independent Mask-Optimality Proof

The strict verifier SHALL independently establish the selected mask as follows:

1. read the selected mask from the final symbol's valid format information;
2. reconstruct the unmasked data-module state by reversing that selected mask;
3. preserve the independently reconstructed function/reserved-module map;
4. construct each of the eight candidate masks independently;
5. keep Format Information cells reserved/unwritten during candidate scoring;
6. independently recompute all four QR penalty-rule contributions for every candidate;
7. determine the complete set of minimum-score mask IDs;
8. apply the active FQR tie rule;
9. require the resulting expected mask ID to equal the mask selected by the production encoder;
10. independently confirm that final Format Information is written only after selection and declares ECC M + the selected mask.

The strict verifier SHALL NOT call the production encoder's:

- mask predicate implementation;
- penalty-scoring implementation;
- mask-selection function;
- format-placement helper;

to prove this property.

Shared factual test fixtures are permitted; shared decision logic is not.

This closes a class of defect that ordinary decoders cannot detect: a QR symbol can be perfectly decodable while having been produced with an incorrect mask-selection algorithm.

The strict verifier is test infrastructure.

It is not a production ZQE decoder.
---

# 26. Independent Decoder Interoperability

FQR-1 SHALL prove that external decoder implementations can recover the original payload.

At least two independent environments are required for final FQR acceptance:

1. a ZXing-C++ family decoder path;
2. an Android mobile decoder path such as ML Kit.

These are verification dependencies.

They SHALL NOT become `qr-core` production dependencies.

## 26.1 Pristine Fixture Pass Criteria

Every valid frozen FQR fixture:

```text
A
B
C
E
```

SHALL round-trip successfully through **both** independent decoder environments in the pristine-image acceptance gate.

For each:

```text
decoded bytes
=
original frozen fixture bytes
```

exactly.

Fixture D SHALL fail before symbol construction with `QR_CAPACITY_EXCEEDED`.

Distortion/simulation pass matrices may use a separately frozen subset where justified by M06, but pristine interoperability has no subset exception.
---

# 27. Negative Controls

The verification system SHALL prove that failure can be detected.

Required negative controls:

## 27.1 Structural invalid control

A deliberately invalid matrix SHALL fail the strict structural verifier.

## 27.2 Non-QR image control

A frozen image containing no valid QR SHALL produce no valid QR result from the independent decoder harness.

Damaged but error-correctable QR symbols are not required to fail.

---

# 28. Physical / Simulated Acceptance Boundary

FQR-1 acceptance ultimately includes:

- pristine external decode;
- bounded deterministic scale tests;
- rotation tests;
- perspective tests;
- blur tests;
- brightness/contrast tests;
- resampling/compression tests;
- mobile decode;
- one bounded physical print-and-camera spot check.

The exact simulation severity parameters belong to the FQR acceptance harness and SHALL be frozen before M06 execution.

They are not part of `qr-core` semantics.

---

# 29. Repository Boundary

The intended packages are:

```text
packages/
├── qr-core/
└── qr-svg/
```

subject to lawful repository admission.

`qr-core` SHALL NOT have production dependencies on:

- CAW;
- GS1;
- domain;
- contracts merely for semantic convenience;
- Runtime;
- registry;
- persistence;
- database drivers;
- HTTP frameworks;
- networking;
- ZPI;
- zTOUCH.

Any external dependency requires normal CEngS justification.

The target for the first core remains:

> **no production workspace dependency unless proven necessary and explicitly authorized.**

---

# 30. Runtime Boundary

ZQE is not the Constitutional Runtime.

QR compilation does not:

- evaluate policy;
- verify constitutional Evidence;
- compute Trust;
- resolve authority;
- create an Execution Receipt;
- create Reality.

A technically valid QR Code proves only that a QR mechanism was constructed according to the applicable technical profile.

It does not prove the truth of the payload.

---

# 31. Technical Observation Boundary

Successfully compiling, rendering, scanning, or decoding a QR Code does not automatically create:

- a constitutional Event;
- constitutional Evidence;
- Trust;
- Identity;
- Reality admission.

Technical acquisition and constitutional admission remain separate concerns under higher authority.

ZQE SHALL NOT require a universal zTOUCH or Touch gate before performing its technical function.

---

# 32. FQR Non-Scope

FQR-1 explicitly does not require:

- automatic version selection;
- Versions 1–40 breadth;
- ECC L/Q/H;
- Numeric mode;
- Alphanumeric mode;
- Kanji mode;
- ECI;
- FNC1;
- Structured Append;
- optimal segmentation;
- mixed segmentation;
- production QR decoder;
- PNG production renderer;
- PDF renderer;
- branding;
- styling;
- printer integration;
- camera capture implementation;
- GS1 construction;
- GS1 parsing;
- GS1 validation;
- public REST endpoint;
- public SDK method;
- MCP tool;
- API authentication;
- rate limiting;
- billing;
- zQR;
- ZPI;
- zTOUCH;
- CAW integration;
- cross-language implementation.

None of these may silently enter the first implementation mandate.

---

# 33. Cross-Language Scope

FQR-1 determinism means:

> **same reference implementation + same explicit input + same explicit profile → same technical output**

FQR-1 does not require a second language implementation.

Future ZQE conformance may strengthen this requirement.

That future decision is not technical debt and is not pre-authorized by this document.

---

# 34. Diagnostics

ZQE MAY expose an optional technical compilation trace for:

- data codewords;
- ECC structure;
- block structure;
- mask scores;
- selected mask;
- format information;
- function-module map;
- deterministic debugging.

Such diagnostics are technical artifacts only.

They are not:

- constitutional reasoning;
- Evidence;
- Trust explanation;
- Execution Receipts.

Diagnostic behavior SHALL NOT alter compilation output.

---

# 35. FQR Evidence Bundle

FQR closure SHALL preserve technical evidence including:

- ZQE-001 version;
- engineering-manual version;
- active Technical Engine Profile identifier (`zqe/fqr1` for FQR-1);
- normative baseline identifier;
- implementation commit SHA;
- fixture identities;
- input byte hashes;
- selected mask per fixture;
- `QrSymbol` evidence where defined;
- SVG hashes;
- strict-verifier results;
- property-test results;
- independent-decoder results;
- mobile-decoder results;
- simulation-fixture identifiers;
- negative-control results;
- physical spot-check record;
- CI result.

The bundle is technical engineering evidence.

It is not automatically a constitutional Execution Receipt or EvidenceRecord.

---

# 36. Standard-Readiness Verification Register

The FQR standards-sensitive register is NVR-001 through NVR-011:

| NVR     | Subject                                                          |
| ------- | ---------------------------------------------------------------- |
| NVR-001 | ISO/IEC 18004:2024 Edition 4 is the intended normative baseline  |
| NVR-002 | Version 3 / ECC M block structure and capacities                 |
| NVR-003 | Byte-mode indicator and Version-3 character-count width          |
| NVR-004 | terminator, byte alignment and alternating pad-codeword behavior |
| NVR-005 | GF(256) and Reed–Solomon semantics                               |
| NVR-006 | Model-2 function-pattern geometry for Version 3                  |
| NVR-007 | Version-3 remainder-bit count                                    |
| NVR-008 | all eight mask predicates and tie-rule permissibility            |
| NVR-009 | penalty rules and candidate-format scoring compatibility         |
| NVR-010 | format-information BCH generation and placement                  |
| NVR-011 | four-module quiet-zone requirement                               |

The Chair accepted:

> **ZQE-M00-SRR v1.0 — CLOSED · PASS**

on `25 August 2026`.

That review resolved all eleven items for **standard-readiness**. One corrective finding was identified at NVR-009 and incorporated before this v1.0 ratification.

The ratified engineering claim is therefore limited to:

> **ZQE FQR-1 is engineered to be ISO/IEC 18004:2024 standard-ready.**

This ratification does **not** establish:

- ISO certification;
- formal third-party conformity certification;
- direct review of every applicable clause of the complete licensed ISO/IEC 18004:2024 publication;
- an unqualified claim of formally verified ISO/IEC 18004:2024 conformance.

## 36.1 Deferred Full Normative Audit

The following remains deliberately deferred:

```text
NVR-NORM-001
Direct full ISO/IEC 18004:2024 normative-source audit
```

The deferred audit is required before Zyppi makes an unqualified claim that FQR-1 has been directly verified against the complete applicable 2024 normative text.

If that audit identifies a discrepancy:

1. the discrepancy SHALL be recorded;
2. the affected ZQE rule SHALL be corrected through explicit amendment;
3. any incompatible implementation SHALL be corrected;
4. the stronger conformance claim SHALL remain prohibited until resolution.

The absence of the full audit does not revoke the present `STANDARD-READY` engineering status.

## 36.2 NVR Single-Home Rule

This section is the single authoritative ZQE-001 register of standards-sensitive FQR subjects.

The M00 closure record SHALL reference this register rather than maintain a competing numbered NVR list.

The accepted SRR is the evidence record for the current standard-readiness disposition.
---

# 37. CEngS Context-Loading Prerequisite

`CEngS-000` registers the required ZII/ZQE implementation route. Any canonical ZQE implementation AMS SHALL use that route or its ratified successor.

The intended loading pattern is:

```text
CEngS Core
+
ZII-001
+
relevant ACTIVE ZII authority
+
ZQE-001
+
exact implementation mandate
+
only the operational standards required for the task
```

CAW SHALL NOT be loaded merely because a QR payload happens to contain GS1-shaped data.

CAW is loaded only when the actual task crosses into CAW/domain behavior.

---

# 38. Repository Admission Prerequisite

Ratification of this specification does not itself create package-admission authority.

Canonical creation of:

```text
packages/qr-core
packages/qr-svg
```

remains subject to the repository-governance authority established by the RGT transition or its successor.

RGT does not own ZQE semantics.

ZQE does not own RGT.

---

# 39. M00 Relationship

This v1.0 specification is the ratified technical authority produced by:

> **ZQE-M00 — FQR Entry Freeze**

M00 closure requires confirmation that:

1. this specification is complete;
2. the complete NVR register defined by this ZQE-001 version is resolved;
3. any corrections from NVR are incorporated;
4. the ZII/ZQE context route exists in canonical CEngS navigation;
5. the final M00 closure record confirms that no standards-sensitive FQR parameter remains invented or unresolved.

RGT closure is not required to close M00.

RGT package-admission authority is required before M01 canonical package creation.

---

# 40. Ratification Effect

As this version is `RATIFIED · ACTIVE`:

- the FQR profile becomes the active governing implementation specification;
- the exact FQR scope becomes frozen;
- `qr-core` may not broaden the profile without explicit amendment;
- the engineering manual becomes subordinate implementation guidance;
- FQR implementation mandates may reference this document rather than restating its architecture;
- no GS1/domain semantic behavior becomes authorized by the GS1-shaped showcase fixture.

Ratification of ZQE-001 does not itself authorize code.

Implementation still requires a bounded AMS mandate.

---

# 41. Change Control

Changes to this specification require explicit review when they alter:

- FQR profile semantics;
- input meaning;
- `QrSymbol` meaning;
- capacity behavior;
- deterministic mask behavior;
- renderer boundary;
- error semantics;
- conformance requirements;
- mechanism/meaning separation;
- package/dependency boundary.

Ordinary internal code organization does not require a ZQE-001 amendment when these externally governed properties remain unchanged.

The engineering manual may evolve more frequently than this specification.

---

# 42. Final Authority Statement

ZQE-001 establishes the first QR engine contract as:

```text
Explicit Bytes
      ↓
Fixed FQR Profile
      ↓
Deterministic QR Compilation
      ↓
Immutable QrSymbol
      ↓
Deterministic Renderer
      ↓
Independent Technical Verification
```

while preserving:

```text
payload meaning
Reality
Identity
Evidence
Trust
Policy
authorization
constitutional execution
```

outside the QR engine.

The governing FQR doctrine is:

> **Encode exactly what was supplied.
> Infer nothing.
> Fail closed.
> Produce a native technical artifact.
> Render separately.
> Prove structure and interoperability independently.**

---

# 43. Ratified Disposition

**Document:** `ZQE-001 — QR Engine Specification / FQR-1`
**Version:** `1.0`
**Status:** `RATIFIED`
**Lifecycle:** `ACTIVE`
**Ratification Authority:** `Chair — Zyppi Constitutional Council`
**Ratified On:** `25 August 2026`
**Current M00 Role:** `ACTIVE FQR-1 TECHNICAL AUTHORITY`
**Implementation Authority:** `NONE — code still requires a bounded AMS mandate and lawful repository admission`

Ratification disposition:

```text
Architecture boundary        RATIFIED
FQR scope                    RATIFIED
Engine input/output          RATIFIED
QrSymbol boundary            RATIFIED
Renderer boundary            RATIFIED
Error contract               RATIFIED
Verification contract        RATIFIED
Non-scope                    RATIFIED

Standard-Readiness Review    CLOSED — PASS
Standard-ready claim         AUTHORIZED
Full 2024 normative audit    DEFERRED
CEngS-000 ZQE route          LIVE ON MAIN

M00 final closure            READY AFTER CORPUS PUBLICATION
```

This ratification freezes the FQR-1 technical contract.

It does not authorize package creation or implementation execution by itself.
