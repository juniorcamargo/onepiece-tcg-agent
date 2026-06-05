import { describe, it, expect } from "vitest";
import { UniqueId } from "@domain/shared/value-objects/unique-id.value-object";
import { ZodError } from "zod";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("UniqueId", () => {
  describe("create()", () => {
    it("generates a UUID when called without argument", () => {
      const id = UniqueId.create();
      expect(UUID_RE.test(id.toString())).toBe(true);
    });

    it("generates a different UUID on each call", () => {
      const a = UniqueId.create();
      const b = UniqueId.create();
      expect(a.equals(b)).toBe(false);
    });

    it("accepts an explicit non-empty string", () => {
      const id = UniqueId.create("my-custom-id");
      expect(id.toString()).toBe("my-custom-id");
    });

    it("throws ZodError when given an empty string", () => {
      expect(() => UniqueId.create("")).toThrow(ZodError);
    });
  });

  describe("fromString()", () => {
    it("wraps a valid string", () => {
      const id = UniqueId.fromString("abc-123");
      expect(id.toString()).toBe("abc-123");
    });

    it("throws ZodError when given an empty string", () => {
      expect(() => UniqueId.fromString("")).toThrow(ZodError);
    });
  });

  describe("equals()", () => {
    it("returns true for the same value", () => {
      const a = UniqueId.fromString("same-id");
      const b = UniqueId.fromString("same-id");
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different values", () => {
      const a = UniqueId.fromString("id-one");
      const b = UniqueId.fromString("id-two");
      expect(a.equals(b)).toBe(false);
    });
  });
});
