import crypto from "node:crypto";

export type V2IdentityErrorCode =
  | "INVALID_IDENTITY_INPUT"
  | "INVALID_JCS_UNICODE"
  | "SEMANTIC_DUPLICATE"
  | "GRAPH_CANONICALIZATION_FAILURE"
  | "TEMPORAL_CANONICALIZATION_FAILURE"
  | "COMPONENT_DIGEST_MISMATCH"
  | "UNSUPPORTED_IDENTITY_CONDITION";

export interface V2IdentityError {
  readonly code: V2IdentityErrorCode;
  readonly path?: string;
  readonly message: string;
}

export type V2IdentityResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: V2IdentityError };

export function makeIdentityError(
  code: V2IdentityErrorCode,
  message: string,
  path?: string,
): V2IdentityError {
  return path ? { code, path, message } : { code, message };
}

export function makeIdentityFailure<T>(
  code: V2IdentityErrorCode,
  message: string,
  path?: string,
): V2IdentityResult<T> {
  return {
    ok: false,
    error: makeIdentityError(code, message, path),
  };
}

/**
 * Validates strict Unicode surrogate pairs.
 * Rejects lone high surrogates (0xD800 - 0xDBFF) and lone low surrogates (0xDC00 - 0xDFFF).
 */
export function validateJcsUnicodeString(
  str: string,
  path = "",
): V2IdentityError | null {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      if (i + 1 >= str.length) {
        return makeIdentityError(
          "INVALID_JCS_UNICODE",
          `Lone high surrogate at end of string`,
          path,
        );
      }
      const nextCode = str.charCodeAt(i + 1);
      if (nextCode < 0xdc00 || nextCode > 0xdfff) {
        return makeIdentityError(
          "INVALID_JCS_UNICODE",
          `Lone high surrogate not followed by low surrogate at index ${i}`,
          path,
        );
      }
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return makeIdentityError(
        "INVALID_JCS_UNICODE",
        `Lone low surrogate at index ${i}`,
        path,
      );
    }
  }
  return null;
}

/**
 * Validates strict JSON value compliance for V2 JCS.
 */
function validateValueForV2Jcs(
  val: unknown,
  activePath = new Set<unknown>(),
  path = "",
): V2IdentityError | null {
  if (val === undefined) {
    return makeIdentityError(
      "INVALID_IDENTITY_INPUT",
      "undefined value encountered (undefined is not valid JCS)",
      path,
    );
  }
  if (val === null || typeof val === "boolean") {
    return null;
  }
  if (typeof val === "string") {
    return validateJcsUnicodeString(val, path);
  }
  if (typeof val === "number") {
    if (!Number.isFinite(val)) {
      return makeIdentityError(
        "INVALID_IDENTITY_INPUT",
        `Non-finite number encountered: ${val}`,
        path,
      );
    }
    return null;
  }
  if (typeof val === "object") {
    if (
      val instanceof Date ||
      (val.constructor && val.constructor.name === "Date")
    ) {
      return makeIdentityError(
        "INVALID_IDENTITY_INPUT",
        "Date object is prohibited in V2 JCS",
        path,
      );
    }
    if (val instanceof Map || val instanceof Set || val instanceof RegExp) {
      return makeIdentityError(
        "INVALID_IDENTITY_INPUT",
        "Prohibited object type encountered (Map/Set/RegExp)",
        path,
      );
    }
    if (ArrayBuffer.isView(val) || val instanceof ArrayBuffer) {
      return makeIdentityError(
        "INVALID_IDENTITY_INPUT",
        "Buffers and typed arrays are prohibited in V2 JCS",
        path,
      );
    }

    if (activePath.has(val)) {
      return makeIdentityError(
        "INVALID_IDENTITY_INPUT",
        "Cyclic reference detected",
        path,
      );
    }

    if (Array.isArray(val)) {
      activePath.add(val);
      for (let i = 0; i < val.length; i++) {
        const err = validateValueForV2Jcs(
          val[i],
          activePath,
          path ? `${path}[${i}]` : `[${i}]`,
        );
        if (err) {
          activePath.delete(val);
          return err;
        }
      }
      activePath.delete(val);
      return null;
    }

    const proto = Object.getPrototypeOf(val);
    if (proto !== Object.prototype && proto !== null) {
      return makeIdentityError(
        "INVALID_IDENTITY_INPUT",
        "Value must be a plain object",
        path,
      );
    }

    activePath.add(val);
    const keys = Reflect.ownKeys(val);
    for (const key of keys) {
      if (typeof key !== "string") {
        activePath.delete(val);
        return makeIdentityError(
          "INVALID_IDENTITY_INPUT",
          "Object keys must be strings",
          path,
        );
      }
      const desc = Object.getOwnPropertyDescriptor(val, key);
      if (!desc || !desc.enumerable) {
        activePath.delete(val);
        return makeIdentityError(
          "INVALID_IDENTITY_INPUT",
          "Object keys must be enumerable",
          path,
        );
      }
      const childPath = path ? `${path}.${key}` : key;
      const err = validateValueForV2Jcs(
        (val as Record<string, unknown>)[key],
        activePath,
        childPath,
      );
      if (err) {
        activePath.delete(val);
        return err;
      }
    }
    activePath.delete(val);
    return null;
  }

  return makeIdentityError(
    "INVALID_IDENTITY_INPUT",
    `Unsupported runtime value type: ${typeof val}`,
    path,
  );
}

function escapeStringJcs(str: string): string {
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

function serializeNumberJcs(n: number): string {
  if (Object.is(n, -0) || n === 0) {
    return "0";
  }
  return String(n);
}

function serializeV2JcsInternal(val: unknown): string {
  if (val === null) {
    return "null";
  }
  if (typeof val === "boolean") {
    return val ? "true" : "false";
  }
  if (typeof val === "string") {
    return escapeStringJcs(val);
  }
  if (typeof val === "number") {
    return serializeNumberJcs(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map(serializeV2JcsInternal).join(",") + "]";
  }

  const sortedKeys = Object.keys(val as object).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  const parts = sortedKeys.map((k) => {
    const keyStr = escapeStringJcs(k);
    const valStr = serializeV2JcsInternal((val as Record<string, unknown>)[k]);
    return `${keyStr}:${valStr}`;
  });
  return "{" + parts.join(",") + "}";
}

/**
 * RFC 8785 JSON Canonicalization Scheme for V2.
 */
export function canonicalizeJcsV2(value: unknown): V2IdentityResult<string> {
  const err = validateValueForV2Jcs(value);
  if (err) {
    return { ok: false, error: err };
  }
  try {
    const jcs = serializeV2JcsInternal(value);
    return { ok: true, value: jcs };
  } catch (e) {
    return makeIdentityFailure(
      "INVALID_IDENTITY_INPUT",
      e instanceof Error ? e.message : String(e),
    );
  }
}

/**
 * Unsigned lexicographical UTF-8 byte comparison for semantically unordered collection members.
 */
export function compareUtf8Bytes(aStr: string, bStr: string): number {
  const aBuf = Buffer.from(aStr, "utf8");
  const bBuf = Buffer.from(bStr, "utf8");
  return aBuf.compare(bBuf);
}

/**
 * Computes SHA-256 digest prefixed with sha256: over UTF-8 encoded string.
 */
export function computeSha256V2(
  domainSeparator: string,
  jcsString: string,
): string {
  const preimage = domainSeparator + jcsString;
  const hash = crypto
    .createHash("sha256")
    .update(preimage, "utf8")
    .digest("hex")
    .toLowerCase();
  return `sha256:${hash}`;
}
