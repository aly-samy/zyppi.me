import { describe, it, expect } from "vitest";
import type { ActiveConstitutionalView, EvidenceBundle } from "@zyppi/domain";
import type { CompositionManifest } from "./types.js";
import {
  validateParticipant,
  validateParticipantCollection,
  extractParticipantsFromManifest,
  type Participant,
} from "./participant.js";
import {
  normalizeTopologyGraph,
  detectBindingCycle,
  validateTopologyGraph,
  type StructuralEdge,
  type BindingEdge,
} from "./topology.js";
import { deriveCompositionId } from "./compositionId.js";
import { bindComposition, type PinnedSubstrate, type BoundCoordinates } from "./bind.js";

const mockAcv: ActiveConstitutionalView = {
  identity: {
    canonicalIdentifier: "urn:zyppi:gtin:00012345678905",
    domainSlug: "trade_item",
    primaryIdentifier: "00012345678905",
  },
  relationships: [],
  standings: [
    {
      standingId: "standing:good",
      status: "GOOD_STANDING",
      validFrom: "2026-01-01T00:00:00Z",
    },
  ],
  authorities: [
    {
      authorityId: "auth:council",
      jurisdiction: "GLOBAL",
    },
  ],
  capabilities: [
    {
      capabilityId: "cap:trade_item_read",
      version: "1.0.0",
    },
  ],
  evidenceReferences: [],
  applicablePolicies: ["policy:trade_item_v1"],
};

const mockEvidenceBundle: EvidenceBundle = {
  schemaVersion: "1.0",
  evidenceRecords: [],
};

const mockPinnedSubstrate: PinnedSubstrate = {
  acv: mockAcv,
  evidenceBundle: mockEvidenceBundle,
  evidencePayloads: new Map(),
};

const mockBoundCoordinates: BoundCoordinates = {
  executionId: "exec-12345",
  constitutionalTimestamp: "2026-08-15T12:00:00Z",
  budget: 100,
  entropy: "0xabc123",
  versions: ["1.0.0"],
  tenantId: "tenant-alpha",
  sessionId: "session-999",
};

const validParticipant1: Participant = {
  identity: "dtc:zyppi:domain:trade_item:v1",
  kind: "DTC",
  version: "1.0.0",
  owner: "identity:council:admin",
  role: "domain_template",
  reference: { id: "dtc:zyppi:domain:trade_item:v1", version: "1.0.0" },
};

const validParticipant2: Participant = {
  identity: "arm:profile:trade_item:v1",
  kind: "ARM_PROFILE",
  version: "1.0.0",
  owner: "identity:council:admin",
  role: "asset_profile",
  reference: { id: "arm:profile:trade_item:v1", version: "1.0.0" },
};

const validParticipant3: Participant = {
  identity: "epistemic:req:gtin:v1",
  kind: "EPISTEMIC_REQUIREMENT",
  version: "1.0.0",
  owner: "identity:council:admin",
  role: "epistemic_requirement",
  reference: { id: "epistemic:req:gtin:v1", version: "1.0.0" },
};

