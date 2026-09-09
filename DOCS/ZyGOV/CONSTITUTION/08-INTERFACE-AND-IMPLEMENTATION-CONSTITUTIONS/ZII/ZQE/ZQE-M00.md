# ZQE-M00 — FQR Entry Freeze

**Milestone Freeze Record**

| Field | Value |
| :--- | :--- |
| **Version** | `0.1` — WORKING FREEZE RECORD |
| **Status** | ACTIVE — IN PROGRESS |
| **Program** | `ZII — Zyppi Interaction Infrastructure` |
| **Engine** | `ZQE — Zyppi QR Engine` |
| **Milestone** | `ZQE-M00 — FQR Entry Freeze` |
| **Roadmap Authority** | `ZQE-PLAN v0.2` |
| **Implementation Authority** | SPECIFICATION / INVESTIGATION ONLY — no canonical `qr-core` code yet |
| **Date** | 25 August 2026 |

---

## 1. Mission

ZQE-M00 exists to eliminate ambiguity before canonical ZQE implementation begins.

M00 must establish:
- Exactly what FQR-1 is building
- What technical contract ZQE exposes
- What standards choices are frozen
- How failures behave
- How correctness is independently proven
- What information an implementation agent is permitted to rely upon

M00 is deliberately small.
It does not design the complete future QR engine.

---

## 2. M00 Work Breakdown

| Workstream | Purpose | Current State |
| :--- | :--- | :--- |
| **M00-A** — FQR Profile Freeze | Model, Version, ECC, mode, capacity, fixtures | CANDIDATE FREEZE COMPLETE |
| **M00-B** — Engine Boundary Freeze | Callable interface, QrSymbol, errors | CANDIDATE FREEZE COMPLETE |
| **M00-C** — Verification Freeze | Strict verifier, external decoders, SVG determinism | CANDIDATE FREEZE COMPLETE |
| **M00-D** — Governance Entry | CEngS context loading + RGT receipt | PARTIAL |
| **M00-E** — Normative Verification & Closure | Human ISO verification + final ZQE-001 | OPEN |

---

## 3. M00-A — FQR Profile Candidate Freeze

### 3.1 Normative Standard

```text
ISO/IEC 18004:2024
Edition 4
QR Code bar code symbology specification
```

ISO currently lists Edition 4 as the published International Standard.

**Candidate disposition:** FREEZE

### 3.2 Symbology

```text
QR Code Model 2
```

No Micro QR, rMQR, or Model 1 belongs to FQR-1.

### 3.3 QR Version

```text
Version 3
29 × 29 modules
```

This is deliberately fixed rather than auto-selected.

**Why Version 3:**
- small enough to keep FQR implementation narrow;
- large enough for the 36-byte GS1 showcase payload;
- gives a useful capacity boundary;
- avoids implementing version-selection policy before FQR-1.

Public QR capacity references identify Version 3 as a 29×29 symbol.

**Candidate disposition:** FREEZE — NORMATIVE HUMAN VERIFY REQUIRED

### 3.4 Error Correction

```text
ECC Level M
```

FQR-1 does not implement ECC selection.
The caller cannot silently request another level.

**Candidate disposition:** FREEZE — NORMATIVE HUMAN VERIFY REQUIRED

### 3.5 Data Mode

```text
Byte mode only
```

FQR-1 does not optimize eligible content into Numeric or Alphanumeric mode.

Even:
```text
HELLO ZYPPI
```
is processed through the frozen Byte-mode path.

This prevents early segmentation/optimization complexity from entering the proof slice.

**Candidate disposition:** FREEZE

### 3.6 Capacity Freeze

Public technical references report Version 3-M Byte-mode capacity as:

```text
42 bytes
```

with Version 3-M carrying 44 data codewords and a 42-byte Byte-mode payload capacity after QR mode/count overhead.

Therefore the candidate FQR boundary is:

```text
MAX_FQR_PAYLOAD = 42 bytes
```

and:

```text
43 bytes → deterministic rejection
```

