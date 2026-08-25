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
  BoundPolicyUniverseV2,
  EvidencePresentationBindingV2,
  ExecutionRequestV2,
  OwnerDeterminationBindingV2,
  ParticipationV2,
  PolicyDependencyEdgeV2,
  QuestionOperandBindingV2,
  RequestedActionBindingV2,
  RequestedCapabilityClaimBindingV2,
  StateBindingV2,
  StateViewV2,
} from "./types.js";

export type LocalLabelNamespace =
  | "ROLE_BINDING"
  | "AGENCY_BINDING"
  | "PERFORMER"
  | "CAPABILITY_CLAIM"
  | "VIEW"
  | "STATE_BINDING"
  | "EVIDENCE_REQUIREMENT"
  | "EVIDENCE_MATERIAL"
  | "INTEGRITY_COORDINATE"
  | "POLICY_MATERIAL"
  | "EVALUATION_BINDING"
  | "OWNER_DETERMINATION"
  | "QUESTION_OPERAND";

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

function permutations<T>(arr: readonly T[]): T[][] {
  if (arr.length <= 1) return [[...arr]];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const head = arr[i];
    const tail = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const tailPerms = permutations(tail);
    for (const p of tailPerms) {
      result.push([head, ...p]);
    }
  }
  return result;
}

