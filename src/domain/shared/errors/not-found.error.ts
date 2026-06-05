import { DomainError } from "./domain.error";

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" not found`);
  }
}
