# CAW-002 — System Architecture

**Version 2.0 · Status: ACTIVE · Supersedes v1.0 (added Provisioning Flow, made Resolution carrier-agnostic)**

## Two Lifecycles, Not One

Zyppi has two distinct flows that must never be conflated: **Provisioning** (how a product becomes Zyppi-enabled, before any consumer interaction) and **Resolution** (what happens when someone interacts with an already-provisioned product). They have different owners, different triggers, and — critically — Resolution must stay identical regardless of which carrier (QR, NFC, RFID, BLE, vision, future) Provisioning chose. Mixing them would couple runtime behavior to carrier technology, which is exactly what CEngS-001 §5 (independence guarantees) exists to prevent.

## Flow 1 — Provisioning (Authoring)

_Documented here for architectural completeness. Not built by this wedge — CAW-008's seed data stands in for it. Build it only when a milestone explicitly requires it (see CAW-005/CAW-011)._

```
Create Digital Identity
      ↓
Generate GS1 Digital Link
      ↓
Validate Link
      ↓
Register Constitutional Metadata (ACV entries — CAW-003, CAW-008)
      ↓
Generate Carrier (QR / NFC / other)
      ↓
Print QR or Encode NFC
      ↓
Attach to Physical Product
      ↓
Ready for Consumer Interaction
```

Answers: **how does a product become Zyppi-enabled?**

## Flow 2 — Resolution (this wedge's actual scope)

```
Carrier Capture (scan QR / tap NFC / future: RFID, BLE, vision)
      ↓
Cloudflare Worker receives request        (CAW-010)
      ↓
Normalize Digital Link
      ↓
Resolve Identity
      ↓
Retrieve Active Constitutional View (ACV)  (CAW-007, CAW-008)
      ↓
Retrieve Evidence                          (CAW-009)
      ↓
Execute Runtime                            (CAW-007, CEngS-001 §4)
      ↓
Evaluate Policies
      ↓
Generate Execution Receipt                 (CAW-007)
      ↓
Return Verified Response                   (CAW-006)
```

Answers: **what happens when someone interacts with a Zyppi-enabled product?** The first step is deliberately named "Carrier Capture," not "Scan QR" — everything from that point on is carrier-agnostic by design. A future NFC tap, RFID read, or vision-based recognition enters at the same step and follows the identical remaining nine steps unchanged.

## Layer Responsibility (maps to CEngS-001 §3)

| Step                                    | Layer       | Owns                                                                                            |
| --------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| Carrier Capture, Worker receipt         | Gateway     | Routing, normalization, rate limiting — carrier-specific parsing lives here, nowhere downstream |
| Normalize, Resolve Identity             | Application | Request coordination, identity lookup orchestration                                             |
| ACV, Evidence, Runtime, Policy, Receipt | Runtime     | All constitutional truth-generation — carrier-blind                                             |
| —                                       | Persistence | Registry (Postgres), Evidence Store (R2) — storage only                                         |

## Non-Negotiable Boundary

Everything above the Runtime line may change per carrier or technology. The Runtime never knows or cares whether the request originated from a QR scan, an NFC tap, or a future carrier — it only ever sees a normalized `ExecutionRequest` (CAW-007). This is what makes adding a new carrier a Gateway-layer change, never a Runtime change.