function canonicalizeComponentNamespace<T>(
  comp: T,
  namespace: LocalLabelNamespace,
  extractKeys: (c: T) => {
    defined: readonly string[];
    referenced: readonly string[];
  },
  substitute: (c: T, map: ReadonlyMap<string, string>) => T,
): V2IdentityResult<T> {
  const { defined, referenced } = extractKeys(comp);
  if (defined.length === 0) return { ok: true, value: comp };

  for (const ref of referenced) {
    if (!defined.includes(ref)) {
      return makeIdentityFailure(
        "GRAPH_CANONICALIZATION_FAILURE",
        `Dangling local label reference '${ref}' in namespace '${namespace}'`,
      );
    }
  }

  const labelSignatures: { label: string; sig: string }[] = [];
  for (const lbl of defined) {
    const tempMap = new Map<string, string>();
    tempMap.set(lbl, "__CANONICAL_TARGET__");
    for (const other of defined) {
      if (other !== lbl) {
        tempMap.set(other, "__CANONICAL_OTHER__");
      }
    }
    const tempComp = substitute(comp, tempMap);
    const jcsRes = canonicalizeJcsV2(tempComp);
    if (!jcsRes.ok) return jcsRes;
    labelSignatures.push({ label: lbl, sig: jcsRes.value });
  }

  labelSignatures.sort((a, b) => compareUtf8Bytes(a.sig, b.sig));

  const buckets: string[][] = [];
  let currentBucket: string[] = [];
  let currentSig = "";

  for (const item of labelSignatures) {
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

  const bucketPermutations = buckets.map(permutations);
  const combineBucketPermutations = (
    index: number,
    currentPath: string[][],
  ): string[][][] => {
    if (index === buckets.length) return [currentPath];
    const results: string[][][] = [];
    for (const perm of bucketPermutations[index]) {
      results.push(
        ...combineBucketPermutations(index + 1, [...currentPath, perm]),
      );
    }
    return results;
  };

  const candidateCombinations = combineBucketPermutations(0, []);
  let bestComp: T | null = null;
  let bestJcs: string | null = null;

  for (const combo of candidateCombinations) {
    const orderedLabels = combo.flat();
    const mapping = new Map<string, string>();
    for (let i = 0; i < orderedLabels.length; i++) {
      if (!mapping.has(orderedLabels[i])) {
        mapping.set(orderedLabels[i], `${namespace}#${i}`);
      }
    }

    const candidateComp = substitute(comp, mapping);
    const jcsRes = canonicalizeJcsV2(candidateComp);
    if (!jcsRes.ok) return jcsRes;

    if (bestJcs === null || compareUtf8Bytes(jcsRes.value, bestJcs) < 0) {
      bestJcs = jcsRes.value;
      bestComp = candidateComp;
    }
  }

  if (!bestComp) {
    return makeIdentityFailure(
      "GRAPH_CANONICALIZATION_FAILURE",
      `Failed to compute canonical representation for namespace '${namespace}'`,
    );
  }

  return { ok: true, value: bestComp };
}

export function canonicalizeConstitutionalStateComponentV2(
  state: BoundConstitutionalStateV2,
): V2IdentityResult<BoundConstitutionalStateV2> {
  let current = deepClone(state);

  // Canonicalize VIEW
  const viewRes = canonicalizeComponentNamespace(
    current,
    "VIEW",
    (s) => ({
      defined: s.stateViews.map((v) => v.viewKey),
      referenced: [],
    }),
    (s, map) => ({
      ...s,
      stateViews: s.stateViews.map((v) => ({
        ...v,
        viewKey: map.get(v.viewKey) ?? v.viewKey,
      })),
    }),
  );
  if (!viewRes.ok) return viewRes;
  current = viewRes.value;

  // Canonicalize STATE_BINDING
  const bindingRes = canonicalizeComponentNamespace(
    current,
    "STATE_BINDING",
    (s) => {
      const defined: string[] = [];
      for (const v of s.stateViews) {
        for (const b of v.stateBindings) {
          defined.push(b.stateBindingKey);
        }
      }
      return { defined, referenced: [] };
    },
    (s, map) => ({
      ...s,
      stateViews: s.stateViews.map((v) => ({
        ...v,
        stateBindings: v.stateBindings.map((b) => ({
          ...b,
          stateBindingKey: map.get(b.stateBindingKey) ?? b.stateBindingKey,
        })),
      })),
    }),
  );
  if (!bindingRes.ok) return bindingRes;
  current = bindingRes.value;

  const sortedViews: StateViewV2[] = [];
  for (const sv of current.stateViews) {
    const resBindings = sortAndCheckDuplicates(
      sv.stateBindings,
      "stateView.stateBindings",
      false,
    );
    if (!resBindings.ok) return resBindings;
    sortedViews.push({
      ...sv,
      stateBindings: resBindings.value as readonly StateBindingV2[],
    });
  }
  const resViews = sortAndCheckDuplicates(
    sortedViews,
    "constitutionalState.stateViews",
    false,
  );
  if (!resViews.ok) return resViews;

  return {
    ok: true,
    value: {
      ...current,
      stateViews: resViews.value,
    },
  };
}

export function canonicalizeEvidenceStateComponentV2(
  state: BoundEvidenceStateV2,
): V2IdentityResult<BoundEvidenceStateV2> {
  let current = deepClone(state);

  // EVIDENCE_REQUIREMENT
  const reqRes = canonicalizeComponentNamespace(
    current,
    "EVIDENCE_REQUIREMENT",
    (s) => ({
      defined: s.evidenceRequirementBindings.map((b) => b.requirementKey),
      referenced: [],
    }),
    (s, map) => ({
      ...s,
      evidenceRequirementBindings: s.evidenceRequirementBindings.map((b) => ({
        ...b,
        requirementKey: map.get(b.requirementKey) ?? b.requirementKey,
      })),
    }),
  );
  if (!reqRes.ok) return reqRes;
  current = reqRes.value;

  // EVIDENCE_MATERIAL
  const matRes = canonicalizeComponentNamespace(
    current,
    "EVIDENCE_MATERIAL",
    (s) => ({
      defined: s.suppliedEvidenceMaterial.map((m) => m.materialKey),
      referenced: [],
    }),
    (s, map) => ({
      ...s,
      suppliedEvidenceMaterial: s.suppliedEvidenceMaterial.map((m) => ({
        ...m,
        materialKey: map.get(m.materialKey) ?? m.materialKey,
      })),
    }),
  );
  if (!matRes.ok) return matRes;
  current = matRes.value;

  // INTEGRITY_COORDINATE
  const coordRes = canonicalizeComponentNamespace(
    current,
    "INTEGRITY_COORDINATE",
    (s) => ({
      defined: s.integrityCoordinates.map((c) => c.coordinateKey),
      referenced: [],
    }),
    (s, map) => ({
      ...s,
      integrityCoordinates: s.integrityCoordinates.map((c) => ({
        ...c,
        coordinateKey: map.get(c.coordinateKey) ?? c.coordinateKey,
      })),
    }),
  );
  if (!coordRes.ok) return coordRes;
  current = coordRes.value;

  const resReqBindings = sortAndCheckDuplicates(
    current.evidenceRequirementBindings,
    "evidenceState.evidenceRequirementBindings",
    false,
  );
  if (!resReqBindings.ok) return resReqBindings;

  const resSuppliedMat = sortAndCheckDuplicates(
    current.suppliedEvidenceMaterial,
    "evidenceState.suppliedEvidenceMaterial",
    false,
  );
  if (!resSuppliedMat.ok) return resSuppliedMat;

  const sortedPresBindings: EvidencePresentationBindingV2[] = [];
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

  const resIntegCoords = sortAndCheckDuplicates(
    current.integrityCoordinates,
    "evidenceState.integrityCoordinates",
    false,
  );
  if (!resIntegCoords.ok) return resIntegCoords;

  return {
    ok: true,
    value: {
      ...current,
      evidenceRequirementBindings: resReqBindings.value,
      suppliedEvidenceMaterial: resSuppliedMat.value,
      evidencePresentationBindings: resPresBindings.value,
      integrityCoordinates: resIntegCoords.value,
    },
  };
}

export function canonicalizePolicyUniverseComponentV2(
  universe: BoundPolicyUniverseV2,
): V2IdentityResult<BoundPolicyUniverseV2> {
  let current = deepClone(universe);

  const resPolicyMatPre = sortAndCheckDuplicates(
    current.applicablePolicyMaterial,
    "policyUniverse.applicablePolicyMaterial",
    false,
  );
  if (!resPolicyMatPre.ok) return resPolicyMatPre;

  const resEdgesPre = sortAndCheckDuplicates(
    current.dependencyTopology.dependencyEdges,
    "policyUniverse.dependencyTopology.dependencyEdges",
    false,
  );
  if (!resEdgesPre.ok) return resEdgesPre;

  current = {
    ...current,
    applicablePolicyMaterial: resPolicyMatPre.value,
    dependencyTopology: {
      dependencyEdges: resEdgesPre.value as readonly PolicyDependencyEdgeV2[],
    },
  };

  const matRes = canonicalizeComponentNamespace(
    current,
    "POLICY_MATERIAL",
    (s) => ({
      defined: s.applicablePolicyMaterial.map((m) => m.policyKey),
      referenced: [],
    }),
    (s, map) => ({
      ...s,
      applicablePolicyMaterial: s.applicablePolicyMaterial.map((m) => ({
        ...m,
        policyKey: map.get(m.policyKey) ?? m.policyKey,
      })),
    }),
  );
  if (!matRes.ok) return matRes;
  current = matRes.value;

  const resPolicyMatPost = sortAndCheckDuplicates(
    current.applicablePolicyMaterial,
    "policyUniverse.applicablePolicyMaterial",
    false,
  );
  if (!resPolicyMatPost.ok) return resPolicyMatPost;

  return {
    ok: true,
    value: {
      ...current,
      applicablePolicyMaterial: resPolicyMatPost.value,
    },
  };
}

/**
 * Substitutes labels in a specific namespace across an ExecutionRequestV2 object.
 */
function substituteNamespaceLabels(
  req: ExecutionRequestV2,
  namespace: LocalLabelNamespace,
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

    case "VIEW": {
      for (const sv of cloned.constitutionalState.stateViews) {
        (sv as { viewKey: string }).viewKey = mapLabel(sv.viewKey);
      }
      break;
    }

    case "STATE_BINDING": {
      for (const sv of cloned.constitutionalState.stateViews) {
        for (const sb of sv.stateBindings) {
          (sb as { stateBindingKey: string }).stateBindingKey = mapLabel(
            sb.stateBindingKey,
          );
        }
      }
      break;
    }

    case "EVIDENCE_REQUIREMENT": {
      for (const erb of cloned.evidenceState.evidenceRequirementBindings) {
        (erb as { requirementKey: string }).requirementKey = mapLabel(
          erb.requirementKey,
        );
      }
      break;
    }

    case "EVIDENCE_MATERIAL": {
      for (const sem of cloned.evidenceState.suppliedEvidenceMaterial) {
        (sem as { materialKey: string }).materialKey = mapLabel(
          sem.materialKey,
        );
      }
      break;
    }

    case "INTEGRITY_COORDINATE": {
      for (const ic of cloned.evidenceState.integrityCoordinates) {
        (ic as { coordinateKey: string }).coordinateKey = mapLabel(
          ic.coordinateKey,
        );
      }
      break;
    }

    case "POLICY_MATERIAL": {
      for (const apm of cloned.policyUniverse.applicablePolicyMaterial) {
        (apm as { policyKey: string }).policyKey = mapLabel(apm.policyKey);
      }
      break;
    }

    case "EVALUATION_BINDING": {
      for (const b of cloned.evaluationContext.authorizedInputBindings) {
        (b as { bindingKey: string }).bindingKey = mapLabel(b.bindingKey);
      }
      for (const b of cloned.evaluationContext.evaluationParameterBindings) {
        (b as { bindingKey: string }).bindingKey = mapLabel(b.bindingKey);
      }
      for (const b of cloned.evaluationContext.boundContextBindings) {
        (b as { bindingKey: string }).bindingKey = mapLabel(b.bindingKey);
      }
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "EVALUATION_CONTEXT_BINDING") {
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

    case "QUESTION_OPERAND": {
      for (const od of cloned.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          (op as { operandKey: string }).operandKey = mapLabel(op.operandKey);
        }
      }
      break;
    }
  }

  return cloned;
}

