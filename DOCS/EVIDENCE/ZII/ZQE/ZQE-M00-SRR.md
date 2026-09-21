# ZQE-M00-SRR — FQR Standard-Readiness Review

**Version:** `1.0`
**Status:** `CLOSED — PASS`
**Milestone:** `ZQE-M00`
**Subject:** `ZQE-001 v0.2 — QR Engine Specification / FQR-1`
**Engineering Companion:** `ZQE QR Engineering Manual v0.3 — Clean-Room Implementation Edition`
**Human Reviewer:** `Chair — Zyppi Constitutional Council`
**Review Class:** `Standard-Readiness Review (SRR)`
**Target Claim:** `ISO/IEC 18004:2024 STANDARD-READY`
**Excluded Claim:** `Formally verified ISO/IEC 18004:2024 conformance`
**Date:** `25 August 2026`

---

# 1. Purpose

This review evaluates whether the bounded `zqe/fqr1` profile is sufficiently aligned with ISO/IEC 18004:2024 to be called **standard-ready** before direct access to the complete licensed 2024 publication is available.

The review does not claim formal ISO certification or full direct normative verification.

The review uses four evidence classes:

- **A — Direct 2024 Preview Evidence:** visible text from the official/current 2024 preview.
- **B — Current Symbology-Owner Evidence:** current DENSO WAVE public technical material.
- **C — Historical ISO Corroboration:** ISO/IEC 18004:2000, used only as historical engineering evidence.
- **D — Mature Independent Implementation Evidence:** current Nayuki / ZXing behavior.

A future lawful full-standard audit remains required before an unqualified direct ISO-conformance claim.

---

# 2. Review Outcomes

Allowed outcomes:

- `PASS — DIRECT 2024`
- `PASS — STANDARD-READY`
- `PASS — ZQE DETERMINISTIC DECISION`
- `CORRECTION REQUIRED`
- `FULL 2024 AUDIT DEFERRED`

A `PASS — STANDARD-READY` means the claim is strongly corroborated by current/public and historical/reference evidence but the exact 2024 normative clause has not been directly reviewed in full.

---

# 3. NVR-001 — Normative Baseline

**Question:** Is ISO/IEC 18004:2024 Edition 4 the correct normative target?

## Evidence

The 2024 preview identifies ISO/IEC 18004:2024 as the Fourth Edition, dated 2024-08, and its foreword states that it replaces ISO/IEC 18004:2015.

The preview table of contents contains the QR encoding, ECC, placement, masking, format-information, version-information and conformance sections relevant to FQR-1.

## Finding

`PASS — DIRECT 2024`

## SRR Decision

ZQE may accurately state:

> `Normative target: ISO/IEC 18004:2024 Edition 4`

Formal direct conformance remains a later claim.

---

# 4. NVR-002 — Version 3 / ECC M Structure and Capacity

**Question:** Is the FQR profile correctly frozen to V3-M with 29×29 modules, 44 data codewords, 26 ECC codewords, 70 total codewords, one block, and maximum Byte payload 42?

## Evidence

Current DENSO public material identifies Version 3 as `29×29`, with ECC-M data capacity of `352 data bits` and `42 binary bytes`.

The historical ISO edition identifies Version 3 as 70 total codewords and 7 remainder bits, and V3-M as 44 data codewords + 26 ECC codewords in one block.

Current ZXing declares Version 3 / M as one block with 44 data codewords and 26 ECC codewords.

Current Nayuki uses the same Version-3-M block constants.

## Finding

`PASS — STANDARD-READY`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

No ZQE-001 correction required.

---

# 5. NVR-003 — Byte Mode Indicator and Count Width

**Question:** Is Byte mode `0100`, with an 8-bit Character Count Indicator for Version 3?

## Evidence

The historical ISO edition explicitly assigns Byte mode indicator `0100` and an 8-bit count field for Versions 1–9.

Current mature QR implementations use the same Byte mode identifier and version-range count widths.

The 2024 preview confirms that Byte mode remains an explicit governed mode and that its encoding rules remain in the current document.

## Finding

`PASS — STANDARD-READY`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

No ZQE-001 correction required.

---

# 6. NVR-004 — Terminator, Byte Alignment and Pad Codewords

**Question:** Does FQR correctly use a zero terminator up to four bits, zero-fill the final partial byte, and alternate pad codewords `0xEC` / `0x11` until data capacity is full?

## Evidence

The historical ISO edition explicitly defines zero terminator behavior, zero padding to complete a partial codeword, and alternating `0xEC` / `0x11` pad codewords.

Current Nayuki implementations use the same procedure.

The 2024 preview shows dedicated current clauses for Terminator and Bit-stream-to-codeword conversion.

## Finding

`PASS — STANDARD-READY`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

No correction required.

---

# 7. NVR-005 — GF(256) and Reed–Solomon Semantics

