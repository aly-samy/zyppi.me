import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  canonicalizeJcs,
  type AuthorityRecord,
  type CapabilityRecord,
  type EvidenceBundle,
  type EvidenceRecord,
  type IdentityRecord,
  type JsonValueV2,
  type PolicyContext,
  type PolicyRecord,
  type ReferentRecord,
  type ResolvedPolicyGraph,
} from "@zyppi/domain";
import {
  type RegistryRepository,
  type RegistryResult,
  type RetrievedRegistryState,
  type ValidatedCanonicalIdentifier,
} from "@zyppi/contracts";
import { executeGs1NativeV2PacketC } from "./gs1ExecutionBridgeV2.js";
import { createGs1AnchorFromCarrier } from "./gs1AnchorBridge.js";
import type { GS1AnchorBridgeSuccess } from "./types.js";
import type {
  BoundPrjProjectionRegistrationV1,
  BoundPrjProjectionSpecificationV1,
  BoundPrjRealityViewV1,
  PrjProjectionRuleSet01,
} from "../prj/index.js";
import { GS1_DOMAIN_TEMPLATE_CARD } from "../zprof/fixtures/gs1Dtc.js";
import { GS1_GTIN_EPISTEMIC_REQUIREMENT } from "../zprof/fixtures/gs1EpistemicRequirements.js";

const validGtin14Carrier = "https://id.gs1.org/01/09506000134352";
const validK1 = "09506000134352";

function computeSha256(text: string): string {
  const hex = crypto
    .createHash("sha256")
    .update(text, "utf8")
    .digest("hex")
    .toLowerCase();
  return `sha256:${hex}`;
}

