import { RuleRepositoryPort } from "@domain/rule/rule-repository.port";
import { ForDocumentParsingPort } from "../ports/for-document-parsing.port";
import {
  IngestDocumentsInput,
  IngestDocumentsInputSchema,
  IngestDocumentsOutput,
  ForIngestingDocumentsPort,
} from "../ports/for-ingesting-documents.port";

export class IngestDocumentsUseCase implements ForIngestingDocumentsPort {
  constructor(
    private readonly documentParser: ForDocumentParsingPort,
    private readonly ruleRepository: RuleRepositoryPort,
  ) {}

  async execute(input: IngestDocumentsInput): Promise<IngestDocumentsOutput> {
    const validated = IngestDocumentsInputSchema.parse(input);

    if (validated.clearExisting) {
      await this.ruleRepository.clear();
    }

    const chunks = await this.documentParser.parse(validated.filePath);
    await this.ruleRepository.saveChunks(chunks);

    return {
      chunksIngested: chunks.length,
      source: validated.filePath,
    };
  }
}
