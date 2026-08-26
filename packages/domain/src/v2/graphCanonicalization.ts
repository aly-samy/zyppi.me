import {
  canonicalizeJcsV2,
  compareUtf8Bytes,
  makeIdentityFailure,
  type V2IdentityResult,
} from "./canonical.js";
import type {
  ActionPerformerBindingV2,
  BoundConstitutionalStateV2,
  BoundEvaluationContextV2,
  BoundEvidenceStateV2,
  BoundPolicyMaterialV2,
  BoundPolicyUniverseV2,
  EvaluationContextBindingV2,
  EvidencePresentationBindingV2,
  EvidenceRequirementBindingV2,
  ExecutionRequestV2,
  IntegrityCoordinatesV2,
  OwnerDeterminationBindingV2,
  ParticipationV2,
  PolicyDependencyEdgeV2,
  QuestionOperandBindingV2,
  RequestedActionBindingV2,
  RequestedCapabilityClaimBindingV2,
  StateViewV2,
  SuppliedEvidenceMaterialV2,
} from "./types.js";

export type ReferencedLocalLabelNamespace =
  | "ROLE_BINDING"
  | "AGENCY_BINDING"
  | "PERFORMER"
  | "CAPABILITY_CLAIM"
  | "AUTHORIZED_INPUT"
  | "EVALUATION_PARAMETER"
  | "BOUND_CONTEXT"
  | "OWNER_DETERMINATION";

/**
 * Sorts an array of semantically unordered members by their JCS representation's UTF-8 bytes.
 * Rejects semantic duplicates where two members normalize to identical JCS representations.
 */
export function sortAndCheckDuplicates<T>(
  items: readonly T[],
  path: string,
  allowDuplicates = false,
): V2IdentityResult<readonly T[]> {
  if (items.length <= 1) {
    return { ok: true, value: items };
  }

  const serialized: { item: T; jcs: string }[] = [];
  for (let i = 0; i < items.length; i++) {
    const res = canonicalizeJcsV2(items[i]);
    if (!res.ok) {
      return res;
    }
    serialized.push({ item: items[i], jcs: res.value });
  }

  serialized.sort((a, b) => compareUtf8Bytes(a.jcs, b.jcs));

  if (!allowDuplicates) {
    for (let i = 1; i < serialized.length; i++) {
      if (serialized[i].jcs === serialized[i - 1].jcs) {
        return makeIdentityFailure(
          "SEMANTIC_DUPLICATE",
          `Semantic duplicate detected in collection at path '${path}'`,
          path,
        );
      }
    }
  }

  return { ok: true, value: serialized.map((s) => s.item) };
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T;
  }
  const copy: Record<string, unknown> = {};
  for (const key of Object.keys(obj as object)) {
    copy[key] = deepClone((obj as Record<string, unknown>)[key]);
  }
  return copy as T;
}

/**
 * C08: Individualization & Partition Refinement Graph Canonicalization Algorithm.
 * Replaces eager permutations and full Cartesian products with branch-and-bound pruning.
 */
