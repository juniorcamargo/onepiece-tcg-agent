import { z } from "zod";
import { UniqueId } from "../shared/value-objects/unique-id.value-object";

export const RuleMetadataSchema = z.object({
  section: z.string(),
  page: z.number().int().positive().optional(),
  source: z.string().min(1),
});
export type RuleMetadata = z.infer<typeof RuleMetadataSchema>;

export const RulePropsSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1, "Rule content cannot be empty"),
  metadata: RuleMetadataSchema,
});
export type RuleProps = z.infer<typeof RulePropsSchema>;

export class Rule {
  readonly id: UniqueId;
  readonly content: string;
  readonly metadata: RuleMetadata;

  private constructor(id: UniqueId, content: string, metadata: RuleMetadata) {
    this.id = id;
    this.content = content;
    this.metadata = metadata;
  }

  static create(props: RuleProps): Rule {
    const validated = RulePropsSchema.parse(props);
    return new Rule(
      UniqueId.fromString(validated.id),
      validated.content,
      validated.metadata,
    );
  }

  equals(other: Rule): boolean {
    return this.id.equals(other.id);
  }
}
