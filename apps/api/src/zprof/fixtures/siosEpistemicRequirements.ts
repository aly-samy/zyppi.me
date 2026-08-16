import type { EpistemicRequirementContract } from "../types.js";

/**
 * Authoritative SIOS-derived Epistemic Requirement Contract test fixture.
 *
 * Represents an ALREADY-PRODUCED, contract-conforming SIOS requirement
 * for testing Z-PROF consumer-side composition (§19.9).
 *
 * It contains NO translation logic, domain parsers, or runtime code.
 */
export const SIOS_GTIN_EPISTEMIC_REQUIREMENT: EpistemicRequirementContract =
  Object.freeze({
    $schema: "https://zyppi.org/schemas/v1/epistemic_requirement.json",
    requirementId: "epistemic:req:sios:gtin_trade_item:v1",
    version: "1.0.0",
    targetDimension: "dimension:zyppi:domain:product_identity",
    goldenQuestionRef: "question:zyppi:sios:product_identity_verified",
    requiredFacts: Object.freeze([
      Object.freeze({
        factKey: "primaryIdentifier.gtin14",
        optionality: "MANDATORY",
        expectedType: "string",
      }),
      Object.freeze({
        factKey: "brandOwner.gln",
        optionality: "MANDATORY",
        expectedType: "string",
      }),
    ]),
    evidenceConstraints: Object.freeze({
      requireSignedReceipt: true,
      allowedDigestAlgorithms: Object.freeze(["sha256"]),
    }),
    temporalConstraints: Object.freeze({
      validTimeRequired: true,
    }),
  });

export const SIOS_BRAND_OWNER_EPISTEMIC_REQUIREMENT: EpistemicRequirementContract =
  Object.freeze({
    $schema: "https://zyppi.org/schemas/v1/epistemic_requirement.json",
    requirementId: "epistemic:req:sios:brand_owner_standing:v1",
    version: "1.0.0",
    targetDimension: "dimension:zyppi:domain:brand_authority",
    goldenQuestionRef: "question:zyppi:sios:brand_owner_active",
    requiredFacts: Object.freeze([
      Object.freeze({
        factKey: "authorityId",
        optionality: "MANDATORY",
        expectedType: "string",
      }),
    ]),
    evidenceConstraints: Object.freeze({
      requireSignedReceipt: true,
      allowedDigestAlgorithms: Object.freeze(["sha256"]),
    }),
    temporalConstraints: Object.freeze({
      validTimeRequired: false,
    }),
  });
