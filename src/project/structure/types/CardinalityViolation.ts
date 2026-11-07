import type { Files } from "#types/Files";

export interface CardinalityViolation {
  readonly role: string;
  readonly reason: "unique";
  readonly files: Files;
}