No automatic upgrade to Version 4 is permitted during FQR-1.
That behavior would destroy the usefulness of the capacity-boundary test.

**Status:** CANDIDATE FROZEN — HUMAN ISO VERIFICATION REQUIRED

### 3.7 Frozen Payload Corpus

The first FQR corpus is now concretely defined.

| ID | Payload | Bytes | Expected |
| :--- | :--- | :---: | :--- |
| **A** | `HELLO ZYPPI` | 11 | ACCEPT |
| **B** | `https://id.gs1.org/01/09520123456788` | 36 | ACCEPT |
| **C** | `ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001` | 42 | ACCEPT |
| **D** | `ZYPPI-FQR1-CAPACITY-BOUNDARY-0000000000001X` | 43 | REJECT |
| **E** | `ZYPPI-FQR1-INTERIOR-TEST-2026` | 29 | ACCEPT |

The SHA-256 fixture identities are:

| ID | SHA-256 |
| :--- | :--- |
| **A** | `bd68ab3476a08c12c26492389e317096619c54a3fb7e61d13e1047ee2502e843` |
| **B** | `6eba966218ef0703cf47ee9079e4a3903bd315c4aa0c1544b5b64954ee5bccbd` |
| **C** | `50c21a65588849150446e953cf26a67ea7a80296ea15b944dbf2803df414eac6` |
| **D** | `a6104165e93c8dfb8ed375409a4dc31912c22e68aacfa999b350dbbe2139f93f` |
| **E** | `725860310bdc78b647e494537b54674af8794f04a5965b81dbe178432d88b7f4` |

These hashes identify the test input bytes.
They are not constitutional hashes or Execution Receipts.

### 3.8 Payload Input Contract

The canonical `qr-core` boundary should accept bytes, not infer string encoding.

**Candidate conceptual contract:**

```typescript
compileQr({
  data: Uint8Array,
  profile: FqrProfile
}): QrCompileResult
```

This is preferable to making the engine fundamentally:

```typescript
compileQr("some string")
```

because the latter silently introduces a text-encoding responsibility.

The engine owns:

```text
bytes → QR
```

not:

```text
human text → guess encoding → QR
```

Higher layers may later provide UTF-8/string convenience.
For FQR-1, fixtures A–E are frozen as their ASCII byte sequences.

### 3.9 Fixed FQR Profile

The working profile is therefore:

```text
FQR-1 PROFILE
─────────────────────────────────────────
Symbology:       QR Code Model 2
Standard:        ISO/IEC 18004:2024 Ed.4
Version:         3
Matrix:          29 × 29
ECC:             M
Mode:            Byte
Max payload:     42 bytes
Version upgrade: PROHIBITED
Mode switching:  PROHIBITED
ECC switching:   PROHIBITED
```

This is intentionally restrictive.
FQR-1 is proving the pipeline, not breadth.

---

## 4. M00-B — Public Engine Boundary

ZQE must be callable later from REST/SDK/MCP without itself understanding any of them.

Therefore:

> **ZQE SHALL be API-ready but API-unaware.**

The dependency direction is:

```text
REST / SDK / MCP
      ↓
Application capability
      ↓
public ZQE interface
      ↓
qr-core
```

never:

```text
qr-core
      ↓
HTTP / SDK / MCP
```

### 4.1 Candidate Compiler Boundary

Conceptually:

```typescript
type FqrProfile = {
  model: "QR_MODEL_2";
  version: 3;
  errorCorrection: "M";
  mode: "BYTE";
};

compileQr(
  data: Uint8Array,
  profile: FqrProfile
): QrSymbol;
```

The final TypeScript shape belongs to ZQE-001 / implementation.

The architectural requirement is stronger than any particular syntax:

> **A caller SHALL be able to construct a QR entirely through the public `qr-core` API without importing compiler internals.**

### 4.2 Candidate QrSymbol Minimum Contract

`QrSymbol` is the native ZQE technical artifact.

**Minimum public meaning:**

```text
QrSymbol
├── model
├── version
├── size
├── errorCorrection
├── selectedMask
└── read-only module grid
```

For FQR-1:

