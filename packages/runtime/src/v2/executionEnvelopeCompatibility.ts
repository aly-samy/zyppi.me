import {
  deriveExecutionRequestV2DigestCandidate,
  validateExecutionRequestV2,
  type ConstitutionalRefBaseV2,
  type ExecutionRequestV2,
  type ExecutionRequestV2ValidationError,
  type V2IdentityError,
} from "@zyppi/domain";

export type ExecutionEnvelopeCompatibilityV2ErrorCode =
  | "ROLE_BINDING_INCOMPATIBLE"
  | "AGENCY_RELIANCE_INCOMPATIBLE"
  | "EVIDENCE_BINDING_INCOMPATIBLE"
  | "POLICY_TOPOLOGY_INCOMPATIBLE"
  | "TEMPORAL_BINDING_INCOMPATIBLE"
  | "QUESTION_OPERAND_INCOMPATIBLE"
  | "OWNER_DEPENDENCY_INCOMPATIBLE";

export interface ExecutionEnvelopeCompatibilityV2Error {
  readonly code: ExecutionEnvelopeCompatibilityV2ErrorCode;
  readonly path: string;
  readonly message: string;
}

export type ExecutionEnvelopeCompatibilityV2Success = {
  readonly ok: true;
  readonly executionRequest: ExecutionRequestV2;
  readonly wholeRequestDigestCandidate: string;
};

export type ExecutionEnvelopeCompatibilityV2Failure =
  | {
      readonly ok: false;
      readonly stage: "STRUCTURAL_VALIDATION";
      readonly error: ExecutionRequestV2ValidationError;
    }
  | {
      readonly ok: false;
      readonly stage: "IDENTITY_VALIDATION";
      readonly error: V2IdentityError;
    }
  | {
      readonly ok: false;
      readonly stage: "EXECUTION_ENVELOPE_COMPATIBILITY";
      readonly error: ExecutionEnvelopeCompatibilityV2Error;
    };

export type ExecutionEnvelopeCompatibilityV2Result =
  | ExecutionEnvelopeCompatibilityV2Success
  | ExecutionEnvelopeCompatibilityV2Failure;

/**
 * Exact constitutional reference equality helper.
 * Compares family, ownerRef, artifactId, version, stateRef, and provenanceRef.
 */
function areRefsEqual(
  a: ConstitutionalRefBaseV2,
  b: ConstitutionalRefBaseV2,
): boolean {
  return (
    a.family === b.family &&
    a.ownerRef === b.ownerRef &&
    a.artifactId === b.artifactId &&
    (a.version ?? null) === (b.version ?? null) &&
    (a.stateRef ?? null) === (b.stateRef ?? null) &&
    (a.provenanceRef ?? null) === (b.provenanceRef ?? null)
  );
}

function refFingerprint(ref: ConstitutionalRefBaseV2): string {
  return [
    ref.family,
    ref.ownerRef,
    ref.artifactId,
    ref.version ?? "null",
    ref.stateRef ?? "null",
    ref.provenanceRef ?? "null",
  ].join("|");
}

