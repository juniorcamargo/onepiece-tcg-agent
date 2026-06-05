import { Rule } from "@domain/rule/rule.entity";

export class RuleBuilder {
  private id = "rule-id-001";
  private content = "When a Character is KO'd, place it in its owner's Trash.";
  private section = "4.1";
  private page: number | undefined = 12;
  private source = "onepiece-tcg-rules.pdf";

  withId(id: string): this {
    this.id = id;
    return this;
  }

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

  withSource(source: string): this {
    this.source = source;
    return this;
  }

  build(): Rule {
    return Rule.create({
      id: this.id,
      content: this.content,
      metadata: { section: this.section, page: this.page, source: this.source },
    });
  }
}
