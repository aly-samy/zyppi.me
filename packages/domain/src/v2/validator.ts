import type { ValidationResult } from "../index.js";
import type { ExecutionRequestV2ValidationError } from "./errors.js";
import { isStrictJsonValueV2 } from "./json.js";
import type {
  ConstitutionalRefBaseV2,
  ConstitutionalRefFamilyV2,
} from "./refs.js";
import type { ExecutionRequestV2 } from "./types.js";

const DIGEST_REGEX = /^sha256:[0-9a-f]{64}$/;
const ISO_8601_INSTANT_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/i;

const ALLOWED_REF_FAMILIES = new Set<ConstitutionalRefFamilyV2>([
  "SUBJECT",
  "ACTION_SEMANTIC",
  "TARGET",
  "STATE_SEMANTIC",
  "STATE_INSTANCE",
  "REQUESTED_CAPABILITY",
  "AGENCY_BASIS",
  "POLICY",
  "EVIDENCE",
  "QUESTION_SEMANTIC",
  "TARGET_SLOT_SEMANTIC",
  "COMPATIBILITY_CONTRACT",
  "EVIDENCE_REQUIREMENT",
  "SCOPE",
  "RULE",
  "PROVENANCE",
  "OWNER",
  "RELATIONSHIP",
  "STATE_ARTIFACT",
  "EVALUATION_SEMANTIC",
]);

const FLOATING_VERSION_INDICATORS = ["latest", "current", "*"];

function isFloatingVersion(v: string): boolean {
  const trimmed = v.trim().toLowerCase();
  if (FLOATING_VERSION_INDICATORS.includes(trimmed)) return true;
  if (
    trimmed.startsWith("^") ||
    trimmed.startsWith("~") ||
    trimmed.startsWith(">") ||
    trimmed.startsWith("<")
  ) {
    return true;
  }
  if (trimmed.includes(".x") || trimmed.includes(".*")) return true;
  return false;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (val === null || typeof val !== "object" || Array.isArray(val)) {
    return false;
  }
  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || proto === null;
}

function checkAllowedKeys(
  obj: Record<string, unknown>,
  allowedKeys: string[],
  path: string,
): ExecutionRequestV2ValidationError | null {
  const keys = Object.keys(obj);
  for (const k of keys) {
    if (!allowedKeys.includes(k)) {
      return {
        code: "UNKNOWN_FIELD",
        path: path ? `${path}.${k}` : k,
        message: `Unknown field '${k}'`,
      };
    }
  }
  return null;
}

function validateRef<F extends ConstitutionalRefFamilyV2>(
  input: unknown,
  path: string,
  expectedFamily?: F,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object reference`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    [
      "family",
      "ownerRef",
      "artifactId",
      "version",
      "stateRef",
      "provenanceRef",
    ],
    path,
  );
  if (errKey) return errKey;

  const ref = input as Record<string, unknown>;

  if (
    typeof ref.family !== "string" ||
    !ALLOWED_REF_FAMILIES.has(ref.family as ConstitutionalRefFamilyV2)
  ) {
    return {
      code: "INVALID_REFERENCE",
      path: `${path}.family`,
      message: `Invalid reference family '${ref.family}'`,
    };
  }

  if (expectedFamily && ref.family !== expectedFamily) {
    return {
      code: "INVALID_REFERENCE",
      path: `${path}.family`,
      message: `Expected reference family '${expectedFamily}', got '${ref.family}'`,
    };
  }

  if (typeof ref.ownerRef !== "string" || ref.ownerRef.trim() === "") {
    return {
      code: "INVALID_REFERENCE",
      path: `${path}.ownerRef`,
      message: "ownerRef must be a non-empty string",
    };
  }

  if (typeof ref.artifactId !== "string" || ref.artifactId.trim() === "") {
    return {
      code: "INVALID_REFERENCE",
      path: `${path}.artifactId`,
      message: "artifactId must be a non-empty string",
    };
  }

  if (ref.version !== undefined) {
    if (typeof ref.version !== "string" || ref.version.trim() === "") {
      return {
        code: "INVALID_REFERENCE",
        path: `${path}.version`,
        message: "version must be a non-empty string if provided",
      };
    }
    if (isFloatingVersion(ref.version)) {
      return {
        code: "INVALID_VALUE",
        path: `${path}.version`,
        message: `Floating or non-exact version '${ref.version}' is rejected`,
      };
    }
  }

  if (ref.stateRef !== undefined) {
    if (typeof ref.stateRef !== "string" || ref.stateRef.trim() === "") {
      return {
        code: "INVALID_REFERENCE",
        path: `${path}.stateRef`,
        message: "stateRef must be a non-empty string if provided",
      };
    }
  }

  if (ref.provenanceRef !== undefined) {
    if (
      typeof ref.provenanceRef !== "string" ||
      ref.provenanceRef.trim() === ""
    ) {
      return {
        code: "INVALID_REFERENCE",
        path: `${path}.provenanceRef`,
        message: "provenanceRef must be a non-empty string if provided",
      };
    }
  }

  return null;
}

function validateDigest(
  val: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (typeof val !== "string" || !DIGEST_REGEX.test(val)) {
    return {
      code: "INVALID_DIGEST",
      path,
      message: `${path} must match ^sha256:[0-9a-f]{64}$`,
    };
  }
  return null;
}

function validateIso8601Timestamp(
  val: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (typeof val !== "string" || !ISO_8601_INSTANT_REGEX.test(val)) {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} must be a valid ISO-8601 timestamp string`,
    };
  }
  if (isNaN(Date.parse(val))) {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} represents an invalid date instant`,
    };
  }
  return null;
}

// ------------------- Section Validators -------------------

function validateParticipation(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    ["roleBindings", "agencyBindings"],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  if (!Array.isArray(raw.roleBindings)) {
    return {
      code: "INVALID_TYPE",
      path: `${path}.roleBindings`,
      message: `${path}.roleBindings must be an array`,
    };
  }

  if (raw.roleBindings.length === 0) {
    return {
      code: "INVALID_CARDINALITY",
      path: `${path}.roleBindings`,
      message: `${path}.roleBindings must contain at least 1 element`,
    };
  }

  const roleBindingKeys = new Set<string>();
  const subjectRolePairs = new Set<string>();
  let actorCount = 0;

  for (let i = 0; i < raw.roleBindings.length; i++) {
    const rbPath = `${path}.roleBindings[${i}]`;
    const rb = raw.roleBindings[i];
    if (!isPlainObject(rb)) {
      return {
        code: "INVALID_TYPE",
        path: rbPath,
        message: `${rbPath} must be a plain object`,
      };
    }
    const errRbKey = checkAllowedKeys(
      rb,
      ["roleBindingKey", "role", "subject"],
      rbPath,
    );
    if (errRbKey) return errRbKey;

    if (
      typeof rb.roleBindingKey !== "string" ||
      rb.roleBindingKey.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${rbPath}.roleBindingKey`,
        message: "roleBindingKey must be a non-empty string",
      };
    }

    if (roleBindingKeys.has(rb.roleBindingKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${rbPath}.roleBindingKey`,
        message: `Duplicate roleBindingKey '${rb.roleBindingKey}'`,
      };
    }
    roleBindingKeys.add(rb.roleBindingKey);

    if (
      rb.role !== "ACTOR" &&
      rb.role !== "GOVERNED_SUBJECT" &&
      rb.role !== "INTENT_ORIGINATOR"
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${rbPath}.role`,
        message: "role must be ACTOR, GOVERNED_SUBJECT, or INTENT_ORIGINATOR",
      };
    }

    if (rb.role === "ACTOR") {
      actorCount++;
    }

    if (!isPlainObject(rb.subject)) {
      return {
        code: "INVALID_TYPE",
        path: `${rbPath}.subject`,
        message: `${rbPath}.subject must be a plain object`,
      };
    }

    const subj = rb.subject as Record<string, unknown>;
    if (subj.kind === "KNOWN") {
      const errSubjKey = checkAllowedKeys(
        subj,
        ["kind", "subjectRef"],
        `${rbPath}.subject`,
      );
      if (errSubjKey) return errSubjKey;

      const errRef = validateRef(
        subj.subjectRef,
        `${rbPath}.subject.subjectRef`,
        "SUBJECT",
      );
      if (errRef) return errRef;

      const refObj = subj.subjectRef as ConstitutionalRefBaseV2<"SUBJECT">;
      const pairKey = `${refObj.ownerRef}:${refObj.artifactId}::${rb.role}`;
      if (subjectRolePairs.has(pairKey)) {
        return {
          code: "DUPLICATE_BINDING",
          path: `${rbPath}.subject`,
          message: `Duplicate (Subject, Role) pair detected for '${pairKey}'`,
        };
      }
      subjectRolePairs.add(pairKey);
    } else if (subj.kind === "UNKNOWN") {
      const errSubjKey = checkAllowedKeys(subj, ["kind"], `${rbPath}.subject`);
      if (errSubjKey) return errSubjKey;

      if (rb.role !== "ACTOR") {
        return {
          code: "INVALID_VALUE",
          path: `${rbPath}.subject.kind`,
          message: "UNKNOWN subject is only valid for ACTOR role",
        };
      }
    } else {
      return {
        code: "INVALID_VALUE",
        path: `${rbPath}.subject.kind`,
        message: "subject.kind must be KNOWN or UNKNOWN",
      };
    }
  }

  if (actorCount < 1) {
    return {
      code: "INVALID_CARDINALITY",
      path: `${path}.roleBindings`,
      message: "Participation must contain at least 1 ACTOR role binding",
    };
  }

  if (!Array.isArray(raw.agencyBindings)) {
    return {
      code: "INVALID_TYPE",
      path: `${path}.agencyBindings`,
      message: `${path}.agencyBindings must be an array`,
    };
  }

  const agencyBindingKeys = new Set<string>();
  for (let i = 0; i < raw.agencyBindings.length; i++) {
    const abPath = `${path}.agencyBindings[${i}]`;
    const ab = raw.agencyBindings[i];
    if (!isPlainObject(ab)) {
      return {
        code: "INVALID_TYPE",
        path: abPath,
        message: `${abPath} must be a plain object`,
      };
    }
    const errAbKey = checkAllowedKeys(
      ab,
      [
        "agencyBindingKey",
        "actorRoleBindingRef",
        "governedSubjectRoleBindingRef",
        "terminalAgencyBasisRef",
      ],
      abPath,
    );
    if (errAbKey) return errAbKey;

    if (
      typeof ab.agencyBindingKey !== "string" ||
      ab.agencyBindingKey.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${abPath}.agencyBindingKey`,
        message: "agencyBindingKey must be a non-empty string",
      };
    }

    if (agencyBindingKeys.has(ab.agencyBindingKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${abPath}.agencyBindingKey`,
        message: `Duplicate agencyBindingKey '${ab.agencyBindingKey}'`,
      };
    }
    agencyBindingKeys.add(ab.agencyBindingKey);

    if (
      typeof ab.actorRoleBindingRef !== "string" ||
      ab.actorRoleBindingRef.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${abPath}.actorRoleBindingRef`,
        message: "actorRoleBindingRef must be a non-empty string",
      };
    }

    if (
      typeof ab.governedSubjectRoleBindingRef !== "string" ||
      ab.governedSubjectRoleBindingRef.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${abPath}.governedSubjectRoleBindingRef`,
        message: "governedSubjectRoleBindingRef must be a non-empty string",
      };
    }

    const errRef = validateRef(
      ab.terminalAgencyBasisRef,
      `${abPath}.terminalAgencyBasisRef`,
      "AGENCY_BASIS",
    );
    if (errRef) return errRef;
  }

  return null;
}

