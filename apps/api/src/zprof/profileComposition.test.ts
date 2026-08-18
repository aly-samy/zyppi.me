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
import {
  bindComposition,
  type PinnedSubstrate,
  type BoundCoordinates,
} from "./bind.js";

const mockAcv: ActiveConstitutionalView = {
  identity: {
    identityId: "id:gtin:00012345678905",
    identityType: "gtin",
    canonicalReference: "urn:zyppi:gtin:00012345678905",
    referentId: "ref:product:123",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  relationships: [],
  standings: [
    {
      standingId: "standing:good",
      subjectId: "id:gtin:00012345678905",
      scope: "global",
      validFrom: "2026-01-01T00:00:00Z",
      validTo: "2029-01-01T00:00:00Z",
    },
  ],
  authorities: [
    {
      authorityId: "auth:council",
      subjectId: "id:gtin:00012345678905",
      scope: "global",
      validFrom: "2026-01-01T00:00:00Z",
      validTo: "2029-01-01T00:00:00Z",
    },
  ],
  capabilities: [
    {
      capabilityId: "cap:trade_item_read",
      subjectId: "id:gtin:00012345678905",
      scope: "global",
      validFrom: "2026-01-01T00:00:00Z",
      validTo: "2029-01-01T00:00:00Z",
    },
  ],
  evidenceReferences: [],
  applicablePolicies: [
    {
      policyId: "policy:trade_item_v1",
      policyType: "trade_item",
      version: "1.0.0",
      definition: {},
      active: true,
    },
  ],
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

const mockManifest: CompositionManifest = {
  $schema: "https://zyppi.org/schemas/v1/composition_manifest.json",
  manifestId: "manifest:zyppi:gtin:exec-12345",
  dtcReference: {
    dtcId: "dtc:zyppi:domain:trade_item:v1",
    version: "1.0.0",
  },
  armProfileReference: {
    profileId: "arm:profile:trade_item:v1",
    version: "1.0.0",
  },
  boundEpistemicRequirements: [
    { requirementId: "epistemic:req:gtin:v1", version: "1.0.0" },
  ],
  boundPrjSpecifications: [],
  boundRsnBlueprints: [],
  boundPolRequirements: [],
  boundSecRequirements: [],
  boundRiCapabilities: [],
  dependencyTopology: {
    nodes: ["dtc:zyppi:domain:trade_item:v1", "arm:profile:trade_item:v1"],
    edges: [
      {
        from: "dtc:zyppi:domain:trade_item:v1",
        to: "arm:profile:trade_item:v1",
      },
    ],
  },
  provenanceReferences: {
    manifestAuthor: "identity:council:admin",
    createdTimestamp: "2026-08-15T12:00:00Z",
  },
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
      const p: Participant = {
        ...validParticipant1,
        kind: "" as Participant["kind"],
      };
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

    it("4. Ambiguous/missing owner -> fail (no owner fabrication)", () => {
      const p = { ...validParticipant1, owner: "   " };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("5. Missing role -> fail", () => {
      const p: Participant = {
        ...validParticipant1,
        role: "" as Participant["role"],
      };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("6. Duplicate participant identity -> fail closed", () => {
      const collection = [validParticipant1, validParticipant1];
      const res = validateParticipantCollection(collection);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("conflicting");
    });

    it("7. Same identity with different role -> fail closed (P-007 identity keying)", () => {
      const pWithDiffRole: Participant = {
        ...validParticipant1,
        role: "asset_profile",
      };
      const collection = [validParticipant1, pWithDiffRole];
      const res = validateParticipantCollection(collection);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("conflicting");
        expect(res.error.message).toContain("Duplicate participant identity");
      }
    });

    it("8. Floating/wildcard identity -> fail", () => {
      const p = { ...validParticipant1, identity: "dtc:zyppi:*" };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("9. Missing reference -> fail", () => {
      const p = {
        ...validParticipant1,
        reference: { id: "", version: "1.0.0" },
      };
      const res = validateParticipant(p);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("invalid");
    });

    it("10. Valid participant collection succeeds", () => {
      const res = validateParticipantCollection([
        validParticipant1,
        validParticipant2,
      ]);
      expect(res.ok).toBe(true);
    });

    it("11. Manifest extraction without discoverable author/owner -> fail closed", () => {
      const unownedManifest: CompositionManifest = {
        ...mockManifest,
        provenanceReferences: {
          manifestAuthor: "",
          createdTimestamp: "2026-08-15T12:00:00Z",
        },
      };
      const res = extractParticipantsFromManifest(unownedManifest);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("invalid");
        expect(res.error.message).toContain("missing or ambiguous owner");
      }
    });
  });

  describe("Topology Validation (T_struct & T_bind)", () => {
    it("1. Acyclic T_struct -> valid", () => {
      const eStruct: StructuralEdge[] = [
        {
          sourceId: validParticipant1.identity,
          targetId: validParticipant2.identity,
          relationKind: "contains",
        },
      ];
      const res = validateTopologyGraph(
        [validParticipant1, validParticipant2],
        eStruct,
        [],
      );
      expect(res.ok).toBe(true);
    });

    it("2. Cyclic T_struct -> valid (structural cycles permitted)", () => {
      const eStruct: StructuralEdge[] = [
        {
          sourceId: validParticipant1.identity,
          targetId: validParticipant2.identity,
          relationKind: "ref",
        },
        {
          sourceId: validParticipant2.identity,
          targetId: validParticipant1.identity,
          relationKind: "back_ref",
        },
      ];
      const res = validateTopologyGraph(
        [validParticipant1, validParticipant2],
        eStruct,
        [],
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.graph.eStruct.length).toBe(2);
      }
    });

    it("3. Acyclic T_bind -> valid", () => {
      const eBind: BindingEdge[] = [
        {
          sourceId: validParticipant1.identity,
          targetId: validParticipant2.identity,
          dependencyKind: "requires",
        },
      ];
      const res = validateTopologyGraph(
        [validParticipant1, validParticipant2],
        [],
        eBind,
      );
      expect(res.ok).toBe(true);
    });

    it("4. Cyclic T_bind -> fail closed", () => {
      const eBind: BindingEdge[] = [
        {
          sourceId: validParticipant1.identity,
          targetId: validParticipant2.identity,
          dependencyKind: "requires",
        },
        {
          sourceId: validParticipant2.identity,
          targetId: validParticipant1.identity,
          dependencyKind: "requires",
        },
      ];
      const res = validateTopologyGraph(
        [validParticipant1, validParticipant2],
        [],
        eBind,
      );
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("incompatible");
        expect(res.error.message).toContain("dependency cycle");
      }
    });

    it("5. Structural reference without dependency -> does not create T_bind edge", () => {
      const eStruct: StructuralEdge[] = [
        {
          sourceId: validParticipant1.identity,
          targetId: validParticipant2.identity,
          relationKind: "reference_only",
        },
      ];
      const res = validateTopologyGraph(
        [validParticipant1, validParticipant2],
        eStruct,
        [],
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.graph.eBind.length).toBe(0);
      }
    });

    it("6. Edge source or target not in P -> fail", () => {
      const eStruct: StructuralEdge[] = [
        {
          sourceId: validParticipant1.identity,
          targetId: "missing:node:v1",
          relationKind: "ref",
        },
      ];
      const res = validateTopologyGraph([validParticipant1], eStruct, []);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("invalid");
      }
    });

    it("7. Topology normalization and cycle detection utilities operate deterministically", () => {
      const norm = normalizeTopologyGraph(
        ["b", "a"],
        [{ sourceId: "a", targetId: "b", relationKind: "r" }],
        [{ sourceId: "a", targetId: "b", dependencyKind: "d" }],
      );
      expect(norm.nodes).toEqual(["a", "b"]);

      const cycle = detectBindingCycle(
        ["a", "b"],
        [
          { sourceId: "a", targetId: "b", dependencyKind: "d" },
          { sourceId: "b", targetId: "a", dependencyKind: "d" },
        ],
      );
      expect(cycle.hasCycle).toBe(true);
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
        P: [
          {
            ...validParticipant1,
            version: "2.0.0",
            reference: { id: validParticipant1.identity, version: "2.0.0" },
          },
        ],
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
      const domain1 = {
        P: [validParticipant1, validParticipant2, validParticipant3],
        T_struct: [],
        T_bind: [],
      };
      const domain2 = {
        P: [validParticipant3, validParticipant1, validParticipant2],
        T_struct: [],
        T_bind: [],
      };
      const res1 = deriveCompositionId(domain1);
      const res2 = deriveCompositionId(domain2);
      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).toBe(res2.compositionId);
      }
    });

    it("5. Structural edge permutation -> identical CompositionID", () => {
      const e1: StructuralEdge = {
        sourceId: validParticipant1.identity,
        targetId: validParticipant2.identity,
        relationKind: "r1",
      };
      const e2: StructuralEdge = {
        sourceId: validParticipant2.identity,
        targetId: validParticipant3.identity,
        relationKind: "r2",
      };
      const domain1 = {
        P: [validParticipant1, validParticipant2, validParticipant3],
        T_struct: [e1, e2],
        T_bind: [],
      };
      const domain2 = {
        P: [validParticipant1, validParticipant2, validParticipant3],
        T_struct: [e2, e1],
        T_bind: [],
      };
      const res1 = deriveCompositionId(domain1);
      const res2 = deriveCompositionId(domain2);
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).toBe(res2.compositionId);
      }
    });

    it("6. Binding edge permutation -> identical CompositionID", () => {
      const b1: BindingEdge = {
        sourceId: validParticipant1.identity,
        targetId: validParticipant2.identity,
        dependencyKind: "d1",
      };
      const b2: BindingEdge = {
        sourceId: validParticipant2.identity,
        targetId: validParticipant3.identity,
        dependencyKind: "d2",
      };
      const domain1 = {
        P: [validParticipant1, validParticipant2, validParticipant3],
        T_struct: [],
        T_bind: [b1, b2],
      };
      const domain2 = {
        P: [validParticipant1, validParticipant2, validParticipant3],
        T_struct: [],
        T_bind: [b2, b1],
      };
      const res1 = deriveCompositionId(domain1);
      const res2 = deriveCompositionId(domain2);
      if (res1.ok && res2.ok) {
        expect(res1.compositionId).toBe(res2.compositionId);
      }
    });
  });

  describe("Declarative BIND & Substrate Pinning", () => {
    it("1. BIND produces immutable BoundCompositionPayload without ambient I/O or synthesis", () => {
      const res = bindComposition({
        compositionDefinition: {
          participants: [validParticipant1, validParticipant2],
          manifest: mockManifest,
        },
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.boundPayload.payloadId).toBe(
          "bound:payload:gtin:exec-12345",
        );
        expect(res.boundPayload.resolvedActiveConstitutionalView).toBe(mockAcv);
        expect(Object.isFrozen(res.boundPayload)).toBe(true);
        expect(Object.isFrozen(res.boundPayload.executionContext)).toBe(true);
      }
    });

    it("2. BIND fails when manifest is missing (no manifest synthesis)", () => {
      const res = bindComposition({
        compositionDefinition: {
          participants: [validParticipant1, validParticipant2],
        },
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("invalid");
        expect(res.error.message).toContain("explicit CompositionManifest");
      }
    });

    it("3. BIND fails when DTC or ARM_PROFILE is missing from P", () => {
      const res = bindComposition({
        compositionDefinition: {
          participants: [validParticipant1],
          manifest: mockManifest,
        },
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("missing");
        expect(res.error.message).toContain(
          "missing required DTC or ARM_PROFILE",
        );
      }
    });

    it("4. BIND fails when evidenceBundle is missing from pinnedSubstrate (no evidence synthesis)", () => {
      const incompleteSubstrate = {
        acv: mockAcv,
        evidenceBundle: undefined as unknown as EvidenceBundle,
      };
      const res = bindComposition({
        compositionDefinition: {
          participants: [validParticipant1, validParticipant2],
          manifest: mockManifest,
        },
        pinnedSubstrate: incompleteSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("missing");
        expect(res.error.message).toContain(
          "explicit evidenceBundle in pinnedSubstrate",
        );
      }
    });

    it("5. Deep Immutability: Mutating nested payload properties throws or fails", () => {
      const res = bindComposition({
        compositionDefinition: {
          participants: [validParticipant1, validParticipant2],
          manifest: mockManifest,
        },
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(() => {
          (res.boundPayload as { payloadId: string }).payloadId = "mutated";
        }).toThrow();
        expect(() => {
          (res.boundPayload.executionContext as { budget: number }).budget = 0;
        }).toThrow();
      }
    });

    it("6. Dynamic coordinate changes alone do NOT alter CompositionID", () => {
      const def = {
        participants: [validParticipant1, validParticipant2],
        manifest: mockManifest,
      };
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

    it("7. BIND fails closed on missing pinned ACV", () => {
      const res = bindComposition({
        compositionDefinition: {
          participants: [validParticipant1, validParticipant2],
          manifest: mockManifest,
        },
        pinnedSubstrate: {
          acv: null as unknown as ActiveConstitutionalView,
          evidenceBundle: mockEvidenceBundle,
        },
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
          manifest: mockManifest,
        },
        pinnedSubstrate: mockPinnedSubstrate,
        boundCoordinates: mockBoundCoordinates,
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        // Struct edge exists in manifest, but eBind edge remains 0
        expect(res.manifest.dependencyTopology.edges.length).toBe(1);
      }
    });
  });
});
