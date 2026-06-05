import { z } from "zod";

export const RuleQuerySchema = z.object({
  text: z.string().trim().min(3, "Query must be at least 3 characters"),
  limit: z.number().int().positive().max(20).default(5),
});

export type RuleQueryProps = {
  text: string;
  limit?: number;
};

export class RuleQuery {
  readonly text: string;
  readonly limit: number;

  private constructor(text: string, limit: number) {
    this.text = text;
    this.limit = limit;
  }

  static create(props: RuleQueryProps): RuleQuery {
    const validated = RuleQuerySchema.parse(props);
    return new RuleQuery(validated.text, validated.limit);
  }

  equals(other: RuleQuery): boolean {
    return this.text === other.text && this.limit === other.limit;
  }
}
