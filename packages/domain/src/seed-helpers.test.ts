import { describe, it, expect } from "vitest";
import {
  canonicalizeJcs,
  getRegistryRecordIdentity,
  areRegistryRecordsEquivalent,
  JcsError,
  type RegistryRecord,
} from "./index.js";

describe("RFC 8785 JCS Canonicalization and Seed Helpers", () => {
  describe("JCS Canonicalization", () => {
    it("should serialize basic primitive values", () => {
      expect(canonicalizeJcs(null)).toBe("null");
      expect(canonicalizeJcs(true)).toBe("true");
      expect(canonicalizeJcs(false)).toBe("false");
      expect(canonicalizeJcs("hello")).toBe('"hello"');
      expect(canonicalizeJcs(123)).toBe("123");
      expect(canonicalizeJcs(1.234)).toBe("1.234");
    });

    it("should canonically order object keys lexicographically by UTF-16 code units", () => {
      const obj = { b: 2, a: 1, c: { y: 2, x: 1 } };
      expect(canonicalizeJcs(obj)).toBe('{"a":1,"b":2,"c":{"x":1,"y":2}}');
    });

    it("should serialize arrays correctly", () => {
      const arr = [1, "two", { b: 2, a: 1 }];
      expect(canonicalizeJcs(arr)).toBe('[1,"two",{"a":1,"b":2}]');
    });

    it("should escape special characters according to JCS rules", () => {
      const str = 'backslash: \\, quotes: ", tab: \t, newline: \n, vt: \x0b';
      const expected =
        '"backslash: \\\\, quotes: \\", tab: \\t, newline: \\n, vt: \\u000b"';
      expect(canonicalizeJcs(str)).toBe(expected);
    });

    it("should map negative zero (-0) to 0", () => {
      expect(canonicalizeJcs(-0)).toBe("0");
      expect(canonicalizeJcs({ val: -0 })).toBe('{"val":0}');
    });

    it("should reject non-finite numbers (NaN, Infinity)", () => {
      expect(() => canonicalizeJcs(NaN)).toThrow(JcsError);
      expect(() => canonicalizeJcs(Infinity)).toThrow(JcsError);
      expect(() => canonicalizeJcs(-Infinity)).toThrow(JcsError);
    });

    it("should reject prohibited types (Dates, Maps, Sets, Buffers)", () => {
      expect(() => canonicalizeJcs(new Date())).toThrow(JcsError);
      expect(() => canonicalizeJcs(new Map())).toThrow(JcsError);
      expect(() => canonicalizeJcs(new Set())).toThrow(JcsError);
      expect(() => canonicalizeJcs(new Uint8Array(10))).toThrow(JcsError);
    });

    it("should reject non-plain objects / class instances", () => {
      class CustomClass {
        a = 1;
      }
      expect(() => canonicalizeJcs(new CustomClass())).toThrow(JcsError);
    });

    it("should reject cyclic reference graphs", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: any = { a: 1 };
      obj.self = obj;
      expect(() => canonicalizeJcs(obj)).toThrow(JcsError);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const arr: any[] = [];
      arr.push(arr);
      expect(() => canonicalizeJcs(arr)).toThrow(JcsError);
    });
  });

  describe("Registry Record Identity Extraction", () => {
    it("should extract identity for each supported RegistryRecord variant", () => {
      const ref: RegistryRecord = {
        referentId: "ref-1",
        referentType: "manufacturer",
        name: "Aura Labs",
        parentReferentId: null,
        createdAt: "2026-08-04T00:00:00Z",
      };
      expect(getRegistryRecordIdentity(ref)).toBe("ref-1");

      const id: RegistryRecord = {
        identityId: "id-1",
        identityType: "supplier",
        canonicalReference: "zyppi:supplier:1",
        referentId: null,
        status: "active",
        createdAt: "2026-08-04T00:00:00Z",
        updatedAt: "2026-08-04T00:00:00Z",
      };
      expect(getRegistryRecordIdentity(id)).toBe("id-1");
    });

    it("should fail on unsupported or invalid objects", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => getRegistryRecordIdentity({} as any)).toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => getRegistryRecordIdentity(null as any)).toThrow();
    });
  });

  describe("Semantic Equivalence", () => {
    const recordA: RegistryRecord = {
      referentId: "ref-1",
      referentType: "manufacturer",
      name: "Aura Labs",
      parentReferentId: null,
      createdAt: "2026-08-04T00:00:00Z",
    };

    it("should match identical records", () => {
      expect(areRegistryRecordsEquivalent(recordA, { ...recordA })).toBe(true);
    });

    it("should match records with different storage-only metadata (createdAt)", () => {
      const recordB = { ...recordA, createdAt: "2026-08-05T12:00:00Z" };
      expect(areRegistryRecordsEquivalent(recordA, recordB)).toBe(true);
    });

    it("should reject different record values", () => {
      const recordB = { ...recordA, name: "Other Name" };
      expect(areRegistryRecordsEquivalent(recordA, recordB)).toBe(false);
    });

    it("should strictly compare null vs undefined (not semantically equivalent)", () => {
      const exp: RegistryRecord = {
        referentId: "ref-1",
        referentType: "manufacturer",
        name: "Aura Labs",
        parentReferentId: null,
        createdAt: "2026",
      };
      const act: RegistryRecord = {
        referentId: "ref-1",
        referentType: "manufacturer",
        name: "Aura Labs",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parentReferentId: undefined as any,
        createdAt: "2026",
      };
      expect(areRegistryRecordsEquivalent(exp, act)).toBe(false);
    });
  });
});