function validateIntent(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    [
      "originatorParticipationRef",
      "intentCategory",
      "intentTargetRef",
      "candidateStateBinding",
    ],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  if (
    typeof raw.originatorParticipationRef !== "string" ||
    raw.originatorParticipationRef.trim() === ""
  ) {
    return {
      code: "INVALID_VALUE",
      path: `${path}.originatorParticipationRef`,
      message: "originatorParticipationRef must be a non-empty string",
    };
  }

  const validCategories = [
    "DISCOVER",
    "ACCESS",
    "VERIFY",
    "AUTHENTICATE",
    "REGISTER",
    "CLAIM",
    "PURCHASE",
    "TRANSFER",
    "RETURN",
    "SUPPORT",
    "SUBSCRIBE",
    "TRIGGER",
  ];
  if (
    typeof raw.intentCategory !== "string" ||
    !validCategories.includes(raw.intentCategory)
  ) {
    return {
      code: "INVALID_VALUE",
      path: `${path}.intentCategory`,
      message: `intentCategory must be one of: ${validCategories.join(", ")}`,
    };
  }

  const errTarget = validateRef(
    raw.intentTargetRef,
    `${path}.intentTargetRef`,
    "TARGET",
  );
  if (errTarget) return errTarget;

  if (raw.candidateStateBinding !== undefined) {
    const csbPath = `${path}.candidateStateBinding`;
    if (!isPlainObject(raw.candidateStateBinding)) {
      return {
        code: "INVALID_TYPE",
        path: csbPath,
        message: `${csbPath} must be a plain object`,
      };
    }
    const errCsbKey = checkAllowedKeys(
      raw.candidateStateBinding,
      [
        "stateTargetRef",
        "stateSemanticRef",
        "exactStateInstance",
        "ownerTypedMaterial",
      ],
      csbPath,
    );
    if (errCsbKey) return errCsbKey;

    const csb = raw.candidateStateBinding as Record<string, unknown>;

    const errStRef = validateRef(
      csb.stateTargetRef,
      `${csbPath}.stateTargetRef`,
      "TARGET",
    );
    if (errStRef) return errStRef;

    const errSsRef = validateRef(
      csb.stateSemanticRef,
      `${csbPath}.stateSemanticRef`,
      "STATE_SEMANTIC",
    );
    if (errSsRef) return errSsRef;

    if (csb.exactStateInstance !== undefined) {
      const errEsi = validateRef(
        csb.exactStateInstance,
        `${csbPath}.exactStateInstance`,
        "STATE_INSTANCE",
      );
      if (errEsi) return errEsi;
    }

    if (csb.ownerTypedMaterial !== undefined) {
      const otmPath = `${csbPath}.ownerTypedMaterial`;
      if (!isPlainObject(csb.ownerTypedMaterial)) {
        return {
          code: "INVALID_TYPE",
          path: otmPath,
          message: `${otmPath} must be a plain object`,
        };
      }
      const errOtmKey = checkAllowedKeys(
        csb.ownerTypedMaterial,
        ["ownerRef", "schemaRef", "material"],
        otmPath,
      );
      if (errOtmKey) return errOtmKey;

      const otm = csb.ownerTypedMaterial as Record<string, unknown>;

      const errOwnRef = validateRef(
        otm.ownerRef,
        `${otmPath}.ownerRef`,
        "OWNER",
      );
      if (errOwnRef) return errOwnRef;

      const errSchRef = validateRef(
        otm.schemaRef,
        `${otmPath}.schemaRef`,
        "STATE_ARTIFACT",
      );
      if (errSchRef) return errSchRef;

      if (otm.material === undefined || !isStrictJsonValueV2(otm.material)) {
        return {
          code: "INVALID_RUNTIME_VALUE",
          path: `${otmPath}.material`,
          message: `${otmPath}.material must be a strict JSON value`,
        };
      }
    }
  }

  return null;
}

