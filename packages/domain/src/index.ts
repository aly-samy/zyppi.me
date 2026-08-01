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
  readonly identityId: string;
  readonly identityType: string;
  readonly canonicalReference: string;
  readonly referentId: string | null;
  readonly status: "draft" | "active" | "decommissioned";
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type IdentityValidationError = {
  readonly code: IdentityValidationErrorCode;
  readonly field: keyof IdentityRecord;
  readonly message: string;
};

export type ReferentType = "product" | "brand" | "manufacturer";

export type ReferentRecord = {
  readonly referentId: string;
  readonly referentType: ReferentType;
  readonly name: string;
  readonly parentReferentId: string | null;
  readonly createdAt: string;
};

export type ReferentValidationErrorCode =
  | "INVALID_REFERENT_ID"
  | "INVALID_REFERENT_TYPE"
  | "INVALID_NAME"
  | "INVALID_PARENT_REFERENT_ID"
  | "SELF_REFERENCING_PARENT"
  | "INVALID_CREATED_AT";

export type ReferentValidationError = {
  readonly code: ReferentValidationErrorCode;
  readonly field: keyof ReferentRecord;
  readonly message: string;
};

export type GS1Identifier = {
  readonly gtin: string;
};

export type GS1IdentifierValidationErrorCode =
  | "INVALID_GTIN_TYPE"
  | "INVALID_GTIN_FORMAT"
  | "INVALID_GTIN_LENGTH"
  | "INVALID_GTIN_CHECK_DIGIT";

export type GS1IdentifierValidationError = {
  readonly code: GS1IdentifierValidationErrorCode;
  readonly field: keyof GS1Identifier;
  readonly message: string;
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
 * Validates raw input to produce a typed ReferentRecord or a ValidationResult error.
 * Does not throw exceptions, purely deterministic.
 */
export function validateReferentRecord(
  input: unknown,
): ValidationResult<ReferentRecord, ReferentValidationError> {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: {
        code: "INVALID_REFERENT_ID",
        field: "referentId",
        message: "referentId must be a non-empty string",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. referentId validation
  const referentId = raw.referentId;
  if (typeof referentId !== "string" || referentId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_REFERENT_ID",
        field: "referentId",
        message: "referentId must be a non-empty string",
      },
    };
  }

  // 2. referentType validation
  const referentType = raw.referentType;
  if (
    referentType !== "product" &&
    referentType !== "brand" &&
    referentType !== "manufacturer"
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_REFERENT_TYPE",
        field: "referentType",
        message:
          "referentType must be exactly 'product', 'brand', or 'manufacturer'",
      },
    };
  }

  // 3. name validation
  const name = raw.name;
  if (typeof name !== "string" || name.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_NAME",
        field: "name",
        message: "name must be a non-empty string",
      },
    };
  }

  // 4. parentReferentId validation and Direct Self-Reference Invariant
  const parentReferentId = raw.parentReferentId;
  if (parentReferentId !== null) {
    if (
      typeof parentReferentId !== "string" ||
      parentReferentId.trim() === ""
    ) {
      return {
        ok: false,
        error: {
          code: "INVALID_PARENT_REFERENT_ID",
          field: "parentReferentId",
          message: "parentReferentId must be either null or a non-empty string",
        },
      };
    }

    if (parentReferentId === referentId) {
      return {
        ok: false,
        error: {
          code: "SELF_REFERENCING_PARENT",
          field: "parentReferentId",
          message: "parentReferentId must not equal referentId",
        },
      };
    }
  }

  // 5. createdAt validation
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

  const record: ReferentRecord = {
    referentId,
    referentType,
    name,
    parentReferentId,
    createdAt,
  };

  return {
    ok: true,
    value: record,
  };
}

/**
 * Validates raw input to produce a typed GS1Identifier or a ValidationResult error.
 * Does not throw exceptions, purely deterministic.
 */
export function validateGS1Identifier(
  input: unknown,
): ValidationResult<GS1Identifier, GS1IdentifierValidationError> {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: {
        code: "INVALID_GTIN_TYPE",
        field: "gtin",
        message: "gtin must be a string",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. gtin format & type validation
  const gtin = raw.gtin;
  if (typeof gtin !== "string") {
    return {
      ok: false,
      error: {
        code: "INVALID_GTIN_TYPE",
        field: "gtin",
        message: "gtin must be a string",
      },
    };
  }

  // Exact digits validation (ASCII decimal digits only)
  if (!/^[0-9]+$/.test(gtin)) {
    return {
      ok: false,
      error: {
        code: "INVALID_GTIN_FORMAT",
        field: "gtin",
        message: "gtin must contain only ASCII decimal digits",
      },
    };
  }

  // Supported lengths: 8, 12, 13, 14
  const len = gtin.length;
  if (len !== 8 && len !== 12 && len !== 13 && len !== 14) {
    return {
      ok: false,
      error: {
        code: "INVALID_GTIN_LENGTH",
        field: "gtin",
        message: "gtin must be exactly 8, 12, 13, or 14 digits in length",
      },
    };
  }

  // Modulo-10 check-digit validation
  // 1. Exclude the final check digit.
  // 2. Starting from the rightmost remaining digit, apply alternating weights of 3 and 1.
  // 3. The rightmost digit before the check digit receives weight 3.
  // 4. Sum the weighted values.
  // 5. Calculate expected check digit: (10 - (sum % 10)) % 10.
  const digits = gtin.split("").map((c) => parseInt(c, 10));
  const suppliedCheckDigit = digits[digits.length - 1];

  let sum = 0;
  let weight = 3;
  for (let i = digits.length - 2; i >= 0; i--) {
    sum += digits[i] * weight;
    weight = weight === 3 ? 1 : 3;
  }

  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  if (suppliedCheckDigit !== expectedCheckDigit) {
    return {
      ok: false,
      error: {
        code: "INVALID_GTIN_CHECK_DIGIT",
        field: "gtin",
        message: `invalid GTIN check digit: expected ${expectedCheckDigit}, got ${suppliedCheckDigit}`,
      },
    };
  }

  const identifier: GS1Identifier = {
    gtin,
  };

  return {
    ok: true,
    value: identifier,
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

/**
 * Canonically serializes a ReferentRecord deterministically.
 * Approved alphabetical key order: createdAt, name, parentReferentId, referentId, referentType
 */
export function serializeReferentRecord(record: ReferentRecord): string {
  const ordered = {
    createdAt: record.createdAt,
    name: record.name,
    parentReferentId: record.parentReferentId,
    referentId: record.referentId,
    referentType: record.referentType,
  };
  return JSON.stringify(ordered);
}

/**
 * Canonically serializes a GS1Identifier deterministically.
 * Approved alphabetical key order: gtin
 */
export function serializeGS1Identifier(identifier: GS1Identifier): string {
  const ordered = {
    gtin: identifier.gtin,
  };
  return JSON.stringify(ordered);
}
