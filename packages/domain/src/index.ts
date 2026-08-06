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

export type EvidenceRecord = {
  readonly evidenceId: string;
  readonly identityId: string;
  readonly evidenceType: string;
  readonly hash: string;
  readonly storageRef: string;
  readonly retrievedAt: string;
};

export type EvidenceValidationErrorCode =
  | "INVALID_EVIDENCE_ID"
  | "INVALID_IDENTITY_ID"
  | "INVALID_EVIDENCE_TYPE"
  | "INVALID_HASH"
  | "INVALID_STORAGE_REF"
  | "INVALID_RETRIEVED_AT";

export type EvidenceValidationError = {
  readonly code: EvidenceValidationErrorCode;
  readonly field: keyof EvidenceRecord;
  readonly message: string;
};

export type AuthorityRecord = {
  readonly authorityId: string;
  readonly subjectId: string;
  readonly scope: string;
  readonly validFrom: string;
  readonly validTo: string;
};

export type AuthorityValidationErrorCode =
  | "INVALID_AUTHORITY_ID"
  | "INVALID_SUBJECT_ID"
  | "INVALID_SCOPE"
  | "INVALID_VALID_FROM"
  | "INVALID_VALID_TO"
  | "VALID_TO_BEFORE_VALID_FROM";

export type AuthorityValidationError = {
  readonly code: AuthorityValidationErrorCode;
  readonly field: keyof AuthorityRecord;
  readonly message: string;
};

export type CapabilityRecord = {
  readonly capabilityId: string;
  readonly subjectId: string;
  readonly scope: string;
  readonly validFrom: string;
  readonly validTo: string;
};

export type CapabilityValidationErrorCode =
  | "INVALID_CAPABILITY_ID"
  | "INVALID_SUBJECT_ID"
  | "INVALID_SCOPE"
  | "INVALID_VALID_FROM"
  | "INVALID_VALID_TO"
  | "VALID_TO_BEFORE_VALID_FROM";

export type CapabilityValidationError = {
  readonly code: CapabilityValidationErrorCode;
  readonly field: keyof CapabilityRecord;
  readonly message: string;
};

export type StandingRecord = {
  readonly standingId: string;
  readonly subjectId: string;
  readonly scope: string;
  readonly validFrom: string;
  readonly validTo: string;
};

export type StandingValidationErrorCode =
  | "INVALID_STANDING_ID"
  | "INVALID_SUBJECT_ID"
  | "INVALID_SCOPE"
  | "INVALID_VALID_FROM"
  | "INVALID_VALID_TO"
  | "VALID_TO_BEFORE_VALID_FROM";

export type StandingValidationError = {
  readonly code: StandingValidationErrorCode;
  readonly field: keyof StandingRecord;
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

export type {
  Gs1DigitalLinkComponentSource,
  ParsedGs1DigitalLinkComponent,
  ParsedGs1DigitalLink,
  GS1ParseErrorCode,
  GS1ParseError,
} from "./gs1Parser.js";

export { parseGs1DigitalLink } from "./gs1Parser.js";

export type {
  RegistryRecord,
  RegistryRecordType,
  RegistryRecordMap,
} from "./seed-helpers.js";
export {
  JcsError,
  validateStrictJson,
  canonicalizeJcs,
  getRegistryRecordIdentity,
  areRegistryRecordsEquivalent,
} from "./seed-helpers.js";

export type Outcome = "verified" | "unverified" | "rejected";

export type OutcomeValidationErrorCode = "INVALID_OUTCOME";

export interface OutcomeValidationError {
  readonly code: OutcomeValidationErrorCode;
  readonly message: string;
}

/**
 * Validates raw input to produce a typed Outcome or a ValidationResult error.
 * Does not throw exceptions, purely deterministic, non-coercive.
 */
export function validateOutcome(
  input: unknown,
): ValidationResult<Outcome, OutcomeValidationError> {
  if (input === "verified" || input === "unverified" || input === "rejected") {
    return {
      ok: true,
      value: input,
    };
  }

  return {
    ok: false,
    error: {
      code: "INVALID_OUTCOME",
      message: "outcome must be one of: verified, unverified, rejected",
    },
  };
}

/**
 * Canonically serializes an Outcome deterministically.
 */
export function serializeOutcome(outcome: Outcome): string {
  return JSON.stringify(outcome);
}

export type PolicyDefinition =
  | null
  | boolean
  | number
  | string
  | readonly PolicyDefinition[]
  | { readonly [key: string]: PolicyDefinition };

export type PolicyRecord = {
  readonly policyId: string;
  readonly policyType: string;
  readonly version: string;
  readonly definition: PolicyDefinition;
  readonly active: boolean;
};

export type PolicyValidationErrorCode =
  | "INVALID_POLICY_ID"
  | "INVALID_POLICY_TYPE"
  | "INVALID_VERSION"
  | "INVALID_DEFINITION"
  | "CYCLIC_DEFINITION"
  | "INVALID_ACTIVE";

export type PolicyValidationError = {
  readonly code: PolicyValidationErrorCode;
  readonly field: keyof PolicyRecord;
  readonly message: string;
};

/**
 * Validates raw input to produce a typed PolicyRecord or a ValidationResult error.
 * Does not throw exceptions, purely deterministic.
 */
export function validatePolicyRecord(
  input: unknown,
): ValidationResult<PolicyRecord, PolicyValidationError> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_POLICY_ID",
        field: "policyId",
        message: "Input must be a non-null object",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // Sequential validation order: policyId → policyType → version → definition → active

  // 1. policyId validation
  const policyId = raw.policyId;
  if (typeof policyId !== "string" || policyId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_POLICY_ID",
        field: "policyId",
        message: "policyId must be a non-empty string",
      },
    };
  }

  // 2. policyType validation
  const policyType = raw.policyType;
  if (typeof policyType !== "string" || policyType.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_POLICY_TYPE",
        field: "policyType",
        message: "policyType must be a non-empty string",
      },
    };
  }

  // 3. version validation
  const version = raw.version;
  if (typeof version !== "string" || version.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_VERSION",
        field: "version",
        message: "version must be a non-empty string",
      },
    };
  }

  // 4. definition validation
  const definition = raw.definition;
  const activePath = new Set<unknown>();
  const defResult = checkDefinitionValid(definition, activePath);
  if (defResult !== "OK") {
    if (defResult === "CYCLIC") {
      return {
        ok: false,
        error: {
          code: "CYCLIC_DEFINITION",
          field: "definition",
          message: "definition contains cyclic references",
        },
      };
    } else {
      return {
        ok: false,
        error: {
          code: "INVALID_DEFINITION",
          field: "definition",
          message: "definition is not a valid recursive finite JSON structure",
        },
      };
    }
  }

  // 5. active validation
  const active = raw.active;
  if (typeof active !== "boolean") {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE",
        field: "active",
        message: "active must be strictly boolean",
      },
    };
  }

  const record: PolicyRecord = {
    policyId,
    policyType,
    version,
    definition: definition as PolicyDefinition,
    active,
  };

  return {
    ok: true,
    value: record,
  };
}