function validateRequestedAction(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    [
      "actionSemanticRef",
      "intentActionCompatibilityBinding",
      "actionPerformerBindings",
      "actionTargetBindings",
      "requestedCapabilityClaimBindings",
    ],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  const errActRef = validateRef(
    raw.actionSemanticRef,
    `${path}.actionSemanticRef`,
    "ACTION_SEMANTIC",
  );
  if (errActRef) return errActRef;

  // intentActionCompatibilityBinding
  const compatPath = `${path}.intentActionCompatibilityBinding`;
  if (!isPlainObject(raw.intentActionCompatibilityBinding)) {
    return {
      code: "INVALID_TYPE",
      path: compatPath,
      message: `${compatPath} must be a plain object`,
    };
  }
  const errCompatKey = checkAllowedKeys(
    raw.intentActionCompatibilityBinding,
    ["compatibilityKind", "contractRef"],
    compatPath,
  );
  if (errCompatKey) return errCompatKey;

  const compat = raw.intentActionCompatibilityBinding as Record<
    string,
    unknown
  >;
  if (
    compat.compatibilityKind !== "GOVERNED_SEMANTIC_CONTRACT" &&
    compat.compatibilityKind !== "OWNER_DETERMINATION"
  ) {
    return {
      code: "INVALID_VALUE",
      path: `${compatPath}.compatibilityKind`,
      message:
        "compatibilityKind must be GOVERNED_SEMANTIC_CONTRACT or OWNER_DETERMINATION",
    };
  }
  if (compat.contractRef !== undefined) {
    const errCR = validateRef(
      compat.contractRef,
      `${compatPath}.contractRef`,
      "COMPATIBILITY_CONTRACT",
    );
    if (errCR) return errCR;
  }

  // actionPerformerBindings [1..N]
  if (!Array.isArray(raw.actionPerformerBindings)) {
    return {
      code: "INVALID_TYPE",
      path: `${path}.actionPerformerBindings`,
      message: `${path}.actionPerformerBindings must be an array`,
    };
  }
  if (raw.actionPerformerBindings.length === 0) {
    return {
      code: "INVALID_CARDINALITY",
      path: `${path}.actionPerformerBindings`,
      message: `${path}.actionPerformerBindings must contain at least 1 element`,
    };
  }

  const performerKeys = new Set<string>();
  for (let i = 0; i < raw.actionPerformerBindings.length; i++) {
    const apbPath = `${path}.actionPerformerBindings[${i}]`;
    const apb = raw.actionPerformerBindings[i];
    if (!isPlainObject(apb)) {
      return {
        code: "INVALID_TYPE",
        path: apbPath,
        message: `${apbPath} must be a plain object`,
      };
    }
    const errApbKey = checkAllowedKeys(
      apb,
      ["performerKey", "actorParticipationRef", "agencyReliance"],
      apbPath,
    );
    if (errApbKey) return errApbKey;

    if (
      typeof apb.performerKey !== "string" ||
      apb.performerKey.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${apbPath}.performerKey`,
        message: "performerKey must be a non-empty string",
      };
    }

    if (performerKeys.has(apb.performerKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${apbPath}.performerKey`,
        message: `Duplicate performerKey '${apb.performerKey}'`,
      };
    }
    performerKeys.add(apb.performerKey);

    if (
      typeof apb.actorParticipationRef !== "string" ||
      apb.actorParticipationRef.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${apbPath}.actorParticipationRef`,
        message: "actorParticipationRef must be a non-empty string",
      };
    }

    // agencyReliance
    const arPath = `${apbPath}.agencyReliance`;
    if (!isPlainObject(apb.agencyReliance)) {
      return {
        code: "INVALID_TYPE",
        path: arPath,
        message: `${arPath} must be a plain object`,
      };
    }
    const ar = apb.agencyReliance as Record<string, unknown>;
    if (ar.kind === "NO_DELEGATED_AGENCY_RELIANCE") {
      const errArKey = checkAllowedKeys(ar, ["kind"], arPath);
      if (errArKey) return errArKey;
    } else if (ar.kind === "DELEGATED_AGENCY_SINGLE") {
      const errArKey = checkAllowedKeys(
        ar,
        ["kind", "agencyBindingRef"],
        arPath,
      );
      if (errArKey) return errArKey;

      if (
        typeof ar.agencyBindingRef !== "string" ||
        ar.agencyBindingRef.trim() === ""
      ) {
        return {
          code: "INVALID_VALUE",
          path: `${arPath}.agencyBindingRef`,
          message: "agencyBindingRef must be a non-empty string",
        };
      }
    } else if (ar.kind === "DELEGATED_AGENCY_COMPOSED") {
      const errArKey = checkAllowedKeys(
        ar,
        ["kind", "agencyBindingRefs", "agencyCompositionBasisRef"],
        arPath,
      );
      if (errArKey) return errArKey;

      if (!Array.isArray(ar.agencyBindingRefs)) {
        return {
          code: "INVALID_TYPE",
          path: `${arPath}.agencyBindingRefs`,
          message: `${arPath}.agencyBindingRefs must be an array`,
        };
      }
      if (ar.agencyBindingRefs.length < 2) {
        return {
          code: "INVALID_CARDINALITY",
          path: `${arPath}.agencyBindingRefs`,
          message:
            "DELEGATED_AGENCY_COMPOSED requires at least 2 unique agencyBindingRefs",
        };
      }
      const refSet = new Set<string>();
      for (let j = 0; j < ar.agencyBindingRefs.length; j++) {
        const refItem = ar.agencyBindingRefs[j];
        if (typeof refItem !== "string" || refItem.trim() === "") {
          return {
            code: "INVALID_VALUE",
            path: `${arPath}.agencyBindingRefs[${j}]`,
            message: "agencyBindingRef element must be a non-empty string",
          };
        }
        if (refSet.has(refItem)) {
          return {
            code: "DUPLICATE_BINDING",
            path: `${arPath}.agencyBindingRefs[${j}]`,
            message: `Duplicate agencyBindingRef '${refItem}' in composed agency reliance`,
          };
        }
        refSet.add(refItem);
      }

      const errAcbRef = validateRef(
        ar.agencyCompositionBasisRef,
        `${arPath}.agencyCompositionBasisRef`,
        "AGENCY_BASIS",
      );
      if (errAcbRef) return errAcbRef;
    } else {
      return {
        code: "INVALID_VALUE",
        path: `${arPath}.kind`,
        message:
          "agencyReliance.kind must be NO_DELEGATED_AGENCY_RELIANCE, DELEGATED_AGENCY_SINGLE, or DELEGATED_AGENCY_COMPOSED",
      };
    }
  }

  // actionTargetBindings [0..N]
  if (!Array.isArray(raw.actionTargetBindings)) {
    return {
      code: "INVALID_TYPE",
      path: `${path}.actionTargetBindings`,
      message: `${path}.actionTargetBindings must be an array`,
    };
  }
  for (let i = 0; i < raw.actionTargetBindings.length; i++) {
    const atbPath = `${path}.actionTargetBindings[${i}]`;
    const atb = raw.actionTargetBindings[i];
    if (!isPlainObject(atb)) {
      return {
        code: "INVALID_TYPE",
        path: atbPath,
        message: `${atbPath} must be a plain object`,
      };
    }
    const errAtbKey = checkAllowedKeys(
      atb,
      ["targetSlotSemanticRef", "targetRef"],
      atbPath,
    );
    if (errAtbKey) return errAtbKey;

    const errTsRef = validateRef(
      atb.targetSlotSemanticRef,
      `${atbPath}.targetSlotSemanticRef`,
      "TARGET_SLOT_SEMANTIC",
    );
    if (errTsRef) return errTsRef;

    const errTRef = validateRef(
      atb.targetRef,
      `${atbPath}.targetRef`,
      "TARGET",
    );
    if (errTRef) return errTRef;
  }

  // requestedCapabilityClaimBindings [0..N]
  if (!Array.isArray(raw.requestedCapabilityClaimBindings)) {
    return {
      code: "INVALID_TYPE",
      path: `${path}.requestedCapabilityClaimBindings`,
      message: `${path}.requestedCapabilityClaimBindings must be an array`,
    };
  }

  const claimKeys = new Set<string>();
  for (let i = 0; i < raw.requestedCapabilityClaimBindings.length; i++) {
    const rccbPath = `${path}.requestedCapabilityClaimBindings[${i}]`;
    const rccb = raw.requestedCapabilityClaimBindings[i];
    if (!isPlainObject(rccb)) {
      return {
        code: "INVALID_TYPE",
        path: rccbPath,
        message: `${rccbPath} must be a plain object`,
      };
    }
    const errRccbKey = checkAllowedKeys(
      rccb,
      ["capabilityClaimKey", "requestedCapabilityRef", "claimantPerformerRefs"],
      rccbPath,
    );
    if (errRccbKey) return errRccbKey;

    if (
      typeof rccb.capabilityClaimKey !== "string" ||
      rccb.capabilityClaimKey.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${rccbPath}.capabilityClaimKey`,
        message: "capabilityClaimKey must be a non-empty string",
      };
    }

    if (claimKeys.has(rccb.capabilityClaimKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${rccbPath}.capabilityClaimKey`,
        message: `Duplicate capabilityClaimKey '${rccb.capabilityClaimKey}'`,
      };
    }
    claimKeys.add(rccb.capabilityClaimKey);

    const errCapRef = validateRef(
      rccb.requestedCapabilityRef,
      `${rccbPath}.requestedCapabilityRef`,
      "REQUESTED_CAPABILITY",
    );
    if (errCapRef) return errCapRef;

    if (!Array.isArray(rccb.claimantPerformerRefs)) {
      return {
        code: "INVALID_TYPE",
        path: `${rccbPath}.claimantPerformerRefs`,
        message: `${rccbPath}.claimantPerformerRefs must be an array`,
      };
    }
    if (rccb.claimantPerformerRefs.length === 0) {
      return {
        code: "INVALID_CARDINALITY",
        path: `${rccbPath}.claimantPerformerRefs`,
        message: `${rccbPath}.claimantPerformerRefs must contain at least 1 element`,
      };
    }

    const claimantSet = new Set<string>();
    for (let j = 0; j < rccb.claimantPerformerRefs.length; j++) {
      const cRef = rccb.claimantPerformerRefs[j];
      if (typeof cRef !== "string" || cRef.trim() === "") {
        return {
          code: "INVALID_VALUE",
          path: `${rccbPath}.claimantPerformerRefs[${j}]`,
          message: "claimantPerformerRef element must be a non-empty string",
        };
      }
      if (claimantSet.has(cRef)) {
        return {
          code: "DUPLICATE_BINDING",
          path: `${rccbPath}.claimantPerformerRefs[${j}]`,
          message: `Duplicate claimantPerformerRef '${cRef}'`,
        };
      }
      claimantSet.add(cRef);
    }
  }

  return null;
}

function validateConstitutionalState(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    ["semanticStateRef", "stateViews"],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  const errDig = validateDigest(
    raw.semanticStateRef,
    `${path}.semanticStateRef`,
  );
  if (errDig) return errDig;

  if (!Array.isArray(raw.stateViews)) {
    return {
      code: "INVALID_TYPE",
      path: `${path}.stateViews`,
      message: `${path}.stateViews must be an array`,
    };
  }
  if (raw.stateViews.length === 0) {
    return {
      code: "INVALID_CARDINALITY",
      path: `${path}.stateViews`,
      message: `${path}.stateViews must contain at least 1 element`,
    };
  }

  const viewKeys = new Set<string>();
  const validKinds = [
    "IDENTITY_STATE",
    "STANDING_STATE",
    "AUTHORITY_STATE",
    "CAPABILITY_STATE",
    "AGENCY_STATE",
    "RELATIONSHIP_STATE",
  ];

  for (let i = 0; i < raw.stateViews.length; i++) {
    const svPath = `${path}.stateViews[${i}]`;
    const sv = raw.stateViews[i];
    if (!isPlainObject(sv)) {
      return {
        code: "INVALID_TYPE",
        path: svPath,
        message: `${svPath} must be a plain object`,
      };
    }
    const errSvKey = checkAllowedKeys(
      sv,
      ["viewKey", "viewScope", "stateBindings"],
      svPath,
    );
    if (errSvKey) return errSvKey;

    if (typeof sv.viewKey !== "string" || sv.viewKey.trim() === "") {
      return {
        code: "INVALID_VALUE",
        path: `${svPath}.viewKey`,
        message: "viewKey must be a non-empty string",
      };
    }

    if (viewKeys.has(sv.viewKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${svPath}.viewKey`,
        message: `Duplicate viewKey '${sv.viewKey}'`,
      };
    }
    viewKeys.add(sv.viewKey);

    const errScopeRef = validateRef(
      sv.viewScope,
      `${svPath}.viewScope`,
      "SCOPE",
    );
    if (errScopeRef) return errScopeRef;

    if (!Array.isArray(sv.stateBindings)) {
      return {
        code: "INVALID_TYPE",
        path: `${svPath}.stateBindings`,
        message: `${svPath}.stateBindings must be an array`,
      };
    }

    const sbKeys = new Set<string>();
    for (let j = 0; j < sv.stateBindings.length; j++) {
      const sbPath = `${svPath}.stateBindings[${j}]`;
      const sb = sv.stateBindings[j];
      if (!isPlainObject(sb)) {
        return {
          code: "INVALID_TYPE",
          path: sbPath,
          message: `${sbPath} must be a plain object`,
        };
      }
      const errSbKey = checkAllowedKeys(
        sb,
        [
          "stateBindingKey",
          "kind",
          "subjectRef",
          "stateSemanticRef",
          "exactStateRef",
          "stateArtifactRef",
          "relationshipKind",
          "relationshipRef",
          "sourceEndpointRef",
          "targetEndpointRef",
        ],
        sbPath,
      );
      if (errSbKey) return errSbKey;

      if (
        typeof sb.stateBindingKey !== "string" ||
        sb.stateBindingKey.trim() === ""
      ) {
        return {
          code: "INVALID_VALUE",
          path: `${sbPath}.stateBindingKey`,
          message: "stateBindingKey must be a non-empty string",
        };
      }

      if (sbKeys.has(sb.stateBindingKey)) {
        return {
          code: "DUPLICATE_BINDING",
          path: `${sbPath}.stateBindingKey`,
          message: `Duplicate stateBindingKey '${sb.stateBindingKey}'`,
        };
      }
      sbKeys.add(sb.stateBindingKey);

      if (typeof sb.kind !== "string" || !validKinds.includes(sb.kind)) {
        return {
          code: "INVALID_VALUE",
          path: `${sbPath}.kind`,
          message: `kind must be one of: ${validKinds.join(", ")}`,
        };
      }

      const errSubjRef = validateRef(
        sb.subjectRef,
        `${sbPath}.subjectRef`,
        "SUBJECT",
      );
      if (errSubjRef) return errSubjRef;

      const errSsRef = validateRef(
        sb.stateSemanticRef,
        `${sbPath}.stateSemanticRef`,
        "STATE_SEMANTIC",
      );
      if (errSsRef) return errSsRef;

      if (sb.exactStateRef !== undefined) {
        const errEsi = validateRef(
          sb.exactStateRef,
          `${sbPath}.exactStateRef`,
          "STATE_INSTANCE",
        );
        if (errEsi) return errEsi;
      }

      if (sb.stateArtifactRef !== undefined) {
        const errSa = validateRef(
          sb.stateArtifactRef,
          `${sbPath}.stateArtifactRef`,
          "STATE_ARTIFACT",
        );
        if (errSa) return errSa;
      }

      if (sb.relationshipKind !== undefined) {
        if (
          sb.relationshipKind !== "STRUCTURAL" &&
          sb.relationshipKind !== "REIFIED"
        ) {
          return {
            code: "INVALID_VALUE",
            path: `${sbPath}.relationshipKind`,
            message: "relationshipKind must be STRUCTURAL or REIFIED",
          };
        }
      }

      if (sb.relationshipRef !== undefined) {
        const errRelRef = validateRef(
          sb.relationshipRef,
          `${sbPath}.relationshipRef`,
          "RELATIONSHIP",
        );
        if (errRelRef) return errRelRef;
      }

      if (sb.sourceEndpointRef !== undefined) {
        const errSrcRef = validateRef(
          sb.sourceEndpointRef,
          `${sbPath}.sourceEndpointRef`,
        );
        if (errSrcRef) return errSrcRef;
      }

      if (sb.targetEndpointRef !== undefined) {
        const errTgtRef = validateRef(
          sb.targetEndpointRef,
          `${sbPath}.targetEndpointRef`,
        );
        if (errTgtRef) return errTgtRef;
      }
    }
  }

  return null;
}

