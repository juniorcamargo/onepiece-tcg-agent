import { RuleChunk } from "@domain/rule/rule-chunk.value-object";

export interface ForDocumentParsingPort {
  parse(filePath: string): Promise<RuleChunk[]>;
}
