# Zyppi API & SDK Blueprint
### Building an API Developer Experience the World Actually Loves

**Status:** Strategic Draft
**Owner:** Aly A. Samy
**Scope:** Public API surface, Developer Portal, SDK family, Sandbox, Versioning & Trust Model
**Grounding:** Zyppi North Star, Founding Principles, CAW Execution Series (M09 API Layer), CEngS Engineering Constitution, RI-005/RI-006 (Registry & Runtime), industry API-UX research

---

## 1. Why This Matters

Zyppi's moat isn't a QR generator or a routing table — it's **trusted perception**: the ability for software and AI to know that a Subject, Object, Place, or Event is real, verified, and auditable. The API is the *only* thing most of the world will ever touch of that moat. If the API feels like a generic REST wrapper, Zyppi feels like a generic company. If the API feels inevitable — fast to start, impossible to misuse, honest when it fails — Zyppi feels like infrastructure.

Developers don't fall in love with feature lists. They fall in love with **five minutes to first success, predictable behavior forever after, and never feeling lied to when something breaks.** That is the entire blueprint, expanded.

---

## 2. Design Philosophy: The API *Is* the Constitution, Made Callable

Most companies design an API and then bolt on docs. Zyppi should do the reverse: the API is simply the externally-callable surface of principles that already exist — Reality First, Trust Before Action, Explainable Execution, Every Access Method Has a Fallback. That gives Zyppi something almost no API has: **a philosophical reason every design decision is the way it is**, which is what makes an API feel coherent instead of accreted.

Five translation rules, principle → API behavior:

| Constitutional Principle | API Consequence |
|---|---|
| Reality First | Every response distinguishes verified fact from inference. No field is ever silently guessed. |
| Trust Before Action | Every mutating call requires an explicit, auditable authorization — never implicit trust from a prior call. |
| Every Decision Produces Proof | Every execution returns a receipt reference. Nothing happens invisibly. |
| Every Access Method Has a Fallback | REST, SDKs, MCP/agent tools, and webhooks all resolve to the same underlying contract — no capability is API-only or SDK-only. |
| Reality Must Never Be Fabricated | Errors are specific and honest (Error Code, Reason, Stage, Reference, Recovery) — never a generic 500. |

---

## 3. The Five UX Pillars (adapted from the research, made Zyppi-specific)

1. **Fast onboarding** — signup → API key → first verified resolution in under 5 minutes, no sales call.
2. **Obvious behavior** — one resource model, one error shape, one auth mechanism, everywhere.
3. **Strong tooling** — live sandbox, generated SDKs, OpenAPI-driven docs, an interactive console.
4. **Safe evolution** — additive-only by default, path-versioned, deprecations measured in quarters not weeks.
5. **Continuous feedback** — status page, changelog, in-product feedback, usage analytics that inform the roadmap.

Everything below is these five pillars applied to Zyppi's actual architecture.

---

## 4. API Surface Design

### 4.1 One canonical resource, not a sprawl

Zyppi's wedge is deliberately narrow (per CAW-001/CAW-006): a single verification surface —

```
GET /v1/resolve?link={GS1 Digital Link}
```

This restraint *is* the UX strategy. A developer should be able to hold the entire mental model of "what Zyppi does" in one sentence: *give me an identity carrier, get back a verified, receipted reality.* Resist the urge to ship ten endpoints in v1. Every additional endpoint should earn its place the way `/v1/resolve` did — by being the smallest possible unit of trusted value.

As the surface grows (M09 → later milestones), organize resources around the constitutional primitives, not around internal services:

```
/v1/identities        — resolve, register, list
/v1/evidence           — retrieve evidence bundles behind a verification
/v1/receipts           — fetch/replay an Execution Receipt by ID
/v1/trust              — query trust status / verification history
/v1/capabilities       — discover what an authenticated actor may do (AI-agent-friendly)
```

Naming rule: nouns are primitives (Identity, Evidence, Receipt, Trust), verbs are HTTP methods. No `/verifyProduct` or `/getStatus` — that's RPC creeping into REST and it's the single fastest way to make an API feel inconsistent.

### 4.2 Response contract

Every response — success or failure — shares one envelope:

```json
{
  "data": { },
  "receiptReference": "rcpt_...",
  "trustStatus": "definite | probable | possible | uncertain | speculative",
  "meta": { "requestId": "...", "apiVersion": "v1" }
}
```

Putting `trustStatus` and `receiptReference` on *every* response — not just verification endpoints — is a deliberate brand move. It teaches developers, one response at a time, that Zyppi never hands them an unqualified fact.

### 4.3 Error contract (already constitutional — just expose it)