function validateEvidenceState(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    [
      "evidenceStateRef",
      "evidenceRequirementBindings",
      "suppliedEvidenceMaterial",
      "evidencePresentationBindings",
      "integrityCoordinates",
    ],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  const errDig = validateDigest(
    raw.evidenceStateRef,
    `${path}.evidenceStateRef`,
  );
  if (errDig) return errDig;

  // Requirement Collections MUST be explicitly present (arrays)
  if (!Array.isArray(raw.evidenceRequirementBindings)) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.evidenceRequirementBindings`,
      message: `${path}.evidenceRequirementBindings must be explicitly present as an array`,
    };
  }

  if (!Array.isArray(raw.suppliedEvidenceMaterial)) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.suppliedEvidenceMaterial`,
      message: `${path}.suppliedEvidenceMaterial must be explicitly present as an array`,
    };
  }

  if (!Array.isArray(raw.evidencePresentationBindings)) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.evidencePresentationBindings`,
      message: `${path}.evidencePresentationBindings must be explicitly present as an array`,
    };
  }

  if (!Array.isArray(raw.integrityCoordinates)) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.integrityCoordinates`,
      message: `${path}.integrityCoordinates must be explicitly present as an array`,
    };
  }

  // 1. evidenceRequirementBindings
  const reqKeys = new Set<string>();
  for (let i = 0; i < raw.evidenceRequirementBindings.length; i++) {
    const erbPath = `${path}.evidenceRequirementBindings[${i}]`;
    const erb = raw.evidenceRequirementBindings[i];
    if (!isPlainObject(erb)) {
      return {
        code: "INVALID_TYPE",
        path: erbPath,
        message: `${erbPath} must be a plain object`,
      };
    }
    const errErbKey = checkAllowedKeys(
      erb,
      [
        "requirementKey",
        "governedRequirementRef",
        "requirementAuthorityBinding",
        "requirementScopeBinding",
      ],
      erbPath,
    );
    if (errErbKey) return errErbKey;

    if (
      typeof erb.requirementKey !== "string" ||
      erb.requirementKey.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${erbPath}.requirementKey`,
        message: "requirementKey must be a non-empty string",
      };
    }
    if (reqKeys.has(erb.requirementKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${erbPath}.requirementKey`,
        message: `Duplicate requirementKey '${erb.requirementKey}'`,
      };
    }
    reqKeys.add(erb.requirementKey);

    const errGovRef = validateRef(
      erb.governedRequirementRef,
      `${erbPath}.governedRequirementRef`,
      "EVIDENCE_REQUIREMENT",
    );
    if (errGovRef) return errGovRef;

    const errAuthRef = validateRef(
      erb.requirementAuthorityBinding,
      `${erbPath}.requirementAuthorityBinding`,
      "OWNER",
    );
    if (errAuthRef) return errAuthRef;

    const errScopeRef = validateRef(
      erb.requirementScopeBinding,
      `${erbPath}.requirementScopeBinding`,
      "SCOPE",
    );
    if (errScopeRef) return errScopeRef;
  }

  // 2. suppliedEvidenceMaterial
  const matKeys = new Set<string>();
  for (let i = 0; i < raw.suppliedEvidenceMaterial.length; i++) {
    const semPath = `${path}.suppliedEvidenceMaterial[${i}]`;
    const sem = raw.suppliedEvidenceMaterial[i];
    if (!isPlainObject(sem)) {
      return {
        code: "INVALID_TYPE",
        path: semPath,
        message: `${semPath} must be a plain object`,
      };
    }
    const errSemKey = checkAllowedKeys(
      sem,
      ["materialKey", "evidenceRef", "ownerRef", "schemaRef", "material"],
      semPath,
    );
    if (errSemKey) return errSemKey;

    if (typeof sem.materialKey !== "string" || sem.materialKey.trim() === "") {
      return {
        code: "INVALID_VALUE",
        path: `${semPath}.materialKey`,
        message: "materialKey must be a non-empty string",
      };
    }
    if (matKeys.has(sem.materialKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${semPath}.materialKey`,
        message: `Duplicate materialKey '${sem.materialKey}'`,
      };
    }
    matKeys.add(sem.materialKey);

    const errEvRef = validateRef(
      sem.evidenceRef,
      `${semPath}.evidenceRef`,
      "EVIDENCE",
    );
    if (errEvRef) return errEvRef;

    const errOwnRef = validateRef(sem.ownerRef, `${semPath}.ownerRef`, "OWNER");
    if (errOwnRef) return errOwnRef;

    const errSchRef = validateRef(
      sem.schemaRef,
      `${semPath}.schemaRef`,
      "STATE_ARTIFACT",
    );
    if (errSchRef) return errSchRef;

    if (sem.material === undefined || !isStrictJsonValueV2(sem.material)) {
      return {
        code: "INVALID_RUNTIME_VALUE",
        path: `${semPath}.material`,
        message: `${semPath}.material must be a strict JSON value`,
      };
    }
  }

  // 3. evidencePresentationBindings
  for (let i = 0; i < raw.evidencePresentationBindings.length; i++) {
    const epbPath = `${path}.evidencePresentationBindings[${i}]`;
    const epb = raw.evidencePresentationBindings[i];
    if (!isPlainObject(epb)) {
      return {
        code: "INVALID_TYPE",
        path: epbPath,
        message: `${epbPath} must be a plain object`,
      };
    }
    const errEpbKey = checkAllowedKeys(
      epb,
      ["evidenceRequirementRef", "presentedEvidenceRefs"],
      epbPath,
    );
    if (errEpbKey) return errEpbKey;

    const errReqRef = validateRef(
      epb.evidenceRequirementRef,
      `${epbPath}.evidenceRequirementRef`,
      "EVIDENCE_REQUIREMENT",
    );
    if (errReqRef) return errReqRef;

    if (!Array.isArray(epb.presentedEvidenceRefs)) {
      return {
        code: "INVALID_TYPE",
        path: `${epbPath}.presentedEvidenceRefs`,
        message: `${epbPath}.presentedEvidenceRefs must be an array`,
      };
    }
    if (epb.presentedEvidenceRefs.length === 0) {
      return {
        code: "INVALID_CARDINALITY",
        path: `${epbPath}.presentedEvidenceRefs`,
        message: `${epbPath}.presentedEvidenceRefs must contain at least 1 element`,
      };
    }

    for (let j = 0; j < epb.presentedEvidenceRefs.length; j++) {
      const errEvRef = validateRef(
        epb.presentedEvidenceRefs[j],
        `${epbPath}.presentedEvidenceRefs[${j}]`,
        "EVIDENCE",
      );
      if (errEvRef) return errEvRef;
    }
  }

  // 4. integrityCoordinates
  const coordKeys = new Set<string>();
  for (let i = 0; i < raw.integrityCoordinates.length; i++) {
    const icPath = `${path}.integrityCoordinates[${i}]`;
    const ic = raw.integrityCoordinates[i];
    if (!isPlainObject(ic)) {
      return {
        code: "INVALID_TYPE",
        path: icPath,
        message: `${icPath} must be a plain object`,
      };
    }
    const errIcKey = checkAllowedKeys(
      ic,
      ["coordinateKey", "evidenceRef", "expectedDigest", "algorithm"],
      icPath,
    );
    if (errIcKey) return errIcKey;

    if (
      typeof ic.coordinateKey !== "string" ||
      ic.coordinateKey.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${icPath}.coordinateKey`,
        message: "coordinateKey must be a non-empty string",
      };
    }
    if (coordKeys.has(ic.coordinateKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${icPath}.coordinateKey`,
        message: `Duplicate coordinateKey '${ic.coordinateKey}'`,
      };
    }
    coordKeys.add(ic.coordinateKey);

    const errEvRef = validateRef(
      ic.evidenceRef,
      `${icPath}.evidenceRef`,
      "EVIDENCE",
    );
    if (errEvRef) return errEvRef;

    if (
      typeof ic.expectedDigest !== "string" ||
      ic.expectedDigest.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${icPath}.expectedDigest`,
        message: "expectedDigest must be a non-empty string",
      };
    }

    if (typeof ic.algorithm !== "string" || ic.algorithm.trim() === "") {
      return {
        code: "INVALID_VALUE",
        path: `${icPath}.algorithm`,
        message: "algorithm must be a non-empty string",
      };
    }
  }

  return null;
}

