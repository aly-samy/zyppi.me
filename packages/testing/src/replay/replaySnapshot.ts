import type {
  RegistryRepository,
  RetrievedRegistryState,
  RegistryResult,
} from "@zyppi/contracts";
import type { EvidenceRecord } from "@zyppi/domain";
import type { ReplayRegistrySnapshot } from "./replayTypes.js";

// Frozen mock data for our deterministic registry snapshot
export const FROZEN_REGISTRY_SNAPSHOT: ReplayRegistrySnapshot = {
  // 1. Valid normal product
  "09506000134352": {
    identity: {
      identityId: "id-widget-01",
      identityType: "product",
      canonicalReference: "09506000134352",
      referentId: "ref-widget-01",
      status: "active",
      createdAt: "2026-07-28T12:00:00Z",
      updatedAt: "2026-07-28T12:00:00Z",
    },
    relationships: [
      {
        referentId: "ref-widget-01",
        referentType: "product",
        name: "Acme Super Widget",
        parentReferentId: null,
        createdAt: "2026-07-28T12:00:00Z",
      },
    ],
    standings: [],
    authorities: [],
    capabilities: [],
    evidenceReferences: [],
    applicablePolicies: [],
  },

  // 2. Valid product with qualifiers
  "09506000134307": {
    identity: {
      identityId: "id-widget-02",
      identityType: "product",
      canonicalReference: "09506000134307",
      referentId: "ref-widget-02",
      status: "active",
      createdAt: "2026-07-28T12:00:00Z",
      updatedAt: "2026-07-28T12:00:00Z",
    },
    relationships: [
      {
        referentId: "ref-widget-02",
        referentType: "product",
        name: "Acme Hyper Widget",
        parentReferentId: null,
        createdAt: "2026-07-28T12:00:00Z",
      },
    ],
    standings: [],
    authorities: [],
    capabilities: [],
    evidenceReferences: [],
    applicablePolicies: [],
  },

  // 3. Valid product with unsupported AIs preserved
  "09506000134314": {
    identity: {
      identityId: "id-widget-03",
      identityType: "product",
      canonicalReference: "09506000134314",
      referentId: "ref-widget-03",
      status: "active",
      createdAt: "2026-07-28T12:00:00Z",
      updatedAt: "2026-07-28T12:00:00Z",
    },
    relationships: [
      {
        referentId: "ref-widget-03",
        referentType: "product",
        name: "Acme Mega Widget",
        parentReferentId: null,
        createdAt: "2026-07-28T12:00:00Z",
      },
    ],
    standings: [],
    authorities: [],
    capabilities: [],
    evidenceReferences: [],
    applicablePolicies: [],
  },

  // 4. Incomplete constitutional state
  "09506000134345": {
    identity: {
      identityId: "id-widget-04",
      identityType: "product",
      canonicalReference: "09506000134345",
      referentId: "ref-missing-04", // Pointing to a missing referent
      status: "active",
      createdAt: "2026-07-28T12:00:00Z",
      updatedAt: "2026-07-28T12:00:00Z",
    },
    relationships: [], // No matching referent
    standings: [],
    authorities: [],
    capabilities: [],
    evidenceReferences: [],
    applicablePolicies: [],
  },
};

// Deeply freeze mock data to prevent any mutations during replay execution
Object.freeze(FROZEN_REGISTRY_SNAPSHOT);
Object.values(FROZEN_REGISTRY_SNAPSHOT).forEach((state) => {
  Object.freeze(state.identity);
  state.relationships.forEach(Object.freeze);
  Object.freeze(state.relationships);
  Object.freeze(state.standings);
  Object.freeze(state.authorities);
  Object.freeze(state.capabilities);
  Object.freeze(state.evidenceReferences);
  Object.freeze(state.applicablePolicies);
  Object.freeze(state);
});

/**
 * Clean, pure in-memory implementation of RegistryRepository
 * to guarantee 100% determinism.
 */
export class FrozenRegistryRepository implements RegistryRepository {
  private readonly snapshot: ReplayRegistrySnapshot;
  private readonly simulateFailureId: string | null;

  constructor(
    snapshot: ReplayRegistrySnapshot = FROZEN_REGISTRY_SNAPSHOT,
    simulateFailureId: string | null = null,
  ) {
    this.snapshot = snapshot;
    this.simulateFailureId = simulateFailureId;
  }

  async lookup(
    identifier: string,
  ): Promise<RegistryResult<RetrievedRegistryState | null>> {
    if (this.simulateFailureId === identifier) {
      return {
        ok: false,
        error: { kind: "InfrastructureUnavailable" },
      };
    }

    const matched = this.snapshot[identifier];
    if (matched) {
      return { ok: true, value: matched };
    }
    return { ok: true, value: null };
  }

  async lookupEvidenceByIds(
    evidenceIds: readonly string[],
  ): Promise<RegistryResult<readonly EvidenceRecord[]>> {
    const results: EvidenceRecord[] = [];
    for (const id of evidenceIds) {
      for (const state of Object.values(this.snapshot)) {
        const record = state.evidenceReferences.find(
          (r) => r.evidenceId === id,
        );
        if (record) {
          results.push(record);
          break;
        }
      }
    }
    return { ok: true, value: results };
  }
}