function canonicalizeReferencedNamespace<T>(
  contextObj: T,
  namespace: ReferencedLocalLabelNamespace,
  extractKeys: (c: T) => {
    defined: readonly string[];
    referenced: readonly string[];
  },
  substitute: (c: T, map: ReadonlyMap<string, string>) => T,
): V2IdentityResult<T> {
  const { defined, referenced } = extractKeys(contextObj);
  if (defined.length === 0) return { ok: true, value: contextObj };

  // Check for dangling references
  for (const ref of referenced) {
    if (!defined.includes(ref)) {
      return makeIdentityFailure(
        "GRAPH_CANONICALIZATION_FAILURE",
        `Dangling local label reference '${ref}' in namespace '${namespace}'`,
      );
    }
  }

  let bestResultJcs: string | null = null;
  let bestResultObj: T | null = null;

  function exploreIndividualizations(
    remainingLabels: readonly string[],
    currentAssignedMap: ReadonlyMap<string, string>,
  ): V2IdentityResult<void> {
    if (remainingLabels.length === 0) {
      const candidateObj = substitute(contextObj, currentAssignedMap);
      const jcsRes = canonicalizeJcsV2(candidateObj);
      if (!jcsRes.ok) return jcsRes;

      if (
        bestResultJcs === null ||
        compareUtf8Bytes(jcsRes.value, bestResultJcs) < 0
      ) {
        bestResultJcs = jcsRes.value;
        bestResultObj = candidateObj;
      }
      return { ok: true, value: undefined };
    }

    // Partition remaining labels into equivalence classes using 1-refinement target signatures
    const signatures: { label: string; sig: string }[] = [];
    for (const lbl of remainingLabels) {
      const tempMap = new Map(currentAssignedMap);
      tempMap.set(lbl, "__TARGET__");
      for (const other of remainingLabels) {
        if (other !== lbl) {
          tempMap.set(other, "__OTHER__");
        }
      }
      const tempObj = substitute(contextObj, tempMap);
      const jcsRes = canonicalizeJcsV2(tempObj);
      if (!jcsRes.ok) return jcsRes;
      signatures.push({ label: lbl, sig: jcsRes.value });
    }

    signatures.sort((a, b) => compareUtf8Bytes(a.sig, b.sig));

    // Group into equivalence buckets
    const buckets: string[][] = [];
    let currentBucket: string[] = [];
    let currentSig = "";

    for (const item of signatures) {
      if (currentBucket.length === 0 || item.sig === currentSig) {
        currentBucket.push(item.label);
        currentSig = item.sig;
      } else {
        buckets.push(currentBucket);
        currentBucket = [item.label];
        currentSig = item.sig;
      }
    }
    if (currentBucket.length > 0) buckets.push(currentBucket);

    // Pick the first bucket for individualization
    const targetBucket = buckets[0];
    for (const candidateLbl of targetBucket) {
      const nextMap = new Map(currentAssignedMap);
      const assignedIndex = currentAssignedMap.size;
      nextMap.set(candidateLbl, `${namespace}#${assignedIndex}`);

      const nextRemaining = remainingLabels.filter((l) => l !== candidateLbl);
      const res = exploreIndividualizations(nextRemaining, nextMap);
      if (!res.ok) return res;
    }

    return { ok: true, value: undefined };
  }

  const exploreRes = exploreIndividualizations(defined, new Map());
  if (!exploreRes.ok) return exploreRes;

  if (!bestResultObj) {
    return makeIdentityFailure(
      "GRAPH_CANONICALIZATION_FAILURE",
      `Failed to canonicalize namespace '${namespace}'`,
    );
  }

  return { ok: true, value: bestResultObj };
}

/**
 * C05: Constitutional State Identity Projection.
 * Omits unreferenced incidental keys (viewKey, stateBindingKey) from normalized identity projection.
 */
export function canonicalizeConstitutionalStateComponentV2(
  state: BoundConstitutionalStateV2,
): V2IdentityResult<Omit<BoundConstitutionalStateV2, "semanticStateRef">> {
  const current = deepClone(state);

  // Map stateViews omitting viewKey and stateBindingKey from each projection
  const projectedViews = [];
  for (const sv of current.stateViews) {
    const projectedBindings = [];
    for (const sb of sv.stateBindings) {
      const sbProj = { ...(sb as unknown as Record<string, unknown>) };
      delete sbProj.stateBindingKey;
      projectedBindings.push(sbProj);
    }

    // Sort bindings within view by JCS byte order & check duplicates
    const resBindings = sortAndCheckDuplicates(
      projectedBindings,
      "stateView.stateBindings",
      false,
    );
    if (!resBindings.ok) return resBindings;

    const svProj = { ...(sv as unknown as Record<string, unknown>) };
    delete svProj.viewKey;
    delete svProj.stateBindings;
    projectedViews.push({
      ...svProj,
      stateBindings: resBindings.value,
    });
  }

  // Sort stateViews by JCS byte order & check duplicates
  const resViews = sortAndCheckDuplicates(
    projectedViews,
    "constitutionalState.stateViews",
    false,
  );
  if (!resViews.ok) return resViews;

  return {
    ok: true,
    value: {
      stateViews: resViews.value as unknown as readonly StateViewV2[],
    },
  };
}

/**
 * C05: Evidence State Identity Projection.
 * Omits unreferenced incidental keys (requirementKey, materialKey, coordinateKey) from normalized identity projection.
 */
