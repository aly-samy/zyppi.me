# ZQE-PLAN — First QR Vertical Slice Roadmap

| Field                        | Value                                                         |
| :--------------------------- | :------------------------------------------------------------ |
| **Version**                  | `0.2`                                                         |
| **Status**                   | RATIFIED                                                      |
| **Lifecycle**                | ACTIVE                                                        |
| **Program**                  | `ZII — Zyppi Interaction Infrastructure`                      |
| **Engine**                   | `ZQE — Zyppi QR Engine`                                       |
| **Authority Class**          | Roadmap / Build Order                                         |
| **Higher Authority**         | `ZII-001 v1.0`                                                |
| **Depends On**               | `ZII-000 v1.0` · `ZII-001 v1.0`                               |
| **Informed By**              | `ZII-002 Draft` · `ZII-PREP-F`                                |
| **Supersedes**               | `ZQE-PLAN v0.1 Draft`                                         |
| **Repository**               | `aly-samy/zyppi.me`                                           |
| **Implementation Authority** | NONE by itself — implementation requires bounded AMS mandates |
| **Effective Date**           | 23 August 2026                                                |

---

## 1. Purpose

ZQE-PLAN defines the shortest disciplined path from the current ZII architectural state to:

> **FQR-1 — First Real-World Interoperable ZQE QR**

The roadmap exists to move ZQE from architectural theory into engineering evidence without first requiring completion of the entire future ZII or ZQE documentation corpus.

It governs:

- execution sequence;
- milestone boundaries;
- parallel work;
- prerequisite gates;
- first-slice testing;
- interoperability proof;
- FQR-1 acceptance.

It does not redefine ZII architecture.
It does not by itself authorize code.

---

## 2. Roadmap Principle

The guiding principle is:

> **Narrow but real.**

FQR-1 does not attempt to prove that ZQE is complete.
It proves that the ZQE architecture can independently construct a genuine QR Code that external implementations and realistic capture environments successfully recognize.

The roadmap therefore prioritizes:

```text
standards correctness
         ↓
deterministic construction
         ↓
native QR artifact
         ↓
clean rendering
         ↓
strict structural verification
         ↓
independent decoding
         ↓
capture simulation
         ↓
physical spot check
```

over feature breadth.

---

## 3. FQR-1 Definition

FQR-1 is achieved only when ZQE:

1. receives explicit payload material;
2. constructs the payload using ZQE-owned QR encoding logic;
3. generates standards-required error correction;
4. constructs a complete QR matrix;
5. exposes the result as a native `QrSymbol`;
6. renders that symbol without recompiling QR semantics;
7. passes a strict structural QR verifier;
8. is decoded by an independent software implementation;
9. is decoded by an independent mobile reader environment;
10. survives a frozen bounded real-world simulation corpus;
11. passes a physical print-and-camera spot check;
12. returns the exact original payload after successful decoding;
13. preserves ZII's mechanism/meaning boundary.

---

## 4. Normative QR Baseline

The FQR-1 baseline is:

> **ISO/IEC 18004:2024 — QR Code bar code symbology specification, Edition 4**

No draft or successor edition may silently alter FQR-1 or the initial ZQE profile.

The exact technical scope implemented under FQR-1 SHALL be frozen in `ZQE-001`.

---

## 5. Normative Source Handling

The ISO standard is externally governed copyrighted material.
ZQE engineering SHALL distinguish:

```text
normative authority
         ≠
repository content
         ≠
AI training/context material
```

The licensed standard SHALL NOT be copied into the Zyppi repository merely to simplify AI implementation.

Large tables, clauses, formulas, diagrams, or equivalent protected portions SHALL NOT be transcribed into a repository "normative extract" for automated ingestion unless the applicable license explicitly permits such use.

### 5.1 Human Standards Verification

Standards-sensitive implementation decisions SHALL be checked by an authorized human reviewer against the legitimate normative source.

The repository MAY preserve a concise verification record such as:

```text
ZQE-NVR-001
Decision:            <technical decision>
Normative authority: ISO/IEC 18004:2024
Reference:           <clause / table identifier only>
Verification:        PASS
Verifier:            <human authority>
```

Such records document verification.
They do not reproduce the normative source.

### 5.2 AI Implementation Boundary

AI coding agents MAY use:

- authorized ZQE specifications;
- public technical material;
- project-created test vectors;
- project-created verification records;
- open-source implementations as independent reference evidence where legally appropriate.

They SHALL NOT be instructed to invent standards-sensitive values from memory.

