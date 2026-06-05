import { z } from "zod";

const EnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, "GOOGLE_GENERATIVE_AI_API_KEY is required for embeddings"),
  QDRANT_URL: z.url().default("http://localhost:6333"),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_COLLECTION: z.string().min(1).default("onepiece-tcg-rules"),
  PDF_PATH: z.string().min(1).default("./docs/onepiece-tcg-rules.pdf"),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  return EnvSchema.parse(process.env);
}