function checkDefinitionValid(
  val: unknown,
  activePath: Set<unknown>,
): "OK" | "INVALID" | "CYCLIC" {
  if (val === null) {
    return "OK";
  }
  const type = typeof val;
  if (type === "boolean") {
    return "OK";
  }
  if (type === "number") {
    if (Number.isFinite(val)) {
      return "OK";
    }
    return "INVALID";
  }
  if (type === "string") {
    return "OK";
  }
  if (type === "object") {
    if (Array.isArray(val)) {
      if (activePath.has(val)) {
        return "CYCLIC";
      }
      activePath.add(val);
      for (const item of val) {
        const res = checkDefinitionValid(item, activePath);
        if (res !== "OK") {
          activePath.delete(val);
          return res;
        }
      }
      activePath.delete(val);
      return "OK";
    }

    // Must be a plain object: prototype must be Object.prototype or null
    const proto = Object.getPrototypeOf(val as object);
    if (proto !== Object.prototype && proto !== null) {
      return "INVALID";
    }

    if (activePath.has(val)) {
      return "CYCLIC";
    }
    activePath.add(val);

    const keys = Reflect.ownKeys(val as object);
    for (const key of keys) {
      if (typeof key !== "string") {
        activePath.delete(val);
        return "INVALID";
      }
      const propValue = (val as Record<string, unknown>)[key];
      const res = checkDefinitionValid(propValue, activePath);
      if (res !== "OK") {
        activePath.delete(val);
        return res;
      }
    }

    activePath.delete(val);
    return "OK";
  }

  return "INVALID";
}

function canonicalizeDefinition(val: unknown): unknown {
  if (val === null || typeof val !== "object") {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(canonicalizeDefinition);
  }

  const clean = Object.create(null);
  const keys = Object.keys(val).sort();
  for (const key of keys) {
    clean[key] = canonicalizeDefinition((val as Record<string, unknown>)[key]);
  }
  return clean;
}

/**
 * Canonically serializes a PolicyRecord deterministically.
 * Alphabetic key order: active, definition, policyId, policyType, version
 */
export function serializePolicyRecord(record: PolicyRecord): string {
  const cleanTop = Object.create(null);
  cleanTop.active = record.active;
  cleanTop.definition = canonicalizeDefinition(record.definition);
  cleanTop.policyId = record.policyId;
  cleanTop.policyType = record.policyType;
  cleanTop.version = record.version;

  return JSON.stringify(cleanTop);
}

/**
 * Validates raw input to produce a typed StandingRecord or a ValidationResult error.
 * Sequential validation of fields in StandingRecord declaration order:
 * standingId -> subjectId -> scope -> validFrom -> validTo -> chronological check
 * Does not throw exceptions, purely deterministic.
 */
