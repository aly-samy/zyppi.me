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
  type OwnerDeterminationBindingV2,
  type ParticipationV2,
  type PolicyRefV2,
  type RequestedActionBindingV2,
  type StateInstanceRefV2,
  type StateSemanticRefV2,
  type SubjectRefV2,
  type TargetRefV2,
  type TargetSlotSemanticRefV2,
} from "@zyppi/domain";
import { evaluateExecutabilityAndOutcomeV2 } from "@zyppi/runtime";

import { produceSecTrustResultV2 } from "../sec/index.js";
import {
  producePolAggregatePolicyResultV2,
  producePolAuthorizationV2,
  type PolAggregateOwnerNativeResultV2,
  type PolAuthorizationOwnerNativeResultV2,
  type PolRuleSet01Material,
} from "./policyDeterminationV2.js";

function computeSha256(text: string): string {
  const hex = crypto
    .createHash("sha256")
    .update(text, "utf8")
    .digest("hex")
    .toLowerCase();
  return `sha256:${hex}`;
}

const COUNCIL_OWNER = {
  family: "OWNER" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "council-001",
};

const GLOBAL_SCOPE = {
  family: "SCOPE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "scope-global",
};

const PROVENANCE_REF = {
  family: "PROVENANCE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "prov-001",
};

