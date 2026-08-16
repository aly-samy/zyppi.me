import type { CompositionError } from "./types.js";

/**
 * Checks whether a version string is an explicit, concrete SemVer version specifier (X.Y.Z).
 * Rejects floating specifiers, wildcards, semver ranges, partial versions, and unversioned references:
 * - "latest", "*", "wildcard", "unversioned"
 * - "^1.0.0", "~1.0.0", ">=1.0.0", "<=2.0.0", ">1.0", "<2.0"
 * - "1.x", "1.0.x", "1.*", "v1", "1.0"
 * - Empty or whitespace-only strings
 */
export function isExplicitVersion(version: string): boolean {
  if (!version || typeof version !== "string") {
    return false;
  }

  const trimmed = version.trim();
  if (
    trimmed === "" ||
    trimmed === "latest" ||
    trimmed === "wildcard" ||
    trimmed === "unversioned" ||
    trimmed === "*"
  ) {
    return false;
  }

  // Check for range/floating prefixes or wildcard characters
  if (
    trimmed.startsWith("^") ||
    trimmed.startsWith("~") ||
    trimmed.startsWith(">") ||
    trimmed.startsWith("<") ||
    trimmed.startsWith("=") ||
    trimmed.startsWith("v") ||
    trimmed.includes("*") ||
    /\b\d+\.x\b/i.test(trimmed) ||
    /\bx\b/i.test(trimmed)
  ) {
    return false;
  }

  // Must follow strict explicit SemVer X.Y.Z pattern (e.g. "1.0.0", "1.0.0-alpha.1")
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(trimmed);
}

/**
 * Validates that all version strings in a list are explicit versions.
 * Returns failure with code "invalid" if any floating or wildcard version specifier is found.
 */
export function validateExplicitVersionList(
  versions: readonly string[],
  contextName: string,
): { ok: true } | { ok: false; error: CompositionError } {
  if (!versions || versions.length === 0) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `${contextName} must contain at least one explicit version binding`,
      },
    };
  }

  for (const ver of versions) {
    if (!isExplicitVersion(ver)) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `Prohibited floating or wildcard version specifier in ${contextName}: '${ver}'`,
        },
      };
    }
  }

  return { ok: true };
}

/**
 * Validates explicit version strings against declared version constraints.
 * If version syntax is floating/invalid -> returns error code "invalid".
 * If explicit version does not satisfy explicit constraint -> returns error code "incompatible".
 */
export function validateVersionConstraints(
  versions: readonly string[],
  versionConstraints: Readonly<Record<string, string>>,
): { ok: true } | { ok: false; error: CompositionError } {
  for (const [key, constraint] of Object.entries(versionConstraints)) {
    // First, check constraint string itself for floating/wildcard
    if (!isExplicitVersion(constraint)) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `Version constraint for '${key}' contains prohibited floating specifier: '${constraint}'`,
        },
      };
    }

    // Compare with provided explicit versions
    // For explicit versions, exact or compatible matching is required
    const matches = versions.some((v) => v === constraint);
    if (!matches) {
      return {
        ok: false,
        error: {
          code: "incompatible",
          category: "Composition Failure",
          message: `Provided version(s) [${versions.join(", ")}] do not satisfy required explicit constraint '${key}: ${constraint}'`,
        },
      };
    }
  }

  return { ok: true };
}