export function validateStandingRecord(
  input: unknown,
): ValidationResult<StandingRecord, StandingValidationError> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_STANDING_ID",
        field: "standingId",
        message: "Input must be a non-null object",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. standingId validation
  const standingId = raw.standingId;
  if (typeof standingId !== "string" || standingId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_STANDING_ID",
        field: "standingId",
        message: "standingId must be a non-empty string",
      },
    };
  }

  // 2. subjectId validation
  const subjectId = raw.subjectId;
  if (typeof subjectId !== "string" || subjectId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_SUBJECT_ID",
        field: "subjectId",
        message: "subjectId must be a non-empty string",
      },
    };
  }

  // 3. scope validation (whitespace-only check with value preservation)
  const scope = raw.scope;
  if (typeof scope !== "string" || scope.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_SCOPE",
        field: "scope",
        message: "scope must be a non-empty string",
      },
    };
  }

  // 4. validFrom validation
  const validFrom = raw.validFrom;
  if (typeof validFrom !== "string" || !isValidIso8601Utc(validFrom)) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALID_FROM",
        field: "validFrom",
        message: "validFrom must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  // 5. validTo validation
  const validTo = raw.validTo;
  if (typeof validTo !== "string" || !isValidIso8601Utc(validTo)) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALID_TO",
        field: "validTo",
        message: "validTo must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  // 6. Chronological validity-range check
  if (new Date(validTo).getTime() < new Date(validFrom).getTime()) {
    return {
      ok: false,
      error: {
        code: "VALID_TO_BEFORE_VALID_FROM",
        field: "validTo",
        message: "validTo must not be chronologically before validFrom",
      },
    };
  }

  const record: StandingRecord = {
    standingId,
    subjectId,
    scope,
    validFrom,
    validTo,
  };

  return {
    ok: true,
    value: record,
  };
}

/**
 * Canonically serializes a StandingRecord deterministically.
 * Approved alphabetical key order: scope, standingId, subjectId, validFrom, validTo
 */
export function serializeStandingRecord(record: StandingRecord): string {
  const ordered = {
    scope: record.scope,
    standingId: record.standingId,
    subjectId: record.subjectId,
    validFrom: record.validFrom,
    validTo: record.validTo,
  };
  return JSON.stringify(ordered);
}

/**
 * Validates raw input to produce a typed CapabilityRecord or a ValidationResult error.
 * Sequential validation of fields in CapabilityRecord declaration order:
 * capabilityId -> subjectId -> scope -> validFrom -> validTo -> chronological check
 * Does not throw exceptions, purely deterministic.
 */
export function validateCapabilityRecord(
  input: unknown,
): ValidationResult<CapabilityRecord, CapabilityValidationError> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_CAPABILITY_ID",
        field: "capabilityId",
        message: "Input must be a non-null object",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. capabilityId validation
  const capabilityId = raw.capabilityId;
  if (typeof capabilityId !== "string" || capabilityId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_CAPABILITY_ID",
        field: "capabilityId",
        message: "capabilityId must be a non-empty string",
      },
    };
  }

  // 2. subjectId validation
  const subjectId = raw.subjectId;
  if (typeof subjectId !== "string" || subjectId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_SUBJECT_ID",
        field: "subjectId",
        message: "subjectId must be a non-empty string",
      },
    };
  }

  // 3. scope validation
  const scope = raw.scope;
  if (typeof scope !== "string" || scope.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_SCOPE",
        field: "scope",
        message: "scope must be a non-empty string",
      },
    };
  }

  // 4. validFrom validation
  const validFrom = raw.validFrom;
  if (typeof validFrom !== "string" || !isValidIso8601Utc(validFrom)) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALID_FROM",
        field: "validFrom",
        message: "validFrom must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  // 5. validTo validation
  const validTo = raw.validTo;
  if (typeof validTo !== "string" || !isValidIso8601Utc(validTo)) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALID_TO",
        field: "validTo",
        message: "validTo must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  // 6. Chronological validity-range check
  if (new Date(validTo).getTime() < new Date(validFrom).getTime()) {
    return {
      ok: false,
      error: {
        code: "VALID_TO_BEFORE_VALID_FROM",
        field: "validTo",
        message: "validTo must not be chronologically before validFrom",
      },
    };
  }

  const record: CapabilityRecord = {
    capabilityId,
    subjectId,
    scope,
    validFrom,
    validTo,
  };

  return {
    ok: true,
    value: record,
  };
}

/**
 * Canonically serializes a CapabilityRecord deterministically.
 * Approved alphabetical key order: capabilityId, scope, subjectId, validFrom, validTo
 */
export function serializeCapabilityRecord(record: CapabilityRecord): string {
  const ordered = {
    capabilityId: record.capabilityId,
    scope: record.scope,
    subjectId: record.subjectId,
    validFrom: record.validFrom,
    validTo: record.validTo,
  };
  return JSON.stringify(ordered);
}

/**
 * Validates raw input to produce a typed AuthorityRecord or a ValidationResult error.
 * Sequential validation of fields in AuthorityRecord declaration order:
 * authorityId -> subjectId -> scope -> validFrom -> validTo -> chronological check
 * Does not throw exceptions, purely deterministic.
 */