**Question:** Are the FQR Reed–Solomon field and generator/remainder semantics correct?

## Evidence

The historical ISO edition defines QR Reed–Solomon over GF(256) with modulus polynomial corresponding to `0x11D`, data-codeword polynomial division, and generator-polynomial based ECC generation.

The historical V3-M profile requires 26 ECC codewords.

Current Nayuki and ZXing-compatible implementations use the same field and block/ECC structure.

The 2024 preview confirms current sections for error-correction generation and a normative generator-polynomial annex.

## Finding

`PASS — STANDARD-READY`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

No correction required.

---

# 8. NVR-006 — Model-2 Function-Pattern Geometry for Version 3

**Question:** Are the function patterns used by FQR-1 correctly structured and located?

## Evidence

The 2024 preview directly identifies finder, separator, timing and alignment patterns as QR function patterns and defines the coordinate convention.

The historical ISO edition specifies three finder patterns, one-module light separators, timing patterns on row/column 6, alignment patterns for Version 2+, Version 3 alignment coordinates `[6,22]`, and the permanent dark module through the format-information geometry.

Current ZXing Version 3 also reports alignment positions `[6,22]`.

Current Nayuki function-pattern construction agrees.

## Finding

`PASS — STANDARD-READY`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

No correction required.

---

# 9. NVR-007 — Version-3 Remainder Bits

**Question:** Does Version 3 require seven zero remainder bits?

## Evidence

The historical ISO capacity table gives Version 3 70 total codewords and 7 remainder bits.

Current mature reference implementations derive the same raw-module count and leave the Version-3 remainder cells light before masking.

## Finding

`PASS — STANDARD-READY`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

No correction required.

---

# 10. NVR-008 — Eight Mask Predicates and Tie Rule

**Question:** Are the eight mask predicates correct, and is the ZQE lowest-numeric-ID tie rule compatible?

## Evidence

The historical ISO edition specifies all eight Model-2 mask predicates and requires selection of a mask with the lowest penalty score.

Current Nayuki implements the same eight predicates.

Neither the historical ISO text reviewed here nor the available 2024 preview supplies a separate tie-break rule.

The ZQE tie rule does not select a non-minimal mask. It chooses the numerically lowest ID only from masks that share the same minimum score.

## Finding

Mask predicates:

`PASS — STANDARD-READY`

Tie rule:

`PASS — ZQE DETERMINISTIC DECISION`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

Retain:

> If multiple masks have the identical minimum score, choose the numerically lowest mask ID.

The future full 2024 audit must confirm that no new tie-specific rule overrides this freedom.

---

# 11. NVR-009 — Penalty Rules and Candidate-Scoring Semantics

**Question:** Are the penalty rules and the current ZQE candidate-scoring policy standard-ready?

## Evidence — Penalty Rules

The historical ISO edition defines the four penalty categories and constants:

```text
N1 = 3
N2 = 3
N3 = 40
N4 = 10
```

The same rule family appears in ISO/IEC 18004:2015 material and current mature implementations.

Therefore the penalty mathematics is strongly corroborated.

## Evidence — Candidate Format Information During Scoring

The current ZQE-001 v0.2 candidate says that candidate format information is written before each candidate is scored.

However:

1. the historical ISO encoding sequence performs mask selection before Format/Version Information;
2. ISO/IEC 18004:2015 retains the same sequencing and describes masking as excluding format information;
3. the 2024 preview still lists Step 6: Data masking, followed by Step 7: Format and version information;
4. Nayuki explicitly acknowledges that its choice to include candidate format bits during penalty scoring differs from the literal sequencing suggested by the specification and keeps it as a discretionary implementation choice.

For a profile whose goal is **standard-ready with minimum interpretive risk**, Zyppi should follow the conservative sequence rather than the discretionary Nayuki optimization.

## Finding

Penalty rules:

`PASS — STANDARD-READY`

Candidate-format-before-scoring policy:

`CORRECTED — PASS`

## Required Corrective Rule

For `zqe/fqr1`:

> Mask candidates SHALL be scored after applying the candidate data mask to the encoding region, while Format Information remains reserved/unwritten for the candidate-scoring stage. After the winning mask is selected, final Format Information for ECC M + selected mask SHALL be generated and written.

The strict verifier SHALL independently recompute mask optimality using the same NVR-verified scoring policy.

## SRR Decision

The corrective amendment has been applied in `ZQE-001 v0.3 — CANDIDATE` and `ZQE QR Engineering Manual v0.4 — Standard-Readiness Corrective`.

---

# 12. NVR-010 — Format Information BCH and Placement

**Question:** Are FQR format-information generation and placement standard-ready?

## Evidence

The historical ISO edition defines 15-bit Format Information, 5 data bits + 10 BCH bits, ECC level indicators including `M = 00`, the 15-bit XOR pattern represented by `0x5412`, duplicate placement around the finder regions, and the permanent dark module at `(4V+9,8)` in row/column notation.

