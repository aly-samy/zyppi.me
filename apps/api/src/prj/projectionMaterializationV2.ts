import {
  canonicalizeJcs,
  type ActionSemanticRefV2,
  type ExecutionRequestV2,
  type JsonValueV2,
  type OwnerRefV2,
  type ProvenanceRefV2,
  type RequestedCapabilityRefV2,
  type TargetRefV2,
  type TargetSlotSemanticRefV2,
} from "@zyppi/domain";
import { materializeExecutionReceiptV2 } from "@zyppi/runtime";
import crypto from "node:crypto";

export type PrjErrorCode =
  | "PRJ_INPUT_INVALID"
  | "PRJ_REALITY_VIEW_INVALID"
  | "PRJ_REALITY_VIEW_DIGEST_MISMATCH"
  | "PRJ_REALITY_TARGET_MISMATCH"
  | "PRJ_PROJECTION_UNREGISTERED"
  | "PRJ_REGISTRATION_INVALID"
  | "PRJ_REGISTRATION_DIGEST_MISMATCH"
  | "PRJ_SPECIFICATION_INVALID"
  | "PRJ_SPECIFICATION_DIGEST_MISMATCH"
  | "PRJ_RULESET_UNSUPPORTED"
  | "PRJ_RULESET_BOUNDS_EXCEEDED"
  | "PRJ_POLICY_INTERFACE_UNSUPPORTED"
  | "PRJ_SPECIFICATION_NOT_REQUESTED"
  | "PRJ_CAPABILITY_BINDING_AMBIGUOUS"
  | "PRJ_ACTION_MISMATCH"
  | "PRJ_TARGET_MISMATCH"
  | "PRJ_UPSTREAM_EXECUTION_FAILED"
  | "PRJ_PROJECTION_NOT_AUTHORIZED"
  | "PRJ_SOURCE_PATH_INVALID"
  | "PRJ_SOURCE_TYPE_MISMATCH"
  | "PRJ_OUTPUT_LIMIT_EXCEEDED"
  | "PRJ_MATERIALIZATION_FAILED";

export interface BoundPrjRealityViewV1 {
  readonly viewId: string;
  readonly sourceZid: string;
  readonly sourceTargetRef: TargetRefV2;
  readonly viewType: "CURRENT" | "HISTORICAL" | "AUDIT" | "REGULATORY";
  readonly viewTimestamp: string;
  readonly provenanceRef: ProvenanceRefV2;
  readonly material: JsonValueV2;
  readonly realityDigest: string;
}

export interface BoundPrjProjectionRegistrationV1 {
  readonly registrationId: string;
  readonly projectionType: string;

  readonly specificationRef: {
    readonly specId: string;
    readonly version: string;
    readonly specificationDigest: string;
  };

  readonly freshnessModelRef: string;
  readonly completenessModelRef: string;
  readonly policyInterfaceRef: string;

  readonly supportedProfileRefs: readonly string[];

  readonly provenanceRef: ProvenanceRefV2;
  readonly registrationDigest: string;
}

export type PrjSourceV1 = "REALITY_VIEW" | "CONTEXT";

export type PrjStringTemplateSegmentV1 =
  | {
      readonly kind: "TEXT";
      readonly value: string;
    }
  | {
      readonly kind: "SOURCE_TEXT";
      readonly source: PrjSourceV1;
      readonly path: readonly (string | number)[];
      readonly requirement: "REQUIRED" | "OPTIONAL";
      readonly encoding: "RAW" | "URI_COMPONENT";
    };

export type PrjProjectionNodeV1 =
  | {
      readonly kind: "LITERAL";
      readonly value: JsonValueV2;
    }
  | {
      readonly kind: "SOURCE";
      readonly source: PrjSourceV1;
      readonly path: readonly (string | number)[];
      readonly requirement: "REQUIRED" | "OPTIONAL";
    }
  | {
      readonly kind: "OBJECT";
      readonly fields: readonly {
        readonly key: string;
        readonly node: PrjProjectionNodeV1;
      }[];
    }
  | {
      readonly kind: "ARRAY";
      readonly items: readonly PrjProjectionNodeV1[];
    }
  | {
      readonly kind: "STRING_TEMPLATE";
      readonly segments: readonly PrjStringTemplateSegmentV1[];
    };

export interface PrjProjectionRuleSet01 {
  readonly ruleset: "PRJ-PROJECTION-RULESET-01";
  readonly requiredActionSemanticRef: ActionSemanticRefV2;
  readonly requiredCapabilityRef: RequestedCapabilityRefV2;
  readonly requiredTargetSlotSemanticRefs: readonly TargetSlotSemanticRefV2[];
  readonly root: PrjProjectionNodeV1;
}

export interface BoundPrjProjectionSpecificationV1 {
  readonly specId: string;
  readonly version: string;
  readonly provenanceRef: ProvenanceRefV2;
  readonly specificationDigest: string;

  readonly registration: BoundPrjProjectionRegistrationV1;
  readonly specification: PrjProjectionRuleSet01;
}

export interface PrjMissingBindingV1 {
  readonly outputPath: readonly (string | number)[];
  readonly source: PrjSourceV1;
  readonly sourcePath: readonly (string | number)[];
  readonly requirement: "REQUIRED" | "OPTIONAL";
}

export interface PrjDerivationProofV1 {
  readonly realityDigest: string;
  readonly registrationDigest: string;
  readonly specificationDigest: string;
  readonly executionInputHash: string;
  readonly executionReceiptHash: string;
  readonly contextHash: string;
  readonly policyHash: string;
  readonly provenanceHash: string;
}

export interface PrjProjectionArtifactV1 {
  readonly projectionId: string;
  readonly projectionOwnerRef: OwnerRefV2;
  readonly sourceZid: string;
  readonly projectionType: string;
  readonly viewType: "CURRENT" | "HISTORICAL" | "AUDIT" | "REGULATORY";
  readonly viewTimestamp: string;
  readonly contextHash: string;
  readonly policyHash: string;
  readonly generatedAt: string;

  readonly registrationBinding: {
    readonly registrationId: string;
    readonly registrationDigest: string;
  };

  readonly specificationBinding: {
    readonly specId: string;
    readonly version: string;
    readonly specificationDigest: string;
  };

  readonly sourceReality: {
    readonly viewId: string;
    readonly realityDigest: string;
    readonly provenanceRef: ProvenanceRefV2;
  };

  readonly sourceExecution: {
    readonly requestId: string;
    readonly executionId: string;
    readonly receiptId: string;
    readonly inputHash: string;
    readonly deterministicHash: string;
  };

  readonly projectionCompleteness: "COMPLETE" | "INCOMPLETE";
  readonly missingBindings: readonly PrjMissingBindingV1[];
  readonly output: JsonValueV2;
  readonly derivationProof: PrjDerivationProofV1;
}