export function validateAuthorityRecord(
  input: unknown,
): ValidationResult<AuthorityRecord, AuthorityValidationError> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_AUTHORITY_ID",
        field: "authorityId",
        message: "Input must be a non-null object",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. authorityId validation
  const authorityId = raw.authorityId;
  if (typeof authorityId !== "string" || authorityId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_AUTHORITY_ID",
        field: "authorityId",
        message: "authorityId must be a non-empty string",
      },
    };
  }

  // 2. subjectId validation
  const subjectId = raw.subjectId;
  if (typeof subjectId !== "string" || subjectId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_SUBJECT_ID",
        field: "subjectId",
        message: "subjectId must be a non-empty string",
      },
    };
  }

  // 3. scope validation
  const scope = raw.scope;
  if (typeof scope !== "string" || scope.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_SCOPE",
        field: "scope",
        message: "scope must be a non-empty string",
      },
    };
  }

  // 4. validFrom validation
  const validFrom = raw.validFrom;
  if (typeof validFrom !== "string" || !isValidIso8601Utc(validFrom)) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALID_FROM",
        field: "validFrom",
        message: "validFrom must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  // 5. validTo validation
  const validTo = raw.validTo;
  if (typeof validTo !== "string" || !isValidIso8601Utc(validTo)) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALID_TO",
        field: "validTo",
        message: "validTo must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  // 6. Chronological validity-range check
  if (new Date(validTo).getTime() < new Date(validFrom).getTime()) {
    return {
      ok: false,
      error: {
        code: "VALID_TO_BEFORE_VALID_FROM",
        field: "validTo",
        message: "validTo must not be chronologically before validFrom",
      },
    };
  }

  const record: AuthorityRecord = {
    authorityId,
    subjectId,
    scope,
    validFrom,
    validTo,
  };

  return {
    ok: true,
    value: record,
  };
}

/**
 * Canonically serializes an AuthorityRecord deterministically.
 * Approved alphabetical key order: authorityId, scope, subjectId, validFrom, validTo
 */
export function serializeAuthorityRecord(record: AuthorityRecord): string {
  const ordered = {
    authorityId: record.authorityId,
    scope: record.scope,
    subjectId: record.subjectId,
    validFrom: record.validFrom,
    validTo: record.validTo,
  };
  return JSON.stringify(ordered);
}

/**
 * Validates raw input to produce a typed EvidenceRecord or a ValidationResult error.
 * Sequential validation of fields in EvidenceRecord declaration order.
 * Does not throw exceptions, purely deterministic.
 */
export function validateEvidenceRecord(
  input: unknown,
): ValidationResult<EvidenceRecord, EvidenceValidationError> {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: {
        code: "INVALID_EVIDENCE_ID",
        field: "evidenceId",
        message: "Evidence record must be a non-null object.",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. evidenceId validation
  const evidenceId = raw.evidenceId;
  if (typeof evidenceId !== "string" || evidenceId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_EVIDENCE_ID",
        field: "evidenceId",
        message: "evidenceId must be a non-empty string",
      },
    };
  }

  // 2. identityId validation
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

  // 3. evidenceType validation
  const evidenceType = raw.evidenceType;
  if (typeof evidenceType !== "string" || evidenceType.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_EVIDENCE_TYPE",
        field: "evidenceType",
        message: "evidenceType must be a non-empty string",
      },
    };
  }

  // 4. hash validation
  const hash = raw.hash;
  if (typeof hash !== "string" || hash.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_HASH",
        field: "hash",
        message: "hash must be a non-empty string",
      },
    };
  }

  // 5. storageRef validation
  const storageRef = raw.storageRef;
  if (typeof storageRef !== "string" || storageRef.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_STORAGE_REF",
        field: "storageRef",
        message: "storageRef must be a non-empty string",
      },
    };
  }

  // 6. retrievedAt validation
  const retrievedAt = raw.retrievedAt;
  if (typeof retrievedAt !== "string" || !isValidIso8601Utc(retrievedAt)) {
    return {
      ok: false,
      error: {
        code: "INVALID_RETRIEVED_AT",
        field: "retrievedAt",
        message: "retrievedAt must be a valid ISO-8601 UTC timestamp",
      },
    };
  }

  const record: EvidenceRecord = {
    evidenceId,
    identityId,
    evidenceType,
    hash,
    storageRef,
    retrievedAt,
  };

  return {
    ok: true,
    value: record,
  };
}

/**
 * Canonically serializes an EvidenceRecord deterministically.
 * Approved alphabetical key order: evidenceId, evidenceType, hash, identityId, retrievedAt, storageRef
 */
