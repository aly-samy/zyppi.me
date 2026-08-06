import { canonicalizeJcs } from "@zyppi/domain";
import * as crypto from "crypto";

/**
 * Recursively cleans an object to ensure it only contains types compatible with JCS.
 * Specifically, it strips out undefined properties from plain objects and arrays
 * so they don't trigger JcsError ("Prohibited runtime value").
 */
export function cleanForJcs(val: unknown): unknown {
  if (val === null) {
    return null;
  }
  if (val === undefined) {
    return undefined;
  }
  if (Array.isArray(val)) {
    return val.map(cleanForJcs).filter((v) => v !== undefined);
  }
  if (typeof val === "object") {
    const proto = Object.getPrototypeOf(val);
    if (proto !== Object.prototype && proto !== null) {
      return val;
    }
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(val)) {
      const v = (val as Record<string, unknown>)[key];
      if (v !== undefined) {
        const cleanedVal = cleanForJcs(v);
        if (cleanedVal !== undefined) {
          cleaned[key] = cleanedVal;
        }
      }
    }
    return cleaned;
  }
  return val;
}

/**
 * Serializes a value using RFC 8785 (JCS) after cleaning any undefined values.
 */
export function canonicalize(val: unknown): string {
  const cleaned = cleanForJcs(val);
  return canonicalizeJcs(cleaned);
}

/**
 * Computes the SHA-256 hex digest of the canonical RFC 8785 representation of a value.
 */
export function getCanonicalHash(val: unknown): string {
  const canonicalString = canonicalize(val);
  return crypto
    .createHash("sha256")
    .update(canonicalString, "utf8")
    .digest("hex");
}