export type PrjProjectionMaterializationV2Result =
  | {
      readonly ok: true;
      readonly projection: PrjProjectionArtifactV1;
    }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: PrjErrorCode;
        readonly message: string;
      };
    };

const MAX_NODE_DEPTH = 32;
const MAX_NODE_COUNT = 512;
const MAX_PATH_SEGMENTS = 32;
const MAX_OUTPUT_JCS_UTF8_BYTES = 1_048_576;

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (!Object.isFrozen(obj)) {
    Object.freeze(obj);
  }
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

function compareUtf16(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function refEquals(a: unknown, b: unknown): boolean {
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const resA = safeCanonicalizeJcs(a);
  const resB = safeCanonicalizeJcs(b);
  return resA.ok && resB.ok && resA.value === resB.value;
}

function checkClosedWorldKeys(
  obj: Record<string, unknown>,
  allowedKeys: Set<string>,
  contextName: string,
): { ok: true } | { ok: false; message: string } {
  for (const k of Reflect.ownKeys(obj)) {
    if (typeof k !== "string" || !allowedKeys.has(k)) {
      return {
        ok: false,
        message: `${contextName} contains unadmitted property '${String(k)}'.`,
      };
    }
  }
  return { ok: true };
}

function isValidRefV2(ref: unknown, expectedFamily?: string): boolean {
  if (!isPlainObject(ref)) return false;
  const allowed = new Set([
    "family",
    "ownerRef",
    "artifactId",
    "version",
    "stateRef",
    "provenanceRef",
  ]);
  const check = checkClosedWorldKeys(ref, allowed, "ConstitutionalRefV2");
  if (!check.ok) return false;

  const r = ref as Record<string, unknown>;
  if (typeof r.family !== "string" || r.family.trim() === "") return false;
  if (expectedFamily !== undefined && r.family !== expectedFamily) return false;
  if (typeof r.ownerRef !== "string" || r.ownerRef.trim() === "") return false;
  if (typeof r.artifactId !== "string" || r.artifactId.trim() === "")
    return false;

  if (
    hasOwnProp(r, "version") &&
    (typeof r.version !== "string" || r.version.trim() === "")
  )
    return false;
  if (
    hasOwnProp(r, "stateRef") &&
    (typeof r.stateRef !== "string" || r.stateRef.trim() === "")
  )
    return false;
  if (
    hasOwnProp(r, "provenanceRef") &&
    (typeof r.provenanceRef !== "string" || r.provenanceRef.trim() === "")
  )
    return false;

  return true;
}

function validateAndReDeriveRealityView(
  rv: unknown,
):
  | { ok: true; data: BoundPrjRealityViewV1 }
  | { ok: false; code: PrjErrorCode; message: string } {
  if (!isPlainObject(rv)) {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: "realityView must be a plain object.",
    };
  }

  const allowedKeys = new Set([
    "viewId",
    "sourceZid",
    "sourceTargetRef",
    "viewType",
    "viewTimestamp",
    "provenanceRef",
    "material",
    "realityDigest",
  ]);
  const keyCheck = checkClosedWorldKeys(rv, allowedKeys, "realityView");
  if (!keyCheck.ok) {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: keyCheck.message,
    };
  }

  const requiredProps = [
    "viewId",
    "sourceZid",
    "sourceTargetRef",
    "viewType",
    "viewTimestamp",
    "provenanceRef",
    "material",
    "realityDigest",
  ];
  for (const p of requiredProps) {
    if (!hasOwnProp(rv, p)) {
      return {
        ok: false,
        code: "PRJ_REALITY_VIEW_INVALID",
        message: `realityView missing required property '${p}'.`,
      };
    }
  }

  if (typeof rv.viewId !== "string" || rv.viewId.trim() === "") {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: "viewId must be a non-empty string.",
    };
  }

  if (typeof rv.sourceZid !== "string" || rv.sourceZid.trim() === "") {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: "sourceZid must be a non-empty string.",
    };
  }

  if (!isValidRefV2(rv.sourceTargetRef, "TARGET")) {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: "sourceTargetRef is invalid.",
    };
  }

  const validViewTypes = new Set([
    "CURRENT",
    "HISTORICAL",
    "AUDIT",
    "REGULATORY",
  ]);
  if (typeof rv.viewType !== "string" || !validViewTypes.has(rv.viewType)) {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: "viewType must be CURRENT, HISTORICAL, AUDIT, or REGULATORY.",
    };
  }

  if (typeof rv.viewTimestamp !== "string" || rv.viewTimestamp.trim() === "") {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: "viewTimestamp must be a non-empty string.",
    };
  }

  if (!isValidRefV2(rv.provenanceRef, "PROVENANCE")) {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: "provenanceRef is invalid.",
    };
  }

  if (typeof rv.realityDigest !== "string") {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: "realityDigest must be a string.",
    };
  }

  const preimage = {
    viewId: rv.viewId,
    sourceZid: rv.sourceZid,
    sourceTargetRef: rv.sourceTargetRef,
    viewType: rv.viewType,
    viewTimestamp: rv.viewTimestamp,
    provenanceRef: rv.provenanceRef,
    material: rv.material,
  };

  const cRes = safeCanonicalizeJcs(preimage);
  if (!cRes.ok) {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_INVALID",
      message: `Failed to canonicalize realityView material: ${cRes.error}`,
    };
  }

  const computedDigest = `sha256:${computeSha256Hex(cRes.value)}`;
  if (computedDigest !== rv.realityDigest) {
    return {
      ok: false,
      code: "PRJ_REALITY_VIEW_DIGEST_MISMATCH",
      message: `realityDigest mismatch. Expected '${computedDigest}', got '${rv.realityDigest}'.`,
    };
  }

  return {
    ok: true,
    data: {
      viewId: rv.viewId as string,
      sourceZid: rv.sourceZid as string,
      sourceTargetRef: rv.sourceTargetRef as unknown as TargetRefV2,
      viewType: rv.viewType as
        "CURRENT" | "HISTORICAL" | "AUDIT" | "REGULATORY",
      viewTimestamp: rv.viewTimestamp as string,
      provenanceRef: rv.provenanceRef as unknown as ProvenanceRefV2,
      material: rv.material as JsonValueV2,
      realityDigest: rv.realityDigest as string,
    },
  };
}