export function serializeEvidenceRecord(record: EvidenceRecord): string {
  const ordered = {
    evidenceId: record.evidenceId,
    evidenceType: record.evidenceType,
    hash: record.hash,
    identityId: record.identityId,
    retrievedAt: record.retrievedAt,
    storageRef: record.storageRef,
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

export interface ActiveConstitutionalView {
  readonly identity: IdentityRecord;
  readonly relationships: readonly ReferentRecord[];
  readonly standings: readonly StandingRecord[];
  readonly authorities: readonly AuthorityRecord[];
  readonly capabilities: readonly CapabilityRecord[];
  readonly evidenceReferences: readonly EvidenceRecord[];
  readonly applicablePolicies: readonly PolicyRecord[];
}

export interface EvidenceBundle {
  readonly evidenceRecords: readonly EvidenceRecord[];
}

export interface PolicyContext {
  readonly policies: readonly PolicyRecord[];
}

export interface ExecutionContext {
  readonly budget: number;
  readonly entropy: string;
  readonly versions: readonly string[];
}

export type ExecutionContextValidationErrorCode =
  "INVALID_BUDGET" | "INVALID_ENTROPY" | "INVALID_VERSIONS";

export interface ExecutionContextValidationError {
  readonly code: ExecutionContextValidationErrorCode;
  readonly field: keyof ExecutionContext;
  readonly message: string;
}

/**
 * Validates raw input to produce a typed ExecutionContext or a ValidationResult error.
 * Does not throw exceptions, purely deterministic.
 */
export function validateExecutionContext(
  input: unknown,
): ValidationResult<ExecutionContext, ExecutionContextValidationError> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_BUDGET",
        field: "budget",
        message: "Input must be a non-null object",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. budget validation: must be finite, non-negative number, validated without coercion
  const budget = raw.budget;
  if (typeof budget !== "number" || !Number.isFinite(budget) || budget < 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_BUDGET",
        field: "budget",
        message: "budget must be a non-negative finite number",
      },
    };
  }

  // 2. entropy validation: must be a primitive string, non-empty, explicit, without coercion, whitespace-only rejected
  const entropy = raw.entropy;
  if (typeof entropy !== "string" || entropy.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_ENTROPY",
        field: "entropy",
        message: "entropy must be a non-empty, non-whitespace string",
      },
    };
  }

  // 3. versions validation: must be a non-empty array of non-empty, non-whitespace primitive strings
  const versionsRaw = raw.versions;
  if (!Array.isArray(versionsRaw)) {
    return {
      ok: false,
      error: {
        code: "INVALID_VERSIONS",
        field: "versions",
        message: "versions must be an array",
      },
    };
  }

  if (versionsRaw.length === 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_VERSIONS",
        field: "versions",
        message: "versions array must contain at least one element",
      },
    };
  }

  const versions: string[] = [];
  for (let i = 0; i < versionsRaw.length; i++) {
    const v = versionsRaw[i];
    if (typeof v !== "string" || v.trim() === "") {
      return {
        ok: false,
        error: {
          code: "INVALID_VERSIONS",
          field: "versions",
          message:
            "versions elements must be non-empty, non-whitespace strings",
        },
      };
    }
    versions.push(v);
  }

  const context: ExecutionContext = {
    budget,
    entropy,
    versions,
  };

  return {
    ok: true,
    value: context,
  };
}

/**
 * Canonically serializes an ExecutionContext deterministically.
 * Alphabetical key order: budget -> entropy -> versions
 */
export function serializeExecutionContext(context: ExecutionContext): string {
  const ordered = {
    budget: context.budget,
    entropy: context.entropy,
    versions: context.versions,
  };
  return JSON.stringify(ordered);
}

export interface ExecutionRequest {
  readonly requestId: string;
  readonly identity: IdentityRecord;
  readonly activeConstitutionalView: ActiveConstitutionalView;
  readonly evidenceBundle: EvidenceBundle;
  readonly policyContext: PolicyContext;
  readonly executionContext: ExecutionContext;
}

export type ExecutionRequestValidationErrorCode =
  | "INVALID_REQUEST_ID"
  | "INVALID_IDENTITY"
  | "INVALID_ACTIVE_CONSTITUTIONAL_VIEW"
  | "INVALID_EVIDENCE_BUNDLE"
  | "INVALID_POLICY_CONTEXT"
  | "INVALID_EXECUTION_CONTEXT";

export type ExecutionRequestValidationError = {
  readonly code: ExecutionRequestValidationErrorCode;
  readonly field: keyof ExecutionRequest;
  readonly message: string;
};

/**
 * Validates raw input to produce a typed ExecutionRequest or a ValidationResult error.
 * Sequential validation of fields: requestId -> identity -> activeConstitutionalView -> evidenceBundle -> policyContext -> executionContext
 * Does not throw exceptions, purely deterministic.
 */