CEngS-001 §7 already mandates that every failure carry an Error Code, Reason, Execution Stage, Constitutional Reference, and Recovery Guidance. This is *unusually good* raw material for API UX — most companies invent this after years of developer complaints. Expose it directly:

```json
{
  "error": {
    "code": "IDENTITY_NOT_FOUND",
    "reason": "The Digital Link resolved but no known Identity is associated with it.",
    "stage": "identity_resolution",
    "recovery": "Verify the GTIN is registered, or check whether this is a pre-commissioned identity.",
    "docs": "https://docs.zyppi.dev/errors/IDENTITY_NOT_FOUND"
  }
}
```

Every error page in the docs is generated from this same table — never hand-written twice, never drifts.

### 4.4 Versioning & backward compatibility

- Path-versioned (`/v1/`, `/v2/`), per CEngS-102 §9. A breaking change always ships as a new version — the old one keeps running.
- **Additive-first discipline**: new optional fields, new endpoints — never renamed or removed fields within a version.
- N-1 compatibility guarantee, mirrored from RI's own constitutional rule: SDKs and integrations built against the previous major version continue to work for a minimum published deprecation window (target: 12 months).
- Every deprecation ships with: an announcement, a machine-readable `Sunset` header, a migration guide, and a concrete removal date — never a silent break.

---

## 5. Developer Portal & Onboarding

**Target: unauthenticated visitor → first verified `/v1/resolve` call in under 5 minutes, without touching a sales form.**

Flow:
1. **Landing** — one sentence: *"Verify any physical product's identity, with proof."* One code sample visible without scrolling.
2. **Instant sandbox key** — email or OAuth signup, key issued immediately, pre-loaded with a handful of real, working demo GS1 Digital Links so the very first call returns real, interesting data (not `"hello world"`).
3. **"Try it now" console** — an embedded request builder that calls the *actual* sandbox, not a mock — shows the request, the response, the receipt, and a generated code snippet in the developer's language of choice, side by side.
4. **Copy-paste quickstart** — a single curl command and matching SDK snippet that reproduces the console call exactly.
5. **Guided next step** — "Now try registering your own product" — one additional call, not a ten-step tutorial.

Everything downstream (docs, SDKs, webhooks) should be discoverable from this same portal — one login, one key management screen, one usage dashboard.

---

## 6. SDK Strategy

### 6.1 Principle: SDKs are generated, not hand-authored — except the *feel*

