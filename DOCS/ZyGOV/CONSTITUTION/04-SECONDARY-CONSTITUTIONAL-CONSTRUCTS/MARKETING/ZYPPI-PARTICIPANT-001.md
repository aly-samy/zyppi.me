# ZYPPI-PARTICIPANT-001

## Participant, Identity, Relationship, Authority & Experience Model

**Canonical ID:** `ZYPPI-PARTICIPANT-001`
**Version:** 1.0
**Status:** DRAFT — COUNCIL SYNTHESIS, NOT YET PROPOSED FOR RATIFICATION
**Classification:** Foundation — Product / UX / Identity
**Normative Level:** Principle
**Domain:** Product · UX/UI · Identity · Authority · Delegation · Marketing
**Date:** 5 September 2026
**Governing Authority:** NORTH STAR v7.0
**Aligned With:** What is Zyppi? v4.0 · MARKET-REALITY-001 · BRAND-001 v2.1
**Applies To:** Product · Identity & Access · UX/UI · Marketing · Developer Platform · MCP/Agent Access

---

# 0. Status Note

This document synthesizes an extended council working session (Aly + Chair). It is written in canonical form so it can be reviewed, stress-tested, and ratified — but it has **not yet been ratified**. Several sections are explicitly marked as open questions requiring product, legal, and engineering validation before they become binding.

Nothing in this document overrides NORTH STAR v7.0, MARKET-REALITY-001, or BRAND-001. Where this document proposes claims about moat, differentiation, or market validation, MARKET-REALITY-001's evidence discipline still applies — this is a UX/identity architecture document, not license to claim any of this is proven in the market.

---

# 1. Purpose

Zyppi's difficulty is that the person who **uses**, **buys**, **governs**, **integrates**, **operates**, and **benefits from** Zyppi are frequently different people — and Zyppi must work identically well for a solo dog owner, a freelancer, a multinational manufacturer, and a government regulator.

This document exists to establish:

> **One universal model of who participates in Zyppi, how their identity persists, how authority flows to them, and what they should see — so that marketing, UX/UI, and access architecture all derive from a single source of truth instead of drifting independently.**

The central governing question for every participant, in every domain:

> **What does this participant need Zyppi to know, show, decide, let them control, and prove — while hiding everything else?**

---

# 2. Governing Principles

1. **Host-Native bias.** Most participants should not need to live inside a standalone Zyppi UI. Zyppi's own console is primarily a control, governance, developer, and cross-system surface.
2. **Progressive complexity.** Simple in front. Deep and rigorous underneath.
3. **Authority-bounded visibility.** A control is shown only when it corresponds to a real, currently-held Authority for that participant's Job — never merely because the platform supports it.
4. **Federated, not hierarchical, authority.** Organizations are not assumed to be command trees. Authority is a delegation graph that can represent a sole trader, a department, a government-to-company relationship, or a consortium equally well.
5. **Identity persistence independent of everything else.** A real-world referent (person, animal, object, organization) keeps one canonical identity across employers, roles, credentials, geography, and life events.

---

# 3. Five Questions That Must Never Be Collapsed

For any interaction, Zyppi must be able to separately answer:

| Question | Meaning |
|---|---|
| **Who uses?** | Who directly interacts with Zyppi? |
| **Who benefits?** | Whose work becomes easier or safer? |
| **Who decides?** | Who grants authority or approves use? |
| **Who pays?** | Who owns the economic justification? |
| **Who is affected?** | Who or what is subject to the resulting decision? |

One person may occupy several of these roles. They are never assumed to be the same person by default (e.g., a developer who integrates ≠ the compliance officer who sets requirements ≠ the CFO who approves budget ≠ the customer affected by the outcome).

---

# 4. Universal Participation Model

Zyppi is not designed around "company users." It is designed around **participants in Reality** who can own, operate, observe, delegate, govern, verify, or act on something.

## 4.1 Participant Types (Axis A)