function validateAndReDeriveRegistration(
  reg: unknown,
):
  | { ok: true; data: BoundPrjProjectionRegistrationV1 }
  | { ok: false; code: PrjErrorCode; message: string } {
  if (!isPlainObject(reg)) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "registration must be a plain object.",
    };
  }

  const allowedKeys = new Set([
    "registrationId",
    "projectionType",
    "specificationRef",
    "freshnessModelRef",
    "completenessModelRef",
    "policyInterfaceRef",
    "supportedProfileRefs",
    "provenanceRef",
    "registrationDigest",
  ]);
  const keyCheck = checkClosedWorldKeys(reg, allowedKeys, "registration");
  if (!keyCheck.ok) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: keyCheck.message,
    };
  }

  const requiredProps = [
    "registrationId",
    "projectionType",
    "specificationRef",
    "freshnessModelRef",
    "completenessModelRef",
    "policyInterfaceRef",
    "supportedProfileRefs",
    "provenanceRef",
    "registrationDigest",
  ];
  for (const p of requiredProps) {
    if (!hasOwnProp(reg, p)) {
      return {
        ok: false,
        code: "PRJ_REGISTRATION_INVALID",
        message: `registration missing required property '${p}'.`,
      };
    }
  }

  if (
    typeof reg.registrationId !== "string" ||
    reg.registrationId.trim() === ""
  ) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "registrationId must be a non-empty string.",
    };
  }

  if (
    typeof reg.projectionType !== "string" ||
    reg.projectionType.trim() === ""
  ) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "projectionType must be a non-empty string.",
    };
  }

  if (!isPlainObject(reg.specificationRef)) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "specificationRef must be a plain object.",
    };
  }

  const specRefKeys = new Set(["specId", "version", "specificationDigest"]);
  const specRefCheck = checkClosedWorldKeys(
    reg.specificationRef,
    specRefKeys,
    "specificationRef",
  );
  if (!specRefCheck.ok) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: specRefCheck.message,
    };
  }

  const specRef = reg.specificationRef as Record<string, unknown>;
  if (typeof specRef.specId !== "string" || specRef.specId.trim() === "") {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "specificationRef.specId must be a non-empty string.",
    };
  }
  if (typeof specRef.version !== "string" || specRef.version.trim() === "") {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "specificationRef.version must be a non-empty string.",
    };
  }
  if (
    typeof specRef.specificationDigest !== "string" ||
    specRef.specificationDigest.trim() === ""
  ) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message:
        "specificationRef.specificationDigest must be a non-empty string.",
    };
  }

  if (
    typeof reg.freshnessModelRef !== "string" ||
    reg.freshnessModelRef.trim() === ""
  ) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "freshnessModelRef must be a non-empty string.",
    };
  }

  if (
    typeof reg.completenessModelRef !== "string" ||
    reg.completenessModelRef.trim() === ""
  ) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "completenessModelRef must be a non-empty string.",
    };
  }

  if (
    typeof reg.policyInterfaceRef !== "string" ||
    reg.policyInterfaceRef.trim() === ""
  ) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "policyInterfaceRef must be a non-empty string.",
    };
  }

  if (!Array.isArray(reg.supportedProfileRefs)) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "supportedProfileRefs must be an array.",
    };
  }
  for (const pr of reg.supportedProfileRefs) {
    if (typeof pr !== "string" || pr.trim() === "") {
      return {
        ok: false,
        code: "PRJ_REGISTRATION_INVALID",
        message: "supportedProfileRefs element must be a non-empty string.",
      };
    }
  }

  if (!isValidRefV2(reg.provenanceRef, "PROVENANCE")) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "provenanceRef in registration is invalid.",
    };
  }

  if (typeof reg.registrationDigest !== "string") {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: "registrationDigest must be a string.",
    };
  }

  const preimage = {
    registrationId: reg.registrationId,
    projectionType: reg.projectionType,
    specificationRef: {
      specId: specRef.specId,
      version: specRef.version,
      specificationDigest: specRef.specificationDigest,
    },
    freshnessModelRef: reg.freshnessModelRef,
    completenessModelRef: reg.completenessModelRef,
    policyInterfaceRef: reg.policyInterfaceRef,
    supportedProfileRefs: reg.supportedProfileRefs,
    provenanceRef: reg.provenanceRef,
  };

  const cRes = safeCanonicalizeJcs(preimage);
  if (!cRes.ok) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_INVALID",
      message: `Failed to canonicalize registration: ${cRes.error}`,
    };
  }

  const computedDigest = `sha256:${computeSha256Hex(cRes.value)}`;
  if (computedDigest !== reg.registrationDigest) {
    return {
      ok: false,
      code: "PRJ_REGISTRATION_DIGEST_MISMATCH",
      message: `registrationDigest mismatch. Expected '${computedDigest}', got '${reg.registrationDigest}'.`,
    };
  }

  return {
    ok: true,
    data: {
      registrationId: reg.registrationId as string,
      projectionType: reg.projectionType as string,
      specificationRef: {
        specId: specRef.specId as string,
        version: specRef.version as string,
        specificationDigest: specRef.specificationDigest as string,
      },
      freshnessModelRef: reg.freshnessModelRef as string,
      completenessModelRef: reg.completenessModelRef as string,
      policyInterfaceRef: reg.policyInterfaceRef as string,
      supportedProfileRefs: reg.supportedProfileRefs as readonly string[],
      provenanceRef: reg.provenanceRef as unknown as ProvenanceRefV2,
      registrationDigest: reg.registrationDigest as string,
    },
  };
}

