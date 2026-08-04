import * as crypto from "crypto";
import { canonicalizeJcs } from "@zyppi/domain";
import type { SeedManifest } from "./seed-manifest.js";
import type { SeedExecutionOutcome } from "./seed-outcomes.js";

export function verifyRecordIntegrity(
  manifest: SeedManifest,
):
  | { readonly ok: true }
  | { readonly ok: false; readonly outcome: SeedExecutionOutcome } {
  try {
    // 1. Canonicalize records under RFC 8785
    const canonicalRecords = canonicalizeJcs(manifest.records);

    // 2. Compute SHA-256 over the UTF-8 bytes
    const computedDigest = crypto
      .createHash("sha256")
      .update(canonicalRecords, "utf8")
      .digest("hex"); // Node defaults to lowercase hex

    // 3. Compare with manifest.integrityDigest
    if (computedDigest !== manifest.integrityDigest) {
      return {
        ok: false,
        outcome: {
          kind: "IntegrityRefusal",
          manifestId: manifest.manifestId,
          reasonCode: "INTEGRITY_DIGEST_MISMATCH",
        },
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId: manifest.manifestId,
        reasonCode: "CANONICALIZATION_FAILED",
      },
    };
  }
}
