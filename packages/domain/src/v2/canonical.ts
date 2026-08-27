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
          `Lone high surrogate at end of string in '${str}'`,
          path,
        );
      }
      const nextCode = str.charCodeAt(i + 1);
      if (nextCode < 0xdc00 || nextCode > 0xdfff) {
        return makeIdentityError(
          "INVALID_JCS_UNICODE",
          `Lone high surrogate not followed by low surrogate at index ${i} in '${str}'`,
          path,
        );
      }
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return makeIdentityError(
        "INVALID_JCS_UNICODE",
        `Lone low surrogate at index ${i} in '${str}'`,
        path,
      );
    }
  }
  return null;
}

/**
 * Builds a trusted, inert plain-object/array snapshot from a runtime value in a single descriptor-driven pass.
 * Catches all Proxy/reflection exceptions, rejects accessors, non-plain prototypes, non-enumerable hidden properties,
 * and never re-enters the original carrier after snapshot materialization.
 */
export function buildTrustedInertSnapshot<T>(
  val: T,
  activePath = new Set<unknown>(),
  path = "",
): V2IdentityResult<T> {
  try {
    if (val === undefined) {
      return makeIdentityFailure(
        "INVALID_IDENTITY_INPUT",
        "undefined value encountered (undefined is not valid JCS)",
        path,
      );
    }
    if (val === null || typeof val === "boolean") {
      return { ok: true, value: val };
    }
    if (typeof val === "string") {
      const err = validateJcsUnicodeString(val, path);
      if (err) return { ok: false, error: err };
      return { ok: true, value: val };
    }
    if (typeof val === "number") {
      if (!Number.isFinite(val)) {
        return makeIdentityFailure(
          "INVALID_IDENTITY_INPUT",
          `Non-finite number encountered: ${val}`,
          path,
        );
      }
      return { ok: true, value: val };
    }

    if (typeof val === "object") {
      if (
        val instanceof Date ||
        (val.constructor && val.constructor.name === "Date")
      ) {
        return makeIdentityFailure(
          "INVALID_IDENTITY_INPUT",
          "Date object is prohibited in V2 JCS",
          path,
        );
      }
      if (val instanceof Map || val instanceof Set || val instanceof RegExp) {
        return makeIdentityFailure(
          "INVALID_IDENTITY_INPUT",
          "Prohibited object type encountered (Map/Set/RegExp)",
          path,
        );
      }
      if (ArrayBuffer.isView(val) || val instanceof ArrayBuffer) {
        return makeIdentityFailure(
          "INVALID_IDENTITY_INPUT",
          "Buffers and typed arrays are prohibited in V2 JCS",
          path,
        );
      }

      if (activePath.has(val)) {
        return makeIdentityFailure(
          "INVALID_IDENTITY_INPUT",
          "Cyclic reference detected",
          path,
        );
      }

      if (Array.isArray(val)) {
        activePath.add(val);
        let ownKeys: (string | symbol)[];
        try {
          ownKeys = Reflect.ownKeys(val);
        } catch (e) {
          activePath.delete(val);
          return makeIdentityFailure(
            "INVALID_IDENTITY_INPUT",
            `Proxy/reflection trap exception on array keys: ${e instanceof Error ? e.message : String(e)}`,
            path,
          );
        }

        for (const k of ownKeys) {
          if (typeof k === "symbol") {
            activePath.delete(val);
            return makeIdentityFailure(
              "INVALID_IDENTITY_INPUT",
              "Symbol properties on arrays are prohibited",
              path,
            );
          }
          if (k === "length") continue;

          if (!/^(0|[1-9][0-9]*)$/.test(k)) {
            activePath.delete(val);
            return makeIdentityFailure(
              "INVALID_IDENTITY_INPUT",
              `Array contains invalid non-canonical index property '${k}'`,
              path,
            );
          }
          const idx = parseInt(k, 10);
          if (idx < 0 || idx >= val.length) {
            activePath.delete(val);
            return makeIdentityFailure(
              "INVALID_IDENTITY_INPUT",
              `Array index '${k}' is out of bounds [0..${val.length - 1}]`,
              path,
            );
          }
        }

        const snapshotArr: unknown[] = new Array(val.length);
        for (let i = 0; i < val.length; i++) {
          const keyStr = String(i);
          let desc: PropertyDescriptor | undefined;
          try {
            if (!Object.prototype.hasOwnProperty.call(val, keyStr)) {
              activePath.delete(val);
              return makeIdentityFailure(
                "INVALID_IDENTITY_INPUT",
                `Sparse array element at index [${i}] is prohibited`,
                path ? `${path}[${i}]` : `[${i}]`,
              );
            }
            desc = Object.getOwnPropertyDescriptor(val, keyStr);
          } catch (e) {
            activePath.delete(val);
            return makeIdentityFailure(
              "INVALID_IDENTITY_INPUT",
              `Proxy/reflection trap exception at array index [${i}]: ${e instanceof Error ? e.message : String(e)}`,
              path ? `${path}[${i}]` : `[${i}]`,
            );
          }

          if (!desc || !desc.enumerable) {
            activePath.delete(val);
            return makeIdentityFailure(
              "INVALID_IDENTITY_INPUT",
              `Array element at index [${i}] must be enumerable`,
              path ? `${path}[${i}]` : `[${i}]`,
            );
          }
          if (desc.get || desc.set) {
            activePath.delete(val);
            return makeIdentityFailure(
              "INVALID_IDENTITY_INPUT",
              `Getters and setters are prohibited on array index '${keyStr}'`,
              path ? `${path}[${i}]` : `[${i}]`,
            );
          }

          const elemRes = buildTrustedInertSnapshot(
            desc.value,
            activePath,
            path ? `${path}[${i}]` : `[${i}]`,
          );
          if (!elemRes.ok) {
            activePath.delete(val);
            return elemRes;
          }
          snapshotArr[i] = elemRes.value;
        }

        activePath.delete(val);
        return { ok: true, value: snapshotArr as unknown as T };
      }

      // Plain prototype check for ordinary objects
      let proto: unknown;
      try {
        proto = Object.getPrototypeOf(val);
      } catch (e) {
        return makeIdentityFailure(
          "INVALID_IDENTITY_INPUT",
          `Proxy/reflection trap exception on prototype: ${e instanceof Error ? e.message : String(e)}`,
          path,
        );
      }
      if (proto !== Object.prototype && proto !== null) {
        return makeIdentityFailure(
          "INVALID_IDENTITY_INPUT",
          "Value must be a plain object",
          path,
        );
      }

      activePath.add(val);
      let keys: (string | symbol)[];
      try {
        keys = Reflect.ownKeys(val);
      } catch (e) {
        activePath.delete(val);
        return makeIdentityFailure(
          "INVALID_IDENTITY_INPUT",
          `Proxy/reflection trap exception on object keys: ${e instanceof Error ? e.message : String(e)}`,
          path,
        );
      }

      const snapshotObj: Record<string, unknown> = {};
      for (const key of keys) {
        if (typeof key !== "string") {
          activePath.delete(val);
          return makeIdentityFailure(
            "INVALID_IDENTITY_INPUT",
            "Object keys must be strings",
            path,
          );
        }

        const keyUnicodeErr = validateJcsUnicodeString(
          key,
          path ? `${path}.${key}` : key,
        );
        if (keyUnicodeErr) {
          activePath.delete(val);
          return { ok: false, error: keyUnicodeErr };
        }

        let desc: PropertyDescriptor | undefined;
        try {
          desc = Object.getOwnPropertyDescriptor(val, key);
        } catch (e) {
          activePath.delete(val);
          return makeIdentityFailure(
            "INVALID_IDENTITY_INPUT",
            `Proxy/reflection trap exception on key '${key}': ${e instanceof Error ? e.message : String(e)}`,
            path,
          );
        }

        if (!desc || !desc.enumerable) {
          activePath.delete(val);
          return makeIdentityFailure(
            "INVALID_IDENTITY_INPUT",
            `Object key '${key}' must be enumerable`,
            path,
          );
        }
        if (desc.get || desc.set) {
          activePath.delete(val);
          return makeIdentityFailure(
            "INVALID_IDENTITY_INPUT",
            `Getters and setters are prohibited on key '${key}'`,
            path,
          );
        }

        const childPath = path ? `${path}.${key}` : key;
        const childRes = buildTrustedInertSnapshot(
          desc.value,
          activePath,
          childPath,
        );
        if (!childRes.ok) {
          activePath.delete(val);
          return childRes;
        }
        snapshotObj[key] = childRes.value;
      }

      activePath.delete(val);
      return { ok: true, value: snapshotObj as unknown as T };
    }

    return makeIdentityFailure(
      "INVALID_IDENTITY_INPUT",
      `Unsupported runtime value type: ${typeof val}`,
      path,
    );
  } catch (e) {
    return makeIdentityFailure(
      "INVALID_IDENTITY_INPUT",
      e instanceof Error ? e.message : String(e),
      path,
    );
  }
}

/**
 * Validates strict JSON value compliance and carrier safety for V2 JCS.
 */
export function validateHostileRuntimeCarrier(
  val: unknown,
  activePath = new Set<unknown>(),
  path = "",
): V2IdentityError | null {
  const res = buildTrustedInertSnapshot(val, activePath, path);
  return res.ok ? null : res.error;
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
  const snapRes = buildTrustedInertSnapshot(value);
  if (!snapRes.ok) {
    return snapRes;
  }
  try {
    const jcs = serializeV2JcsInternal(snapRes.value);
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
