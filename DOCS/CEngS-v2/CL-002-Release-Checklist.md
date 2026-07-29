# CL-002 — Release Checklist
**One page. Run this before any production release. Full rules: CEngS-102 §7–11.**

- ☐ Compilation succeeds, zero warnings
- ☐ All unit/integration tests pass
- ☐ Replay tests pass — every hash matches
- ☐ Constitutional Conformance Suite passes (CEngS-101 §5)
- ☐ Security scan (deps, secrets, license, SBOM, container) passes
- ☐ Benchmarks within policy, no unreviewed regression (CEngS-103)
- ☐ Docs synchronized (CEngS-105)
- ☐ Artifacts signed
- ☐ Build Receipt generated
- ☐ Rollback path verified (single command, previous artifact available, schema-compatible)
- ☐ Migrations (if any) versioned, tested, reviewed
- ☐ Human approval recorded
- ☐ Release Receipt generated

Only after every box is checked does the artifact become an Active Constitutional Artifact.
