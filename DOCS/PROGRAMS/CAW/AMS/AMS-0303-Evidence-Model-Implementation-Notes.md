# AMS-0303 — Evidence Domain Model Implementation Notes

## 1. Field Mapping: CAW-008 Storage-to-Domain

The wedge's `evidence` database storage row is mapped to TypeScript field names as defined by CAW-008:

- `id` → `evidenceId`
- `identity_id` → `identityId`
- `evidence_type` → `evidenceType`
- `hash` → `hash`
- `storage_ref` → `storageRef`
- `retrieved_at` → `retrievedAt`

## 2. Metadata-Only Scope

The current implementation represents only metadata records and object storage references. Out of scope elements:

- No raw/binary payloads or parsed documents are handled.
- No cryptographic hash algorithm selection, generation, or verification is run.
- No storage key construction or object key resolution is implemented.

All retrieve, parse, and verify behaviors are deferred to the Milestone M07 Evidence Engine.

## 3. Immutability & Persistence-Level Constraints

- All fields on the `EvidenceRecord` are declared `readonly` in TypeScript to express the immutable design intent.
- There are no mutation, deletion, or lifecycle transition utilities exported from the Domain layer.
- Immutability and insert-only persistence guarantees are handled by database/storage permissions at runtime.

## 4. Open Evidence-Type Vocabulary

The `evidenceType` field remains an open string with non-empty string validation. Because no ratified finite vocabulary exists in the schema (CAW-003 / CAW-008), we do not restrict `evidenceType` to a closed union or introduce custom literal structures.

## 5. Opaque Treatment of Cryptographic Hashes

The `hash` property is treated as an opaque, non-empty string.

- No validation of hash length, hexadecimal character format, base64 encoding, or hashing algorithm is performed.
- Hashing operations and integrity verifications are deferred to M07.

## 6. Opaque Treatment of Storage References

The `storageRef` property is treated as an opaque, non-empty string representing a reference to the storage backend (such as an R2 object key).

- The Domain layer does not validate storage-key segments, parse URI schemes, or verify network availability.

## 7. Exclusion of Evidence Payloads

To preserve deterministic execution, no execution results, policy decision payloads, binary file blobs, or dynamically retrieved data are embedded inside the model.

## 8. Deferral of EvidenceBundle

`EvidenceBundle` is completely out of scope for AMS-0303. Its definition and validation are scheduled for `IT-0701` in Milestone M07.

## 9. Deferral of Storage Resolution & Hash Verification

No client, SDK, or adapter code is loaded to perform actual resolution, hash verification, or storage fetch. These tasks are scheduled for:

- `IT-0702` — Evidence reference resolver
- `IT-0703` — Hash verification
- `IT-0704` — R2 client integration
- `IT-0705` — Evidence retrieval tests

## 10. Canonical Serialization & Round-Trip Behavior

`EvidenceRecord` is serialized deterministically in strict alphabetic order:

1. `evidenceId`
2. `evidenceType`
3. `hash`
4. `identityId`
5. `retrievedAt`
6. `storageRef`

The serializer preserves all validated string values exactly without trimming, normalizations, or rewriting. Tests verify that `serialize -> JSON.parse -> validate` round-trips correctly.

## 11. Domain-Purity Mechanical Enforcement Gap

The repository-level purity validator `tools/validate-runtime-purity.mjs` evaluates only `packages/runtime` files and manifest configurations. It does not scan `packages/domain` for non-purity (such as system clock accesses or file system IO). Domain purity is therefore verified via strict review and deterministic test assertions during integration.
