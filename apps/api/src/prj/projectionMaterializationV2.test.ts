import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canonicalizeJcs,
  deriveEvidenceStateRefV2,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  type ActionSemanticRefV2,
  type BoundConstitutionalStateV2,
  type BoundEvidenceStateV2,
  type BoundPolicyMaterialV2,
  type BoundPolicyUniverseV2,
  type ExecutionRequestV2,
  type JsonValueV2,
  type OwnerRefV2,
  type ParticipationV2,
  type PolicyRefV2,
  type ProvenanceRefV2,
  type RequestedActionBindingV2,
  type RequestedCapabilityRefV2,
  type StateInstanceRefV2,
  type StateSemanticRefV2,
  type SubjectRefV2,
  type TargetRefV2,
  type TargetSlotSemanticRefV2,
} from "@zyppi/domain";

import {
  producePolAggregatePolicyResultV2,
  producePolAuthorizationV2,
} from "../pol/index.js";
import { produceSecTrustResultV2 } from "../sec/index.js";
import {
  materializePrjProjectionV2,
  type BoundPrjProjectionRegistrationV1,
  type BoundPrjProjectionSpecificationV1,
  type BoundPrjRealityViewV1,
  type PrjProjectionRuleSet01,
} from "./projectionMaterializationV2.js";

function computeSha256(text: string): string {
  const hex = crypto
    .createHash("sha256")
    .update(text, "utf8")
    .digest("hex")
    .toLowerCase();
  return `sha256:${hex}`;
}

const COUNCIL_OWNER: OwnerRefV2 = {
  family: "OWNER",
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "council-001",
};

const GLOBAL_SCOPE = {
  family: "SCOPE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "scope-global",
};

const PROVENANCE_REF: ProvenanceRefV2 = {
  family: "PROVENANCE",
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "prov-001",
};

function createValidBoundEvidenceState(): BoundEvidenceStateV2 {
  const reqRef = {
    family: "EVIDENCE_REQUIREMENT" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: "req-001",
  };
  const evidRef = {
    family: "EVIDENCE" as const,
    ownerRef: "urn:zyppi:owner:cert-auth:v1",
    artifactId: "ev-001",
  };
  const schemaRef = {
    family: "STATE_ARTIFACT" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: "schema-001",
  };

  const materialContent = { sig: "0x123456" };
  const materialJcs = canonicalizeJcs(materialContent);
  const expectedDigest = computeSha256(materialJcs);

  const defaultState = {
    evidenceRequirementBindings: [
      {
        requirementKey: "req_key_1",
        governedRequirementRef: reqRef,
        requirementAuthorityBinding: COUNCIL_OWNER,
        requirementScopeBinding: GLOBAL_SCOPE,
      },
    ],
    suppliedEvidenceMaterial: [
      {
        materialKey: "mat_key_1",
        evidenceRef: evidRef,
        ownerRef: COUNCIL_OWNER,
        schemaRef,
        material: materialContent,
      },
    ],
    evidencePresentationBindings: [
      {
        evidenceRequirementRef: reqRef,
        presentedEvidenceRefs: [evidRef],
      },
    ],
    integrityCoordinates: [
      {
        coordinateKey: "coord_key_1",
        evidenceRef: evidRef,
        expectedDigest,
        algorithm: "sha256",
      },
    ],
  };

  const refResult = deriveEvidenceStateRefV2(
    defaultState as unknown as BoundEvidenceStateV2,
  );
  if (!refResult.ok) {
    throw new Error(
      `Failed to derive evidenceStateRef: ${refResult.error.message}`,
    );
  }

  return {
    ...defaultState,
    evidenceStateRef: refResult.value,
  };
}

function createPolicyRef(id: string): PolicyRefV2 {
  return {
    family: "POLICY",
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
    version: "1.0.0",
    stateRef: `state-${id}`,
    provenanceRef: `prov-${id}`,
  };
}

function createValidBoundPolicyUniverse(
  materials: readonly {
    policyKey: string;
    policyRef: PolicyRefV2;
    material: unknown;
  }[] = [],
): BoundPolicyUniverseV2 {
  const baseObj = {
    applicablePolicyMaterial: materials as readonly BoundPolicyMaterialV2[],
    dependencyTopology: { dependencyEdges: [] },
    applicabilityProvenanceBinding: PROVENANCE_REF,
  };

  const refRes = derivePolicyUniverseRefV2(
    baseObj as unknown as BoundPolicyUniverseV2,
  );
  if (!refRes.ok) {
    throw new Error(
      `Failed to derive policyUniverseRef: ${refRes.error.message}`,
    );
  }

  return {
    ...baseObj,
    policyUniverseRef: refRes.value,
  };
}