- Individual
- Household / informal group
- Organization (of any size, including a sole trader)
- Government / regulatory authority
- External partner / service provider
- Public observer (no account required)
- AI Agent
- Machine / device acting under delegated authority

## 4.2 Relationship / Function (Axis B)

Owner · Operator · Custodian · Observer · Issuer · Authority holder · Delegate · Verifier · Service provider · Buyer · Seller · Manufacturer · Auditor · Developer · Administrator · Agent

A single participant can hold many functions simultaneously (a farmer may be owner, operator, seller, and administrator at once). The UX is derived from the **combination currently in play**, not from a fixed persona label.

## 4.3 The Derivation Formula

```
PARTICIPANT  ×  RELATIONSHIP  ×  CURRENT CONTEXT  →  AVAILABLE CAPABILITIES
```

Example: Ahmed × Owner-of-Dog-Bruno × Emergency-context → emergency ID, vet contact, medical evidence, emergency-share. The same Ahmed, same Bruno, in a normal context, sees profile/vaccinations/insurance/sharing instead. **Same object, different context, different surface — no navigation required.**

---

# 5. Identity Architecture

## 5.1 Canonical Identity Is Not an Account

> **One real-world referent SHALL converge to one canonical Zyppi Identity wherever sufficient Evidence establishes referent equivalence.**

This applies to people, animals, organizations, and serialized objects alike. It does **not** mean accounts are blindly merged. Three distinct operations must remain separate:

1. **Identity Resolution** — does the available Evidence show these claims refer to the same referent? (SAME / DIFFERENT / UNRESOLVED / CONFLICTING — never a silent guess)
2. **Identity Consolidation** — establishing one canonical Identity, with full provenance of the records that were consolidated into it (nothing is deleted).
3. **Account/Credential Linking** — associating multiple authentication contexts (Gmail, mobile, company SSO) with that one canonical Identity.

## 5.2 Accounts, Credentials, and Identity Are Three Different Layers

```
REAL PERSON / ANIMAL / OBJECT / ORGANIZATION
        ↓
CANONICAL ZYPPI IDENTITY  (persists)
        ↓
AUTHENTICATION CONTEXTS   (Gmail, mobile, company SSO — rotate freely)
        ↓
RELATIONSHIPS / ROLES     (employer, ownership, delegation — time-bounded)
        ↓
HISTORICAL ACTIONS        (Receipts — permanent, immutable attribution)
```

Losing a company email revokes an authentication binding, not the Identity. Changing a mobile number is a credential rotation, not a new person.

## 5.3 Identity Convergence Does Not Imply Authority or Visibility Convergence

Evidence that proves "these two accounts are the same Ahmed" (e.g., matching national ID) must never itself grant Company X visibility into Ahmed's personal life, nor grant Ahmed's personal login access to corporate capability. **Identity resolution and disclosure/authority are separate authorities.**

---

# 6. Authority & Delegation Architecture

## 6.1 Organization as Authority Root, Not a Person's Account