If a required standards fact is unavailable in authorized implementation context:

> **STOP — MISSING NORMATIVE INPUT**

rather than guess.

---

## 6. FQR-1 Scope

The initial slice SHALL support only enough QR functionality to establish a genuine complete path.

**Expected baseline:**

- QR Code Model 2
- Byte-mode path
- ASCII-safe test material
- explicit QR version or bounded version subset
- explicit ECC level
- bitstream construction
- required data padding
- Reed-Solomon ECC
- block/interleave processing
- function-pattern placement
- data placement
- all applicable mask candidates
- standards-defined mask scoring
- deterministic mask choice
- format information
- `QrSymbol`
- quiet-zone-correct SVG
- strict structural verification
- independent decoding

Exact Version/ECC choices SHALL be resolved at `ZQE-M00`.
They SHALL NOT remain open once M00 closes.

---

## 7. Explicit FQR-1 Non-Scope

FQR-1 does not require completion of:

- QR Versions 1–40
- ECC L / M / Q / H complete coverage
- Numeric mode
- Alphanumeric mode
- Kanji mode
- ECI
- FNC1
- Structured Append
- full optimal mixed-mode segmentation
- full automatic smallest-version selection
- production QR decoder
- PNG production package
- PDF renderer
- logos / branding / styling
- animated QR
- printer integration
- Zyppi-owned camera scanning
- zQR / zTOUCH / ZPI
- GS1 parsing / validation
- CAW integration
- API / SDK / MCP
- cross-language ZQE implementation

These may follow FQR-1.
They SHALL NOT expand the first proof slice unless a standards necessity is discovered.

---

## 8. FQR-1 Determinism Scope

For FQR-1:

> Determinism means same reference implementation + same input + same explicit parameters/profile → same technical result.

This includes, where defined:

```text
same payload
+
same FQR profile
         ↓
same codewords
same mask decision
same QrSymbol
same SVG bytes
```

**Cross-language reproducibility** is explicitly:

> **OUT OF SCOPE FOR FQR-1**

No Go/Rust/second-language implementation is required before FQR-1.
Future ZQE conformance work MAY introduce stronger cross-implementation requirements.

---

## 9. FQR-1 Payload Corpus

The first slice SHALL use a frozen payload corpus rather than a single showcase value.

### Payload A — Smoke

```text
HELLO ZYPPI
```

**Purpose:**

- basic construction;
- fast debugging;
- simple visual/manual verification.

### Payload B — Commercial Showcase

```text
https://id.gs1.org/01/09520123456788
```

**Purpose:**

- prove carriage of a realistic GS1 Digital Link URI;
- prove interoperability using commercially meaningful input;
- prove that ZQE can carry GS1 material without owning GS1 semantics.

For ZQE this remains:

> _opaque caller-supplied payload_

ZQE SHALL NOT:

- parse the GTIN;
- validate GS1 semantics;
- resolve the URI;
- create Identity;
- infer Trade Item meaning.

### Payload C — Capacity Boundary

Payload C SHALL be the largest valid Byte-mode payload supported by the exact frozen FQR-1 Version/ECC combination.

**Purpose:**

- prove success exactly at the supported capacity boundary.

### Payload D — Capacity Overflow

Payload D SHALL be:

```text
Payload C + one additional byte
```

**Expected result:**

- deterministic rejection
- No silent truncation.
- No automatic profile mutation.
- No accidental larger-version selection unless the frozen FQR-1 profile explicitly allows it.

### Payload E — General Interior Fixture

A deterministic non-trivial payload safely inside the supported capacity range.

**Purpose:**

- avoid overfitting to smoke input;
- avoid overfitting to the GS1 URI;
- exercise normal non-boundary behavior.

---

## 10. Roadmap Overview

```text
ZQE-M00
FQR Entry Freeze
[S]
│
┌─────────────┼───────────────┐
│             │               │
▼             ▼               ▼
RGT TRACK      MATH PROBES     VERIFICATION
non-production       TRACK
│             │               │
│             │               │
└─────────────┼───────────────┘
              ▼
            M01
qr-core Admission
[S]
              │
              ▼
            M02
Bitstream + ECC Core
[M]
              │
              ▼
            M03
QrSymbol Compiler
[L]
              │
              ▼
            M04
Deterministic SVG Renderer
[S]
              │
              ▼
            M05
Independent Decode Gate
[M]
              │
              ▼
            M06
Real-World FQR Acceptance Gate
[M]
              │
              ▼
            FQR-1
```