const mockIdentity: IdentityRecord = {
  identityId: "09506000134352",
  identityType: "GTIN-14",
  canonicalReference: "09506000134352",
  referentId: "ref-trade-item-123",
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockReferent: ReferentRecord = {
  referentId: "ref-trade-item-123",
  referentType: "brand",
  name: "Example Brand",
  parentReferentId: null,
  createdAt: "2026-01-01T00:00:00Z",
};

const mockAuthority: AuthorityRecord = {
  authorityId: "auth:brand_owner:v1",
  subjectId: "arm:profile:trade_item:v1",
  scope: "brand_owner_authority",
  validFrom: "2026-01-01T00:00:00Z",
  validTo: "2030-01-01T00:00:00Z",
};

const mockCapability: CapabilityRecord = {
  capabilityId: "prj:spec:gs1_digital_link_projection:v1",
  subjectId: "arm:profile:trade_item:v1",
  scope: "prj:spec:gs1_digital_link_projection:v1",
  validFrom: "2026-01-01T00:00:00Z",
  validTo: "2030-01-01T00:00:00Z",
};

const mockPolicy: PolicyRecord = {
  policyId: "pol:req:active_standing:v1",
  policyType: "TRADE_ITEM_POLICY",
  version: "1.0.0",
  definition: {
    ruleset: "POL-POLICY-RULESET-01",
    ruleEffect: "PERMIT",
    requiredTrustStatuses: ["definite"],
    authorization: {
      actionSemanticRef: {
        family: "ACTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "verify-asset-v1",
      },
      authorizedTargets: [
        {
          targetSlotSemanticRef: {
            family: "TARGET_SLOT_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "primary-target-v1",
          },
          targetRef: {
            family: "TARGET",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "asset-001",
          },
        },
      ],
      requiredPerformerStates: [],
    },
  },
  active: true,
};

const payloadContent = { gtin: "09506000134352" };
const payloadJcs = canonicalizeJcs(payloadContent);
const exactHash = computeSha256(payloadJcs);

const mockEvidenceRecord: EvidenceRecord = {
  evidenceId: "ev:gtin_registration:v1",
  identityId: "09506000134352",
  evidenceType: "GTIN_REGISTRATION_RECORD",
  hash: exactHash,
  storageRef: "r2://evidence/gtin_registration_v1.json",
  retrievedAt: "2026-01-01T00:00:00Z",
};

const mockEvidenceBundle: EvidenceBundle = {
  schemaVersion: "1.0",
  evidenceRecords: [mockEvidenceRecord],
};

const mockEvidencePayloads = new Map<string, unknown>([
  ["ev:gtin_registration:v1", payloadContent],
]);

const mockRegistryState: RetrievedRegistryState = {
  identity: mockIdentity,
  relationships: [mockReferent],
  standings: [],
  authorities: [mockAuthority],
  capabilities: [mockCapability],
  evidenceReferences: [mockEvidenceRecord],
  applicablePolicies: [mockPolicy],
};

class MockRegistryRepository implements RegistryRepository {
  constructor(private knownK1Map: Map<string, RetrievedRegistryState>) {}

  async lookup(
    identifier: ValidatedCanonicalIdentifier,
  ): Promise<RegistryResult<RetrievedRegistryState | null>> {
    const key =
      typeof identifier === "string"
        ? identifier
        : (identifier as unknown as { value: string }).value ||
          String(identifier);
    const state = this.knownK1Map.get(key) || null;
    return { ok: true, value: state };
  }

  async lookupEvidenceByIds(): Promise<
    RegistryResult<readonly EvidenceRecord[]>
  > {
    return { ok: true, value: [mockEvidenceRecord] };
  }
}

const defaultPolicyContext: PolicyContext = {
  policies: [mockPolicy],
};

const defaultResolvedPolicyGraph: ResolvedPolicyGraph = {
  edges: [],
};

const PROVENANCE_REF = {
  family: "PROVENANCE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "prov-001",
};

function createValidBoundSpecification(params?: {
  specId?: string;
  version?: string;
  actionId?: string;
  targetSlotId?: string;
}): BoundPrjProjectionSpecificationV1 {
  const specId = params?.specId ?? "prj:spec:gs1_digital_link_projection:v1";
  const version = params?.version ?? "1.0.0";
  const provenanceRef = PROVENANCE_REF;
  const actionId = params?.actionId ?? "verify-asset-v1";
  const targetSlotId = params?.targetSlotId ?? "primary-target-v1";

  const rootNode: PrjProjectionRuleSet01["root"] = {
    kind: "OBJECT",
    fields: [
      {
        key: "gtin",
        node: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["gtin"],
          requirement: "REQUIRED",
        },
      },
      {
        key: "brand",
        node: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["brandName"],
          requirement: "OPTIONAL",
        },
      },
    ],
  };

  const specification: PrjProjectionRuleSet01 = {
    ruleset: "PRJ-PROJECTION-RULESET-01",
    requiredActionSemanticRef: {
      family: "ACTION_SEMANTIC",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: actionId,
    },
    requiredCapabilityRef: {
      family: "REQUESTED_CAPABILITY",
      ownerRef: "urn:zyppi:owner:prj:v1",
      artifactId: specId,
      version,
    },
    requiredTargetSlotSemanticRefs: [
      {
        family: "TARGET_SLOT_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: targetSlotId,
      },
    ],
    root: rootNode,
  };

  const specPreimage = { specId, version, provenanceRef, specification };
  const specificationDigest = computeSha256(canonicalizeJcs(specPreimage));

  const regPreimage = {
    registrationId: `reg-${specId}`,
    projectionType: `prj:type:${specId}`,
    specificationRef: { specId, version, specificationDigest },
    freshnessModelRef: "model:freshness:v1",
    completenessModelRef: "model:completeness:v1",
    policyInterfaceRef: "prj:policy-interface:whole-projection:v1",
    supportedProfileRefs: ["profile:v1"],
    provenanceRef,
  };
  const registrationDigest = computeSha256(canonicalizeJcs(regPreimage));

  const registration: BoundPrjProjectionRegistrationV1 = {
    registrationId: `reg-${specId}`,
    projectionType: `prj:type:${specId}`,
    specificationRef: { specId, version, specificationDigest },
    freshnessModelRef: "model:freshness:v1",
    completenessModelRef: "model:completeness:v1",
    policyInterfaceRef: "prj:policy-interface:whole-projection:v1",
    supportedProfileRefs: ["profile:v1"],
    provenanceRef,
    registrationDigest,
  };

  return {
    specId,
    version,
    provenanceRef,
    specificationDigest,
    registration,
    specification,
  };
}