Even for a sole trader, the organization (or the individual's own root participation) — not any single human login — is the root that holds authority, which is then delegated down, even if delegated entirely to one person. This avoids any human identity becoming a permanent "superuser key" to a piece of Reality.

## 6.2 The Federated Delegation Law

> **A participant may exercise only Authority explicitly held or legitimately delegated to them, and may delegate only a bounded subset of Authority they themselves hold and are permitted to delegate.**

No privilege appears lower in the delegation graph than what was actually granted above it. Every delegation should be capable of carrying: delegator, delegate, capability, scope, valid-from, valid-until, conditions, re-delegable (yes/no), and revocation status.

## 6.3 Authority Is Not a Fixed Org Chart

Organizations, departments, and leadership are **time-bounded structures**, not permanent trees. Departments merge, split, dissolve, or get renamed; leadership changes. Structural mutation changes the *current* structure — it must never rewrite what structure legitimately existed at a past valid time.

## 6.4 Ownership ≠ Authority ≠ Standing ≠ Role

These four are related but not interchangeable:

- **Ownership** — property/economic right
- **Authority** — the empowerment to establish, approve, or delegate a rule/action
- **Standing** — current eligibility to exercise held authority
- **Role** — the organizational capacity in which someone acts

A person can inherit ownership (e.g., company shares) while inheriting **none** of the associated authority (e.g., CEO signing power). Authority does not pass merely because ownership passes, unless a governing authority explicitly creates a successor authority.

## 6.5 Scope Isolation Is Bidirectional

> **A relationship exposes only the information, capabilities, and controls legitimately within its governed scope. Neither party gains visibility into the other's unrelated context.**

A company can see Ahmed **∩** Company-scope. Ahmed can see the company **∩** his delegation scope. Neither sees the rest.

---

# 7. Temporal & Life-Event Handling

These rules exist because people, organizations, and authority all change over time in ways that must not corrupt history.

1. **Identity Persistence** — A participant's canonical Identity persists across employers, roles, geography, authentication methods, and life state.
2. **Temporal Organizational Structure** — Org/department/leadership mutation (merge, split, dissolve, leadership change) changes current structure without rewriting historical attribution.
3. **Non-Inheritance of Delegated Authority** — Inheritable rights (property, shares, custody) may transfer through lawful succession; personal, employment, office, or delegated authority does not, unless explicitly re-granted by a governing authority.
4. **Delegation Revocability Without History Rewrite** — Ending a relationship revokes *future* capability; it does not undo the validity of actions legitimately taken while the delegation was active.
5. **Authentication Independence** — Adding, rotating, suspending, or revoking a credential (email, phone, SSO) never changes the canonical Identity behind it.
6. **Historical Attribution Without Perpetual Access** — What someone *did* remains permanently attributable to them; what they can still *see* about it is governed separately by current disclosure/retention policy.
7. **Life-State Transition (e.g., Death)** — A life-state change (backed by accumulating Evidence, not a single click) suspends active participation and authority, and may trigger succession for inheritable relationships — but it never erases Identity or rewrites history.

> **Zyppi preserves continuity of Identity while allowing discontinuity of Authority.**

## 7.1 Worked Example — Ahmed

Ahmed holds one persistent Identity. Over time he: works mornings at Company A (accountant), works nights at Company B (cashier), registers his cat's NFC chip personally, freelances for Company X, gets fired from Company A, changes his mobile number, and eventually dies.

Throughout this: Company A never sees his cat or Company B; his cat ownership is untouched by his firing; his Identity survives his revoked company email because Gmail/mobile remain valid credentials; a 2025 invoice approval remains attributed to "Ahmed, acting as Accountant at Company A, under valid delegation on that date" even after he's fired, changed countries, and changed jobs; on his death, his Identity is not deleted — his life-state changes, active authority is suspended pending legal process, inheritable assets (e.g., his cat's custody, any property) enter succession, but no company authority passes to his heirs. This example should be retained as the canonical stress-test for the model.

---

# 8. Persona Families (Interaction Archetypes)

These are useful lenses for marketing and UX, layered **on top of** the universal participant model above — not a replacement for it.

| Family | Job | Primary Surface |
|---|---|---|
| Technical Implementer (dev/SI/agency) | "Give me a reliable capability I can integrate quickly" | SDK / API / docs |
| Operational User (warehouse, service, ops) | "Tell me what to do with this item/case" | Host-Native UI |
| Governance/Compliance User | "Ensure decisions follow rules and can be defended later" | Host-Native + governance console |
| Host / System Owner (ERP, PIM, WMS admin) | "What are you reading/writing in my system, under what authority?" | Their own system + connection permissions |
| Organizational Administrator | "Configure Zyppi safely across my org" | Zyppi control plane |
| Economic Buyer / Executive | "What is this doing for my org, why keep paying?" | Report/dashboard |
| Auditor / External Authority | "Show me what happened and why, without over-access" | Audit/Receipt portal |
| AI Agent / Application | "Discover what I'm allowed to do and execute it" | MCP/API |
| Public Observer | "What is this, can I trust it?" (no account needed) | Public scan/resolution surface |

