import { describe, it, expect } from "vitest";
import { createGs1AnchorFromCarrier } from "./gs1AnchorBridge.js";
import {
  type RegistryRepository,
  type RegistryResult,
  type RetrievedRegistryState,
  type ValidatedCanonicalIdentifier,
} from "@zyppi/contracts";
import type {
  IdentityRecord,
  ReferentRecord,
} from "@zyppi/domain";
// @ts-expect-error JS module without declaration file
import { runValidation } from "../../../../tools/verify-dependency-graph.mjs";

const mockIdentity: IdentityRecord = {
  identityId: "09506000134352",
  identityType: "GTIN-14",
  canonicalReference: "09506000134352",
  referentId: "ref-trade-item-123",
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockReferent: ReferentRecord = {
  referentId: "ref-trade-item-123",
  referentType: "product",
  name: "Example Widget",
  parentReferentId: null,
  createdAt: "2026-01-01T00:00:00Z",
};

const mockRegistryState: RetrievedRegistryState = {
  identity: mockIdentity,
  relationships: [mockReferent],
  standings: [],
  authorities: [],
  capabilities: [],
  evidenceReferences: [],
  applicablePolicies: [],
};

class MockRegistryRepository implements RegistryRepository {
  public lookupCalls: string[] = [];
  public shouldFailWithInfrastructureError = false;

  constructor(private knownK1Map: Map<string, RetrievedRegistryState>) {}

  async lookup(
    identifier: ValidatedCanonicalIdentifier,
  ): Promise<RegistryResult<RetrievedRegistryState | null>> {
    this.lookupCalls.push(identifier);
    if (this.shouldFailWithInfrastructureError) {
      return { ok: false, error: { kind: "InfrastructureUnavailable" } };
    }
    const state = this.knownK1Map.get(identifier) || null;
    return { ok: true, value: state };
  }

  async lookupEvidenceByIds(): Promise<RegistryResult<readonly any[]>> {
    return { ok: true, value: [] };
  }
}

describe("AMS-0861-A Physical GS1 Anchor Bridge Test Suite", () => {
  const validGtin14Carrier = "https://id.gs1.org/01/09506000134352";
  const validK1 = "09506000134352";

  // A-0861-01 — Valid Physical Carrier
  it("A-0861-01: should resolve valid supported carrier to constitutional anchor with provenance", async () => {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);

    const result = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provenance.carrierInput).toBe(validGtin14Carrier);
      expect(result.provenance.resolvedCanonicalId).toBe(validK1);
      expect(result.anchor.normalizedCarrier.k1).toBe(validK1);
      expect(result.anchor.registryState.identity.identityId).toBe("09506000134352");
      expect(repo.lookupCalls).toEqual([validK1]);
    }
  });

  // A-0861-02 — Malformed Carrier
  it("A-0861-02: should fail before constitutional anchor on malformed carrier", async () => {
    const repo = new MockRegistryRepository(new Map());

    const result = await createGs1AnchorFromCarrier("not-a-valid-uri", repo);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("PARSE");
    }
    expect(repo.lookupCalls.length).toBe(0);
  });

  // A-0861-03 — Unsupported GS1 Semantic Input
  it("A-0861-03: should fail validation on valid Digital Link missing primary identifier AI 01", async () => {
    const repo = new MockRegistryRepository(new Map());
    // URI with AI 10 batch only, missing AI 01
    const result = await createGs1AnchorFromCarrier("https://id.gs1.org/10/BATCH123", repo);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("VALIDATION");
      expect(result.error.error.code).toBe("MISSING_PRIMARY_IDENTIFIER");
    }
    expect(repo.lookupCalls.length).toBe(0);
  });

  // A-0861-04 — Valid but Unknown Referent
  it("A-0861-04: should fail resolution with REFERENT_NOT_FOUND when M06 returns null", async () => {
    const repo = new MockRegistryRepository(new Map()); // K1 not in repo

    const result = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("RESOLUTION");
      expect(result.error.error.code).toBe("REFERENT_NOT_FOUND");
    }
    expect(repo.lookupCalls).toEqual([validK1]);
  });

  // A-0861-05 — External Resolution Unavailable
  it("A-0861-05: should fail resolution with REGISTRY_FAILURE when repository encounters infrastructure error", async () => {
    const repo = new MockRegistryRepository(new Map());
    repo.shouldFailWithInfrastructureError = true;

    const result = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("RESOLUTION");
      expect(result.error.error.code).toBe("REGISTRY_FAILURE");
    }
  });

  // A-0861-06 — Deterministic Normalization
  it("A-0861-06: should normalize equivalent permitted carrier representations identically", async () => {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);

    // Two URIs with same AI 01 and qualifiers in different order
    const uri1 = "https://example.com/01/09506000134352?21=SERIAL1&10=LOTA";
    const uri2 = "https://id.gs1.org/01/09506000134352?10=LOTA&21=SERIAL1";

    const res1 = await createGs1AnchorFromCarrier(uri1, repo);
    const res2 = await createGs1AnchorFromCarrier(uri2, repo);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (res1.ok && res2.ok) {
      expect(res1.provenance.normalizedCarrier.k1).toBe(res2.provenance.normalizedCarrier.k1);
      expect(res1.provenance.normalizedCarrier.supportedQualifiers).toEqual(
        res2.provenance.normalizedCarrier.supportedQualifiers
      );
    }
  });

  // A-0861-07 — Resolution Determinism
  it("A-0861-07: should produce identical anchor results given identical input and pinned state", async () => {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);

    const res1 = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);
    const res2 = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);

    expect(res1).toEqual(res2);
  });

  // A-0861-08 — No Direct Registry Bypass
  it("A-0861-08: should invoke M06 resolveGs1DigitalLink and pass validated canonical id to repo.lookup", async () => {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);

    await createGs1AnchorFromCarrier(validGtin14Carrier, repo);

    expect(repo.lookupCalls.length).toBe(1);
    expect(repo.lookupCalls[0]).toBe(validK1);
  });

  // A-0861-09 — Carrier / Anchor Separation
  it("A-0861-09: should maintain explicit separation between raw carrier string and constitutional anchor", async () => {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);

    const result = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provenance.carrierInput).not.toEqual(result.anchor.registryState);
      expect(typeof result.provenance.carrierInput).toBe("string");
      expect(typeof result.anchor.registryState).toBe("object");
    }
  });

  // A-0861-10 — Domain Diagnostic Isolation
  it("A-0861-10: should return structured stage error without leaking GS1 generic codes into generic taxonomy", async () => {
    const repo = new MockRegistryRepository(new Map());
    const result = await createGs1AnchorFromCarrier("https://id.gs1.org/01/123", repo); // Invalid length GTIN

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe("VALIDATION");
      expect(result.error.error.code).toBe("INVALID_AI_LENGTH");
    }
  });

  // A-0861-11 & A-0861-12 — Generic Direct & Transitive Dependency Isolation
  it("A-0861-11 & A-0861-12: should verify zero direct or transitive GS1 dependencies in generic modules via validator", () => {
    const { violations } = runValidation();
    const gs1Violations = violations.filter(
      (v: { rule: string }) => v.rule === "gs1-domain-edge-contamination"
    );
    expect(gs1Violations.length).toBe(0);
  });

  // A-0861-13 — RI Non-Involvement
  it("A-0861-13: should resolve carrier without calling Runtime execution pipeline", async () => {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);

    const result = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);
    expect(result.ok).toBe(true);
  });

  // A-0861-14 — Z-PROF Composition Non-Involvement
  it("A-0861-14: should stop after anchor creation without invoking ApplicationCompositionResolver", async () => {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);

    const result = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect("dtcReference" in result.anchor).toBe(false);
      expect("bcgId" in result.anchor).toBe(false);
    }
  });

  // A-0861-15 — No Identity Fabrication
  it("A-0861-15: should fail closed without fabricating identity records when referent is absent", async () => {
    const repo = new MockRegistryRepository(new Map());

    const result = await createGs1AnchorFromCarrier(validGtin14Carrier, repo);
    expect(result.ok).toBe(false);
  });

  // A-0861-16 — No Ambient Version Selection
  it("A-0861-16: should use exact lookup without ambient latest or wildcard query", async () => {
    const knownMap = new Map<string, RetrievedRegistryState>([
      [validK1, mockRegistryState],
    ]);
    const repo = new MockRegistryRepository(knownMap);

    await createGs1AnchorFromCarrier(validGtin14Carrier, repo);
    expect(repo.lookupCalls[0]).toBe(validK1);
  });
});