export function canonicalizeEvidenceStateComponentV2(
  state: BoundEvidenceStateV2,
): V2IdentityResult<Omit<BoundEvidenceStateV2, "evidenceStateRef">> {
  const current = deepClone(state);

  // 1. Evidence Requirement Bindings (omit requirementKey)
  const projReqBindings = current.evidenceRequirementBindings.map((b) => {
    const proj = { ...(b as unknown as Record<string, unknown>) };
    delete proj.requirementKey;
    return proj;
  });
  const resReqBindings = sortAndCheckDuplicates(
    projReqBindings,
    "evidenceState.evidenceRequirementBindings",
    false,
  );
  if (!resReqBindings.ok) return resReqBindings;

  // 2. Supplied Evidence Material (omit materialKey)
  const projSuppliedMat = current.suppliedEvidenceMaterial.map((m) => {
    const proj = { ...(m as unknown as Record<string, unknown>) };
    delete proj.materialKey;
    return proj;
  });
  const resSuppliedMat = sortAndCheckDuplicates(
    projSuppliedMat,
    "evidenceState.suppliedEvidenceMaterial",
    false,
  );
  if (!resSuppliedMat.ok) return resSuppliedMat;

  // 3. Evidence Presentation Bindings
  const sortedPresBindings = [];
  for (const epb of current.evidencePresentationBindings) {
    const resPresRefs = sortAndCheckDuplicates(
      epb.presentedEvidenceRefs,
      "evidencePresentationBinding.presentedEvidenceRefs",
      false,
    );
    if (!resPresRefs.ok) return resPresRefs;
    sortedPresBindings.push({
      ...epb,
      presentedEvidenceRefs: resPresRefs.value,
    });
  }
  const resPresBindings = sortAndCheckDuplicates(
    sortedPresBindings,
    "evidenceState.evidencePresentationBindings",
    false,
  );
  if (!resPresBindings.ok) return resPresBindings;

  // 4. Integrity Coordinates (omit coordinateKey)
  const projIntegCoords = current.integrityCoordinates.map((c) => {
    const proj = { ...(c as unknown as Record<string, unknown>) };
    delete proj.coordinateKey;
    return proj;
  });
  const resIntegCoords = sortAndCheckDuplicates(
    projIntegCoords,
    "evidenceState.integrityCoordinates",
    false,
  );
  if (!resIntegCoords.ok) return resIntegCoords;

  return {
    ok: true,
    value: {
      evidenceRequirementBindings:
        resReqBindings.value as unknown as readonly EvidenceRequirementBindingV2[],
      suppliedEvidenceMaterial:
        resSuppliedMat.value as unknown as readonly SuppliedEvidenceMaterialV2[],
      evidencePresentationBindings:
        resPresBindings.value as unknown as readonly EvidencePresentationBindingV2[],
      integrityCoordinates:
        resIntegCoords.value as unknown as readonly IntegrityCoordinatesV2[],
    },
  };
}

/**
 * C05: Policy Universe Identity Projection.
 * Omits unreferenced incidental keys (policyKey) from normalized identity projection.
 */
export function canonicalizePolicyUniverseComponentV2(
  universe: BoundPolicyUniverseV2,
): V2IdentityResult<Omit<BoundPolicyUniverseV2, "policyUniverseRef">> {
  const current = deepClone(universe);

  // 1. Applicable Policy Material (omit policyKey)
  const projPolicyMat = current.applicablePolicyMaterial.map((m) => {
    const proj = { ...(m as unknown as Record<string, unknown>) };
    delete proj.policyKey;
    return proj;
  });
  const resPolicyMat = sortAndCheckDuplicates(
    projPolicyMat,
    "policyUniverse.applicablePolicyMaterial",
    false,
  );
  if (!resPolicyMat.ok) return resPolicyMat;

  // 2. Dependency Topology Edges
  const resEdges = sortAndCheckDuplicates(
    current.dependencyTopology.dependencyEdges,
    "policyUniverse.dependencyTopology.dependencyEdges",
    false,
  );
  if (!resEdges.ok) return resEdges;

  return {
    ok: true,
    value: {
      applicablePolicyMaterial:
        resPolicyMat.value as unknown as readonly BoundPolicyMaterialV2[],
      dependencyTopology: {
        dependencyEdges: resEdges.value as readonly PolicyDependencyEdgeV2[],
      },
      applicabilityProvenanceBinding: current.applicabilityProvenanceBinding,
    },
  };
}

