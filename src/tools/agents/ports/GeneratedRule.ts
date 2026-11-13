import type { Globs } from "#types/Globs";

export interface GeneratedRule {
  /**
   * Path of the rule file in the rules directory, without `.md`: the generator's
   * name or a path below it.
   */
  readonly name: string;
  /**
   * Globs written as the rule's `paths` frontmatter, restricting it to matching
   * files; without them the rule has no frontmatter.
   */
  readonly paths?: Globs;
  /**
   * Filler directives with their arguments and without `@`, whose filled blocks
   * form the rule body in order.
   */
  readonly directives: readonly string[];
}
