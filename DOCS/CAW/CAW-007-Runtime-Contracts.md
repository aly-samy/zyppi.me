# CAW-007 — Runtime Contracts
**Version 1.0 · Status: ACTIVE · Package: `packages/runtime` · Extends: RI-006, CEngS-001 §4**

## Scope
This document defines the wedge-specific input/output shapes for `@zyppi/runtime`. It does not redefine Runtime purity, determinism, or isolation rules — those live in CEngS-001 §4 and RI-006, and apply here without exception.

## Input — `ExecutionRequest`
The Runtime receives only explicit inputs. No hidden reads of time, randomness, network, or filesystem.

```
ExecutionRequest {
  requestId: string
  identity: Identity
  activeConstitutionalView: ActiveConstitutionalView   // Identity, Relationships, Standing,
                                                          // Authorities, Capabilities, Evidence
                                                          // References, Applicable Policies —
                                                          // minimum state required, nothing more
  evidenceBundle: EvidenceBundle
  policyContext: PolicyContext
  executionContext: ExecutionContext                    // budget, entropy, versions — explicit only
}
```

## Output
```
ExecutionOutput {
  outcome: Outcome
  executionReceipt: ExecutionReceipt
  evidenceReferences: string[]
  trustResult: TrustResult
  policyDecisions: PolicyDecision[]
  diagnostics: Diagnostics
}
```

## Execution Receipt (immutable, per execution)
`Receipt ID · Execution ID · Runtime Version · Input Hash · Output Hash · Evidence Hash · Policy Version · Decision Summary · Execution Time · Deterministic Hash`

Same input → same receipt → same hash, always. This is tested at scale in CAW-011 M12 (10,000 identical executions, zero mismatches) and enforced continuously per CEngS-101 §2.

## What the Runtime Evaluates (this wedge only)
Identity validity · Evidence validity · Policy compliance · Trust requirements · Capability requirements · Authority requirements. Nothing beyond what CAW-003's domain model defines is evaluated.

## Constraints (restated as a pointer, not a new rule)
No I/O, no SQL, no HTTP, no filesystem, no hidden state, no randomness, no implicit timestamps, fully deterministic — this is CEngS-001 §4 verbatim, applied to this package. If you need an exception, it isn't a Runtime concern; move it to the Application layer (CAW-002).

## Active Constitutional View (ACV) Scope for This Wedge
Only the minimum constitutional state needed for one verification decision is loaded — not the full corpus, not speculative future fields. See CAW-003 for exactly which entities populate it.
