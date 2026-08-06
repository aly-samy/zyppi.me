import { describe, it, expect, vi } from "vitest";
import type { NormalizedGs1DigitalLink, IdentityRecord } from "@zyppi/domain";
import {
  type RegistryRepository,
  type RetrievedRegistryState,
  type RegistryResult,
  resolveGs1DigitalLink,
} from "./index.js";

const mockIdentity: IdentityRecord = {
  identityId: "id-123",
  identityType: "product",
  canonicalReference: "canonical-ref",
  referentId: null,
  status: "active",
  createdAt: "2026-07-28T12:00:00Z",
  updatedAt: "2026-07-28T12:00:00Z",
};

const mockRegistryState: RetrievedRegistryState = {
  identity: mockIdentity,
  relationships: [],
  standings: [],
  authorities: [],
  capabilities: [],
  evidenceReferences: [],
  applicablePolicies: [],
};

const createMockRepository = (
  lookupFn: (
    identifier: string,
  ) => Promise<RegistryResult<RetrievedRegistryState | null>>,
): RegistryRepository => {
  return {
    lookup: vi.fn(lookupFn),
  };
};

describe("Registry Resolution Stage (AMS-0604 / IT-0604)", () => {
  describe("Success Scenarios", () => {
    it("should resolve an existing identifier successfully", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async (id) => {
        if (id === "12345678901231") {
          return { ok: true, value: mockRegistryState };
        }
        return { ok: true, value: null };
      });

      const result = await resolveGs1DigitalLink(normalizedCarrier, repository);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.normalizedCarrier).toBe(normalizedCarrier);
        expect(result.value.registryState).toBe(mockRegistryState);
      }

      // Assert repository called exactly once with only the validated canonical identifier
      expect(repository.lookup).toHaveBeenCalledTimes(1);
      expect(repository.lookup).toHaveBeenCalledWith("12345678901231");
    });

    it("should resolve GTIN-only carrier successfully", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      const result = await resolveGs1DigitalLink(normalizedCarrier, repository);
      expect(result.ok).toBe(true);
      expect(repository.lookup).toHaveBeenCalledWith("12345678901231");
    });

    it("should resolve GTIN with supported qualifiers and preserve unsupported context", async () => {
      const unsupported = [
        { ai: "91", value: "PROMO", source: "query" as const },
      ];
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: [
          { ai: "10", value: "LOT123", source: "query" as const },
        ],
        unsupportedContext: unsupported,
      };

      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      const result = await resolveGs1DigitalLink(normalizedCarrier, repository);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.normalizedCarrier.supportedQualifiers).toEqual([
          { ai: "10", value: "LOT123", source: "query" },
        ]);
        expect(result.value.normalizedCarrier.unsupportedContext).toBe(
          unsupported,
        );
      }

      // Qualifiers never influence lookup
      expect(repository.lookup).toHaveBeenCalledWith("12345678901231");
    });

    it("should return a deeply frozen and immutable wrapper", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      const result = await resolveGs1DigitalLink(normalizedCarrier, repository);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Object.isFrozen(result.value)).toBe(true);
      }
    });

    it("should resolve different qualifiers on the same k1 to the same Registry state", async () => {
      const carrier1: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [{ ai: "10", value: "A", source: "query" }],
        unsupportedContext: [],
      };

      const carrier2: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [{ ai: "10", value: "B", source: "query" }],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      const res1 = await resolveGs1DigitalLink(carrier1, repository);
      const res2 = await resolveGs1DigitalLink(carrier2, repository);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (res1.ok && res2.ok) {
        expect(res1.value.registryState).toBe(res2.value.registryState);
      }
    });

    it("should never mutate the input NormalizedGs1DigitalLink", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      const cloned = { ...normalizedCarrier };
      await resolveGs1DigitalLink(normalizedCarrier, repository);

      expect(normalizedCarrier).toEqual(cloned);
    });
  });

  describe("Failure Scenarios & Contract Violations", () => {
    it("should return INVALID_NORMALIZED_INPUT if the normalized carrier is null or undefined", async () => {
      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      const result = await resolveGs1DigitalLink(
        null as unknown as NormalizedGs1DigitalLink,
        repository,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_NORMALIZED_INPUT");
        expect(result.error.message).toContain("missing or invalid");
      }

      // Repository is never called when assertions fail
      expect(repository.lookup).not.toHaveBeenCalled();
    });

    it("should return INVALID_NORMALIZED_INPUT if k1 is missing, empty, or whitespace-only", async () => {
      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      const carriers = [
        {
          primaryIdentifier: {
            ai: "01",
            value: "12345678901231",
            source: "path",
          },
        } as unknown as NormalizedGs1DigitalLink,
        {
          k1: "",
          primaryIdentifier: {
            ai: "01",
            value: "12345678901231",
            source: "path",
          },
        } as unknown as NormalizedGs1DigitalLink,
        {
          k1: "   ",
          primaryIdentifier: {
            ai: "01",
            value: "12345678901231",
            source: "path",
          },
        } as unknown as NormalizedGs1DigitalLink,
      ];

      for (const carrier of carriers) {
        const result = await resolveGs1DigitalLink(carrier, repository);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_NORMALIZED_INPUT");
        }
      }

      expect(repository.lookup).not.toHaveBeenCalled();
    });

    it("should return REFERENT_NOT_FOUND when lookup is successful but referent does not exist", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async () => ({
        ok: true,
        value: null,
      }));

      const result = await resolveGs1DigitalLink(normalizedCarrier, repository);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("REFERENT_NOT_FOUND");
        expect(result.error.message).toContain("No Referent exists");
      }
    });

    it("should propagate repository failure as REGISTRY_FAILURE", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async () => ({
        ok: false,
        error: { kind: "InfrastructureUnavailable" },
      }));

      const result = await resolveGs1DigitalLink(normalizedCarrier, repository);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("REGISTRY_FAILURE");
        expect(result.error.message).toContain("InfrastructureUnavailable");
      }
    });

    it("should handle unexpected exceptions thrown by repository as REGISTRY_FAILURE", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async () => {
        throw new Error("DB connection timeout");
      });

      const result = await resolveGs1DigitalLink(normalizedCarrier, repository);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("REGISTRY_FAILURE");
        expect(result.error.message).toContain("DB connection timeout");
      }
    });
  });

  describe("Purity & Determinism", () => {
    it("should always return identical results for identical input and repository snapshots", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      const res1 = await resolveGs1DigitalLink(normalizedCarrier, repository);
      const res2 = await resolveGs1DigitalLink(normalizedCarrier, repository);

      expect(res1).toEqual(res2);
    });

    it("should demonstrate read-only side-effect-free behavior", async () => {
      const normalizedCarrier: NormalizedGs1DigitalLink = {
        k1: "12345678901231",
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path",
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      };

      const initialMockState = JSON.stringify(mockRegistryState);

      const repository = createMockRepository(async () => ({
        ok: true,
        value: mockRegistryState,
      }));

      await resolveGs1DigitalLink(normalizedCarrier, repository);

      // Verify no mutation of mockRegistryState
      expect(JSON.stringify(mockRegistryState)).toBe(initialMockState);
    });
  });
});
