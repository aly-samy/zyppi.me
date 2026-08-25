import {
  makeIdentityFailure,
  validateJcsUnicodeString,
  type V2IdentityResult,
} from "./canonical.js";
import type { TemporalCoordinatesV2 } from "./types.js";

const ISO_8601_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:Z|([+-])(\d{2}):(\d{2}))$/i;

/**
 * Canonicalizes an ISO-8601 temporal instant string to UTC "Z" format.
 * - Seconds always present.
 * - Fraction omitted when zero.
 * - Trailing fractional zeroes removed.
 * - Arbitrary fractional precision preserved (not truncated to milliseconds).
 * - Offset normalized to UTC Z.
 */
export function normalizeTemporalCoordinateV2(
  instantStr: string,
  path = "",
): V2IdentityResult<string> {
  const unicodeErr = validateJcsUnicodeString(instantStr, path);
  if (unicodeErr) {
    return { ok: false, error: unicodeErr };
  }

  const match = ISO_8601_REGEX.exec(instantStr);
  if (!match) {
    return makeIdentityFailure(
      "TEMPORAL_CANONICALIZATION_FAILURE",
      `Invalid ISO-8601 temporal instant syntax: '${instantStr}'`,
      path,
    );
  }

  const [
    ,
    yearStr,
    monthStr,
    dayStr,
    hourStr,
    minStr,
    secStr,
    fracStr,
    offsetSign,
    offsetHourStr,
    offsetMinStr,
  ] = match;

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const second = parseInt(secStr, 10);

  // Validate calendar bounds
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return makeIdentityFailure(
      "TEMPORAL_CANONICALIZATION_FAILURE",
      `Out-of-bounds ISO-8601 temporal components in '${instantStr}'`,
      path,
    );
  }

  let offsetMinutes = 0;
  if (offsetSign && offsetHourStr && offsetMinStr) {
    const offHour = parseInt(offsetHourStr, 10);
    const offMin = parseInt(offsetMinStr, 10);
    if (offHour > 23 || offMin > 59) {
      return makeIdentityFailure(
        "TEMPORAL_CANONICALIZATION_FAILURE",
        `Invalid timezone offset in '${instantStr}'`,
        path,
      );
    }
    const totalOffMin = offHour * 60 + offMin;
    offsetMinutes = offsetSign === "+" ? totalOffMin : -totalOffMin;
  }

  // Compute UTC timestamp
  const localUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const actualUtcMs = localUtcMs - offsetMinutes * 60 * 1000;
  const utcDate = new Date(actualUtcMs);

  // Verify Date is valid
  if (isNaN(utcDate.getTime())) {
    return makeIdentityFailure(
      "TEMPORAL_CANONICALIZATION_FAILURE",
      `Invalid calendar instant in '${instantStr}'`,
      path,
    );
  }

  const pad = (n: number, width = 2) => String(n).padStart(width, "0");
  const utcYear = pad(utcDate.getUTCFullYear(), 4);
  const utcMonth = pad(utcDate.getUTCMonth() + 1, 2);
  const utcDay = pad(utcDate.getUTCDate(), 2);
  const utcHours = pad(utcDate.getUTCHours(), 2);
  const utcMinutes = pad(utcDate.getUTCMinutes(), 2);
  const utcSeconds = pad(utcDate.getUTCSeconds(), 2);

  let formattedFraction = "";
  if (fracStr) {
    // Trim trailing zeroes
    const trimmed = fracStr.replace(/0+$/, "");
    if (trimmed.length > 0) {
      formattedFraction = "." + trimmed;
    }
  }

  const normalizedStr = `${utcYear}-${utcMonth}-${utcDay}T${utcHours}:${utcMinutes}:${utcSeconds}${formattedFraction}Z`;
  return { ok: true, value: normalizedStr };
}

/**
 * Normalizes all temporal coordinates in TemporalCoordinatesV2 to UTC Z.
 */
export function canonicalizeTemporalCoordinatesV2(
  coords: TemporalCoordinatesV2,
): V2IdentityResult<TemporalCoordinatesV2> {
  const normTeInput = normalizeTemporalCoordinateV2(
    coords.tEInput,
    "temporalCoordinates.tEInput",
  );
  if (!normTeInput.ok) return normTeInput;

  let normTValid = coords.tValid;
  if (coords.tValid) {
    const res = normalizeTemporalCoordinateV2(
      coords.tValid,
      "temporalCoordinates.tValid",
    );
    if (!res.ok) return res;
    normTValid = res.value;
  }

  let normTObservation = coords.tObservation;
  if (coords.tObservation) {
    const res = normalizeTemporalCoordinateV2(
      coords.tObservation,
      "temporalCoordinates.tObservation",
    );
    if (!res.ok) return res;
    normTObservation = res.value;
  }

  let normTTrust = coords.tTrust;
  if (coords.tTrust) {
    const res = normalizeTemporalCoordinateV2(
      coords.tTrust,
      "temporalCoordinates.tTrust",
    );
    if (!res.ok) return res;
    normTTrust = res.value;
  }

  return {
    ok: true,
    value: {
      tEInput: normTeInput.value,
      ...(normTValid ? { tValid: normTValid } : {}),
      ...(normTObservation ? { tObservation: normTObservation } : {}),
      ...(normTTrust ? { tTrust: normTTrust } : {}),
    },
  };
}
