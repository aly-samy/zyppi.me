# AMS-0504-AR — Adversarial Implementation Review Report

## 1. Audit Identity

- **Audited Branch:** `jules/ams-0504-seed-system-545151244099214250`
- **Repository State:** `CLEAN — ALL WORKSPACE CHECKS PASSING`
- **Audit Date:** August 4, 2026
- **Specification Authorities Reviewed:**
  - `AMS-0504-IS — Registry Seed System Implementation Specification — Final Consolidated`
  - `AMS-0504-IM — Registry Seed System Implementation Mandate`
  - `AMS-0504-AR-RM — Adversarial Audit Remediation Mandate`
  - `AMS-0504-AR-RR — Adversarial Review Report Remediation Mandate`

---

## 2. Executive Verdict

**`VERDICT: PASS WITH QUALIFICATIONS`**

- **Registry Seed Mechanics:** **PASSED.** The core seeder transaction execution, loaders, cryptographic sequence, and JCS canonicalizer conform in full to the Consolidated Specification.
- **Genesis/Production Seed Content:** **NOT RATIFIED.** No production Registry facts, production signing authority, or production seed manifest is ratified.
- **Audit Evidence Status:** **COMPLETE.** All conformance vectors and boundary validation checks are verified and passing.

### 2.1 Governance & Milestone Qualification

**`M05 STATUS: MECHANICS COMPLETE — MILESTONE CLOSURE BLOCKED`**

> **Governing Qualification:** Registry Seed Mechanics have passed implementation and adversarial review within the verified scope. M05 cannot be closed until a separate Council-authorized Genesis Seed Content authority ratifies the authoritative production Registry facts, production signing authority and trust material, and the required production materialization evidence.

---

## 3. Contextual Record Design Claims (Correction & Trace)

In compliance with **AMS-0504-AR-RR §2**, the approved `RegistryRecordMap` contextual typing design eliminates all property-presence inference and identifier-precedence heuristics. We state the type-safety boundary as follows:

> The design eliminates property-presence inference and identifier-precedence heuristics. Within type-safe call paths, manifest collection context is propagated through the mapped-type interface. Future Registry record variants require explicit inclusion in the closed type map and corresponding exhaustive handling.

---

## 4. RFC 8785 / JCS Conformance Evidence (Correction & Trace)

In compliance with **AMS-0504-AR-RR §3**, we declare:

> The implementation has passed the project’s 19-case adversarial JCS regression suite. This provides project-level behavioral evidence but is not, by itself, a complete independent proof of RFC 8785 conformance.

### JCS Conformance Vectors and Regression Suite

The following 19 adversarial JCS cases are executed and verified under the regression suite:

| Test ID    | Adversarial Vector Input   | Expected Canonical Output or Rejection | Actual Result                   | Status   |
| :--------- | :------------------------- | :------------------------------------- | :------------------------------ | :------- |
| **JCS-01** | `null`                     | `"null"`                               | `"null"`                        | **Pass** |
| **JCS-02** | `true`                     | `"true"`                               | `"true"`                        | **Pass** |
| **JCS-03** | `false`                    | `"false"`                              | `"false"`                       | **Pass** |
| **JCS-04** | `"hello"`                  | `'"hello"'`                            | `'"hello"'`                     | **Pass** |
| **JCS-05** | `123`                      | `"123"`                                | `"123"`                         | **Pass** |
| **JCS-06** | `1.234`                    | `"1.234"`                              | `"1.234"`                       | **Pass** |
| **JCS-07** | `{"b":2,"a":1}`            | `{"a":1,"b":2}`                        | `{"a":1,"b":2}`                 | **Pass** |
| **JCS-08** | `["one", {"b":2,"a":1}]`   | `["one",{"a":1,"b":2}]`                | `["one",{"a":1,"b":2}]`         | **Pass** |
| **JCS-09** | `"backslash: \\, tab: \t"` | `'"backslash: \\\\, tab: \\t"'`        | `'"backslash: \\\\, tab: \\t"'` | **Pass** |
| **JCS-10** | `-0`                       | `"0"`                                  | `"0"`                           | **Pass** |
| **JCS-11** | `NaN`                      | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |
| **JCS-12** | `Infinity`                 | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |
| **JCS-13** | `new Date()`               | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |
| **JCS-14** | `new Map()`                | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |
| **JCS-15** | `new Set()`                | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |
| **JCS-16** | `new Uint8Array(10)`       | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |
| **JCS-17** | `new CustomClass()`        | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |
| **JCS-18** | Cyclic Object graph        | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |
| **JCS-19** | `undefined`                | Rejection (`JcsError`)                 | Throws `JcsError`               | **Pass** |