/**
 * Substitutes labels in a referenced namespace across an ExecutionRequestV2 object.
 */
function substituteNamespaceLabels(
  req: ExecutionRequestV2,
  namespace: ReferencedLocalLabelNamespace,
  mapping: ReadonlyMap<string, string>,
): ExecutionRequestV2 {
  const mapLabel = (lbl: string | undefined): string => {
    if (!lbl) return lbl as string;
    return mapping.get(lbl) ?? lbl;
  };

  const cloned = deepClone(req);

  switch (namespace) {
    case "ROLE_BINDING": {
      for (const rb of cloned.participation.roleBindings) {
        (rb as { roleBindingKey: string }).roleBindingKey = mapLabel(
          rb.roleBindingKey,
        );
      }
      for (const ab of cloned.participation.agencyBindings) {
        (ab as { actorRoleBindingRef: string }).actorRoleBindingRef = mapLabel(
          ab.actorRoleBindingRef,
        );
        (
          ab as { governedSubjectRoleBindingRef: string }
        ).governedSubjectRoleBindingRef = mapLabel(
          ab.governedSubjectRoleBindingRef,
        );
      }
      if (cloned.intent) {
        (
          cloned.intent as { originatorParticipationRef: string }
        ).originatorParticipationRef = mapLabel(
          cloned.intent.originatorParticipationRef,
        );
      }
      for (const ap of cloned.requestedAction.actionPerformerBindings) {
        (ap as { actorParticipationRef: string }).actorParticipationRef =
          mapLabel(ap.actorParticipationRef);
      }
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "PARTICIPATION_BINDING") {
            (op as { roleBindingRef: string }).roleBindingRef = mapLabel(
              op.roleBindingRef,
            );
          }
        }
      }
      break;
    }

    case "AGENCY_BINDING": {
      for (const ab of cloned.participation.agencyBindings) {
        (ab as { agencyBindingKey: string }).agencyBindingKey = mapLabel(
          ab.agencyBindingKey,
        );
      }
      for (const ap of cloned.requestedAction.actionPerformerBindings) {
        if (ap.agencyReliance.kind === "DELEGATED_AGENCY_SINGLE") {
          (ap.agencyReliance as { agencyBindingRef: string }).agencyBindingRef =
            mapLabel(ap.agencyReliance.agencyBindingRef);
        } else if (ap.agencyReliance.kind === "DELEGATED_AGENCY_COMPOSED") {
          (
            ap.agencyReliance as { agencyBindingRefs: readonly string[] }
          ).agencyBindingRefs =
            ap.agencyReliance.agencyBindingRefs.map(mapLabel);
        }
      }
      break;
    }

    case "PERFORMER": {
      for (const ap of cloned.requestedAction.actionPerformerBindings) {
        (ap as { performerKey: string }).performerKey = mapLabel(
          ap.performerKey,
        );
      }
      for (const rc of cloned.requestedAction
        .requestedCapabilityClaimBindings) {
        (
          rc as { claimantPerformerRefs: readonly string[] }
        ).claimantPerformerRefs = rc.claimantPerformerRefs.map(mapLabel);
      }
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "ACTION_PERFORMER") {
            (op as { performerRef: string }).performerRef = mapLabel(
              op.performerRef,
            );
          }
        }
      }
      break;
    }

    case "CAPABILITY_CLAIM": {
      for (const rc of cloned.requestedAction
        .requestedCapabilityClaimBindings) {
        (rc as { capabilityClaimKey: string }).capabilityClaimKey = mapLabel(
          rc.capabilityClaimKey,
        );
      }
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "CAPABILITY_CLAIM") {
            (op as { capabilityClaimRef: string }).capabilityClaimRef =
              mapLabel(op.capabilityClaimRef);
          }
        }
      }
      break;
    }

    case "AUTHORIZED_INPUT": {
      for (const b of cloned.evaluationContext.authorizedInputBindings) {
        (b as { bindingKey: string }).bindingKey = mapLabel(b.bindingKey);
      }
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (
            op.operandKind === "EVALUATION_CONTEXT_BINDING" &&
            op.bindingCollection === "AUTHORIZED_INPUT"
          ) {
            (op as { bindingRef: string }).bindingRef = mapLabel(op.bindingRef);
          }
        }
      }
      break;
    }

    case "EVALUATION_PARAMETER": {
      for (const b of cloned.evaluationContext.evaluationParameterBindings) {
        (b as { bindingKey: string }).bindingKey = mapLabel(b.bindingKey);
      }
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (
            op.operandKind === "EVALUATION_CONTEXT_BINDING" &&
            op.bindingCollection === "EVALUATION_PARAMETER"
          ) {
            (op as { bindingRef: string }).bindingRef = mapLabel(op.bindingRef);
          }
        }
      }
      break;
    }

    case "BOUND_CONTEXT": {
      for (const b of cloned.evaluationContext.boundContextBindings) {
        (b as { bindingKey: string }).bindingKey = mapLabel(b.bindingKey);
      }
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (
            op.operandKind === "EVALUATION_CONTEXT_BINDING" &&
            op.bindingCollection === "BOUND_CONTEXT"
          ) {
            (op as { bindingRef: string }).bindingRef = mapLabel(op.bindingRef);
          }
        }
      }
      break;
    }

    case "OWNER_DETERMINATION": {
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        (od as { determinationBindingKey: string }).determinationBindingKey =
          mapLabel(od.determinationBindingKey);
        if (od.determinationDependencyDeclaration.kind === "EXPLICIT") {
          (
            od.determinationDependencyDeclaration as {
              dependencyRefs: readonly string[];
            }
          ).dependencyRefs =
            od.determinationDependencyDeclaration.dependencyRefs.map(mapLabel);
        }
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "OWNER_DETERMINATION") {
            (
              op as { ownerDeterminationBindingRef: string }
            ).ownerDeterminationBindingRef = mapLabel(
              op.ownerDeterminationBindingRef,
            );
          }
        }
      }
      if (
        cloned.requestedAction.intentActionCompatibilityBinding.kind ===
        "OWNER_DETERMINATION"
      ) {
        (
          cloned.requestedAction.intentActionCompatibilityBinding as {
            ownerDeterminationBindingRef: string;
          }
        ).ownerDeterminationBindingRef = mapLabel(
          cloned.requestedAction.intentActionCompatibilityBinding
            .ownerDeterminationBindingRef,
        );
      }
      break;
    }
  }

  return cloned;
}

