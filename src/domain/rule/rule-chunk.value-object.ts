import { z } from "zod";

export const RuleChunkSchema = z.object({
  content: z
    .string()
    .min(1, "Chunk content cannot be empty")
    .refine((s) => s.trim().length > 0, "Chunk content cannot be only whitespace"),
  section: z.string(),
  page: z.number().int().positive().optional(),
  source: z.string().min(1),
});
export type RuleChunkProps = z.infer<typeof RuleChunkSchema>;

export class RuleChunk {
  readonly content: string;
  readonly section: string;
  readonly page: number | undefined;
  readonly source: string;

  private constructor(props: RuleChunkProps) {
    this.content = props.content;
    this.section = props.section;
    this.page = props.page;
    this.source = props.source;
  }

  static create(props: RuleChunkProps): RuleChunk {
    return new RuleChunk(RuleChunkSchema.parse(props));
  }

  equals(other: RuleChunk): boolean {
    return (
      this.content === other.content &&
      this.section === other.section &&
      this.page === other.page &&
      this.source === other.source
    );
  }
}