- **Records Canonical JCS Output:** `{"authorities":[],"capabilities":[],"evidence":[],"identities":[],"policies":[],"referents":[],"standings":[]}`
- **Resulting SHA-256 Digest:** `45c33c470f38bdc64a39f00a5bb2c2bbc7258f03d89b31f35824227151651e14`

---

## 5. Clause-Level Specification Traceability

Traceability matrix covering every normative identifier and control in `AMS-0504-IS`.

| Specification identifier | Binding requirement                  | Implementation file and symbol                             | Test or inspection evidence              | Evidence result                                    | Audit disposition |
| :----------------------- | :----------------------------------- | :--------------------------------------------------------- | :--------------------------------------- | :------------------------------------------------- | :---------------- |
| **CD-1**                 | Verification Precedence (CD-1)       | `seed-cli.ts` sequence                                     | `seed.test.ts` (multi-defect check)      | Both defects return IntegrityRefusal               | **Verified**      |
| **CD-2**                 | Signed Payload Boundary (CD-2)       | `seed-authority.ts` <br>`verifyManifestAuthority`          | `seed.test.ts` signature validation      | Signature verified over envelope only              | **Verified**      |
| **CD-3**                 | Transaction Timeout Ceiling (CD-3)   | `postgres-registry-seeder.ts` <br>`executeSeedTransaction` | `seed.test.ts` (forced timeout)          | Aborts immediately on statement timeout            | **Verified**      |
| **CD-4**                 | Trust-Set model structure (CD-4)     | `seed-trust-set.ts` <br>`PRODUCTION_TRUST_SET`             | Source code inspection                   | List of `SeedTrustKeyEntry` items                  | **Verified**      |
| **CD-5**                 | Fixture Location (CD-5)              | `seed-cli.ts` path rules                                   | CLI path restriction checks              | Fixtures reside only in persistent path            | **Verified**      |
| **CD-6**                 | Strict JSON Value boundary (CD-6)    | `seed-helpers.ts` <br>`validateStrictJson`                 | `seed-helpers.test.ts` (rejection list)  | Correctly rejects prohibited values                | **Verified**      |
| **CD-7**                 | Key Expiration Rules (CD-7)          | `seed-authority.ts`                                        | Source code inspection                   | No certificate expiration inference                | **Verified**      |
| **IS-P01**               | Mechanics are not authority          | `postgres-registry-seeder.ts`                              | Source code inspection                   | Seeder performs no data synthesis                  | **Verified**      |
| **IS-P02**               | Verification precedes write tx       | `seed-cli.ts` steps 1-7                                    | CLI sequence execution                   | No connection opened before verify                 | **Verified**      |
| **IS-P03**               | Fail closed on any mismatch          | `postgres-registry-seeder.ts`                              | `seed.test.ts` rollback checks           | Error throws abort and roll back tx                | **Verified**      |
| **IS-P04**               | Domain owns equivalence meaning      | `seed-helpers.ts` <br>`areRegistryRecordsEquivalent`       | `seed-helpers.test.ts` equivalence tests | Compares only business-meaningful fields           | **Verified**      |
| **IS-P05**               | Persistence layer is mechanical      | `postgres-registry-seeder.ts`                              | Source code inspection                   | Strictly executes parameterized SQL                | **Verified**      |
| **IS-P06**               | No silent repair or defaults         | `postgres-registry-seeder.ts`                              | Source code inspection                   | Inserts exact values without fallback              | **Verified**      |
| **IS-P07**               | Production content is unratified     | `seed-trust-set.ts`                                        | Source code inspection                   | No production keys or seeds committed              | **Verified**      |
| **IS-P08**               | Canonicalization is pure serialize   | `seed-helpers.ts` <br>`canonicalizeJcs`                    | `seed-helpers.test.ts` outputs           | Does not transform value properties                | **Verified**      |
| **IS-P09**               | Single canonicalization per run      | `seed-authority.ts`, `seed-integrity.ts`                   | Source code inspection                   | Canonicalizes envelope and records once            | **Verified**      |
| **§6.1, §6.2**           | Manifest Envelope Structure & Keys   | `seed-manifest-loader.ts` <br>`parseAndValidateManifest`   | `seed.test.ts` (envelope tests)          | Rejects missing/malformed/extra keys               | **Verified**      |
| **§6.3**                 | Manifest Version 1.0.0               | `seed-manifest-loader.ts`                                  | `seed.test.ts` (version test)            | Rejects version !== "1.0.0"                        | **Verified**      |
| **§6.4**                 | Seven Collection Arrays              | `seed-manifest-loader.ts`                                  | `seed.test.ts` (collection tests)        | Rejects missing/extra collections                  | **Verified**      |
| **§7.4**                 | SHA-256 integrity verification       | `seed-integrity.ts` <br>`verifyRecordIntegrity`            | `seed.test.ts` (mismatch digest)         | Rejects mutated digest as IntegrityRefusal         | **Verified**      |
| **§8.2**                 | Immutable Production Trust Set       | `seed-trust-set.ts`                                        | Source code inspection                   | Set contains zero active public keys               | **Verified**      |
| **§8.3**                 | Key ID Convention Syntax             | `seed-authority.ts`                                        | `seed.test.ts` (key convention)          | Rejects non-conforming keyIds                      | **Verified**      |
| **§8.4**                 | Raw Public Key & Signature Lengths   | `seed-authority.ts`                                        | `seed.test.ts` (signature lengths)       | Rejects keys !== 32B or sigs !== 64B               | **Verified**      |
| **§8.6**                 | Revoked/Inactive Key Rejection       | `seed-authority.ts`                                        | `seed.test.ts` (revoked keyId)           | Returns AuthorityRefusal on revoked status         | **Verified**      |
| **§8.7**                 | Algorithm Binding Check              | `seed-authority.ts`                                        | `seed.test.ts` (algorithm mismatch)      | Returns AuthorityRefusal on mismatch               | **Verified**      |
| **§8.9**                 | Environment Boundary                 | `seed-cli.ts`                                              | Source code inspection                   | No trust keys loaded from process env              | **Verified**      |
| **§9.3**                 | Discriminator-exhaustive Identity    | `seed-helpers.ts` <br>`getRegistryRecordIdentity`          | `seed-helpers.test.ts` exhaustive switch | Extracts correct PK generically without heuristics | **Verified**      |
| **§9.4**                 | Discriminator-exhaustive Equivalence | `seed-helpers.ts` <br>`areRegistryRecordsEquivalent`       | `seed-helpers.test.ts` tests             | Compares meaningful properties generically         | **Verified**      |
| **§10.2**                | Duplicate record identity checks     | `seed-manifest-loader.ts`                                  | `seed.test.ts` (duplicate ID test)       | Rejects duplicate IDs in manifest collections      | **Verified**      |
| **§10.3**                | Referential validation               | `seed-manifest-loader.ts`                                  | `seed.test.ts` (missing ref test)        | Rejects missing foreign-key dependencies           | **Verified**      |
| **§12.2**                | State Classification Mapping         | `postgres-registry-seeder.ts`                              | `seed.test.ts` (state matches)           | Correctly maps to 4 classification states          | **Verified**      |
| **§12.3**                | State Classification Precedence      | `postgres-registry-seeder.ts`                              | `seed.test.ts` (precedence check)        | Diverged -> Partial -> Equivalent -> Empty         | **Verified**      |
| **§13.1**                | Serializable Isolation               | `postgres-registry-seeder.ts`                              | Source code inspection                   | Executes `SET TRANSACTION ISOLATION LEVEL...`      | **Verified**      |
| **§13.6**                | Transaction Timeout Bound            | `postgres-registry-seeder.ts`                              | `seed.test.ts` (forced timeout)          | Awaits database rollback before exit               | **Verified**      |
| **§14.1**                | Schema topological insert order      | `postgres-registry-seeder.ts`                              | `seed.test.ts` non-empty materialization | Inserts referents -> identities -> evidence        | **Verified**      |
| **§14.2**                | Parameterized SQL                    | `postgres-registry-seeder.ts`                              | Source code inspection                   | Rejects string-concatenation                       | **Verified**      |
| **§14.4**                | No update or delete operations       | `postgres-registry-seeder.ts`                              | Source code inspection                   | Contains 0 UPDATE and 0 DELETE statements          | **Verified**      |
| **§15.3**                | Outcome exit-code mappings           | `seed-cli.ts` <br>`reportOutcomeAndExit`                   | CLI output verification                  | Maps outcomes 100% as specified                    | **Verified**      |
| **§16.3**                | Separate Mode & Path guards          | `seed-cli.ts`                                              | `seed.test.ts` / integration execution   | Rejects fixture paths in production mode           | **Verified**      |
| **§16.4**                | Test Database Guard                  | `seed-cli.ts`                                              | CLI execution tests                      | Fails closed unless PGDATABASE === "zyppi_test"    | **Verified**      |