/**
 * Extracts all defined keys and referenced keys for a given namespace.
 * Also validates that all references point to defined keys.
 */
function extractAndValidateNamespaceKeys(
  req: ExecutionRequestV2,
  namespace: LocalLabelNamespace,
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

    case "VIEW": {
      for (const sv of req.constitutionalState.stateViews) {
        defined.add(sv.viewKey);
      }
      break;
    }

    case "STATE_BINDING": {
      for (const sv of req.constitutionalState.stateViews) {
        for (const sb of sv.stateBindings) {
          defined.add(sb.stateBindingKey);
        }
      }
      break;
    }

    case "EVIDENCE_REQUIREMENT": {
      for (const erb of req.evidenceState.evidenceRequirementBindings) {
        defined.add(erb.requirementKey);
      }
      break;
    }

    case "EVIDENCE_MATERIAL": {
      for (const sem of req.evidenceState.suppliedEvidenceMaterial) {
        defined.add(sem.materialKey);
      }
      break;
    }

    case "INTEGRITY_COORDINATE": {
      for (const ic of req.evidenceState.integrityCoordinates) {
        defined.add(ic.coordinateKey);
      }
      break;
    }

    case "POLICY_MATERIAL": {
      for (const apm of req.policyUniverse.applicablePolicyMaterial) {
        defined.add(apm.policyKey);
      }
      break;
    }

    case "EVALUATION_BINDING": {
      for (const b of req.evaluationContext.authorizedInputBindings) {
        defined.add(b.bindingKey);
      }
      for (const b of req.evaluationContext.evaluationParameterBindings) {
        defined.add(b.bindingKey);
      }
      for (const b of req.evaluationContext.boundContextBindings) {
        defined.add(b.bindingKey);
      }
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          if (op.operandKind === "EVALUATION_CONTEXT_BINDING") {
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

    case "QUESTION_OPERAND": {
      for (const od of req.evaluationContext.ownerDeterminationBindings) {
        for (const op of od.determinationQuestionBinding
          .questionOperandBindings) {
          defined.add(op.operandKey);
        }
      }
      break;
    }
  }

  // Validate that all referenced keys exist in defined
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
 * Normalizes local labels within a single namespace using partition refinement and candidate permutation evaluation.
 */
function canonicalizeNamespace(
  req: ExecutionRequestV2,
  namespace: LocalLabelNamespace,
): V2IdentityResult<ExecutionRequestV2> {
  const keysRes = extractAndValidateNamespaceKeys(req, namespace);
  if (!keysRes.ok) {
    return keysRes;
  }
  const { defined } = keysRes.value;
  if (defined.length === 0) {
    return { ok: true, value: req };
  }

  // Compute initial single-label signatures for partition refinement
  const labelSignatures: { label: string; sig: string }[] = [];
  for (const lbl of defined) {
    const tempMap = new Map<string, string>();
    tempMap.set(lbl, "__CANONICAL_TARGET__");
    for (const other of defined) {
      if (other !== lbl) {
        tempMap.set(other, "__CANONICAL_OTHER__");
      }
    }
    const tempReq = substituteNamespaceLabels(req, namespace, tempMap);
    const jcsRes = canonicalizeJcsV2(tempReq);
    if (!jcsRes.ok) {
      return jcsRes;
    }
    labelSignatures.push({ label: lbl, sig: jcsRes.value });
  }

  // Group labels into buckets by signature
  labelSignatures.sort((a, b) => compareUtf8Bytes(a.sig, b.sig));

  const buckets: string[][] = [];
  let currentBucket: string[] = [];
  let currentSig = "";

  for (const item of labelSignatures) {
    if (currentBucket.length === 0 || item.sig === currentSig) {
      currentBucket.push(item.label);
      currentSig = item.sig;
    } else {
      buckets.push(currentBucket);
      currentBucket = [item.label];
      currentSig = item.sig;
    }
  }
  if (currentBucket.length > 0) {
    buckets.push(currentBucket);
  }

  // Generate candidate permutations for each bucket
  const bucketPermutations = buckets.map(permutations);

  // Cartesian product over bucket permutations
  const combineBucketPermutations = (
    index: number,
    currentPath: string[][],
  ): string[][][] => {
    if (index === buckets.length) {
      return [currentPath];
    }
    const results: string[][][] = [];
    for (const perm of bucketPermutations[index]) {
      results.push(
        ...combineBucketPermutations(index + 1, [...currentPath, perm]),
      );
    }
    return results;
  };

  const candidateCombinations = combineBucketPermutations(0, []);

  // Evaluate candidate combinations and pick the lexicographically smallest JCS output
  let bestReq: ExecutionRequestV2 | null = null;
  let bestJcs: string | null = null;

  for (const combo of candidateCombinations) {
    const orderedLabels = combo.flat();
    const mapping = new Map<string, string>();
    for (let i = 0; i < orderedLabels.length; i++) {
      if (!mapping.has(orderedLabels[i])) {
        mapping.set(orderedLabels[i], `${namespace}#${i}`);
      }
    }

    const candidateReq = substituteNamespaceLabels(req, namespace, mapping);
    const jcsRes = canonicalizeJcsV2(candidateReq);
    if (!jcsRes.ok) {
      return jcsRes;
    }

    if (bestJcs === null || compareUtf8Bytes(jcsRes.value, bestJcs) < 0) {
      bestJcs = jcsRes.value;
      bestReq = candidateReq;
    }
  }

  if (!bestReq) {
    return makeIdentityFailure(
      "GRAPH_CANONICALIZATION_FAILURE",
      `Failed to compute canonical representation for namespace '${namespace}'`,
    );
  }

  return { ok: true, value: bestReq };
}

/**
 * Topologically ordered namespaces for deterministic local-label canonicalization.
 */
const NAMESPACE_ORDER: readonly LocalLabelNamespace[] = [
  "ROLE_BINDING",
  "AGENCY_BINDING",
  "PERFORMER",
  "CAPABILITY_CLAIM",
  "VIEW",
  "STATE_BINDING",
  "EVIDENCE_REQUIREMENT",
  "EVIDENCE_MATERIAL",
  "INTEGRITY_COORDINATE",
  "POLICY_MATERIAL",
  "EVALUATION_BINDING",
  "QUESTION_OPERAND",
  "OWNER_DETERMINATION",
];

/**
 * Fully canonicalizes an ExecutionRequestV2 request structure:
 * 1. Sequentially canonicalizes local labels across all 13 typed namespaces.
 * 2. Sorts all semantically unordered collections by JCS UTF-8 byte ordering.
 * 3. Rejects any semantic duplicates.
 */
export function canonicalizeGraphAndCollectionsV2(
  req: ExecutionRequestV2,
): V2IdentityResult<ExecutionRequestV2> {
  let currentReq = req;

  // Step 1: Canonicalize local labels per namespace
  for (const ns of NAMESPACE_ORDER) {
    const res = canonicalizeNamespace(currentReq, ns);
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
  const resAuthInputs = sortAndCheckDuplicates(
    req.evaluationContext.authorizedInputBindings,
    "evaluationContext.authorizedInputBindings",
    false,
  );
  if (!resAuthInputs.ok) return resAuthInputs;

  const resEvalParams = sortAndCheckDuplicates(
    req.evaluationContext.evaluationParameterBindings,
    "evaluationContext.evaluationParameterBindings",
    false,
  );
  if (!resEvalParams.ok) return resEvalParams;

  const resBoundContext = sortAndCheckDuplicates(
    req.evaluationContext.boundContextBindings,
    "evaluationContext.boundContextBindings",
    false,
  );
  if (!resBoundContext.ok) return resBoundContext;

  const sortedOwnerDets: OwnerDeterminationBindingV2[] = [];
  for (const od of req.evaluationContext.ownerDeterminationBindings) {
    const resOps = sortAndCheckDuplicates(
      od.determinationQuestionBinding.questionOperandBindings,
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
          resOps.value as readonly QuestionOperandBindingV2[],
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
    authorizedInputBindings: resAuthInputs.value,
    evaluationParameterBindings: resEvalParams.value,
    boundContextBindings: resBoundContext.value,
    ownerDeterminationBindings: resOwnerDets.value,
  };

  return {
    ok: true,
    value: {
      ...req,
      participation,
      requestedAction,
      constitutionalState: canonStateRes.value,
      evidenceState: canonEvidRes.value,
      policyUniverse: canonPolRes.value,
      evaluationContext,
    },
  };
}
