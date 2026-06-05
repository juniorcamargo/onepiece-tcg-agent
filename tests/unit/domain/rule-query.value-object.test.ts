import { describe, it, expect } from "vitest";
import { RuleQuery } from "@domain/rule/rule-query.value-object";
import { ZodError } from "zod";

describe("RuleQuery", () => {
  describe("create()", () => {
    it("creates a query with valid text and default limit", () => {
      const query = RuleQuery.create({ text: "How does attacking work?" });
      expect(query.text).toBe("How does attacking work?");
      expect(query.limit).toBe(5);
    });

    it("trims whitespace from text", () => {
      const query = RuleQuery.create({ text: "  What is a blocker?  " });
      expect(query.text).toBe("What is a blocker?");
    });

    it("accepts a custom limit within bounds", () => {
      const query = RuleQuery.create({ text: "Draw step rules", limit: 10 });
      expect(query.limit).toBe(10);
    });

    it("throws ZodError when text is shorter than 3 chars", () => {
      expect(() => RuleQuery.create({ text: "ab" })).toThrow(ZodError);
    });

    it("throws ZodError when text is empty", () => {
      expect(() => RuleQuery.create({ text: "" })).toThrow(ZodError);
    });

    it("throws ZodError when limit exceeds 20", () => {
      expect(() =>
        RuleQuery.create({ text: "Valid question", limit: 21 }),
      ).toThrow(ZodError);
    });

    it("throws ZodError when limit is zero", () => {
      expect(() =>
        RuleQuery.create({ text: "Valid question", limit: 0 }),
      ).toThrow(ZodError);
    });
  });

  describe("equals()", () => {
    it("returns true for identical text and limit", () => {
      const a = RuleQuery.create({ text: "How do Leaders work?", limit: 3 });
      const b = RuleQuery.create({ text: "How do Leaders work?", limit: 3 });
      expect(a.equals(b)).toBe(true);
    });

    it("returns false when text differs", () => {
      const a = RuleQuery.create({ text: "Question A?" });
      const b = RuleQuery.create({ text: "Question B?" });
      expect(a.equals(b)).toBe(false);
    });

    it("returns false when limit differs", () => {
      const a = RuleQuery.create({ text: "Same question?", limit: 3 });
      const b = RuleQuery.create({ text: "Same question?", limit: 7 });
      expect(a.equals(b)).toBe(false);
    });
  });
});
