import type { ValidationResult } from "../index.js";
import type { ExecutionRequestV2ValidationError } from "./errors.js";
import { isStrictJsonValueV2 } from "./json.js";
import type {
  ConstitutionalRefBaseV2,
  ConstitutionalRefFamilyV2,
} from "./refs.js";
import type { ExecutionRequestV2 } from "./types.js";

const DIGEST_REGEX = /^sha256:[0-9a-f]{64}$/;

// Strict ISO-8601 instant regex
const ISO_8601_INSTANT_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([+-])(\d{2}):?(\d{2})?)$/i;

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
  try {
    const proto = Object.getPrototypeOf(val);
    return proto === Object.prototype || proto === null;
  } catch {
    return false;
  }
}

function checkAllowedKeys(
  obj: Record<string, unknown>,
  allowedKeys: string[],
  path: string,
): ExecutionRequestV2ValidationError | null {
  try {
    const keys = Reflect.ownKeys(obj);
    for (const k of keys) {
      if (typeof k !== "string" || !allowedKeys.includes(k)) {
        return {
          code: "UNKNOWN_FIELD",
          path: path ? `${path}.${String(k)}` : String(k),
          message: `Unknown or unadmitted field '${String(k)}'`,
        };
      }
      const desc = Object.getOwnPropertyDescriptor(obj, k);
      if (!desc || !desc.enumerable || desc.get || desc.set) {
        return {
          code: "INVALID_RUNTIME_VALUE",
          path: path ? `${path}.${String(k)}` : String(k),
          message: `Property '${String(k)}' is non-enumerable or accessor-based`,
        };
      }
    }
    return null;
  } catch {
    return {
      code: "INVALID_TYPE",
      path,
      message: `${path} failed property key inspection`,
    };
  }
}