function createValidBoundEvidenceState(
  partial?: Partial<Omit<BoundEvidenceStateV2, "evidenceStateRef">>,
): BoundEvidenceStateV2 {
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

  const defaultState: Omit<BoundEvidenceStateV2, "evidenceStateRef"> = {
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
    ...partial,
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
    family: "POLICY" as const,
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
  }[],
  edges: readonly {
    dependeePolicyRef: PolicyRefV2;
    dependentPolicyRef: PolicyRefV2;
  }[] = [],
): BoundPolicyUniverseV2 {
  const baseObj = {
    applicablePolicyMaterial: materials as readonly BoundPolicyMaterialV2[],
    dependencyTopology: {
      dependencyEdges: edges,
    },
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
    family: "SUBJECT" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createActionSemanticRef(id: string): ActionSemanticRefV2 {
  return {
    family: "ACTION_SEMANTIC" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createTargetSlotSemanticRef(id: string): TargetSlotSemanticRefV2 {
  return {
    family: "TARGET_SLOT_SEMANTIC" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createTargetRef(id: string): TargetRefV2 {
  return {
    family: "TARGET" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createStateSemanticRef(id: string): StateSemanticRefV2 {
  return {
    family: "STATE_SEMANTIC" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createStateInstanceRef(id: string): StateInstanceRefV2 {
  return {
    family: "STATE_INSTANCE" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: id,
  };
}

function createValidRequestedAction(params?: {
  actionId?: string;
  targetId?: string;
  performerRefKey?: string;
}): RequestedActionBindingV2 {
  const actionSemanticRef = createActionSemanticRef(
    params?.actionId ?? "action-transfer",
  );
  const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
  const targetRef = createTargetRef(params?.targetId ?? "target-account-123");

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
        actorParticipationRef: params?.performerRefKey ?? "role_alice",
        agencyReliance: { kind: "NO_DELEGATED_AGENCY_RELIANCE" },
      },
    ],
    actionTargetBindings: [
      {
        targetSlotSemanticRef,
        targetRef,
      },
    ],
    requestedCapabilityClaimBindings: [],
  };
}

function createValidParticipation(params?: {
  roleBindingKey?: string;
  subjectKind?: "KNOWN" | "UNKNOWN";
  subjectId?: string;
}): ParticipationV2 {
  const subjectId = params?.subjectId ?? "alice";
  const roleKey = params?.roleBindingKey ?? "role_alice";

  return {
    roleBindings: [
      {
        roleBindingKey: roleKey,
        role: "ACTOR",
        subject:
          params?.subjectKind === "UNKNOWN"
            ? { kind: "UNKNOWN" }
            : {
                kind: "KNOWN",
                subjectRef: createSubjectRef(subjectId),
              },
      },
    ],
    agencyBindings: [],
  };
}

function createValidBoundConstitutionalState(params?: {
  subjectId?: string;
  kind?: "STANDING_STATE" | "AUTHORITY_STATE" | "CAPABILITY_STATE";
  stateSemanticId?: string;
  exactStateInstanceId?: string;
}): BoundConstitutionalStateV2 {
  const subjectRef = createSubjectRef(params?.subjectId ?? "alice");
  const stateSemanticRef = createStateSemanticRef(
    params?.stateSemanticId ?? "state-good-standing",
  );
  const exactStateRef = createStateInstanceRef(
    params?.exactStateInstanceId ?? "inst-good-standing-01",
  );

  const baseObj = {
    stateViews: [
      {
        viewKey: "view_1",
        viewScope: GLOBAL_SCOPE,
        stateBindings: [
          {
            stateBindingKey: "sb_1",
            kind: params?.kind ?? ("STANDING_STATE" as const),
            subjectRef,
            stateSemanticRef,
            exactStateRef,
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

describe("CCP-POL-PROD-01 Native V2 Policy & Authorization Foundation", () => {
  const tEInput = "2026-03-31T12:00:00.000Z";

  describe("POL01-T01..T40 Mandatory Tests", () => {
    it("POL01-T01 — Empty policy universe aggregate", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("ALLOW");
      expect(native.policyDecisions).toEqual([]);
    });

    it("POL01-T02 — Empty universe does not authorize", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["NO_AUTHORIZATION_BASIS"]);
    });

    it("POL01-T03 — Single PERMIT no Trust requirement", () => {
      const polRef = createPolicyRef("pol-permit-1");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("ALLOW");
      expect(native.policyDecisions).toHaveLength(1);
      expect(native.policyDecisions[0].result).toBe("ALLOW");
    });

    it("POL01-T04 — Single PROHIBIT", () => {
      const polRef = createPolicyRef("pol-prohibit-1");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PROHIBIT",
        requiredTrustStatuses: [],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("DENY");
      expect(native.policyDecisions[0].result).toBe("DENY");
      expect(native.policyDecisions[0].reasonCodes).toEqual([
        "POLICY_PROHIBITION",
      ]);
    });

    it("POL01-T05 — DENY precedence", () => {
      const p1 = createPolicyRef("pol-1-permit");
      const p2 = createPolicyRef("pol-2-prohibit");
      const p3 = createPolicyRef("pol-3-unsupported");

      const m1: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };
      const m2: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PROHIBIT",
        requiredTrustStatuses: [],
        authorization: null,
      };
      const m3 = { ruleset: "FUTURE-RULESET-99" };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: m1 },
        { policyKey: "k2", policyRef: p2, material: m2 },
        { policyKey: "k3", policyRef: p3, material: m3 },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("DENY");
    });

    it("POL01-T06 — INDETERMINATE precedence", () => {
      const p1 = createPolicyRef("pol-1-permit");
      const p2 = createPolicyRef("pol-2-unsupported");

      const m1: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };
      const m2 = { ruleset: "FUTURE-RULESET-99" };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: m1 },
        { policyKey: "k2", policyRef: p2, material: m2 },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("INDETERMINATE");
    });

    it("POL01-T07 — Complete evaluation after DENY", () => {
      const p1 = createPolicyRef("pol-1-prohibit");
      const p2 = createPolicyRef("pol-2-permit");

      const m1: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PROHIBIT",
        requiredTrustStatuses: [],
        authorization: null,
      };
      const m2: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: m1 },
        { policyKey: "k2", policyRef: p2, material: m2 },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.policyDecisions).toHaveLength(2);
    });

    it("POL01-T08 — Canonical DAG order and UTF-16 tie-breaking", () => {
      const pA = createPolicyRef("pol-A");
      const pB = createPolicyRef("pol-B");

      const mA: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };
      const mB: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };

      // Supply in reverse order B then A
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "kB", policyRef: pB, material: mB },
        { policyKey: "kA", policyRef: pA, material: mA },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      const refAStr = canonicalizeJcs(pA);
      const refBStr = canonicalizeJcs(pB);

      if (refAStr < refBStr) {
        expect(canonicalizeJcs(native.policyDecisions[0].policyRef)).toBe(
          refAStr,
        );
        expect(canonicalizeJcs(native.policyDecisions[1].policyRef)).toBe(
          refBStr,
        );
      } else {
        expect(canonicalizeJcs(native.policyDecisions[0].policyRef)).toBe(
          refBStr,
        );
        expect(canonicalizeJcs(native.policyDecisions[1].policyRef)).toBe(
          refAStr,
        );
      }
    });

    it("POL01-T09 — Policy universe identity mismatch", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const tamperedPu = {
        ...pu,
        policyUniverseRef:
          "zyppi:domain:policy_universe:v1:0000000000000000000000000000000000000000000000000000000000000000",
      };
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: tamperedPu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_UNIVERSE_IDENTITY_FAILED");
    });

    it("POL01-T10 — Evidence state identity mismatch", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const tamperedEs = {
        ...es,
        evidenceStateRef:
          "zyppi:domain:evidence_state:v1:0000000000000000000000000000000000000000000000000000000000000000",
      };

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: tamperedEs,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_EVIDENCE_STATE_IDENTITY_FAILED");
    });

    it("POL01-T11 — Malformed RuleSet01 material", () => {
      const p1 = createPolicyRef("pol-malformed");
      const badMat = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "INVALID_EFFECT",
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: badMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("POL01-T12 — Unsupported future ruleset", () => {
      const p1 = createPolicyRef("pol-future");
      const futureMat = {
        ruleset: "POL-FUTURE-RULESET-999",
        someField: 123,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: futureMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("INDETERMINATE");
      expect(native.policyDecisions[0].result).toBe("INDETERMINATE");
      expect(native.policyDecisions[0].reasonCodes).toEqual([
        "UNSUPPORTED_POLICY_RULESET",
      ]);
    });

    it("POL01-T13 — PROHIBIT cannot declare conditional Trust", () => {
      const p1 = createPolicyRef("pol-prohibit-trust");
      const badMat = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PROHIBIT",
        requiredTrustStatuses: ["definite"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: badMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("POL01-T14 — SEC required but absent", () => {
      const p1 = createPolicyRef("pol-trust-req");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("INDETERMINATE");
      expect(native.policyDecisions[0].result).toBe("INDETERMINATE");
      expect(native.policyDecisions[0].reasonCodes).toEqual([
        "SEC_TRUST_RESULT_MISSING",
      ]);
    });

    it("POL01-T15 — Exact SEC accepted status", () => {
      const es = createValidBoundEvidenceState();
      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      expect(secRes.ok).toBe(true);
      if (!secRes.ok) return;

      const p1 = createPolicyRef("pol-trust-req");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("ALLOW");
      expect(native.policyDecisions[0].result).toBe("ALLOW");
    });

    it("POL01-T16 — SEC status not in policy set", () => {
      const es = createValidBoundEvidenceState();
      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      expect(secRes.ok).toBe(true);
      if (!secRes.ok) return;

      const p1 = createPolicyRef("pol-trust-req");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["uncertain", "speculative"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("DENY");
      expect(native.policyDecisions[0].result).toBe("DENY");
      expect(native.policyDecisions[0].reasonCodes).toEqual([
        "SEC_TRUST_REQUIREMENT_NOT_SATISFIED",
      ]);
    });

    it("POL01-T17 — No Trust ordering", () => {
      const es = createValidBoundEvidenceState();
      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      expect(secRes.ok).toBe(true);
      if (!secRes.ok) return;

      // SEC emits "definite". If policy accepts "probable" only, it denies without assuming definite > probable.
      const p1 = createPolicyRef("pol-probable-only");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["probable"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("DENY");
      expect(native.policyDecisions[0].reasonCodes).toEqual([
        "SEC_TRUST_REQUIREMENT_NOT_SATISFIED",
      ]);
    });

    it("POL01-T18 — Forged/wrong SEC binding rejected", () => {
      const es = createValidBoundEvidenceState();
      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      expect(secRes.ok).toBe(true);
      if (!secRes.ok) return;

      const forgedSec = {
        ...secRes.determination,
        determinationBindingKey:
          "sec:trust-result:0000000000000000000000000000000000000000000000000000000000000000",
      };

      const p1 = createPolicyRef("pol-trust-req");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: forgedSec,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_SEC_DEPENDENCY_INVALID");
    });

    it("POL01-T19 — Aggregate SEC dependency exact", () => {
      const es = createValidBoundEvidenceState();
      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      expect(secRes.ok).toBe(true);
      if (!secRes.ok) return;

      const p1 = createPolicyRef("pol-trust-req");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();

      const resWithSec = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });

      expect(resWithSec.ok).toBe(true);
      if (!resWithSec.ok) return;
      expect(
        resWithSec.determination.determinationDependencyDeclaration,
      ).toEqual({
        kind: "EXPLICIT",
        dependencyRefs: [secRes.determination.determinationBindingKey],
      });

      // No SEC required
      const p2 = createPolicyRef("pol-no-trust");
      const mat2: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };
      const pu2 = createValidBoundPolicyUniverse([
        { policyKey: "k2", policyRef: p2, material: mat2 },
      ]);

      const resNoSec = producePolAggregatePolicyResultV2({
        policyUniverse: pu2,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(resNoSec.ok).toBe(true);
      if (!resNoSec.ok) return;
      expect(resNoSec.determination.determinationDependencyDeclaration).toEqual(
        {
          kind: "AUTHORITATIVELY_NONE",
        },
      );
    });

    it("POL01-T20 — Aggregate exact owner/question/rule", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const d = res.determination;
      expect(d.constitutionalOwnerRef).toEqual({
        family: "OWNER",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-001",
      });
      expect(d.exactRuleRef.artifactId).toBe("POL-AGGREGATE-RULESET-01");
      expect(
        d.determinationQuestionBinding.questionSemanticRef.artifactId,
      ).toBe("POL-AGGREGATE-QUESTION-01");
    });

    it("POL01-T21 — Aggregate deterministic replay", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res1 = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      const res2 = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.determination).toEqual(res2.determination);
    });

    it("POL01-T22 — Aggregate property-order invariance", () => {
      const p1 = createPolicyRef("pol-1");
      const matObj1 = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };
      const matObj2 = {
        authorization: null,
        requiredTrustStatuses: [],
        ruleEffect: "PERMIT",
        ruleset: "POL-POLICY-RULESET-01",
      };

      const pu1 = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: matObj1 },
      ]);
      const pu2 = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: matObj2 },
      ]);

      expect(pu1.policyUniverseRef).toBe(pu2.policyUniverseRef);

      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res1 = producePolAggregatePolicyResultV2({
        policyUniverse: pu1,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      const res2 = producePolAggregatePolicyResultV2({
        policyUniverse: pu2,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.determination.determinationBindingKey).toBe(
        res2.determination.determinationBindingKey,
      );
    });

    it("POL01-T23 — Aggregate deep freeze", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(Object.isFrozen(res.determination)).toBe(true);
      expect(Object.isFrozen(res.determination.ownerNativeResult)).toBe(true);
    });

    it("POL01-T24 — Aggregate inherited top-level semantic input rejected", () => {
      const baseProto = {
        tEInput: "2026-03-31T12:00:00.000Z",
      };
      const inputObj = Object.create(baseProto);
      inputObj.policyUniverse = createValidBoundPolicyUniverse([]);
      inputObj.requestedAction = createValidRequestedAction();
      inputObj.evidenceState = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2(inputObj);
      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_INPUT_INVALID");
    });

    it("POL01-T25 — Valid Authorization", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");
      const stateSemanticRef = createStateSemanticRef("state-good-standing");
      const exactStateRef = createStateInstanceRef("inst-good-standing-01");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [
            {
              kind: "STANDING_STATE",
              stateSemanticRef,
              exactStateRef,
            },
          ],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation({
        roleBindingKey: "role_alice",
        subjectId: "alice",
      });
      const cs = createValidBoundConstitutionalState({
        subjectId: "alice",
        kind: "STANDING_STATE",
        stateSemanticId: "state-good-standing",
        exactStateInstanceId: "inst-good-standing-01",
      });

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Authorized");
      expect(native.reasonCodes).toEqual([]);
    });

    it("POL01-T26 — Aggregate DENY -> Authorization Denied", () => {
      const p1 = createPolicyRef("pol-prohibit");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PROHIBIT",
        requiredTrustStatuses: [],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["POLICY_AGGREGATE_DENY"]);
    });

    it("POL01-T27 — Aggregate INDETERMINATE -> Deferred", () => {
      const p1 = createPolicyRef("pol-unsupported");
      const mat = { ruleset: "FUTURE-RULESET-99" };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Deferred");
      expect(native.reasonCodes).toEqual(["POLICY_AGGREGATE_INDETERMINATE"]);
    });

    it("POL01-T28 — ALLOW alone does not authorize", () => {
      const p1 = createPolicyRef("pol-permit-no-auth");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["NO_AUTHORIZATION_BASIS"]);
    });

    it("POL01-T29 — Wrong/forged Aggregate dependency rejected", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const forgedAgg = {
        ...aggRes.determination,
        determinationBindingKey:
          "pol:aggregate:0000000000000000000000000000000000000000000000000000000000000000",
      };

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: forgedAgg,
      });

      expect(authRes.ok).toBe(false);
      if (authRes.ok) return;
      expect(authRes.error.code).toBe("POL_AGGREGATE_DEPENDENCY_INVALID");
    });

    it("POL01-T30 — Action mismatch denied", () => {
      const actionSemanticRef = createActionSemanticRef("action-different");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({ actionId: "action-transfer" });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["ACTION_NOT_AUTHORIZED"]);
    });

    it("POL01-T31 — Target mismatch denied", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-different");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["TARGET_NOT_AUTHORIZED"]);
    });

    it("POL01-T32 — Unknown performer denied", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation({
        roleBindingKey: "role_alice",
        subjectKind: "UNKNOWN",
      });
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["PERFORMER_SUBJECT_UNKNOWN"]);
    });

    it("POL01-T33 — Required Standing missing", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");
      const stateSemanticRef = createStateSemanticRef("state-good-standing");
      const exactStateRef = createStateInstanceRef("inst-good-standing-01");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [
            {
              kind: "STANDING_STATE",
              stateSemanticRef,
              exactStateRef,
            },
          ],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      // Provide wrong standing state instance
      const cs = createValidBoundConstitutionalState({
        subjectId: "alice",
        kind: "STANDING_STATE",
        stateSemanticId: "state-good-standing",
        exactStateInstanceId: "inst-different-01",
      });

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["REQUIRED_POL_STATE_UNSATISFIED"]);
    });

    it("POL01-T34 — Required Authority missing", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");
      const stateSemanticRef = createStateSemanticRef("state-authority");
      const exactStateRef = createStateInstanceRef("inst-auth-01");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [
            {
              kind: "AUTHORITY_STATE",
              stateSemanticRef,
              exactStateRef,
            },
          ],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState(); // Missing AUTHORITY_STATE

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["REQUIRED_POL_STATE_UNSATISFIED"]);
    });

    it("POL01-T35 — Required Capability missing", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");
      const stateSemanticRef = createStateSemanticRef("state-cap");
      const exactStateRef = createStateInstanceRef("inst-cap-01");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [
            {
              kind: "CAPABILITY_STATE",
              stateSemanticRef,
              exactStateRef,
            },
          ],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState(); // Missing CAPABILITY_STATE

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["REQUIRED_POL_STATE_UNSATISFIED"]);
    });

    it("POL01-T36 — Exact state required", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");
      const stateSemanticRef = createStateSemanticRef("state-good-standing");
      const exactStateRef = createStateInstanceRef("inst-good-standing-01");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [
            {
              kind: "STANDING_STATE",
              stateSemanticRef,
              exactStateRef,
            },
          ],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState({
        subjectId: "alice",
        kind: "STANDING_STATE",
        stateSemanticId: "state-good-standing",
        exactStateInstanceId: "inst-different-01",
      });

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["REQUIRED_POL_STATE_UNSATISFIED"]);
    });

    it("POL01-T37 — Agency does not authorize", () => {
      const p1 = createPolicyRef("pol-permit-no-auth");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = {
        ...createValidParticipation(),
        agencyBindings: [
          {
            agencyBindingKey: "agency_1",
            actorRoleBindingRef: "role_alice",
            governedSubjectRoleBindingRef: "role_bob",
            terminalAgencyBasisRef: {
              family: "AGENCY_BASIS" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "basis-001",
            },
          },
        ],
      };
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["NO_AUTHORIZATION_BASIS"]);
    });

    it("POL01-T38 — Self-execution", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      // Self-execution: Actor == Governed Subject (single role binding for alice, no agency reliance)
      const part = createValidParticipation({
        roleBindingKey: "role_alice",
        subjectId: "alice",
      });
      const cs = createValidBoundConstitutionalState({ subjectId: "alice" });

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      const native = authRes.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Authorized");
      expect(native.reasonCodes).toEqual([]);
    });

    it("POL01-T39 — Native V2-08 recognition", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite"],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const secRes = produceSecTrustResultV2({ evidenceState: es, tEInput });
      expect(secRes.ok).toBe(true);
      if (!secRes.ok) return;

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: secRes.determination,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

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
      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      // Construct lawful executionRequest
      const req: ExecutionRequestV2 = {
        contractVersion: "v2",
        requestId: "req-001",
        executionContext: {
          executionId: "exec-001",
          budget: 1000,
          temporalCoordinates: {
            tEInput,
          },
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
          intentTargetRef: targetRef,
          candidateStateBinding: {
            stateTargetRef: targetRef,
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

      const evalRes = evaluateExecutabilityAndOutcomeV2(req);
      expect(evalRes.ok).toBe(true);
      if (!evalRes.ok) return;

      expect(evalRes.frame.ownerResults.trustResult).toEqual(
        secRes.determination,
      );
      expect(evalRes.frame.ownerResults.policyAggregate).toEqual(
        aggRes.determination,
      );
      expect(evalRes.frame.ownerResults.authorization).toEqual(
        authRes.determination,
      );
      expect(evalRes.frame.executability.status).toBe("DETERMINED");
      if (evalRes.frame.executability.status === "DETERMINED") {
        expect(evalRes.frame.executability.value).toBe(true);
      }
    });

    it("POL01-T40 — Cross-role separation", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });
      expect(authRes.ok).toBe(true);
      if (!authRes.ok) return;

      expect(aggRes.determination).not.toBe(authRes.determination);
      expect(aggRes.determination.determinationBindingKey).not.toBe(
        authRes.determination.determinationBindingKey,
      );

      const aggNative = aggRes.determination
        .ownerNativeResult as unknown as Record<string, unknown>;
      const authNative = authRes.determination
        .ownerNativeResult as unknown as Record<string, unknown>;

      expect(aggNative.aggregateResult).toBeDefined();
      expect(aggNative.authorizationDecision).toBeUndefined();

      expect(authNative.authorizationDecision).toBeDefined();
      expect(authNative.aggregateResult).toBeUndefined();
    });
  });

  describe("POL01-H01..H14 Mandatory Hardening Tests", () => {
    it("POL01-H01 — inherited Aggregate inputs rejected", () => {
      const baseProto = { tEInput: "2026-03-31T12:00:00.000Z" };
      const inputObj = Object.create(baseProto);
      inputObj.policyUniverse = createValidBoundPolicyUniverse([]);
      inputObj.requestedAction = createValidRequestedAction();
      inputObj.evidenceState = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2(inputObj);
      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_INPUT_INVALID");
    });

    it("POL01-H02 — inherited Authorization inputs rejected", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const baseProto = { tEInput: "2026-03-31T12:00:00.000Z" };
      const inputObj = Object.create(baseProto);
      inputObj.policyUniverse = pu;
      inputObj.requestedAction = ra;
      inputObj.participation = createValidParticipation();
      inputObj.constitutionalState = createValidBoundConstitutionalState();
      inputObj.evidenceState = es;
      inputObj.policyAggregate = aggRes.determination;

      const res = producePolAuthorizationV2(inputObj);
      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_INPUT_INVALID");
    });

    it("POL01-H03 — caller aggregateResult override ignored", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const inputWithOverride = {
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        aggregateResult: "DENY", // Attempt caller override
      };

      const res = producePolAggregatePolicyResultV2(inputWithOverride);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2;
      expect(native.aggregateResult).toBe("ALLOW");
    });

    it("POL01-H04 — caller authorizationDecision override ignored", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const inputWithOverride = {
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
        authorizationDecision: "Authorized", // Attempt caller override
      };

      const res = producePolAuthorizationV2(inputWithOverride);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const native = res.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      expect(native.authorizationDecision).toBe("Denied");
      expect(native.reasonCodes).toEqual(["NO_AUTHORIZATION_BASIS"]);
    });

    it("POL01-H05 — duplicate RuleSet01 trust statuses rejected", () => {
      const p1 = createPolicyRef("pol-dup-trust");
      const badMat = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite", "definite"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: badMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("POL01-H06 — duplicate authorization target entries rejected", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");

      const badMat = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [
            { targetSlotSemanticRef, targetRef },
            { targetSlotSemanticRef, targetRef },
          ],
          requiredPerformerStates: [],
        },
      };

      const p1 = createPolicyRef("pol-dup-target");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: badMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("POL01-H07 — duplicate performer-state requirements rejected", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");
      const stateSemanticRef = createStateSemanticRef("state-good-standing");
      const exactStateRef = createStateInstanceRef("inst-good-standing-01");

      const badMat = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [
            {
              kind: "STANDING_STATE",
              stateSemanticRef,
              exactStateRef,
            },
            {
              kind: "STANDING_STATE",
              stateSemanticRef,
              exactStateRef,
            },
          ],
        },
      };

      const p1 = createPolicyRef("pol-dup-state");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: badMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("POL01-H08 — wrong-owner POL result cannot substitute", () => {
      const pu = createValidBoundPolicyUniverse([]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();
      const part = createValidParticipation();
      const cs = createValidBoundConstitutionalState();

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const wrongOwnerAgg = {
        ...aggRes.determination,
        constitutionalOwnerRef: {
          family: "OWNER" as const,
          ownerRef: "urn:zyppi:owner:attacker:v1",
          artifactId: "ATTACKER-001",
        },
      };

      const authRes = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part,
        constitutionalState: cs,
        evidenceState: es,
        tEInput,
        policyAggregate:
          wrongOwnerAgg as unknown as OwnerDeterminationBindingV2,
      });

      expect(authRes.ok).toBe(false);
      if (authRes.ok) return;
      expect(authRes.error.code).toBe("POL_AGGREGATE_DEPENDENCY_INVALID");
    });

    it("POL01-H09 — unknown top-level RuleSet01 key rejected", () => {
      const p1 = createPolicyRef("pol-unadmitted-top");
      const badMat = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: null,
        unadmittedTopLevelKey: "unauthorized_extra_value",
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: badMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("POL01-H10 — unknown nested authorization semantic key rejected", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");

      const badMat = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [],
          unadmittedAuthKey: "unauthorized_extra_field",
        },
      };

      const p1 = createPolicyRef("pol-unadmitted-auth");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: badMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("POL01-H11 — unknown target/state requirement semantic key rejected", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");

      const badTargetMat = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [
            { targetSlotSemanticRef, targetRef, unadmittedTargetKey: true },
          ],
          requiredPerformerStates: [],
        },
      };

      const p1 = createPolicyRef("pol-unadmitted-target");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: badTargetMat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_POLICY_MATERIAL_INVALID");
    });

    it("POL01-H12 — explicit null SEC dependency rejected", () => {
      const p1 = createPolicyRef("pol-trust-req");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: null, // Explicitly supplied null
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_SEC_DEPENDENCY_INVALID");
    });

    it("POL01-H13 — malformed supplied SEC dependency rejected", () => {
      const p1 = createPolicyRef("pol-trust-req");
      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: ["definite"],
        authorization: null,
      };

      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: p1, material: mat },
      ]);
      const ra = createValidRequestedAction();
      const es = createValidBoundEvidenceState();

      const res = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
        secTrustResult: {
          malformed: true,
        } as unknown as OwnerDeterminationBindingV2, // Explicitly supplied malformed object
      });

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.code).toBe("POL_SEC_DEPENDENCY_INVALID");
    });

    it("POL01-H14 — different exact Subject binding changes Authorization identity", () => {
      const actionSemanticRef = createActionSemanticRef("action-transfer");
      const targetSlotSemanticRef = createTargetSlotSemanticRef("slot-account");
      const targetRef = createTargetRef("target-account-123");

      const mat: PolRuleSet01Material = {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: [],
        authorization: {
          actionSemanticRef,
          authorizedTargets: [{ targetSlotSemanticRef, targetRef }],
          requiredPerformerStates: [],
        },
      };

      const polRef = createPolicyRef("pol-auth-1");
      const pu = createValidBoundPolicyUniverse([
        { policyKey: "k1", policyRef: polRef, material: mat },
      ]);
      const ra = createValidRequestedAction({
        actionId: "action-transfer",
        targetId: "target-account-123",
      });
      const es = createValidBoundEvidenceState();

      const part1 = createValidParticipation({
        roleBindingKey: "role_alice",
        subjectId: "alice-v1",
      });
      const cs1 = createValidBoundConstitutionalState({
        subjectId: "alice-v1",
      });

      const part2 = createValidParticipation({
        roleBindingKey: "role_alice",
        subjectId: "alice-v2",
      });
      const cs2 = createValidBoundConstitutionalState({
        subjectId: "alice-v2",
      });

      const aggRes = producePolAggregatePolicyResultV2({
        policyUniverse: pu,
        requestedAction: ra,
        evidenceState: es,
        tEInput,
      });
      expect(aggRes.ok).toBe(true);
      if (!aggRes.ok) return;

      const authRes1 = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part1,
        constitutionalState: cs1,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      const authRes2 = producePolAuthorizationV2({
        policyUniverse: pu,
        requestedAction: ra,
        participation: part2,
        constitutionalState: cs2,
        evidenceState: es,
        tEInput,
        policyAggregate: aggRes.determination,
      });

      expect(authRes1.ok).toBe(true);
      expect(authRes2.ok).toBe(true);
      if (!authRes1.ok || !authRes2.ok) return;

      const native1 = authRes1.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;
      const native2 = authRes2.determination
        .ownerNativeResult as unknown as PolAuthorizationOwnerNativeResultV2;

      expect(native1.authorizationDecision).toBe("Authorized");
      expect(native2.authorizationDecision).toBe("Authorized");

      // Verify that determinationBindingKey, exactStateRef, and provenanceRef differ
      expect(authRes1.determination.determinationBindingKey).not.toBe(
        authRes2.determination.determinationBindingKey,
      );
      expect(canonicalizeJcs(authRes1.determination.exactStateRef)).not.toBe(
        canonicalizeJcs(authRes2.determination.exactStateRef),
      );
      expect(canonicalizeJcs(authRes1.determination.provenanceRef)).not.toBe(
        canonicalizeJcs(authRes2.determination.provenanceRef),
      );
    });
  });

  describe("Source Code Audit Tests", () => {
    it("source file does not import @zyppi/runtime or packages/runtime", () => {
      const filePath = resolve(__dirname, "./policyDeterminationV2.ts");
      const content = readFileSync(filePath, "utf8");

      expect(content).not.toMatch(/from\s+["']@zyppi\/runtime["']/);
      expect(content).not.toMatch(/from\s+["'].*packages\/runtime.*["']/);
      expect(content).not.toMatch(/evaluatePolicies/);
      expect(content).not.toMatch(/materializeResolutionGraph/);
      expect(content).not.toMatch(/mockResult/);
      expect(content).not.toMatch(/runInternalPipeline/);
    });

    it("source file contains zero ambient clock or randomness authority", () => {
      const filePath = resolve(__dirname, "./policyDeterminationV2.ts");
      const content = readFileSync(filePath, "utf8");

      expect(content).not.toMatch(/Date\.now/);
      expect(content).not.toMatch(/new\s+Date/);
      expect(content).not.toMatch(/Math\.random/);
      expect(content).not.toMatch(/randomUUID/);
      expect(content).not.toMatch(/process\.env/);
    });

    it("source file is domain-neutral with zero GS1 semantics", () => {
      const filePath = resolve(__dirname, "./policyDeterminationV2.ts");
      const content = readFileSync(filePath, "utf8");

      expect(content).not.toMatch(/GS1/i);
      expect(content).not.toMatch(/GTIN/i);
      expect(content).not.toMatch(/GLN/i);
      expect(content).not.toMatch(/Digital Link/i);
      expect(content).not.toMatch(/DPP/i);
      expect(content).not.toMatch(/EPCIS/i);
    });
  });
});
