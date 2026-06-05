import { QdrantVector } from "@mastra/qdrant";
import { loadEnv } from "./env";
import { PdfParseDocumentParserAdapter } from "../document-parser/pdf-parse-document-parser.adapter";
import { QdrantRuleRepositoryAdapter } from "../vector-store/qdrant-rule-repository.adapter";
import { AskQuestionUseCase } from "@application/ask-question/ask-question.use-case";
import { IngestDocumentsUseCase } from "@application/ingest-documents/ingest-documents.use-case";
import { ForAskingQuestionsPort } from "@application/ports/for-asking-questions.port";
import { ForIngestingDocumentsPort } from "@application/ports/for-ingesting-documents.port";

export interface Container {
  askQuestion: ForAskingQuestionsPort;
  ingestDocuments: ForIngestingDocumentsPort;
  pdfPath: string;
}

export function buildContainer(): Container {
  const env = loadEnv();

  const qdrantClient = new QdrantVector({
    id: "onepiece-tcg-qdrant",
    url: env.QDRANT_URL,
    apiKey: env.QDRANT_API_KEY,
  });

  const ruleRepository = new QdrantRuleRepositoryAdapter(
    qdrantClient,
    env.QDRANT_COLLECTION,
  );

  const documentParser = new PdfParseDocumentParserAdapter();

  const askQuestion = new AskQuestionUseCase(ruleRepository);
  const ingestDocuments = new IngestDocumentsUseCase(documentParser, ruleRepository);

  return { askQuestion, ingestDocuments, pdfPath: env.PDF_PATH };
}
