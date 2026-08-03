import { describe, it, expect } from "vitest";
import type {
  IdentityRecord,
  ReferentRecord,
  StandingRecord,
  AuthorityRecord,
  CapabilityRecord,
  EvidenceRecord,
  PolicyRecord,
  ExecutionReceipt,
} from "@zyppi/domain";
import {
  type ValidatedCanonicalIdentifier,
  createValidatedCanonicalIdentifier,
  type RetrievedRegistryState,
  type RegistryResult,
  type RegistryError,
  type PersistenceAcknowledgement,
  type RegistryRepository,
  type ReceiptRepository,
} from "./index.js";

describe("Registry Repository Contracts — IT-0502", () => {
  describe("ValidatedCanonicalIdentifier Boundary", () => {
    it("can construct a ValidatedCanonicalIdentifier with non-empty string", () => {
      const input = "https://id.gs1.org/01/09780201379626";
      const result = createValidatedCanonicalIdentifier(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(input);
        // Ensure no trimming or altering of original string
        expect(typeof result.value).toBe("string");
      }
    });

    it("rejects empty or whitespace-only inputs", () => {
      const resultEmpty = createValidatedCanonicalIdentifier("");
      expect(resultEmpty.ok).toBe(false);
      if (!resultEmpty.ok) {
        expect(resultEmpty.error).toContain("empty or whitespace");
      }

      const resultWhitespace = createValidatedCanonicalIdentifier("   \n\t ");
      expect(resultWhitespace.ok).toBe(false);
    });

    it("does not trim or normalize valid inputs containing whitespace", () => {
      const input = "  some-valid-id-with-surrounding-whitespace  ";
      const result = createValidatedCanonicalIdentifier(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(input); // exactly the same string, not trimmed
      }
    });

    it("prevents arbitrary string from being assigned to ValidatedCanonicalIdentifier at compile time", () => {
      // Compile-time assignment check
      const rawString = "some-id";
      // @ts-expect-error - An ordinary string should not be directly assignable to the branded type
      const identifier: ValidatedCanonicalIdentifier = rawString;
      expect(identifier).toBeDefined();
    });
  });

  describe("RetrievedRegistryState & Field Alignment", () => {
    it("verifies RetrievedRegistryState structural alignment with Domain models", () => {
      // Mock data matching exact types of the Domain models to verify structural compatibility
      const mockIdentity: IdentityRecord = {
        identityId: "id-123",
        identityType: "product",
        canonicalReference: "canonical-ref",
        referentId: null,
        status: "active",
        createdAt: "2026-07-28T12:00:00Z",
        updatedAt: "2026-07-28T12:00:00Z",
      };

      const mockReferent: ReferentRecord = {
        referentId: "ref-123",
        referentType: "brand",
        name: "test-brand",
        parentReferentId: null,
        createdAt: "2026-07-28T12:00:00Z",
      };

      const mockStanding: StandingRecord = {
        standingId: "std-123",
        subjectId: "subj-123",
        scope: "some-scope",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T12:00:00Z",
      };

      const mockAuthority: AuthorityRecord = {
        authorityId: "auth-123",
        subjectId: "subj-123",
        scope: "some-scope",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T12:00:00Z",
      };

      const mockCapability: CapabilityRecord = {
        capabilityId: "cap-123",
        subjectId: "subj-123",
        scope: "some-scope",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T12:00:00Z",
      };

      const mockEvidence: EvidenceRecord = {
        evidenceId: "ev-123",
        identityId: "id-123",
        evidenceType: "cert",
        hash: "hash-value",
        storageRef: "storage-ref-value",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const mockPolicy: PolicyRecord = {
        policyId: "pol-123",
        policyType: "strict",
        version: "1.0",
        definition: null,
        active: true,
      };

      const state: RetrievedRegistryState = {
        identity: mockIdentity,
        relationships: [mockReferent],
        standings: [mockStanding],
        authorities: [mockAuthority],
        capabilities: [mockCapability],
        evidenceReferences: [mockEvidence],
        applicablePolicies: [mockPolicy],
      };

      expect(state.identity.identityId).toBe("id-123");
      expect(state.relationships[0].referentId).toBe("ref-123");
      expect(state.standings[0].standingId).toBe("std-123");
      expect(state.authorities[0].authorityId).toBe("auth-123");
      expect(state.capabilities[0].capabilityId).toBe("cap-123");
      expect(state.evidenceReferences[0].evidenceId).toBe("ev-123");
      expect(state.applicablePolicies[0].policyId).toBe("pol-123");
    });
  });

  describe("RegistryResult & Error Taxonomy", () => {
    it("safely narrows successful result with ok: true", () => {
      const result: RegistryResult<string> = { ok: true, value: "hello" };
      if (result.ok) {
        expect(result.value).toBe("hello");
      } else {
        throw new Error("Should not be error path");
      }
    });

    it("safely narrows failed result with ok: false and exact RegistryError variants", () => {
      const errUnavailable: RegistryError = {
        kind: "InfrastructureUnavailable",
      };
      const errCorruption: RegistryError = { kind: "DataCorruption" };
      const errFailed: RegistryError = { kind: "OperationFailed" };

      const result1: RegistryResult<null> = {
        ok: false,
        error: errUnavailable,
      };
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.kind).toBe("InfrastructureUnavailable");
      }

      const result2: RegistryResult<null> = { ok: false, error: errCorruption };
      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error.kind).toBe("DataCorruption");
      }

      const result3: RegistryResult<null> = { ok: false, error: errFailed };
      expect(result3.ok).toBe(false);
      if (!result3.ok) {
        expect(result3.error.kind).toBe("OperationFailed");
      }
    });

    it("verifies that errors do not carry any other properties", () => {
      const err: RegistryError = { kind: "OperationFailed" };
      expect(Object.keys(err)).toEqual(["kind"]);
    });
  });

  describe("Receipt Persistence Contracts", () => {
    it("accepts a mock conforming implementation and executes without revalidating decision internally", async () => {
      const mockReceipt: ExecutionReceipt = {
        receiptId: "receipt-123",
        executionId: "exec-123",
        runtimeVersion: "1.0",
        inputHash: "hash-in",
        outputHash: "hash-out",
        evidenceHash: "hash-ev",
        policyVersion: "1.0",
        decisionSummary: "authorized",
        executionTime: 120,
        deterministicHash: "det-hash",
      };

      const ack: PersistenceAcknowledgement = {};

      const receiptRepo: ReceiptRepository = {
        save: async (receipt) => {
          expect(receipt.receiptId).toBe("receipt-123");
          return { ok: true, value: ack };
        },
      };

      const saveRes = await receiptRepo.save(mockReceipt);
      expect(saveRes.ok).toBe(true);
      if (saveRes.ok) {
        expect(saveRes.value).toEqual({});
      }
    });
  });

  describe("RegistryRepository Lookup Contract", () => {
    it("can perform lookups on a mock conforming implementation returning successful state or null", async () => {
      const mockRepo: RegistryRepository = {
        lookup: async (identifier) => {
          if (identifier === "https://id.gs1.org/01/00860000000123") {
            const mockIdentity: IdentityRecord = {
              identityId: "id-123",
              identityType: "product",
              canonicalReference: "canonical-ref",
              referentId: null,
              status: "active",
              createdAt: "2026-07-28T12:00:00Z",
              updatedAt: "2026-07-28T12:00:00Z",
            };
            return {
              ok: true,
              value: {
                identity: mockIdentity,
                relationships: [],
                standings: [],
                authorities: [],
                capabilities: [],
                evidenceReferences: [],
                applicablePolicies: [],
              },
            };
          }
          return { ok: true, value: null };
        },
      };

      const idResult = createValidatedCanonicalIdentifier(
        "https://id.gs1.org/01/00860000000123",
      );
      expect(idResult.ok).toBe(true);
      if (idResult.ok) {
        const lookupRes = await mockRepo.lookup(idResult.value);
        expect(lookupRes.ok).toBe(true);
        if (lookupRes.ok) {
          expect(lookupRes.value).not.toBeNull();
          expect(lookupRes.value?.identity.identityId).toBe("id-123");
        }
      }

      const otherId = createValidatedCanonicalIdentifier(
        "https://id.gs1.org/01/00000000000000",
      );
      expect(otherId.ok).toBe(true);
      if (otherId.ok) {
        const lookupOther = await mockRepo.lookup(otherId.value);
        expect(lookupOther.ok).toBe(true);
        if (lookupOther.ok) {
          expect(lookupOther.value).toBeNull();
        }
      }
    });
  });
});
