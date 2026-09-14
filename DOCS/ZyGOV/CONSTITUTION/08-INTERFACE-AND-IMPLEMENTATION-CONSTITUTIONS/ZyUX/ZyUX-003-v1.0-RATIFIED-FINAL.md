# ZyUX-003 — Contextual Navigation & Capability Disclosure

**Canonical ID:** `ZyUX-003`  
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
**Coordinates With:** Authority · Standing · Policy · Security · Privacy · ZYAPI · Host-Native doctrine · ZRR capability discovery  

---

## Brand Continuity Rule

This document is an **Unfict-era** ratified document. The canonical `ZyUX-*` identifier is retained to preserve citation, governance, repository, and historical continuity. Legacy documents are cited by their actual historical titles. In active prose, **Unfict** is the master brand.

Brand succession does not alter constitutional meaning. No business, epistemic, Authority, Standing, Policy, Trust, Evidence, Runtime, Receipt, API, or historical semantics are changed merely because the public master brand changed.


# 0. Scope

`ZyUX-003` governs landing, context anchors, navigation, capability disclosure, current action state, context switching, search, work queues, deep links, home surfaces, contextual administration, and human/agent/host capability discovery.

> **The user should navigate the Job, not Unfict's platform architecture.**

# 1. Core Terms

- **Experience Context** — bounded situation that determines what is useful now.
- **Context Anchor** — the primary constituent/relationship around which the current surface is organized.
- **Capability** — governed Unfict ability.
- **Affordance** — visible control representing possible invocation; not the capability itself.
- **Disclosure State** — whether capability/information existence may legitimately be revealed.
- **Current Action State** — what the current Subject may do with a disclosed capability now.

# 2. Two-Axis Model

The UX SHALL answer two different questions in order.

## Axis A — Disclosure State

```text
DISCLOSABLE
NON-DISCLOSABLE
```

If `NON-DISCLOSABLE`, the surface SHALL NOT reveal the capability/data/relationship through menu, disabled control, count, tooltip, search result, metadata hint, command palette, notification, or deep link.

## Axis B — Current Action State

Only after disclosure is legitimate, the disclosed capability may be:

```text
AVAILABLE
REQUESTABLE / ESCALATABLE
BLOCKED-BY-STATE
UNAVAILABLE / INFORMATIONAL
```

Examples:

- **AVAILABLE** — `[Approve]`
- **REQUESTABLE** — `Approval required [Request approval]`
- **BLOCKED-BY-STATE** — `[Approve] disabled — Waiting for required Evidence`
- **UNAVAILABLE / INFORMATIONAL** — capability may be shown for explanation/history but has no current request path.

Disclosure and invocation SHALL NOT be collapsed into one boolean.

# 3. Binding Laws

## ZyUX-003-S01 — Context Before Menu

The current Job/context SHOULD determine the visible experience before permanent navigation categories.

## ZyUX-003-S02 — Capability Disclosure Is Governed

Visibility SHALL derive from legitimate disclosure rules, Authority, Standing, Policy, Security/Privacy, and context—not mere product availability.

## ZyUX-003-S03 — Relationship Does Not Grant Disclosure

A relationship MAY supply context but SHALL NOT by itself establish disclosure or action availability.

## ZyUX-003-S04 — Disclosure and Invocation Are Separate

A Subject may be allowed to know a capability exists without being allowed to invoke it. Conversely, a non-disclosable capability SHALL remain undisclosed regardless of implementation availability.

## ZyUX-003-S05 — Disabled Controls Are State Communication, Not Authorization

Disabled controls SHOULD be used only where capability disclosure is legitimate and the disabled state communicates a meaningful temporary/current condition.

## ZyUX-003-S06 — Entry Intent Is Preserved

After auth/recovery/approval, the Subject SHOULD return to the initiating legitimate Job/context.

## ZyUX-003-S07 — Acting Capacity Must Be Understandable

Where multiple contexts could affect consequence, the UI SHALL make the current acting capacity/context understandable.

## ZyUX-003-S08 — No Silent Consequential Context Switch

Context switching SHALL NOT silently widen capability or cause consequential action under the wrong organization/relationship.

## ZyUX-003-S09 — Search Is Scope-Bounded