function validateNodeGrammar(
  node: unknown,
  depth: number,
  state: { count: number },
): { ok: true } | { ok: false; code: PrjErrorCode; message: string } {
  state.count++;
  if (depth > MAX_NODE_DEPTH || state.count > MAX_NODE_COUNT) {
    return {
      ok: false,
      code: "PRJ_RULESET_BOUNDS_EXCEEDED",
      message: "Node depth or count limit exceeded in specification ruleset.",
    };
  }

  if (!isPlainObject(node)) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "Projection node must be a plain object.",
    };
  }

  if (!hasOwnProp(node, "kind") || typeof node.kind !== "string") {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "Projection node missing valid 'kind' string.",
    };
  }

  switch (node.kind) {
    case "LITERAL": {
      const allowed = new Set(["kind", "value"]);
      const check = checkClosedWorldKeys(node, allowed, "LITERAL node");
      if (!check.ok)
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: check.message,
        };
      if (!hasOwnProp(node, "value")) {
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: "LITERAL node missing property 'value'.",
        };
      }
      return { ok: true };
    }
    case "SOURCE": {
      const allowed = new Set(["kind", "source", "path", "requirement"]);
      const check = checkClosedWorldKeys(node, allowed, "SOURCE node");
      if (!check.ok)
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: check.message,
        };
      if (node.source !== "REALITY_VIEW" && node.source !== "CONTEXT") {
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: "SOURCE node 'source' must be REALITY_VIEW or CONTEXT.",
        };
      }
      if (!Array.isArray(node.path)) {
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: "SOURCE node 'path' must be an array.",
        };
      }
      if (node.path.length > MAX_PATH_SEGMENTS) {
        return {
          ok: false,
          code: "PRJ_RULESET_BOUNDS_EXCEEDED",
          message: "SOURCE node path length limit exceeded.",
        };
      }
      for (const seg of node.path) {
        if (typeof seg === "string") {
          if (
            seg === "" ||
            seg === "__proto__" ||
            seg === "prototype" ||
            seg === "constructor"
          ) {
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message: `Invalid string path segment '${seg}'.`,
            };
          }
        } else if (typeof seg === "number") {
          if (!Number.isInteger(seg) || seg < 0) {
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message: `Invalid numeric path segment '${seg}'.`,
            };
          }
        } else {
          return {
            ok: false,
            code: "PRJ_SPECIFICATION_INVALID",
            message: "Path segment must be a string or non-negative integer.",
          };
        }
      }
      if (node.requirement !== "REQUIRED" && node.requirement !== "OPTIONAL") {
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: "SOURCE node requirement must be REQUIRED or OPTIONAL.",
        };
      }
      return { ok: true };
    }
    case "OBJECT": {
      const allowed = new Set(["kind", "fields"]);
      const check = checkClosedWorldKeys(node, allowed, "OBJECT node");
      if (!check.ok)
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: check.message,
        };
      if (!Array.isArray(node.fields)) {
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: "OBJECT node 'fields' must be an array.",
        };
      }
      const seenKeys = new Set<string>();
      for (const field of node.fields) {
        if (!isPlainObject(field)) {
          return {
            ok: false,
            code: "PRJ_SPECIFICATION_INVALID",
            message: "OBJECT field entry must be a plain object.",
          };
        }
        const fieldAllowed = new Set(["key", "node"]);
        const fieldCheck = checkClosedWorldKeys(
          field,
          fieldAllowed,
          "OBJECT field",
        );
        if (!fieldCheck.ok)
          return {
            ok: false,
            code: "PRJ_SPECIFICATION_INVALID",
            message: fieldCheck.message,
          };
        if (
          typeof field.key !== "string" ||
          field.key.trim() === "" ||
          field.key === "__proto__" ||
          field.key === "prototype" ||
          field.key === "constructor"
        ) {
          return {
            ok: false,
            code: "PRJ_SPECIFICATION_INVALID",
            message: `OBJECT field key '${String(field.key)}' is invalid.`,
          };
        }
        if (seenKeys.has(field.key)) {
          return {
            ok: false,
            code: "PRJ_SPECIFICATION_INVALID",
            message: `Duplicate OBJECT field key '${field.key}'.`,
          };
        }
        seenKeys.add(field.key);
        const childRes = validateNodeGrammar(field.node, depth + 1, state);
        if (!childRes.ok) return childRes;
      }
      return { ok: true };
    }
    case "ARRAY": {
      const allowed = new Set(["kind", "items"]);
      const check = checkClosedWorldKeys(node, allowed, "ARRAY node");
      if (!check.ok)
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: check.message,
        };
      if (!Array.isArray(node.items)) {
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: "ARRAY node 'items' must be an array.",
        };
      }
      for (const item of node.items) {
        const childRes = validateNodeGrammar(item, depth + 1, state);
        if (!childRes.ok) return childRes;
      }
      return { ok: true };
    }
    case "STRING_TEMPLATE": {
      const allowed = new Set(["kind", "segments"]);
      const check = checkClosedWorldKeys(node, allowed, "STRING_TEMPLATE node");
      if (!check.ok)
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: check.message,
        };
      if (!Array.isArray(node.segments)) {
        return {
          ok: false,
          code: "PRJ_SPECIFICATION_INVALID",
          message: "STRING_TEMPLATE node 'segments' must be an array.",
        };
      }
      for (const seg of node.segments) {
        if (!isPlainObject(seg)) {
          return {
            ok: false,
            code: "PRJ_SPECIFICATION_INVALID",
            message: "STRING_TEMPLATE segment must be a plain object.",
          };
        }
        if (seg.kind === "TEXT") {
          const segAllowed = new Set(["kind", "value"]);
          const segCheck = checkClosedWorldKeys(
            seg,
            segAllowed,
            "TEXT segment",
          );
          if (!segCheck.ok)
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message: segCheck.message,
            };
          if (typeof seg.value !== "string") {
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message: "TEXT segment value must be a string.",
            };
          }
        } else if (seg.kind === "SOURCE_TEXT") {
          const segAllowed = new Set([
            "kind",
            "source",
            "path",
            "requirement",
            "encoding",
          ]);
          const segCheck = checkClosedWorldKeys(
            seg,
            segAllowed,
            "SOURCE_TEXT segment",
          );
          if (!segCheck.ok)
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message: segCheck.message,
            };
          if (seg.source !== "REALITY_VIEW" && seg.source !== "CONTEXT") {
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message:
                "SOURCE_TEXT segment 'source' must be REALITY_VIEW or CONTEXT.",
            };
          }
          if (!Array.isArray(seg.path)) {
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message: "SOURCE_TEXT segment 'path' must be an array.",
            };
          }
          if (seg.path.length > MAX_PATH_SEGMENTS) {
            return {
              ok: false,
              code: "PRJ_RULESET_BOUNDS_EXCEEDED",
              message: "SOURCE_TEXT segment path length limit exceeded.",
            };
          }
          for (const p of seg.path) {
            if (typeof p === "string") {
              if (
                p === "" ||
                p === "__proto__" ||
                p === "prototype" ||
                p === "constructor"
              ) {
                return {
                  ok: false,
                  code: "PRJ_SPECIFICATION_INVALID",
                  message: `Invalid string path segment '${p}' in template.`,
                };
              }
            } else if (typeof p === "number") {
              if (!Number.isInteger(p) || p < 0) {
                return {
                  ok: false,
                  code: "PRJ_SPECIFICATION_INVALID",
                  message: `Invalid numeric path segment '${p}' in template.`,
                };
              }
            } else {
              return {
                ok: false,
                code: "PRJ_SPECIFICATION_INVALID",
                message:
                  "Template path segment must be a string or non-negative integer.",
              };
            }
          }
          if (
            seg.requirement !== "REQUIRED" &&
            seg.requirement !== "OPTIONAL"
          ) {
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message:
                "SOURCE_TEXT segment requirement must be REQUIRED or OPTIONAL.",
            };
          }
          if (seg.encoding !== "RAW" && seg.encoding !== "URI_COMPONENT") {
            return {
              ok: false,
              code: "PRJ_SPECIFICATION_INVALID",
              message:
                "SOURCE_TEXT segment encoding must be RAW or URI_COMPONENT.",
            };
          }
        } else {
          return {
            ok: false,
            code: "PRJ_SPECIFICATION_INVALID",
            message:
              "STRING_TEMPLATE segment kind must be TEXT or SOURCE_TEXT.",
          };
        }
      }
      return { ok: true };
    }
    default:
      return {
        ok: false,
        code: "PRJ_SPECIFICATION_INVALID",
        message: `Unknown node kind '${String(node.kind)}'.`,
      };
  }
}

