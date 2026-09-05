import type { OwnerDeterminationBindingV2 } from "@zyppi/domain";
import type { ExecutionEnvelopeCompatibilityV2Failure } from "./executionEnvelopeCompatibility.js";
import {
  prepareProductionExecutionV2,
  type ProductionExecutionFrameV2,
  type ProductionExecutionIsolationV2Failure,
} from "./productionExecutionBoundary.js";

export interface OwnerDeterminationIntegrationFrameV2 {
  readonly kind: "OWNER_DETERMINATION_INTEGRATION_V2";
  readonly productionFrame: ProductionExecutionFrameV2;
  readonly dependencyLayers: readonly (readonly OwnerDeterminationBindingV2[])[];
}

export type OwnerDeterminationIntegrationV2Success = {
  readonly ok: true;
  readonly frame: OwnerDeterminationIntegrationFrameV2;
};

export type OwnerDeterminationIntegrationV2ErrorCode =
  | "OWNER_DEPENDENCY_REFERENCE_UNRESOLVED"
  | "OWNER_DEPENDENCY_SCHEDULING_FAILED";

export type OwnerDeterminationIntegrationV2Failure = {
  readonly ok: false;
  readonly stage: "OWNER_EVALUATION_INTEGRATION";
  readonly error: {
    readonly code: OwnerDeterminationIntegrationV2ErrorCode;
    readonly message: string;
  };
};

export type OwnerDeterminationIntegrationV2Result =
  | OwnerDeterminationIntegrationV2Success
  | ExecutionEnvelopeCompatibilityV2Failure
  | ProductionExecutionIsolationV2Failure
  | OwnerDeterminationIntegrationV2Failure;

/**
 * Recursively freezes an object graph in-place.
 */
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  const keys = Reflect.ownKeys(obj as object);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = Reflect.get(obj as object, key);
    if (val !== null && typeof val === "object") {
      deepFreeze(val);
    }
  }
  return obj;
}

/**
 * Native V2 Runtime capability that integrates already-bound constitutional owner
 * determinations into RI without acquiring their sovereignty.
 *
 * Consumes the request through prepareProductionExecutionV2, preserves exact owner
 * determinations and provenance from the immutable ProductionExecutionFrameV2,
 * resolves explicit dependency declarations into deterministic readiness layers,
 * and returns an immutable OwnerDeterminationIntegrationFrameV2.
 */
export function integrateOwnerDeterminationsV2(
  input: unknown,
): OwnerDeterminationIntegrationV2Result {
  // Step 1 — Predecessor delegation
  const prepResult = prepareProductionExecutionV2(input);
  if (!prepResult.ok) {
    return prepResult;
  }

  const productionFrame = prepResult.frame;
  const bindings =
    productionFrame.executionRequest.evaluationContext
      .ownerDeterminationBindings;

  // Step 2 — Empty determination set handling
  if (bindings.length === 0) {
    const emptyFrame: OwnerDeterminationIntegrationFrameV2 = deepFreeze({
      kind: "OWNER_DETERMINATION_INTEGRATION_V2",
      productionFrame,
      dependencyLayers: deepFreeze([]),
    });

    return deepFreeze({
      ok: true,
      frame: emptyFrame,
    });
  }

  // Step 3 — Build binding lookup map and dependency graph
  const bindingMap = new Map<string, OwnerDeterminationBindingV2>();
  for (let i = 0; i < bindings.length; i++) {
    const b = bindings[i];
    bindingMap.set(b.determinationBindingKey, b);
  }

  const inDegree = new Map<string, number>();
  const dependentsMap = new Map<string, string[]>();
  for (let i = 0; i < bindings.length; i++) {
    dependentsMap.set(bindings[i].determinationBindingKey, []);
  }

  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    const key = binding.determinationBindingKey;
    const decl = binding.determinationDependencyDeclaration;

    let deps: readonly string[];
    if (decl.kind === "AUTHORITATIVELY_NONE") {
      deps = [];
    } else {
      deps = decl.dependencyRefs;
    }

    inDegree.set(key, deps.length);

    for (let j = 0; j < deps.length; j++) {
      const depRef = deps[j];
      if (!bindingMap.has(depRef)) {
        return {
          ok: false,
          stage: "OWNER_EVALUATION_INTEGRATION",
          error: {
            code: "OWNER_DEPENDENCY_REFERENCE_UNRESOLVED",
            message: `Explicit dependencyRef '${depRef}' declared by '${key}' could not be resolved in ownerDeterminationBindings`,
          },
        };
      }
      dependentsMap.get(depRef)!.push(key);
    }
  }

  // Step 4 — Deterministic Kahn-style readiness layer resolution
  const layers: (readonly OwnerDeterminationBindingV2[])[] = [];
  let processedCount = 0;

  let currentReadyKeys: string[] = [];
  for (const [key, deg] of inDegree.entries()) {
    if (deg === 0) {
      currentReadyKeys.push(key);
    }
  }

  while (currentReadyKeys.length > 0) {
    // Sort ready keys deterministically using non-locale UTF-16 code-unit comparison
    currentReadyKeys.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    const currentLayerBindings: OwnerDeterminationBindingV2[] = [];
    for (let i = 0; i < currentReadyKeys.length; i++) {
      currentLayerBindings.push(bindingMap.get(currentReadyKeys[i])!);
    }

    layers.push(deepFreeze(currentLayerBindings));
    processedCount += currentReadyKeys.length;

    const nextReadyKeys: string[] = [];
    for (let i = 0; i < currentReadyKeys.length; i++) {
      const key = currentReadyKeys[i];
      const dependents = dependentsMap.get(key) ?? [];
      for (let j = 0; j < dependents.length; j++) {
        const depKey = dependents[j];
        const newDeg = inDegree.get(depKey)! - 1;
        inDegree.set(depKey, newDeg);
        if (newDeg === 0) {
          nextReadyKeys.push(depKey);
        }
      }
    }
    currentReadyKeys = nextReadyKeys;
  }

  if (processedCount !== bindings.length) {
    return {
      ok: false,
      stage: "OWNER_EVALUATION_INTEGRATION",
      error: {
        code: "OWNER_DEPENDENCY_SCHEDULING_FAILED",
        message: `Owner determination dependency scheduling incomplete: processed ${processedCount} of ${bindings.length} bindings`,
      },
    };
  }

  // Step 5 — Deep freeze integration frame and return immutable result
  const frame: OwnerDeterminationIntegrationFrameV2 = deepFreeze({
    kind: "OWNER_DETERMINATION_INTEGRATION_V2",
    productionFrame,
    dependencyLayers: deepFreeze(layers),
  });

  return deepFreeze({
    ok: true,
    frame,
  });
}
