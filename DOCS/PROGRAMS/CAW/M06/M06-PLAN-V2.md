# M06-PLAN v0.2 — GS1 Digital Link Resolution Constitutional Plan

| Field                        | Value                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| **Document ID**              | `M06-PLAN`                                                                                          |
| **Revision**                 | `v0.2 — Targeted Revision per Chair Rulings`                                                        |
| **Title**                    | GS1 Digital Link Resolution Constitutional Plan                                                     |
| **Program**                  | `CAW-011 — Commerce Atlas Wedge`                                                                    |
| **Milestone**                | `M06 — GS1 Digital Link Resolution`                                                                 |
| **Status**                   | `DRAFT — REVISED PER CHAIR RULINGS — EVIDENCE VERIFICATION INCOMPLETE — NOT READY FOR RATIFICATION` |
| **Authority**                | Zyppi Constitutional Council                                                                        |
| **Implementation Authority** | `NONE`                                                                                              |
| **Predecessor Authorities**  | `CAW-003`, `CAW-008`, `CAW-011`, `M05-PLAN`, `M06-ADR`, `CCR-06-01`, `CRR-06-01`, `G-06-03 Rev.3`   |
| **Repository Evidence**      | `JRM-06-03 — Repository Evidence Package for G-06-03`                                               |
| **Downstream Artifacts**     | `AMS-0601 … AMS-0606` (one IT each)                                                                 |
| **Date**                     | August 5, 2026                                                                                      |

## 0. Revision Note (v0.1 → v0.2)

This revision incorporates the Chair's calibrated rulings on the roundtable review. It does **not** adopt Gemini's proposed fixes verbatim. Specifically:

- **F-1** → added §8 _Temporal Lifecycle Neutrality_.
- **F-2** → §22 RM-06-01 verification statement is **conditional**, not asserted.
- **F-3** → §13 Gate Status uses the Chair's exact wording; no self-declared gate closure.
- **F-4** → §12 defines AMS-0601 as **IT-0601 only** with one-IT-per-AMS discipline.
- **RT-01** → no Zyppi host allowlist; carrier syntax follows the pinned GS1 standard + approved profile.
- **RT-02 / RT-03** → §9 _AI 17 Structural Boundary_ (no century, no Gregorian conversion, not auto-routed to Policy).
- **RT-04** → typed qualifiers are included in the M06 interpretation result, separate from the Registry outcome and from K1.
- **RT-05** → uniqueness invariant preserved; enforcement mechanism deferred to Registry/schema authority.
- **RT-06** → recognized-but-unsupported AIs preserved as explicitly typed unsupported context.
- **RT-07** → normalize the identifier into K1, not the whole carrier URI.
- **Gemini Interpretation Receipt** → typed, immutable-by-value interpretation result; no direct Runtime persistence mandated.
- **INVALID_INPUT evidence lifecycle** → no retention rule added to this plan.

## 1. Purpose

M06 establishes the constitutional plan for resolving a supported GS1 Digital Link input into a Zyppi Registry result. The milestone provides a deterministic resolution path that:

- accepts a supported GS1 Digital Link input;
- interprets the supported GS1 identifier content;
- validates the applicable identifier structure;
- derives the ratified M05/M06 registry key (K1);
- invokes the existing M05 Registry boundary using that key;
- returns a typed and attributable resolution result together with a deterministic interpretation result;
- preserves the constitutional separation between external carrier syntax, internal identity representation, Registry persistence, Runtime execution, and Policy governance.

M06 is a resolution and interpretation milestone. It does not redefine Identity, alter the Registry's constitutional role, create a new identity model, authorize instance-level identity, interpret lifecycle state, perform calendar semantics, or become a Runtime evidence subsystem.

**Constitutional division of labor this plan preserves:**

> Identity interprets (M06); M05 resolves; Policy governs; Runtime executes and evidences; Security establishes trust.

## 2. Constitutional Position

M06 sits between an external GS1 Digital Link carrier and the M05 Registry:

```
Supported GS1 Digital Link Input
   │
   ▼
M06 Pure Interpretation Layer
   │  ├─ Parse supported carrier structure
   │  ├─ Extract supported GS1 identifier
   │  ├─ Validate identifier structure
   │  ├─ Normalize to the K1 registry-key contract
   │  ├─ Preserve supported qualifiers as typed interpretation context
   │  └─ Preserve recognized-but-unsupported AIs as typed unsupported context
   ▼
ValidatedCanonicalIdentifier (K1)
   ▼
M05 RegistryRepository.lookup(...)
   ▼
Typed, attributable Registry resolution result
   +
Typed, immutable-by-value M06 interpretation result
```

