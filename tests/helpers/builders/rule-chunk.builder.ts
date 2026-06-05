import { RuleChunk } from "@domain/rule/rule-chunk.value-object";

export class RuleChunkBuilder {
  private content = "Each player starts the game with 5 Life cards.";
  private section = "2.1";
  private page: number | undefined = 4;
  private source = "onepiece-tcg-rules.pdf";

  withContent(content: string): this {
    this.content = content;
    return this;
  }

  withSection(section: string): this {
    this.section = section;
    return this;
  }

  withPage(page: number | undefined): this {
    this.page = page;
    return this;
  }

  build(): RuleChunk {
    return RuleChunk.create({
      content: this.content,
      section: this.section,
      page: this.page,
      source: this.source,
    });
  }
}
