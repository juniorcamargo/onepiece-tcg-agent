import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ForAskingQuestionsPort } from "@application/ports/for-asking-questions.port";

export function createSearchRulesTool(askQuestion: ForAskingQuestionsPort) {
  return createTool({
    id: "search-tcg-rules",
    description:
      "Searches the One Piece TCG official rulebook for rules relevant to a question. " +
      "Returns formatted excerpts with section references. " +
      "Always call this tool before answering any rules question.",
    inputSchema: z.object({
      question: z
        .string()
        .min(3)
        .describe("The rules question to search for"),
      limit: z
        .number()
        .int()
        .positive()
        .max(10)
        .optional()
        .default(5)
        .describe("Max number of rule excerpts to return"),
    }),
    outputSchema: z.object({
      context: z
        .string()
        .describe("Formatted rule excerpts with section references"),
      ruleCount: z.number().describe("Number of relevant rule excerpts found"),
    }),
    execute: async ({ question, limit }) => {
      const result = await askQuestion.execute({ question, limit });
      return { context: result.context, ruleCount: result.rules.length };
    },
  });
}
