import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

export interface ResolvedGenerator {
  readonly name: string;
  readonly command: string;
  /**
   * The root-relative directory of the scope declaring the generator, where
   * its command runs.
   */
  readonly dir: Directory;
  /**
   * Root-relative globs of the files the generator reads.
   */
  readonly inputs: Globs;
  /**
   * Root-relative globs of the files the generator writes.
   */
  readonly outputs: Globs;
}
