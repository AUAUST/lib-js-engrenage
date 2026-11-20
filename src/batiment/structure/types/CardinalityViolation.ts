import type { Files } from "#types/Files";
import type { Globs } from "#types/Globs";

/**
 * A role a directory holds too many files of (`unique`) or none of (`required`),
 * with the files found and the globs the role matches.
 *
 * @experimental
 */
export interface CardinalityViolation {
  readonly role: string;
  readonly reason: "unique" | "required";
  readonly files: Files;
  readonly globs: Globs;
}