M06 shall not bypass the Registry, query Registry storage directly, or duplicate M05 retrieval logic.

## 3. Scope

**3.1 In Scope** — supported Digital Link interpretation; primary-GTIN extraction; structural GTIN validation; modulo-10 validation per the ratified support profile; deterministic normalization to K1; supported qualifier interpretation as typed context; recognized-but-unsupported AI preservation as typed context; separation of resolution key from qualifier/unsupported context; invocation of the existing `RegistryRepository` boundary; typed resolution and interpretation outcomes; deterministic failure classification; pure interpretation behavior; independently authored tests; architectural and constitutional verification.

**3.2 Explicitly Out of Scope** — M06 shall not: modify the M05 Registry schema to implement GS1 parsing; move GS1 parsing/normalization into the M05 adapter; redefine `Identity`; create a new Registry identity type; implement instance-level identity; treat serial/lot/expiration as part of the K1 registry key; persist qualifiers or unsupported-AI context through `canonical_reference`; authorize new qualifier storage in M05; introduce a general GS1 AI engine; implement unsupported carrier forms; perform network resolution against external GS1 services; import GS1 normative text into production source; import external GS1 conformance fixtures without verified rights; interpret identity lifecycle state; perform calendar/century semantics; become a Runtime evidence subsystem or Policy engine; authorize `AMS-0601` or any implementation; ratify production seed content.

## 4. Governing Decisions

`M06-D01 … M06-D12` from v0.1 remain in force, with the following calibrated clarifications:

- **M06-D08 (Qualifier Preservation Boundary)** — qualifiers are preserved as typed interpretation context in the M06 interpretation result; they are not part of K1 and are not persisted through `canonical_reference`.
- **M06-D12 (Registry-Key Uniqueness Invariant)** — the invariant is preserved. **The enforcement mechanism is NOT settled by this plan** and is deferred to the proper Registry/schema authority (see §17).

## 5. M06 Support Profile

The approved support profile (ratified per G-06-02) is:

| AI   | Meaning         | M06 role                                                               |
| ---- | --------------- | ---------------------------------------------------------------------- |
| `01` | GTIN            | Primary identity-bearing identifier; source of K1                      |
| `10` | Batch/Lot       | Optional typed interpretation context; not part of K1                  |
| `17` | Expiration date | Optional typed interpretation context; structural only; not part of K1 |
| `21` | Serial number   | Optional typed interpretation context; not part of K1                  |

No other AI is implicitly supported. Recognized-but-unsupported AIs are handled per §10.

## 6. Required Architectural Model

The implementation specification shall define, or provide constitutionally equivalent forms for:

- **6.1 Input Carrier** — the original supported GS1 Digital Link input; kept distinguishable from the derived registry key.
- **6.2 Interpreted Identifier** — the validated GTIN before/during normalization; preserved as a string; leading zeroes never lost.
- **6.3 Normalized Registry Key (K1)** — `NormalizedGTIN14 = string of exactly 14 decimal digits`; the value passed to `RegistryRepository.lookup(...)`.
- **6.4 Qualifier Context** — typed, supported qualifier values; separate from K1, from the M05 identity record, from the Registry resolution result, and from instance-level identity.
- **6.5 Unsupported Context** — typed, recognized-but-unsupported AI values; see §10.
- **6.6 M06 Interpretation Result** — a deterministic, typed, immutable-by-value artifact aggregating the normalized K1, qualifier context, unsupported context, and typed failure information. See §10.
- **6.7 Resolution Result** — distinguishes at minimum: successful interpretation + successful Registry resolution; successful interpretation + no Registry match; invalid/unsupported GS1 input; Registry failure; incomplete/constitutionally-invalid Registry state. These shall not be collapsed.

## 7. Resolution Outcome Semantics

- **7.1 RESOLVED** — input valid under the profile; GTIN normalized to K1; M05 lookup succeeds; M05 returns a complete, valid Registry result. May include the normalized K1, the interpretation result, the Registry result, and attributable resolution metadata.
- **7.2 NOT_FOUND** — interpretation and normalization succeed; M05 lookup succeeds; no identity found for K1. `NOT_FOUND` is neither invalid input nor infrastructure failure.
- **7.3 INVALID_INPUT** — input cannot be interpreted under the supported profile (malformed carrier, missing GTIN, invalid length, invalid check digit, invalid qualifier structure, unsupported semantic condition). Identifies the failure category without leaking implementation detail.
- **7.4 REGISTRY_FAILURE** — K1 derived successfully but M05 cannot complete the lookup due to a Registry/storage failure. Shall not be converted to `NOT_FOUND`.
- **7.5 INCOMPLETE_CONSTITUTIONAL_STATE** — M05 reports the identity exists but associated Registry state is incomplete/invalid. Preserved as distinct; M06 shall not reconstruct, repair, or supplement Registry state.

