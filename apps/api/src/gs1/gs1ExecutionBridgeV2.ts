import crypto from "node:crypto";
import {
  canonicalizeJcs,
  deriveEvidenceStateRefV2,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  verifyEvidenceStateRefV2,
  verifyPolicyUniverseRefV2,
  verifySemanticStateRefV2,
  type BoundConstitutionalStateV2,
  type BoundEvidenceStateV2,
  type BoundPolicyMaterialV2,
  type BoundPolicyUniverseV2,
  type BoundEvaluationContextV2,
  type EvidencePresentationBindingV2,
  type EvidenceRequirementBindingV2,
  type ExecutionContextV2,
  type IntegrityCoordinatesV2,
  type JsonValueV2,
  type OwnerDeterminationBindingV2,
  type OwnerRefV2,
  type PolicyDependencyEdgeV2,
  type StateBindingV2,
  type StateViewV2,
  type SuppliedEvidenceMaterialV2,
} from "@zyppi/domain";
import { materializeExecutionReceiptV2 } from "@zyppi/runtime";
import { produceSecTrustResultV2 } from "../sec/index.js";
import {
  producePolAggregatePolicyResultV2,
  producePolAuthorizationV2,
} from "../pol/index.js";
import { materializePrjProjectionV2 } from "../prj/index.js";
import { materializeExecutionRequestV2 } from "../zprof/index.js";
import { createGs1AnchorFromCarrier } from "./gs1AnchorBridge.js";
import { assembleGs1CompositionFromAnchor } from "./gs1CompositionBridge.js";
import type {
  AMS0861CV2ProvenanceEnvelope,
  GS1DomainInterpretation,
  GS1NativeV2PacketCInput,
  GS1NativeV2PacketCResult,
} from "./types.js";

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Reflect.ownKeys(obj)) {
    const val = (obj as Record<string | symbol, unknown>)[key];
    if (val !== null && typeof val === "object") {
      deepFreeze(val);
    }
  }
  return obj;
}

function hasOwnProp(obj: unknown, prop: string): boolean {
  return (
    obj !== null &&
    typeof obj === "object" &&
    Object.prototype.hasOwnProperty.call(obj, prop)
  );
}

function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype;
}