---

## 11. Parallel Track A — RGT

RGT remains the hard prerequisite for admitting ZQE packages into the canonical monorepo.

The relationship is:

```text
RGT
  ↓
lawful multi-program repository governance
  ↓
ZQE package admission
```

ZQE SHALL NOT create a second production repository to bypass RGT.
A temporary independent `qr-core` repository would create:

- shadow package authority;
- shadow CI;
- duplicate history;
- migration-by-copy;
- unclear dependency provenance.

Therefore:

> **No shadow ZQE production repository.**

---

## 12. Parallel Track B — Mathematical Investigation

Standards-defined algorithm investigation MAY begin before package admission.
This track exists so RGT does not unnecessarily block technical learning.

**Permitted outputs include:**

- disposable bitstream probes;
- GF arithmetic experiments;
- Reed-Solomon experiments;
- mask-scoring probes;
- generated fixtures;
- comparison scripts;
- verification experiments.

These are:

> **NON-PRODUCTION ENGINEERING EVIDENCE**

They SHALL NOT automatically become `qr-core`.
Canonical implementation begins only after lawful M01 package admission.

The transition is:

```text
experimental proof
      ↓
review / verification
      ↓
lawful qr-core implementation
```

not:

```text
scratch implementation
      ↓
copy into production
```

without review.

---

## 13. Parallel Track C — Verification Harness

The verification harness SHALL be developed independently of ZQE output.
Before ZQE is tested against it, the harness SHALL demonstrate correct behavior using known valid and invalid third-party/generated fixtures.

This prevents simultaneous debugging of:

```text
new encoder
+
new verifier
```

---

## 14. Verification Architecture

FQR-1 uses several independent proof layers.

```text
LEVEL 1
Internal algorithmic correctness
Unit + Property Tests
    ↓
LEVEL 2
Strict structural verification
Raw QrSymbol inspection
    ↓
LEVEL 3
Independent software interoperability
ZXing-C++ family verifier
    ↓
LEVEL 4
Independent mobile interoperability
ML Kit / Android environment
    ↓
LEVEL 5
Frozen capture simulation
    ↓
LEVEL 6
Physical print-and-camera spot check
```

No single layer substitutes for all others.

---

## 15. ZQE-M00 — FQR Entry Freeze

**Size:** `S`

### Objective

Produce the minimum authoritative implementation contract necessary to begin the FQR-1 vertical slice without guessing.

### 15.1 Required Output — Minimal ZQE-001

`ZQE-001` SHALL initially be one compact engine specification.
It SHALL define at least:

- normative QR authority;
- FQR-1 scope;
- input contract;
- selected QR Model;
- selected Version/version policy;
- selected ECC level;
- Byte-mode rules;
- capacity boundary;
- deterministic mask-selection behavior;
- `QrSymbol` minimum contract;
- renderer boundary;
- technical error model;
- explicit non-scope.

The document MAY later split if implementation proves that distinct authority homes are genuinely needed.

### 15.2 Freeze Version and ECC

M00 SHALL choose and freeze:

- QR version / bounded version behavior
- ECC level
- Byte-mode capacity

for FQR-1.
These are hard M00 exit requirements.

### 15.3 Freeze Payload Corpus

M00 SHALL produce exact frozen values for Payloads:

- A
- B
- C
- D
- E

including exact bytes and hashes where useful.

### 15.4 Freeze Mask Tie Rule

If two or more masks produce the same minimum penalty score, ZQE SHALL use an explicitly defined deterministic tie rule.
M00 SHALL require such a rule.
The exact rule SHALL be stated in ZQE-001 after normative/source reconciliation.

This roadmap does not predetermine the selected numerical policy.

### 15.5 Normative Verification Procedure

M00 SHALL establish:

- who performs standards verification;
- where verification records live;
- how standards-sensitive decisions are referenced;
- what information may enter AI context;
- what information remains human-controlled.

### 15.6 CEngS Context Registration

Before implementation mandates begin, the canonical CEngS navigation authority SHALL gain a ZII/ZQE implementation route.

The intended pattern is:

```text
CEngS Core
+
ZII-001
+
relevant ZII authority
+
ZQE-001
+
exact AMS mandate
```

The ZQE roadmap SHALL NOT create a parallel global context-loading table.

### 15.7 Harness Definition

M00 SHALL freeze:

- strict-verifier role;
- fast independent decoder;
- mobile acceptance decoder;
- simulation categories;
- negative controls;
- evidence format.