function validateAndReDeriveSpecification(
  spec: unknown,
):
  | { ok: true; data: BoundPrjProjectionSpecificationV1 }
  | { ok: false; code: PrjErrorCode; message: string } {
  if (!isPlainObject(spec)) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "boundSpecification must be a plain object.",
    };
  }

  const allowedKeys = new Set([
    "specId",
    "version",
    "provenanceRef",
    "specificationDigest",
    "registration",
    "specification",
  ]);
  const keyCheck = checkClosedWorldKeys(
    spec,
    allowedKeys,
    "boundSpecification",
  );
  if (!keyCheck.ok) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: keyCheck.message,
    };
  }

  const requiredProps = [
    "specId",
    "version",
    "provenanceRef",
    "specificationDigest",
    "registration",
    "specification",
  ];
  for (const p of requiredProps) {
    if (!hasOwnProp(spec, p)) {
      return {
        ok: false,
        code: "PRJ_SPECIFICATION_INVALID",
        message: `boundSpecification missing required property '${p}'.`,
      };
    }
  }

  if (typeof spec.specId !== "string" || spec.specId.trim() === "") {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "specId must be a non-empty string.",
    };
  }

  if (typeof spec.version !== "string" || spec.version.trim() === "") {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "version must be a non-empty string.",
    };
  }

  if (!isValidRefV2(spec.provenanceRef, "PROVENANCE")) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "provenanceRef in boundSpecification is invalid.",
    };
  }

  if (typeof spec.specificationDigest !== "string") {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "specificationDigest must be a string.",
    };
  }

  // Validate embedded registration
  const regRes = validateAndReDeriveRegistration(spec.registration);
  if (!regRes.ok) {
    return regRes;
  }
  const registrationData = regRes.data;

  // Validate registration/specification binding consistency
  if (
    registrationData.specificationRef.specId !== spec.specId ||
    registrationData.specificationRef.version !== spec.version ||
    registrationData.specificationRef.specificationDigest !==
      spec.specificationDigest
  ) {
    return {
      ok: false,
      code: "PRJ_PROJECTION_UNREGISTERED",
      message:
        "boundSpecification identity does not match registration specificationRef.",
    };
  }

  // Validate specification grammar (RuleSet01)
  const ruleset = spec.specification;
  if (!isPlainObject(ruleset)) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "specification ruleset must be a plain object.",
    };
  }

  if (!hasOwnProp(ruleset, "ruleset") || typeof ruleset.ruleset !== "string") {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "specification missing 'ruleset' string.",
    };
  }

  if (ruleset.ruleset !== "PRJ-PROJECTION-RULESET-01") {
    return {
      ok: false,
      code: "PRJ_RULESET_UNSUPPORTED",
      message: `Unsupported ruleset '${ruleset.ruleset}'. Expected 'PRJ-PROJECTION-RULESET-01'.`,
    };
  }

  const allowedRuleSetKeys = new Set([
    "ruleset",
    "requiredActionSemanticRef",
    "requiredCapabilityRef",
    "requiredTargetSlotSemanticRefs",
    "root",
  ]);
  const ruleSetKeyCheck = checkClosedWorldKeys(
    ruleset,
    allowedRuleSetKeys,
    "specification ruleset",
  );
  if (!ruleSetKeyCheck.ok) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: ruleSetKeyCheck.message,
    };
  }

  if (!isValidRefV2(ruleset.requiredActionSemanticRef, "ACTION_SEMANTIC")) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "requiredActionSemanticRef is invalid.",
    };
  }

  const reqCapRef = ruleset.requiredCapabilityRef as Record<string, unknown>;
  if (
    !isValidRefV2(ruleset.requiredCapabilityRef, "REQUESTED_CAPABILITY") ||
    reqCapRef.ownerRef !== "urn:zyppi:owner:prj:v1" ||
    reqCapRef.artifactId !== spec.specId ||
    reqCapRef.version !== spec.version
  ) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message:
        "requiredCapabilityRef must be owned by urn:zyppi:owner:prj:v1 with artifactId and version matching specId and version.",
    };
  }

  if (!Array.isArray(ruleset.requiredTargetSlotSemanticRefs)) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "requiredTargetSlotSemanticRefs must be an array.",
    };
  }

  if (ruleset.requiredTargetSlotSemanticRefs.length === 0) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: "requiredTargetSlotSemanticRefs must contain at least one slot.",
    };
  }

  const seenSlots = new Set<string>();
  const parsedSlots: TargetSlotSemanticRefV2[] = [];
  for (const slot of ruleset.requiredTargetSlotSemanticRefs) {
    if (!isValidRefV2(slot, "TARGET_SLOT_SEMANTIC")) {
      return {
        ok: false,
        code: "PRJ_SPECIFICATION_INVALID",
        message: "Element in requiredTargetSlotSemanticRefs is invalid.",
      };
    }
    const cSlot = safeCanonicalizeJcs(slot);
    if (!cSlot.ok) {
      return {
        ok: false,
        code: "PRJ_SPECIFICATION_INVALID",
        message: "Failed to canonicalize requiredTargetSlotSemanticRef.",
      };
    }
    if (seenSlots.has(cSlot.value)) {
      return {
        ok: false,
        code: "PRJ_SPECIFICATION_INVALID",
        message: "Duplicate entry in requiredTargetSlotSemanticRefs.",
      };
    }
    seenSlots.add(cSlot.value);
    parsedSlots.push(slot as unknown as TargetSlotSemanticRefV2);
  }

  // Validate root node grammar recursively
  const nodeState = { count: 0 };
  const rootCheck = validateNodeGrammar(ruleset.root, 1, nodeState);
  if (!rootCheck.ok) {
    return rootCheck;
  }

  // Re-derive specificationDigest
  const specPreimage = {
    specId: spec.specId,
    version: spec.version,
    provenanceRef: spec.provenanceRef,
    specification: ruleset,
  };

  const cRes = safeCanonicalizeJcs(specPreimage);
  if (!cRes.ok) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_INVALID",
      message: `Failed to canonicalize specification: ${cRes.error}`,
    };
  }

  const computedSpecDigest = `sha256:${computeSha256Hex(cRes.value)}`;
  if (computedSpecDigest !== spec.specificationDigest) {
    return {
      ok: false,
      code: "PRJ_SPECIFICATION_DIGEST_MISMATCH",
      message: `specificationDigest mismatch. Expected '${computedSpecDigest}', got '${spec.specificationDigest}'.`,
    };
  }

  return {
    ok: true,
    data: {
      specId: spec.specId as string,
      version: spec.version as string,
      provenanceRef: spec.provenanceRef as unknown as ProvenanceRefV2,
      specificationDigest: spec.specificationDigest as string,
      registration: registrationData,
      specification: {
        ruleset: "PRJ-PROJECTION-RULESET-01",
        requiredActionSemanticRef:
          ruleset.requiredActionSemanticRef as unknown as ActionSemanticRefV2,
        requiredCapabilityRef:
          ruleset.requiredCapabilityRef as unknown as RequestedCapabilityRefV2,
        requiredTargetSlotSemanticRefs: parsedSlots,
        root: ruleset.root as PrjProjectionNodeV1,
      },
    },
  };
}