Search SHALL obey the same disclosure/scope boundaries as direct navigation.

## ZyUX-003-S10 — Navigation Does Not Create Authorization

Menu presence/absence SHALL NOT be the security boundary.

## ZyUX-003-S11 — No Deep Menu as Complexity Storage

Product growth SHALL NOT be modeled primarily by adding permanent menu depth.

## ZyUX-003-S12 — Home Is a Relevance Surface

Home SHOULD prioritize current contexts, pending Jobs, recent legitimate work, and next actions rather than a module index.

## ZyUX-003-S13 — Work Comes to the Responsible Subject

Where responsibility is clear, pending work SHOULD surface directly through legitimate queues/notifications/context.

## ZyUX-003-S14 — Contextual Administration

Controls SHOULD appear near the organization/object/relationship/source/scope they govern; use global control planes only for genuinely global Jobs.

## ZyUX-003-S15 — Host Context Is First-Class but Non-Sovereign

When a Job begins in an authorized host, legitimate host context SHOULD carry forward; host context does not become Authority.

## ZyUX-003-S16 — Semantic Parity Across Surfaces

Human UI, Host-Native, REST, SDK, MCP, agents, and public discovery may expose capabilities differently but SHALL preserve governed capability meaning.

# 4. Navigation Layers

```text
1. Entry Context
2. Context Anchor
3. Relevant Information
4. Disclosed Action State
5. Related Legitimate Context
6. Cross-Context Navigation (only when needed)
7. Global Control Plane (only for global Jobs)
```

# 5. Context Header

Where useful, surface:

```text
Shipment #882
Company A / Cairo Operations
Status: In transit
```

or an equivalent concise anchor.

Do not turn the header into a dense metadata dump.

# 6. Acting-As Indicator

A multi-context Subject may need:

```text
Acting as: Company B — Cashier
```

The indicator SHOULD become prominent before high-consequence actions where wrong-context execution is plausible.

# 7. Search / Discovery

Search SHALL NOT enumerate undisclosable Subjects, organizations, relationships, capabilities, or Evidence.

Zero-result wording SHALL NOT confirm sensitive existence.

Global search, if provided, must label context and scope.

# 8. Work Queues

Queues may include:

```text
Needs review
Assigned to me
Due today
Exceptions
Waiting for Evidence
```

Queue inclusion does not imply every action is available.

# 9. Public / Customer / Operator / Compliance / Admin Surfaces

Different archetypes may see radically different surfaces derived from the same doctrine.

Public users should not see organization navigation. Operators should not see irrelevant governance controls. Administrators should not automatically receive unrelated business data. Compliance users may receive Evidence/policy review surfaces only within governed scope.

# 10. Pricing / Feature Flags Boundary

`Not included in plan` is different from `not authorized`.

Internal feature rollout is different from Authority.

Service unavailable is different from user unauthorized.

UX SHOULD preserve those cause boundaries.

# 11. Explicit Non-Scope

This document does not define capability semantics, authorization engines, search implementation, design-system components, final mobile IA, pricing, notification transport, or host-specific UI frameworks.

# 12. Drift Prohibitions

Do not drift into:

- menu = authorization;
- hidden = secure;
- disabled buttons everywhere;
- universal dashboard;
- one navigation tree for all Subjects;
- module-first architecture;
- cross-scope search;
- global relationship discovery;
- automatic consequential context switch;
- host-native semantic fork;
- current UI caching that preserves revoked access;
- cleanliness that hides legitimate required work.

# 13. Ratification

By authority of the Chair, `ZyUX-003 v1.0` is **RATIFIED — FINAL** and inherits `ZyUX-L01` through `ZyUX-L16`.

## Ratification Grammar

For this document:

- numbered `ZyUX-*` Laws / `Sxx` clauses are binding experience doctrine;
- `SHALL` / `SHALL NOT` are mandatory;
- `SHOULD` / `SHOULD NOT` express strong defaults that may be departed from only for a documented governed reason;
- `MAY` expresses permission;
- examples, diagrams, journey sketches, and candidate labels are informative unless a binding clause expressly incorporates them;
- this document governs **experience projection** only and SHALL NOT silently acquire semantics owned by another constitutional authority.


**End of `ZyUX-003 v1.0 — RATIFIED — FINAL`**