### M00 Exit Gate

M00 passes only when:

- no FQR standards-sensitive architectural parameter remains undefined;
- no engineer/AI needs to guess a normative requirement;
- the test payload corpus is frozen;
- the mask tie policy is frozen;
- the context-loading route is resolved;
- the acceptance harness is specified.

---

## 16. ZQE-M01 — Repository Admission & Scaffold

**Size:** `S`

### Objective

Create the lawful canonical home for ZQE core implementation.

### Hard Prerequisites

- `ZQE-M00 PASS`
- RGT package-admission authority available
- CEngS ZII/ZQE context route available

### Initial Package

```text
packages/
└── qr-core/
```

Expected later:

```text
packages/
├── qr-core/
└── qr-svg/
```

### qr-core Dependency Boundary

The initial target is:

> `qr-core` → no production workspace dependencies

`qr-core` SHALL NOT depend in production on:

- CAW;
- domain;
- contracts;
- runtime;
- registry;
- database infrastructure;
- GS1;
- zTOUCH;
- ZPI;
- network services.

External dependencies, if any, require explicit justification under CEngS.

### M01 Exit Gate

The scaffold SHALL:

- compile;
- typecheck;
- run tests;
- pass repository boundary validation;
- pass dependency governance;
- expose no invented public functionality.

M01 proves package admission.
It does not prove QR functionality.

---

## 17. ZQE-M02 — Bitstream, Field Arithmetic & ECC

**Size:** `M`

### Objective

Implement the standards-sensitive primitives required for the frozen FQR-1 slice.

### 17.1 Bitstream Construction

Implement applicable FQR-1 behavior for:

- mode indicator;
- byte count;
- payload bytes;
- terminator;
- padding;
- codeword completion.

### 17.2 Capacity Enforcement

The encoder SHALL prove:

- `Payload C` → `ACCEPT`
- `Payload D` → deterministic `CAPACITY_EXCEEDED`-style failure

Exact error naming belongs to ZQE-001 / implementation contract.
Silent truncation is prohibited.

### 17.3 GF(256) / Reed-Solomon

Implement the exact arithmetic required by the frozen QR profile.
Standards-sensitive constants or polynomial choices SHALL be human-verified against normative authority.

### 17.4 ECC and Interleaving

Implement:

```text
data codewords
      ↓
ECC generation
      ↓
block organization
      ↓
interleaving
      ↓
complete codeword stream
```

for the frozen scope.

---

## 18. M02 Testing Requirements

CEngS-101 requires property testing for critical algorithms. This milestone therefore SHALL include both example-based and generated tests.

**Required classes include:**

- unit tests;
- boundary tests;
- known-vector tests where legally/technically available;
- property tests;
- malformed-input tests;
- capacity rejection;
- deterministic repetition.

**Core properties should include:**

```text
same payload
      ↓
same codeword stream
```

and, for generated supported payloads:

```text
payload length <= capacity
      ↓
valid deterministic construction
```

and:

```text
payload length > capacity
      ↓
deterministic rejection
```

Property-test framework selection is an implementation choice, not roadmap law.

### M02 Exit Gate

For every supported FQR fixture:

```text
input
      ↓
data codewords
      ↓
ECC
      ↓
interleaved stream
```

must be deterministic, inspectable, and test-proven.

---

## 19. ZQE-M03 — QrSymbol Compiler

**Size:** `L`

### Objective

Construct the complete native QR matrix from the encoded codeword stream.

### Required Scope

Implement, as applicable to the frozen profile:

- function patterns;
- reserved modules;
- data traversal;
- module placement;
- all applicable masks;
- penalty evaluation;
- deterministic mask selection;
- format information;
- version information if required.

### 19.1 Mask Determinism

Given identical:

- payload
- profile
- version
- ECC

the compiler SHALL always choose the same mask.
Any standards-permitted tie SHALL resolve according to the rule frozen in ZQE-001.

### 19.2 QrSymbol

The milestone output is:

```text
payload
      ↓
qr-core
      ↓
QrSymbol
```

The minimum public concept is expected to include enough information to faithfully reproduce the QR matrix, such as:

- version
- size
- ECC
- mask
- module matrix

The exact internal matrix representation remains an implementation detail unless evidence proves otherwise.

---

## 20. Strict Structural Verifier

M03 SHALL include a test-side structural verifier that is logically independent from the encoder implementation.

It SHALL NOT simply call encoder helper functions and re-report their output.
Its purpose is to catch defects that forgiving external scanners may tolerate.

