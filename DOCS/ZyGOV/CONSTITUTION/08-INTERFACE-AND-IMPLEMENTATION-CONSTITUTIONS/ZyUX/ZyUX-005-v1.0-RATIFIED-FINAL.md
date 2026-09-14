# ZyUX-005 — Host-Native Experience

**Canonical ID:** `ZyUX-005`  
**Version:** **1.0**  
**Series:** `ZyUX` — Unfict Experience Architecture  
**Series Identifier Note:** `ZyUX` is retained as the canonical technical/historical series identifier under `ZUSD-001`; it does not denote the active master brand.  
**Active Master Brand:** **Unfict — Reality Sync**  
**Brand Lineage:** `Zyppi → Unfict`  
**Brand Succession Authority:** `ZUSD-001 — ZYPPI-UNFICT-SUCCESSION-DECLARATION-001 v1.0`  
**Ratification Date:** 14 September 2026  
**Status:** **RATIFIED — FINAL**  
**Classification:** Horizontal Experience Doctrine  
**Normative Level:** Experience Doctrine / Product Architecture  
**Parent Authority:** `ZyUX-000 v1.0`  
**Coordinates With:** ZYAPI · Host Adapter doctrine · Authority · Standing · Policy · Evidence · Trust · Security · Privacy · Runtime / Receipts  

---

## Brand Continuity Rule

This document is an **Unfict-era** ratified document. The canonical `ZyUX-*` identifier is retained to preserve citation, governance, repository, and historical continuity. Legacy documents are cited by their actual historical titles. In active prose, **Unfict** is the master brand.

Brand succession does not alter constitutional meaning. No business, epistemic, Authority, Standing, Policy, Trust, Evidence, Runtime, Receipt, API, or historical semantics are changed merely because the public master brand changed.


# 0. Scope

`ZyUX-005` governs how Unfict appears inside systems of record/work such as ERP, PIM, PLM, WMS, commerce platforms, government systems, developer tools, IdPs, and future authorized hosts.

> **Meet the user where the work already happens — without letting the host change what Unfict means.**

# 1. Two Forms of Nativeness

**Semantic Nativeness** — speak the language of the Job/domain/application.

**Environmental Nativeness** — operate, where practical, inside the system where the Job already occurs.

Neither transfers semantic ownership.

# 2. Core Terms

- **Host** — external system of work/record/environment.
- **Host Adapter** — governed mapping/integration layer.
- **Host-Native Extension** — user-facing projection inside host.
- **System of Record** — legitimately authoritative for some external state.
- **System of Work** — where user performs the Job.
- **Context Handoff** — legitimate host context supplied to Unfict; input, not Authority.
- **Host Projection** — presentation of governed result inside host.

# 3. Binding Laws

## ZyUX-005-S01 — Integrate, Do Not Replace

Unfict SHOULD integrate with existing systems of record/work rather than require replacement merely to deliver a capability.

## ZyUX-005-S02 — Single Governed Capability Semantic Boundary

Every public Unfict capability SHALL resolve to one governed semantic boundary beneath REST, SDK, MCP, host extensions, agents, public Resolution, and human UI.

Multiple technical implementations/adapters MAY exist. They SHALL NOT independently own or diverge business, epistemic, Evidence, Trust, authorization, Policy, failure, or Receipt meaning.

## ZyUX-005-S03 — Host Context Is Input, Not Authority

Host context SHALL NOT itself establish Unfict Authority, Standing, Trust, or truth.

## ZyUX-005-S04 — Preserve Source Provenance

Host-derived information SHALL preserve source identity/provenance where meaning depends on it.

## ZyUX-005-S05 — No Semantic Strengthening

A host projection SHALL NOT make an Unfict result stronger than governed semantics.

## ZyUX-005-S06 — No Semantic Weakening

A host projection SHALL NOT hide material uncertainty, conflict, limitation, or failure required for correct interpretation.

## ZyUX-005-S07 — Systems of Record Remain Systems of Record

Unfict SHOULD reference, query, subscribe, verify, attest, derive, or otherwise minimally consume legitimate host state rather than copy entire datasets without governed need.

## ZyUX-005-S08 — Writes Are Explicit and Authorized

Readability/visibility SHALL NOT imply permission to write. Cross-system mutation requires applicable capability, Authority, Standing, Policy, and required user/system confirmation.

## ZyUX-005-S09 — No Silent Cross-System Mutation

Where material, the experience SHOULD state the external consequence before execution.