/**
 * Extracts defined keys and referenced keys for a given namespace and validates absence of dangling references.
 */
function extractAndValidateNamespaceKeys(
  req: ExecutionRequestV2,
  namespace: ReferencedLocalLabelNamespace,
): V2IdentityResult<{
  defined: readonly string[];
  referenced: readonly string[];
}> {
  const defined = new Set<string>();
  const referenced = new Set<string>();

  switch (namespace) {
    case "ROLE_BINDING": {
      for (const rb of req.participation.roleBindings) {
        defined.add(rb.roleBindingKey);
      }
      for (const ab of req.participation.agencyBindings) {
        referenced.add(ab.actorRoleBindingRef);
        referenced.add(ab.governedSubjectRoleBindingRef);
      }
      if (req.intent) {
        referenced.add(req.intent.originatorParticipationRef);
      }
      for (const ap of req.requestedAction.actionPerformerBindings) {
        referenced.add(ap.actorParticipationRef);
      }
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "PARTICIPATION_BINDING") {
            referenced.add(op.roleBindingRef);
          }
        }
      }
      break;
    }

    case "AGENCY_BINDING": {
      for (const ab of req.participation.agencyBindings) {
        defined.add(ab.agencyBindingKey);
      }
      for (const ap of req.requestedAction.actionPerformerBindings) {
        if (ap.agencyReliance.kind === "DELEGATED_AGENCY_SINGLE") {
          referenced.add(ap.agencyReliance.agencyBindingRef);
        } else if (ap.agencyReliance.kind === "DELEGATED_AGENCY_COMPOSED") {
          for (const ref of ap.agencyReliance.agencyBindingRefs) {
            referenced.add(ref);
          }
        }
      }
      break;
    }

    case "PERFORMER": {
      for (const ap of req.requestedAction.actionPerformerBindings) {
        defined.add(ap.performerKey);
      }
      for (const rc of req.requestedAction.requestedCapabilityClaimBindings) {
        for (const ref of rc.claimantPerformerRefs) {
          referenced.add(ref);
        }
      }
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "ACTION_PERFORMER") {
            referenced.add(op.performerRef);
          }
        }
      }
      break;
    }

    case "CAPABILITY_CLAIM": {
      for (const rc of req.requestedAction.requestedCapabilityClaimBindings) {
        defined.add(rc.capabilityClaimKey);
      }
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "CAPABILITY_CLAIM") {
            referenced.add(op.capabilityClaimRef);
          }
        }
      }
      break;
    }

    case "AUTHORIZED_INPUT": {
      for (const b of req.evaluationContext.authorizedInputBindings) {
        defined.add(b.bindingKey);
      }
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (
            op.operandKind === "EVALUATION_CONTEXT_BINDING" &&
            op.bindingCollection === "AUTHORIZED_INPUT"
          ) {
            referenced.add(op.bindingRef);
          }
        }
      }
      break;
    }

    case "EVALUATION_PARAMETER": {
      for (const b of req.evaluationContext.evaluationParameterBindings) {
        defined.add(b.bindingKey);
      }
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (
            op.operandKind === "EVALUATION_CONTEXT_BINDING" &&
            op.bindingCollection === "EVALUATION_PARAMETER"
          ) {
            referenced.add(op.bindingRef);
          }
        }
      }
      break;
    }

    case "BOUND_CONTEXT": {
      for (const b of req.evaluationContext.boundContextBindings) {
        defined.add(b.bindingKey);
      }
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (
            op.operandKind === "EVALUATION_CONTEXT_BINDING" &&
            op.bindingCollection === "BOUND_CONTEXT"
          ) {
            referenced.add(op.bindingRef);
          }
        }
      }
      break;
    }

    case "OWNER_DETERMINATION": {
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        defined.add(od.determinationBindingKey);
        if (od.determinationDependencyDeclaration.kind === "EXPLICIT") {
          for (const ref of od.determinationDependencyDeclaration
            .dependencyRefs) {
            referenced.add(ref);
          }
        }
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "OWNER_DETERMINATION") {
            referenced.add(op.ownerDeterminationBindingRef);
          }
        }
      }
      if (
        req.requestedAction.intentActionCompatibilityBinding.kind ===
        "OWNER_DETERMINATION"
      ) {
        referenced.add(
          req.requestedAction.intentActionCompatibilityBinding
            .ownerDeterminationBindingRef,
        );
      }
      break;
    }
  }

  for (const ref of referenced) {
    if (!defined.has(ref)) {
      return makeIdentityFailure(
        "GRAPH_CANONICALIZATION_FAILURE",
        `Dangling local label reference '${ref}' in namespace '${namespace}'`,
      );
    }
  }

  return {
    ok: true,
    value: {
      defined: Array.from(defined),
      referenced: Array.from(referenced),
    },
  };
}