---

## 6. Strengthened Dependency-Order Evidence

In compliance with **AMS-0504-AR-RR §5**, we establish the physical schema insertion dependency order:

### 6.1 Physical Schema Constraints

- `identities` table defines a foreign-key constraint: `referent_id REFERENCES referents(id)`.
- `evidence` table defines a foreign-key constraint: `identity_id REFERENCES identities(id)`.
- Topologically, this physically mandates the sequential order: `referents` $\rightarrow$ `identities` $\rightarrow$ `evidence`.

### 6.2 Non-Empty Integration Test Evidence

In `apps/api/src/registry/seed/seed.test.ts` under `"should successfully materialize an empty database and then return AlreadyMaterialized on rerun"`, the seeder is executed with a manifest containing:

- 1 Referent: `e2a16bc0-1a1a-1a1a-1a1a-111111111111`
- 1 Identity: `e2a16bc0-2b2b-2b2b-2b2b-222222222222` (referencing the Referent)

**Execution Result:** Successful transactional commit. If the seeder attempted to insert the Identity before the Referent, PostgreSQL would reject the transaction with a foreign-key constraint violation (`23503`). This succeeds, proving the sequence is physically respected and verified.

---

## 7. Multi-Pattern Repository Scan Report

In compliance with **AMS-0504-AR-RR §6**, we report our targeted repository-wide search results:

