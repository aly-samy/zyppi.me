# CEngS-101 — Testing & Verification Standard
**Version 2.0 · Status: RATIFIED · Authority: Operational Standard · Depends On: CEngS-001, CEngS-002, CEngS-003**
**Supersedes: CES-005 "Constitutional Testing Standard" (legacy typo'd prefix — same document)**

## 1. Purpose
Testing proves behavior, not coverage. Coverage is a metric; correctness is the objective. Passing tests are constitutional evidence of correctness, determinism, security, replayability, and performance.

## 2. The Testing Pyramid
Every feature is validated through, in order: Static Analysis → Unit Tests → Property Tests → Integration Tests → Deterministic Replay → Security Tests → Performance Tests → Constitutional Conformance Suite.

| Layer | What it proves | Required for |
|---|---|---|
| Static analysis | Types, lint, dependency direction, no circular deps, no forbidden imports | Every commit |
| Unit tests | Every public function's inputs, outputs, boundaries, errors, edge cases | Every function |
| Property tests | Invariants hold across generated inputs (identity, graph consistency, policy evaluation, capability propagation, authority resolution, evidence verification) | Critical algorithms |
| Integration tests | Cross-package behavior | Every feature |
| Deterministic replay | Identical inputs + identical Execution Context → identical outputs, hashes, receipts | Every Runtime execution — mandatory, a failure here is a constitutional violation, not a bug |
| Cross-implementation conformance | Independent language implementations (TS/Go/Rust/future) produce byte-identical artifacts, per RI-001 canonical serialization | Runtime, whenever multiple implementations exist |
| Security tests | Auth, injection, input/output validation, privilege escalation, secrets leakage, dependency vulns | Every release |
| Performance tests | See CEngS-103 | Every release |
| Mutation testing | Test suite detects intentional behavioral mutations | Critical Runtime modules, recommended |
| Failure / stress tests | Graceful behavior under DB/cache/network failure, invalid evidence, expired authority, policy conflict, sustained load | Critical components |
| Regression tests | Every fixed defect gets a permanent test; it never silently reappears | Every bugfix |

## 3. Coverage Guidance (risk-based, not a target to game)
Runtime: 100% · Policy Engine: 100% · Security Components: 100% · SDKs: ≥95% · Application Services: ≥90% · UI: ≥80%. Coverage never substitutes for correctness — a 100%-covered test that doesn't assert the right thing proves nothing.

## 4. AI-Generated Code
AI-generated code always ships with unit, integration, and replay tests plus documentation examples. Code without tests is rejected on sight — this is non-negotiable regardless of how small the change looks.

## 5. Constitutional Conformance Suite
Every release runs the full suite, verifying: CEngS compliance, POL/SEC/RI compliance, replay compliance, canonical serialization, execution receipts, dependency boundaries, architecture rules. Result is binary — pass or fail, no partial credit.

## 6. Evidence
Every test run and release produces immutable Test Evidence: version, commit, environment, execution time, results, benchmarks, replay hashes, conformance status. This evidence is retained as a constitutional artifact (see CEngS-104 for retention).

## 7. Release Gate
A release does not proceed unless: all mandatory tests pass, replay tests pass, the conformance suite passes, security scans pass, benchmarks remain acceptable, docs are current, and zero constitutional violations remain. (Full release process: CEngS-102.)
