export type JsonPrimitiveV2 = null | boolean | number | string;

export type JsonValueV2 =
  | JsonPrimitiveV2
  | readonly JsonValueV2[]
  | { readonly [key: string]: JsonValueV2 };

/**
 * Validates whether a value is a strict, valid JSON value per V2 rules:
 * - null, boolean, finite number, string
 * - Array of valid JsonValueV2 (no extra non-numeric own properties)
 * - Plain object with valid JsonValueV2 values
 *
 * Rejects:
 * - undefined, NaN, Infinity, -Infinity, BigInt, Date, Map, Set, Buffer,
 *   typed arrays, RegExp, functions, symbols, class instances, cyclic objects,
 *   objects with non-Object prototype, getters/accessors.
 *
 * Safely handles Proxy or getter exceptions by catching reflection errors.
 */
export function isStrictJsonValueV2(val: unknown): boolean {
  const seen = new Set<unknown>();

  function validate(v: unknown): boolean {
    if (v === null) return true;

    const t = typeof v;
    if (t === "boolean") return true;
    if (t === "string") return true;
    if (t === "number") {
      return Number.isFinite(v);
    }

    if (t !== "object") {
      // Rejects function, symbol, bigint, undefined
      return false;
    }

    if (seen.has(v)) {
      return false;
    }
    seen.add(v);

    try {
      if (Array.isArray(v)) {
        const ownKeys = Reflect.ownKeys(v);
        for (const k of ownKeys) {
          if (k === "length") continue;
          if (typeof k !== "string" || !/^\d+$/.test(k)) {
            return false;
          }
          const desc = Object.getOwnPropertyDescriptor(v, k);
          if (!desc || desc.get || desc.set) {
            return false;
          }
        }

        for (let i = 0; i < v.length; i++) {
          if (!validate(v[i])) {
            return false;
          }
        }
        return true;
      }

      const proto = Object.getPrototypeOf(v as object);
      if (proto !== Object.prototype && proto !== null) {
        return false;
      }

      const keys = Reflect.ownKeys(v as object);
      for (const k of keys) {
        if (typeof k !== "string") {
          return false;
        }
        const desc = Object.getOwnPropertyDescriptor(v as object, k);
        if (!desc || desc.get || desc.set) {
          return false;
        }
        if (!validate((v as Record<string, unknown>)[k])) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    } finally {
      seen.delete(v);
    }
  }

  try {
    return validate(val);
  } catch {
    return false;
  }
}
