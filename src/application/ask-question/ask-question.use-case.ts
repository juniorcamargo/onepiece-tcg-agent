import { RuleRepositoryPort } from "@domain/rule/rule-repository.port";
import { RuleQuery } from "@domain/rule/rule-query.value-object";
import {
  AskQuestionInput,
  AskQuestionInputSchema,
  AskQuestionOutput,
  ForAskingQuestionsPort,
} from "../ports/for-asking-questions.port";

export class AskQuestionUseCase implements ForAskingQuestionsPort {
  constructor(private readonly ruleRepository: RuleRepositoryPort) {}

  async execute(input: AskQuestionInput): Promise<AskQuestionOutput> {
    const validated = AskQuestionInputSchema.parse(input);
    const query = RuleQuery.create({ text: validated.question, limit: validated.limit });
    const rules = await this.ruleRepository.search(query);

    const context = rules
      .map((rule) => {
        const meta = `[${rule.metadata.section}${rule.metadata.page ? `, p.${rule.metadata.page}` : ""}]`;
        return `${meta}\n${rule.content}`;
      })
      .join("\n\n---\n\n");

    return { rules, context };
  }
}