## 8. Temporal Lifecycle Neutrality _(new per F-1)_

M06 SHALL NOT infer, create, alter, or reinterpret identity lifecycle state.

After deriving the normalized K1 registry key, M06 SHALL invoke the M05 Registry through the approved Registry contract and SHALL return the attributable Registry outcome and state provided by that contract. Such outcomes may include active, suspended, decommissioned, historical, unavailable, or other contractually defined states.

M06 SHALL NOT treat a registry key as permanently bound to one identity across all time. Temporal identity continuity and lifecycle meaning remain governed by `G-06-03` and the M05 Registry contract.

## 9. AI 17 Structural Boundary _(new per RT-02 / RT-03)_

The initial M06 wedge SHALL NOT determine a Gregorian century and SHALL NOT convert AI 17 `YYMMDD` into a full calendar date.

M06 SHALL apply only the structural and standards-derived interpretation required by the approved support profile. Any further temporal or calendar semantics require separate authority and an explicitly authorized downstream consumer. Semantic date interpretation is **not** automatically routed to Policy.

M06 SHALL NOT invent a generic Gregorian interpretation for AI 17 day `00`. The structurally interpreted AI 17 value SHALL be preserved as typed interpretation context.

## 10. Interpretation Result and Context Boundary _(new per RT-04 / Gemini receipt ruling)_

M06 SHALL produce a deterministic, typed interpretation result.

Where present and supported by the approved profile, qualifier values SHALL be represented as typed interpretation context, separate from the normalized K1 registry key and separate from the M05 Registry resolution outcome.

Recognized-but-unsupported Application Identifiers SHALL be represented explicitly as unsupported interpretation context when their boundaries can be determined under the pinned GS1 authority (per RT-06). They SHALL NOT silently disappear, alter K1 derivation, or become part of the M05 registry key.

The M05 Registry SHALL NOT persist qualifiers or unsupported-AI context through the `canonical_reference` field.

The M06 interpretation result may be consumed by the Runtime for execution provenance under RI-006, but M06 SHALL NOT itself prescribe Runtime evidence persistence, retention, aggregation, or storage. The interpretation result is immutable-by-value; the Runtime decides how it is incorporated into execution evidence.

No permanent-retention, aggregation, or disposal rule for any M06 outcome (including `INVALID_INPUT`) is established by this plan; that belongs to Runtime/evidence governance.

## 11. Carrier and Registry-Key Normalization _(new per RT-01 / RT-07)_

M06 SHALL NOT require canonicalization of the complete external GS1 Digital Link URI for Registry lookup.

M06 SHALL derive the normalized 14-digit GTIN registry key from the interpreted primary identifier according to `G-06-03` and the pinned GS1 authority.

Equivalent supported carrier representations SHALL produce the same normalized K1 where the governing standards define them as representing the same primary identifier.

No Zyppi-specific host allowlist, resolver-host policy, or alternative carrier grammar is established by this plan. Accepted carrier syntax is governed by the pinned GS1 standard and the approved support profile.

## 12. AMS and CAW-011 Task Mapping _(new per F-4)_

AMS-0601 SHALL correspond exclusively to `CAW-011` task **IT-0601 — GS1 Parser**.

AMS-0601 SHALL NOT authorize the complete M06 milestone and SHALL NOT combine multiple CAW-011 implementation tasks into a single mandate.

Subsequent implementation tasks receive separate mandates in dependency order:

| AMS        | CAW-011 Task                      |
| ---------- | --------------------------------- |
| `AMS-0601` | IT-0601 — GS1 Parser              |
| `AMS-0602` | IT-0602 — GS1 Validator           |
| `AMS-0603` | IT-0603 — Digital Link Normalizer |
| `AMS-0604` | IT-0604 — Identity Resolver       |
| `AMS-0605` | IT-0605 — Parser Benchmarks       |
| `AMS-0606` | IT-0606 — Replay Validation       |

Each mandate remains independently scoped, evidenced, verified, and closed under `CEngS-003`.

## 13. Gate Status _(verbatim per F-3)_

