import { describe, it, expect } from "vitest";
import { RuleChunk } from "@domain/rule/rule-chunk.value-object";
import { ZodError } from "zod";
import { RuleChunkBuilder } from "../../helpers/builders/rule-chunk.builder";

describe("RuleChunk", () => {
  describe("create()", () => {
    it("creates a chunk with valid props", () => {
      const chunk = new RuleChunkBuilder().build();
      expect(chunk.content).toBe("Each player starts the game with 5 Life cards.");
      expect(chunk.section).toBe("2.1");
      expect(chunk.page).toBe(4);
    });

    it("throws ZodError when content is empty", () => {
      expect(() =>
        RuleChunk.create({ content: "", section: "1.0", source: "rules.pdf" }),
      ).toThrow(ZodError);
    });

    it("throws ZodError when content has only whitespace", () => {
      expect(() =>
        RuleChunk.create({ content: "   ", section: "1.0", source: "rules.pdf" }),
      ).toThrow(ZodError);
    });

    it("throws ZodError when source is empty", () => {
      expect(() =>
        RuleChunk.create({ content: "Valid content", section: "1.0", source: "" }),
      ).toThrow(ZodError);
    });

    it("allows page to be undefined", () => {
      const chunk = new RuleChunkBuilder().withPage(undefined).build();
      expect(chunk.page).toBeUndefined();
    });
  });

  describe("equals()", () => {
    it("returns true for chunks with identical props", () => {
      const a = new RuleChunkBuilder().build();
      const b = new RuleChunkBuilder().build();
      expect(a.equals(b)).toBe(true);
    });

    it("returns false when content differs", () => {
      const a = new RuleChunkBuilder().withContent("Content A").build();
      const b = new RuleChunkBuilder().withContent("Content B").build();
      expect(a.equals(b)).toBe(false);
    });

    it("returns false when section differs", () => {
      const a = new RuleChunkBuilder().withSection("1.1").build();
      const b = new RuleChunkBuilder().withSection("1.2").build();
      expect(a.equals(b)).toBe(false);
    });

    it("returns false when page differs", () => {
      const a = new RuleChunkBuilder().withPage(1).build();
      const b = new RuleChunkBuilder().withPage(2).build();
      expect(a.equals(b)).toBe(false);
    });
  });
});
