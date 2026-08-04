import {
  type ReferentRecord,
  type IdentityRecord,
  type EvidenceRecord,
  type PolicyRecord,
  type AuthorityRecord,
  type CapabilityRecord,
  type StandingRecord,
} from "./index.js";

export type RegistryRecord =
  | ReferentRecord
  | IdentityRecord
  | EvidenceRecord
  | PolicyRecord
  | AuthorityRecord
  | CapabilityRecord
  | StandingRecord;

export class JcsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JcsError";
  }
}

/**
 * Validates that the input conforms strictly to the JSON boundary as defined in AMS-0504-IS.
 */
export function validateStrictJson(
  val: unknown,
  activePath = new Set<unknown>(),
): void {
  if (val === null) {
    return;
  }
  if (typeof val === "boolean") {
    return;
  }
  if (typeof val === "string") {
    return;
  }
  if (typeof val === "number") {
    if (!Number.isFinite(val)) {
      throw new JcsError("Number must be finite");
    }
    return;
  }
  if (typeof val === "object") {
    // dates, buffers, maps, sets, typed arrays etc. must be rejected
    if (
      val instanceof Date ||
      (val.constructor && val.constructor.name === "Date")
    ) {
      throw new JcsError("Date object is prohibited");
    }
    if (val instanceof Map || val instanceof Set || val instanceof RegExp) {
      throw new JcsError("Prohibited object type encountered");
    }
    if (ArrayBuffer.isView(val) || val instanceof ArrayBuffer) {
      throw new JcsError("Buffers and typed arrays are prohibited");
    }

    if (Array.isArray(val)) {
      if (activePath.has(val)) {
        throw new JcsError("Cyclic reference detected");
      }
      activePath.add(val);
      for (const item of val) {
        validateStrictJson(item, activePath);
      }
      activePath.delete(val);
      return;
    }

    // Must be a plain object
    const proto = Object.getPrototypeOf(val);
    if (proto !== Object.prototype && proto !== null) {
      throw new JcsError("Value must be a plain object");
    }

    if (activePath.has(val)) {
      throw new JcsError("Cyclic reference detected");
    }
    activePath.add(val);

    const keys = Reflect.ownKeys(val);
    for (const key of keys) {
      if (typeof key !== "string") {
        throw new JcsError("Object keys must be strings");
      }
      const desc = Object.getOwnPropertyDescriptor(val, key);
      if (!desc || !desc.enumerable) {
        throw new JcsError("Object keys must be enumerable");
      }
      validateStrictJson((val as Record<string, unknown>)[key], activePath);
    }
    activePath.delete(val);
    return;
  }

  throw new JcsError("Prohibited runtime value");
}

