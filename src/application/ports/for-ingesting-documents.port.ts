import { z } from "zod";

export const IngestDocumentsInputSchema = z.object({
  filePath: z.string().min(1, "File path cannot be empty"),
  clearExisting: z.boolean().default(false),
});
export type IngestDocumentsInput = z.infer<typeof IngestDocumentsInputSchema>;

export interface IngestDocumentsOutput {
  chunksIngested: number;
  source: string;
}

export interface ForIngestingDocumentsPort {
  execute(input: IngestDocumentsInput): Promise<IngestDocumentsOutput>;
}