/**
 * Topologically ordered referenced namespaces for deterministic local-label canonicalization.
 */
const REFERENCED_NAMESPACE_ORDER: readonly ReferencedLocalLabelNamespace[] = [
  "ROLE_BINDING",
  "AGENCY_BINDING",
  "PERFORMER",
  "CAPABILITY_CLAIM",
  "AUTHORIZED_INPUT",
  "EVALUATION_PARAMETER",
  "BOUND_CONTEXT",
  "OWNER_DETERMINATION",
];

/**
 * Fully canonicalizes an ExecutionRequestV2 request structure:
 * 1. Sequentially canonicalizes referenced local labels across all 8 referenced namespaces using DFS individualization-refinement.
 * 2. Omits unreferenced incidental keys and projects normalized structures.
 * 3. Sorts all semantically unordered collections by JCS UTF-8 byte ordering.
 * 4. Rejects any semantic duplicates.
 */
export function canonicalizeGraphAndCollectionsV2(
  req: ExecutionRequestV2,
): V2IdentityResult<ExecutionRequestV2> {
  let currentReq = req;

  // Step 1: Canonicalize referenced local labels per namespace
  for (const ns of REFERENCED_NAMESPACE_ORDER) {
    const res = canonicalizeReferencedNamespace(
      currentReq,
      ns,
      (r) => {
        const valRes = extractAndValidateNamespaceKeys(r, ns);
        return valRes.ok ? valRes.value : { defined: [], referenced: [] };
      },
      (r, map) => substituteNamespaceLabels(r, ns, map),
    );
    if (!res.ok) {
      return res;
    }
    currentReq = res.value;
  }

  // Step 2: Sort semantically unordered collections & check duplicates
  return sortRequestCollections(currentReq);
}