function traverseSourcePath(
  root: unknown,
  path: readonly (string | number)[],
):
  | { ok: true; value: unknown }
  | { ok: false; code: PrjErrorCode; message: string } {
  let curr = root;
  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (typeof seg === "string") {
      if (!isPlainObject(curr)) {
        return {
          ok: false,
          code: "PRJ_SOURCE_PATH_INVALID",
          message: `Cannot traverse string property '${seg}' on non-object value at path index ${i}.`,
        };
      }
      if (!hasOwnProp(curr, seg)) {
        return { ok: true, value: undefined };
      }
      curr = (curr as Record<string, unknown>)[seg];
    } else {
      if (!Array.isArray(curr)) {
        return {
          ok: false,
          code: "PRJ_SOURCE_PATH_INVALID",
          message: `Cannot traverse numeric index ${seg} on non-array value at path index ${i}.`,
        };
      }
      if (seg >= curr.length) {
        return { ok: true, value: undefined };
      }
      curr = curr[seg];
    }
  }
  return { ok: true, value: curr };
}

function evaluateProjectionNode(
  node: PrjProjectionNodeV1,
  realityMaterial: unknown,
  contextEnvelope: unknown,
  currentOutputPath: readonly (string | number)[],
  missingBindings: PrjMissingBindingV1[],
):
  | { ok: true; value: JsonValueV2 }
  | { ok: false; code: PrjErrorCode; message: string } {
  switch (node.kind) {
    case "LITERAL":
      return { ok: true, value: node.value };

    case "SOURCE": {
      const sourceRoot =
        node.source === "REALITY_VIEW" ? realityMaterial : contextEnvelope;
      const res = traverseSourcePath(sourceRoot, node.path);
      if (!res.ok) return res;

      if (res.value === undefined) {
        missingBindings.push({
          outputPath: currentOutputPath,
          source: node.source,
          sourcePath: node.path,
          requirement: node.requirement,
        });
        return { ok: true, value: null };
      }
      return { ok: true, value: res.value as JsonValueV2 };
    }

    case "OBJECT": {
      const objResult: Record<string, JsonValueV2> = {};
      for (const field of node.fields) {
        const fieldPath = [...currentOutputPath, field.key];
        const res = evaluateProjectionNode(
          field.node,
          realityMaterial,
          contextEnvelope,
          fieldPath,
          missingBindings,
        );
        if (!res.ok) return res;
        objResult[field.key] = res.value;
      }
      return { ok: true, value: objResult as JsonValueV2 };
    }

    case "ARRAY": {
      const arrResult: JsonValueV2[] = [];
      for (let i = 0; i < node.items.length; i++) {
        const itemPath = [...currentOutputPath, i];
        const res = evaluateProjectionNode(
          node.items[i],
          realityMaterial,
          contextEnvelope,
          itemPath,
          missingBindings,
        );
        if (!res.ok) return res;
        arrResult.push(res.value);
      }
      return { ok: true, value: arrResult as JsonValueV2 };
    }

    case "STRING_TEMPLATE": {
      let strAcc = "";
      for (const seg of node.segments) {
        if (seg.kind === "TEXT") {
          strAcc += seg.value;
        } else {
          const sourceRoot =
            seg.source === "REALITY_VIEW" ? realityMaterial : contextEnvelope;
          const res = traverseSourcePath(sourceRoot, seg.path);
          if (!res.ok) return res;

          if (res.value === undefined) {
            missingBindings.push({
              outputPath: currentOutputPath,
              source: seg.source,
              sourcePath: seg.path,
              requirement: seg.requirement,
            });
            return { ok: true, value: null };
          }

          if (typeof res.value !== "string") {
            return {
              ok: false,
              code: "PRJ_SOURCE_TYPE_MISMATCH",
              message: `Template SOURCE_TEXT expected string, got ${typeof res.value}.`,
            };
          }

          const encoded =
            seg.encoding === "URI_COMPONENT"
              ? encodeURIComponent(res.value)
              : res.value;
          strAcc += encoded;
        }
      }
      return { ok: true, value: strAcc };
    }

    default:
      return {
        ok: false,
        code: "PRJ_MATERIALIZATION_FAILED",
        message: "Unrecognized node during evaluation.",
      };
  }
}

function sortAndDeduplicateMissingBindings(
  bindings: readonly PrjMissingBindingV1[],
): readonly PrjMissingBindingV1[] {
  const map = new Map<string, PrjMissingBindingV1>();
  for (const b of bindings) {
    const cRes = safeCanonicalizeJcs(b);
    if (cRes.ok) {
      if (!map.has(cRes.value)) {
        map.set(cRes.value, b);
      }
    }
  }

  const sortedKeys = Array.from(map.keys()).sort(compareUtf16);
  return sortedKeys.map((k) => map.get(k)!);
}