**Where feasible for the frozen scope it should verify:**

- matrix dimensions;
- function/reserved-module placement;
- module assignment completeness;
- format-information consistency;
- mask consistency;
- legal data traversal;
- extractable codeword structure;
- ECC consistency.

The verifier is:

> _test infrastructure_

not a production ZQE decoder.

---

## 21. M03 Property Testing

For generated payloads within FQR-1 capacity:

```text
strict_verify(zqe_encode(payload))
      ↓
PASS
```

and where the independent decoder harness is practical:

```text
decode(zqe_encode(payload)) === payload
```

Generated tests SHALL include boundary-adjacent payload lengths.

### M03 Exit Gate

M03 passes when:

- every frozen valid fixture yields a deterministic `QrSymbol`;
- Payload D fails cleanly;
- the strict verifier accepts valid ZQE matrices;
- deliberately invalid structural fixtures are rejected;
- generated properties pass;
- no matrix module remains accidentally unassigned.

---

## 22. Negative Controls

The verification system SHALL prove that it can detect failure.
Two separate negative-control classes are required.

### 22.1 Structural Invalid Control

A deliberately invalid matrix/artifact SHALL be rejected by the strict structural verifier.

**Purpose:**

- prove the verifier is not a rubber stamp.

### 22.2 Non-Decodable Image Control

A frozen image known not to contain a valid QR SHALL return:

```text
NO_VALID_QR
```

or equivalent from the independent reader harness.

ZQE SHALL NOT assume that every intentionally damaged QR must fail external decoding.
QR readers are intentionally fault tolerant.

---

## 23. ZQE-M04 — Deterministic SVG Renderer

**Size:** `S`

### Objective

Produce the first visible delivery representation from `QrSymbol`.

### Architecture

```text
QrSymbol
      ↓
qr-svg
      ↓
SVG
```

The renderer SHALL NOT recalculate:

- QR encoding;
- ECC;
- placement;
- mask selection.

It consumes the artifact.

---

## 24. FQR SVG Determinism Rules

For FQR-1 the SVG renderer SHALL use integer-based geometry.

**Required properties:**

- integer module coordinates;
- integer quiet-zone units;
- integer viewBox geometry;
- no fractional module placement;
- no random IDs;
- no timestamps;
- no environment-derived metadata;
- deterministic element/path ordering.

Floating-point coordinate math is prohibited for the FQR-1 canonical renderer unless later proven technically necessary.

The intent is:

```text
same QrSymbol
      ↓
same SVG bytes
```

### M04 Exit Gate

At M04:

- The first visible ZQE QR exists.
- It is not yet FQR-1.
- External proof remains required.

---

## 25. Test Rasterization

The test system MAY rasterize SVG output into deterministic image buffers for external reader testing.
Rasterization tooling is test infrastructure.
FQR-1 does not require a production:

> `qr-png`

package.

The rasterizer and its version SHALL be recorded where its output participates in frozen evidence.

---

## 26. ZQE-M05 — Fast Independent Decode Gate

**Size:** `M`

### Objective

Prove that a non-ZQE decoder can recover exact payload material from pristine ZQE output.

### Required Fast Verifier

The normal fast verification path SHALL use an independent ZXing-C++-based decoder environment or equivalent approved independent implementation.
Where WASM is used, it may execute in:

- Node;
- browser;
- equivalent supported runtime.

ZQE production code SHALL NOT depend on the decoder.

---

## 27. M05 Acceptance

For Payloads A, B, C and E:

```text
input payload
      ↓
ZQE
      ↓
QrSymbol
      ↓
SVG
      ↓
test raster
      ↓
independent decoder
      ↓
decoded payload
```

must satisfy:

```text
decoded payload === original payload
```

exactly.
No normalization is permitted when comparing the payload.

### M05 CI Role

The fast decode gate is suitable for the normal development/PR feedback loop.
It SHOULD remain:

- deterministic;
- headless;
- reasonably fast;
- reproducible.

Heavy mobile-emulator tests are not required on every PR for FQR-1.

---

## 28. ZQE-M06 — FQR Real-World Acceptance Gate

**Size:** `M`

### Objective

Demonstrate that ZQE output survives a bounded realistic capture envelope beyond perfect generated images.
M06 is the final milestone of this roadmap.

---

## 29. Frozen Capture Simulation Corpus

Starting from canonical test images, the harness SHALL generate deterministic transformed fixtures.

The initial corpus covers:

### 29.1 Scale / Frame Occupancy

