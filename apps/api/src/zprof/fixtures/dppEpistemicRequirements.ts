import type { EpistemicRequirementContract } from "../types.js";

/**
 * Static, version-controlled DPP Passport Identification Epistemic Requirement fixture.
 * Conforms strictly to AMS-0852 §4.3 / CONTRACT-R1.
 * Immutable at runtime.
 */
export const DPP_PASSPORT_IDENTIFICATION_REQUIREMENT: EpistemicRequirementContract =
  Object.freeze({
    $schema: "https://zyppi.org/schemas/v1/epistemic_requirement.json",
    requirementId: "epistemic:req:dpp_passport_identification:v1",
    version: "1.0.0",
    targetDimension: "Subject",
    goldenQuestionRef: "Who",
    requiredFacts: Object.freeze([
      Object.freeze({
        factKey: "primaryIdentifier.dppId",
        optionality: "MANDATORY",
        expectedType: "string:dpp_id",
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
 * Static, version-controlled DPP Material Composition Epistemic Requirement fixture.
 * Used to exercise epistemic deficit testing (UNAVAILABLE / UNVERIFIED) per AMS-0854 §8.
 * Conforms strictly to AMS-0852 §4.3 / CONTRACT-R1.
 * Immutable at runtime.
 */
export const DPP_MATERIAL_COMPOSITION_REQUIREMENT: EpistemicRequirementContract =
  Object.freeze({
    $schema: "https://zyppi.org/schemas/v1/epistemic_requirement.json",
    requirementId: "epistemic:req:dpp_material_composition:v1",
    version: "1.0.0",
    targetDimension: "Capability",
    goldenQuestionRef: "What",
    requiredFacts: Object.freeze([
      Object.freeze({
        factKey: "materialComposition",
        optionality: "MANDATORY",
        expectedType: "object:material_recycled_ratio",
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
