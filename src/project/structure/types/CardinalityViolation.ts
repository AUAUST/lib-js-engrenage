import type { Files } from "#types/Files";
import type { Globs } from "#types/Globs";

export interface CardinalityViolation {
  readonly role: string;
  readonly reason: "unique" | "required";
  readonly files: Files;
  readonly globs: Globs;
}
