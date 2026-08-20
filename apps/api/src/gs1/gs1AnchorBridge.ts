import {
  parseGs1DigitalLink,
  validateGs1DigitalLink,
  normalizeGs1DigitalLink,
} from "@zyppi/domain";
import {
  resolveGs1DigitalLink,
  type RegistryRepository,
} from "@zyppi/contracts";
import type { GS1AnchorBridgeResult } from "./types.js";

/**
 * Resolves an untrusted external GS1 carrier string into a lawful constitutional anchor
 * through the existing M06 resolution path.
 *
 * Sequence:
 * untrusted carrier → parseGs1DigitalLink → validateGs1DigitalLink → normalizeGs1DigitalLink → resolveGs1DigitalLink (M06)
 *
 * Fails closed immediately at the first stage failure.
 * Performs zero identity synthesis, zero Registry mutation, zero fallback resolution.
 */
export async function createGs1AnchorFromCarrier(
  carrierInput: string,
  repository: RegistryRepository,
): Promise<GS1AnchorBridgeResult> {
  // Stage 1: Parse GS1 Digital Link
  const parseRes = parseGs1DigitalLink(carrierInput);
  if (!parseRes.ok) {
    const failure: GS1AnchorBridgeResult = {
      ok: false,
      error: {
        stage: "PARSE",
        error: parseRes.error,
      },
    };
    return Object.freeze(failure);
  }
  const parsedCarrier = parseRes.value;

  // Stage 2: Validate GS1 Digital Link
  const validateRes = validateGs1DigitalLink(parsedCarrier);
  if (!validateRes.ok) {
    const failure: GS1AnchorBridgeResult = {
      ok: false,
      error: {
        stage: "VALIDATION",
        error: validateRes.error,
      },
    };
    return Object.freeze(failure);
  }
  const validatedCarrier = validateRes.value;

  // Stage 3: Normalize GS1 Digital Link
  const normalizeRes = normalizeGs1DigitalLink(validatedCarrier);
  if (!normalizeRes.ok) {
    const failure: GS1AnchorBridgeResult = {
      ok: false,
      error: {
        stage: "NORMALIZATION",
        error: normalizeRes.error,
      },
    };
    return Object.freeze(failure);
  }
  const normalizedCarrier = normalizeRes.value;

  // Stage 4: M06 Registry Resolution
  const resolveRes = await resolveGs1DigitalLink(normalizedCarrier, repository);
  if (!resolveRes.ok) {
    const failure: GS1AnchorBridgeResult = {
      ok: false,
      error: {
        stage: "RESOLUTION",
        error: resolveRes.error,
      },
    };
    return Object.freeze(failure);
  }
  const resolvedAnchor = resolveRes.value;

  // Build provenance view without inventing new facts
  const provenance = Object.freeze({
    carrierInput,
    parsedCarrier,
    validatedCarrier,
    normalizedCarrier,
    resolvedCanonicalId: normalizedCarrier.k1,
  });

  const success: GS1AnchorBridgeResult = {
    ok: true,
    provenance,
    anchor: resolvedAnchor,
  };

  return Object.freeze(success);
}
