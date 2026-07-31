export type ValidationResult<T, E> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: E;
    };

export type IdentityValidationErrorCode =
  | "INVALID_IDENTITY_ID"
  | "INVALID_IDENTITY_TYPE"
  | "INVALID_CANONICAL_REFERENCE"
  | "INVALID_REFERENT_ID"
  | "INVALID_STATUS"
  | "INVALID_CREATED_AT"
  | "INVALID_UPDATED_AT";

export type IdentityRecord = {
  identityId: string;
  identityType: string;
  canonicalReference: string;
  referentId: string | null;
  status: "draft" | "active" | "decommissioned";
  createdAt: string;
  updatedAt: string;
};

export type IdentityValidationError = {
  code: IdentityValidationErrorCode;
  field: keyof IdentityRecord;
  message: string;
};

// Strict UTC ISO-8601 validation regex
// Matches e.g. "2026-07-28T14:30:00Z" or "2026-07-28T14:30:00.123Z"
const ISO_8601_UTC_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.(\d+))?Z$/;

function isValidIso8601Utc(val: string): boolean {
  const match = ISO_8601_UTC_REGEX.exec(val);
  if (!match) {
    return false;
  }
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  const hh = parseInt(match[4], 10);
  const mm = parseInt(match[5], 10);
  const ss = parseInt(match[6], 10);

  if (m < 1 || m > 12) return false;
  if (hh < 0 || hh > 23) return false;
  if (mm < 0 || mm > 59) return false;
  if (ss < 0 || ss > 59) return false;

  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  if (isLeap) {
    daysInMonths[1] = 29;
  }

  const maxDays = daysInMonths[m - 1];
  if (d < 1 || d > maxDays) return false;

  return true;
}

/**
 * Validates raw input to produce a typed IdentityRecord or a ValidationResult error.
 * Does not throw exceptions, purely deterministic.
 */
export function validateIdentityRecord(
  input: unknown,
): ValidationResult<IdentityRecord, IdentityValidationError> {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: {
        code: "INVALID_IDENTITY_ID",
        field: "identityId",
        message: "Input must be a non-null object",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. identityId validation
  const identityId = raw.identityId;
  if (typeof identityId !== "string" || identityId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_IDENTITY_ID",
        field: "identityId",
        message: "identityId must be a non-empty string",
      },
    };
  }

  // 2. identityType validation
  const identityType = raw.identityType;
  if (typeof identityType !== "string" || identityType.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_IDENTITY_TYPE",
        field: "identityType",
        message: "identityType must be a non-empty string",
      },
    };
  }

  // 3. canonicalReference validation
  const canonicalReference = raw.canonicalReference;
  if (
    typeof canonicalReference !== "string" ||
    canonicalReference.trim() === ""
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_CANONICAL_REFERENCE",
        field: "canonicalReference",
        message: "canonicalReference must be a non-empty string",
      },
    };
  }

  // 4. referentId validation
  const referentId = raw.referentId;
  if (referentId !== null) {
    if (typeof referentId !== "string" || referentId.trim() === "") {
      return {
        ok: false,
        error: {
          code: "INVALID_REFERENT_ID",
          field: "referentId",
          message: "referentId must be either null or a non-empty string",
        },
      };
    }
  }

  // 5. status validation
  const status = raw.status;
  if (
    status !== "draft" &&
    status !== "active" &&
    status !== "decommissioned"
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_STATUS",
        field: "status",
        message: "status must be either 'draft', 'active', or 'decommissioned'",
      },
    };
  }

  // 6. createdAt validation
  const createdAt = raw.createdAt;
  if (typeof createdAt !== "string" || !isValidIso8601Utc(createdAt)) {
    return {
      ok: false,
      error: {
        code: "INVALID_CREATED_AT",
        field: "createdAt",
        message: "createdAt must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  // 7. updatedAt validation
  const updatedAt = raw.updatedAt;
  if (typeof updatedAt !== "string" || !isValidIso8601Utc(updatedAt)) {
    return {
      ok: false,
      error: {
        code: "INVALID_UPDATED_AT",
        field: "updatedAt",
        message: "updatedAt must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  const record: IdentityRecord = {
    identityId,
    identityType,
    canonicalReference,
    referentId,
    status,
    createdAt,
    updatedAt,
  };

  return {
    ok: true,
    value: record,
  };
}

/**
 * Canonically serializes an IdentityRecord deterministically.
 * Alphabetic key order: canonicalReference, createdAt, identityId, identityType, referentId, status, updatedAt
 */
export function serializeIdentityRecord(record: IdentityRecord): string {
  const ordered = {
    canonicalReference: record.canonicalReference,
    createdAt: record.createdAt,
    identityId: record.identityId,
    identityType: record.identityType,
    referentId: record.referentId,
    status: record.status,
    updatedAt: record.updatedAt,
  };
  return JSON.stringify(ordered);
}