- **G-06-01 — Standards Authority Verification:** CLOSED by the ratified `CRR-06-01` disposition, _subject to the evidence-package verification conditions recorded therein_.
- **G-06-02 — Support Profile Ratification:** CLOSED by the ratified governing support-profile decision.
- **G-06-03 — Canonical Registry-Key Contract:** CLOSED by `G-06-03 Rev.3`.
- **G-06-04 — Detailed M06 Execution Plan:** PENDING. This gate may close only through Chair ratification of the final M06-PLAN.

## 14. Dependency and Layering Rules

Unchanged from v0.1. Interpretation is pure (domain side); resolution is asynchronous application orchestration using the M05 contract; `packages/runtime` remains outside M06 implementation; dependency direction is `Application Resolution Orchestrator → Contracts/Ports → Pure Domain Model`; no circular dependencies.

## 15. Data and Persistence Rules

Unchanged from v0.1. M05 storage remains responsible for Registry records. M06 introduces no GS1-specific persistence into M05. Qualifiers and unsupported-AI context are never persisted through `canonical_reference`.

## 16. Testing and Evidence Rules

Unchanged in principle from v0.1: independently authored tests; standards-conformance and Zyppi constitutional-behavior suites kept as separate evidence classes; external-fixture import prohibited pending rights verification; no representation of internal tests as official GS1 assets.

## 17. Uniqueness Invariant — Enforcement Deferred _(per RT-05)_

The registry-key uniqueness invariant (one normalized K1 resolves to at most one authoritative identity within scope and time) is preserved per `G-06-03 Rev.3`.

**The technical enforcement mechanism is NOT selected by this plan.** The mechanism (database constraint, scoped/partial constraint, temporal exclusion, application-level invariant, or another approved means) shall be selected only within the authorized Registry/schema authority and an authorized implementation plan. Gemini's Domain-primary/database-secondary model is recorded as a reasonable future implementation position, not an authorized constitutional decision.

## 18. Security and Reliability Requirements

Unchanged from v0.1: untrusted input; deterministic rejection of malformed syntax; bounded parsing complexity; explicit input-size/structural limits; no external network dependencies during interpretation; no leakage of internal Registry detail through invalid-input responses; typed error categories; no hidden fallback.

## 19. Non-Goals and Deferred Decisions

All v0.1 deferred items remain deferred, plus: identity lifecycle interpretation; AI 17 calendar/century semantics; uniqueness-enforcement mechanism; Runtime evidence persistence/retention for M06 outcomes; any INVALID_INPUT evidence-lifecycle rule.

## 20. Implementation Deliverable Requirements

Before any AMS is issued, this plan must be ratified. Each AMS (one IT each, §12) shall define exact module/package placement, types, contracts, errors, tests, dependency constraints, authorized files, and acceptance criteria for its single IT. No AMS may reopen the K1 contract absent an explicit new Council decision.

## 21. Acceptance Criteria

Carried from v0.1, updated to reflect: K1 stated as the exact cross-milestone contract; normalization exclusively in the pure interpretation layer; M05 strict equality unchanged; qualifiers and unsupported context typed and excluded from K1; lifecycle neutrality; AI 17 structural-only handling; interpretation result immutable-by-value and not Runtime-persisted by M06; AMS↔IT one-to-one mapping; uniqueness invariant present with mechanism deferred.

## 22. RM-06-01 Evidence-Package Verification — CONDITIONAL _(per F-2)_

> The RM-06-01 evidence-package verification is **CONDITIONAL and not yet complete**. This plan does **not** assert that the Release 26.0 source locations, normative extracts, AI registry retrieval record (URL, UTC timestamp, HTTP status, payload reference, SHA-256), or the AI 01/10/17/21 verifications are present and conformant. A focused evidence verification against the `CRR-06-01` closure conditions must be completed and recorded before this plan may be submitted for ratification. Until then, G-06-01 remains _closed-subject-to-evidence-conditions_ and G-06-04 remains PENDING.

## 23. Downstream Authorization State

```
CRR-06-01  RATIFIED (conditional evidence closure)
G-06-03    RATIFIED (K1 contract established)
M06-PLAN v0.2  DRAFT — EVIDENCE VERIFICATION INCOMPLETE — NOT READY FOR RATIFICATION
AMS-0601 … AMS-0606  NOT AUTHORIZED
M06 implementation  NOT AUTHORIZED
```

## 24. Draft Status

`RATIFICATION - CLOSED by Chair ratification of M06-PLAN v0.2`

---