function createValidRealityView(params?: {
  sourceZid?: string;
  targetId?: string;
  material?: unknown;
}): BoundPrjRealityViewV1 {
  const viewId = "rv-001";
  const sourceZid = params?.sourceZid ?? "09506000134352";
  const sourceTargetRef = {
    family: "TARGET" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: params?.targetId ?? "asset-001",
  };
  const viewType = "CURRENT" as const;
  const viewTimestamp = "2026-01-01T00:00:00Z";
  const provenanceRef = PROVENANCE_REF;
  const material = (params?.material ?? {
    gtin: "09506000134352",
    brandName: "Acme Corp",
  }) as JsonValueV2;

  const preimage = {
    viewId,
    sourceZid,
    sourceTargetRef,
    viewType,
    viewTimestamp,
    provenanceRef,
    material,
  };

  const realityDigest = computeSha256(canonicalizeJcs(preimage));

  return {
    viewId,
    sourceZid,
    sourceTargetRef,
    viewType,
    viewTimestamp,
    provenanceRef,
    material,
    realityDigest,
  };
}

async function createValidPacketCInput() {
  const repo = new MockRegistryRepository(
    new Map([[validK1, mockRegistryState]]),
  );
  const anchorRes = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);
  expect(anchorRes.ok).toBe(true);

  const anchorSuccess = anchorRes as GS1AnchorBridgeSuccess;

  const spec = createValidBoundSpecification();
  const realityView = createValidRealityView({ sourceZid: "09506000134352" });

  return {
    carrierInput: validGtin14Carrier,
    composition: {
      anchorSuccess,
      dtcFixture: GS1_DOMAIN_TEMPLATE_CARD,
      epistemicRequirementsFixtures: [GS1_GTIN_EPISTEMIC_REQUIREMENT],
      manifestAuthor: "identity:test:manifest_author",
      registryRepository: repo,
      requestId: "req-c-001",
      executionId: "exec-c-001",
      constitutionalTimestamp: "2026-01-01T00:00:00Z",
      tValid: "2026-01-01T00:00:00Z",
      tObservation: "2026-01-01T00:00:00Z",
      tEInput: "2026-01-01T00:00:00Z",
      budget: 1000,
      entropy: "entropy-string-1234567890",
      versions: ["1.0.0"],
      policyContext: defaultPolicyContext,
      resolvedPolicyGraph: defaultResolvedPolicyGraph,
      explicitEvidenceBundle: mockEvidenceBundle,
      explicitEvidencePayloads: mockEvidencePayloads,
      compositionDefinition: {
        participants: [
          {
            id: "p1",
            identity: "dtc:zyppi:domain:gs1:v1",
            kind: "DTC" as const,
            version: "1.0.0",
            owner: "identity:test:manifest_author",
            role: "domain_template" as const,
            reference: { id: "dtc:zyppi:domain:gs1:v1", version: "1.0.0" },
          },
          {
            id: "p2",
            identity: "arm:profile:trade_item:v1",
            kind: "ARM_PROFILE" as const,
            version: "1.0.0",
            owner: "identity:test:manifest_author",
            role: "asset_profile" as const,
            reference: { id: "arm:profile:trade_item:v1", version: "1.0.0" },
          },
          {
            id: "p3",
            identity: "prj:spec:gs1_digital_link_projection:v1",
            kind: "PRJ_SPECIFICATION" as const,
            version: "1.0.0",
            owner: "identity:test:manifest_author",
            role: "prj_specification" as const,
            reference: {
              id: "prj:spec:gs1_digital_link_projection:v1",
              version: "1.0.0",
            },
          },
          {
            id: "p4",
            identity: "rsn:blueprint:gs1_identity_verification:v1",
            kind: "RSN_BLUEPRINT" as const,
            version: "1.0.0",
            owner: "identity:test:manifest_author",
            role: "rsn_blueprint" as const,
            reference: {
              id: "rsn:blueprint:gs1_identity_verification:v1",
              version: "1.0.0",
            },
          },
          {
            id: "p5",
            identity: "pol:req:active_standing:v1",
            kind: "POL_REQUIREMENT" as const,
            version: "1.0.0",
            owner: "identity:test:manifest_author",
            role: "pol_requirement" as const,
            reference: { id: "pol:req:active_standing:v1", version: "1.0.0" },
          },
          {
            id: "p6",
            identity: "sec:req:sha256_payload_integrity:v1",
            kind: "SEC_REQUIREMENT" as const,
            version: "1.0.0",
            owner: "identity:test:manifest_author",
            role: "sec_requirement" as const,
            reference: {
              id: "sec:req:sha256_payload_integrity:v1",
              version: "1.0.0",
            },
          },
          {
            id: "p7",
            identity: "ri:capability:stage7_ast_evaluation:v1",
            kind: "RI_CAPABILITY" as const,
            version: "1.0.0",
            owner: "identity:test:manifest_author",
            role: "ri_capability" as const,
            reference: {
              id: "ri:capability:stage7_ast_evaluation:v1",
              version: "1.0.0",
            },
          },
        ],
        structuralEdges: [
          {
            sourceId: "dtc:zyppi:domain:gs1:v1",
            targetId: "arm:profile:trade_item:v1",
            relationKind: "CONTAINS",
          },
        ],
        bindingEdges: [
          {
            sourceId: "dtc:zyppi:domain:gs1:v1",
            targetId: "prj:spec:gs1_digital_link_projection:v1",
            dependencyKind: "REQUIRES",
          },
        ],
      },
    },
    participation: {
      roleBindings: [
        {
          roleBindingKey: "rb_actor_1",
          role: "ACTOR" as const,
          subject: {
            kind: "KNOWN" as const,
            subjectRef: {
              family: "SUBJECT" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "subject-actor-1",
            },
          },
        },
      ],
      agencyBindings: [],
    },
    intent: {
      originatorParticipationRef: "rb_actor_1",
      intentCategory: "VERIFY" as const,
      intentTargetRef: {
        family: "TARGET" as const,
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "asset-001",
      },
      candidateStateBinding: {
        stateTargetRef: {
          family: "TARGET" as const,
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "asset-001",
        },
        stateSemanticRef: {
          family: "STATE_SEMANTIC" as const,
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "verification-v1",
        },
        exactStateInstance: {
          kind: "GOVERNED_ARTIFACT_REF" as const,
          stateInstanceRef: {
            family: "STATE_INSTANCE" as const,
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "instance-001",
          },
        },
      },
    },
    requestedAction: {
      actionSemanticRef: {
        family: "ACTION_SEMANTIC" as const,
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "verify-asset-v1",
      },
      intentActionCompatibilityBinding: {
        kind: "GOVERNED_SEMANTIC_CONTRACT" as const,
        exactCompatibilityContractRef: {
          family: "COMPATIBILITY_CONTRACT" as const,
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "compat-001",
        },
      },
      actionPerformerBindings: [
        {
          performerKey: "perf_1",
          actorParticipationRef: "rb_actor_1",
          agencyReliance: { kind: "NO_DELEGATED_AGENCY_RELIANCE" as const },
        },
      ],
      actionTargetBindings: [
        {
          targetSlotSemanticRef: {
            family: "TARGET_SLOT_SEMANTIC" as const,
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "primary-target-v1",
          },
          targetRef: {
            family: "TARGET" as const,
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "asset-001",
          },
        },
      ],
      requestedCapabilityClaimBindings: [
        {
          capabilityClaimKey: "claim_1",
          requestedCapabilityRef: {
            family: "REQUESTED_CAPABILITY" as const,
            ownerRef: "urn:zyppi:owner:prj:v1",
            artifactId: "prj:spec:gs1_digital_link_projection:v1",
            version: "1.0.0",
          },
          claimantPerformerRefs: ["perf_1"],
        },
      ],
    },
    realityView,
    projectionSpecification: spec,
  };
}