Every constitutional field, error code, and endpoint already lives in a canonical source (RI-002's Canonical Source Model / OpenAPI derived from the Contracts package). Generate SDK method signatures, types, and error classes directly from that source of truth for every language. Hand-author only:
- the top-level ergonomics (client construction, auth, retries, pagination helpers)
- idiomatic wrappers around receipts/trust (e.g., `result.isVerified()`, not just raw enum comparison)
- language-native error types, not stringly-typed error codes

This gets Zyppi both scale (new endpoint → SDKs update automatically) and quality (the part developers actually touch every day is still hand-tuned).

### 6.2 Language priority (ship in this order)

| Tier | Languages | Rationale |
|---|---|---|
| 1 — Launch | TypeScript/JavaScript, Python | Web/backend + AI/data tooling — where GS1/DPP integrators and AI agent builders live |
| 2 — Fast follow | Go, Java/Kotlin | Enterprise backend, supply-chain & ERP integration targets |
| 3 — Ecosystem | PHP, Ruby, .NET/C#, Rust | Commerce platforms (Shopify/WooCommerce-adjacent), enterprise .NET shops, high-performance edge use |
| 4 — Community | Swift, mobile-native | Only once mobile scanning use cases justify it |

### 6.3 What every SDK must do identically

- One consistent client construction pattern: `Zyppi(apiKey)` — no config sprawl.
- Typed responses that mirror the JSON envelope exactly (`receiptReference`, `trustStatus` as first-class fields, not buried in generic `meta`).
- Built-in, sane-default retry with idempotency awareness (never silently retry a mutating call without an idempotency key).
- A `.replay()` or `.explain(receiptId)` helper — because determinism is Zyppi's actual differentiator, and no competitor's SDK can offer this. **Make it a one-line call.** This is the single highest-leverage SDK feature Zyppi can ship: `client.receipts.explain("rcpt_abc")` returning the full constitutional provenance chain (RI-006 Runtime Evidence & Explainability) in one readable object.
- Consistent pagination, consistent date/time handling (ISO 8601, always UTC), consistent enum casing.

### 6.4 AI-agent-native surface (MCP)

Because AI Agents are constitutional Subjects with equal standing (Founding Principles, Pillar III), the SDK strategy is incomplete without a first-class agent tool surface:
- Publish Zyppi as an MCP server / Claude-compatible tool set from day one of v1, not as an afterthought.
- Every tool description should carry the same explainability guarantee as the human-facing SDK — an agent calling `resolve_identity` should get back the same `trustStatus`/`receiptReference` contract, not a stripped-down version.
- This turns "AI Native" from a slide into a literal, testable capability: an agent and a developer hit the identical constitutional guarantees.

---

## 7. Documentation System

- **Single source of truth**: docs generated from the OpenAPI spec + canonical error table (CAW-006's rule that "the spec wins" applies to docs too — never let prose drift from the contract).
- **Two content types, clearly separated**:
  - *Reference* (auto-generated, exhaustive, one page per endpoint/type)
  - *Guides* (hand-written, task-based: "Verify a product," "Handle a counterfeit signal," "Build an agent tool")
- **Every code sample runnable** — sandboxed, testable in CI, so docs never silently rot when the API changes.
- **Explain trust, not just syntax** — because Zyppi's differentiator is epistemic (definite/probable/possible/uncertain/speculative), the docs need a short, excellent explainer page on what `trustStatus` actually means and why it exists. This single page does more brand work than the whole rest of the site.

---

## 8. Sandbox, Determinism & Testing — the actual differentiator

Most API sandboxes are just "the same API with fake data." Zyppi's sandbox should sell the constitutional guarantee directly:

- **Replay-as-a-feature**: any sandbox call can be replayed and will produce a byte-identical receipt hash — let developers see this for themselves. A "Replay this request" button in the console that proves determinism live is worth more than a paragraph of marketing copy.
- **Seeded, realistic demo dataset** — real-shaped GS1 Digital Links (per CAW-008 seed data), not `test-product-1`.
- **Failure simulation** — sandbox keys that deliberately trigger each documented error code, so integrators can build correct error handling *before* they ever see it in production.
- **CI-friendly** — stable sandbox credentials safe to commit into a integrator's test suite, explicitly documented as such.

---

## 9. Reliability, Trust Signals & Observability

- **Public status page** with historical uptime, incident postmortems, and live latency (tie to CAW-001 §7's <300ms p99 target — publish the number, don't just meet it privately).
- **Changelog as a product surface**, not a git log — dated, human-written, linked from every relevant doc page ("this field was added in the March release").
- **Execution Receipts double as a trust signal for the API itself** — every response is proof the system did what it claims, which is a rare thing to be able to say honestly about an API.

---

## 10. Community & Feedback Loop

- In-product feedback on every doc page ("Was this helpful?" + freeform).
- Public roadmap / changelog subscription.
- A `#zyppi-dev` or GitHub Discussions space for integrators to ask questions and see them answered publicly — reduces repeat support load and builds a searchable knowledge base for free.
- Track and publish: time-to-first-call, error rate by endpoint, docs page-to-resolution time. Feed these into CAW-013's Developer Validation criteria directly — "can a fresh engineer implement the next task without needing verbal clarification" applies just as much to external developers as internal ones.

---

## 11. Success Metrics

| Metric | Target |
|---|---|
| Time to first successful sandbox call | < 5 minutes |
| Time to first production call | < 1 day |
| % of support tickets caused by ambiguous errors | trending to ~0 (error contract should make this structurally rare) |
| SDK coverage of API surface | 100%, always in lockstep with spec |
| Breaking changes per year | 0 within a major version |
| Deprecation notice period | ≥ 12 months |
| p99 API latency | < 300ms (per CAW-001 §7) |

---

## 12. Phased Rollout

**Phase 1 — Wedge (maps to CAW M09/M11):**
`/v1/resolve` only. TypeScript + Python SDKs. Sandbox with seeded real-shaped data. Docs + error table auto-generated. Public status page live from day one.

**Phase 2 — Platform:**
Identity registration, evidence retrieval, receipt replay/explain endpoints. Go + Java SDKs. MCP/agent tool surface. Interactive console in portal.

**Phase 3 — Infrastructure:**
Webhooks, capability discovery endpoint, enterprise auth (SSO/API key scoping), remaining SDK languages, community forum, published SLAs.

---

## 13. Guardrails — What This Blueprint Deliberately Refuses To Do

- No endpoint ships without an OpenAPI definition and a generated error table entry — no "we'll document it later."
- No SDK method returns an untyped blob "for flexibility" — flexibility is a UX cost, not a feature, when it means every developer re-derives the same parsing logic.
- No breaking change ships without a version bump and a deprecation window — full stop.
- No marketing claim about determinism or trust ships without the console being able to prove it live, in front of the developer, in under one minute.

---

*This blueprint is intentionally narrow in v1 and wide in ambition — the fastest way to earn a world-class reputation is to make the first five minutes flawless, then expand the surface only as fast as that same standard can be held.*