export function validateExecutionRequest(
  input: unknown,
): ValidationResult<ExecutionRequest, ExecutionRequestValidationError> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_REQUEST_ID",
        field: "requestId",
        message: "Input must be a non-null object",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. requestId validation
  const requestId = raw.requestId;
  if (typeof requestId !== "string" || requestId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_REQUEST_ID",
        field: "requestId",
        message: "requestId must be a non-empty string",
      },
    };
  }

  // 2. identity validation
  const identityRes = validateIdentityRecord(raw.identity);
  if (!identityRes.ok) {
    return {
      ok: false,
      error: {
        code: "INVALID_IDENTITY",
        field: "identity",
        message: `Invalid identity: ${identityRes.error.message}`,
      },
    };
  }

  // 3. activeConstitutionalView validation
  const acvRaw = raw.activeConstitutionalView;
  if (!acvRaw || typeof acvRaw !== "object" || Array.isArray(acvRaw)) {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        field: "activeConstitutionalView",
        message: "activeConstitutionalView must be a non-null object",
      },
    };
  }

  const acvRawObj = acvRaw as Record<string, unknown>;

  // 3.1 identity inside activeConstitutionalView
  const acvIdentityRes = validateIdentityRecord(acvRawObj.identity);
  if (!acvIdentityRes.ok) {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        field: "activeConstitutionalView",
        message: `Invalid identity in activeConstitutionalView: ${acvIdentityRes.error.message}`,
      },
    };
  }

  // 3.2 relationships inside activeConstitutionalView
  if (!Array.isArray(acvRawObj.relationships)) {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        field: "activeConstitutionalView",
        message: "relationships in activeConstitutionalView must be an array",
      },
    };
  }
  const relationships: ReferentRecord[] = [];
  for (const rel of acvRawObj.relationships) {
    const relRes = validateReferentRecord(rel);
    if (!relRes.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
          field: "activeConstitutionalView",
          message: `Invalid relationship in activeConstitutionalView: ${relRes.error.message}`,
        },
      };
    }
    relationships.push(relRes.value);
  }

  // 3.3 standings inside activeConstitutionalView
  if (!Array.isArray(acvRawObj.standings)) {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        field: "activeConstitutionalView",
        message: "standings in activeConstitutionalView must be an array",
      },
    };
  }
  const standings: StandingRecord[] = [];
  for (const s of acvRawObj.standings) {
    const sRes = validateStandingRecord(s);
    if (!sRes.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
          field: "activeConstitutionalView",
          message: `Invalid standing in activeConstitutionalView: ${sRes.error.message}`,
        },
      };
    }
    standings.push(sRes.value);
  }

  // 3.4 authorities inside activeConstitutionalView
  if (!Array.isArray(acvRawObj.authorities)) {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        field: "activeConstitutionalView",
        message: "authorities in activeConstitutionalView must be an array",
      },
    };
  }
  const authorities: AuthorityRecord[] = [];
  for (const a of acvRawObj.authorities) {
    const aRes = validateAuthorityRecord(a);
    if (!aRes.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
          field: "activeConstitutionalView",
          message: `Invalid authority in activeConstitutionalView: ${aRes.error.message}`,
        },
      };
    }
    authorities.push(aRes.value);
  }

  // 3.5 capabilities inside activeConstitutionalView
  if (!Array.isArray(acvRawObj.capabilities)) {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        field: "activeConstitutionalView",
        message: "capabilities in activeConstitutionalView must be an array",
      },
    };
  }
  const capabilities: CapabilityRecord[] = [];
  for (const c of acvRawObj.capabilities) {
    const cRes = validateCapabilityRecord(c);
    if (!cRes.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
          field: "activeConstitutionalView",
          message: `Invalid capability in activeConstitutionalView: ${cRes.error.message}`,
        },
      };
    }
    capabilities.push(cRes.value);
  }

  // 3.6 evidenceReferences inside activeConstitutionalView
  if (!Array.isArray(acvRawObj.evidenceReferences)) {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        field: "activeConstitutionalView",
        message:
          "evidenceReferences in activeConstitutionalView must be an array",
      },
    };
  }
  const evidenceReferences: EvidenceRecord[] = [];
  for (const ev of acvRawObj.evidenceReferences) {
    const evRes = validateEvidenceRecord(ev);
    if (!evRes.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
          field: "activeConstitutionalView",
          message: `Invalid evidenceReference in activeConstitutionalView: ${evRes.error.message}`,
        },
      };
    }
    evidenceReferences.push(evRes.value);
  }

  // 3.7 applicablePolicies inside activeConstitutionalView
  if (!Array.isArray(acvRawObj.applicablePolicies)) {
    return {
      ok: false,
      error: {
        code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        field: "activeConstitutionalView",
        message:
          "applicablePolicies in activeConstitutionalView must be an array",
      },
    };
  }
  const applicablePolicies: PolicyRecord[] = [];
  for (const p of acvRawObj.applicablePolicies) {
    const pRes = validatePolicyRecord(p);
    if (!pRes.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
          field: "activeConstitutionalView",
          message: `Invalid applicablePolicy in activeConstitutionalView: ${pRes.error.message}`,
        },
      };
    }
    applicablePolicies.push(pRes.value);
  }

  const activeConstitutionalView: ActiveConstitutionalView = {
    identity: acvIdentityRes.value,
    relationships,
    standings,
    authorities,
    capabilities,
    evidenceReferences,
    applicablePolicies,
  };

  // 4. evidenceBundle validation
  const ebRaw = raw.evidenceBundle;
  if (!ebRaw || typeof ebRaw !== "object" || Array.isArray(ebRaw)) {
    return {
      ok: false,
      error: {
        code: "INVALID_EVIDENCE_BUNDLE",
        field: "evidenceBundle",
        message: "evidenceBundle must be a non-null object",
      },
    };
  }

  const ebRawObj = ebRaw as Record<string, unknown>;
  if (!Array.isArray(ebRawObj.evidenceRecords)) {
    return {
      ok: false,
      error: {
        code: "INVALID_EVIDENCE_BUNDLE",
        field: "evidenceBundle",
        message: "evidenceRecords in evidenceBundle must be an array",
      },
    };
  }
  const evidenceRecords: EvidenceRecord[] = [];
  for (const r of ebRawObj.evidenceRecords) {
    const rRes = validateEvidenceRecord(r);
    if (!rRes.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_EVIDENCE_BUNDLE",
          field: "evidenceBundle",
          message: `Invalid evidenceRecord in evidenceBundle: ${rRes.error.message}`,
        },
      };
    }
    evidenceRecords.push(rRes.value);
  }

  const evidenceBundle: EvidenceBundle = {
    evidenceRecords,
  };

  // 5. policyContext validation
  const pcRaw = raw.policyContext;
  if (!pcRaw || typeof pcRaw !== "object" || Array.isArray(pcRaw)) {
    return {
      ok: false,
      error: {
        code: "INVALID_POLICY_CONTEXT",
        field: "policyContext",
        message: "policyContext must be a non-null object",
      },
    };
  }

  const pcRawObj = pcRaw as Record<string, unknown>;
  if (!Array.isArray(pcRawObj.policies)) {
    return {
      ok: false,
      error: {
        code: "INVALID_POLICY_CONTEXT",
        field: "policyContext",
        message: "policies in policyContext must be an array",
      },
    };
  }
  const policies: PolicyRecord[] = [];
  for (const p of pcRawObj.policies) {
    const pRes = validatePolicyRecord(p);
    if (!pRes.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_POLICY_CONTEXT",
          field: "policyContext",
          message: `Invalid policy in policyContext: ${pRes.error.message}`,
        },
      };
    }
    policies.push(pRes.value);
  }

  const policyContext: PolicyContext = {
    policies,
  };

  // 6. executionContext validation
  const ecRes = validateExecutionContext(raw.executionContext);
  if (!ecRes.ok) {
    return {
      ok: false,
      error: {
        code: "INVALID_EXECUTION_CONTEXT",
        field: "executionContext",
        message: `Invalid executionContext: ${ecRes.error.message}`,
      },
    };
  }

  const record: ExecutionRequest = {
    requestId,
    identity: identityRes.value,
    activeConstitutionalView,
    evidenceBundle,
    policyContext,
    executionContext: ecRes.value,
  };

  return {
    ok: true,
    value: record,
  };
}

