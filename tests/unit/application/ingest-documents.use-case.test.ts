import { describe, it, expect, vi, beforeEach } from "vitest";
import { IngestDocumentsUseCase } from "@application/ingest-documents/ingest-documents.use-case";
import { RuleRepositoryPort } from "@domain/rule/rule-repository.port";
import { ForDocumentParsingPort } from "@application/ports/for-document-parsing.port";
import { ZodError } from "zod";
import { RuleChunkBuilder } from "../../helpers/builders/rule-chunk.builder";

function makeMockParser(overrides?: Partial<ForDocumentParsingPort>): ForDocumentParsingPort {
  return {
    parse: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function makeMockRepository(overrides?: Partial<RuleRepositoryPort>): RuleRepositoryPort {
  return {
    search: vi.fn().mockResolvedValue([]),
    saveChunks: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("IngestDocumentsUseCase", () => {
  let parser: ForDocumentParsingPort;
  let repository: RuleRepositoryPort;
  let useCase: IngestDocumentsUseCase;

  beforeEach(() => {
    parser = makeMockParser();
    repository = makeMockRepository();
    useCase = new IngestDocumentsUseCase(parser, repository);
  });

  describe("input validation", () => {
    it("throws ZodError when filePath is empty", async () => {
      await expect(
        useCase.execute({ filePath: "", clearExisting: false }),
      ).rejects.toThrow(ZodError);
    });
  });

  describe("ingestion flow", () => {
    it("calls parser.parse with the provided filePath", async () => {
      await useCase.execute({ filePath: "./docs/rules.pdf", clearExisting: false });

      expect(parser.parse).toHaveBeenCalledOnce();
      expect(parser.parse).toHaveBeenCalledWith("./docs/rules.pdf");
    });

    it("passes parsed chunks to repository.saveChunks", async () => {
      const chunks = [
        new RuleChunkBuilder().withContent("First rule chunk.").build(),
        new RuleChunkBuilder().withContent("Second rule chunk.").build(),
      ];
      vi.mocked(parser.parse).mockResolvedValue(chunks);

      await useCase.execute({ filePath: "./docs/rules.pdf", clearExisting: false });

      expect(repository.saveChunks).toHaveBeenCalledOnce();
      expect(repository.saveChunks).toHaveBeenCalledWith(chunks);
    });

    it("does NOT call repository.clear when clearExisting is false", async () => {
      await useCase.execute({ filePath: "./docs/rules.pdf", clearExisting: false });

      expect(repository.clear).not.toHaveBeenCalled();
    });

    it("calls repository.clear BEFORE saveChunks when clearExisting is true", async () => {
      const callOrder: string[] = [];
      vi.mocked(repository.clear).mockImplementation(async () => {
        callOrder.push("clear");
      });
      vi.mocked(repository.saveChunks).mockImplementation(async () => {
        callOrder.push("save");
      });

      await useCase.execute({ filePath: "./docs/rules.pdf", clearExisting: true });

      expect(callOrder).toEqual(["clear", "save"]);
    });
  });

  describe("output", () => {
    it("returns chunksIngested equal to the number of parsed chunks", async () => {
      const chunks = [
        new RuleChunkBuilder().build(),
        new RuleChunkBuilder().build(),
        new RuleChunkBuilder().build(),
      ];
      vi.mocked(parser.parse).mockResolvedValue(chunks);

      const result = await useCase.execute({
        filePath: "./docs/rules.pdf",
        clearExisting: false,
      });

      expect(result.chunksIngested).toBe(3);
    });

    it("returns the source filePath in the result", async () => {
      const result = await useCase.execute({
        filePath: "./docs/onepiece.pdf",
        clearExisting: false,
      });

      expect(result.source).toBe("./docs/onepiece.pdf");
    });

    it("returns 0 chunksIngested when the parser returns no chunks", async () => {
      const result = await useCase.execute({
        filePath: "./docs/rules.pdf",
        clearExisting: false,
      });

      expect(result.chunksIngested).toBe(0);
    });
  });
});