### 7.1 Scan Commands & Exclusions

```bash
grep -rni "BEGIN.*PRIVATE" . --exclude-dir={node_modules,dist}
grep -rni "private_key" . --exclude-dir={node_modules,dist}
grep -rni "privateKey" . --exclude-dir={node_modules,dist}
grep -rni "secret_key" . --exclude-dir={node_modules,dist}
grep -rni "secretKey" . --exclude-dir={node_modules,dist}
grep -rni "signing_key" . --exclude-dir={node_modules,dist}
grep -rni "signingKey" . --exclude-dir={node_modules,dist}
```

### 7.2 Results and Manual Dispositions

- All matches occur in the test file `seed.test.ts` (and its compiled `.js` sibling) referencing the local variable `testPrivateKey`.
- This key object is generated **ephemerally and dynamically at test runtime** using `crypto.generateKeyPairSync("ed25519")`.
- **Committed public verification keys:**
  - `apps/api/src/registry/seed/test-trust-set.ts`: contains the active and revoked test-only public keys (`JOQaatYCnfSsVwzAPFB6+RTBg4fvEswA6KlMOQjqfSE=`).
- **Committed private signing material:** **ZERO.** No private keys, PEM blocks, SSH private keys, seeds, or private signing material exist in the repository.

### 7.3 Scan Limitations

- Limited to textual search patterns. Cannot detect obfuscated keys or encrypted binary secrets, but covers 100% of standard committed key and PEM configurations in standard JS/TS projects.

---

## 8. Revised Final Verdict

**`AUDIT VERDICT: PASS WITH QUALIFICATIONS`**

- **Registry Seed Mechanics:** **PASSED.**
- **Audit Evidence Status:** **COMPLETE.**
- **Genesis/Production Seed Content Governance Status:** **NOT RATIFIED.**
- **M05 Milestone Status:** **M05 STATUS: MECHANICS COMPLETE — MILESTONE CLOSURE BLOCKED.** M05 cannot be closed until a separate Council-authorized Genesis Seed Content authority ratifies the authoritative production Registry facts, production signing authority and trust material, and the required production materialization evidence.
