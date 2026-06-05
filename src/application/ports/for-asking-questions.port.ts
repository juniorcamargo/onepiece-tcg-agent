import { z } from "zod";
import { Rule } from "@domain/rule/rule.entity";

export const AskQuestionInputSchema = z.object({
  question: z.string().trim().min(3, "Question must be at least 3 characters"),
  limit: z.number().int().positive().max(20).optional().default(5),
});

export type AskQuestionInput = {
  question: string;
  limit?: number;
};

export interface AskQuestionOutput {
  rules: Rule[];
  context: string;
}

export interface ForAskingQuestionsPort {
  execute(input: AskQuestionInput): Promise<AskQuestionOutput>;
}
