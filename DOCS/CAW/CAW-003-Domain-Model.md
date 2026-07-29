# CAW-003 — Domain Model
**Version 1.0 · Status: ACTIVE · Package: `packages/domain`**

## Scope
Only the entities this wedge actually uses. No future entities, no speculative fields. If a milestone needs something not listed here, add it here first — don't invent it inline in another package.

## Entities

| Entity | Represents | Notes |
|---|---|---|
| **Identity** | Persistent digital representation resolved from a Digital Link | Immutable once commissioned |
| **Referent (Product / Brand / Manufacturer)** | The real-world thing the Identity represents | Product identifies Brand and Manufacturer as related referents |
| **Evidence** | Immutable verification material (hashes, metadata) backing a claim | See CAW-009 for storage |
| **Authority** | Who/what is permitted to assert or approve a given fact | Minimal wedge scope — enough to satisfy policy checks, not a full authority engine |
| **Capability** | A bounded permission checked during policy evaluation | Minimal wedge scope |
| **Standing** | Constitutional eligibility state of an actor | Minimal wedge scope |
| **Policy** | A rule evaluated by the Runtime against Identity/Evidence/Authority/Capability | Read-only for this wedge — no policy authoring UI |
| **ExecutionRequest** | The explicit input to the Runtime | See CAW-007 |
| **ExecutionContext** | Explicit execution parameters (budget, entropy, versions) | Never implicit — CEngS-001 §4 |
| **ExecutionReceipt** | The immutable output artifact of a Runtime execution | See CAW-007 §Receipt |
| **Outcome** | The decision/result produced by policy evaluation | Feeds into the Verified Response |

## Rules
- All entities in `packages/domain` are pure data + pure validation — zero infrastructure dependency (no DB client, no HTTP, no filesystem). This is enforced by CI per CEngS-002 §4.
- Every entity supports canonical serialization (RI-001) — this is tested, not assumed.
- Identity ≠ Referent. A Product Identity is not the physical product; it represents it. Don't collapse the distinction for convenience (see WS-03A.2/.3 if you need the full constitutional reasoning — not needed for this wedge's implementation).

## Out of Scope for This Wedge
Digital Twin, Digital Product Passport, Composite Referents, multi-identity convergence, full Authority Anchor delegation chains (WS-03D). These are real constitutional constructs but are not exercised by this slice — do not build them speculatively.
