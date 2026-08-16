import type { DomainTemplateCard } from "../types.js";

/**
 * Static, version-controlled GS1 Domain Template Card fixture.
 * Conforms strictly to AMS-0852 §3.3 / CONTRACT-R1.
 * Immutable at runtime.
 */
export const GS1_DOMAIN_TEMPLATE_CARD: DomainTemplateCard = Object.freeze({
  $schema: "https://zyppi.org/schemas/v1/dtc.json",
  dtcId: "dtc:zyppi:domain:gs1:v1",
  domainIdentifier: "domain:gs1",
  domainName: "GS1 Commerce Atlas Domain",
  version: "1.0.0",
  scope:
    "Retail commerce, GTIN identification, and GS1 Digital Link resolution",
  applicableAssetClasses: Object.freeze(["asset:class:trade_item:v1"]),
  applicableArmProfiles: Object.freeze(["arm:profile:trade_item:v1"]),
  epistemicRequirements: Object.freeze([
    "epistemic:req:gtin_identification:v1",
    "epistemic:req:brand_owner_authority:v1",
  ]),
  requiredPrjSpecifications: Object.freeze([
    "prj:spec:gs1_digital_link_projection:v1",
  ]),
  requiredRsnBlueprints: Object.freeze([
    "rsn:blueprint:gs1_identity_verification:v1",
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
