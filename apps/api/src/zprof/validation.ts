import type { CompositionError, PinnedStateReference } from "./types.js";

const SHA256_REGEX = /^sha256:[0-9a-f]{64}$/;
const ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Validates structural format of SHA-256 digest (sha256:<64 lowercase hex characters>).
 */
export function validateSha256Digest(
  digest: string,
  fieldLabel = "digest",
):
  | { readonly ok: true }
  | { readonly ok: false; readonly error: CompositionError } {
  if (typeof digest !== "string" || !SHA256_REGEX.test(digest)) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `${fieldLabel} must be a valid SHA-256 digest string formatted as 'sha256:<64 lowercase hex chars>'. Received '${digest}'.`,
      },
    };
  }
  return { ok: true };
}

/**
 * Validates strict ISO-8601 structural format for timestamp coordinates per CORR-0860-B-2 §3.
 * Enforces explicit ISO-8601 grammar regex prior to calendar validity parsing.
 */
export function validateIsoTimestamp(
  timestamp: string,
  fieldLabel = "timestamp",
):
  | { readonly ok: true }
  | { readonly ok: false; readonly error: CompositionError } {
  if (
    typeof timestamp !== "string" ||
    !ISO_8601_REGEX.test(timestamp) ||
    Number.isNaN(Date.parse(timestamp))
  ) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `${fieldLabel} must be a strictly compliant ISO-8601 timestamp string (e.g. 'YYYY-MM-DDTHH:mm:ssZ' or 'YYYY-MM-DDTHH:mm:ss.sssZ'). Received '${timestamp}'.`,
      },
    };
  }
  return { ok: true };
}

/**
 * Validates structural presence and format of PinnedStateReference.
 */
export function validatePinnedStateReference(
  ref: PinnedStateReference,
  roleName: string,
):
  | { readonly ok: true }
  | { readonly ok: false; readonly error: CompositionError } {
  if (!ref || typeof ref !== "object" || Array.isArray(ref)) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `${roleName} must be an object with an explicit 'ref' property.`,
      },
    };
  }

  if (!ref.ref || typeof ref.ref !== "string" || ref.ref.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message: `${roleName}.ref must be an explicit non-empty string reference identifier.`,
      },
    };
  }

  if (
    ref.version !== undefined &&
    (typeof ref.version !== "string" || ref.version.trim().length === 0)
  ) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `${roleName}.version, when supplied, must be an explicit non-empty string.`,
      },
    };
  }

  if (ref.digest !== undefined) {
    const digestRes = validateSha256Digest(ref.digest, `${roleName}.digest`);
    if (!digestRes.ok) {
      return digestRes;
    }
  }

  return { ok: true };
}

/**
 * Deeply clones and freezes a plain data object, ensuring no executable functions,
 * promises, getters, or classes with behavior exist.
 */
export function deepFreezePlainData<T>(val: T, path = "input"): T {
  if (val === null || val === undefined) {
    return val;
  }

  const type = typeof val;
  if (type === "function" || type === "symbol") {
    throw new Error(
      `Non-serializable/executable value at ${path} is prohibited.`,
    );
  }

  if (type !== "object") {
    return val;
  }

  if (Array.isArray(val)) {
    const frozenArray = val.map((item, idx) =>
      deepFreezePlainData(item, `${path}[${idx}]`),
    );
    return Object.freeze(frozenArray) as unknown as T;
  }

  // Check prototype for plain objects per CORR-0860-B-1 §6 / CORR-0860-B-2
  const proto = Object.getPrototypeOf(val);
  if (proto !== Object.prototype && proto !== null) {
    throw new Error(
      `Class instance or non-plain object structure at ${path} is prohibited.`,
    );
  }

  const obj = val as Record<string, unknown>;
  const frozenObj: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const propDesc = Object.getOwnPropertyDescriptor(obj, key);
    if (propDesc && (propDesc.get || propDesc.set)) {
      throw new Error(
        `Getter or setter property at ${path}.${key} is prohibited.`,
      );
    }
    frozenObj[key] = deepFreezePlainData(obj[key], `${path}.${key}`);
  }

  return Object.freeze(frozenObj) as unknown as T;
}