/**
 * Canonically serializes an ExecutionRequest deterministically.
 * Alphabetic key order: activeConstitutionalView -> evidenceBundle -> executionContext -> identity -> policyContext -> requestId
 */
export function serializeExecutionRequest(request: ExecutionRequest): string {
  const getOrderedIdentity = (r: IdentityRecord) =>
    JSON.parse(serializeIdentityRecord(r));
  const getOrderedReferent = (r: ReferentRecord) =>
    JSON.parse(serializeReferentRecord(r));
  const getOrderedStanding = (r: StandingRecord) =>
    JSON.parse(serializeStandingRecord(r));
  const getOrderedAuthority = (r: AuthorityRecord) =>
    JSON.parse(serializeAuthorityRecord(r));
  const getOrderedCapability = (r: CapabilityRecord) =>
    JSON.parse(serializeCapabilityRecord(r));
  const getOrderedEvidence = (r: EvidenceRecord) =>
    JSON.parse(serializeEvidenceRecord(r));
  const getOrderedPolicy = (r: PolicyRecord) =>
    JSON.parse(serializePolicyRecord(r));

  const acv = request.activeConstitutionalView;
  const orderedACV = {
    applicablePolicies: acv.applicablePolicies.map(getOrderedPolicy),
    authorities: acv.authorities.map(getOrderedAuthority),
    capabilities: acv.capabilities.map(getOrderedCapability),
    evidenceReferences: acv.evidenceReferences.map(getOrderedEvidence),
    identity: getOrderedIdentity(acv.identity),
    relationships: acv.relationships.map(getOrderedReferent),
    standings: acv.standings.map(getOrderedStanding),
  };

  const eb = request.evidenceBundle;
  const orderedEvidenceBundle = {
    evidenceRecords: eb.evidenceRecords.map(getOrderedEvidence),
  };

  const pc = request.policyContext;
  const orderedPolicyContext = {
    policies: pc.policies.map(getOrderedPolicy),
  };

  const orderedRequest = {
    activeConstitutionalView: orderedACV,
    evidenceBundle: orderedEvidenceBundle,
    executionContext: JSON.parse(
      serializeExecutionContext(request.executionContext),
    ),
    identity: getOrderedIdentity(request.identity),
    policyContext: orderedPolicyContext,
    requestId: request.requestId,
  };

  return JSON.stringify(orderedRequest);
}

export interface ExecutionReceipt {
  readonly receiptId: string;
  readonly executionId: string;
  readonly runtimeVersion: string;
  readonly inputHash: string;
  readonly outputHash: string;
  readonly evidenceHash: string;
  readonly policyVersion: string;
  readonly decisionSummary: string;
  readonly executionTime: number;
  readonly deterministicHash: string;
}