/**
 * Sorts all semantically unordered collections in an ExecutionRequestV2 and validates duplicate rejection rules.
 */
function sortRequestCollections(
  req: ExecutionRequestV2,
): V2IdentityResult<ExecutionRequestV2> {
  // 1. Participation
  const sortedRoleBindings = sortAndCheckDuplicates(
    req.participation.roleBindings,
    "participation.roleBindings",
    true,
  );
  if (!sortedRoleBindings.ok) return sortedRoleBindings;

  const sortedAgencyBindings = sortAndCheckDuplicates(
    req.participation.agencyBindings,
    "participation.agencyBindings",
    false,
  );
  if (!sortedAgencyBindings.ok) return sortedAgencyBindings;

  const participation: ParticipationV2 = {
    roleBindings: sortedRoleBindings.value,
    agencyBindings: sortedAgencyBindings.value,
  };

  // 2. Requested Action
  const sortedPerformers: ActionPerformerBindingV2[] = [];
  for (const ap of req.requestedAction.actionPerformerBindings) {
    let sortedReliance = ap.agencyReliance;
    if (ap.agencyReliance.kind === "DELEGATED_AGENCY_COMPOSED") {
      const sortedRefs = sortAndCheckDuplicates(
        ap.agencyReliance.agencyBindingRefs,
        "actionPerformerBinding.agencyReliance.agencyBindingRefs",
        false,
      );
      if (!sortedRefs.ok) return sortedRefs;
      sortedReliance = {
        ...ap.agencyReliance,
        agencyBindingRefs: sortedRefs.value,
      };
    }
    sortedPerformers.push({
      ...ap,
      agencyReliance: sortedReliance,
    });
  }
  const resPerformers = sortAndCheckDuplicates(
    sortedPerformers,
    "requestedAction.actionPerformerBindings",
    false,
  );
  if (!resPerformers.ok) return resPerformers;

  const resTargets = sortAndCheckDuplicates(
    req.requestedAction.actionTargetBindings,
    "requestedAction.actionTargetBindings",
    false,
  );
  if (!resTargets.ok) return resTargets;

  const sortedCapClaims: RequestedCapabilityClaimBindingV2[] = [];
  for (const rc of req.requestedAction.requestedCapabilityClaimBindings) {
    const sortedPerformers = sortAndCheckDuplicates(
      rc.claimantPerformerRefs,
      "requestedCapabilityClaimBinding.claimantPerformerRefs",
      false,
    );
    if (!sortedPerformers.ok) return sortedPerformers;
    sortedCapClaims.push({
      ...rc,
      claimantPerformerRefs: sortedPerformers.value,
    });
  }
  const resCapClaims = sortAndCheckDuplicates(
    sortedCapClaims,
    "requestedAction.requestedCapabilityClaimBindings",
    false,
  );
  if (!resCapClaims.ok) return resCapClaims;

  const requestedAction: RequestedActionBindingV2 = {
    ...req.requestedAction,
    actionPerformerBindings: resPerformers.value,
    actionTargetBindings: resTargets.value,
    requestedCapabilityClaimBindings: resCapClaims.value,
  };

  // 3. Bound Constitutional State
  const canonStateRes = canonicalizeConstitutionalStateComponentV2(
    req.constitutionalState,
  );
  if (!canonStateRes.ok) return canonStateRes;

  // 4. Bound Evidence State
  const canonEvidRes = canonicalizeEvidenceStateComponentV2(req.evidenceState);
  if (!canonEvidRes.ok) return canonEvidRes;

  // 5. Bound Policy Universe
  const canonPolRes = canonicalizePolicyUniverseComponentV2(req.policyUniverse);
  if (!canonPolRes.ok) return canonPolRes;

  // 6. Bound Evaluation Context
  const referencedAuthInputKeys = new Set<string>();
  const referencedEvalParamKeys = new Set<string>();
  const referencedBoundContextKeys = new Set<string>();

  for (const od of req.evaluationContext.ownerDeterminationBindings) {
    for (const op of od.determinationQuestionBinding.questionOperandBindings) {
      if (op.operandKind === "EVALUATION_CONTEXT_BINDING") {
        if (op.bindingCollection === "AUTHORIZED_INPUT")
          referencedAuthInputKeys.add(op.bindingRef);
        else if (op.bindingCollection === "EVALUATION_PARAMETER")
          referencedEvalParamKeys.add(op.bindingRef);
        else if (op.bindingCollection === "BOUND_CONTEXT")
          referencedBoundContextKeys.add(op.bindingRef);
      }
    }
  }

  const projAuthInputs = req.evaluationContext.authorizedInputBindings.map(
    (b) => {
      if (referencedAuthInputKeys.has(b.bindingKey)) return b;
      const proj = { ...(b as unknown as Record<string, unknown>) };
      delete proj.bindingKey;
      return proj;
    },
  );
  const resAuthInputs = sortAndCheckDuplicates(
    projAuthInputs,
    "evaluationContext.authorizedInputBindings",
    false,
  );
  if (!resAuthInputs.ok) return resAuthInputs;

  const projEvalParams = req.evaluationContext.evaluationParameterBindings.map(
    (b) => {
      if (referencedEvalParamKeys.has(b.bindingKey)) return b;
      const proj = { ...(b as unknown as Record<string, unknown>) };
      delete proj.bindingKey;
      return proj;
    },
  );
  const resEvalParams = sortAndCheckDuplicates(
    projEvalParams,
    "evaluationContext.evaluationParameterBindings",
    false,
  );
  if (!resEvalParams.ok) return resEvalParams;

  const projBoundContext = req.evaluationContext.boundContextBindings.map(
    (b) => {
      if (referencedBoundContextKeys.has(b.bindingKey)) return b;
      const proj = { ...(b as unknown as Record<string, unknown>) };
      delete proj.bindingKey;
      return proj;
    },
  );
  const resBoundContext = sortAndCheckDuplicates(
    projBoundContext,
    "evaluationContext.boundContextBindings",
    false,
  );
  if (!resBoundContext.ok) return resBoundContext;

  const sortedOwnerDets: OwnerDeterminationBindingV2[] = [];
  for (const od of req.evaluationContext.ownerDeterminationBindings) {
    const projOps = od.determinationQuestionBinding.questionOperandBindings.map(
      (op) => {
        const proj = { ...(op as unknown as Record<string, unknown>) };
        delete proj.operandKey;
        return proj;
      },
    );
    const resOps = sortAndCheckDuplicates(
      projOps,
      "ownerDeterminationBinding.questionOperandBindings",
      false,
    );
    if (!resOps.ok) return resOps;

    let sortedDecl = od.determinationDependencyDeclaration;
    if (od.determinationDependencyDeclaration.kind === "EXPLICIT") {
      const resDepRefs = sortAndCheckDuplicates(
        od.determinationDependencyDeclaration.dependencyRefs,
        "ownerDeterminationBinding.dependencyRefs",
        false,
      );
      if (!resDepRefs.ok) return resDepRefs;
      sortedDecl = {
        kind: "EXPLICIT",
        dependencyRefs: resDepRefs.value,
      };
    }

    sortedOwnerDets.push({
      ...od,
      determinationQuestionBinding: {
        ...od.determinationQuestionBinding,
        questionOperandBindings:
          resOps.value as unknown as readonly QuestionOperandBindingV2[],
      },
      determinationDependencyDeclaration: sortedDecl,
    });
  }
  const resOwnerDets = sortAndCheckDuplicates(
    sortedOwnerDets,
    "evaluationContext.ownerDeterminationBindings",
    false,
  );
  if (!resOwnerDets.ok) return resOwnerDets;

  const evaluationContext: BoundEvaluationContextV2 = {
    authorizedInputBindings:
      resAuthInputs.value as unknown as readonly EvaluationContextBindingV2[],
    evaluationParameterBindings:
      resEvalParams.value as unknown as readonly EvaluationContextBindingV2[],
    boundContextBindings:
      resBoundContext.value as unknown as readonly EvaluationContextBindingV2[],
    ownerDeterminationBindings: resOwnerDets.value,
  };

  return {
    ok: true,
    value: {
      ...req,
      participation,
      requestedAction,
      constitutionalState:
        canonStateRes.value as unknown as BoundConstitutionalStateV2,
      evidenceState: canonEvidRes.value as unknown as BoundEvidenceStateV2,
      policyUniverse: canonPolRes.value as unknown as BoundPolicyUniverseV2,
      evaluationContext,
    },
  };
}
