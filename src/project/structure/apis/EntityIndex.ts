import type { Entity } from "#project/structure/types/Entity";
import type { File } from "#types/File";

export interface EntityIndex {
  /**
   * Describes where `file`, absolute or relative to the project root, sits in the
   * structure of its environment, workspace or build output; `undefined` when
   * it lies in none of them or in a directory the structure leaves uncovered.
   * Memoized per file.
   */
  entityOf(file: File): Entity | undefined;
  /**
   * The `#…` alias specifier other modules import `file` by; `undefined` when no
   * alias targets it.
   */
  specifierOf(file: File): string | undefined;
  /**
   * Whether `file` lies under the directory of an environment, a workspace or
   * the build output, even one `entityOf` leaves uncovered.
   */
  withinEnvironment(file: File): boolean;
}