export type ExecutionReceiptValidationErrorCode =
  | "INVALID_RECEIPT_ID"
  | "INVALID_EXECUTION_ID"
  | "INVALID_RUNTIME_VERSION"
  | "INVALID_INPUT_HASH"
  | "INVALID_OUTPUT_HASH"
  | "INVALID_EVIDENCE_HASH"
  | "INVALID_POLICY_VERSION"
  | "INVALID_DECISION_SUMMARY"
  | "INVALID_EXECUTION_TIME"
  | "INVALID_DETERMINISTIC_HASH";

export interface ExecutionReceiptValidationError {
  readonly code: ExecutionReceiptValidationErrorCode;
  readonly field: keyof ExecutionReceipt;
  readonly message: string;
}

/**
 * Validates raw input to produce a typed ExecutionReceipt or a ValidationResult error.
 * Sequential validation of fields:
 * receiptId -> executionId -> runtimeVersion -> inputHash -> outputHash -> evidenceHash -> policyVersion -> decisionSummary -> executionTime -> deterministicHash
 * Does not throw exceptions, purely deterministic.
 */
export function validateExecutionReceipt(
  input: unknown,
): ValidationResult<ExecutionReceipt, ExecutionReceiptValidationError> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_RECEIPT_ID",
        field: "receiptId",
        message: "receiptId must be a non-empty string",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. receiptId validation
  const receiptId = raw.receiptId;
  if (typeof receiptId !== "string" || receiptId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_RECEIPT_ID",
        field: "receiptId",
        message: "receiptId must be a non-empty string",
      },
    };
  }

  // 2. executionId validation
  const executionId = raw.executionId;
  if (typeof executionId !== "string" || executionId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_EXECUTION_ID",
        field: "executionId",
        message: "executionId must be a non-empty string",
      },
    };
  }

  // 3. runtimeVersion validation
  const runtimeVersion = raw.runtimeVersion;
  if (typeof runtimeVersion !== "string" || runtimeVersion.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_RUNTIME_VERSION",
        field: "runtimeVersion",
        message: "runtimeVersion must be a non-empty string",
      },
    };
  }

  // 4. inputHash validation
  const inputHash = raw.inputHash;
  if (typeof inputHash !== "string" || inputHash.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT_HASH",
        field: "inputHash",
        message: "inputHash must be a non-empty string",
      },
    };
  }

  // 5. outputHash validation
  const outputHash = raw.outputHash;
  if (typeof outputHash !== "string" || outputHash.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_OUTPUT_HASH",
        field: "outputHash",
        message: "outputHash must be a non-empty string",
      },
    };
  }

  // 6. evidenceHash validation
  const evidenceHash = raw.evidenceHash;
  if (typeof evidenceHash !== "string" || evidenceHash.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_EVIDENCE_HASH",
        field: "evidenceHash",
        message: "evidenceHash must be a non-empty string",
      },
    };
  }

  // 7. policyVersion validation
  const policyVersion = raw.policyVersion;
  if (typeof policyVersion !== "string" || policyVersion.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_POLICY_VERSION",
        field: "policyVersion",
        message: "policyVersion must be a non-empty string",
      },
    };
  }

  // 8. decisionSummary validation
  const decisionSummary = raw.decisionSummary;
  if (typeof decisionSummary !== "string" || decisionSummary.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_DECISION_SUMMARY",
        field: "decisionSummary",
        message: "decisionSummary must be a non-empty string",
      },
    };
  }

  // 9. executionTime validation
  const executionTime = raw.executionTime;
  if (
    typeof executionTime !== "number" ||
    !Number.isFinite(executionTime) ||
    executionTime < 0
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_EXECUTION_TIME",
        field: "executionTime",
        message: "executionTime must be a non-negative finite number",
      },
    };
  }

  // 10. deterministicHash validation
  const deterministicHash = raw.deterministicHash;
  if (
    typeof deterministicHash !== "string" ||
    deterministicHash.trim() === ""
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_DETERMINISTIC_HASH",
        field: "deterministicHash",
        message: "deterministicHash must be a non-empty string",
      },
    };
  }

  const receipt: ExecutionReceipt = {
    receiptId,
    executionId,
    runtimeVersion,
    inputHash,
    outputHash,
    evidenceHash,
    policyVersion,
    decisionSummary,
    executionTime,
    deterministicHash,
  };

  return {
    ok: true,
    value: receipt,
  };
}

/**
 * Canonically serializes an ExecutionReceipt deterministically.
 * Alphabetic key order: decisionSummary, deterministicHash, evidenceHash, executionId, executionTime, inputHash, outputHash, policyVersion, receiptId, runtimeVersion
 */
export function serializeExecutionReceipt(receipt: ExecutionReceipt): string {
  const ordered = {
    decisionSummary: receipt.decisionSummary,
    deterministicHash: receipt.deterministicHash,
    evidenceHash: receipt.evidenceHash,
    executionId: receipt.executionId,
    executionTime: receipt.executionTime,
    inputHash: receipt.inputHash,
    outputHash: receipt.outputHash,
    policyVersion: receipt.policyVersion,
    receiptId: receipt.receiptId,
    runtimeVersion: receipt.runtimeVersion,
  };
  return JSON.stringify(ordered);
}