QR presented at multiple bounded image sizes.

### 29.2 Rotation

Multiple deterministic orientations/rotations.

### 29.3 Perspective

Controlled projective distortion approximating angled camera capture.

### 29.4 Blur

Bounded optical/focus blur.

### 29.5 Brightness / Contrast

Deterministic illumination and contrast variation.

### 29.6 Resampling / Compression

Bounded imaging artifacts representative of:

- screenshot processing;
- resizing;
- messaging;
- browser pipelines;
- camera/image encoding.

---

## 30. Simulation Determinism

Acceptance simulation SHALL NOT depend on uncontrolled random transformations.
Each fixture must be derivable from:

```text
source image
+
named transformation
+
frozen parameters
      =
reproducible fixture
```

Randomized fuzzing MAY supplement the corpus.
It SHALL NOT replace the frozen acceptance corpus.

---

## 31. Mobile Interoperability Gate

M06 SHALL include an independent mobile QR decoder environment such as ML Kit on Android.
This test MAY run:

- manually;
- in dedicated CI;
- in scheduled CI;
- as a bounded FQR acceptance workflow.

It is not required in every fast PR execution.
The result must still satisfy:

```text
decoded payload === original payload
```

for every required success fixture.

---

## 32. Physical Spot Check

FQR-1 SHALL include at least one genuine physical loop:

```text
ZQE-generated QR
      ↓
physical print
      ↓
ordinary viewing conditions
      ↓
ordinary phone camera / QR reader
      ↓
exact payload recovered
```

This is not a fully automated production printer-validation system.
It is a bounded real-world spot check proving that the pipeline has crossed from generated image into a physical environment.

### 32.1 Physical Evidence Record

Record:

- ZQE commit SHA;
- source artifact hash;
- payload;
- printer/device class;
- printed medium;
- phone/device class;
- decoder/application;
- result;
- date;
- PASS/FAIL.

No claim of universal physical robustness follows from one spot check.

---

## 33. FQR-1 Acceptance Matrix

At minimum:

| Fixture / Gate             |   Strict Verifier    | Fast Independent Decoder |  Mobile Decoder   |
| :------------------------- | :------------------: | :----------------------: | :---------------: |
| Smoke pristine             |         PASS         |           PASS           |       PASS        |
| GS1 showcase pristine      |         PASS         |           PASS           |       PASS        |
| Capacity boundary pristine |         PASS         |           PASS           |       PASS        |
| General interior pristine  |         PASS         |           PASS           |       PASS        |
| Capacity overflow          | REJECT before symbol |           N/A            |        N/A        |
| Structural invalid control |         FAIL         |    Not authoritative     | Not authoritative |
| Non-QR control             |         N/A          |          NO QR           |       NO QR       |
| Scale baseline             |         N/A          |           PASS           |       PASS        |
| Rotation baseline          |         N/A          |           PASS           |       PASS        |
| Perspective baseline       |         N/A          |           PASS           |       PASS        |
| Blur baseline              |         N/A          |           PASS           |       PASS        |
| Contrast baseline          |         N/A          |           PASS           |       PASS        |
| Compression baseline       |         N/A          |           PASS           |       PASS        |
| Physical printed showcase  |         N/A          |         optional         |       PASS        |

The exact simulation severity values SHALL be frozen before M06 execution.
They SHALL represent a reasonable baseline, not intentionally extreme torture conditions.

---

## 34. FQR-1 Evidence Bundle

When M06 passes, preserve an FQR-1 technical evidence bundle.
It SHOULD contain:

- FQR profile / ZQE-001 version
- normative standards identifier
- ZQE commit SHA
- toolchain versions
- payload fixtures and hashes
- Version / ECC configuration
- selected mask per fixture
- `QrSymbol` representation/hash where defined
- SVG hashes
- test-raster hashes
- strict-verifier results
- property-test results
- independent decoder results
- mobile decoder results
- simulation fixture identifiers
- negative-control results
- physical spot-check record
- CI result

The evidence bundle is technical engineering evidence.
It is not automatically an RI Execution Receipt or constitutional EvidenceRecord.

---

## 35. First Showcase QR

The FQR-1 showcase payload is:

```text
https://id.gs1.org/01/09520123456788
```

subject to the frozen FQR-1 Version/ECC capacity.

Its architectural significance is:

```text
GS1-shaped external payload
      ↓
opaque input
      ↓
ZQE
      ↓
QrSymbol
      ↓
SVG
      ↓
ordinary reader
      ↓
same URI
```