function createSubjectRef(id: string): SubjectRefV2 {
  return {
    family: "SUBJECT",
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createActionSemanticRef(id: string): ActionSemanticRefV2 {
  return {
    family: "ACTION_SEMANTIC",
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createTargetSlotSemanticRef(id: string): TargetSlotSemanticRefV2 {
  return {
    family: "TARGET_SLOT_SEMANTIC",
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createTargetRef(id: string): TargetRefV2 {
  return {
    family: "TARGET",
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createStateSemanticRef(id: string): StateSemanticRefV2 {
  return {
    family: "STATE_SEMANTIC",
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createStateInstanceRef(id: string): StateInstanceRefV2 {
  return {
    family: "STATE_INSTANCE",
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createRequestedCapabilityRef(id: string): RequestedCapabilityRefV2 {
  return {
    family: "REQUESTED_CAPABILITY",
    ownerRef: "urn:zyppi:owner:prj:v1",
    artifactId: id,
  };
}

function createValidRequestedAction(params?: {
  actionId?: string;
  targetId?: string;
  targetSlotId?: string;
  capabilityId?: string;
}): RequestedActionBindingV2 {
  const actionSemanticRef = createActionSemanticRef(
    params?.actionId ?? "action-view",
  );
  const targetSlotSemanticRef = createTargetSlotSemanticRef(
    params?.targetSlotId ?? "slot-target-1",
  );
  const targetRef = createTargetRef(params?.targetId ?? "target-123");
  const requestedCapabilityRef = createRequestedCapabilityRef(
    params?.capabilityId ?? "cap-prj-spec-1",
  );

  return {
    actionSemanticRef,
    intentActionCompatibilityBinding: {
      kind: "GOVERNED_SEMANTIC_CONTRACT",
      exactCompatibilityContractRef: {
        family: "COMPATIBILITY_CONTRACT",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "compat-001",
      },
    },
    actionPerformerBindings: [
      {
        performerKey: "perf_1",
        actorParticipationRef: "role_alice",
        agencyReliance: { kind: "NO_DELEGATED_AGENCY_RELIANCE" },
      },
    ],
    actionTargetBindings: [
      {
        targetSlotSemanticRef,
        targetRef,
      },
    ],
    requestedCapabilityClaimBindings: [
      {
        capabilityClaimKey: "claim_1",
        requestedCapabilityRef,
        claimantPerformerRefs: ["perf_1"],
      },
    ],
  };
}

function createValidParticipation(): ParticipationV2 {
  return {
    roleBindings: [
      {
        roleBindingKey: "role_alice",
        role: "ACTOR",
        subject: {
          kind: "KNOWN",
          subjectRef: createSubjectRef("alice"),
        },
      },
    ],
    agencyBindings: [],
  };
}

function createValidBoundConstitutionalState(): BoundConstitutionalStateV2 {
  const baseObj = {
    stateViews: [
      {
        viewKey: "view_1",
        viewScope: GLOBAL_SCOPE,
        stateBindings: [
          {
            stateBindingKey: "sb_1",
            kind: "STANDING_STATE" as const,
            subjectRef: createSubjectRef("alice"),
            stateSemanticRef: createStateSemanticRef("state-good-standing"),
            exactStateRef: createStateInstanceRef("inst-good-standing-01"),
          },
        ],
      },
    ],
  };

  const refRes = deriveSemanticStateRefV2(
    baseObj as unknown as BoundConstitutionalStateV2,
  );
  if (!refRes.ok) {
    throw new Error(
      `Failed to derive semanticStateRef: ${refRes.error.message}`,
    );
  }

  return {
    ...baseObj,
    semanticStateRef: refRes.value,
  };
}

function createValidBoundRealityView(params?: {
  viewId?: string;
  sourceZid?: string;
  targetId?: string;
  viewType?: "CURRENT" | "HISTORICAL" | "AUDIT" | "REGULATORY";
  material?: JsonValueV2;
}): BoundPrjRealityViewV1 {
  const viewId = params?.viewId ?? "view-001";
  const sourceZid = params?.sourceZid ?? "zid:zyppi:asset:123";
  const sourceTargetRef = createTargetRef(params?.targetId ?? "target-123");
  const viewType = params?.viewType ?? "CURRENT";
  const viewTimestamp = "2026-03-31T12:00:00.000Z";
  const provenanceRef = PROVENANCE_REF;
  const material = params?.material ?? {
    assetName: "Widget A",
    serialNumber: "SN-98765",
    specifications: { weightKg: 10.5, color: "blue" },
    records: ["r1", "r2"],
  };

  const preimage = {
    viewId,
    sourceZid,
    sourceTargetRef,
    viewType,
    viewTimestamp,
    provenanceRef,
    material,
  };

  const cRes = canonicalizeJcs(preimage);
  const realityDigest = computeSha256(cRes);

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

function createValidBoundSpecification(params?: {
  specId?: string;
  version?: string;
  actionId?: string;
  capabilityId?: string;
  targetSlotId?: string;
  policyInterfaceRef?: string;
  rulesetRoot?: PrjProjectionRuleSet01["root"];
}): BoundPrjProjectionSpecificationV1 {
  const specId = params?.specId ?? "spec-001";
  const version = params?.version ?? "1.0.0";
  const provenanceRef = PROVENANCE_REF;
  const actionId = params?.actionId ?? "action-view";
  const capabilityId = params?.capabilityId ?? "cap-prj-spec-1";
  const targetSlotId = params?.targetSlotId ?? "slot-target-1";
  const policyInterfaceRef =
    params?.policyInterfaceRef ?? "prj:policy-interface:whole-projection:v1";

  const rootNode: PrjProjectionRuleSet01["root"] = params?.rulesetRoot ?? {
    kind: "OBJECT",
    fields: [
      {
        key: "title",
        node: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["assetName"],
          requirement: "REQUIRED",
        },
      },
      {
        key: "serial",
        node: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["serialNumber"],
          requirement: "REQUIRED",
        },
      },
      {
        key: "requestedBy",
        node: {
          kind: "SOURCE",
          source: "CONTEXT",
          path: [
            "participation",
            "roleBindings",
            0,
            "subject",
            "subjectRef",
            "artifactId",
          ],
          requirement: "REQUIRED",
        },
      },
    ],
  };

  const specification: PrjProjectionRuleSet01 = {
    ruleset: "PRJ-PROJECTION-RULESET-01",
    requiredActionSemanticRef: createActionSemanticRef(actionId),
    requiredCapabilityRef: createRequestedCapabilityRef(capabilityId),
    requiredTargetSlotSemanticRefs: [createTargetSlotSemanticRef(targetSlotId)],
    root: rootNode,
  };

  const specPreimage = {
    specId,
    version,
    provenanceRef,
    specification,
  };
  const specCanon = canonicalizeJcs(specPreimage);
  const specificationDigest = computeSha256(specCanon);

  const regPreimage = {
    registrationId: `reg-${specId}`,
    projectionType: `prj:type:${specId}`,
    specificationRef: {
      specId,
      version,
      specificationDigest,
    },
    freshnessModelRef: "model:freshness:v1",
    completenessModelRef: "model:completeness:v1",
    policyInterfaceRef,
    supportedProfileRefs: ["profile:v1"],
    provenanceRef,
  };
  const regCanon = canonicalizeJcs(regPreimage);
  const registrationDigest = computeSha256(regCanon);

  const registration: BoundPrjProjectionRegistrationV1 = {
    registrationId: `reg-${specId}`,
    projectionType: `prj:type:${specId}`,
    specificationRef: {
      specId,
      version,
      specificationDigest,
    },
    freshnessModelRef: "model:freshness:v1",
    completenessModelRef: "model:completeness:v1",
    policyInterfaceRef,
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

function createValidExecutionRequest(params?: {
  actionId?: string;
  targetId?: string;
  capabilityId?: string;
  targetSlotId?: string;
}): ExecutionRequestV2 {
  const tEInput = "2026-03-31T12:00:00.000Z";
  const ra = createValidRequestedAction({
    actionId: params?.actionId ?? "action-view",
    targetId: params?.targetId ?? "target-123",
    targetSlotId: params?.targetSlotId ?? "slot-target-1",
    capabilityId: params?.capabilityId ?? "cap-prj-spec-1",
  });
  const es = createValidBoundEvidenceState();
  const pu = createValidBoundPolicyUniverse([
    {
      policyKey: "p1",
      policyRef: createPolicyRef("pol-permit-1"),
      material: {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite"],
        authorization: {
          actionSemanticRef: ra.actionSemanticRef,
          authorizedTargets: [
            {
              targetSlotSemanticRef:
                ra.actionTargetBindings[0].targetSlotSemanticRef,
              targetRef: ra.actionTargetBindings[0].targetRef,
            },
          ],
          requiredPerformerStates: [],
        },
      },
    },
  ]);
  const part = createValidParticipation();
  const cs = createValidBoundConstitutionalState();

  const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
  if (!secRes.ok) throw new Error("SEC failed");

  const aggRes = producePolAggregatePolicyResultV2({
    policyUniverse: pu,
    requestedAction: ra,
    evidenceState: es,
    tEInput,
    secTrustResult: secRes.determination,
  });
  if (!aggRes.ok) throw new Error("POL Aggregate failed");

  const authRes = producePolAuthorizationV2({
    policyUniverse: pu,
    requestedAction: ra,
    participation: part,
    constitutionalState: cs,
    evidenceState: es,
    tEInput,
    policyAggregate: aggRes.determination,
    secTrustResult: secRes.determination,
  });
  if (!authRes.ok) throw new Error("POL Authorization failed");

  return {
    contractVersion: "v2",
    requestId: "req-001",
    executionContext: {
      executionId: "exec-001",
      budget: 1000,
      temporalCoordinates: { tEInput },
    },
    evaluationContext: {
      authorizedInputBindings: [],
      evaluationParameterBindings: [],
      boundContextBindings: [],
      ownerDeterminationBindings: [
        secRes.determination,
        aggRes.determination,
        authRes.determination,
      ],
    },
    intent: {
      originatorParticipationRef: "role_alice",
      intentCategory: "VERIFY",
      intentTargetRef: ra.actionTargetBindings[0].targetRef,
      candidateStateBinding: {
        stateTargetRef: ra.actionTargetBindings[0].targetRef,
        stateSemanticRef: createStateSemanticRef("s1"),
        exactStateInstance: {
          kind: "GOVERNED_ARTIFACT_REF",
          stateInstanceRef: createStateInstanceRef("s1-inst"),
        },
      },
    },
    policyUniverse: pu,
    evidenceState: es,
    constitutionalState: cs,
    participation: part,
    requestedAction: ra,
  };
}

describe("CCP-PRJ-PROD-01 Native V2 Governed Reality-View Projection Materialization Foundation", () => {
  describe("PRJ01-T01..T40 Mandatory Tests", () => {
    it("T01 — Minimal literal Projection", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "LITERAL",
          value: "Hello World",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBe("Hello World");
      expect(res.projection.projectionCompleteness).toBe("COMPLETE");
      expect(res.projection.missingBindings).toEqual([]);
    });

    it("T02 — source_zid preserved", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({
        sourceZid: "zid:zyppi:asset:456",
      });
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.sourceZid).toBe("zid:zyppi:asset:456");
      expect(res.projection.sourceZid).toBe(rv.sourceZid);
    });

    it("T03 — REALITY_VIEW SOURCE", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({
        material: { name: "Product X", price: 100 },
      });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["name"],
          requirement: "REQUIRED",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBe("Product X");
    });

    it("T04 — CONTEXT SOURCE", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "SOURCE",
          source: "CONTEXT",
          path: ["intent", "intentCategory"],
          requirement: "REQUIRED",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBe("VERIFY");
    });

    it("T05 — OBJECT", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "OBJECT",
          fields: [
            { key: "a", node: { kind: "LITERAL", value: 1 } },
            { key: "b", node: { kind: "LITERAL", value: 2 } },
          ],
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toEqual({ a: 1, b: 2 });
    });

    it("T06 — ARRAY", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "ARRAY",
          items: [
            { kind: "LITERAL", value: "first" },
            { kind: "LITERAL", value: "second" },
          ],
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toEqual(["first", "second"]);
    });

    it("T07 — STRING_TEMPLATE RAW", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({ material: { sku: "SKU-123" } });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "STRING_TEMPLATE",
          segments: [
            { kind: "TEXT", value: "urn:product:" },
            {
              kind: "SOURCE_TEXT",
              source: "REALITY_VIEW",
              path: ["sku"],
              requirement: "REQUIRED",
              encoding: "RAW",
            },
          ],
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBe("urn:product:SKU-123");
    });

    it("T08 — STRING_TEMPLATE URI_COMPONENT", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({
        material: { query: "hello world&foo=bar" },
      });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "STRING_TEMPLATE",
          segments: [
            { kind: "TEXT", value: "https://example.com/search?q=" },
            {
              kind: "SOURCE_TEXT",
              source: "REALITY_VIEW",
              path: ["query"],
              requirement: "REQUIRED",
              encoding: "URI_COMPONENT",
            },
          ],
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBe(
        "https://example.com/search?q=hello%20world%26foo%3Dbar",
      );
    });

    it("T09 — Nested composite", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toEqual({
        title: "Widget A",
        serial: "SN-98765",
        requestedBy: "alice",
      });
    });

    it("T10 — Required missing Reality source", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({ material: {} }); // Missing missingField
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["missingField"],
          requirement: "REQUIRED",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBeNull();
      expect(res.projection.projectionCompleteness).toBe("INCOMPLETE");
      expect(res.projection.missingBindings).toHaveLength(1);
      expect(res.projection.missingBindings[0]).toEqual({
        outputPath: [],
        source: "REALITY_VIEW",
        sourcePath: ["missingField"],
        requirement: "REQUIRED",
      });
    });

    it("T11 — Optional missing Reality source", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({ material: {} });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["optionalField"],
          requirement: "OPTIONAL",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBeNull();
      expect(res.projection.projectionCompleteness).toBe("COMPLETE");
      expect(res.projection.missingBindings).toHaveLength(1);
      expect(res.projection.missingBindings[0].requirement).toBe("OPTIONAL");
    });

    it("T12 — Missing template segment", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({ material: {} });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "STRING_TEMPLATE",
          segments: [
            { kind: "TEXT", value: "Prefix: " },
            {
              kind: "SOURCE_TEXT",
              source: "REALITY_VIEW",
              path: ["missingSegment"],
              requirement: "REQUIRED",
              encoding: "RAW",
            },
          ],
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBeNull();
      expect(res.projection.projectionCompleteness).toBe("INCOMPLETE");
    });

    it("T13 — invalid scalar traversal", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({
        material: { scalar: "stringVal" },
      });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["scalar", "nestedKey"],
          requirement: "REQUIRED",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SOURCE_PATH_INVALID");
    });

    it("T14 — SOURCE_TEXT non-string", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView({
        material: { numberVal: 12345 },
      });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "STRING_TEMPLATE",
          segments: [
            {
              kind: "SOURCE_TEXT",
              source: "REALITY_VIEW",
              path: ["numberVal"],
              requirement: "REQUIRED",
              encoding: "RAW",
            },
          ],
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SOURCE_TYPE_MISMATCH");
    });

    it("T15 — Reality View digest", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
    });

    it("T16 — Reality View tamper", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const tamperedRv = {
        ...rv,
        realityDigest:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      };
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: tamperedRv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_REALITY_VIEW_DIGEST_MISMATCH");
    });

    it("T17 — Reality target mismatch", () => {
      const req = createValidExecutionRequest({ targetId: "target-123" });
      const rv = createValidBoundRealityView({ targetId: "target-456" }); // Mismatched target
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_REALITY_TARGET_MISMATCH");
    });

    it("T18 — Registration digest exactness", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
    });

    it("T19 — Unregistered / mismatched registration", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const mismatchedRegPreimage = {
        registrationId: spec.registration.registrationId,
        projectionType: spec.registration.projectionType,
        specificationRef: {
          specId: "spec-different",
          version: spec.version,
          specificationDigest: spec.specificationDigest,
        },
        freshnessModelRef: spec.registration.freshnessModelRef,
        completenessModelRef: spec.registration.completenessModelRef,
        policyInterfaceRef: spec.registration.policyInterfaceRef,
        supportedProfileRefs: spec.registration.supportedProfileRefs,
        provenanceRef: spec.registration.provenanceRef,
      };
      const registrationDigest = computeSha256(
        canonicalizeJcs(mismatchedRegPreimage),
      );

      const mismatchedSpec: BoundPrjProjectionSpecificationV1 = {
        ...spec,
        registration: {
          ...spec.registration,
          specificationRef: {
            ...spec.registration.specificationRef,
            specId: "spec-different",
          },
          registrationDigest,
        },
      };

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: mismatchedSpec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_PROJECTION_UNREGISTERED");
    });

    it("T20 — Registration tamper", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();
      const tamperedSpec = {
        ...spec,
        registration: {
          ...spec.registration,
          registrationDigest:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      };

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: tamperedSpec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_REGISTRATION_DIGEST_MISMATCH");
    });

    it("T21 — Specification digest", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
    });

    it("T22 — Specification tamper", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const bogusDigest =
        "sha256:0000000000000000000000000000000000000000000000000000000000000000";

      const regPreimage = {
        registrationId: spec.registration.registrationId,
        projectionType: spec.registration.projectionType,
        specificationRef: {
          specId: spec.specId,
          version: spec.version,
          specificationDigest: bogusDigest,
        },
        freshnessModelRef: spec.registration.freshnessModelRef,
        completenessModelRef: spec.registration.completenessModelRef,
        policyInterfaceRef: spec.registration.policyInterfaceRef,
        supportedProfileRefs: spec.registration.supportedProfileRefs,
        provenanceRef: spec.registration.provenanceRef,
      };
      const regDigest = computeSha256(canonicalizeJcs(regPreimage));

      const tamperedSpec: BoundPrjProjectionSpecificationV1 = {
        ...spec,
        specificationDigest: bogusDigest,
        registration: {
          ...spec.registration,
          specificationRef: {
            ...spec.registration.specificationRef,
            specificationDigest: bogusDigest,
          },
          registrationDigest: regDigest,
        },
      };

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: tamperedSpec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SPECIFICATION_DIGEST_MISMATCH");
    });

    it("T23 — Unsupported ruleset", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();
      const unsupportedSpec = {
        ...spec,
        specification: {
          ...spec.specification,
          ruleset: "PRJ-FUTURE-RULESET-999",
        },
      };
      // Recompute spec digest to pass spec digest check and trigger ruleset check
      const specPreimage = {
        specId: spec.specId,
        version: spec.version,
        provenanceRef: spec.provenanceRef,
        specification: unsupportedSpec.specification,
      };
      const specCanon = canonicalizeJcs(specPreimage);
      const specDigest = computeSha256(specCanon);
      unsupportedSpec.specificationDigest = specDigest;

      const regPreimage = {
        registrationId: unsupportedSpec.registration.registrationId,
        projectionType: unsupportedSpec.registration.projectionType,
        specificationRef: {
          specId: spec.specId,
          version: spec.version,
          specificationDigest: specDigest,
        },
        freshnessModelRef: unsupportedSpec.registration.freshnessModelRef,
        completenessModelRef: unsupportedSpec.registration.completenessModelRef,
        policyInterfaceRef: unsupportedSpec.registration.policyInterfaceRef,
        supportedProfileRefs: unsupportedSpec.registration.supportedProfileRefs,
        provenanceRef: unsupportedSpec.registration.provenanceRef,
      };
      const regDigest = computeSha256(canonicalizeJcs(regPreimage));

      const updatedSpec = {
        ...unsupportedSpec,
        registration: {
          ...unsupportedSpec.registration,
          specificationRef: {
            ...unsupportedSpec.registration.specificationRef,
            specificationDigest: specDigest,
          },
          registrationDigest: regDigest,
        },
      };

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification:
          updatedSpec as unknown as BoundPrjProjectionSpecificationV1,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_RULESET_UNSUPPORTED");
    });

    it("T24 — Unsupported field-level policy interface", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        policyInterfaceRef: "prj:policy-interface:field-redaction:v1",
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_POLICY_INTERFACE_UNSUPPORTED");
    });

    it("T25 — capability claim required", () => {
      const req = createValidExecutionRequest({ capabilityId: "cap-other" });
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        capabilityId: "cap-prj-spec-1",
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SPECIFICATION_NOT_REQUESTED");
    });

    it("T26 — ambiguous capability claim", () => {
      const req = createValidExecutionRequest();
      // Add a duplicate matching capability claim
      const capRef =
        req.requestedAction.requestedCapabilityClaimBindings[0]
          .requestedCapabilityRef;
      (req.requestedAction.requestedCapabilityClaimBindings as unknown[]).push({
        capabilityClaimKey: "claim_2",
        requestedCapabilityRef: capRef,
        claimantPerformerRefs: ["perf_1"],
      });

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_CAPABILITY_BINDING_AMBIGUOUS");
    });

    it("T27 — action mismatch", () => {
      const req = createValidExecutionRequest({ actionId: "action-transfer" });
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({ actionId: "action-view" });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_ACTION_MISMATCH");
    });

    it("T28 — target slot mismatch", () => {
      const req = createValidExecutionRequest({
        targetSlotId: "slot-target-1",
      });
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        targetSlotId: "slot-target-2",
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_TARGET_MISMATCH");
    });

    it("T29 — native RI predecessor failure", () => {
      const req = createValidExecutionRequest();
      // Break request budget to fail RI execution
      (
        req as unknown as { executionContext: { budget: number } }
      ).executionContext.budget = -1;

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_UPSTREAM_EXECUTION_FAILED");
    });

    it("T30 — POL DENY blocks", () => {
      const tEInput = "2026-03-31T12:00:00.000Z";
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      // Add PROHIBIT policy to force POL Aggregate DENY
      const pu = createValidBoundPolicyUniverse([
        {
          policyKey: "p1",
          policyRef: createPolicyRef("pol-prohibit-1"),
          material: {
            ruleset: "POL-POLICY-RULESET-01",
            ruleEffect: "PROHIBIT",
            requiredTrustStatuses: [],
            authorization: null,
          },
        },
      ]);
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      if (!secRes.ok) throw new Error("SEC failed");

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });
      if (!aggRes.ok) throw new Error("POL Aggregate failed");

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
        secTrustResult: secRes.determination,
      });
      if (!authRes.ok) throw new Error("POL Authorization failed");

      const req: ExecutionRequestV2 = {
        contractVersion: "v2",
        requestId: "req-001",
        executionContext: {
          executionId: "exec-001",
          budget: 1000,
          temporalCoordinates: { tEInput },
        },
        evaluationContext: {
          authorizedInputBindings: [],
          evaluationParameterBindings: [],
          boundContextBindings: [],
          ownerDeterminationBindings: [
            secRes.determination,
            aggRes.determination,
            authRes.determination,
          ],
        },
        intent: {
          originatorParticipationRef: "role_alice",
          intentCategory: "VERIFY",
          intentTargetRef: ra.actionTargetBindings[0].targetRef,
          candidateStateBinding: {
            stateTargetRef: ra.actionTargetBindings[0].targetRef,
            stateSemanticRef: createStateSemanticRef("s1"),
            exactStateInstance: {
              kind: "GOVERNED_ARTIFACT_REF",
              stateInstanceRef: createStateInstanceRef("s1-inst"),
            },
          },
        },
        policyUniverse: pu,
        evidenceState: es,
        constitutionalState: cs,
        participation: part,
        requestedAction: ra,
      };

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_PROJECTION_NOT_AUTHORIZED");
    });

    it("T31 — POL INDETERMINATE blocks", () => {
      const tEInput = "2026-03-31T12:00:00.000Z";
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      // Unsupported ruleset forces POL Aggregate INDETERMINATE
      const pu = createValidBoundPolicyUniverse([
        {
          policyKey: "p1",
          policyRef: createPolicyRef("pol-future-1"),
          material: { ruleset: "FUTURE-RULESET-99" },
        },
      ]);
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      if (!secRes.ok) throw new Error("SEC failed");

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });
      if (!aggRes.ok) throw new Error("POL Aggregate failed");

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
        secTrustResult: secRes.determination,
      });
      if (!authRes.ok) throw new Error("POL Authorization failed");

      const req: ExecutionRequestV2 = {
        contractVersion: "v2",
        requestId: "req-001",
        executionContext: {
          executionId: "exec-001",
          budget: 1000,
          temporalCoordinates: { tEInput },
        },
        evaluationContext: {
          authorizedInputBindings: [],
          evaluationParameterBindings: [],
          boundContextBindings: [],
          ownerDeterminationBindings: [
            secRes.determination,
            aggRes.determination,
            authRes.determination,
          ],
        },
        intent: {
          originatorParticipationRef: "role_alice",
          intentCategory: "VERIFY",
          intentTargetRef: ra.actionTargetBindings[0].targetRef,
          candidateStateBinding: {
            stateTargetRef: ra.actionTargetBindings[0].targetRef,
            stateSemanticRef: createStateSemanticRef("s1"),
            exactStateInstance: {
              kind: "GOVERNED_ARTIFACT_REF",
              stateInstanceRef: createStateInstanceRef("s1-inst"),
            },
          },
        },
        policyUniverse: pu,
        evidenceState: es,
        constitutionalState: cs,
        participation: part,
        requestedAction: ra,
      };

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_PROJECTION_NOT_AUTHORIZED");
    });

    it("T32 — Authorization Denied/Deferred blocks", () => {
      const tEInput = "2026-03-31T12:00:00.000Z";
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      // Empty policy universe yields NO_AUTHORIZATION_BASIS -> Authorization Denied
      const pu = createValidBoundPolicyUniverse([]);
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      if (!secRes.ok) throw new Error("SEC failed");

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });
      if (!aggRes.ok) throw new Error("POL Aggregate failed");

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
        secTrustResult: secRes.determination,
      });
      if (!authRes.ok) throw new Error("POL Authorization failed");

      const req: ExecutionRequestV2 = {
        contractVersion: "v2",
        requestId: "req-001",
        executionContext: {
          executionId: "exec-001",
          budget: 1000,
          temporalCoordinates: { tEInput },
        },
        evaluationContext: {
          authorizedInputBindings: [],
          evaluationParameterBindings: [],
          boundContextBindings: [],
          ownerDeterminationBindings: [
            secRes.determination,
            aggRes.determination,
            authRes.determination,
          ],
        },
        intent: {
          originatorParticipationRef: "role_alice",
          intentCategory: "VERIFY",
          intentTargetRef: ra.actionTargetBindings[0].targetRef,
          candidateStateBinding: {
            stateTargetRef: ra.actionTargetBindings[0].targetRef,
            stateSemanticRef: createStateSemanticRef("s1"),
            exactStateInstance: {
              kind: "GOVERNED_ARTIFACT_REF",
              stateInstanceRef: createStateInstanceRef("s1-inst"),
            },
          },
        },
        policyUniverse: pu,
        evidenceState: es,
        constitutionalState: cs,
        participation: part,
        requestedAction: ra,
      };

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_PROJECTION_NOT_AUTHORIZED");
    });

    it("T33 — Executability false/unavailable blocks", () => {
      const req = createValidExecutionRequest();
      // Set budget = 0 so RI determines Executability status = DETERMINED, value = false with BUDGET_EXHAUSTED
      const reqModified: ExecutionRequestV2 = {
        ...req,
        executionContext: {
          ...req.executionContext,
          budget: 0,
        },
      };

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: reqModified,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_PROJECTION_NOT_AUTHORIZED");
    });

    it("T34 — full native owner chain", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.projectionId).toMatch(
        /^prj:projection:v1:[0-9a-f]{64}$/,
      );
      expect(res.projection.sourceExecution.receiptId).toBeDefined();
    });

    it("T35 — non-VERIFY lawful projection", () => {
      const req = createValidExecutionRequest();
      const reqModified: ExecutionRequestV2 = {
        ...req,
        intent: {
          ...req.intent,
          intentCategory: "ACCESS",
        },
      };

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: reqModified,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.output).toBeDefined();
    });

    it("T36 — deterministic replay / idempotence", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res1 = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      const res2 = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.projection).toEqual(res2.projection);
      expect(res1.projection.projectionId).toBe(res2.projection.projectionId);
    });

    it("T37 — context sensitivity", () => {
      const req1 = createValidExecutionRequest();

      const tEInput = "2026-03-31T12:00:00.000Z";
      const ra = req1.requestedAction;
      const es = req1.evidenceState;
      const pu = req1.policyUniverse;
      const cs = req1.constitutionalState;
      const part2 = {
        roleBindings: [
          {
            roleBindingKey: "role_alice",
            role: "ACTOR" as const,
            subject: {
              kind: "KNOWN" as const,
              subjectRef: createSubjectRef("alice-different"),
            },
          },
        ],
        agencyBindings: [],
      };

      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      if (!secRes.ok) throw new Error("SEC failed");

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });
      if (!aggRes.ok) throw new Error("POL Aggregate failed");

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part2,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
        secTrustResult: secRes.determination,
      });
      if (!authRes.ok) throw new Error("POL Authorization failed");

      const req2: ExecutionRequestV2 = {
        ...req1,
        participation: part2,
        evaluationContext: {
          ...req1.evaluationContext,
          ownerDeterminationBindings: [
            secRes.determination,
            aggRes.determination,
            authRes.determination,
          ],
        },
      };

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res1 = materializePrjProjectionV2({
        executionRequest: req1,
        realityView: rv,
        boundSpecification: spec,
      });

      const res2 = materializePrjProjectionV2({
        executionRequest: req2,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.projection.contextHash).not.toBe(res2.projection.contextHash);
      expect(res1.projection.projectionId).not.toBe(
        res2.projection.projectionId,
      );
    });

    it("T38 — policy sensitivity", () => {
      const req1 = createValidExecutionRequest();

      const tEInput = "2026-03-31T12:00:00.000Z";
      const ra = req1.requestedAction;
      const es = req1.evidenceState;
      const part = req1.participation;
      const cs = req1.constitutionalState;

      // Policy Universe 2 with different policyRef
      const pu2 = createValidBoundPolicyUniverse([
        {
          policyKey: "p2",
          policyRef: createPolicyRef("pol-permit-2"),
          material: {
            ruleset: "POL-POLICY-RULESET-01",
            ruleEffect: "PERMIT",
            requiredTrustStatuses: ["definite"],
            authorization: {
              actionSemanticRef: ra.actionSemanticRef,
              authorizedTargets: [
                {
                  targetSlotSemanticRef:
                    ra.actionTargetBindings[0].targetSlotSemanticRef,
                  targetRef: ra.actionTargetBindings[0].targetRef,
                },
              ],
              requiredPerformerStates: [],
            },
          },
        },
      ]);

      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      if (!secRes.ok) throw new Error("SEC failed");

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu2,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });
      if (!aggRes.ok) throw new Error("POL Aggregate failed");

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu2,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
        secTrustResult: secRes.determination,
      });
      if (!authRes.ok) throw new Error("POL Authorization failed");

      const req2: ExecutionRequestV2 = {
        ...req1,
        policyUniverse: pu2,
        evaluationContext: {
          ...req1.evaluationContext,
          ownerDeterminationBindings: [
            secRes.determination,
            aggRes.determination,
            authRes.determination,
          ],
        },
      };

      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res1 = materializePrjProjectionV2({
        executionRequest: req1,
        realityView: rv,
        boundSpecification: spec,
      });

      const res2 = materializePrjProjectionV2({
        executionRequest: req2,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.projection.policyHash).not.toBe(res2.projection.policyHash);
      expect(res1.projection.projectionId).not.toBe(
        res2.projection.projectionId,
      );
    });

    it("T39 — historical bound view neutrality", () => {
      const req = createValidExecutionRequest();
      const rvHist = createValidBoundRealityView({ viewType: "HISTORICAL" });
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rvHist,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.projection.viewType).toBe("HISTORICAL");
    });

    it("T40 — multi-projection same Reality", () => {
      const specA = createValidBoundSpecification({
        specId: "spec-A",
        rulesetRoot: { kind: "LITERAL", value: "Output A" },
      });

      const specB = createValidBoundSpecification({
        specId: "spec-B",
        rulesetRoot: { kind: "LITERAL", value: "Output B" },
      });

      const reqA = createValidExecutionRequest({
        capabilityId: specA.specification.requiredCapabilityRef.artifactId,
      });
      const reqB = createValidExecutionRequest({
        capabilityId: specB.specification.requiredCapabilityRef.artifactId,
      });
      const rv = createValidBoundRealityView();

      const resA = materializePrjProjectionV2({
        executionRequest: reqA,
        realityView: rv,
        boundSpecification: specA,
      });

      const resB = materializePrjProjectionV2({
        executionRequest: reqB,
        realityView: rv,
        boundSpecification: specB,
      });

      expect(resA.ok).toBe(true);
      expect(resB.ok).toBe(true);
      if (!resA.ok || !resB.ok) return;

      expect(resA.projection.output).toBe("Output A");
      expect(resB.projection.output).toBe("Output B");
      expect(resA.projection.projectionId).not.toBe(
        resB.projection.projectionId,
      );
    });
  });

  describe("PRJ01-H01..H16 Mandatory Hardening Tests", () => {
    it("H01 — inherited top-level input rejected", () => {
      const baseProto = {
        realityView: createValidBoundRealityView(),
      };
      const inputObj = Object.create(baseProto);
      inputObj.executionRequest = createValidExecutionRequest();
      inputObj.boundSpecification = createValidBoundSpecification();

      const res = materializePrjProjectionV2(inputObj);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_INPUT_INVALID");
    });

    it("H02 — inherited Reality View semantic key rejected", () => {
      const req = createValidExecutionRequest();
      const baseProto = {
        viewTimestamp: "2026-03-31T12:00:00.000Z",
      };
      const rvProto = Object.create(baseProto);
      const validRv = createValidBoundRealityView();
      Object.assign(rvProto, validRv);
      delete (rvProto as Record<string, unknown>).viewTimestamp; // Inherited viewTimestamp

      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rvProto,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_REALITY_VIEW_INVALID");
    });

    it("H03 — inherited Registration semantic key rejected", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const baseRegProto = {
        freshnessModelRef: "model:freshness:v1",
      };
      const regProto = Object.create(baseRegProto);
      Object.assign(regProto, spec.registration);
      delete (regProto as Record<string, unknown>).freshnessModelRef;

      const specProto = {
        ...spec,
        registration: regProto,
      };

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: specProto,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_REGISTRATION_INVALID");
    });

    it("H04 — inherited RuleSet01 semantic key rejected", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const baseRuleProto = {
        ruleset: "PRJ-PROJECTION-RULESET-01",
      };
      const ruleProto = Object.create(baseRuleProto);
      Object.assign(ruleProto, spec.specification);
      delete (ruleProto as Record<string, unknown>).ruleset;

      const specProto = {
        ...spec,
        specification: ruleProto,
      };

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: specProto,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SPECIFICATION_INVALID");
    });

    it("H05 — unknown RuleSet01 key rejected", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();
      const badSpec = {
        ...spec,
        specification: {
          ...spec.specification,
          unadmittedKey: "value",
        },
      };

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification:
          badSpec as unknown as BoundPrjProjectionSpecificationV1,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SPECIFICATION_INVALID");
    });

    it("H06 — unknown node key rejected", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "LITERAL",
          value: 123,
          unadmittedNodeKey: "bad",
        } as unknown as PrjProjectionRuleSet01["root"],
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SPECIFICATION_INVALID");
    });

    it("H07 — duplicate OBJECT key rejected", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "OBJECT",
          fields: [
            { key: "dupKey", node: { kind: "LITERAL", value: 1 } },
            { key: "dupKey", node: { kind: "LITERAL", value: 2 } },
          ],
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SPECIFICATION_INVALID");
    });

    it("H08 — __proto__ / prototype / constructor rejected", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "OBJECT",
          fields: [
            { key: "__proto__", node: { kind: "LITERAL", value: "pollution" } },
          ],
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_SPECIFICATION_INVALID");
    });

    it("H09 — source traversal uses own properties only", () => {
      const req = createValidExecutionRequest();
      // Use "toString" which exists on Object.prototype, but is NOT an own property of material
      const material = { ownVal: "valid" };

      const rv = createValidBoundRealityView({ material });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["toString"],
          requirement: "REQUIRED",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      // Should treat inherited Object.prototype property as missing and record null output
      expect(res.projection.output).toBeNull();
      expect(res.projection.projectionCompleteness).toBe("INCOMPLETE");
    });

    it("H10 — node depth limit", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();

      // Construct node with depth > 32
      let deepNode: PrjProjectionRuleSet01["root"] = {
        kind: "LITERAL",
        value: "deep",
      };
      for (let i = 0; i < 35; i++) {
        deepNode = {
          kind: "ARRAY",
          items: [deepNode],
        };
      }

      const spec = createValidBoundSpecification({ rulesetRoot: deepNode });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_RULESET_BOUNDS_EXCEEDED");
    });

    it("H11 — node count limit", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();

      // Construct array node with > 512 items
      const items: PrjProjectionRuleSet01["root"][] = [];
      for (let i = 0; i < 600; i++) {
        items.push({ kind: "LITERAL", value: i });
      }

      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "ARRAY",
          items,
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_RULESET_BOUNDS_EXCEEDED");
    });

    it("H12 — path length limit", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();

      const path: string[] = [];
      for (let i = 0; i < 35; i++) {
        path.push(`seg_${i}`);
      }

      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path,
          requirement: "REQUIRED",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_RULESET_BOUNDS_EXCEEDED");
    });

    it("H13 — output byte limit", () => {
      const req = createValidExecutionRequest();
      // Materialize a large string > 1 MB
      const largeString = "a".repeat(1_100_000);
      const rv = createValidBoundRealityView({ material: { largeString } });
      const spec = createValidBoundSpecification({
        rulesetRoot: {
          kind: "SOURCE",
          source: "REALITY_VIEW",
          path: ["largeString"],
          requirement: "REQUIRED",
        },
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_OUTPUT_LIMIT_EXCEEDED");
    });

    it("H14 — caller Receipt / owner-result injection immunity", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      // Pass caller-injected executionReceipt and policyAggregate on the input object
      const injectedInput = {
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
        executionReceipt: { receiptId: "FORGED_RECEIPT" },
        policyAggregate: { aggregateResult: "ALLOW" },
      };

      const res = materializePrjProjectionV2(injectedInput);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.error.code).toBe("PRJ_INPUT_INVALID");
    });

    it("H15 — TOCTOU / input mutation isolation", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      // Mutate caller input after materialization
      (rv.material as Record<string, string>).assetName = "MUTATED_TITLE";

      // Projection output must remain unchanged
      expect((res.projection.output as Record<string, string>).title).toBe(
        "Widget A",
      );
    });

    it("H16 — Projection cannot become a privileged source", () => {
      const req = createValidExecutionRequest();
      const rv = createValidBoundRealityView();
      const spec = createValidBoundSpecification();

      const res1 = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });

      expect(res1.ok).toBe(true);
      if (!res1.ok) return;

      // Attempting to supply a PrjProjectionArtifactV1 as a Reality View must fail digest check or structural validation
      const res2 = materializePrjProjectionV2({
        executionRequest: req,
        realityView: res1.projection as unknown as BoundPrjRealityViewV1,
        boundSpecification: spec,
      });

      expect(res2.ok).toBe(false);
      if (res2.ok) return;

      expect(
        res2.error.code === "PRJ_REALITY_VIEW_INVALID" ||
          res2.error.code === "PRJ_REALITY_VIEW_DIGEST_MISMATCH",
      ).toBe(true);
    });
  });

  describe("Disappearance Tests", () => {
    it("Disappearance 1 — Delete synthetic Spec A -> Reality View remains valid", () => {
      const rv = createValidBoundRealityView();
      const rvDigestBefore = rv.realityDigest;

      const specA = createValidBoundSpecification({ specId: "spec-A" });
      const req = createValidExecutionRequest({
        capabilityId: specA.specification.requiredCapabilityRef.artifactId,
      });

      const resA = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: specA,
      });
      expect(resA.ok).toBe(true);

      // Reality View remains unchanged
      expect(rv.realityDigest).toBe(rvDigestBefore);
    });

    it("Disappearance 2 — Delete all PRJ projections -> sourceZid / Reality View remain valid", () => {
      const rv = createValidBoundRealityView({
        sourceZid: "zid:zyppi:asset:789",
      });
      const spec = createValidBoundSpecification();
      const req = createValidExecutionRequest({
        capabilityId: spec.specification.requiredCapabilityRef.artifactId,
      });

      const res = materializePrjProjectionV2({
        executionRequest: req,
        realityView: rv,
        boundSpecification: spec,
      });
      expect(res.ok).toBe(true);

      expect(rv.sourceZid).toBe("zid:zyppi:asset:789");
    });
  });

  describe("Source Code Audits", () => {
    it("projectionMaterializationV2.ts contains zero forbidden imports or ambient authority", () => {
      const filePath = resolve(__dirname, "./projectionMaterializationV2.ts");
      const content = readFileSync(filePath, "utf8");

      expect(content).not.toMatch(/from\s+["'].*\/gs1\/.*["']/);
      expect(content).not.toMatch(/from\s+["'].*\/zprof\/.*["']/);
      expect(content).not.toMatch(/from\s+["'].*\/pol\/.*["']/);
      expect(content).not.toMatch(/from\s+["'].*\/sec\/.*["']/);

      expect(content).not.toMatch(/GTIN/i);
      expect(content).not.toMatch(/GLN/i);
      expect(content).not.toMatch(/Digital Link/i);
      expect(content).not.toMatch(/EPCIS/i);
      expect(content).not.toMatch(/DPP/i);
      expect(content).not.toMatch(/ESPR/i);

      expect(content).not.toMatch(/Date\.now/);
      expect(content).not.toMatch(/new\s+Date/);
      expect(content).not.toMatch(/Math\.random/);
      expect(content).not.toMatch(/randomUUID/);
      expect(content).not.toMatch(/process\.env/);

      expect(content).not.toMatch(/fetch\(/);
      expect(content).not.toMatch(/node:fs/);
      expect(content).not.toMatch(/postgres/);
      expect(content).not.toMatch(/RegistryRepository/);

      expect(content).not.toMatch(/StageOverrideConfig/);
      expect(content).not.toMatch(/runInternalPipeline/);
      expect(content).not.toMatch(/mockResult/);
      expect(content).not.toMatch(/evaluatePolicies/);
    });
  });
});