function safeCanonicalizeJcs(
  val: unknown,
): { ok: true; value: string } | { ok: false; error: string } {
  try {
    const s = canonicalizeJcs(val);
    return { ok: true, value: s };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function computeSha256Hex(payload: string): string {
  return crypto
    .createHash("sha256")
    .update(payload, "utf8")
    .digest("hex")
    .toLowerCase();
}

function refEquals(a: unknown, b: unknown): boolean {
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const resA = safeCanonicalizeJcs(a);
  const resB = safeCanonicalizeJcs(b);
  return resA.ok && resB.ok && resA.value === resB.value;
}

/**
 * Public domain-edge orchestration capability for GS1 Native V2 Packet C (AMS-0861-C).
 *
 * Traverses the Commerce Atlas Wedge through Zyppi's native V2 owner architecture:
 * GS1 Carrier -> Packet A Anchor -> Packet B Composition -> Native V2 Adapter -> SEC-001 -> POL-001 -> RI V2 -> PRJ-001 -> GS1 Interpretation
 */
export async function executeGs1NativeV2PacketC(
  input: unknown,
): Promise<GS1NativeV2PacketCResult> {
  // 1. STAGE: INPUT_VALIDATION
  if (!isPlainObject(input)) {
    return {
      ok: false,
      stage: "INPUT_VALIDATION",
      error: {
        code: "INPUT_VALIDATION_FAILED",
        message: "Input must be a plain object.",
      },
    };
  }

  // Reject inherited semantic properties and forbidden caller success injections (H01, H03..H10)
  const allowedInputKeys = new Set([
    "carrierInput",
    "composition",
    "participation",
    "intent",
    "requestedAction",
    "realityView",
    "projectionSpecification",
  ]);

  for (const k of Reflect.ownKeys(input)) {
    if (typeof k !== "string" || !allowedInputKeys.has(k)) {
      return {
        ok: false,
        stage: "INPUT_VALIDATION",
        error: {
          code: "PROHIBITED_INPUT_INJECTION",
          message: `Input contains unadmitted or prohibited property '${String(k)}'. Caller execution success/override injections are strictly forbidden.`,
        },
      };
    }
  }

  const requiredProps = [
    "composition",
    "participation",
    "intent",
    "requestedAction",
    "realityView",
    "projectionSpecification",
  ];

  for (const p of requiredProps) {
    if (!hasOwnProp(input, p)) {
      return {
        ok: false,
        stage: "INPUT_VALIDATION",
        error: {
          code: "INPUT_VALIDATION_FAILED",
          message: `Input missing required own property '${p}'.`,
        },
      };
    }
  }

  const typedInput = input as unknown as GS1NativeV2PacketCInput;
  const {
    carrierInput,
    composition,
    participation,
    intent,
    requestedAction,
    realityView,
    projectionSpecification,
  } = typedInput;

  if (!isPlainObject(composition)) {
    return {
      ok: false,
      stage: "INPUT_VALIDATION",
      error: {
        code: "INPUT_VALIDATION_FAILED",
        message: "composition must be a plain object.",
      },
    };
  }

  // Enforce mandatory tEInput (H02)
  if (
    !composition.tEInput ||
    typeof composition.tEInput !== "string" ||
    composition.tEInput.trim() === ""
  ) {
    return {
      ok: false,
      stage: "INPUT_VALIDATION",
      error: {
        code: "MISSING_TEINPUT",
        message:
          "Required evaluation execution time coordinate (tEInput) is missing or empty.",
      },
    };
  }

  const tEInput: string = composition.tEInput;

  // 2. STAGE: ASSEMBLY (Packet A & Packet B)
  let anchorSuccess = composition.anchorSuccess;

  if (!anchorSuccess) {
    if (
      !carrierInput ||
      typeof carrierInput !== "string" ||
      carrierInput.trim() === ""
    ) {
      return {
        ok: false,
        stage: "ASSEMBLY",
        error: {
          code: "CARRIER_INPUT_MISSING",
          message:
            "carrierInput string or anchorSuccess is required for Packet A resolution.",
        },
      };
    }

    if (!composition.registryRepository) {
      return {
        ok: false,
        stage: "ASSEMBLY",
        error: {
          code: "REGISTRY_REPOSITORY_MISSING",
          message:
            "registryRepository is required for Packet A resolution when anchorSuccess is not supplied.",
        },
      };
    }

    const anchorRes = await createGs1AnchorFromCarrier(
      carrierInput,
      composition.registryRepository,
    );

    if (!anchorRes.ok) {
      return {
        ok: false,
        stage: "ASSEMBLY",
        error: {
          code: "PACKET_A_FAILED",
          message: `Packet A resolution failed at stage ${anchorRes.error.stage}: ${JSON.stringify(anchorRes.error.error)}`,
        },
      };
    }

    anchorSuccess = anchorRes;
  }

  const fullCompositionOptions = {
    ...composition,
    anchorSuccess,
  };

  const assemblyRes = await assembleGs1CompositionFromAnchor(
    fullCompositionOptions,
  );

  if (!assemblyRes.ok) {
    return {
      ok: false,
      stage: "ASSEMBLY",
      error: {
        code: assemblyRes.error.code,
        message: assemblyRes.error.message,
      },
    };
  }

  const { manifest, boundPayload, sccId, bcgId, evaluationCoordinate } =
    assemblyRes;

  const anchor = anchorSuccess.anchor;

  // 3. STAGE: V2_ADAPTER
  // Direct Packet-B -> Native V2 State Adaptation
  const canonicalZid = anchor.registryState.identity.identityId;

  // H11 & H12: Verify Reality View sourceZid matches canonical internal ZID
  if (realityView.sourceZid !== canonicalZid) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "REALITY_VIEW_SOURCE_ZID_MISMATCH",
        message: `realityView.sourceZid '${realityView.sourceZid}' does not match canonical internal Registry identity '${canonicalZid}'. External GS1 identifiers cannot substitute sourceZid.`,
      },
    };
  }

  // H13: Verify Reality View sourceTargetRef matches requestedAction primary target
  const actionTarget = requestedAction.actionTargetBindings?.[0]?.targetRef;
  if (!actionTarget || !refEquals(realityView.sourceTargetRef, actionTarget)) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "REALITY_VIEW_TARGET_MISMATCH",
        message:
          "realityView.sourceTargetRef does not match requestedAction target.",
      },
    };
  }

  // H14 & H15: Verify PRJ Specification matches CompositionManifest boundPrjSpecifications
  const boundPrjSpecs = manifest.boundPrjSpecifications || [];
  const matchingSpecs = boundPrjSpecs.filter(
    (spec) =>
      spec.specId === projectionSpecification.specId &&
      spec.version === projectionSpecification.version,
  );

  if (matchingSpecs.length === 0) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "PRJ_SPEC_ABSENT_FROM_MANIFEST",
        message: `PRJ specification '${projectionSpecification.specId}@${projectionSpecification.version}' is absent from CompositionManifest boundPrjSpecifications.`,
      },
    };
  }

  if (matchingSpecs.length > 1) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "PRJ_SPEC_BINDING_AMBIGUOUS",
        message: `Multiple matching PRJ specifications found for '${projectionSpecification.specId}@${projectionSpecification.version}'.`,
      },
    };
  }

  // Adapt BoundConstitutionalStateV2
  const acv = boundPayload.resolvedActiveConstitutionalView;
  const stateBindings: StateBindingV2[] = [];

  stateBindings.push({
    stateBindingKey: `sb:identity:${acv.identity.identityId}`,
    kind: "IDENTITY_STATE",
    subjectRef: {
      family: "SUBJECT",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: acv.identity.identityId,
    },
    stateSemanticRef: {
      family: "STATE_SEMANTIC",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "identity-v1",
    },
    exactStateRef: {
      family: "STATE_INSTANCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: acv.identity.identityId,
    },
  });

  for (const st of acv.standings || []) {
    stateBindings.push({
      stateBindingKey: `sb:standing:${st.standingId}`,
      kind: "STANDING_STATE",
      subjectRef: {
        family: "SUBJECT",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: st.subjectId || acv.identity.identityId,
      },
      stateSemanticRef: {
        family: "STATE_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: st.scope || "standing-v1",
      },
      exactStateRef: {
        family: "STATE_INSTANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: st.standingId,
      },
    });
  }

  for (const auth of acv.authorities || []) {
    stateBindings.push({
      stateBindingKey: `sb:authority:${auth.authorityId}`,
      kind: "AUTHORITY_STATE",
      subjectRef: {
        family: "SUBJECT",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: auth.subjectId || acv.identity.identityId,
      },
      stateSemanticRef: {
        family: "STATE_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: auth.scope || "authority-v1",
      },
      exactStateRef: {
        family: "STATE_INSTANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: auth.authorityId,
      },
    });
  }

  for (const cap of acv.capabilities || []) {
    stateBindings.push({
      stateBindingKey: `sb:capability:${cap.capabilityId}`,
      kind: "CAPABILITY_STATE",
      subjectRef: {
        family: "SUBJECT",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: cap.subjectId || acv.identity.identityId,
      },
      stateSemanticRef: {
        family: "STATE_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: cap.scope || "capability-v1",
      },
      exactStateRef: {
        family: "STATE_INSTANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: cap.capabilityId,
      },
    });
  }

  for (const rel of acv.relationships || []) {
    stateBindings.push({
      stateBindingKey: `sb:rel:${rel.referentId}`,
      kind: "RELATIONSHIP_STATE",
      relationshipKind: "REIFIED",
      relationshipRef: {
        family: "RELATIONSHIP",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: rel.referentId,
      },
      exactStateRef: {
        family: "STATE_INSTANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: rel.referentId,
      },
    });
  }

  const stateViews: StateViewV2[] = [
    {
      viewKey: "vk_acv_1",
      viewScope: {
        family: "SCOPE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "global-v1",
      },
      stateBindings,
    },
  ];

  const rawConstState = {
    semanticStateRef: "",
    stateViews,
  };

  const semRes = deriveSemanticStateRefV2(rawConstState);
  if (!semRes.ok) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "CONSTITUTIONAL_STATE_DERIVATION_FAILED",
        message: `Failed to derive semanticStateRef: ${semRes.error.message}`,
      },
    };
  }

  const constitutionalState: BoundConstitutionalStateV2 = {
    semanticStateRef: semRes.value,
    stateViews,
  };

  const csCheck = verifySemanticStateRefV2(constitutionalState);
  if (!csCheck.ok) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "CONSTITUTIONAL_STATE_VERIFICATION_FAILED",
        message: `Constitutional state verification failed: ${csCheck.error.message}`,
      },
    };
  }

  // Adapt BoundEvidenceStateV2
  const integrityCoordinates: IntegrityCoordinatesV2[] = (
    evaluationCoordinate.evidenceIntegrityCoordinates || []
  ).map((ic) => ({
    coordinateKey: `ic:${ic.evidenceRef}`,
    evidenceRef: {
      family: "EVIDENCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: ic.evidenceRef,
    },
    expectedDigest: ic.digest,
    algorithm: "sha256",
  }));

  const councilOwnerRef: OwnerRefV2 = {
    family: "OWNER",
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: "COUNCIL-001",
  };

  const suppliedEvidenceMaterial: SuppliedEvidenceMaterialV2[] = [];
  if (composition.explicitEvidencePayloads) {
    for (const [
      evId,
      payload,
    ] of composition.explicitEvidencePayloads.entries()) {
      suppliedEvidenceMaterial.push({
        materialKey: `mat:${evId}`,
        evidenceRef: {
          family: "EVIDENCE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: evId,
        },
        ownerRef: councilOwnerRef,
        schemaRef: {
          family: "STATE_ARTIFACT",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "evidence-schema-v1",
        },
        material: payload as JsonValueV2,
      });
    }
  }

  const secOwnerRef: OwnerRefV2 = {
    family: "OWNER",
    ownerRef: "urn:zyppi:owner:sec:v1",
    artifactId: "SEC-001",
  };

  // Build complete requirement set to satisfy Evidence Binding Closure Law (Law C 16.1)
  const reqSet = new Map<string, string>();

  for (const secReq of manifest.boundSecRequirements || []) {
    const reqId =
      typeof secReq === "string" ? secReq : secReq.securityReqId || "sec-req";
    reqSet.set(reqId, reqId);
  }

  for (const rec of boundPayload.resolvedEvidenceBundle?.evidenceRecords ||
    []) {
    if (!reqSet.has(rec.evidenceId)) {
      reqSet.set(rec.evidenceId, rec.evidenceId);
    }
  }

  const evidenceRequirementBindings: EvidenceRequirementBindingV2[] =
    Array.from(reqSet.values()).map((reqId) => ({
      requirementKey: `req:${reqId}`,
      governedRequirementRef: {
        family: "EVIDENCE_REQUIREMENT",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: reqId,
      },
      requirementAuthorityBinding: secOwnerRef,
      requirementScopeBinding: {
        family: "SCOPE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "global-v1",
      },
    }));

  const evidencePresentationBindings: EvidencePresentationBindingV2[] =
    evidenceRequirementBindings.map((b) => ({
      evidenceRequirementRef: b.governedRequirementRef,
      presentedEvidenceRefs: suppliedEvidenceMaterial.map((m) => m.evidenceRef),
    }));

  const rawEvState = {
    evidenceStateRef: "",
    evidenceRequirementBindings,
    suppliedEvidenceMaterial,
    evidencePresentationBindings,
    integrityCoordinates,
  };

  const evRes = deriveEvidenceStateRefV2(rawEvState);
  if (!evRes.ok) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "EVIDENCE_STATE_DERIVATION_FAILED",
        message: `Failed to derive evidenceStateRef: ${evRes.error.message}`,
      },
    };
  }

  const evidenceState: BoundEvidenceStateV2 = {
    evidenceStateRef: evRes.value,
    evidenceRequirementBindings,
    suppliedEvidenceMaterial,
    evidencePresentationBindings,
    integrityCoordinates,
  };

  const esCheck = verifyEvidenceStateRefV2(evidenceState);
  if (!esCheck.ok) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "EVIDENCE_STATE_VERIFICATION_FAILED",
        message: `Evidence state verification failed: ${esCheck.error.message}`,
      },
    };
  }

  // Adapt BoundPolicyUniverseV2
  const applicablePolicyMaterial: BoundPolicyMaterialV2[] = (
    composition.policyContext?.policies || []
  ).map((polRecord) => ({
    policyKey: `pol_mat:${polRecord.policyId}`,
    policyRef: {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:pol:v1",
      artifactId: polRecord.policyId,
      version: polRecord.version,
      stateRef: `state:pol:${polRecord.policyId}`,
      provenanceRef: `prov:pol:${polRecord.policyId}`,
    },
    material: polRecord.definition as JsonValueV2,
  }));

  const dependencyEdges: PolicyDependencyEdgeV2[] = (
    composition.resolvedPolicyGraph?.edges || []
  ).map((edge) => ({
    dependeePolicyRef: {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:pol:v1",
      artifactId: edge.dependeeId,
      version: "1.0.0",
      stateRef: `state:pol:${edge.dependeeId}`,
      provenanceRef: `prov:pol:${edge.dependeeId}`,
    },
    dependentPolicyRef: {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:pol:v1",
      artifactId: edge.dependentId,
      version: "1.0.0",
      stateRef: `state:pol:${edge.dependentId}`,
      provenanceRef: `prov:pol:${edge.dependentId}`,
    },
  }));

  const rawPolUniverse = {
    policyUniverseRef: "",
    applicablePolicyMaterial,
    dependencyTopology: { dependencyEdges },
    applicabilityProvenanceBinding: {
      family: "PROVENANCE" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "policy-provenance-v1",
    },
  };

  const polRes = derivePolicyUniverseRefV2(rawPolUniverse);
  if (!polRes.ok) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "POLICY_UNIVERSE_DERIVATION_FAILED",
        message: `Failed to derive policyUniverseRef: ${polRes.error.message}`,
      },
    };
  }

  const policyUniverse: BoundPolicyUniverseV2 = {
    policyUniverseRef: polRes.value,
    applicablePolicyMaterial,
    dependencyTopology: { dependencyEdges },
    applicabilityProvenanceBinding: {
      family: "PROVENANCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "policy-provenance-v1",
    },
  };

  const puCheck = verifyPolicyUniverseRefV2(policyUniverse);
  if (!puCheck.ok) {
    return {
      ok: false,
      stage: "V2_ADAPTER",
      error: {
        code: "POLICY_UNIVERSE_VERIFICATION_FAILED",
        message: `Policy universe verification failed: ${puCheck.error.message}`,
      },
    };
  }

  // ExecutionContextV2
  const executionContext: ExecutionContextV2 = {
    executionId: composition.executionId,
    temporalCoordinates: {
      tValid: evaluationCoordinate.temporalCoordinates.tValid,
      tObservation: evaluationCoordinate.temporalCoordinates.tObservation,
      tEInput: tEInput,
    },
    budget: composition.budget,
    entropy: composition.entropy,
  };

  // 4. STAGE: SEC
  const secRes = produceSecTrustResultV2({
    evidenceState,
    tEInput,
  });

  if (!secRes.ok) {
    return {
      ok: false,
      stage: "SEC",
      error: {
        code: secRes.error.code,
        message: secRes.error.message,
      },
    };
  }

  const secTrustResult = secRes.determination;

  // 5. STAGE: POL_AGGREGATE
  const aggRes = producePolAggregatePolicyResultV2({
    policyUniverse,
    requestedAction,
    evidenceState,
    tEInput,
    secTrustResult,
  });

  if (!aggRes.ok) {
    return {
      ok: false,
      stage: "POL_AGGREGATE",
      error: {
        code: aggRes.error.code,
        message: aggRes.error.message,
      },
    };
  }

  const policyAggregate = aggRes.determination;

  // 6. STAGE: POL_AUTHORIZATION
  const authRes = producePolAuthorizationV2({
    policyUniverse,
    requestedAction,
    participation,
    constitutionalState,
    evidenceState,
    tEInput,
    policyAggregate,
    secTrustResult,
  });

  if (!authRes.ok) {
    return {
      ok: false,
      stage: "POL_AUTHORIZATION",
      error: {
        code: authRes.error.code,
        message: authRes.error.message,
      },
    };
  }

  const authorization = authRes.determination;

  // 7. STAGE: V2_MATERIALIZATION
  const ownerDeterminationBindings: readonly OwnerDeterminationBindingV2[] = [
    policyAggregate,
    authorization,
    secTrustResult,
  ];

  const evaluationContext: BoundEvaluationContextV2 = {
    authorizedInputBindings: [],
    evaluationParameterBindings: [],
    boundContextBindings: [],
    ownerDeterminationBindings,
  };

  const matRes = materializeExecutionRequestV2({
    requestId: composition.requestId,
    participation,
    intent,
    requestedAction,
    constitutionalState,
    evidenceState,
    policyUniverse,
    evaluationContext,
    executionContext,
  });

  if (!matRes.ok) {
    return {
      ok: false,
      stage: "V2_MATERIALIZATION",
      error: {
        code: matRes.error.code,
        message: matRes.error.message,
      },
    };
  }

  const executionRequest = matRes.executionRequest;
  const wholeRequestDigestCandidate = matRes.wholeRequestDigestCandidate;

  // 8. STAGE: RI (Receipt V2)
  let riRes: ReturnType<typeof materializeExecutionReceiptV2>;
  try {
    riRes = materializeExecutionReceiptV2(executionRequest);
  } catch (e) {
    return {
      ok: false,
      stage: "RI",
      error: {
        code: "RI_EXECUTION_EXCEPTIONAL",
        message: `Upstream RI execution threw exception: ${e instanceof Error ? e.message : String(e)}`,
      },
    };
  }

  if (!riRes.ok) {
    const stageStr = "stage" in riRes ? String(riRes.stage) : "";
    const errObj =
      "error" in riRes && riRes.error && typeof riRes.error === "object"
        ? riRes.error
        : null;
    const errCodeStr = errObj && "code" in errObj ? String(errObj.code) : "";
    const errMsgStr =
      errObj && "message" in errObj
        ? String(errObj.message)
        : "RI execution failed.";

    const details = [stageStr, errCodeStr].filter(Boolean).join("/");
    return {
      ok: false,
      stage: "RI",
      error: {
        code: details || "RI_EXECUTION_FAILED",
        message: errMsgStr,
      },
    };
  }

  const receiptFrame = riRes.frame;
  const outcomeFrame = receiptFrame.executabilityOutcomeFrame;
  const executability = outcomeFrame.executability as unknown as JsonValueV2;
  const outcome = outcomeFrame.outcome as unknown as JsonValueV2;
  const executionReceipt = receiptFrame.executionReceipt;

  // 9. STAGE: PRJ (Governed Reality-View Projection Materialization)
  const prjRes = materializePrjProjectionV2({
    executionRequest,
    realityView,
    boundSpecification: projectionSpecification,
  });

  if (!prjRes.ok) {
    return {
      ok: false,
      stage: "PRJ",
      error: {
        code: prjRes.error.code,
        message: prjRes.error.message,
      },
    };
  }

  const projection = prjRes.projection;

  // H20: Verify RI / PRJ Deterministic Continuity
  if (
    projection.sourceExecution.requestId !== executionRequest.requestId ||
    projection.sourceExecution.executionId !== executionReceipt.executionId ||
    projection.sourceExecution.receiptId !== executionReceipt.receiptId ||
    projection.sourceExecution.inputHash !== executionReceipt.inputHash ||
    projection.sourceExecution.deterministicHash !==
      executionReceipt.deterministicHash
  ) {
    return {
      ok: false,
      stage: "PRJ",
      error: {
        code: "RI_PRJ_CONTINUITY_MISMATCH",
        message:
          "RI execution receipt coordinates do not match PRJ projection source execution coordinates.",
      },
    };
  }

  // 10. STAGE: PROVENANCE (V2 Application Provenance Envelope)
  const pinnedRefStr =
    evaluationCoordinate.pinnedSemanticStateRef.digest ||
    evaluationCoordinate.pinnedSemanticStateRef.ref;

  const provenancePreimage = {
    version: "AMS-0861-C-PROVENANCE-V2-01" as const,
    packetB: {
      manifestId: manifest.manifestId,
      payloadId: boundPayload.payloadId,
      sccId,
      bcgId,
      pinnedSemanticStateRef: pinnedRefStr,
      tValid: evaluationCoordinate.temporalCoordinates.tValid,
      tObservation: evaluationCoordinate.temporalCoordinates.tObservation,
      tEInput,
    },
    request: {
      requestId: executionRequest.requestId,
      executionId: executionRequest.executionContext.executionId,
      wholeRequestDigestCandidate,
    },
    ownerDeterminations: {
      secTrustBindingKey: secTrustResult.determinationBindingKey,
      policyAggregateBindingKey: policyAggregate.determinationBindingKey,
      authorizationBindingKey: authorization.determinationBindingKey,
    },
    receipt: {
      receiptId: executionReceipt.receiptId,
      inputHash: executionReceipt.inputHash,
      outputHash: executionReceipt.outputHash,
      evidenceHash: executionReceipt.evidenceHash,
      policyVersion: executionReceipt.policyVersion,
      deterministicHash: executionReceipt.deterministicHash,
      executionTime: executionReceipt.executionTime,
    },
    projection: {
      projectionId: projection.projectionId,
      sourceZid: projection.sourceZid,
      realityDigest: realityView.realityDigest,
      specificationDigest: projectionSpecification.specificationDigest,
      provenanceHash: projection.derivationProof.provenanceHash,
    },
  };

  const provCanon = safeCanonicalizeJcs(provenancePreimage);
  if (!provCanon.ok) {
    return {
      ok: false,
      stage: "PROVENANCE",
      error: {
        code: "PROVENANCE_CANONICALIZATION_FAILED",
        message: `Failed to canonicalize provenance preimage: ${provCanon.error}`,
      },
    };
  }

  const provenanceHash = `sha256:${computeSha256Hex(provCanon.value)}`;

  const provenanceEnvelope: AMS0861CV2ProvenanceEnvelope = {
    ...provenancePreimage,
    provenanceHash,
  };

  // 11. STAGE: GS1_INTERPRETATION
  const domainResult: GS1DomainInterpretation = {
    domain: "GS1",
    normalizedCarrier: anchor.normalizedCarrier,
    canonicalExternalIdentifier: anchor.normalizedCarrier.k1,
    sourceZid: canonicalZid,
    projectedRepresentation: projection.output,
  };

  const successResult: GS1NativeV2PacketCResult = {
    ok: true,
    packetB: {
      manifest,
      sccId,
      bcgId,
      evaluationCoordinate,
    },
    executionRequest,
    ownerDeterminations: {
      secTrustResult,
      policyAggregate,
      authorization,
    },
    ri: {
      executability,
      outcome,
      executionReceipt,
    },
    projection,
    provenance: provenanceEnvelope,
    domainResult,
  };

  return deepFreeze(successResult);
}