function serializeString(str: string): string {
  let result = '"';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = str.charCodeAt(i);
    if (char === '"') {
      result += '\\"';
    } else if (char === "\\") {
      result += "\\\\";
    } else if (code === 0x08) {
      result += "\\b";
    } else if (code === 0x09) {
      result += "\\t";
    } else if (code === 0x0a) {
      result += "\\n";
    } else if (code === 0x0c) {
      result += "\\f";
    } else if (code === 0x0d) {
      result += "\\r";
    } else if (code < 0x20) {
      const hex = code.toString(16).padStart(4, "0");
      result += "\\u" + hex;
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}

function serializeJcsInternal(val: unknown): string {
  if (val === null) {
    return "null";
  }
  if (typeof val === "boolean") {
    return val ? "true" : "false";
  }
  if (typeof val === "string") {
    return serializeString(val);
  }
  if (typeof val === "number") {
    if (Object.is(val, -0) || val === 0) {
      return "0";
    }
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map(serializeJcsInternal).join(",") + "]";
  }
  const sortedKeys = Object.keys(val as object).sort();
  const parts = sortedKeys.map((k) => {
    const keyStr = serializeString(k);
    const valStr = serializeJcsInternal((val as Record<string, unknown>)[k]);
    return `${keyStr}:${valStr}`;
  });
  return "{" + parts.join(",") + "}";
}

/**
 * RFC 8785 JSON Canonicalization Scheme (JCS)
 */
export function canonicalizeJcs(value: unknown): string {
  validateStrictJson(value);
  return serializeJcsInternal(value);
}

/**
 * Extracts the constitutional identity of a RegistryRecord.
 */
export function getRegistryRecordIdentity(record: RegistryRecord): string {
  if (!record || typeof record !== "object") {
    throw new Error("Invalid record object");
  }

  if ("evidenceId" in record && typeof record.evidenceId === "string") {
    return record.evidenceId;
  }
  if ("identityId" in record && typeof record.identityId === "string") {
    return record.identityId;
  }
  if ("referentId" in record && typeof record.referentId === "string") {
    return record.referentId;
  }
  if ("policyId" in record && typeof record.policyId === "string") {
    return record.policyId;
  }
  if ("authorityId" in record && typeof record.authorityId === "string") {
    return record.authorityId;
  }
  if ("capabilityId" in record && typeof record.capabilityId === "string") {
    return record.capabilityId;
  }
  if ("standingId" in record && typeof record.standingId === "string") {
    return record.standingId;
  }

  throw new Error("Unsupported record type or missing identity field");
}

export function getRecordVariantType(record: RegistryRecord): string {
  if ("evidenceId" in record) return "evidence";
  if ("identityId" in record) return "identity";
  if ("referentId" in record) return "referent";
  if ("policyId" in record) return "policy";
  if ("authorityId" in record) return "authority";
  if ("capabilityId" in record) return "capability";
  if ("standingId" in record) return "standing";
  throw new Error("Unknown record variant");
}

function compareNullableString(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return a === b;
}

/**
 * Pure Domain comparison for semantic equivalence of two RegistryRecords.
 */
export function areRegistryRecordsEquivalent(
  expected: RegistryRecord,
  actual: RegistryRecord,
): boolean {
  if (!expected || !actual) {
    return false;
  }

  const expectedType = getRecordVariantType(expected);
  const actualType = getRecordVariantType(actual);
  if (expectedType !== actualType) {
    return false;
  }

  const expectedId = getRegistryRecordIdentity(expected);
  const actualId = getRegistryRecordIdentity(actual);
  if (expectedId !== actualId) {
    return false;
  }

  switch (expectedType) {
    case "referent": {
      const exp = expected as ReferentRecord;
      const act = actual as ReferentRecord;
      return (
        exp.referentType === act.referentType &&
        exp.name === act.name &&
        compareNullableString(exp.parentReferentId, act.parentReferentId)
      );
    }
    case "identity": {
      const exp = expected as IdentityRecord;
      const act = actual as IdentityRecord;
      return (
        exp.identityType === act.identityType &&
        exp.canonicalReference === act.canonicalReference &&
        compareNullableString(exp.referentId, act.referentId) &&
        exp.status === act.status
      );
    }
    case "evidence": {
      const exp = expected as EvidenceRecord;
      const act = actual as EvidenceRecord;
      return (
        exp.identityId === act.identityId &&
        exp.evidenceType === act.evidenceType &&
        exp.hash === act.hash &&
        exp.storageRef === act.storageRef &&
        exp.retrievedAt === act.retrievedAt
      );
    }
    case "policy": {
      const exp = expected as PolicyRecord;
      const act = actual as PolicyRecord;
      return (
        exp.policyType === act.policyType &&
        exp.version === act.version &&
        exp.active === act.active &&
        canonicalizeJcs(exp.definition) === canonicalizeJcs(act.definition)
      );
    }
    case "authority": {
      const exp = expected as AuthorityRecord;
      const act = actual as AuthorityRecord;
      return (
        exp.subjectId === act.subjectId &&
        exp.scope === act.scope &&
        exp.validFrom === act.validFrom &&
        exp.validTo === act.validTo
      );
    }
    case "capability": {
      const exp = expected as CapabilityRecord;
      const act = actual as CapabilityRecord;
      return (
        exp.subjectId === act.subjectId &&
        exp.scope === act.scope &&
        exp.validFrom === act.validFrom &&
        exp.validTo === act.validTo
      );
    }
    case "standing": {
      const exp = expected as StandingRecord;
      const act = actual as StandingRecord;
      return (
        exp.subjectId === act.subjectId &&
        exp.scope === act.scope &&
        exp.validFrom === act.validFrom &&
        exp.validTo === act.validTo
      );
    }
    default:
      return false;
  }
}