### Anti-Personas (protect the thin-layer thesis)

- Someone who wants a general CMS
- A generic BI analyst wanting dashboards over all enterprise data
- A generic workflow-builder buyer
- An ERP-replacement buyer

If the Job reduces to one of these, the participant is not a Zyppi fit — flag rather than force it.

---

# 9. Control Taxonomy

Rather than designing screens first, define the **kinds** of control Zyppi can expose:

1. **Identity & Access** — who may enter, on whose behalf
2. **Source Connection** — what systems/data Zyppi may observe
3. **Authority & Standing** — who may assert/approve what
4. **Policy** — under what conditions actions may occur
5. **Evidence** — what's required/accepted/visible
6. **Execution** — what runs automatically vs. requires review
7. **Exception & Override** — who may override, and how it's recorded
8. **Privacy & Disclosure** — who can see what
9. **Audit & Proof** — what can be reconstructed/exported/verified

## 9.1 The Core UX Law

> **A user SHALL NOT be shown a control merely because Zyppi technically supports it. The control must correspond to that user's Job and legitimate Authority. Unavailable authority should ordinarily be invisible, not merely disabled.**

## 9.2 Progressive Control Depth

- **Level 1 — Action:** Release / Hold / Review
- **Level 2 — Reason:** "Held because supplier certificate expired"
- **Level 3 — Basis:** Certificate ID, expiry date, governing Authority, Policy version
- **Level 4 — Full Proof:** Evidence, provenance, policy, valid-time, Receipt

Most users stay at Level 1–2. Experts drill down. The same rule governs MCP/agent capability discovery: an agent sees `available: true/false` plus a reason, never the whole constitutional machine.

---

# 10. Account Creation & Onboarding

## 10.1 Target Flow

```
Sign up / Log in
        ↓
Create organization  OR  Join organization  OR  Claim (e.g., scan an NFC-chipped item)  OR  Accept invitation
        ↓
Zyppi derives legitimate capabilities from context
        ↓
Only relevant actions/settings are shown
        ↓
Work begins
```

No forced department/industry/persona/module wizard. If Ahmed arrives via an invitation, he sees "Company X invited you to Operations/Cairo Branch — Accept." If he arrives by scanning his dog's chip, he sees "This animal has a Zyppi identity — Claim ownership / Report found / View public emergency info."

## 10.2 Delegation as a Simple, Universal Interaction

The same pattern — "who, can-do-what, for-what, for-how-long, can-they-delegate-further" — should express delegation from a company to a logistics provider, a manager to an employee, a farmer to a worker, or one individual sharing car access with another. Underneath: full constitutional delegation machinery (authority, scope, valid-time, revocability, provenance, Receipt). On top: a short, human form.

## 10.3 Recovery (Open Question)

"No master key" creates a real recovery problem: what happens when a sole owner loses access? This requires governed recovery — multiple org admins, verified-ownership recovery, enterprise IdP, quorum for high-sensitivity orgs, time-delayed/audited emergency recovery — scaled to organization risk. **This is flagged as an open design question, not yet resolved.**

---

# 11. Cross-Domain Worked Examples

Kept intentionally varied to prevent the model from silently re-collapsing into a commerce-only, enterprise-only design.

