import crypto from "crypto";
import { canonicalizeJcs } from "./seed-helpers.js";
import { type EvidenceBundle, validateEvidenceRecord } from "./index.js";

export interface BundleVerificationReport {
  readonly isValid: boolean;
  /**
   * Present only when the entire bundle verifies successfully.
   */
  readonly aggregateBundleDigest?: string;
  /**
   * Present only when bundle-level preconditions fail.
   */
  readonly errorCode?: "BUNDLE_LIMIT_EXCEEDED";
  readonly records: readonly EvidenceRecordVerificationResult[];
}

export interface EvidenceRecordVerificationResult {
  readonly evidenceId: string;
  readonly valid: boolean;
  /**
   * Omitted when verification cannot compute a digest.
   */
  readonly computedHash?: string;
  readonly registeredHash: string;
  readonly errorCode?:
    | "HASH_MISMATCH"
    | "PAYLOAD_MISSING"
    | "INVALID_RECORD"
    | "UNSUPPORTED_HASH_ALGORITHM"
    | "INVALID_HASH_FORMAT";
}

export interface VerifyEvidenceBundleOptions {
  readonly maxBundleSize?: number;
}

export const DEFAULT_MAX_BUNDLE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Pure, deterministic verification engine to verify a resolved Evidence Bundle
 * against supplied payloads.
 */
export function verifyEvidenceBundle(
  bundle: EvidenceBundle,
  payloads: ReadonlyMap<string, unknown> | Record<string, unknown>,
  options?: VerifyEvidenceBundleOptions,
): BundleVerificationReport {
  // Defensive check for invalid bundle reference
  if (!bundle || !Array.isArray(bundle.evidenceRecords)) {
    const report: BundleVerificationReport = {
      isValid: false,
      records: [],
    };
    return Object.freeze(report);
  }

  const payloadMap =
    payloads instanceof Map ? payloads : new Map(Object.entries(payloads));

  // Phase 1: Precondition validation (Aggregate payload size limit)
  let totalSize = 0;
  const limit = options?.maxBundleSize ?? DEFAULT_MAX_BUNDLE_SIZE;

  for (const record of bundle.evidenceRecords) {
    if (record && typeof record === "object") {
      const p = payloadMap.get(record.evidenceId);
      if (p !== undefined) {
        try {
          const serialized = canonicalizeJcs(p);
          totalSize += new TextEncoder().encode(serialized).length;
        } catch {
          // Invalid payload serialization will be caught during the record-level phase
        }
      }
    }
  }

  if (totalSize > limit) {
    const report: BundleVerificationReport = {
      isValid: false,
      errorCode: "BUNDLE_LIMIT_EXCEEDED",
      records: [],
    };
    return Object.freeze(report);
  }

  // Phase 2: Verify every Evidence Record
  const records: EvidenceRecordVerificationResult[] = [];
  let allValid = true;

  for (const record of bundle.evidenceRecords) {
    const validation = validateEvidenceRecord(record);
    if (!validation.ok) {
      allValid = false;
      const result: EvidenceRecordVerificationResult = {
        evidenceId: (record && record.evidenceId) || "",
        valid: false,
        registeredHash: (record && record.hash) || "",
        errorCode: "INVALID_RECORD",
      };
      records.push(Object.freeze(result));
      continue;
    }

    const { evidenceId, hash: registeredHash } = validation.value;

    // Check registered hash format & algorithm
    const colonIndex = registeredHash.indexOf(":");
    if (colonIndex === -1) {
      allValid = false;
      const result: EvidenceRecordVerificationResult = {
        evidenceId,
        valid: false,
        registeredHash,
        errorCode: "INVALID_HASH_FORMAT",
      };
      records.push(Object.freeze(result));
      continue;
    }

    const algorithm = registeredHash.substring(0, colonIndex).toLowerCase();
    const hashHex = registeredHash.substring(colonIndex + 1);

    if (algorithm !== "sha256") {
      allValid = false;
      const result: EvidenceRecordVerificationResult = {
        evidenceId,
        valid: false,
        registeredHash,
        errorCode: "UNSUPPORTED_HASH_ALGORITHM",
      };
      records.push(Object.freeze(result));
      continue;
    }

    if (!/^[a-fA-F0-9]{64}$/.test(hashHex)) {
      allValid = false;
      const result: EvidenceRecordVerificationResult = {
        evidenceId,
        valid: false,
        registeredHash,
        errorCode: "INVALID_HASH_FORMAT",
      };
      records.push(Object.freeze(result));
      continue;
    }

    // Check payload presence
    const payload = payloadMap.get(evidenceId);
    if (payload === undefined) {
      allValid = false;
      const result: EvidenceRecordVerificationResult = {
        evidenceId,
        valid: false,
        registeredHash,
        errorCode: "PAYLOAD_MISSING",
      };
      records.push(Object.freeze(result));
      continue;
    }

    // Canonical payload serialization
    let serialized: string;
    try {
      serialized = canonicalizeJcs(payload);
    } catch {
      allValid = false;
      const result: EvidenceRecordVerificationResult = {
        evidenceId,
        valid: false,
        registeredHash,
        errorCode: "INVALID_RECORD",
      };
      records.push(Object.freeze(result));
      continue;
    }

    // Cryptographic digest computation
    const computedHex = crypto
      .createHash("sha256")
      .update(serialized, "utf8")
      .digest("hex")
      .toLowerCase();
    const computedHash = "sha256:" + computedHex;

    const isMatch = computedHex === hashHex.toLowerCase();

    if (isMatch) {
      const result: EvidenceRecordVerificationResult = {
        evidenceId,
        valid: true,
        computedHash,
        registeredHash,
      };
      records.push(Object.freeze(result));
    } else {
      allValid = false;
      const result: EvidenceRecordVerificationResult = {
        evidenceId,
        valid: false,
        computedHash,
        registeredHash,
        errorCode: "HASH_MISMATCH",
      };
      records.push(Object.freeze(result));
    }
  }

  // Freeze records array
  Object.freeze(records);

  // Phase 3: Generate Aggregate Bundle Digest (Only if every record successfully verified)
  if (allValid && records.length > 0) {
    // Sort records lexically by evidenceId
    const sortedRecords = [...records].sort((a, b) => {
      if (a.evidenceId < b.evidenceId) return -1;
      if (a.evidenceId > b.evidenceId) return 1;
      return 0;
    });

    // Derive aggregate digest from canonical ordered record hashes using JCS serialization
    const orderedHashes = sortedRecords.map((r) => r.computedHash!);
    const canonicalHashesStr = canonicalizeJcs(orderedHashes);
    const aggregateHex = crypto
      .createHash("sha256")
      .update(canonicalHashesStr, "utf8")
      .digest("hex")
      .toLowerCase();
    const aggregateBundleDigest = "sha256:" + aggregateHex;

    const report: BundleVerificationReport = {
      isValid: true,
      aggregateBundleDigest,
      records,
    };
    return Object.freeze(report);
  }

  const report: BundleVerificationReport = {
    isValid: allValid,
    records,
  };
  return Object.freeze(report);
}