## ZyUX-005-S10 — Reuse Legitimate Context

If the host already legitimately provides object, organization, workflow, or task context, Unfict SHOULD reuse it rather than force re-entry.

## ZyUX-005-S11 — Existing IAM Coexists

Host-Native participation SHOULD reuse legitimate enterprise SSO/IAM where appropriate.

## ZyUX-005-S12 — Host-Native Does Not Mean Host-Dependent Semantics

The same capability must remain meaningful through other authorized interfaces.

## ZyUX-005-S13 — Degraded Host Experience Fails Honestly

Integration failure, source unavailability, domain uncertainty, Evidence conflict, and Trust failure SHALL remain distinguishable.

## ZyUX-005-S14 — Deep Proof May Escape the Host

A constrained host panel MAY link to a deeper Unfict proof/control surface where full in-host depth would harm usability or disclosure safety.

## ZyUX-005-S15 — Minimal Workflow Displacement

Unfict SHOULD add the fewest new steps necessary to preserve governance, clarity, and proof.

## ZyUX-005-S16 — Host Is Not a New Domain

Adding SAP, Shopify, Oracle, a government portal, or another host SHALL NOT create new canonical semantics merely because the host vocabulary differs.

## ZyUX-005-S17 — Host and Interface Are Distinct

Host is where the Job occurs. Interface is how capability is invoked. They SHALL NOT be collapsed.

## ZyUX-005-S18 — Host Absence Is Not Negative Evidence

Missing connected host data SHALL NOT be presented as proof a condition is false/nonexistent.

# 4. Host-Native Experience Model

```text
GOVERNED CAPABILITY
+
HOST CONTEXT
+
SUBJECT
+
RELATIONSHIP CONTEXT
+
APPLICABLE AUTHORITY
+
STANDING
+
DISCLOSURE SCOPE
+
HOST UX CONSTRAINTS
=
HOST-NATIVE EXPERIENCE
```

Relationship/host context inform experience. Permission remains governed elsewhere.

# 5. Preferred Flow

```text
User works in host
→ host supplies legitimate context
→ Unfict resolves required referents/context
→ Authority / Standing / Policy / disclosure evaluated
→ governed capability invoked
→ governed result returned
→ host presents native answer/action
→ optional deep proof/control
```

# 6. Read / Write Boundary

Host read access is not write access.

Example:

```text
Unfict decision: HOLD
SAP write: failed — host unavailable
```

These are distinct states and should be shown distinctly.

# 7. Titan Coexistence

The doctrine is:

> **Integrate with the titan. Do not rebuild the titan.**

Unfict SHOULD avoid becoming a replacement ERP/PIM/PLM/WMS/CMS merely because integration exists.

# 8. Privacy / Security

Host integrations require review for token scope, IdP mapping, confused-deputy risk, stale context, cross-tenant leakage, source spoofing, write escalation, adapter compromise, deep-link leakage, marketplace permissions, and data minimization.

# 9. Explicit Non-Scope

This document does not define vendor-specific extension frameworks, OAuth/SAML mechanics, canonical mapping schema, sync engines, event buses, marketplace terms, host-specific visual design, ZYAPI wire contracts, or Trust/Policy/Runtime algorithms.

# 10. Drift Prohibitions

Do not drift into:

- host = semantic owner;
- adapter = business-logic owner;
- host assertion = verified truth;
- host context = Authority;
- read access = write permission;
- host plugin = new Domain;
- host-specific Trust/error semantics;
- copy whole tenant by default;
- green-badge proof theater;
- unavailable source = false;
- marketplace installation = organization authorization;
- integration presence = market validation.

# 11. Ratification

By authority of the Chair, `ZyUX-005 v1.0` is **RATIFIED — FINAL** and inherits `ZyUX-L01` through `ZyUX-L16`.

## Ratification Grammar

For this document:

- numbered `ZyUX-*` Laws / `Sxx` clauses are binding experience doctrine;
- `SHALL` / `SHALL NOT` are mandatory;
- `SHOULD` / `SHOULD NOT` express strong defaults that may be departed from only for a documented governed reason;
- `MAY` expresses permission;
- examples, diagrams, journey sketches, and candidate labels are informative unless a binding clause expressly incorporates them;
- this document governs **experience projection** only and SHALL NOT silently acquire semantics owned by another constitutional authority.


**End of `ZyUX-005 v1.0 — RATIFIED — FINAL`**