// C06 / R06: PolicyRef validation requiring exact version, stateRef, and provenanceRef
function validatePolicyRefFields(
  ref: Record<string, unknown>,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (typeof ref.version !== "string" || ref.version.trim() === "") {
    return {
      code: "MISSING_FIELD",
      path: `${path}.version`,
      message: `PolicyRef at ${path} requires an explicit exact version`,
    };
  }
  if (isFloatingVersion(ref.version)) {
    return {
      code: "INVALID_VALUE",
      path: `${path}.version`,
      message: `Floating or non-exact policy version '${ref.version}' is rejected`,
    };
  }

  if (typeof ref.stateRef !== "string" || ref.stateRef.trim() === "") {
    return {
      code: "MISSING_FIELD",
      path: `${path}.stateRef`,
      message: `PolicyRef at ${path} requires an explicit stateRef`,
    };
  }

  if (
    typeof ref.provenanceRef !== "string" ||
    ref.provenanceRef.trim() === ""
  ) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.provenanceRef`,
      message: `PolicyRef at ${path} requires an explicit provenanceRef`,
    };
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

  // R06: Any reference with family === "POLICY" must satisfy full PolicyRef exactness
  if (ref.family === "POLICY") {
    const errPol = validatePolicyRefFields(ref, path);
    if (errPol) return errPol;
  } else {
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

// R09: Strict calendar instant validation rejecting impossible dates like 2026-02-30
function validateIso8601Timestamp(
  val: unknown,
  path: string,
): ExecutionRequestV2ValidationError | null {
  if (typeof val !== "string") {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} must be a string timestamp`,
    };
  }

  const match = ISO_8601_INSTANT_REGEX.exec(val);
  if (!match) {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} must be a valid ISO-8601 timestamp string`,
    };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const hours = parseInt(match[4], 10);
  const minutes = parseInt(match[5], 10);
  const seconds = parseInt(match[6], 10);

  if (month < 1 || month > 12) {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} has invalid month '${month}'`,
    };
  }

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonths = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  const maxDays = daysInMonths[month - 1];
  if (day < 1 || day > maxDays) {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} has impossible calendar day '${day}' for month ${month}`,
    };
  }

  if (hours < 0 || hours > 23) {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} has invalid hours '${hours}'`,
    };
  }

  if (minutes < 0 || minutes > 59) {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} has invalid minutes '${minutes}'`,
    };
  }

  if (seconds < 0 || seconds > 59) {
    return {
      code: "INVALID_VALUE",
      path,
      message: `${path} has invalid seconds '${seconds}'`,
    };
  }

  if (match[8] && match[8] !== "Z" && match[8] !== "z") {
    const offHH = match[10] ? parseInt(match[10], 10) : 0;
    const offMM = match[11] ? parseInt(match[11], 10) : 0;
    if (offHH < 0 || offHH > 23) {
      return {
        code: "INVALID_VALUE",
        path,
        message: `${path} has invalid offset hours '${offHH}'`,
      };
    }
    if (offMM < 0 || offMM > 59) {
      return {
        code: "INVALID_VALUE",
        path,
        message: `${path} has invalid offset minutes '${offMM}'`,
      };
    }
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

// C01: Candidate state & exact candidate state instance mandatory
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

  // C01: Candidate State Binding is MANDATORY
  if (
    !("candidateStateBinding" in raw) ||
    raw.candidateStateBinding === undefined
  ) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.candidateStateBinding`,
      message: `${path}.candidateStateBinding is mandatory in V2 Intent`,
    };
  }

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
    ["stateTargetRef", "stateSemanticRef", "exactStateInstance"],
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

  // C01: exactStateInstance is MANDATORY in CandidateStateBinding
  if (!("exactStateInstance" in csb) || csb.exactStateInstance === undefined) {
    return {
      code: "MISSING_FIELD",
      path: `${csbPath}.exactStateInstance`,
      message: `${csbPath}.exactStateInstance is mandatory`,
    };
  }

  const esiPath = `${csbPath}.exactStateInstance`;
  if (!isPlainObject(csb.exactStateInstance)) {
    return {
      code: "INVALID_TYPE",
      path: esiPath,
      message: `${esiPath} must be a plain object`,
    };
  }

  const esi = csb.exactStateInstance as Record<string, unknown>;
  if (esi.kind === "GOVERNED_ARTIFACT_REF") {
    const errEsiKey = checkAllowedKeys(
      esi,
      ["kind", "stateInstanceRef"],
      esiPath,
    );
    if (errEsiKey) return errEsiKey;

    const errSir = validateRef(
      esi.stateInstanceRef,
      `${esiPath}.stateInstanceRef`,
      "STATE_INSTANCE",
    );
    if (errSir) return errSir;
  } else if (esi.kind === "OWNER_TYPED_INLINE") {
    const errEsiKey = checkAllowedKeys(
      esi,
      ["kind", "ownerRef", "schemaRef", "material"],
      esiPath,
    );
    if (errEsiKey) return errEsiKey;

    const errOwnRef = validateRef(esi.ownerRef, `${esiPath}.ownerRef`, "OWNER");
    if (errOwnRef) return errOwnRef;

    const errSchRef = validateRef(
      esi.schemaRef,
      `${esiPath}.schemaRef`,
      "STATE_ARTIFACT",
    );
    if (errSchRef) return errSchRef;

    if (esi.material === undefined || !isStrictJsonValueV2(esi.material)) {
      return {
        code: "INVALID_RUNTIME_VALUE",
        path: `${esiPath}.material`,
        message: `${esiPath}.material must be a strict JSON value`,
      };
    }
  } else {
    return {
      code: "INVALID_VALUE",
      path: `${esiPath}.kind`,
      message:
        "exactStateInstance.kind must be GOVERNED_ARTIFACT_REF or OWNER_TYPED_INLINE",
    };
  }

  return null;
}

