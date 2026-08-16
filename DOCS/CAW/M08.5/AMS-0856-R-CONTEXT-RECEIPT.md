# CEngS-003 Context Receipt — AMS-0856-R

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Official Task:** IT-0856
**Task Title:** Epistemic, Temporal & Provenance Boundary Specification
**Mandate ID:** AMS-0856-R
**Mandate Type:** Replacement / Re-authorization
**Assigned Agent:** Jules — AI Software Engineer
**Authority:** Zyppi Constitutional Council
**Implementation Authority:** **AUTHORIZED — CONSUMER-SIDE BOUNDARY ONLY**
**Constitutional Document Access:** **NONE**
**Runtime Authority:** **NONE** (`packages/runtime/` 100% protected)
**SIOS Translation Engine Authority:** **NONE** (No translation engine or logic creation)
**New Constitutional Contract Authority:** **NONE** (Must reuse existing `EpistemicRequirementContract`)

---

## 1. Context & Task Identity

This Context Receipt is produced pursuant to CEngS-003 engineering standards prior to executing repository modifications under mandate **AMS-0856-R**.

AMS-0856-R supersedes the implementation portion of the original AMS-0856 mandate following the Council's ratification of **`CONTRACT-SIOS-ZPROF-001`**. That contract establishes the consumer-side relationship where SIOS-produced requirements enter Z-PROF through the shared **Epistemic Requirement Contract** substrate without requiring Z-PROF to implement, duplicate, or simulate SIOS Translation.

---

## 2. Baseline Commitment & Environment

- **Baseline Commit:** Current repository HEAD on branch `jules-14586333695777264390-d25a72ee`.
- **Implementation Scope:** `apps/api/src/zprof/` (Fixtures, Tests, and Consumer Seam verification).
- **Protected Paths:** `packages/runtime/`, `packages/domain/`, `packages/contracts/`, `packages/shared/`, `infra/`, `edge/`.
- **Governing Contracts:**
  1. `CONTRACT-SIOS-ZPROF-001`
  2. `CONTRACT-R1`
  3. `Z-PROF-001`
  4. `AMS-0852-CONTRACT-SPEC.md`

---

## 3. Mission & Boundary Mapping

The architectural boundary being implemented is:

```
Domain Language
       │
       ▼ (SIOS Translation — Upstream Sovereign Authority)
Constitutional Concepts / Epistemic Requirement Contract
       │
       ▼ (Z-PROF Consumer Seam — Governed Substrate)
Z-PROF Composition & Structural Validation
       │
       ▼
CompositionManifest & Bound Constitutional Payload
```

### Guiding Directives:

1. **Reuse Existing Shared Substrate:** Consume SIOS-derived requirements using the existing `EpistemicRequirementContract` in `apps/api/src/zprof/types.ts`. Do not introduce SIOS-specific fields (`TranslationBindingInput`, `TranslationReference`, etc.).
2. **Zero SIOS Translation Logic:** Do not create domain-language parsers, translation algorithms, LLM prompts, or synthetic translation logic. Test fixtures must contain static, pre-translated authoritative Epistemic Requirements.
3. **Preserve Provenance & Temporal Boundaries:** Preserve explicit version binding, author/timestamp provenance, and temporal constraints (`validTimeRequired`) as defined in the existing contract without adding ambient clock dependencies or system time calls.
4. **Closed Failure Taxonomy:** Use strictly the 8 closed error codes (`unsupported`, `unavailable`, `missing`, `incompatible`, `conflicting`, `unauthorized`, `unverified`, `invalid`).

---

## 4. Planned Deliverables

1. **`apps/api/src/zprof/fixtures/siosEpistemicRequirements.ts` (NEW):** Static, contract-conforming test fixture representing an authoritative SIOS-produced Epistemic Requirement.
2. **`apps/api/src/zprof/compositionResolver.test.ts` (MODIFIED):** Suite of 10 deterministic tests (§19.1–§19.10) verifying valid consumption, missing requirement, invalid structure, version conflict, unverified trust, unauthorized requirement, temporal constraints, provenance preservation, SIOS absence, and semantic ignorance.
3. **`DOCS/CAW/M08.5/AMS-0856-R-EVR.md` (NEW):** Evidence Verification Report documenting implementation, test execution, preserved boundaries, and final disposition `VERIFIED — READY FOR HANDOFF`.

---

_Context Receipt recorded by Jules under CAW-011 Milestone M08.5 Mandate AMS-0856-R._
