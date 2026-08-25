export type JsonPrimitiveV2 = null | boolean | number | string;

export type JsonValueV2 =
  | JsonPrimitiveV2
  | readonly JsonValueV2[]
  | { readonly [key: string]: JsonValueV2 };

/**
 * Validates whether a value is a strict, valid JSON value per V2 rules:
 * - null, boolean, finite number, string
 * - Array of valid JsonValueV2 (R08: only admitted own keys are 'length' and "0".."length-1", enumerable, no extra keys, no sparse/undefined)
 * - Plain object with valid JsonValueV2 values (R07: all own keys must be enumerable string keys, no getters/setters)
 *
 * Rejects:
 * - undefined, NaN, Infinity, -Infinity, BigInt, Date, Map, Set, Buffer,
 *   typed arrays, RegExp, functions, symbols, class instances, cyclic objects,
 *   objects with non-Object prototype, getters/accessors, non-enumerable hidden properties.
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
        const len = v.length;

        // R08: Number of own keys must be exactly len + 1 (indices 0..len-1 + "length")
        if (ownKeys.length !== len + 1) {
          return false;
        }

        // Verify "length" property
        const lenDesc = Object.getOwnPropertyDescriptor(v, "length");
        if (!lenDesc || lenDesc.get || lenDesc.set) {
          return false;
        }

        // Verify exact index key ordering and property descriptors
        for (let i = 0; i < len; i++) {
          const keyStr = String(i);
          if (ownKeys[i] !== keyStr) {
            return false;
          }
          const desc = Object.getOwnPropertyDescriptor(v, keyStr);
          if (!desc || !desc.enumerable || desc.get || desc.set) {
            return false;
          }
          if (!(i in v) || v[i] === undefined) {
            return false;
          }
          if (!validate(v[i])) {
            return false;
          }
        }

        // The last key in ownKeys must be "length"
        if (ownKeys[len] !== "length") {
          return false;
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
        // R07: Enforce desc.enumerable === true
        if (!desc || !desc.enumerable || desc.get || desc.set) {
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
