import { Rule } from "./rule.entity";
import { RuleChunk } from "./rule-chunk.value-object";
import { RuleQuery } from "./rule-query.value-object";

export interface RuleRepositoryPort {
  search(query: RuleQuery): Promise<Rule[]>;
  saveChunks(chunks: RuleChunk[]): Promise<void>;
  clear(): Promise<void>;
}