while:

- GS1 parsing
- GS1 validation
- GTIN semantics
- Trade Item semantics

remain absent from `qr-core`.

This turns the ZII mechanism/meaning separation into executable evidence.

---

## 36. What FQR-1 Does Not Prove

FQR-1 SHALL NOT be represented as proof of:

- full ISO/IEC 18004 implementation;
- all QR versions;
- all ECC levels;
- all QR modes;
- optimal segmentation;
- ECI completeness;
- Kanji support;
- FNC1 support;
- Structured Append;
- full printer qualification;
- universal camera robustness;
- production throughput;
- production release readiness;
- GS1 conformance;
- GS1 semantic validation;
- zQR conformance;
- ZPI integration;
- CAW integration;
- API/SDK readiness;
- cross-language reproducibility.

FQR-1 proves:

> _ZQE can independently construct a deterministic standards-valid QR within its declared narrow scope and demonstrate interoperability through structural, software, mobile, simulated, and bounded physical evidence._

---

## 37. Critical Path

The canonical production critical path is:

```text
ZQE-M00
│
├── standards freeze
├── ZQE-001
├── payload corpus
├── tie behavior
├── CEngS context route
│
├──── parallel math investigation
├──── parallel verifier construction
└──── parallel RGT
│
▼
M01
│
▼
M02
│
▼
M03
│
▼
M04
│
▼
M05
│
▼
M06
│
▼
FQR-1
```

RGT blocks canonical package admission.
It does not block non-production standards investigation or verifier development.

---

## 38. Milestone Board

| Milestone              | Objective                    |   Size   | Canonical Result                       |
| :--------------------- | :--------------------------- | :------: | :------------------------------------- |
| **ZQE-M00**            | Freeze FQR contract          |    S     | Minimal implementable ZQE-001          |
| **Parallel RGT**       | Lawful repo governance       | external | Package admission possible             |
| **Math Probe Track**   | Retire algorithm uncertainty |   S/M    | Non-production evidence                |
| **Verification Track** | Build trusted test harness   |   S/M    | Independent verifier ready             |
| **ZQE-M01**            | Admit `qr-core`              |    S     | Lawful package scaffold                |
| **ZQE-M02**            | Build codeword/ECC pipeline  |    M     | Deterministic complete codeword stream |
| **ZQE-M03**            | Build QR matrix              |    L     | Strictly verified `QrSymbol`           |
| **ZQE-M04**            | Render SVG                   |    S     | First visible deterministic QR         |
| **ZQE-M05**            | External software decode     |    M     | Exact payload recovered                |
| **ZQE-M06**            | Real-world acceptance        |    M     | FQR-1                                  |

Sizes are relative planning estimates.
They are not calendar commitments.

---

## 39. Ownership

Each activated milestone or Implementation Task SHALL have one explicitly assigned DRI in its execution mandate.
The roadmap itself does not permanently bind individuals to milestones.
Ownership is assigned when work is authorized.

This avoids confusing:

```text
roadmap authority
```

with:

```text
temporary execution responsibility
```

---

## 40. Dates

This roadmap intentionally does not invent milestone completion dates before:

- M00 activation;
- RGT state is known;
- DRIs are assigned.

Once execution begins, dates MAY be attached operationally without requiring amendment to the architectural intent of this roadmap.

---

## 41. FQR-1 Closure Lessons Record

FQR-1 closure SHALL include a short:

> **FQR-1 Lessons Record**

It answers:

- What assumptions were confirmed?
- What assumptions were wrong?
- Which rules were QR-specific?
- Which patterns appear genuinely generic to ZII?
- What implementation choices should remain local to ZQE?
- Does any observed behavior justify drafting or refining ZII-003?
- Did any ZII-002 assumption fail under actual implementation?

This is a closure artifact.
It is not a new milestone after FQR-1.
The roadmap still ends at FQR-1.

---

## 42. Post-FQR-1 Decision Boundary

After FQR-1, new requirements SHALL be classified before promotion.

```text
implementation lesson
      │
      ▼
Is it generic across interaction engines?
      │
┌─────┴─────┐
│           │
YES         NO
│           │
ZII candidate   ZQE-only rule
```

No QR implementation behavior becomes generic ZII law merely because it worked.
This preserves:

> **No First-Engine Privilege**

while allowing implementation evidence to improve the architecture.

---

## 43. FQR-1 Definition of Done

FQR-1 is complete only when all of the following are true:

