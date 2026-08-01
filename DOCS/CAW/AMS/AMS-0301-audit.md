# AMS-0301 — Identity Domain Model Source Audit

This document records the source-level audit of `packages/domain/src/index.ts`, its test suite, implementation notes, and consistency with `CAW-003` and `CAW-008` requirements.

## 1. Audit Inquiries

### 1.1 Identity Type: Closed Enum vs. Open-Ended String

- **Status:** Open-ended string (`string`).
- **Audit Finding:** Under the user's specific guidelines for AMS-0301, creating a closed enum at this stage is explicitly avoided to prevent preempting subsequent GS1 and Referent model designs. It is validated as a non-empty trimmed string, which aligns perfectly with CAW-008's database field definition while maintaining extensibility.

### 1.2 Canonical Serialization Determinism & Insertion Order Stability

- **Status:** Proved stable.
- **Audit Finding:** Naive `JSON.stringify` on objects with different key insertion histories in JavaScript memory can produce non-identical strings. The implementation of `serializeIdentityRecord` mitigates this by constructing a new object in a strictly hardcoded alphabetical field sequence (`canonicalReference`, `createdAt`, `identityId`, `identityType`, `referentId`, `status`, `updatedAt`). This guarantees byte-level determinism.

### 1.3 Safe Deserialization and Malformed Value Protection

- **Status:** Safely handled.
- **Audit Finding:** Standard `JSON.parse` is unsafe to use alone as it does not enforce structural invariants. The established convention requires callers to feed parsed JSON objects through `validateIdentityRecord(parsed)`. Since the validator implements strict non-empty string trimming, specific value checks, and pure calendar-level date-format verification, any malformed input fails and cannot yield a false-valid `IdentityRecord`.

### 1.4 API Conventions for Reuse by AMS-0302

- **Status:** Established.
- **Audit Finding:** The exported `ValidationResult<T, E>` monadic type, the structured `IdentityValidationError` type, and the non-throwing validation function signature set a reusable standard for the remaining Leaf domain entities in milestone M03.

### 1.5 Domain Purity Gap and Mechanical Validator Extension

- **Status:** Documented.
- **Audit Finding:** The static purity and determinism validator (`tools/validate-runtime-purity.mjs`) is explicitly hardcoded to scan `packages/runtime` and its package manifest. While this leaves a theoretical enforcement gap for `packages/domain`, expanding the AST parser now is premature. The gap remains documented as an explicit future CI task for milestone M14.

---

## 2. Compliance Checklist

| Requirement                     | Implemented | Compliant | Amendment needed |
| :------------------------------ | :---------: | :-------: | :--------------: |
| **Identity fields**             |     Yes     |    Yes    |        No        |
| **Status contract**             |     Yes     |    Yes    |        No        |
| **identityType contract**       |     Yes     |    Yes    |        No        |
| **Timestamp validation**        |     Yes     |    Yes    |        No        |
| **Typed validation errors**     |     Yes     |    Yes    |        No        |
| **Deterministic serialization** |     Yes     |    Yes    |        No        |
| **Insertion-order stability**   |     Yes     |    Yes    |        No        |
| **Round-trip validation**       |     Yes     |    Yes    |        No        |
| **Domain purity enforcement**   |     Yes     |    Yes    |        No        |
