import { describe, it, expect } from "vitest";
import { Rule } from "@domain/rule/rule.entity";
import { ZodError } from "zod";
import { RuleBuilder } from "../../helpers/builders/rule.builder";

describe("Rule", () => {
  describe("create()", () => {
    it("creates a rule with valid props", () => {
      const rule = new RuleBuilder().build();
      expect(rule.content).toBe("When a Character is KO'd, place it in its owner's Trash.");
      expect(rule.metadata.section).toBe("4.1");
      expect(rule.metadata.page).toBe(12);
      expect(rule.id.toString()).toBe("rule-id-001");
    });

    it("throws ZodError when content is empty", () => {
      expect(() =>
        Rule.create({
          id: "some-id",
          content: "",
          metadata: { section: "1.0", source: "rules.pdf" },
        }),
      ).toThrow(ZodError);
    });

    it("throws ZodError when id is empty", () => {
      expect(() =>
        Rule.create({
          id: "",
          content: "Valid content",
          metadata: { section: "1.0", source: "rules.pdf" },
        }),
      ).toThrow(ZodError);
    });

    it("throws ZodError when source is empty", () => {
      expect(() =>
        Rule.create({
          id: "id-1",
          content: "Valid content",
          metadata: { section: "1.0", source: "" },
        }),
      ).toThrow(ZodError);
    });

    it("allows page to be undefined", () => {
      const rule = new RuleBuilder().withPage(undefined).build();
      expect(rule.metadata.page).toBeUndefined();
    });
  });

  describe("equals()", () => {
    it("returns true for rules with the same id", () => {
      const a = new RuleBuilder().withId("shared-id").build();
      const b = new RuleBuilder().withId("shared-id").withContent("Different content").build();
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for rules with different ids", () => {
      const a = new RuleBuilder().withId("id-a").build();
      const b = new RuleBuilder().withId("id-b").build();
      expect(a.equals(b)).toBe(false);
    });
  });
});
