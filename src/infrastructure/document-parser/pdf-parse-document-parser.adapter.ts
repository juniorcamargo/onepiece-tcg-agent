import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";
import { MDocument } from "@mastra/rag";
import { RuleChunk } from "@domain/rule/rule-chunk.value-object";
import { ForDocumentParsingPort } from "@application/ports/for-document-parsing.port";
import { basename } from "path";

const CHUNK_MAX_SIZE = 600;
const CHUNK_OVERLAP = 80;

const SECTION_PATTERN = /^\s*(\d+(?:\.\d+)*)\s+[A-Z]/m;

function detectSection(text: string): string {
  const match = SECTION_PATTERN.exec(text);
  if (match) {
    return match[1];
  }
  const firstLine = text.split("\n").find((l) => l.trim().length > 0) ?? "";
  return firstLine.slice(0, 60).trim() || "General";
}

export class PdfParseDocumentParserAdapter implements ForDocumentParsingPort {
  async parse(filePath: string): Promise<RuleChunk[]> {
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const { text } = await parser.getText();
    const source = basename(filePath);

    const doc = MDocument.fromText(text, { source });
    const mastraChunks = await doc.chunk({
      strategy: "recursive",
      maxSize: CHUNK_MAX_SIZE,
      overlap: CHUNK_OVERLAP,
    });

    return mastraChunks
      .filter((chunk) => chunk.text.trim().length > 30)
      .map((chunk) =>
        RuleChunk.create({
          content: chunk.text.trim(),
          section: detectSection(chunk.text),
          source,
        }),
      );
  }
}