function validatePolicyUniverse(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    [
      "policyUniverseRef",
      "applicablePolicyMaterial",
      "dependencyTopology",
      "applicabilityProvenanceBinding",
    ],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  const errDig = validateDigest(
    raw.policyUniverseRef,
    `${path}.policyUniverseRef`,
  );
  if (errDig) return errDig;

  if (!Array.isArray(raw.applicablePolicyMaterial)) {
    return {
      code: "INVALID_TYPE",
      path: `${path}.applicablePolicyMaterial`,
      message: `${path}.applicablePolicyMaterial must be an array`,
    };
  }

  const polKeys = new Set<string>();
  for (let i = 0; i < raw.applicablePolicyMaterial.length; i++) {
    const apmPath = `${path}.applicablePolicyMaterial[${i}]`;
    const apm = raw.applicablePolicyMaterial[i];
    if (!isPlainObject(apm)) {
      return {
        code: "INVALID_TYPE",
        path: apmPath,
        message: `${apmPath} must be a plain object`,
      };
    }
    const errApmKey = checkAllowedKeys(
      apm,
      ["policyKey", "policyRef", "material"],
      apmPath,
    );
    if (errApmKey) return errApmKey;

    if (typeof apm.policyKey !== "string" || apm.policyKey.trim() === "") {
      return {
        code: "INVALID_VALUE",
        path: `${apmPath}.policyKey`,
        message: "policyKey must be a non-empty string",
      };
    }
    if (polKeys.has(apm.policyKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${apmPath}.policyKey`,
        message: `Duplicate policyKey '${apm.policyKey}'`,
      };
    }
    polKeys.add(apm.policyKey);

    const errPolRef = validateRef(
      apm.policyRef,
      `${apmPath}.policyRef`,
      "POLICY",
    );
    if (errPolRef) return errPolRef;

    if (apm.material === undefined || !isStrictJsonValueV2(apm.material)) {
      return {
        code: "INVALID_RUNTIME_VALUE",
        path: `${apmPath}.material`,
        message: `${apmPath}.material must be a strict JSON value`,
      };
    }
  }

  // dependencyTopology MUST be explicit object
  const topoPath = `${path}.dependencyTopology`;
  if (!isPlainObject(raw.dependencyTopology)) {
    return {
      code: "MISSING_FIELD",
      path: topoPath,
      message: `${topoPath} must be explicitly present as a plain object`,
    };
  }
  const errTopoKey = checkAllowedKeys(
    raw.dependencyTopology,
    ["dependencyEdges"],
    topoPath,
  );
  if (errTopoKey) return errTopoKey;

  const topo = raw.dependencyTopology as Record<string, unknown>;
  if (!Array.isArray(topo.dependencyEdges)) {
    return {
      code: "INVALID_TYPE",
      path: `${topoPath}.dependencyEdges`,
      message: `${topoPath}.dependencyEdges must be an array`,
    };
  }

  for (let i = 0; i < topo.dependencyEdges.length; i++) {
    const edgePath = `${topoPath}.dependencyEdges[${i}]`;
    const edge = topo.dependencyEdges[i];
    if (!isPlainObject(edge)) {
      return {
        code: "INVALID_TYPE",
        path: edgePath,
        message: `${edgePath} must be a plain object`,
      };
    }
    const errEdgeKey = checkAllowedKeys(
      edge,
      ["dependeePolicyRef", "dependentPolicyRef"],
      edgePath,
    );
    if (errEdgeKey) return errEdgeKey;

    const errDeRef = validateRef(
      edge.dependeePolicyRef,
      `${edgePath}.dependeePolicyRef`,
      "POLICY",
    );
    if (errDeRef) return errDeRef;

    const errDpRef = validateRef(
      edge.dependentPolicyRef,
      `${edgePath}.dependentPolicyRef`,
      "POLICY",
    );
    if (errDpRef) return errDpRef;
  }

  const errProvRef = validateRef(
    raw.applicabilityProvenanceBinding,
    `${path}.applicabilityProvenanceBinding`,
    "PROVENANCE",
  );
  if (errProvRef) return errProvRef;

  return null;
}

function validateEvaluationContextBinding(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    ["bindingKey", "semanticRef", "value", "provenanceRef", "authorityRef"],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  if (typeof raw.bindingKey !== "string" || raw.bindingKey.trim() === "") {
    return {
      code: "INVALID_VALUE",
      path: `${path}.bindingKey`,
      message: "bindingKey must be a non-empty string",
    };
  }

  const errSemRef = validateRef(
    raw.semanticRef,
    `${path}.semanticRef`,
    "EVALUATION_SEMANTIC",
  );
  if (errSemRef) return errSemRef;

  if (raw.value === undefined || !isStrictJsonValueV2(raw.value)) {
    return {
      code: "INVALID_RUNTIME_VALUE",
      path: `${path}.value`,
      message: `${path}.value must be a strict JSON value`,
    };
  }

  if (raw.provenanceRef !== undefined) {
    const errProvRef = validateRef(
      raw.provenanceRef,
      `${path}.provenanceRef`,
      "PROVENANCE",
    );
    if (errProvRef) return errProvRef;
  }

  if (raw.authorityRef !== undefined) {
    const errAuthRef = validateRef(
      raw.authorityRef,
      `${path}.authorityRef`,
      "OWNER",
    );
    if (errAuthRef) return errAuthRef;
  }

  return null;
}

function validateOwnerDetermination(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    [
      "determinationBindingKey",
      "determinationQuestionBinding",
      "constitutionalOwnerRef",
      "ownerNativeResult",
      "exactStateRef",
      "exactRuleRef",
      "assessedAtCoordinateRef",
      "provenanceRef",
      "determinationDependencyDeclaration",
    ],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  if (
    typeof raw.determinationBindingKey !== "string" ||
    raw.determinationBindingKey.trim() === ""
  ) {
    return {
      code: "INVALID_VALUE",
      path: `${path}.determinationBindingKey`,
      message: "determinationBindingKey must be a non-empty string",
    };
  }

  // determinationQuestionBinding
  const qbPath = `${path}.determinationQuestionBinding`;
  if (!isPlainObject(raw.determinationQuestionBinding)) {
    return {
      code: "INVALID_TYPE",
      path: qbPath,
      message: `${qbPath} must be a plain object`,
    };
  }
  const errQbKey = checkAllowedKeys(
    raw.determinationQuestionBinding,
    ["questionSemanticRef", "questionOperandBindings"],
    qbPath,
  );
  if (errQbKey) return errQbKey;

  const qb = raw.determinationQuestionBinding as Record<string, unknown>;

  const errQsRef = validateRef(
    qb.questionSemanticRef,
    `${qbPath}.questionSemanticRef`,
    "QUESTION_SEMANTIC",
  );
  if (errQsRef) return errQsRef;

  if (!Array.isArray(qb.questionOperandBindings)) {
    return {
      code: "INVALID_TYPE",
      path: `${qbPath}.questionOperandBindings`,
      message: `${qbPath}.questionOperandBindings must be an array`,
    };
  }

  const validOperandKinds = [
    "PARTICIPATION_BINDING",
    "ACTION_PERFORMER",
    "REQUESTED_ACTION",
    "ACTION_TARGET",
    "CAPABILITY_CLAIM",
    "CONSTITUTIONAL_STATE",
    "EVIDENCE_STATE",
    "POLICY_UNIVERSE",
    "EVALUATION_CONTEXT_BINDING",
    "TEMPORAL_COORDINATE",
    "OWNER_DETERMINATION",
  ];

  const operandKeys = new Set<string>();
  for (let i = 0; i < qb.questionOperandBindings.length; i++) {
    const opPath = `${qbPath}.questionOperandBindings[${i}]`;
    const op = qb.questionOperandBindings[i];
    if (!isPlainObject(op)) {
      return {
        code: "INVALID_TYPE",
        path: opPath,
        message: `${opPath} must be a plain object`,
      };
    }
    const errOpKey = checkAllowedKeys(
      op,
      ["operandKey", "operandKind", "operandRef", "operandValue"],
      opPath,
    );
    if (errOpKey) return errOpKey;

    if (typeof op.operandKey !== "string" || op.operandKey.trim() === "") {
      return {
        code: "INVALID_VALUE",
        path: `${opPath}.operandKey`,
        message: "operandKey must be a non-empty string",
      };
    }

    if (operandKeys.has(op.operandKey)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${opPath}.operandKey`,
        message: `Duplicate operandKey '${op.operandKey}'`,
      };
    }
    operandKeys.add(op.operandKey);

    if (
      typeof op.operandKind !== "string" ||
      !validOperandKinds.includes(op.operandKind)
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${opPath}.operandKind`,
        message: `operandKind must be one of: ${validOperandKinds.join(", ")}`,
      };
    }

    if (op.operandRef !== undefined) {
      if (typeof op.operandRef !== "string" || op.operandRef.trim() === "") {
        return {
          code: "INVALID_VALUE",
          path: `${opPath}.operandRef`,
          message: "operandRef must be a non-empty string if provided",
        };
      }
    }

    if (
      op.operandValue !== undefined &&
      !isStrictJsonValueV2(op.operandValue)
    ) {
      return {
        code: "INVALID_RUNTIME_VALUE",
        path: `${opPath}.operandValue`,
        message: `${opPath}.operandValue must be a strict JSON value`,
      };
    }
  }

  const errOwnRef = validateRef(
    raw.constitutionalOwnerRef,
    `${path}.constitutionalOwnerRef`,
    "OWNER",
  );
  if (errOwnRef) return errOwnRef;

  if (
    raw.ownerNativeResult === undefined ||
    !isStrictJsonValueV2(raw.ownerNativeResult)
  ) {
    return {
      code: "INVALID_RUNTIME_VALUE",
      path: `${path}.ownerNativeResult`,
      message: `${path}.ownerNativeResult must be a strict JSON value`,
    };
  }

  if (raw.exactStateRef !== undefined) {
    const errEsi = validateRef(
      raw.exactStateRef,
      `${path}.exactStateRef`,
      "STATE_INSTANCE",
    );
    if (errEsi) return errEsi;
  }

  if (raw.exactRuleRef !== undefined) {
    const errRuleRef = validateRef(
      raw.exactRuleRef,
      `${path}.exactRuleRef`,
      "RULE",
    );
    if (errRuleRef) return errRuleRef;
  }

  if (raw.assessedAtCoordinateRef !== undefined) {
    const errProvRef = validateRef(
      raw.assessedAtCoordinateRef,
      `${path}.assessedAtCoordinateRef`,
      "PROVENANCE",
    );
    if (errProvRef) return errProvRef;
  }

  if (raw.provenanceRef !== undefined) {
    const errProvRef = validateRef(
      raw.provenanceRef,
      `${path}.provenanceRef`,
      "PROVENANCE",
    );
    if (errProvRef) return errProvRef;
  }

  // determinationDependencyDeclaration
  const declPath = `${path}.determinationDependencyDeclaration`;
  if (!isPlainObject(raw.determinationDependencyDeclaration)) {
    return {
      code: "INVALID_TYPE",
      path: declPath,
      message: `${declPath} must be a plain object`,
    };
  }
  const decl = raw.determinationDependencyDeclaration as Record<
    string,
    unknown
  >;
  if (decl.kind === "AUTHORITATIVELY_NONE") {
    const errDeclKey = checkAllowedKeys(decl, ["kind"], declPath);
    if (errDeclKey) return errDeclKey;
  } else if (decl.kind === "EXPLICIT") {
    const errDeclKey = checkAllowedKeys(
      decl,
      ["kind", "dependencyRefs"],
      declPath,
    );
    if (errDeclKey) return errDeclKey;

    if (!Array.isArray(decl.dependencyRefs)) {
      return {
        code: "INVALID_TYPE",
        path: `${declPath}.dependencyRefs`,
        message: `${declPath}.dependencyRefs must be an array`,
      };
    }
    if (decl.dependencyRefs.length === 0) {
      return {
        code: "INVALID_CARDINALITY",
        path: `${declPath}.dependencyRefs`,
        message: `${declPath}.dependencyRefs must contain at least 1 element`,
      };
    }

    const depSet = new Set<string>();
    for (let i = 0; i < decl.dependencyRefs.length; i++) {
      const depItem = decl.dependencyRefs[i];
      if (typeof depItem !== "string" || depItem.trim() === "") {
        return {
          code: "INVALID_VALUE",
          path: `${declPath}.dependencyRefs[${i}]`,
          message: "dependencyRef element must be a non-empty string",
        };
      }
      if (depSet.has(depItem)) {
        return {
          code: "DUPLICATE_BINDING",
          path: `${declPath}.dependencyRefs[${i}]`,
          message: `Duplicate dependencyRef '${depItem}' in determination dependency declaration`,
        };
      }
      depSet.add(depItem);
    }
  } else {
    return {
      code: "INVALID_VALUE",
      path: `${declPath}.kind`,
      message:
        "determinationDependencyDeclaration.kind must be AUTHORITATIVELY_NONE or EXPLICIT",
    };
  }

  return null;
}

function validateEvaluationContext(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    [
      "authorizedInputBindings",
      "evaluationParameterBindings",
      "boundContextBindings",
      "ownerDeterminationBindings",
    ],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  const checkBindingsArray = (
    arrName: string,
  ): ExecutionRequestV2ValidationError | null => {
    const arrPath = `${path}.${arrName}`;
    const arr = raw[arrName];
    if (!Array.isArray(arr)) {
      return {
        code: "INVALID_TYPE",
        path: arrPath,
        message: `${arrPath} must be an array`,
      };
    }
    const keys = new Set<string>();
    for (let i = 0; i < arr.length; i++) {
      const bPath = `${arrPath}[${i}]`;
      const errB = validateEvaluationContextBinding(arr[i], bPath);
      if (errB) return errB;

      const key = (arr[i] as Record<string, unknown>).bindingKey as string;
      if (keys.has(key)) {
        return {
          code: "DUPLICATE_BINDING",
          path: `${bPath}.bindingKey`,
          message: `Duplicate bindingKey '${key}' in ${arrName}`,
        };
      }
      keys.add(key);
    }
    return null;
  };

  const errAuthIn = checkBindingsArray("authorizedInputBindings");
  if (errAuthIn) return errAuthIn;

  const errEvalParam = checkBindingsArray("evaluationParameterBindings");
  if (errEvalParam) return errEvalParam;

  const errBoundCtx = checkBindingsArray("boundContextBindings");
  if (errBoundCtx) return errBoundCtx;

  // ownerDeterminationBindings
  const odPath = `${path}.ownerDeterminationBindings`;
  if (!Array.isArray(raw.ownerDeterminationBindings)) {
    return {
      code: "INVALID_TYPE",
      path: odPath,
      message: `${odPath} must be an array`,
    };
  }
  const odKeys = new Set<string>();
  for (let i = 0; i < raw.ownerDeterminationBindings.length; i++) {
    const itemPath = `${odPath}[${i}]`;
    const errOd = validateOwnerDetermination(
      raw.ownerDeterminationBindings[i],
      itemPath,
    );
    if (errOd) return errOd;

    const key = (raw.ownerDeterminationBindings[i] as Record<string, unknown>)
      .determinationBindingKey as string;
    if (odKeys.has(key)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${itemPath}.determinationBindingKey`,
        message: `Duplicate determinationBindingKey '${key}'`,
      };
    }
    odKeys.add(key);
  }

  return null;
}

