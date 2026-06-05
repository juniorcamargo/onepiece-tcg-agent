import { z } from "zod";

const UniqueIdSchema = z.string().min(1, "ID cannot be empty");

export class UniqueId {
  private constructor(private readonly value: string) {}

  static create(id?: string): UniqueId {
    if (id !== undefined) {
      return new UniqueId(UniqueIdSchema.parse(id));
    }
    return new UniqueId(crypto.randomUUID());
  }

  static fromString(id: string): UniqueId {
    return new UniqueId(UniqueIdSchema.parse(id));
  }

  toString(): string {
    return this.value;
  }

  equals(other: UniqueId): boolean {
    return this.value === other.value;
  }
}