- **Individual + pet:** Man creates account, claims dog's NFC chip, attaches vet/vaccination/insurance/emergency evidence, delegates scoped access to a vet or dog-walker.
- **Farmer:** Registers fields/trees/harvest batches; delegates treatment-recording to a worker, certification to an agronomist, provenance-viewing to a buyer or inspector — without an enterprise-style admin panel.
- **Restaurant owner:** Branch → kitchen/table/storage; owner, branch manager, chef, waiter, external inspector, and accountant each see only their scope.
- **Freelancer:** Behaves like a one-person organization without needing to think like an enterprise admin; delegates project-scoped visibility to clients, accountants, subcontractors.
- **Government → Company:** Regulator holds an independent authority relationship (e.g., scoped inspection rights) — it does not become the company's administrator; the company separately delegates internally.
- **Company → Logistics provider → Driver:** Authority narrows at each hop (custody confirmation, delivery, damage report) without ever granting ownership or compliance-editing rights.
- **Individual → Individual:** Car owner delegates temporary, non-re-delegable use to another person, time-boxed.
- **Camera manufacturer (ZyPub compliance):** Manufacturer holds device-certification authority; engineering, compliance, and factory functions get different delegated scopes; an individual camera's Standing changes again once a customer claims ownership.
- **Retail customer:** A public (unauthenticated) observer sees public product/recall/warranty-terms information; upon purchase/registration, Standing changes and new actions (register, claim, transfer ownership) appear — same object, new Standing, new surface.

---

# 12. Control Entitlement Matrix (Illustrative — Not Final)

| Control | Developer | Ops | Compliance | Admin | Executive | Auditor | Agent |
|---|---|---|---|---|---|---|---|
| Invoke capability | ✓ | via host | maybe | ✓ | — | — | ✓ |
| Connect source | limited | — | — | ✓ | — | — | — |
| Edit policy | — | — | ✓ | scoped | — | — | — |
| Override decision | — | scoped | scoped | governed | — | — | — |
| View Evidence | scoped | relevant | ✓ | ✓ | summarized | scoped | machine-scoped |
| View Receipt | ✓ | ✓ | ✓ | ✓ | summarized | ✓ | ✓ |
| Manage users | — | — | — | ✓ | — | — | — |
| View economics | usage | — | risk | usage | ✓ | audit only | — |

Values are illustrative placeholders for future UI-permission design, not commitments.

---

# 13. Horizon Prioritization

**Baby / Year 1** — technical implementer, organizational administrator, lightweight operational observer; economic buyer reached indirectly via a "buyer bridge," not a dedicated surface.

**Grow / Year 2–3** — governance/compliance, system/data owner, operational users (via Host-Native), auditor, AI agents.

**Later** — multi-organization/federated authority at scale, ecosystem developers, third-party capability providers, broader domain-specific roles.

This sequencing prevents building deep dashboards for personas that have no product yet, consistent with MARKET-REALITY-001's "expansion must be earned" discipline.

---

# 14. Open Questions Requiring Further Work

1. Account recovery model for sole owners / high-sensitivity organizations (§10.3).
2. Exact retention/visibility policy for a departed employee's access to their own historical company-scoped data.
3. Legal/jurisdictional variation in succession handling (ownership transfer rules differ by country).
4. Minimum viable identity-resolution evidence bar (which combinations of matching signals are sufficient vs. merely suggestive).
5. Whether "context switching" in the UI (Personal / Company A / Company B) should be manual, automatic-by-object, or both.
6. How public (unauthenticated) observer interactions convert into authenticated ownership/Standing without friction.

---

# 15. Relationship to Marketing & UX

This document is intended to be the **single source of truth** feeding three downstream projections, to prevent drift:

```
ZYPPI-PARTICIPANT-001
        │
   ┌────┼────┐
   ▼    ▼    ▼
Marketing  UX/UI  ZYAPI (developer/agent access)
messaging  surfaces
```

Marketing personas, UX permission models, and API/MCP capability discovery should all be **expressions** of the participant/authority model above, not independently maintained documents.

---

# 16. Status and Next Steps

This is a **council synthesis draft**. Before ratification it needs:

- Legal review of the succession/inheritance claims (§7, §11) against actual jurisdictional variation — these are currently product-doctrine statements, not verified legal claims.
- Engineering feasibility review of the identity-resolution and scope-isolation model against current architecture.
- At least directional user validation (per the project's existing evidence discipline) before any of this is treated as a proven UX approach rather than a working hypothesis.

**Disposition upon further work:** Recommend routing this to the ICP/Buyer Doctrine and Positioning & Messaging House drafts next, since this document materially shapes both.