- [ ] `ZQE-001` exists and governs the narrow slice.
- [ ] ISO/IEC 18004:2024 is the declared normative baseline.
- [ ] Standards-sensitive decisions have human verification.
- [ ] The exact Version/ECC/mode scope is frozen.
- [ ] Payloads A–E are frozen.
- [ ] Capacity boundary succeeds.
- [ ] Capacity + 1 fails deterministically.
- [ ] Mask tie behavior is explicit.
- [ ] `qr-core` is lawfully admitted after RGT.
- [ ] `qr-core` contains no CAW, GS1, Runtime, domain, ZPI, or zTOUCH semantic dependency.
- [ ] Critical algorithm unit tests pass.
- [ ] Critical algorithm property tests pass.
- [ ] Reed-Solomon/ECC construction passes.
- [ ] `QrSymbol` is deterministic.
- [ ] Strict structural verification passes.
- [ ] Structural negative control fails as expected.
- [ ] SVG uses deterministic integer geometry.
- [ ] Same `QrSymbol` produces the same SVG bytes.
- [ ] Independent software decoding recovers exact payloads.
- [ ] Non-QR negative control is rejected.
- [ ] Mobile decoding recovers exact payloads.
- [ ] Frozen scale simulation passes.
- [ ] Frozen rotation simulation passes.
- [ ] Frozen perspective simulation passes.
- [ ] Frozen blur simulation passes.
- [ ] Frozen contrast/lighting simulation passes.
- [ ] Frozen compression/resampling simulation passes.
- [ ] The GS1 showcase URI round-trips exactly.
- [ ] A printed ZQE showcase QR is successfully decoded by an ordinary phone.
- [ ] CI and repository boundary checks pass.
- [ ] The FQR-1 evidence bundle exists.
- [ ] The FQR-1 Lessons Record exists.

At that point:

> **FQR-1 — CLOSED / PASS**

and Zyppi may state:

> _ZQE has generated and independently proven its first real-world QR Code._

---

## 44. Execution Discipline

ZQE-PLAN is intentionally an active engineering roadmap rather than a constitutional charter.
Therefore:

- individual implementation work SHALL be authorized through bounded mandates;
- milestone details MAY evolve as engineering evidence emerges;
- scope expansion requires explicit approval;
- ZII architectural boundaries may not be weakened by roadmap convenience;
- changes that materially alter the FQR-1 definition require an explicit roadmap revision;
- ordinary task decomposition does not require constitutional ratification.

The roadmap follows:

> _architecture before irreversible decisions; evidence before unnecessary abstraction._

---

## 45. Final Roadmap Statement

The first ZQE journey is:

```text
freeze only what must be known
      ↓
verify the standards safely
      ↓
investigate difficult math early
      ↓
build the verifier early
      ↓
wait only where repository authority truly requires it
      ↓
admit qr-core lawfully
      ↓
construct codewords
      ↓
construct QrSymbol
      ↓
verify structure
      ↓
render deterministically
      ↓
decode independently
      ↓
stress realistic capture
      ↓
print it
      ↓
scan it
      ↓
recover the exact original payload
```

The endpoint is deliberately tangible:

> _A QR Code generated by Zyppi's own QR engine, carrying a real commercially relevant payload, recognized by software Zyppi did not write, surviving realistic image conditions, printed into the physical world, and successfully scanned back into the exact original data._

**That is FQR-1.**

---

## 46. Approval Record

| Field                        | Value                                      |
| :--------------------------- | :----------------------------------------- |
| **Decision**                 | APPROVE                                    |
| **Document**                 | ZQE-PLAN — First QR Vertical Slice Roadmap |
| **Version**                  | 0.2                                        |
| **Status**                   | APPROVED                                   |
| **Lifecycle**                | ACTIVE                                     |
| **Authority Class**          | Roadmap / Build Order                      |
| **Implementation Authority** | NONE by itself                             |
| **Effective Date**           | 23 August 2026                             |

**Effective upon approval:**

- ZQE-PLAN v0.1 is superseded;
- FQR-1 becomes the active near-term ZQE engineering objective;
- ZQE-M00 becomes the first executable planning gate;
- RGT proceeds in parallel;
- non-production mathematical investigation and verifier development may proceed only under appropriate bounded authority;
- canonical `qr-core` implementation remains gated by lawful package admission;
- no broader ZII-003→006 corpus completion is required before FQR-1 unless implementation reveals a genuine missing authority.

> **ZQE-PLAN v0.2 is APPROVED · ACTIVE.**
