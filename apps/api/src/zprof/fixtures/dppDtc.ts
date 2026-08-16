import type { DomainTemplateCard } from "../types.js";

/**
 * Static, version-controlled Digital Product Passport (DPP) Domain Template Card fixture.
 * Bounded participation fixture for AMS-0854 factorization validation.
 * Uses ONLY existing ARM Profiles ("arm:profile:trade_item:v1").
 * Conforms strictly to AMS-0852 §3.3 / CONTRACT-R1.
 * Immutable at runtime.
 */
export const DPP_DOMAIN_TEMPLATE_CARD: DomainTemplateCard = Object.freeze({
  $schema: "https://zyppi.org/schemas/v1/dtc.json",
  dtcId: "dtc:zyppi:domain:dpp:v1",
  domainIdentifier: "domain:dpp",
  domainName: "Digital Product Passport Domain",
  version: "1.0.0",
  scope:
    "Digital Product Passport material circularity, compliance, and passport validation",
  applicableAssetClasses: Object.freeze(["asset:class:trade_item:v1"]),
  applicableArmProfiles: Object.freeze(["arm:profile:trade_item:v1"]),
  epistemicRequirements: Object.freeze([
    "epistemic:req:dpp_passport_identification:v1",
    "epistemic:req:dpp_material_composition:v1",
  ]),
  requiredPrjSpecifications: Object.freeze([
    "prj:spec:dpp_passport_projection:v1",
  ]),
  requiredRsnBlueprints: Object.freeze([
    "rsn:blueprint:dpp_passport_verification:v1",
  ]),
  requiredContextDimensions: Object.freeze([
    "context:dimension:valid_time",
    "context:dimension:jurisdiction",
  ]),
  applicablePolRequirements: Object.freeze(["pol:req:active_standing:v1"]),
  applicableSecRequirements: Object.freeze([
    "sec:req:sha256_payload_integrity:v1",
  ]),
  requiredRiCapabilities: Object.freeze([
    "ri:capability:stage7_ast_evaluation:v1",
  ]),
  versionConstraints: Object.freeze({
    armProfileMinVersion: "1.0.0",
    prjSpecMinVersion: "1.0.0",
  }),
  provenanceRequirements: Object.freeze({
    requireRegistrationReceipt: true,
    requireAuthorIdentity: true,
  }),
});