| Field | Value |
| :--- | :--- |
| `model` | QR Model 2 |
| `version` | 3 |
| `size` | 29 |
| `errorCorrection` | M |
| `selectedMask` | 0..7 |
| `modules` | complete 29 × 29 binary grid |

The public contract SHALL make mutation impossible through supported public operations.

The exact in-memory representation remains implementation detail.
We should not prematurely constitutionalize whether the matrix is:
- flattened;
- row arrays;
- bit-packed;
- boolean;
- `Uint8Array`;
- another private structure.

### 4.3 Compiler / Renderer Separation

The technical composition boundary is:

```text
payload bytes
      ↓
qr-core
      ↓
QrSymbol
      ↓
qr-svg
      ↓
SVG
```

`qr-svg` SHALL NOT:
- encode payload bytes;
- calculate ECC;
- perform matrix placement;
- choose masks;
- reinterpret QR semantics.

It receives a completed `QrSymbol`.

### 4.4 API-Callable Boundary Test

FQR shall include a package-boundary integration test proving:

```text
external consumer
      ↓
public qr-core export
      ↓
QrSymbol
      ↓
public qr-svg export
      ↓
SVG
```

with:
- NO deep imports
- NO compiler-private imports
- NO QR semantic reconstruction in renderer

This proves the eventual API adapter can remain thin.

Public REST exposure remains outside FQR-1.

### 4.5 M00 Error Contract

CEngS-001 states that every failure must include:
- Error Code;
- Reason;
- Execution Stage;
- Constitutional Reference;
- Recovery Guidance.

ZQE therefore SHALL NOT throw ambiguous errors such as:

```typescript
Error("invalid")
```

or:

```typescript
Error("QR failed")
```

#### 4.5.1 Candidate ZQE Error Shape

Conceptually:

```typescript
interface ZqeError {
  code: string;
  reason: string;
  stage: string;
  reference: string;
  recovery: string;
}
```

Exact serialization belongs to ZQE-001.

#### 4.5.2 Initial Required Error Case

FQR-1 definitely requires:

```text
QR_CAPACITY_EXCEEDED
```

For Payload D:

```text
code:
  QR_CAPACITY_EXCEEDED

reason:
  Payload exceeds the 42-byte capacity of the active FQR profile.

stage:
  data_encoding

reference:
  ZQE-001 / applicable governing rule

recovery:
  Reduce the payload to the supported capacity or use a future
  authorized profile supporting a larger QR symbol.
```

No truncation.
No fallback.
No version promotion.

### 4.6 Mask Selection

The encoder must:

```text
construct all 8 candidates
      ↓
evaluate all candidates
      ↓
select lowest valid penalty
```

Public materials for prior ISO editions confirm selection by lowest penalty score.

A remaining question exists only for an exact score tie.

#### 4.6.1 Candidate Tie Rule

**Working candidate:**

> If multiple masks have the identical minimum penalty, select the lowest numerical mask index.

This has desirable properties:
- deterministic;
- no hidden state;
- simple;
- consistent with common deterministic encoder iteration strategies.

But this rule is **NOT YET FROZEN.**

Before M00 closes, human normative review SHALL determine:
- whether ISO/IEC 18004:2024 explicitly governs tie behavior;
- if not, whether the proposed lowest-index rule is a standards-permitted implementation choice.

Until then:

```text
MASK-TIE RULE
= NORMATIVE HOLD
```

---

## 5. M00-C — Strict Verification Architecture

External decoding alone is not enough.
A scanner may tolerate damaged or imperfect symbols.

Therefore FQR uses:

```text
ZQE output
│
├─────────────► Strict Structural Verifier
│
└─────────────► Image / Independent Decoder
```

### 5.1 Strict Structural Verifier

The FQR verifier is test infrastructure.
It SHALL be logically independent from the encoder.
It SHALL NOT simply invoke encoder helpers to verify encoder output.

For the frozen profile it should inspect, where applicable:
- 29×29 matrix dimensions;
- required function regions;
- reserved modules;
- complete module assignment;
- data traversal;
- format information consistency;
- selected-mask consistency;
- extractable codeword stream;
- ECC consistency.

