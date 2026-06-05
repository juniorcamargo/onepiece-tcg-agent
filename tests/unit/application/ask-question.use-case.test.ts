import { describe, it, expect, vi, beforeEach } from "vitest";
import { AskQuestionUseCase } from "@application/ask-question/ask-question.use-case";
import { RuleRepositoryPort } from "@domain/rule/rule-repository.port";
import { ZodError } from "zod";
import { RuleBuilder } from "../../helpers/builders/rule.builder";

function makeMockRepository(overrides?: Partial<RuleRepositoryPort>): RuleRepositoryPort {
  return {
    search: vi.fn().mockResolvedValue([]),
    saveChunks: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("AskQuestionUseCase", () => {
  let repository: RuleRepositoryPort;
  let useCase: AskQuestionUseCase;

  beforeEach(() => {
    repository = makeMockRepository();
    useCase = new AskQuestionUseCase(repository);
  });

  describe("input validation", () => {
    it("throws ZodError when question is shorter than 3 chars", async () => {
      await expect(useCase.execute({ question: "ab" })).rejects.toThrow(ZodError);
    });

    it("throws ZodError when question is empty", async () => {
      await expect(useCase.execute({ question: "" })).rejects.toThrow(ZodError);
    });

    it("throws ZodError when limit exceeds 20", async () => {
      await expect(
        useCase.execute({ question: "Valid question?", limit: 21 }),
      ).rejects.toThrow(ZodError);
    });
  });

  describe("search behaviour", () => {
    it("calls repository.search with a RuleQuery built from the input", async () => {
      await useCase.execute({ question: "How does attacking work?", limit: 3 });

      expect(repository.search).toHaveBeenCalledOnce();
      const query = vi.mocked(repository.search).mock.calls[0][0];
      expect(query.text).toBe("How does attacking work?");
      expect(query.limit).toBe(3);
    });

    it("applies the default limit of 5 when none is provided", async () => {
      await useCase.execute({ question: "What is a blocker?" });

      const query = vi.mocked(repository.search).mock.calls[0][0];
      expect(query.limit).toBe(5);
    });
  });

  describe("output formatting", () => {
    it("returns empty context and no rules when nothing is found", async () => {
      const result = await useCase.execute({ question: "Obscure edge case?" });

      expect(result.rules).toHaveLength(0);
      expect(result.context).toBe("");
    });

    it("formats found rules with section and page references", async () => {
      const rule = new RuleBuilder()
        .withSection("4.1")
        .withPage(12)
        .withContent("KO'd characters go to the Trash.")
        .build();

      vi.mocked(repository.search).mockResolvedValue([rule]);

      const result = await useCase.execute({ question: "What happens when KO'd?" });

      expect(result.rules).toHaveLength(1);
      expect(result.context).toContain("[4.1, p.12]");
      expect(result.context).toContain("KO'd characters go to the Trash.");
    });

    it("omits page reference when page is undefined", async () => {
      const rule = new RuleBuilder().withPage(undefined).build();
      vi.mocked(repository.search).mockResolvedValue([rule]);

      const result = await useCase.execute({ question: "Valid question here" });

      expect(result.context).not.toContain("p.");
    });

    it("separates multiple rules with a delimiter", async () => {
      const rules = [
        new RuleBuilder().withId("id-1").withContent("Rule one content.").build(),
        new RuleBuilder().withId("id-2").withContent("Rule two content.").build(),
      ];
      vi.mocked(repository.search).mockResolvedValue(rules);

      const result = await useCase.execute({ question: "Multi-rule question?" });

      expect(result.context).toContain("---");
      expect(result.context).toContain("Rule one content.");
      expect(result.context).toContain("Rule two content.");
    });
  });
});