export function materializePrjProjectionV2(
  input: unknown,
): PrjProjectionMaterializationV2Result {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      error: {
        code: "PRJ_INPUT_INVALID",
        message: "Input must be a plain object.",
      },
    };
  }

  const allowedInputKeys = new Set([
    "executionRequest",
    "realityView",
    "boundSpecification",
  ]);
  const inputCheck = checkClosedWorldKeys(input, allowedInputKeys, "input");
  if (!inputCheck.ok) {
    return {
      ok: false,
      error: {
        code: "PRJ_INPUT_INVALID",
        message: inputCheck.message,
      },
    };
  }

  if (
    !hasOwnProp(input, "executionRequest") ||
    !hasOwnProp(input, "realityView") ||
    !hasOwnProp(input, "boundSpecification")
  ) {
    return {
      ok: false,
      error: {
        code: "PRJ_INPUT_INVALID",
        message:
          "Input missing required own property 'executionRequest', 'realityView', or 'boundSpecification'.",
      },
    };
  }

  const rawExecutionRequest = input.executionRequest;
  const rawRealityView = input.realityView;
  const rawBoundSpecification = input.boundSpecification;

  // 1. Validate & re-derive Reality View
  const rvRes = validateAndReDeriveRealityView(rawRealityView);
  if (!rvRes.ok) {
    return { ok: false, error: { code: rvRes.code, message: rvRes.message } };
  }
  const realityView = rvRes.data;

  // 2. Validate & re-derive Specification and Registration
  const specRes = validateAndReDeriveSpecification(rawBoundSpecification);
  if (!specRes.ok) {
    return {
      ok: false,
      error: { code: specRes.code, message: specRes.message },
    };
  }
  const boundSpecification = specRes.data;
  const registration = boundSpecification.registration;
  const specification = boundSpecification.specification;

  // 3. Policy Interface Fail-Closed Gate
  if (
    registration.policyInterfaceRef !==
    "prj:policy-interface:whole-projection:v1"
  ) {
    return {
      ok: false,
      error: {
        code: "PRJ_POLICY_INTERFACE_UNSUPPORTED",
        message: `Unsupported policy interface '${registration.policyInterfaceRef}'. Only 'prj:policy-interface:whole-projection:v1' is supported.`,
      },
    };
  }

  // 4. Validate raw ExecutionRequest shape before RI call
  if (!isPlainObject(rawExecutionRequest)) {
    return {
      ok: false,
      error: {
        code: "PRJ_INPUT_INVALID",
        message: "executionRequest must be a plain object.",
      },
    };
  }
  const req = rawExecutionRequest as Record<string, unknown>;
  if (!isPlainObject(req.requestedAction)) {
    return {
      ok: false,
      error: {
        code: "PRJ_INPUT_INVALID",
        message: "executionRequest.requestedAction must be a plain object.",
      },
    };
  }
  const action = req.requestedAction as Record<string, unknown>;

  // Reality Target Binding Check
  if (!Array.isArray(action.actionTargetBindings)) {
    return {
      ok: false,
      error: {
        code: "PRJ_INPUT_INVALID",
        message: "actionTargetBindings must be an array.",
      },
    };
  }

  const matchingTargets = action.actionTargetBindings.filter(
    (tb) =>
      isPlainObject(tb) && refEquals(tb.targetRef, realityView.sourceTargetRef),
  );

  if (matchingTargets.length !== 1) {
    return {
      ok: false,
      error: {
        code: "PRJ_REALITY_TARGET_MISMATCH",
        message: `Expected exactly 1 target matching realityView.sourceTargetRef, found ${matchingTargets.length}.`,
      },
    };
  }

  // Capability Claim Binding Check
  if (!Array.isArray(action.requestedCapabilityClaimBindings)) {
    return {
      ok: false,
      error: {
        code: "PRJ_INPUT_INVALID",
        message: "requestedCapabilityClaimBindings must be an array.",
      },
    };
  }

  const matchingCapabilityClaims =
    action.requestedCapabilityClaimBindings.filter(
      (cc) =>
        isPlainObject(cc) &&
        refEquals(
          cc.requestedCapabilityRef,
          specification.requiredCapabilityRef,
        ),
    );

  if (matchingCapabilityClaims.length === 0) {
    return {
      ok: false,
      error: {
        code: "PRJ_SPECIFICATION_NOT_REQUESTED",
        message:
          "Required PRJ capability is not requested in executionRequest.",
      },
    };
  }
  if (matchingCapabilityClaims.length > 1) {
    return {
      ok: false,
      error: {
        code: "PRJ_CAPABILITY_BINDING_AMBIGUOUS",
        message:
          "Multiple matching capability claims found in executionRequest.",
      },
    };
  }

  // Action Exactness Check
  if (
    !refEquals(
      specification.requiredActionSemanticRef,
      action.actionSemanticRef,
    )
  ) {
    return {
      ok: false,
      error: {
        code: "PRJ_ACTION_MISMATCH",
        message: "Action semantic ref mismatch with specification requirement.",
      },
    };
  }

  // Target Slot Exactness Check
  const actionTargets = action.actionTargetBindings as Record<
    string,
    unknown
  >[];
  for (const reqSlot of specification.requiredTargetSlotSemanticRefs) {
    const hasSlot = actionTargets.some((at) =>
      refEquals(at.targetSlotSemanticRef, reqSlot),
    );
    if (!hasSlot) {
      return {
        ok: false,
        error: {
          code: "PRJ_TARGET_MISMATCH",
          message:
            "Required target slot semantic ref missing from requested action.",
        },
      };
    }
  }

  for (const at of actionTargets) {
    const isAdmittedSlot = specification.requiredTargetSlotSemanticRefs.some(
      (reqSlot) => refEquals(at.targetSlotSemanticRef, reqSlot),
    );
    if (!isAdmittedSlot) {
      return {
        ok: false,
        error: {
          code: "PRJ_TARGET_MISMATCH",
          message:
            "Requested action contains unadmitted target slot semantic ref.",
        },
      };
    }
  }

  // 5. Invoke Public Runtime Predecessor
  let riReceiptRes: ReturnType<typeof materializeExecutionReceiptV2>;
  try {
    riReceiptRes = materializeExecutionReceiptV2(
      rawExecutionRequest as unknown as ExecutionRequestV2,
    );
  } catch (e) {
    return {
      ok: false,
      error: {
        code: "PRJ_UPSTREAM_EXECUTION_FAILED",
        message: `Upstream RI invocation threw exception: ${e instanceof Error ? e.message : String(e)}`,
      },
    };
  }

  if (!riReceiptRes.ok) {
    const stageStr = "stage" in riReceiptRes ? String(riReceiptRes.stage) : "";
    const errObj =
      "error" in riReceiptRes &&
      riReceiptRes.error &&
      typeof riReceiptRes.error === "object"
        ? riReceiptRes.error
        : null;
    const errCodeStr = errObj && "code" in errObj ? String(errObj.code) : "";
    const errMsgStr =
      errObj && "message" in errObj
        ? String(errObj.message)
        : "Upstream execution failed.";

    const details = [stageStr, errCodeStr].filter(Boolean).join("/");
    const formattedMsg = details ? `[${details}] ${errMsgStr}` : errMsgStr;

    return {
      ok: false,
      error: {
        code: "PRJ_UPSTREAM_EXECUTION_FAILED",
        message: formattedMsg,
      },
    };
  }

  // 6. Consume Exact Sealed Request & Classified Owner Results from RI Frame
  const receiptFrame = riReceiptRes.frame;
  const outcomeFrame = receiptFrame.executabilityOutcomeFrame;
  const integrationFrame = outcomeFrame.ownerIntegrationFrame;
  const prodFrame = integrationFrame.productionFrame;
  const sealedExecutionRequest = prodFrame.executionRequest;
  const executionReceipt = receiptFrame.executionReceipt;

  // 7. Enforce POL Gate & RI Executability Gate using RI-classified owner results
  const polAggregate = outcomeFrame.ownerResults.policyAggregate;
  const polAuthorization = outcomeFrame.ownerResults.authorization;

  if (!polAggregate || !polAuthorization) {
    return {
      ok: false,
      error: {
        code: "PRJ_PROJECTION_NOT_AUTHORIZED",
        message:
          "POL owner determinations missing from sealed execution request.",
      },
    };
  }

  const aggNative = polAggregate.ownerNativeResult as unknown as {
    aggregateResult: string;
  };
  const authNative = polAuthorization.ownerNativeResult as unknown as {
    authorizationDecision: string;
  };

  if (
    aggNative.aggregateResult !== "ALLOW" ||
    authNative.authorizationDecision !== "Authorized"
  ) {
    return {
      ok: false,
      error: {
        code: "PRJ_PROJECTION_NOT_AUTHORIZED",
        message:
          "POL Aggregate ALLOW and POL Authorization Authorized required.",
      },
    };
  }

  const executability = outcomeFrame.executability;
  if (executability.status !== "DETERMINED" || executability.value !== true) {
    return {
      ok: false,
      error: {
        code: "PRJ_PROJECTION_NOT_AUTHORIZED",
        message: "RI Executability DETERMINED true required.",
      },
    };
  }

  // 8. Construct Native Context Envelope
  const contextEnvelope = {
    participation: sealedExecutionRequest.participation,
    intent: sealedExecutionRequest.intent,
    requestedAction: sealedExecutionRequest.requestedAction,
    boundContextBindings:
      sealedExecutionRequest.evaluationContext.boundContextBindings,
    temporalCoordinates:
      sealedExecutionRequest.executionContext.temporalCoordinates,
  };

  // 9. Evaluate Projection Root Node
  const rawMissingBindings: PrjMissingBindingV1[] = [];
  const evalRes = evaluateProjectionNode(
    specification.root,
    realityView.material,
    contextEnvelope,
    [],
    rawMissingBindings,
  );

  if (!evalRes.ok) {
    return {
      ok: false,
      error: {
        code: evalRes.code,
        message: evalRes.message,
      },
    };
  }

  const rawOutput = evalRes.value;

  // Enforce output size bound & detached output generation
  const outputCanon = safeCanonicalizeJcs(rawOutput);
  if (!outputCanon.ok) {
    return {
      ok: false,
      error: {
        code: "PRJ_MATERIALIZATION_FAILED",
        message: `Failed to canonicalize materialized output: ${outputCanon.error}`,
      },
    };
  }

  // Convert rawOutput into a completely detached fresh object graph via JCS parse
  const output: JsonValueV2 = JSON.parse(outputCanon.value);

  if (
    Buffer.byteLength(outputCanon.value, "utf8") > MAX_OUTPUT_JCS_UTF8_BYTES
  ) {
    return {
      ok: false,
      error: {
        code: "PRJ_OUTPUT_LIMIT_EXCEEDED",
        message: "Materialized projection output exceeds byte size limit.",
      },
    };
  }

  // Process missing bindings
  const missingBindings = sortAndDeduplicateMissingBindings(rawMissingBindings);
  const projectionCompleteness: "COMPLETE" | "INCOMPLETE" =
    missingBindings.some((b) => b.requirement === "REQUIRED")
      ? "INCOMPLETE"
      : "COMPLETE";

  // 10. Compute Hashes & Derivation Proof
  const contextCanon = safeCanonicalizeJcs(contextEnvelope);
  if (!contextCanon.ok) {
    return {
      ok: false,
      error: {
        code: "PRJ_MATERIALIZATION_FAILED",
        message: `Failed to canonicalize context envelope: ${contextCanon.error}`,
      },
    };
  }
  const contextHash = `sha256:${computeSha256Hex(contextCanon.value)}`;

  const policyPreimage = {
    policyUniverseRef: sealedExecutionRequest.policyUniverse.policyUniverseRef,
    aggregateBindingKey: polAggregate.determinationBindingKey,
    authorizationBindingKey: polAuthorization.determinationBindingKey,
  };
  const policyCanon = safeCanonicalizeJcs(policyPreimage);
  if (!policyCanon.ok) {
    return {
      ok: false,
      error: {
        code: "PRJ_MATERIALIZATION_FAILED",
        message: `Failed to canonicalize policy preimage: ${policyCanon.error}`,
      },
    };
  }
  const policyHash = `sha256:${computeSha256Hex(policyCanon.value)}`;

  const projectionOwnerRef: OwnerRefV2 = {
    family: "OWNER",
    ownerRef: "urn:zyppi:owner:prj:v1",
    artifactId: "PRJ-001",
  };

  const generatedAt = executionReceipt.executionTime;

  const provenancePreimage = {
    projectionOwnerRef,
    sourceZid: realityView.sourceZid,
    sourceReality: {
      viewId: realityView.viewId,
      realityDigest: realityView.realityDigest,
      provenanceRef: realityView.provenanceRef,
    },
    registrationBinding: {
      registrationId: registration.registrationId,
      registrationDigest: registration.registrationDigest,
    },
    specificationBinding: {
      specId: boundSpecification.specId,
      version: boundSpecification.version,
      specificationDigest: boundSpecification.specificationDigest,
    },
    sourceExecution: {
      requestId: sealedExecutionRequest.requestId,
      executionId: executionReceipt.executionId,
      receiptId: executionReceipt.receiptId,
      inputHash: executionReceipt.inputHash,
      deterministicHash: executionReceipt.deterministicHash,
    },
    viewType: realityView.viewType,
    viewTimestamp: realityView.viewTimestamp,
    contextHash,
    policyHash,
    generatedAt,
  };

  const provCanon = safeCanonicalizeJcs(provenancePreimage);
  if (!provCanon.ok) {
    return {
      ok: false,
      error: {
        code: "PRJ_MATERIALIZATION_FAILED",
        message: `Failed to canonicalize provenance preimage: ${provCanon.error}`,
      },
    };
  }
  const provenanceHash = `sha256:${computeSha256Hex(provCanon.value)}`;

  const derivationProof: PrjDerivationProofV1 = {
    realityDigest: realityView.realityDigest,
    registrationDigest: registration.registrationDigest,
    specificationDigest: boundSpecification.specificationDigest,
    executionInputHash: executionReceipt.inputHash,
    executionReceiptHash: executionReceipt.deterministicHash,
    contextHash,
    policyHash,
    provenanceHash,
  };

  // 11. Construct Semantic Artifact & Compute Content-Addressed projectionId
  const partialArtifact = {
    projectionOwnerRef,
    sourceZid: realityView.sourceZid,
    projectionType: registration.projectionType,
    viewType: realityView.viewType,
    viewTimestamp: realityView.viewTimestamp,
    contextHash,
    policyHash,
    generatedAt,
    registrationBinding: {
      registrationId: registration.registrationId,
      registrationDigest: registration.registrationDigest,
    },
    specificationBinding: {
      specId: boundSpecification.specId,
      version: boundSpecification.version,
      specificationDigest: boundSpecification.specificationDigest,
    },
    sourceReality: {
      viewId: realityView.viewId,
      realityDigest: realityView.realityDigest,
      provenanceRef: realityView.provenanceRef,
    },
    sourceExecution: {
      requestId: sealedExecutionRequest.requestId,
      executionId: executionReceipt.executionId,
      receiptId: executionReceipt.receiptId,
      inputHash: executionReceipt.inputHash,
      deterministicHash: executionReceipt.deterministicHash,
    },
    projectionCompleteness,
    missingBindings,
    output,
    derivationProof,
  };

  const artifactCanon = safeCanonicalizeJcs(partialArtifact);
  if (!artifactCanon.ok) {
    return {
      ok: false,
      error: {
        code: "PRJ_MATERIALIZATION_FAILED",
        message: `Failed to canonicalize projection artifact: ${artifactCanon.error}`,
      },
    };
  }

  const projectionId = `prj:projection:v1:${computeSha256Hex(artifactCanon.value)}`;

  const projection: PrjProjectionArtifactV1 = {
    projectionId,
    ...partialArtifact,
  };

  return {
    ok: true,
    projection: deepFreeze(projection),
  };
}
