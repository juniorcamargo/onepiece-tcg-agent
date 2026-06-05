import { QdrantVector } from "@mastra/qdrant";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { embedV2 } from "@mastra/core/vector";
import { Rule } from "@domain/rule/rule.entity";
import { RuleChunk } from "@domain/rule/rule-chunk.value-object";
import { RuleQuery } from "@domain/rule/rule-query.value-object";
import { RuleRepositoryPort } from "@domain/rule/rule-repository.port";
import { UniqueId } from "@domain/shared/value-objects/unique-id.value-object";

const EMBEDDING_DIMENSIONS = 3072;
const EMBEDDING_MODEL = "google/gemini-embedding-001";
const EMBED_BATCH_SIZE = 10;
const EMBED_DELAY_MS = 1500;

interface ChunkMetadata {
  content: string;
  section: string;
  page?: number;
  source: string;
}

export class QdrantRuleRepositoryAdapter implements RuleRepositoryPort {
  private readonly embeddingModel: ModelRouterEmbeddingModel;

  constructor(
    private readonly qdrant: QdrantVector,
    private readonly collectionName: string,
  ) {
    this.embeddingModel = new ModelRouterEmbeddingModel(EMBEDDING_MODEL);
  }

  async search(query: RuleQuery): Promise<Rule[]> {
    await this.ensureCollectionExists();

    const { embedding } = await embedV2({
      model: this.embeddingModel,
      value: query.text,
    });

    const results = await this.qdrant.query({
      indexName: this.collectionName,
      queryVector: embedding,
      topK: query.limit,
    });

    return results
      .filter((r) => r.metadata !== undefined)
      .map((r) => {
        const meta = r.metadata as ChunkMetadata;
        return Rule.create({
          id: r.id,
          content: meta.content,
          metadata: {
            section: meta.section,
            page: meta.page,
            source: meta.source,
          },
        });
      });
  }

  async saveChunks(chunks: RuleChunk[]): Promise<void> {
    await this.ensureCollectionExists();

    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
      const embeddings: number[][] = [];
      for (const chunk of batch) {
        const { embedding } = await embedV2({ model: this.embeddingModel, value: chunk.content });
        embeddings.push(embedding);
        await new Promise((r) => setTimeout(r, EMBED_DELAY_MS));
      }
      const metadata: ChunkMetadata[] = batch.map((chunk) => ({
        content: chunk.content,
        section: chunk.section,
        page: chunk.page,
        source: chunk.source,
      }));
      const ids = batch.map(() => UniqueId.create().toString());

      await this.qdrant.upsert({ indexName: this.collectionName, vectors: embeddings, metadata, ids });
      console.log(`  Ingested chunks ${i + 1}–${Math.min(i + EMBED_BATCH_SIZE, chunks.length)} of ${chunks.length}`);
    }
  }

  async clear(): Promise<void> {
    const indexes = await this.qdrant.listIndexes();
    if (indexes.includes(this.collectionName)) {
      await this.qdrant.deleteIndex({ indexName: this.collectionName });
    }
    await this.qdrant.createIndex({
      indexName: this.collectionName,
      dimension: EMBEDDING_DIMENSIONS,
      metric: "cosine",
    });
  }

  private async ensureCollectionExists(): Promise<void> {
    const indexes = await this.qdrant.listIndexes();
    if (!indexes.includes(this.collectionName)) {
      await this.qdrant.createIndex({
        indexName: this.collectionName,
        dimension: EMBEDDING_DIMENSIONS,
        metric: "cosine",
      });
    }
  }
}