It is not a production QR decoder.

### 5.2 Independent Software Decoder

**Current candidate:**

> ZXing-C++ — test only

The official project:
- reads QR Code Model 2;
- has WebAssembly bindings;
- is Apache-2.0 licensed;
- exposes image-reading APIs.

**Candidate classification:**

| Property | Value |
| :--- | :--- |
| Dependency role | TEST ONLY |
| Production `qr-core` dependency | PROHIBITED |
| Purpose | Independent interoperability verification |
| License candidate | Apache-2.0 |

M05 still requires the repository's formal dependency/license review before adoption.

### 5.3 Mobile Decoder

**Candidate acceptance environment:**

> Google ML Kit Barcode Scanning · Android

This belongs to the heavier FQR acceptance path, not necessarily every PR.

Its role is:

> independent mobile interoperability evidence

not production ZQE functionality.

### 5.4 Negative Controls

The verification harness SHALL include two failure controls.

**Structural negative:**

```text
deliberately invalid QrSymbol/matrix
      ↓
strict verifier FAIL
```

**Decoder negative:**

```text
image containing no valid QR
      ↓
independent reader reports no QR
```

A damaged but recoverable QR is not an appropriate required-failure fixture because QR error correction may legitimately recover it.

### 5.5 SVG Determinism Freeze

The FQR SVG contract SHALL use:
- integer module geometry
- integer quiet-zone geometry
- integer viewBox
- fixed serialization order
- no timestamps
- no random IDs
- no environment metadata
- no floating-point module positions

The invariant is:

```text
same QrSymbol
+
same renderer parameters
=
byte-identical SVG
```

This requirement does not mandate a third-party SVG library or formatter.
A small controlled serializer may be preferable.

### 5.6 Quiet Zone

**Candidate FQR rendering rule:**

```text
quiet zone = four modules
```

This is a standards-sensitive parameter.
It therefore enters the normative verification list before M00 closure.

**Status:**

```text
CANDIDATE
→ HUMAN ISO VERIFY
```

---

## 6. M00-D — CEngS Context Registration

CEngS-000 currently requires AI agents to load only the documents assigned by its Task → Document table and to stop rather than guess when required context is absent.

ZII/ZQE is not presently registered there.
M00 therefore requires a narrow amendment.

### 6.1 Proposed CEngS-000 Addition

Add conceptually to the Task → Document table:

| Task | Load |
| :--- | :--- |
| ZII / ZQE implementation | Core + `ZII-001` + relevant ACTIVE ZII authority + relevant ZQE specification + exact implementation mandate |

And clarify:

> Do not load CAW merely because a QR carries a GS1-shaped payload.
> Load CAW only when the implementation task itself crosses into CAW/domain behavior.

This protects the engine from context pollution.

**Current state:** DRAFTED — NOT YET APPLIED

Therefore M00 cannot close until the canonical CEngS navigation authority is actually updated.

### 6.2 RGT Status Receipt — M00 Initial

```text
RGT STATUS RECEIPT
────────────────────────────────
Relationship to ZQE:
  External platform prerequisite

Owned by ZQE:
  NO

Blocks M00 investigation:
  NO

Blocks canonical qr-core admission:
  YES

Blocks ZQE-M01:
  YES

Repository evidence found on main:
  No RGT-named artifact located in current repository search

Package-admission status:
  NOT YET PROVEN

DRI:
  NOT RESOLVED FROM CURRENT REPOSITORY EVIDENCE
```

This does not block:
- ZQE-001 drafting;
- standards reconciliation;
- mathematical probes;
- verifier design;
- fixture preparation.

It does block canonical `packages/qr-core` admission.

---

## 7. M00-E — Normative Verification Register

We should not reproduce the licensed ISO text into the repository or AI context.

Instead M00 establishes the following verification register.