export function validateExecutionEnvelopeCompatibilityV2(
  input: unknown,
): ExecutionEnvelopeCompatibilityV2Result {
  // Step 1 — Structural validation
  const structuralResult = validateExecutionRequestV2(input);
  if (!structuralResult.ok) {
    return {
      ok: false,
      stage: "STRUCTURAL_VALIDATION",
      error: structuralResult.error,
    };
  }

  const request = structuralResult.value;

  // Step 2 — Identity validation
  const identityResult = deriveExecutionRequestV2DigestCandidate(request);
  if (!identityResult.ok) {
    return {
      ok: false,
      stage: "IDENTITY_VALIDATION",
      error: identityResult.error,
    };
  }

  const wholeRequestDigestCandidate = identityResult.value;

  // Step 3 — Execution-envelope compatibility evaluation

  // Index role bindings by key
  const roleBindingMap = new Map<
    string,
    (typeof request.participation.roleBindings)[number]
  >();
  for (const rb of request.participation.roleBindings) {
    roleBindingMap.set(rb.roleBindingKey, rb);
  }

  // Index agency bindings by key
  const agencyBindingMap = new Map<
    string,
    (typeof request.participation.agencyBindings)[number]
  >();
  for (const ab of request.participation.agencyBindings) {
    agencyBindingMap.set(ab.agencyBindingKey, ab);
  }

  // --- Law A — Participation Role Coherence ---

  // 14.1 Action performer
  for (
    let i = 0;
    i < request.requestedAction.actionPerformerBindings.length;
    i++
  ) {
    const performer = request.requestedAction.actionPerformerBindings[i];
    const roleBinding = roleBindingMap.get(performer.actorParticipationRef);
    if (roleBinding && roleBinding.role !== "ACTOR") {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "ROLE_BINDING_INCOMPATIBLE",
          path: `$.requestedAction.actionPerformerBindings[${i}].actorParticipationRef`,
          message: `Action performer '${performer.performerKey}' references role binding '${performer.actorParticipationRef}' with role '${roleBinding.role}', expected 'ACTOR'`,
        },
      };
    }
  }

  // 14.2 Agency actor endpoint
  for (let i = 0; i < request.participation.agencyBindings.length; i++) {
    const agencyBinding = request.participation.agencyBindings[i];
    const actorRole = roleBindingMap.get(agencyBinding.actorRoleBindingRef);
    if (actorRole && actorRole.role !== "ACTOR") {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "ROLE_BINDING_INCOMPATIBLE",
          path: `$.participation.agencyBindings[${i}].actorRoleBindingRef`,
          message: `Agency binding '${agencyBinding.agencyBindingKey}' actor endpoint references role binding '${agencyBinding.actorRoleBindingRef}' with role '${actorRole.role}', expected 'ACTOR'`,
        },
      };
    }

    // 14.3 Agency governed-subject endpoint
    const governedRole = roleBindingMap.get(
      agencyBinding.governedSubjectRoleBindingRef,
    );
    if (governedRole && governedRole.role !== "GOVERNED_SUBJECT") {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "ROLE_BINDING_INCOMPATIBLE",
          path: `$.participation.agencyBindings[${i}].governedSubjectRoleBindingRef`,
          message: `Agency binding '${agencyBinding.agencyBindingKey}' governed subject endpoint references role binding '${agencyBinding.governedSubjectRoleBindingRef}' with role '${governedRole.role}', expected 'GOVERNED_SUBJECT'`,
        },
      };
    }
  }

  // 14.4 Intent originator
  const originatorRole = roleBindingMap.get(
    request.intent.originatorParticipationRef,
  );
  if (originatorRole && originatorRole.role === "GOVERNED_SUBJECT") {
    return {
      ok: false,
      stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
      error: {
        code: "ROLE_BINDING_INCOMPATIBLE",
        path: `$.intent.originatorParticipationRef`,
        message: `Intent originator references role binding '${request.intent.originatorParticipationRef}' with role 'GOVERNED_SUBJECT', which cannot originate intent`,
      },
    };
  }

  // --- Law B — Explicit Agency Reliance ---
  for (
    let i = 0;
    i < request.requestedAction.actionPerformerBindings.length;
    i++
  ) {
    const performer = request.requestedAction.actionPerformerBindings[i];
    if (performer.agencyReliance.kind === "DELEGATED_AGENCY_SINGLE") {
      const agencyBinding = agencyBindingMap.get(
        performer.agencyReliance.agencyBindingRef,
      );
      if (
        agencyBinding &&
        agencyBinding.actorRoleBindingRef !== performer.actorParticipationRef
      ) {
        return {
          ok: false,
          stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
          error: {
            code: "AGENCY_RELIANCE_INCOMPATIBLE",
            path: `$.requestedAction.actionPerformerBindings[${i}].agencyReliance.agencyBindingRef`,
            message: `Performer '${performer.performerKey}' relying on agency '${performer.agencyReliance.agencyBindingRef}' has actorParticipationRef '${performer.actorParticipationRef}', but agency actorRoleBindingRef is '${agencyBinding.actorRoleBindingRef}'`,
          },
        };
      }
    }
  }

  // --- Law C — Evidence Binding Closure ---

  // 16.1 Presentation requirement closure
  for (
    let i = 0;
    i < request.evidenceState.evidencePresentationBindings.length;
    i++
  ) {
    const presentation = request.evidenceState.evidencePresentationBindings[i];
    const reqFound = request.evidenceState.evidenceRequirementBindings.some(
      (b) =>
        areRefsEqual(
          presentation.evidenceRequirementRef,
          b.governedRequirementRef,
        ),
    );
    if (!reqFound) {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "EVIDENCE_BINDING_INCOMPATIBLE",
          path: `$.evidenceState.evidencePresentationBindings[${i}].evidenceRequirementRef`,
          message: `Evidence presentation references evidence requirement '${presentation.evidenceRequirementRef.artifactId}' not found in evidenceRequirementBindings`,
        },
      };
    }

    // 16.2 Presented evidence closure
    for (let j = 0; j < presentation.presentedEvidenceRefs.length; j++) {
      const presRef = presentation.presentedEvidenceRefs[j];
      const matFound = request.evidenceState.suppliedEvidenceMaterial.some(
        (m) => areRefsEqual(presRef, m.evidenceRef),
      );
      if (!matFound) {
        return {
          ok: false,
          stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
          error: {
            code: "EVIDENCE_BINDING_INCOMPATIBLE",
            path: `$.evidenceState.evidencePresentationBindings[${i}].presentedEvidenceRefs[${j}]`,
            message: `Evidence presentation references supplied evidence '${presRef.artifactId}' not found in suppliedEvidenceMaterial`,
          },
        };
      }
    }
  }

  // 16.3 Integrity-coordinate evidence closure
  for (let i = 0; i < request.evidenceState.integrityCoordinates.length; i++) {
    const coord = request.evidenceState.integrityCoordinates[i];
    const matFound = request.evidenceState.suppliedEvidenceMaterial.some((m) =>
      areRefsEqual(coord.evidenceRef, m.evidenceRef),
    );
    if (!matFound) {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "EVIDENCE_BINDING_INCOMPATIBLE",
          path: `$.evidenceState.integrityCoordinates[${i}].evidenceRef`,
          message: `Integrity coordinate references supplied evidence '${coord.evidenceRef.artifactId}' not found in suppliedEvidenceMaterial`,
        },
      };
    }
  }

  // --- Law D — Policy Dependency Topology ---

  const applicablePolicies = request.policyUniverse.applicablePolicyMaterial;

  for (
    let i = 0;
    i < request.policyUniverse.dependencyTopology.dependencyEdges.length;
    i++
  ) {
    const edge = request.policyUniverse.dependencyTopology.dependencyEdges[i];

    // 17.1 Edge endpoint closure
    const dependeeExists = applicablePolicies.some((p) =>
      areRefsEqual(edge.dependeePolicyRef, p.policyRef),
    );
    const dependentExists = applicablePolicies.some((p) =>
      areRefsEqual(edge.dependentPolicyRef, p.policyRef),
    );

    if (!dependeeExists || !dependentExists) {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "POLICY_TOPOLOGY_INCOMPATIBLE",
          path: `$.policyUniverse.dependencyTopology.dependencyEdges[${i}]`,
          message: `Policy dependency edge references policy not found in applicablePolicyMaterial`,
        },
      };
    }

    // 17.2 Self-dependency prohibited
    if (areRefsEqual(edge.dependeePolicyRef, edge.dependentPolicyRef)) {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "POLICY_TOPOLOGY_INCOMPATIBLE",
          path: `$.policyUniverse.dependencyTopology.dependencyEdges[${i}]`,
          message: `Policy dependency edge contains prohibited self-dependency on policy '${edge.dependeePolicyRef.artifactId}'`,
        },
      };
    }
  }

  // 17.3 Cycles prohibited
  const policyAdj = new Map<string, Set<string>>();
  for (const p of applicablePolicies) {
    policyAdj.set(refFingerprint(p.policyRef), new Set<string>());
  }
  for (const edge of request.policyUniverse.dependencyTopology
    .dependencyEdges) {
    const fromKey = refFingerprint(edge.dependeePolicyRef);
    const toKey = refFingerprint(edge.dependentPolicyRef);
    const set = policyAdj.get(fromKey);
    if (set) {
      set.add(toKey);
    }
  }

  const visitState = new Map<string, 0 | 1 | 2>(); // 0=unvisited, 1=visiting, 2=visited
  for (const key of policyAdj.keys()) {
    visitState.set(key, 0);
  }

  function hasPolicyCycle(node: string): boolean {
    visitState.set(node, 1);
    const neighbors = policyAdj.get(node);
    if (neighbors) {
      for (const neighbor of neighbors) {
        const state = visitState.get(neighbor) ?? 0;
        if (state === 1) {
          return true; // Cycle detected
        }
        if (state === 0) {
          if (hasPolicyCycle(neighbor)) {
            return true;
          }
        }
      }
    }
    visitState.set(node, 2);
    return false;
  }

  for (const key of policyAdj.keys()) {
    if ((visitState.get(key) ?? 0) === 0) {
      if (hasPolicyCycle(key)) {
        return {
          ok: false,
          stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
          error: {
            code: "POLICY_TOPOLOGY_INCOMPATIBLE",
            path: `$.policyUniverse.dependencyTopology.dependencyEdges`,
            message: `Policy dependency topology contains a cycle`,
          },
        };
      }
    }
  }

  // --- Law E — Temporal Coordinate Availability ---
  const temporalCoords = request.executionContext.temporalCoordinates;

  for (
    let i = 0;
    i < request.evaluationContext.ownerDeterminationBindings.length;
    i++
  ) {
    const detBinding = request.evaluationContext.ownerDeterminationBindings[i];

    // 18.2 Owner assessment coordinate
    const assessedCoord = detBinding.assessedAtCoordinateRef;
    if (temporalCoords[assessedCoord] === undefined) {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "TEMPORAL_BINDING_INCOMPATIBLE",
          path: `$.evaluationContext.ownerDeterminationBindings[${i}].assessedAtCoordinateRef`,
          message: `Owner determination '${detBinding.determinationBindingKey}' references temporal coordinate '${assessedCoord}' which is absent from executionContext.temporalCoordinates`,
        },
      };
    }

    // 18.1 Question temporal operand
    const operands =
      detBinding.determinationQuestionBinding.questionOperandBindings;
    for (let j = 0; j < operands.length; j++) {
      const op = operands[j];
      if (op.operandKind === "TEMPORAL_COORDINATE") {
        if (temporalCoords[op.temporalCoordinateRef] === undefined) {
          return {
            ok: false,
            stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
            error: {
              code: "TEMPORAL_BINDING_INCOMPATIBLE",
              path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationQuestionBinding.questionOperandBindings[${j}].temporalCoordinateRef`,
              message: `Question operand references temporal coordinate '${op.temporalCoordinateRef}' which is absent from executionContext.temporalCoordinates`,
            },
          };
        }
      }
    }
  }

  // --- Law F — Determination Question Operand Binding ---
  for (
    let i = 0;
    i < request.evaluationContext.ownerDeterminationBindings.length;
    i++
  ) {
    const detBinding = request.evaluationContext.ownerDeterminationBindings[i];
    const operands =
      detBinding.determinationQuestionBinding.questionOperandBindings;

    for (let j = 0; j < operands.length; j++) {
      const op = operands[j];

      // 19.1 Constitutional-state operand
      if (op.operandKind === "CONSTITUTIONAL_STATE") {
        if (
          op.semanticStateRef !== request.constitutionalState.semanticStateRef
        ) {
          return {
            ok: false,
            stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
            error: {
              code: "QUESTION_OPERAND_INCOMPATIBLE",
              path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationQuestionBinding.questionOperandBindings[${j}].semanticStateRef`,
              message: `Question operand semanticStateRef '${op.semanticStateRef}' does not match request constitutionalState.semanticStateRef '${request.constitutionalState.semanticStateRef}'`,
            },
          };
        }
      }

      // 19.2 Evidence-state operand
      if (op.operandKind === "EVIDENCE_STATE") {
        if (op.evidenceStateRef !== request.evidenceState.evidenceStateRef) {
          return {
            ok: false,
            stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
            error: {
              code: "QUESTION_OPERAND_INCOMPATIBLE",
              path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationQuestionBinding.questionOperandBindings[${j}].evidenceStateRef`,
              message: `Question operand evidenceStateRef '${op.evidenceStateRef}' does not match request evidenceState.evidenceStateRef '${request.evidenceState.evidenceStateRef}'`,
            },
          };
        }
      }

      // 19.3 Policy-universe operand
      if (op.operandKind === "POLICY_UNIVERSE") {
        if (op.policyUniverseRef !== request.policyUniverse.policyUniverseRef) {
          return {
            ok: false,
            stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
            error: {
              code: "QUESTION_OPERAND_INCOMPATIBLE",
              path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationQuestionBinding.questionOperandBindings[${j}].policyUniverseRef`,
              message: `Question operand policyUniverseRef '${op.policyUniverseRef}' does not match request policyUniverse.policyUniverseRef '${request.policyUniverse.policyUniverseRef}'`,
            },
          };
        }
      }

      // 19.4 Action-target operand
      if (op.operandKind === "ACTION_TARGET") {
        const targetFound = request.requestedAction.actionTargetBindings.some(
          (at) =>
            areRefsEqual(op.targetSlotSemanticRef, at.targetSlotSemanticRef) &&
            areRefsEqual(op.targetRef, at.targetRef),
        );
        if (!targetFound) {
          return {
            ok: false,
            stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
            error: {
              code: "QUESTION_OPERAND_INCOMPATIBLE",
              path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationQuestionBinding.questionOperandBindings[${j}]`,
              message: `Question operand ACTION_TARGET does not match any actionTargetBinding in requestedAction`,
            },
          };
        }
      }
    }
  }

  // --- Law G — Owner Determination Dependency Coherence ---
  const ownerDetMap = new Map<
    string,
    (typeof request.evaluationContext.ownerDeterminationBindings)[number]
  >();
  for (const od of request.evaluationContext.ownerDeterminationBindings) {
    ownerDetMap.set(od.determinationBindingKey, od);
  }

  for (
    let i = 0;
    i < request.evaluationContext.ownerDeterminationBindings.length;
    i++
  ) {
    const detBinding = request.evaluationContext.ownerDeterminationBindings[i];
    const decl = detBinding.determinationDependencyDeclaration;
    const operands =
      detBinding.determinationQuestionBinding.questionOperandBindings;

    const ownerDetOperandRefs: string[] = [];
    for (const op of operands) {
      if (op.operandKind === "OWNER_DETERMINATION") {
        ownerDetOperandRefs.push(op.ownerDeterminationBindingRef);
      }
    }

    // 20.1 AUTHORITATIVELY_NONE
    if (decl.kind === "AUTHORITATIVELY_NONE") {
      if (ownerDetOperandRefs.length > 0) {
        return {
          ok: false,
          stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
          error: {
            code: "OWNER_DEPENDENCY_INCOMPATIBLE",
            path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationDependencyDeclaration`,
            message: `Determination '${detBinding.determinationBindingKey}' declares AUTHORITATIVELY_NONE but contains OWNER_DETERMINATION operands`,
          },
        };
      }
    }

    // 20.2 EXPLICIT
    if (decl.kind === "EXPLICIT") {
      for (const refKey of ownerDetOperandRefs) {
        if (!decl.dependencyRefs.includes(refKey)) {
          return {
            ok: false,
            stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
            error: {
              code: "OWNER_DEPENDENCY_INCOMPATIBLE",
              path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationDependencyDeclaration.dependencyRefs`,
              message: `Determination '${detBinding.determinationBindingKey}' uses OWNER_DETERMINATION operand '${refKey}' not listed in explicit dependencyRefs`,
            },
          };
        }
      }

      // 20.3 Self-dependency prohibited in dependencyRefs
      if (decl.dependencyRefs.includes(detBinding.determinationBindingKey)) {
        return {
          ok: false,
          stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
          error: {
            code: "OWNER_DEPENDENCY_INCOMPATIBLE",
            path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationBindingKey`,
            message: `Determination '${detBinding.determinationBindingKey}' contains prohibited self-dependency in dependencyRefs`,
          },
        };
      }
    }

    // 20.3 Self-dependency prohibited in operands
    if (ownerDetOperandRefs.includes(detBinding.determinationBindingKey)) {
      return {
        ok: false,
        stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
        error: {
          code: "OWNER_DEPENDENCY_INCOMPATIBLE",
          path: `$.evaluationContext.ownerDeterminationBindings[${i}].determinationBindingKey`,
          message: `Determination '${detBinding.determinationBindingKey}' contains prohibited self-dependency in question operands`,
        },
      };
    }
  }

  // 20.4 Dependency cycles prohibited
  const ownerDetAdj = new Map<string, Set<string>>();
  for (const od of request.evaluationContext.ownerDeterminationBindings) {
    ownerDetAdj.set(od.determinationBindingKey, new Set<string>());
  }

  for (const od of request.evaluationContext.ownerDeterminationBindings) {
    const fromKey = od.determinationBindingKey;
    const decl = od.determinationDependencyDeclaration;
    if (decl.kind === "EXPLICIT") {
      for (const depKey of decl.dependencyRefs) {
        if (ownerDetMap.has(depKey)) {
          ownerDetAdj.get(fromKey)?.add(depKey);
        }
      }
    }
  }

  const ownerVisitState = new Map<string, 0 | 1 | 2>();
  for (const key of ownerDetAdj.keys()) {
    ownerVisitState.set(key, 0);
  }

  function hasOwnerCycle(node: string): boolean {
    ownerVisitState.set(node, 1);
    const neighbors = ownerDetAdj.get(node);
    if (neighbors) {
      for (const neighbor of neighbors) {
        const state = ownerVisitState.get(neighbor) ?? 0;
        if (state === 1) {
          return true;
        }
        if (state === 0) {
          if (hasOwnerCycle(neighbor)) {
            return true;
          }
        }
      }
    }
    ownerVisitState.set(node, 2);
    return false;
  }

  for (const key of ownerDetAdj.keys()) {
    if ((ownerVisitState.get(key) ?? 0) === 0) {
      if (hasOwnerCycle(key)) {
        return {
          ok: false,
          stage: "EXECUTION_ENVELOPE_COMPATIBILITY",
          error: {
            code: "OWNER_DEPENDENCY_INCOMPATIBLE",
            path: `$.evaluationContext.ownerDeterminationBindings`,
            message: `Owner determination dependency graph contains a cycle`,
          },
        };
      }
    }
  }

  // Step 4 — Success
  return {
    ok: true,
    executionRequest: request,
    wholeRequestDigestCandidate,
  };
}