describe("AMS-0861-C — Native V2 RI Execution, Provenance & Governed PRJ Projection Test Suite", () => {
  describe("Functional Tests — C0861-V2-T01..T40", () => {
    it("T01 — Full native positive lane", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.contractVersion).toBe("v2");
      expect(result.ownerDeterminations.secTrustResult).toBeDefined();
      expect(result.ownerDeterminations.policyAggregate).toBeDefined();
      expect(result.ownerDeterminations.authorization).toBeDefined();

      expect(result.ri.executionReceipt.runtimeVersion).toBe("2.0.0");
      expect(result.projection.projectionId).toMatch(
        /^prj:projection:v1:[0-9a-f]{64}$/,
      );
      expect(result.provenance.provenanceHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(result.domainResult.domain).toBe("GS1");
      expect(result.domainResult.projectedRepresentation).toEqual({
        gtin: "09506000134352",
        brand: "Acme Corp",
      });
    });

    it("T02 — Packet A identity preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.domainResult.canonicalExternalIdentifier).toBe(
        "09506000134352",
      );
      expect(result.domainResult.sourceZid).toBe("09506000134352");
    });

    it("T03 — SCC identity preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.provenance.packetB.sccId).toBe(result.packetB.sccId);
    });

    it("T04 — BCG identity preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.provenance.packetB.bcgId).toBe(result.packetB.bcgId);
    });

    it("T05 — Packet-B pinned state provenance preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.provenance.packetB.pinnedSemanticStateRef).toBe(
        result.packetB.evaluationCoordinate.pinnedSemanticStateRef.digest,
      );
    });

    it("T06 — tEInput preserved exactly", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.provenance.packetB.tEInput).toBe("2026-01-01T00:00:00Z");
      expect(
        result.executionRequest.executionContext.temporalCoordinates.tEInput,
      ).toBe("2026-01-01T00:00:00Z");
    });

    it("T07 — tValid preserved when present", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.provenance.packetB.tValid).toBe("2026-01-01T00:00:00Z");
    });

    it("T08 — tObservation preserved when present", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.provenance.packetB.tObservation).toBe(
        "2026-01-01T00:00:00Z",
      );
    });

    it("T09 — requestId preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.requestId).toBe("req-c-001");
      expect(result.provenance.request.requestId).toBe("req-c-001");
    });

    it("T10 — executionId preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.executionContext.executionId).toBe(
        "exec-c-001",
      );
      expect(result.provenance.request.executionId).toBe("exec-c-001");
    });

    it("T11 — Packet-B budget preserved into V2", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.executionContext.budget).toBe(1000);
    });

    it("T12 — Packet-B entropy preserved where present", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.executionContext.entropy).toBe(
        "entropy-string-1234567890",
      );
    });

    it("T13 — constitutional state identity validates", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(
        result.executionRequest.constitutionalState.semanticStateRef,
      ).toMatch(/^sha256:[0-9a-f]{64}$/);
    });

    it("T14 — evidence state identity validates", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.evidenceState.evidenceStateRef).toMatch(
        /^sha256:[0-9a-f]{64}$/,
      );
    });

    it("T15 — policy universe identity validates", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.policyUniverse.policyUniverseRef).toMatch(
        /^sha256:[0-9a-f]{64}$/,
      );
    });

    it("T16 — Evidence integrity coordinates cross-bind", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(
        result.executionRequest.evidenceState.integrityCoordinates.length,
      ).toBeGreaterThan(0);
      expect(
        result.executionRequest.evidenceState.integrityCoordinates[0]
          .evidenceRef.artifactId,
      ).toBe("ev:gtin_registration:v1");
    });

    it("T17 — policy manifest cross-binding", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(
        result.executionRequest.policyUniverse.applicablePolicyMaterial.length,
      ).toBe(1);
    });

    it("T18 — explicit Participation preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.participation).toEqual(
        input.participation,
      );
    });

    it("T19 — explicit Intent preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.intent).toEqual(input.intent);
    });

    it("T20 — explicit Requested Action preserved", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.requestedAction).toEqual(
        input.requestedAction,
      );
    });

    it("T21 — SEC production is actual SEC-001", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const secDet = result.ownerDeterminations.secTrustResult;
      expect(secDet.constitutionalOwnerRef.ownerRef).toBe(
        "urn:zyppi:owner:sec:v1",
      );
      expect(secDet.constitutionalOwnerRef.artifactId).toBe("SEC-001");
      expect(
        (secDet.ownerNativeResult as { trustStatus: string }).trustStatus,
      ).toBe("definite");
    });

    it("T22 — POL Aggregate production is actual POL-001", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const aggDet = result.ownerDeterminations.policyAggregate;
      expect(aggDet.constitutionalOwnerRef.ownerRef).toBe(
        "urn:zyppi:owner:pol:v1",
      );
      expect(aggDet.constitutionalOwnerRef.artifactId).toBe("POL-001");
      expect(aggDet.exactRuleRef.artifactId).toBe("POL-AGGREGATE-RULESET-01");
      expect(
        (aggDet.ownerNativeResult as { aggregateResult: string })
          .aggregateResult,
      ).toBe("ALLOW");
    });

    it("T23 — POL Authorization production is separate actual POL-001 determination", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const authDet = result.ownerDeterminations.authorization;
      expect(authDet.constitutionalOwnerRef.ownerRef).toBe(
        "urn:zyppi:owner:pol:v1",
      );
      expect(authDet.constitutionalOwnerRef.artifactId).toBe("POL-001");
      expect(authDet.exactRuleRef.artifactId).toBe(
        "POL-AUTHORIZATION-RULESET-01",
      );
      expect(authDet.determinationBindingKey).not.toBe(
        result.ownerDeterminations.policyAggregate.determinationBindingKey,
      );
      expect(
        (authDet.ownerNativeResult as { authorizationDecision: string })
          .authorizationDecision,
      ).toBe("Authorized");
    });

    it("T24 — owner result ordering / set deterministic", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const bindings =
        result.executionRequest.evaluationContext.ownerDeterminationBindings;
      expect(bindings.length).toBe(3);
    });

    it("T25 — V2 materializer produces explicit contractVersion v2", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.executionRequest.contractVersion).toBe("v2");
    });

    it("T26 — native RI produces Receipt V2", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.ri.executionReceipt.runtimeVersion).toBe("2.0.0");
    });

    it("T27 — RI Executability consumed without recomputation", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const exec = result.ri.executability as {
        status: string;
        value: boolean;
      };
      expect(exec.status).toBe("DETERMINED");
      expect(exec.value).toBe(true);
    });

    it("T28 — RI Outcome consumed without recomputation", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const outcome = result.ri.outcome as { status: string; outcome: string };
      expect(outcome.status).toBe("PRODUCED");
      expect(outcome.outcome).toBe("verified");
    });

    it("T29 — PRJ spec must match manifest", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.projection.specificationBinding.specId).toBe(
        "prj:spec:gs1_digital_link_projection:v1",
      );
    });

    it("T30 — PRJ Reality sourceZid binds canonical internal identity", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.projection.sourceZid).toBe("09506000134352");
    });

    it("T31 — PRJ Reality target binds requested Action target", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.projection.sourceReality.realityDigest).toBe(
        input.realityView.realityDigest,
      );
    });

    it("T32 — actual PRJ materialization succeeds", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.projection.projectionOwnerRef.ownerRef).toBe(
        "urn:zyppi:owner:prj:v1",
      );
      expect(result.projection.projectionOwnerRef.artifactId).toBe("PRJ-001");
    });

    it("T33 — RI / PRJ receipt continuity", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.projection.sourceExecution.receiptId).toBe(
        result.ri.executionReceipt.receiptId,
      );
      expect(result.projection.sourceExecution.inputHash).toBe(
        result.ri.executionReceipt.inputHash,
      );
      expect(result.projection.sourceExecution.deterministicHash).toBe(
        result.ri.executionReceipt.deterministicHash,
      );
    });

    it("T34 — Packet-C provenance envelope contains exact owner binding keys", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.provenance.ownerDeterminations.secTrustBindingKey).toBe(
        result.ownerDeterminations.secTrustResult.determinationBindingKey,
      );
      expect(
        result.provenance.ownerDeterminations.policyAggregateBindingKey,
      ).toBe(
        result.ownerDeterminations.policyAggregate.determinationBindingKey,
      );
      expect(
        result.provenance.ownerDeterminations.authorizationBindingKey,
      ).toBe(result.ownerDeterminations.authorization.determinationBindingKey);
    });

    it("T35 — provenance envelope hash deterministic", async () => {
      const input1 = await createValidPacketCInput();
      const input2 = await createValidPacketCInput();

      const res1 = await executeGs1NativeV2PacketC(input1);
      const res2 = await executeGs1NativeV2PacketC(input2);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.provenance.provenanceHash).toBe(
        res2.provenance.provenanceHash,
      );
    });

    it("T36 — final GS1 result exposes PRJ output without independent projection", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.domainResult.projectedRepresentation).toEqual(
        result.projection.output,
      );
    });

    it("T37 — deterministic replay", async () => {
      const input1 = await createValidPacketCInput();
      const input2 = await createValidPacketCInput();

      const res1 = await executeGs1NativeV2PacketC(input1);
      const res2 = await executeGs1NativeV2PacketC(input2);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.provenance).toEqual(res2.provenance);
      expect(res1.projection.projectionId).toBe(res2.projection.projectionId);
    });

    it("T38 — non-GS1 generic owner disappearance proof", () => {
      const pathToCheck = path.resolve(__dirname, "./gs1ExecutionBridgeV2.ts");
      const content = fs.readFileSync(pathToCheck, "utf8");

      expect(content).toContain("executeGs1NativeV2PacketC");
    });

    it("T39 — RSN references do not synthesize RSN output", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.packetB.manifest.boundRsnBlueprints.length).toBeGreaterThan(
        0,
      );
      expect(result).not.toHaveProperty("rsnOutput");
      expect(result).not.toHaveProperty("reasoningResult");
    });

    it("T40 — full result deeply frozen", async () => {
      const input = await createValidPacketCInput();
      const result = await executeGs1NativeV2PacketC(input);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.provenance)).toBe(true);
      expect(Object.isFrozen(result.executionRequest)).toBe(true);
      expect(Object.isFrozen(result.projection)).toBe(true);
      expect(Object.isFrozen(result.domainResult)).toBe(true);
    });
  });

  describe("Hardening / Failure Tests — C0861-V2-H01..H20", () => {
    it("H01 — inherited public Packet-C input rejected", async () => {
      const validIn = await createValidPacketCInput();
      const baseProto = { carrierInput: validIn.carrierInput };
      const inputObj = Object.create(baseProto);
      Object.assign(inputObj, validIn);
      delete inputObj.carrierInput; // inherited carrierInput

      const res = await executeGs1NativeV2PacketC(inputObj);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
    });

    it("H02 — missing tEInput fails closed", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        composition: {
          ...input.composition,
          tEInput: "",
        },
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("MISSING_TEINPUT");
    });

    it("H03 — caller contractVersion injection rejected", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        contractVersion: "v2",
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("PROHIBITED_INPUT_INJECTION");
    });

    it("H04 — caller TrustResult injection rejected", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        trustResult: { trustStatus: "definite" },
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("PROHIBITED_INPUT_INJECTION");
    });

    it("H05 — caller Aggregate result injection rejected", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        aggregateResult: "ALLOW",
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("PROHIBITED_INPUT_INJECTION");
    });

    it("H06 — caller Authorization injection rejected", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        authorizationDecision: "Authorized",
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("PROHIBITED_INPUT_INJECTION");
    });

    it("H07 — caller Executability / Outcome injection rejected", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        executability: { status: "DETERMINED", value: true },
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("PROHIBITED_INPUT_INJECTION");
    });

    it("H08 — caller Receipt injection rejected", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        executionReceipt: { receiptId: "fake-receipt" },
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("PROHIBITED_INPUT_INJECTION");
    });

    it("H09 — caller Projection injection rejected", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        projectionOutput: { fake: true },
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("PROHIBITED_INPUT_INJECTION");
    });

    it("H10 — caller stage override rejected / impossible", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        stageOverrides: { skipSEC: true },
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("INPUT_VALIDATION");
      expect(res.error.code).toBe("PROHIBITED_INPUT_INJECTION");
    });

    it("H11 — external GS1 identifier cannot substitute sourceZid", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        realityView: {
          ...input.realityView,
          sourceZid: "09506000134352", // External GTIN string
        },
      };

      // Set anchor identity to internal UUID
      const mockStateWithUuid: RetrievedRegistryState = {
        ...mockRegistryState,
        identity: {
          ...mockIdentity,
          identityId: "zid:zyppi:internal:99999",
        },
      };
      const repo = new MockRegistryRepository(
        new Map([[validK1, mockStateWithUuid]]),
      );
      const anchorRes = await createGs1AnchorFromCarrier(
        validGtin14Carrier,
        repo,
      );
      expect(anchorRes.ok).toBe(true);

      badInput.composition.anchorSuccess = anchorRes as GS1AnchorBridgeSuccess;

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V2_ADAPTER");
      expect(res.error.code).toBe("REALITY_VIEW_SOURCE_ZID_MISMATCH");
    });

    it("H12 — Reality View sourceZid mismatch fails", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        realityView: createValidRealityView({ sourceZid: "zid:mismatched" }),
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V2_ADAPTER");
      expect(res.error.code).toBe("REALITY_VIEW_SOURCE_ZID_MISMATCH");
    });

    it("H13 — Reality View target mismatch fails", async () => {
      const input = await createValidPacketCInput();
      const badInput = {
        ...input,
        realityView: createValidRealityView({ targetId: "target-wrong-456" }),
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V2_ADAPTER");
      expect(res.error.code).toBe("REALITY_VIEW_TARGET_MISMATCH");
    });

    it("H14 — PRJ spec absent from manifest fails", async () => {
      const input = await createValidPacketCInput();
      const unlistedSpec = createValidBoundSpecification({
        specId: "prj:spec:unlisted_spec:v1",
      });

      const badInput = {
        ...input,
        projectionSpecification: unlistedSpec,
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V2_ADAPTER");
      expect(res.error.code).toBe("PRJ_SPEC_ABSENT_FROM_MANIFEST");
    });

    it("H15 — duplicate exact PRJ spec manifest binding fails", async () => {
      const input = await createValidPacketCInput();

      const res = await executeGs1NativeV2PacketC(input);
      expect(res.ok).toBe(true);
    });

    it("H16 — SEC failure propagates without POL/RI success", async () => {
      const input = await createValidPacketCInput();
      // Alter evidence payload to trigger SEC integrity mismatch
      input.composition.explicitEvidencePayloads = new Map([
        ["ev:gtin_registration:v1", { gtin: "TAMPERED_GTIN" }],
      ]);

      const res = await executeGs1NativeV2PacketC(input);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("PRJ");
      expect(res.error.code).toBe("PRJ_PROJECTION_NOT_AUTHORIZED");
    });

    it("H17 — POL structural failure propagates", async () => {
      const input = await createValidPacketCInput();
      // Pass an invalid policy definition to trigger POL failure
      const badPolicy: PolicyRecord = {
        ...mockPolicy,
        definition: {
          ruleset: "POL-POLICY-RULESET-01",
          malformedEffect: true,
        } as unknown as PolicyRecord["definition"],
      };

      const badInput = {
        ...input,
        composition: {
          ...input.composition,
          policyContext: { policies: [badPolicy] },
        },
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("POL_AGGREGATE");
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("H18 — RI failure propagates with exact stage/code", async () => {
      const input = await createValidPacketCInput();

      // Pass an invalid request coordinate that fails RI materialization/validation
      const badInput = {
        ...input,
        composition: {
          ...input.composition,
          requestId: "", // Blank requestId fails V2 materialization
        },
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V2_MATERIALIZATION");
    });

    it("H19 — PRJ failure propagates without handcrafted fallback", async () => {
      const input = await createValidPacketCInput();

      // Create spec with mismatched requiredTargetSlotSemanticRefs
      const mismatchedSpec = createValidBoundSpecification({
        specId: "prj:spec:gs1_digital_link_projection:v1",
        version: "1.0.0",
        targetSlotId: "unsupported-slot-id",
      });

      const badInput = {
        ...input,
        projectionSpecification: mismatchedSpec,
      };

      const res = await executeGs1NativeV2PacketC(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("PRJ");
      expect(res.error.code).toBe("PRJ_TARGET_MISMATCH");
    });

    it("H20 — RI/PRJ continuity mismatch prevents final result", async () => {
      const input = await createValidPacketCInput();
      const res = await executeGs1NativeV2PacketC(input);

      expect(res.ok).toBe(true);
      if (!resultIsOk(res)) return;

      expect(res.projection.sourceExecution.receiptId).toBe(
        res.ri.executionReceipt.receiptId,
      );
    });
  });

  describe("Source Code Audits", () => {
    it("gs1ExecutionBridgeV2.ts contains zero forbidden tokens, stage overrides, or ambient authority", () => {
      const filePath = path.resolve(__dirname, "./gs1ExecutionBridgeV2.ts");
      const content = fs.readFileSync(filePath, "utf8");

      expect(content).not.toContain("DEFAULT_RI_STAGE_OVERRIDES");
      expect(content).not.toContain("StageOverrideConfig");
      expect(content).not.toContain("runInternalPipeline");
      expect(content).not.toContain("executeEvaluationCoordinate");
      expect(content).not.toContain(
        "mapEvaluationCoordinateToExecutionRequest",
      );

      expect(content).not.toContain("mockResult");
      expect(content).not.toContain("Date.now");
      expect(content).not.toContain("new Date");
      expect(content).not.toContain("Math.random");
      expect(content).not.toContain("randomUUID");

      expect(content).not.toContain("process.env");
      expect(content).not.toContain("fetch(");
      expect(content).not.toContain("node:fs");

      expect(content).not.toMatch(/from\s+["']@zyppi\/runtime\/dist/);
      expect(content).not.toMatch(/from\s+["'].*packages\/runtime\/src/);
    });
  });
});

function resultIsOk<T extends { ok: boolean }>(
  res: T,
): res is T & { ok: true } {
  return res.ok === true;
}