| NVR | Question | Status |
| :--- | :--- | :--- |
| NVR-001 | ISO/IEC 18004:2024 Ed.4 is correct normative baseline | PUBLICLY CONFIRMED |
| NVR-002 | Version 3-M Byte capacity = 42 bytes | HUMAN VERIFY REQUIRED |
| NVR-003 | Byte-mode header/count/termination/padding behavior | HUMAN VERIFY REQUIRED |
| NVR-004 | Version 3-M block/ECC/interleave parameters | HUMAN VERIFY REQUIRED |
| NVR-005 | QR function/reserved-module placement applicable to V3 | HUMAN VERIFY REQUIRED |
| NVR-006 | Data traversal + remainder behavior | HUMAN VERIFY REQUIRED |
| NVR-007 | Eight mask formulas + penalty rules | HUMAN VERIFY REQUIRED |
| NVR-008 | Tie behavior prescribed or unspecified | HUMAN VERIFY REQUIRED |
| NVR-009 | Format-information generation rules | HUMAN VERIFY REQUIRED |
| NVR-010 | Four-module quiet-zone requirement | HUMAN VERIFY REQUIRED |

The authorized human reviewer records only:
- decision
- normative reference location
- PASS / FAIL

plus project-owned implementation consequences.

No large ISO extract is required.

---

## 8. Minimal ZQE-001 Structure Is Now Defined

M00 has enough information to begin the actual `ZQE-001` specification with this anatomy:

```text
ZQE-001
QR Engine Specification — FQR-1

1.  Purpose
2.  Scope
3.  Authority Boundary
4.  Normative QR Basis
5.  FQR Profile
6.  Input Contract
7.  Capacity Contract
8.  QrSymbol
9.  Compiler Operation
10. Error Model
11. Mask Determinism
12. Renderer Boundary
13. Callable Boundary
14. Verification Requirements
15. Non-Scope
16. Invariants
17. Normative Verification Register
18. FQR Acceptance Reference
```

There is no need yet for six separate ZQE architecture documents.

---

## 9. Current M00 Freeze Board

### Frozen as working architecture

- ✅ QR Code Model 2
- ✅ Version 3
- ✅ ECC M
- ✅ Byte mode only
- ✅ fixed version
- ✅ fixed ECC
- ✅ no mode optimization
- ✅ bytes as core input
- ✅ 42-byte candidate maximum
- ✅ Payloads A–E
- ✅ QrSymbol native artifact
- ✅ compile and render separation
- ✅ API-ready / API-unaware
- ✅ structured CEngS-compliant errors
- ✅ strict structural verifier
- ✅ independent ZXing verifier candidate
- ✅ mobile verifier candidate
- ✅ integer-only SVG geometry
- ✅ no cross-language requirement for FQR-1

### Still open before M00 PASS

- ☐ Human normative verification of V3-M capacity
- ☐ Human verification of all standards-sensitive FQR rules
- ☐ Final mask tie rule
- ☐ Final quiet-zone verification
- ☐ Final ZQE-001 v1 candidate
- ☐ CEngS-000 ZII/ZQE registration applied
- ☐ RGT DRI/status formally recorded
- ☐ Verification dependency justification finalized

---

## 10. M00 Status

ZQE-M00 is now formally STARTED.

**Current disposition:**

| Workstream | Status |
| :--- | :--- |
| M00-A — Profile Freeze | CANDIDATE COMPLETE |
| M00-B — Engine Boundary | CANDIDATE COMPLETE |
| M00-C — Verification Architecture | CANDIDATE COMPLETE |
| M00-D — Governance Entry | PARTIAL |
| M00-E — Normative Verification | OPEN |

---

## 11. Summary

The strongest immediate result is that FQR-1 is no longer vague:

> **ZQE's first target is a fixed QR Code Model 2 Version 3-M Byte-mode compiler, accepting at most 42 bytes, producing a 29×29 QrSymbol, rendering deterministic SVG, and independently proving exact recovery of the supplied bytes.**

That is narrow enough to build and broad enough to prove the architecture.

**Next within M00:** the actual `ZQE-001` specification plus the normative-verification closure record; canonical `qr-core` implementation remains correctly blocked until M01.