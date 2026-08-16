import type { EpistemicRequirementContract } from "../types.js";

/**
 * Static, version-controlled GS1 GTIN Epistemic Requirement fixture.
 * Conforms strictly to AMS-0852 §4.3 / CONTRACT-R1.
 * Immutable at runtime.
 */
export const GS1_GTIN_EPISTEMIC_REQUIREMENT: EpistemicRequirementContract =
  Object.freeze({
    $schema: "https://zyppi.org/schemas/v1/epistemic_requirement.json",
    requirementId: "epistemic:req:gtin_identification:v1",
    version: "1.0.0",
    targetDimension: "Subject",
    goldenQuestionRef: "Who",
    requiredFacts: Object.freeze([
      Object.freeze({
        factKey: "primaryIdentifier.gtin14",
        optionality: "MANDATORY",
        expectedType: "string:gtin14",
      }),
      Object.freeze({
        factKey: "brandOwner.gln",
        optionality: "OPTIONAL",
        expectedType: "string:gln",
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

/**
 * Static, version-controlled GS1 Brand Owner Epistemic Requirement fixture.
 * Conforms strictly to AMS-0852 §4.3 / CONTRACT-R1.
 * Immutable at runtime.
 */
export const GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT: EpistemicRequirementContract =
  Object.freeze({
    $schema: "https://zyppi.org/schemas/v1/epistemic_requirement.json",
    requirementId: "epistemic:req:brand_owner_authority:v1",
    version: "1.0.0",
    targetDimension: "Authority",
    goldenQuestionRef: "Who",
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
      validTimeRequired: true,
    }),
  });