Current Nayuki uses BCH generator `0x537`, XOR mask `0x5412`, the same ECC-bit mapping and corresponding placement geometry.

For Version 3 the permanent dark module resolves to row 21, column 8.

The 2024 preview confirms current dedicated Format Information clauses and a normative Format Information annex.

## Finding

`PASS — STANDARD-READY`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

No correction required apart from moving final format writing to after mask selection under NVR-009.

---

# 13. NVR-011 — Four-Module Quiet Zone

**Question:** Does ordinary QR Code require a four-module quiet zone, and is renderer ownership compatible?

## Evidence

The 2024 preview directly establishes that QR symbols are surrounded by a quiet zone and that symbol size is expressed separately from that quiet zone.

Current DENSO public guidance states that QR Code requires a four-module-wide clear margin on every side.

The historical ISO edition also specifies a 4X quiet zone.

## Finding

`PASS — STANDARD-READY`

`FULL 2024 AUDIT DEFERRED`

## SRR Decision

The ZQE architecture remains correct:

```text
QrSymbol = 29×29 native symbol
renderer adds 4-module quiet zone
```

No correction required.

---

# 14. Consolidated SRR Board

| NVR     | Result                               |
| ------- | ------------------------------------ |
| NVR-001 | PASS — DIRECT 2024                   |
| NVR-002 | PASS — STANDARD-READY                |
| NVR-003 | PASS — STANDARD-READY                |
| NVR-004 | PASS — STANDARD-READY                |
| NVR-005 | PASS — STANDARD-READY                |
| NVR-006 | PASS — STANDARD-READY                |
| NVR-007 | PASS — STANDARD-READY                |
| NVR-008 | PASS — STANDARD-READY / ZQE DECISION |
| NVR-009 | PASS — CORRECTED                     |
| NVR-010 | PASS — STANDARD-READY                |
| NVR-011 | PASS — STANDARD-READY                |

---

# 15. Review Disposition

Current disposition:

```text
STANDARD-READINESS EVIDENCE:
STRONG

NVR ITEMS:
11 / 11 RESOLVED FOR STANDARD-READINESS

CORRECTIVE FINDINGS:
1 FOUND
1 RESOLVED

OPEN REVIEW ACTION:
CHAIR ACCEPTANCE
```

Therefore:

> **ZQE-M00-SRR v1.0 = CLOSED — PASS**

The technical review is complete and the Chair has accepted the review record.

---

# 16. Allowed Claim After Final SRR PASS

The following claim is authorized for the engineering stage:

> **ZQE FQR-1 is engineered to be ISO/IEC 18004:2024 standard-ready.**

Meaning:

- architecture and algorithms are aligned to the current standard target;
- current authoritative/public and mature reference evidence has been reconciled;
- independent structural/interoperability proof is required;
- direct full-2024 normative audit remains deferred.

The following claims remain unauthorized until later direct normative audit / applicable certification:

```text
ISO certified
formally ISO/IEC 18004:2024 certified
directly verified against every applicable 2024 normative clause
```

---

# 17. Deferred Normative Audit

Record:

```text
NVR-NORM-001

Subject:
Direct full ISO/IEC 18004:2024 normative-source audit

Status:
DEFERRED — lawful full-standard access not presently available

Required before:
unqualified direct ISO-conformance claim

Expected effect:
verification-only unless a discrepancy is found
```

---

# 18. Final SRR Statement

The review finds no architectural defect in FQR-1.

It finds one implementation-policy issue that should be corrected in favor of the conservative standard sequence:

```text
MASK DATA
   ↓
SCORE CANDIDATES
   ↓
SELECT LOWEST-PENALTY MASK
   ↓
WRITE FINAL FORMAT INFORMATION
```

That correction has now been applied. The Chair accepts this SRR. The FQR profile is suitable for **STANDARD-READY** status.

---

# 19. Chair Acceptance Record

**Decision:** `ACCEPT`
**Reviewer:** `Chair — Zyppi Constitutional Council`
**Accepted On:** `25 August 2026`
**Disposition:** `ZQE-M00-SRR CLOSED — PASS`

The Chair accepts:

- the evidence hierarchy used by this SRR;
- all NVR-001 through NVR-011 findings;
- the NVR-009 corrective decision;
- `ZQE-001 v0.3 — CANDIDATE` as the corrected specification candidate;
- `ZQE QR Engineering Manual v0.4` as the corrected subordinate engineering companion;
- the claim boundary limiting the current engineering claim to **ISO/IEC 18004:2024 standard-ready**;
- deferral of direct full-2024 normative-source audit until lawful full-standard access is available.

No formal ISO certification or full direct normative-conformance claim is created by this acceptance.

**Final SRR Status:** `CLOSED — PASS`
