import {
  validateStrictJson,
  validateReferentRecord,
  validateIdentityRecord,
  validateEvidenceRecord,
  validatePolicyRecord,
  validateAuthorityRecord,
  validateCapabilityRecord,
  validateStandingRecord,
} from "@zyppi/domain";
import type { SeedManifest } from "./seed-manifest.js";
import type { SeedExecutionOutcome } from "./seed-outcomes.js";

// Standard UUID regex (RFC 4122)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Exactly 64 lowercase hex characters
const SHA256_REGEX = /^[0-9a-f]{64}$/;

export function parseAndValidateManifest(
  rawJsonText: string,
):
  | { readonly ok: true; readonly manifest: SeedManifest }
  | { readonly ok: false; readonly outcome: SeedExecutionOutcome } {
  // 1. Load: Parse JSON
  let raw: unknown;
  try {
    raw = JSON.parse(rawJsonText);
  } catch {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        reasonCode: "INVALID_JSON",
      },
    };
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        reasonCode: "INVALID_MANIFEST_ROOT",
      },
    };
  }

  const obj = raw as Record<string, unknown>;

  // 2. Envelope structure
  const requiredKeys = [
    "manifestId",
    "manifestVersion",
    "authorityReference",
    "keyId",
    "integrityAlgorithm",
    "integrityDigest",
    "signatureAlgorithm",
    "signature",
    "records",
  ];

  // No additional top-level fields
  const actualKeys = Object.keys(obj);
  if (
    actualKeys.length !== requiredKeys.length ||
    !requiredKeys.every((k) => actualKeys.includes(k))
  ) {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        reasonCode: "INVALID_ENVELOPE_KEYS",
      },
    };
  }

  // 3. Field types & formats
  const {
    manifestId,
    manifestVersion,
    authorityReference,
    keyId,
    integrityAlgorithm,
    integrityDigest,
    signatureAlgorithm,
    signature,
    records,
  } = obj;

  if (typeof manifestId !== "string" || !UUID_REGEX.test(manifestId)) {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        reasonCode: "INVALID_MANIFEST_ID",
      },
    };
  }

  if (manifestVersion !== "1.0.0") {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "UNSUPPORTED_VERSION",
      },
    };
  }

  if (
    typeof authorityReference !== "string" ||
    authorityReference.trim() === ""
  ) {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "INVALID_AUTHORITY_REF",
      },
    };
  }

  if (typeof keyId !== "string" || keyId.trim() === "") {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "INVALID_KEY_ID",
      },
    };
  }

  if (integrityAlgorithm !== "SHA-256") {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "UNSUPPORTED_INTEGRITY_ALG",
      },
    };
  }

  if (
    typeof integrityDigest !== "string" ||
    !SHA256_REGEX.test(integrityDigest)
  ) {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "INVALID_INTEGRITY_DIGEST",
      },
    };
  }

  if (signatureAlgorithm !== "Ed25519") {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "UNSUPPORTED_SIGNATURE_ALG",
      },
    };
  }

  if (typeof signature !== "string" || signature.trim() === "") {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "INVALID_SIGNATURE",
      },
    };
  }

  // Check records envelope
  if (!records || typeof records !== "object" || Array.isArray(records)) {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "INVALID_RECORDS_CONTAINER",
      },
    };
  }

  const recs = records as Record<string, unknown>;
  const expectedCollections = [
    "referents",
    "identities",
    "evidence",
    "policies",
    "authorities",
    "capabilities",
    "standings",
  ];

  const actualCollections = Object.keys(recs);
  if (
    actualCollections.length !== expectedCollections.length ||
    !expectedCollections.every((k) => actualCollections.includes(k))
  ) {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "INVALID_RECORDS_COLLECTIONS",
      },
    };
  }

  for (const colName of expectedCollections) {
    if (!Array.isArray(recs[colName])) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "COLLECTION_NOT_ARRAY",
        },
      };
    }
  }

  // 4. Strict JSON value boundary validation
  try {
    validateStrictJson(records);
  } catch {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "STRICT_JSON_VIOLATION",
      },
    };
  }

  // Also validate signed envelope
  const signedEnvelope = {
    manifestId,
    manifestVersion,
    authorityReference,
    keyId,
    integrityAlgorithm,
    integrityDigest,
    signatureAlgorithm,
  };

  try {
    validateStrictJson(signedEnvelope);
  } catch {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "STRICT_JSON_VIOLATION",
      },
    };
  }

  // 5. Individual record-level validation through Domain validators
  const typedRecords = recs as Record<string, readonly unknown[]>;

  // Let's store set of IDs to detect duplicates
  const referentIds = new Set<string>();
  const identityIds = new Set<string>();
  const evidenceIds = new Set<string>();
  const policyIds = new Set<string>();
  const authorityIds = new Set<string>();
  const capabilityIds = new Set<string>();
  const standingIds = new Set<string>();

  // referents
  for (const ref of typedRecords.referents) {
    const res = validateReferentRecord(ref);
    if (!res.ok) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: `INVALID_REFERENT: ${res.error.message}`,
        },
      };
    }
    const id = res.value.referentId;
    if (referentIds.has(id)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "DUPLICATE_RECORD_IDENTITY",
        },
      };
    }
    referentIds.add(id);
  }

  // identities
  for (const ident of typedRecords.identities) {
    const res = validateIdentityRecord(ident);
    if (!res.ok) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: `INVALID_IDENTITY: ${res.error.message}`,
        },
      };
    }
    const id = res.value.identityId;
    if (identityIds.has(id)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "DUPLICATE_RECORD_IDENTITY",
        },
      };
    }
    identityIds.add(id);
  }

  // evidence
  for (const ev of typedRecords.evidence) {
    const res = validateEvidenceRecord(ev);
    if (!res.ok) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: `INVALID_EVIDENCE: ${res.error.message}`,
        },
      };
    }
    const id = res.value.evidenceId;
    if (evidenceIds.has(id)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "DUPLICATE_RECORD_IDENTITY",
        },
      };
    }
    evidenceIds.add(id);
  }

  // policies
  for (const pol of typedRecords.policies) {
    const res = validatePolicyRecord(pol);
    if (!res.ok) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: `INVALID_POLICY: ${res.error.message}`,
        },
      };
    }
    const id = res.value.policyId;
    if (policyIds.has(id)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "DUPLICATE_RECORD_IDENTITY",
        },
      };
    }
    policyIds.add(id);
  }

  // authorities
  for (const auth of typedRecords.authorities) {
    const res = validateAuthorityRecord(auth);
    if (!res.ok) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: `INVALID_AUTHORITY: ${res.error.message}`,
        },
      };
    }
    const id = res.value.authorityId;
    if (authorityIds.has(id)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "DUPLICATE_RECORD_IDENTITY",
        },
      };
    }
    authorityIds.add(id);
  }

  // capabilities
  for (const cap of typedRecords.capabilities) {
    const res = validateCapabilityRecord(cap);
    if (!res.ok) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: `INVALID_CAPABILITY: ${res.error.message}`,
        },
      };
    }
    const id = res.value.capabilityId;
    if (capabilityIds.has(id)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "DUPLICATE_RECORD_IDENTITY",
        },
      };
    }
    capabilityIds.add(id);
  }

  // standings
  for (const st of typedRecords.standings) {
    const res = validateStandingRecord(st);
    if (!res.ok) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: `INVALID_STANDING: ${res.error.message}`,
        },
      };
    }
    const id = res.value.standingId;
    if (standingIds.has(id)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "DUPLICATE_RECORD_IDENTITY",
        },
      };
    }
    standingIds.add(id);
  }

  // 6. Referential validation
  // referents parent
  for (const ref of typedRecords.referents) {
    const r = ref as { readonly parentReferentId: string | null };
    if (r.parentReferentId !== null && !referentIds.has(r.parentReferentId)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "REFERENTIAL_INTEGRITY_VIOLATION",
        },
      };
    }
  }

  // identities referent
  for (const ident of typedRecords.identities) {
    const i = ident as { readonly referentId: string | null };
    if (i.referentId !== null && !referentIds.has(i.referentId)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "REFERENTIAL_INTEGRITY_VIOLATION",
        },
      };
    }
  }

  // evidence identity
  for (const ev of typedRecords.evidence) {
    const e = ev as { readonly identityId: string };
    if (!identityIds.has(e.identityId)) {
      return {
        ok: false,
        outcome: {
          kind: "ValidationRefusal",
          manifestId,
          reasonCode: "REFERENTIAL_INTEGRITY_VIOLATION",
        },
      };
    }
  }

  return {
    ok: true,
    manifest: obj as unknown as SeedManifest,
  };
}