describe("AMS-0858 — Profile Composition Algebra Test Suite", () => {
  describe("Participant Validation (P-001 through P-010)", () => {
    it("1. Missing identity -> fail", () => {
      const p = { ...validParticipant1, identity: "" };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("2. Missing kind -> fail", () => {
      const p = { ...validParticipant1, kind: "" as any };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("3. Missing version -> fail", () => {
      const p = { ...validParticipant1, version: "" };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("4. Ambiguous owner -> fail", () => {
      const p = { ...validParticipant1, owner: "   " };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("5. Missing role -> fail", () => {
      const p = { ...validParticipant1, role: "" as any };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("6. Duplicate participant identity with same role -> fail", () => {
      const collection = [validParticipant1, validParticipant1];
      const res = validateParticipantCollection(collection);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("conflicting");
    });

    it("7. Floating/wildcard identity -> fail", () => {
      const p = { ...validParticipant1, identity: "dtc:zyppi:*" };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("8. Missing reference -> fail", () => {
      const p = { ...validParticipant1, reference: { id: "", version: "1.0.0" } };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("9. Valid participant collection succeeds", () => {
      const res = validateParticipantCollection([validParticipant1, validParticipant2]);
      expect(res.ok).toBe(true);
    });
  });

  describe("Topology Validation (T_struct & T_bind)", () => {
    it("1. Acyclic T_struct -> valid", () => {
      const eStruct: StructuralEdge[] = [
        { sourceId: validParticipant1.identity, targetId: validParticipant2.identity, relationKind: "contains" },
      ];
      const res = validateTopologyGraph([validParticipant1, validParticipant2], eStruct, []);
      expect(res.ok).toBe(true);
    });

    it("2. Cyclic T_struct -> valid (structural cycles permitted)", () => {
      const eStruct: StructuralEdge[] = [
        { sourceId: validParticipant1.identity, targetId: validParticipant2.identity, relationKind: "ref" },
        { sourceId: validParticipant2.identity, targetId: validParticipant1.identity, relationKind: "back_ref" },
      ];
      const res = validateTopologyGraph([validParticipant1, validParticipant2], eStruct, []);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.graph.eStruct.length).toBe(2);
      }
    });

    it("3. Acyclic T_bind -> valid", () => {
      const eBind: BindingEdge[] = [
        { sourceId: validParticipant1.identity, targetId: validParticipant2.identity, dependencyKind: "requires" },
      ];
      const res = validateTopologyGraph([validParticipant1, validParticipant2], [], eBind);
      expect(res.ok).toBe(true);
    });

    it("4. Cyclic T_bind -> fail closed", () => {
      const eBind: BindingEdge[] = [
        { sourceId: validParticipant1.identity, targetId: validParticipant2.identity, dependencyKind: "requires" },
        { sourceId: validParticipant2.identity, targetId: validParticipant1.identity, dependencyKind: "requires" },
      ];
      const res = validateTopologyGraph([validParticipant1, validParticipant2], [], eBind);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("incompatible");
        expect(res.error.message).toContain("dependency cycle");
      }
    });

    it("5. Structural reference without dependency -> does not create T_bind edge", () => {
      const eStruct: StructuralEdge[] = [
        { sourceId: validParticipant1.identity, targetId: validParticipant2.identity, relationKind: "reference_only" },
      ];
      const res = validateTopologyGraph([validParticipant1, validParticipant2], eStruct, []);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.graph.eBind.length).toBe(0);
      }
    });

    it("6. Edge source or target not in P -> fail", () => {
      const eStruct: StructuralEdge[] = [
        { sourceId: validParticipant1.identity, targetId: "missing:node:v1", relationKind: "ref" },
      ];
      const res = validateTopologyGraph([validParticipant1], eStruct, []);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("invalid");
      }
    });
  });

  describe("Composition Identity & Canonicalization", () => {
    it("1. Same Composition -> same CompositionID", () => {
      const domain = {
        P: [validParticipant1, validParticipant2],
        T_struct: [],
        T_bind: [],
      };
      const res1 = deriveCompositionId(domain);
      const res2 = deriveCompositionId(domain);
      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).toBe(res2.compositionId);
      }
    });

    it("2. Different participant identity -> different CompositionID", () => {
      const domain1 = { P: [validParticipant1], T_struct: [], T_bind: [] };
      const domain2 = { P: [validParticipant2], T_struct: [], T_bind: [] };
      const res1 = deriveCompositionId(domain1);
      const res2 = deriveCompositionId(domain2);
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).not.toBe(res2.compositionId);
      }
    });

    it("3. Different participant version -> different CompositionID", () => {
      const domain1 = { P: [validParticipant1], T_struct: [], T_bind: [] };
      const domain2 = {
        P: [{ ...validParticipant1, version: "2.0.0", reference: { id: validParticipant1.identity, version: "2.0.0" } }],
        T_struct: [],
        T_bind: [],
      };
      const res1 = deriveCompositionId(domain1);
      const res2 = deriveCompositionId(domain2);
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).not.toBe(res2.compositionId);
      }
    });

    it("4. Participant permutation -> identical CompositionID", () => {
      const domain1 = { P: [validParticipant1, validParticipant2, validParticipant3], T_struct: [], T_bind: [] };
      const domain2 = { P: [validParticipant3, validParticipant1, validParticipant2], T_struct: [], T_bind: [] };
      const res1 = deriveCompositionId(domain1);
      const res2 = deriveCompositionId(domain2);
      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).toBe(res2.compositionId);
      }
    });

    it("5. Structural edge permutation -> identical CompositionID", () => {
      const e1: StructuralEdge = { sourceId: validParticipant1.identity, targetId: validParticipant2.identity, relationKind: "r1" };
      const e2: StructuralEdge = { sourceId: validParticipant2.identity, targetId: validParticipant3.identity, relationKind: "r2" };
      const domain1 = { P: [validParticipant1, validParticipant2, validParticipant3], T_struct: [e1, e2], T_bind: [] };
      const domain2 = { P: [validParticipant1, validParticipant2, validParticipant3], T_struct: [e2, e1], T_bind: [] };
      const res1 = deriveCompositionId(domain1);
      const res2 = deriveCompositionId(domain2);
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).toBe(res2.compositionId);
      }
    });
  });

  describe("Declarative BIND & Substrate Pinning", () => {
    it("1. BIND produces immutable BoundCompositionPayload without ambient I/O", () => {
      const res = bindComposition({
        compositionDefinition: {
          participants: [validParticipant1, validParticipant2],
        },
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.boundPayload.payloadId).toBe("bound:payload:trade_item:exec-12345");
        expect(res.boundPayload.resolvedActiveConstitutionalView).toBe(mockAcv);
        expect(Object.isFrozen(res.boundPayload)).toBe(true);
      }
    });

    it("2. Dynamic coordinate changes alone do NOT alter CompositionID", () => {
      const def = { participants: [validParticipant1, validParticipant2] };
      const res1 = bindComposition({
        compositionDefinition: def,
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      const res2 = bindComposition({
        compositionDefinition: def,
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: {
          ...mockBoundCoordinates,
          executionId: "exec-99999",
          constitutionalTimestamp: "2029-12-31T23:59:59Z",
          tenantId: "tenant-beta",
        },
      });
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).toBe(res2.compositionId);
      }
    });

    it("3. BIND fails closed on missing pinned ACV", () => {
      const res = bindComposition({
        compositionDefinition: { participants: [validParticipant1] },
        pinnedSubstrate: { acv: null as any },
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("invalid");
      }
    });
  });

  describe("Profile Isolation Invariants", () => {
    it("1. Co-membership in P does NOT automatically create T_bind edge", () => {
      const res = bindComposition({
        compositionDefinition: {
          participants: [validParticipant1, validParticipant2],
        },
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.manifest.dependencyTopology.edges.length).toBe(0);
      }
    });
  });
});