// C02: Intent/Action compatibility binding must have mandatory authority cross-reference
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

  // C02: intentActionCompatibilityBinding
  const compatPath = `${path}.intentActionCompatibilityBinding`;
  if (!isPlainObject(raw.intentActionCompatibilityBinding)) {
    return {
      code: "INVALID_TYPE",
      path: compatPath,
      message: `${compatPath} must be a plain object`,
    };
  }

  const compat = raw.intentActionCompatibilityBinding as Record<
    string,
    unknown
  >;
  if (compat.kind === "GOVERNED_SEMANTIC_CONTRACT") {
    const errCompatKey = checkAllowedKeys(
      compat,
      ["kind", "exactCompatibilityContractRef"],
      compatPath,
    );
    if (errCompatKey) return errCompatKey;

    const errCR = validateRef(
      compat.exactCompatibilityContractRef,
      `${compatPath}.exactCompatibilityContractRef`,
      "COMPATIBILITY_CONTRACT",
    );
    if (errCR) return errCR;
  } else if (compat.kind === "OWNER_DETERMINATION") {
    const errCompatKey = checkAllowedKeys(
      compat,
      ["kind", "ownerDeterminationBindingRef"],
      compatPath,
    );
    if (errCompatKey) return errCompatKey;

    if (
      typeof compat.ownerDeterminationBindingRef !== "string" ||
      compat.ownerDeterminationBindingRef.trim() === ""
    ) {
      return {
        code: "INVALID_VALUE",
        path: `${compatPath}.ownerDeterminationBindingRef`,
        message:
          "ownerDeterminationBindingRef must be a non-empty string in OWNER_DETERMINATION compatibility",
      };
    }
  } else {
    return {
      code: "INVALID_VALUE",
      path: `${compatPath}.kind`,
      message:
        "intentActionCompatibilityBinding.kind must be GOVERNED_SEMANTIC_CONTRACT or OWNER_DETERMINATION",
    };
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

// C05, R04, R05: Exact state references required for all state bindings; R04 Structural STATE_SEMANTIC; R05 StateBindings [1..N]
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
  const normalKinds = [
    "IDENTITY_STATE",
    "STANDING_STATE",
    "AUTHORITY_STATE",
    "CAPABILITY_STATE",
    "AGENCY_STATE",
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

    // R05: StateBindings [1..N] per State View
    if (sv.stateBindings.length === 0) {
      return {
        code: "INVALID_CARDINALITY",
        path: `${svPath}.stateBindings`,
        message: `${svPath}.stateBindings must contain at least 1 state binding`,
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

      if (typeof sb.kind !== "string") {
        return {
          code: "INVALID_VALUE",
          path: `${sbPath}.kind`,
          message: "kind is required",
        };
      }

      if (normalKinds.includes(sb.kind)) {
        const errSbKey = checkAllowedKeys(
          sb,
          [
            "stateBindingKey",
            "kind",
            "subjectRef",
            "stateSemanticRef",
            "exactStateRef",
            "stateArtifactRef",
          ],
          sbPath,
        );
        if (errSbKey) return errSbKey;

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

        // C05: exactStateRef is MANDATORY for normal state bindings
        if (!("exactStateRef" in sb) || sb.exactStateRef === undefined) {
          return {
            code: "MISSING_FIELD",
            path: `${sbPath}.exactStateRef`,
            message: `${sbPath}.exactStateRef is mandatory for ${sb.kind}`,
          };
        }
        const errEsi = validateRef(
          sb.exactStateRef,
          `${sbPath}.exactStateRef`,
          "STATE_INSTANCE",
        );
        if (errEsi) return errEsi;

        if (sb.stateArtifactRef !== undefined) {
          const errSa = validateRef(
            sb.stateArtifactRef,
            `${sbPath}.stateArtifactRef`,
            "STATE_ARTIFACT",
          );
          if (errSa) return errSa;
        }
      } else if (sb.kind === "RELATIONSHIP_STATE") {
        if (sb.relationshipKind === "STRUCTURAL") {
          // R04: Structural relationship fields
          const errSbKey = checkAllowedKeys(
            sb,
            [
              "stateBindingKey",
              "kind",
              "relationshipKind",
              "sourceEndpointRef",
              "relationshipSemanticRef",
              "targetEndpointRef",
              "exactTopologyStateRef",
            ],
            sbPath,
          );
          if (errSbKey) return errSbKey;

          const errSrcRef = validateRef(
            sb.sourceEndpointRef,
            `${sbPath}.sourceEndpointRef`,
          );
          if (errSrcRef) return errSrcRef;

          // R04: relationshipSemanticRef must be STATE_SEMANTIC
          const errRelSemRef = validateRef(
            sb.relationshipSemanticRef,
            `${sbPath}.relationshipSemanticRef`,
            "STATE_SEMANTIC",
          );
          if (errRelSemRef) return errRelSemRef;

          const errTgtRef = validateRef(
            sb.targetEndpointRef,
            `${sbPath}.targetEndpointRef`,
          );
          if (errTgtRef) return errTgtRef;

          if (
            !("exactTopologyStateRef" in sb) ||
            sb.exactTopologyStateRef === undefined
          ) {
            return {
              code: "MISSING_FIELD",
              path: `${sbPath}.exactTopologyStateRef`,
              message: `${sbPath}.exactTopologyStateRef is mandatory for STRUCTURAL relationship state`,
            };
          }

          const errEtsRef = validateRef(
            sb.exactTopologyStateRef,
            `${sbPath}.exactTopologyStateRef`,
            "STATE_INSTANCE",
          );
          if (errEtsRef) return errEtsRef;
        } else if (sb.relationshipKind === "REIFIED") {
          // R04: Reified relationship fields closed on exact branch
          const errSbKey = checkAllowedKeys(
            sb,
            [
              "stateBindingKey",
              "kind",
              "relationshipKind",
              "relationshipRef",
              "exactStateRef",
            ],
            sbPath,
          );
          if (errSbKey) return errSbKey;

          const errRelRef = validateRef(
            sb.relationshipRef,
            `${sbPath}.relationshipRef`,
            "RELATIONSHIP",
          );
          if (errRelRef) return errRelRef;

          if (!("exactStateRef" in sb) || sb.exactStateRef === undefined) {
            return {
              code: "MISSING_FIELD",
              path: `${sbPath}.exactStateRef`,
              message: `${sbPath}.exactStateRef is mandatory for REIFIED relationship state`,
            };
          }

          const errEsi = validateRef(
            sb.exactStateRef,
            `${sbPath}.exactStateRef`,
            "STATE_INSTANCE",
          );
          if (errEsi) return errEsi;
        } else {
          return {
            code: "INVALID_VALUE",
            path: `${sbPath}.relationshipKind`,
            message:
              "relationshipKind must be STRUCTURAL or REIFIED for RELATIONSHIP_STATE",
          };
        }
      } else {
        return {
          code: "INVALID_VALUE",
          path: `${sbPath}.kind`,
          message: `kind must be one of: ${normalKinds.join(", ")}, RELATIONSHIP_STATE`,
        };
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
        path: `${path}.algorithm`,
        message: "algorithm must be a non-empty string",
      };
    }
  }

  return null;
}

// C06 / R06: Validate policy universe and policy refs
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

  if (
    !("applicabilityProvenanceBinding" in raw) ||
    raw.applicabilityProvenanceBinding === undefined
  ) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.applicabilityProvenanceBinding`,
      message: `${path}.applicabilityProvenanceBinding is mandatory`,
    };
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

// R01: operandSlotSemanticRef must be EVALUATION_SEMANTIC
// R02: REQUESTED_ACTION carries requestedActionRef: "REQUESTED_ACTION"
// R03: EVALUATION_CONTEXT_BINDING carries bindingCollection: AUTHORIZED_INPUT | EVALUATION_PARAMETER | BOUND_CONTEXT
function validateQuestionOperandBinding(
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

  const raw = input as Record<string, unknown>;

  if (typeof raw.operandKey !== "string" || raw.operandKey.trim() === "") {
    return {
      code: "INVALID_VALUE",
      path: `${path}.operandKey`,
      message: "operandKey must be a non-empty string",
    };
  }

  // R01: operandSlotSemanticRef MUST have family EVALUATION_SEMANTIC
  const errSlotRef = validateRef(
    raw.operandSlotSemanticRef,
    `${path}.operandSlotSemanticRef`,
    "EVALUATION_SEMANTIC",
  );
  if (errSlotRef) return errSlotRef;

  const validKinds = [
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

  if (
    typeof raw.operandKind !== "string" ||
    !validKinds.includes(raw.operandKind)
  ) {
    return {
      code: "INVALID_VALUE",
      path: `${path}.operandKind`,
      message: `operandKind must be one of: ${validKinds.join(", ")}`,
    };
  }

  switch (raw.operandKind) {
    case "PARTICIPATION_BINDING": {
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "roleBindingRef",
        ],
        path,
      );
      if (errKey) return errKey;
      if (
        typeof raw.roleBindingRef !== "string" ||
        raw.roleBindingRef.trim() === ""
      ) {
        return {
          code: "INVALID_VALUE",
          path: `${path}.roleBindingRef`,
          message: "roleBindingRef must be a non-empty string",
        };
      }
      break;
    }
    case "ACTION_PERFORMER": {
      const errKey = checkAllowedKeys(
        raw,
        ["operandKey", "operandSlotSemanticRef", "operandKind", "performerRef"],
        path,
      );
      if (errKey) return errKey;
      if (
        typeof raw.performerRef !== "string" ||
        raw.performerRef.trim() === ""
      ) {
        return {
          code: "INVALID_VALUE",
          path: `${path}.performerRef`,
          message: "performerRef must be a non-empty string",
        };
      }
      break;
    }
    case "REQUESTED_ACTION": {
      // R02: Must carry requestedActionRef: "REQUESTED_ACTION"
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "requestedActionRef",
        ],
        path,
      );
      if (errKey) return errKey;
      if (raw.requestedActionRef !== "REQUESTED_ACTION") {
        return {
          code: "INVALID_VALUE",
          path: `${path}.requestedActionRef`,
          message: "requestedActionRef must be exactly 'REQUESTED_ACTION'",
        };
      }
      break;
    }
    case "ACTION_TARGET": {
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "targetSlotSemanticRef",
          "targetRef",
        ],
        path,
      );
      if (errKey) return errKey;
      const errTsRef = validateRef(
        raw.targetSlotSemanticRef,
        `${path}.targetSlotSemanticRef`,
        "TARGET_SLOT_SEMANTIC",
      );
      if (errTsRef) return errTsRef;
      const errTRef = validateRef(raw.targetRef, `${path}.targetRef`, "TARGET");
      if (errTRef) return errTRef;
      break;
    }
    case "CAPABILITY_CLAIM": {
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "capabilityClaimRef",
        ],
        path,
      );
      if (errKey) return errKey;
      if (
        typeof raw.capabilityClaimRef !== "string" ||
        raw.capabilityClaimRef.trim() === ""
      ) {
        return {
          code: "INVALID_VALUE",
          path: `${path}.capabilityClaimRef`,
          message: "capabilityClaimRef must be a non-empty string",
        };
      }
      break;
    }
    case "CONSTITUTIONAL_STATE": {
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "semanticStateRef",
        ],
        path,
      );
      if (errKey) return errKey;
      const errDig = validateDigest(
        raw.semanticStateRef,
        `${path}.semanticStateRef`,
      );
      if (errDig) return errDig;
      break;
    }
    case "EVIDENCE_STATE": {
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "evidenceStateRef",
        ],
        path,
      );
      if (errKey) return errKey;
      const errDig = validateDigest(
        raw.evidenceStateRef,
        `${path}.evidenceStateRef`,
      );
      if (errDig) return errDig;
      break;
    }
    case "POLICY_UNIVERSE": {
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "policyUniverseRef",
        ],
        path,
      );
      if (errKey) return errKey;
      const errDig = validateDigest(
        raw.policyUniverseRef,
        `${path}.policyUniverseRef`,
      );
      if (errDig) return errDig;
      break;
    }
    case "EVALUATION_CONTEXT_BINDING": {
      // R03: bindingCollection must be AUTHORIZED_INPUT, EVALUATION_PARAMETER, or BOUND_CONTEXT
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "bindingCollection",
          "bindingRef",
        ],
        path,
      );
      if (errKey) return errKey;
      if (
        raw.bindingCollection !== "AUTHORIZED_INPUT" &&
        raw.bindingCollection !== "EVALUATION_PARAMETER" &&
        raw.bindingCollection !== "BOUND_CONTEXT"
      ) {
        return {
          code: "INVALID_VALUE",
          path: `${path}.bindingCollection`,
          message:
            "bindingCollection must be AUTHORIZED_INPUT, EVALUATION_PARAMETER, or BOUND_CONTEXT",
        };
      }
      if (typeof raw.bindingRef !== "string" || raw.bindingRef.trim() === "") {
        return {
          code: "INVALID_VALUE",
          path: `${path}.bindingRef`,
          message: "bindingRef must be a non-empty string",
        };
      }
      break;
    }
    case "TEMPORAL_COORDINATE": {
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "temporalCoordinateRef",
        ],
        path,
      );
      if (errKey) return errKey;
      if (
        raw.temporalCoordinateRef !== "tValid" &&
        raw.temporalCoordinateRef !== "tObservation" &&
        raw.temporalCoordinateRef !== "tEInput" &&
        raw.temporalCoordinateRef !== "tTrust"
      ) {
        return {
          code: "INVALID_VALUE",
          path: `${path}.temporalCoordinateRef`,
          message:
            "temporalCoordinateRef must be tValid, tObservation, tEInput, or tTrust",
        };
      }
      break;
    }
    case "OWNER_DETERMINATION": {
      const errKey = checkAllowedKeys(
        raw,
        [
          "operandKey",
          "operandSlotSemanticRef",
          "operandKind",
          "ownerDeterminationBindingRef",
        ],
        path,
      );
      if (errKey) return errKey;
      if (
        typeof raw.ownerDeterminationBindingRef !== "string" ||
        raw.ownerDeterminationBindingRef.trim() === ""
      ) {
        return {
          code: "INVALID_VALUE",
          path: `${path}.ownerDeterminationBindingRef`,
          message: "ownerDeterminationBindingRef must be a non-empty string",
        };
      }
      break;
    }
  }

  return null;
}

// C03: Owner Determination provenance and temporal coordinate references
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

  const operandKeys = new Set<string>();
  for (let i = 0; i < qb.questionOperandBindings.length; i++) {
    const opPath = `${qbPath}.questionOperandBindings[${i}]`;
    const errOp = validateQuestionOperandBinding(
      qb.questionOperandBindings[i],
      opPath,
    );
    if (errOp) return errOp;

    const key = (qb.questionOperandBindings[i] as Record<string, unknown>)
      .operandKey as string;
    if (operandKeys.has(key)) {
      return {
        code: "DUPLICATE_BINDING",
        path: `${opPath}.operandKey`,
        message: `Duplicate operandKey '${key}'`,
      };
    }
    operandKeys.add(key);
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

  // C03: Mandatory exactStateRef
  if (!("exactStateRef" in raw) || raw.exactStateRef === undefined) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.exactStateRef`,
      message: `${path}.exactStateRef is mandatory`,
    };
  }
  const errEsRef = validateRef(raw.exactStateRef, `${path}.exactStateRef`);
  if (errEsRef) return errEsRef;

  // C03: Mandatory exactRuleRef
  if (!("exactRuleRef" in raw) || raw.exactRuleRef === undefined) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.exactRuleRef`,
      message: `${path}.exactRuleRef is mandatory`,
    };
  }
  const errRuleRef = validateRef(
    raw.exactRuleRef,
    `${path}.exactRuleRef`,
    "RULE",
  );
  if (errRuleRef) return errRuleRef;

  // C03: Mandatory assessedAtCoordinateRef (TemporalCoordinateRefV2 string)
  if (
    !("assessedAtCoordinateRef" in raw) ||
    raw.assessedAtCoordinateRef === undefined
  ) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.assessedAtCoordinateRef`,
      message: `${path}.assessedAtCoordinateRef is mandatory`,
    };
  }
  if (
    raw.assessedAtCoordinateRef !== "tValid" &&
    raw.assessedAtCoordinateRef !== "tObservation" &&
    raw.assessedAtCoordinateRef !== "tEInput" &&
    raw.assessedAtCoordinateRef !== "tTrust"
  ) {
    return {
      code: "INVALID_VALUE",
      path: `${path}.assessedAtCoordinateRef`,
      message:
        "assessedAtCoordinateRef must be tValid, tObservation, tEInput, or tTrust",
    };
  }

  // C03: Mandatory provenanceRef
  if (!("provenanceRef" in raw) || raw.provenanceRef === undefined) {
    return {
      code: "MISSING_FIELD",
      path: `${path}.provenanceRef`,
      message: `${path}.provenanceRef is mandatory`,
    };
  }
  const errProvRef = validateRef(
    raw.provenanceRef,
    `${path}.provenanceRef`,
    "PROVENANCE",
  );
  if (errProvRef) return errProvRef;

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
 * Performs a whole-input strict carrier check before structural traversal (C07, R07, R08).
 * Returns ValidationResult with ok: true and typed value, or ok: false and detailed error.
 * Does not throw exceptions, purely deterministic.
 */
export function validateExecutionRequestV2(
  input: unknown,
): ValidationResult<ExecutionRequestV2, ExecutionRequestV2ValidationError> {
  // C07 / R07 / R08: Whole-request strict JSON / runtime safety carrier check
  if (!isStrictJsonValueV2(input)) {
    return {
      ok: false,
      error: {
        code: "INVALID_RUNTIME_VALUE",
        path: "",
        message: "Input contains invalid JSON or runtime values",
      },
    };
  }

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

  // Reject explicit top-level V1 fields immediately
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
