import * as crypto from "crypto";
import { canonicalizeJcs } from "@zyppi/domain";
import type { SeedManifest } from "./seed-manifest.js";
import type { SeedExecutionOutcome } from "./seed-outcomes.js";
import type { SeedTrustKeyEntry } from "./seed-trust-set.js";

// Binding key ID convention: zyppi-seed-ed25519-<four-digit-year>-v<version-integer>
const KEY_ID_REGEX = /^zyppi-seed-ed25519-\d{4}-v\d+$/;

export function verifyManifestAuthority(
  manifest: SeedManifest,
  trustSet: readonly SeedTrustKeyEntry[],
):
  | { readonly ok: true }
  | { readonly ok: false; readonly outcome: SeedExecutionOutcome } {
  const manifestId = manifest.manifestId;

  // 1. Validate keyId syntax & convention
  if (!KEY_ID_REGEX.test(manifest.keyId)) {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "INVALID_KEY_ID_CONVENTION",
      },
    };
  }

  // 2. Resolve keyId against trust set
  const keyEntry = trustSet.find((entry) => entry.keyId === manifest.keyId);
  if (!keyEntry) {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "UNKNOWN_KEY_ID",
      },
    };
  }

  // 3. Confirm active status
  if (keyEntry.status !== "active") {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "REVOKED_OR_INACTIVE_KEY",
      },
    };
  }

  // 4. Algorithm binding check
  if (
    manifest.signatureAlgorithm !== "Ed25519" ||
    keyEntry.algorithm !== "Ed25519"
  ) {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "ALGORITHM_MISMATCH",
      },
    };
  }

  // 5. Public Key format and length check
  let publicKeyBuffer: Buffer;
  try {
    publicKeyBuffer = Buffer.from(keyEntry.publicKey, "base64");
  } catch {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "MALFORMED_PUBLIC_KEY_BASE64",
      },
    };
  }

  if (publicKeyBuffer.length !== 32) {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "INVALID_PUBLIC_KEY_LENGTH",
      },
    };
  }

  // 6. Signature format and length check
  let signatureBuffer: Buffer;
  try {
    signatureBuffer = Buffer.from(manifest.signature, "base64");
  } catch {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "MALFORMED_SIGNATURE_BASE64",
      },
    };
  }

  if (signatureBuffer.length !== 64) {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "INVALID_SIGNATURE_LENGTH",
      },
    };
  }

  // 7. Construct the signed envelope
  const signedEnvelope = {
    manifestId: manifest.manifestId,
    manifestVersion: manifest.manifestVersion,
    authorityReference: manifest.authorityReference,
    keyId: manifest.keyId,
    integrityAlgorithm: manifest.integrityAlgorithm,
    integrityDigest: manifest.integrityDigest,
    signatureAlgorithm: manifest.signatureAlgorithm,
  };

  // 8. Canonicalize the signed envelope under RFC 8785
  let canonicalEnvelope: string;
  try {
    canonicalEnvelope = canonicalizeJcs(signedEnvelope);
  } catch {
    return {
      ok: false,
      outcome: {
        kind: "ValidationRefusal",
        manifestId,
        reasonCode: "SIGNED_ENVELOPE_CANONICALIZATION_FAILED",
      },
    };
  }

  // 9. Reconstruct SPKI DER wrapper for Ed25519
  const spkiHeader = Buffer.from("302a300506032b6570032100", "hex");
  const spkiPublicKey = Buffer.concat([spkiHeader, publicKeyBuffer]);

  let pubKeyObj: crypto.KeyObject;
  try {
    pubKeyObj = crypto.createPublicKey({
      key: spkiPublicKey,
      format: "der",
      type: "spki",
    });
  } catch {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "PUBLIC_KEY_INITIALIZATION_FAILED",
      },
    };
  }

  // 10. Verify Ed25519 signature
  const dataBuffer = Buffer.from(canonicalEnvelope, "utf8");
  let isSignatureValid = false;
  try {
    isSignatureValid = crypto.verify(
      undefined,
      dataBuffer,
      pubKeyObj,
      signatureBuffer,
    );
  } catch {
    isSignatureValid = false;
  }

  if (!isSignatureValid) {
    return {
      ok: false,
      outcome: {
        kind: "AuthorityRefusal",
        manifestId,
        reasonCode: "SIGNATURE_VERIFICATION_FAILED",
      },
    };
  }

  return { ok: true };
}