function validateExecutionContextV2(
  input: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (!isPlainObject(input)) {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} must be a plain object`,
    };
  }
  const errKey = checkAllowedKeys(
    input,
    ["executionId", "temporalCoordinates", "budget", "entropy"],
    path,
  );
  if (errKey) return errKey;

  const raw = input as Record<string, unknown>;

  if (typeof raw.executionId !== "string" || raw.executionId.trim() === "") {
    return {
      code: "INVALID_VALUE",
      path: `${path}.executionId`,
      message: "executionId must be a non-empty string",
    };
  }

  // temporalCoordinates
  const tcPath = `${path}.temporalCoordinates`;
  if (!isPlainObject(raw.temporalCoordinates)) {
    return {
      code: "INVALID_TYPE",
      path: tcPath,
      message: `${tcPath} must be a plain object`,
    };
  }
  const errTcKey = checkAllowedKeys(
    raw.temporalCoordinates,
    ["tValid", "tObservation", "tEInput", "tTrust"],
    tcPath,
  );
  if (errTcKey) return errTcKey;

  const tc = raw.temporalCoordinates as Record<string, unknown>;

  if (tc.tValid !== undefined) {
    const errTs = validateIso8601Timestamp(tc.tValid, `${tcPath}.tValid`);
    if (errTs) return errTs;
  }

  if (tc.tObservation !== undefined) {
    const errTs = validateIso8601Timestamp(
      tc.tObservation,
      `${tcPath}.tObservation`,
    );
    if (errTs) return errTs;
  }

  if (tc.tEInput === undefined) {
    return {
      code: "MISSING_FIELD",
      path: `${tcPath}.tEInput`,
      message: `${tcPath}.tEInput is mandatory`,
    };
  }
  const errTeInput = validateIso8601Timestamp(tc.tEInput, `${tcPath}.tEInput`);
  if (errTeInput) return errTeInput;

  if (tc.tTrust !== undefined) {
    const errTs = validateIso8601Timestamp(tc.tTrust, `${tcPath}.tTrust`);
    if (errTs) return errTs;
  }

  if (
    typeof raw.budget !== "number" ||
    !Number.isFinite(raw.budget) ||
    raw.budget < 0
  ) {
    return {
      code: "INVALID_VALUE",
      path: `${path}.budget`,
      message: "budget must be a finite non-negative number",
    };
  }

  if (raw.entropy !== undefined) {
    if (typeof raw.entropy !== "string" || raw.entropy.trim() === "") {
      return {
        code: "INVALID_VALUE",
        path: `${path}.entropy`,
        message:
          "entropy must be a non-empty, non-whitespace string if provided",
      };
    }
  }

  return null;
}

// ------------------- Main Public Validator -------------------

/**
 * Validates raw input strictly as an ExecutionRequestV2 structure.
 * Returns ValidationResult with ok: true and typed value, or ok: false and detailed error.
 * Does not throw exceptions, purely deterministic.
 */
export function validateExecutionRequestV2(
  input: unknown,
): ValidationResult<ExecutionRequestV2, ExecutionRequestV2ValidationError> {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_TYPE",
        path: "",
        message: "Input must be a non-null plain object",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  // Reject explicit top-level V1 fields immediately with UNKNOWN_FIELD or INVALID_CONTRACT_VERSION
  const forbiddenV1Fields = [
    "inputHash",
    "identity",
    "activeConstitutionalView",
    "evidenceBundle",
    "policyContext",
    "resolvedPolicyGraph",
  ];
  for (const f of forbiddenV1Fields) {
    if (f in raw) {
      return {
        ok: false,
        error: {
          code: "UNKNOWN_FIELD",
          path: f,
          message: `V1 field '${f}' is explicitly forbidden in V2 request`,
        },
      };
    }
  }

  const allowedTopLevelKeys = [
    "contractVersion",
    "requestId",
    "participation",
    "intent",
    "requestedAction",
    "constitutionalState",
    "evidenceState",
    "policyUniverse",
    "evaluationContext",
    "executionContext",
  ];

  const errTopKey = checkAllowedKeys(raw, allowedTopLevelKeys, "");
  if (errTopKey) {
    return {
      ok: false,
      error: errTopKey,
    };
  }

  // Check mandatory fields presence
  for (const k of allowedTopLevelKeys) {
    if (!(k in raw) || raw[k] === undefined) {
      return {
        ok: false,
        error: {
          code:
            k === "contractVersion"
              ? "INVALID_CONTRACT_VERSION"
              : "MISSING_FIELD",
          path: k,
          message: `Missing mandatory top-level field '${k}'`,
        },
      };
    }
  }

  // 1. contractVersion
  if (raw.contractVersion !== "v2") {
    return {
      ok: false,
      error: {
        code: "INVALID_CONTRACT_VERSION",
        path: "contractVersion",
        message: `contractVersion must be exactly 'v2', got '${String(raw.contractVersion)}'`,
      },
    };
  }

  // 2. requestId
  if (typeof raw.requestId !== "string" || raw.requestId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INVALID_VALUE",
        path: "requestId",
        message: "requestId must be a non-empty string",
      },
    };
  }

  // 3. participation
  const errPart = validateParticipation(raw.participation, "participation");
  if (errPart) {
    return { ok: false, error: errPart };
  }

  // 4. intent
  const errIntent = validateIntent(raw.intent, "intent");
  if (errIntent) {
    return { ok: false, error: errIntent };
  }

  // 5. requestedAction
  const errReqAct = validateRequestedAction(
    raw.requestedAction,
    "requestedAction",
  );
  if (errReqAct) {
    return { ok: false, error: errReqAct };
  }

  // 6. constitutionalState
  const errConstState = validateConstitutionalState(
    raw.constitutionalState,
    "constitutionalState",
  );
  if (errConstState) {
    return { ok: false, error: errConstState };
  }

  // 7. evidenceState
  const errEvState = validateEvidenceState(raw.evidenceState, "evidenceState");
  if (errEvState) {
    return { ok: false, error: errEvState };
  }

  // 8. policyUniverse
  const errPolUniv = validatePolicyUniverse(
    raw.policyUniverse,
    "policyUniverse",
  );
  if (errPolUniv) {
    return { ok: false, error: errPolUniv };
  }

  // 9. evaluationContext
  const errEvalCtx = validateEvaluationContext(
    raw.evaluationContext,
    "evaluationContext",
  );
  if (errEvalCtx) {
    return { ok: false, error: errEvalCtx };
  }

  // 10. executionContext
  const errExecCtx = validateExecutionContextV2(
    raw.executionContext,
    "executionContext",
  );
  if (errExecCtx) {
    return { ok: false, error: errExecCtx };
  }

  return {
    ok: true,
    value: input as unknown as ExecutionRequestV2,
  };
}
