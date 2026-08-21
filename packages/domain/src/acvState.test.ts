import { describe, expect, it } from "vitest";
import {
  deriveActiveConstitutionalViewStateDigest,
  projectActiveConstitutionalViewState,
  type ActiveConstitutionalView,
  type AuthorityRecord,
  type CapabilityRecord,
  type IdentityRecord,
  type PolicyRecord,
  type ReferentRecord,
  type StandingRecord,
} from "./index.js";
import { cleanForJcs, computeSha256 } from "./receiptHash.js";
import { canonicalizeJcs } from "./seed-helpers.js";

const mockIdentity: IdentityRecord = {
  identityId: "id-001",
  identityType: "ORGANIZATION",
  canonicalReference: "urn:zyppi:identity:001",
  referentId: "ref-001",
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockReferents: readonly ReferentRecord[] = [
  {
    referentId: "ref-b",
    referentType: "brand",
    name: "Brand B",
    parentReferentId: null,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    referentId: "ref-a",
    referentType: "product",
    name: "Product A",
    parentReferentId: null,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const mockStandings: readonly StandingRecord[] = [
  {
    standingId: "st-2",
    subjectId: "id-001",
    scope: "scope-2",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2027-01-01T00:00:00Z",
  },
  {
    standingId: "st-1",
    subjectId: "id-001",
    scope: "scope-1",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2027-01-01T00:00:00Z",
  },
];

const mockAuthorities: readonly AuthorityRecord[] = [
  {
    authorityId: "auth-2",
    subjectId: "id-001",
    scope: "scope-2",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2027-01-01T00:00:00Z",
  },
  {
    authorityId: "auth-1",
    subjectId: "id-001",
    scope: "scope-1",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2027-01-01T00:00:00Z",
  },
];

const mockCapabilities: readonly CapabilityRecord[] = [
  {
    capabilityId: "cap-2",
    subjectId: "id-001",
    scope: "scope-2",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2027-01-01T00:00:00Z",
  },
  {
    capabilityId: "cap-1",
    subjectId: "id-001",
    scope: "scope-1",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2027-01-01T00:00:00Z",
  },
];

const mockPolicies: readonly PolicyRecord[] = [
  {
    policyId: "pol-b",
    policyType: "POLICY",
    version: "1.0.0",
    definition: { rules: ["rule-2", "rule-1"] },
    active: true,
  },
  {
    policyId: "pol-a",
    policyType: "POLICY",
    version: "1.0.0",
    definition: { rules: ["rule-1", "rule-2"] },
    active: true,
  },
];

const mockACV: ActiveConstitutionalView = {
  identity: mockIdentity,
  relationships: mockReferents,
  standings: mockStandings,
  authorities: mockAuthorities,
  capabilities: mockCapabilities,
  evidenceReferences: [
    {
      evidenceId: "ev-001",
      identityId: "id-001",
      evidenceType: "DOCUMENT",
      hash: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
      storageRef: "s3://bucket/ev-001",
      retrievedAt: "2026-01-01T00:00:00Z",
    },
  ],
  applicablePolicies: mockPolicies,
};

describe("ACV State Reference Derivation (§15 Mandate Tests ACV-REF-T01..T16)", () => {
  it("ACV-REF-T01 — Repeatability", () => {
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(mockACV);
    expect(d1).toBe(d2);
  });

  it("ACV-REF-T02 — Collection Permutation Invariance", () => {
    const permutedACV: ActiveConstitutionalView = {
      ...mockACV,
      relationships: [...mockReferents].reverse(),
      standings: [...mockStandings].reverse(),
      authorities: [...mockAuthorities].reverse(),
      capabilities: [...mockCapabilities].reverse(),
      applicablePolicies: [...mockPolicies].reverse(),
    };

    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(permutedACV);
    expect(d1).toBe(d2);
  });

  it("ACV-REF-T03 — Identity Mutation Sensitivity", () => {
    const mutatedACV: ActiveConstitutionalView = {
      ...mockACV,
      identity: {
        ...mockIdentity,
        status: "decommissioned",
      },
    };
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(mutatedACV);
    expect(d1).not.toBe(d2);
  });

  it("ACV-REF-T04 — Relationship Mutation Sensitivity", () => {
    const mutatedACV: ActiveConstitutionalView = {
      ...mockACV,
      relationships: [
        {
          ...mockReferents[0],
          name: "Brand B Mutated",
        },
      ],
    };
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(mutatedACV);
    expect(d1).not.toBe(d2);
  });

  it("ACV-REF-T05 — Standing Mutation Sensitivity", () => {
    const mutatedACV: ActiveConstitutionalView = {
      ...mockACV,
      standings: [
        {
          ...mockStandings[0],
          scope: "mutated-scope",
        },
      ],
    };
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(mutatedACV);
    expect(d1).not.toBe(d2);
  });

  it("ACV-REF-T06 — Authority Mutation Sensitivity", () => {
    const mutatedACV: ActiveConstitutionalView = {
      ...mockACV,
      authorities: [
        {
          ...mockAuthorities[0],
          scope: "mutated-scope",
        },
      ],
    };
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(mutatedACV);
    expect(d1).not.toBe(d2);
  });

  it("ACV-REF-T07 — Capability Mutation Sensitivity", () => {
    const mutatedACV: ActiveConstitutionalView = {
      ...mockACV,
      capabilities: [
        {
          ...mockCapabilities[0],
          scope: "mutated-scope",
        },
      ],
    };
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(mutatedACV);
    expect(d1).not.toBe(d2);
  });

  it("ACV-REF-T08 — Applicable Policy Mutation Sensitivity", () => {
    const mutatedACV: ActiveConstitutionalView = {
      ...mockACV,
      applicablePolicies: [
        {
          ...mockPolicies[0],
          definition: { rules: ["rule-2", "rule-1-mutated"] },
        },
      ],
    };
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(mutatedACV);
    expect(d1).not.toBe(d2);
  });

  it("ACV-REF-T09 — Evidence Independence", () => {
    const mutatedACV: ActiveConstitutionalView = {
      ...mockACV,
      evidenceReferences: [
        {
          evidenceId: "ev-999-different",
          identityId: "id-001",
          evidenceType: "OTHER",
          hash: "sha256:9999999999999999999999999999999999999999999999999999999999999999",
          storageRef: "s3://bucket/ev-999",
          retrievedAt: "2026-02-02T00:00:00Z",
        },
      ],
    };
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(mutatedACV);
    expect(d1).toBe(d2);
  });

  it("ACV-REF-T10 — Execution Independence", () => {
    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const executionMetadata = { requestId: "req-123", executionId: "exec-456" };
    const d2 = deriveActiveConstitutionalViewStateDigest(mockACV);
    expect(d1).toBe(d2);
    expect(executionMetadata).toBeDefined();
  });

  it("ACV-REF-T11 — Non-Mutation", () => {
    const acvCopy = JSON.parse(JSON.stringify(mockACV));
    deriveActiveConstitutionalViewStateDigest(mockACV);
    expect(mockACV).toEqual(acvCopy);
  });

  it("ACV-REF-T12 — Digest Grammar", () => {
    const digest = deriveActiveConstitutionalViewStateDigest(mockACV);
    expect(digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("ACV-REF-T13 — Empty Collections", () => {
    const minimalACV: ActiveConstitutionalView = {
      identity: mockIdentity,
      relationships: [],
      standings: [],
      authorities: [],
      capabilities: [],
      evidenceReferences: [],
      applicablePolicies: [],
    };
    const digest = deriveActiveConstitutionalViewStateDigest(minimalACV);
    expect(digest).toMatch(/^sha256:[0-9a-f]{64}$/);

    const proj = projectActiveConstitutionalViewState(minimalACV);
    expect(proj.relationships).toEqual([]);
    expect(proj.standings).toEqual([]);
    expect(proj.authorities).toEqual([]);
    expect(proj.capabilities).toEqual([]);
    expect(proj.applicablePolicies).toEqual([]);
  });

  it("ACV-REF-T14 — No Caller Substitution", () => {
    const digest = deriveActiveConstitutionalViewStateDigest(mockACV);
    expect(typeof digest).toBe("string");
    expect(deriveActiveConstitutionalViewStateDigest.length).toBe(1);
  });

  it("ACV-REF-T15 — Domain Separator Sensitivity", () => {
    const digestWithPrefix = deriveActiveConstitutionalViewStateDigest(mockACV);
    const proj = projectActiveConstitutionalViewState(mockACV);
    const nakedCanonical = canonicalizeJcs(cleanForJcs(proj));
    const nakedHash = computeSha256(nakedCanonical);

    expect(digestWithPrefix).not.toBe(nakedHash);
  });

  it("ACV-REF-T16 — Future Field Exclusion", () => {
    const acvWithFutureField = {
      ...mockACV,
      futureUnrecognizedConstitutionalField: { some: "future_data" },
    } as unknown as ActiveConstitutionalView;

    const d1 = deriveActiveConstitutionalViewStateDigest(mockACV);
    const d2 = deriveActiveConstitutionalViewStateDigest(acvWithFutureField);
    expect(d1).toBe(d2);
  });

  describe("CORR-ACV-STATE-REF-01 Negative Malformed-ACV Tests (No Silent Repair)", () => {
    it("should throw TypeError when ACV is null or non-object", () => {
      expect(() =>
        projectActiveConstitutionalViewState(
          null as unknown as ActiveConstitutionalView,
        ),
      ).toThrow(TypeError);
      expect(() =>
        deriveActiveConstitutionalViewStateDigest(
          null as unknown as ActiveConstitutionalView,
        ),
      ).toThrow(TypeError);
    });

    it("should throw TypeError when identity field is missing", () => {
      const malformedACV = {
        ...mockACV,
        identity: undefined,
      } as unknown as ActiveConstitutionalView;
      expect(() => projectActiveConstitutionalViewState(malformedACV)).toThrow(
        "ActiveConstitutionalView identity field is required.",
      );
    });

    it("should throw TypeError when relationships collection is missing or not an array", () => {
      const malformedACV = {
        ...mockACV,
        relationships: undefined,
      } as unknown as ActiveConstitutionalView;
      expect(() => projectActiveConstitutionalViewState(malformedACV)).toThrow(
        "ActiveConstitutionalView relationships must be an array.",
      );
    });

    it("should throw TypeError when standings collection is missing or not an array", () => {
      const malformedACV = {
        ...mockACV,
        standings: undefined,
      } as unknown as ActiveConstitutionalView;
      expect(() => projectActiveConstitutionalViewState(malformedACV)).toThrow(
        "ActiveConstitutionalView standings must be an array.",
      );
    });

    it("should throw TypeError when authorities collection is missing or not an array", () => {
      const malformedACV = {
        ...mockACV,
        authorities: undefined,
      } as unknown as ActiveConstitutionalView;
      expect(() => projectActiveConstitutionalViewState(malformedACV)).toThrow(
        "ActiveConstitutionalView authorities must be an array.",
      );
    });

    it("should throw TypeError when capabilities collection is missing or not an array", () => {
      const malformedACV = {
        ...mockACV,
        capabilities: undefined,
      } as unknown as ActiveConstitutionalView;
      expect(() => projectActiveConstitutionalViewState(malformedACV)).toThrow(
        "ActiveConstitutionalView capabilities must be an array.",
      );
    });

    it("should throw TypeError when applicablePolicies collection is missing or not an array", () => {
      const malformedACV = {
        ...mockACV,
        applicablePolicies: undefined,
      } as unknown as ActiveConstitutionalView;
      expect(() => projectActiveConstitutionalViewState(malformedACV)).toThrow(
        "ActiveConstitutionalView applicablePolicies must be an array.",
      );
    });
  });
});
