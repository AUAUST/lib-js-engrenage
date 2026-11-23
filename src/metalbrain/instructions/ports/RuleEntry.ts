import type { InstructionMetadata } from "#metalbrain/instructions/ports/InstructionMetadata";

/**
 * A rule file of the instruction registry.
 */
export interface RuleEntry extends InstructionMetadata {
  /**
   * Marks the entry as a rule, whose body sync installs under the rules directory.
   */
  readonly kind: "rule";
  /**
   * The globs the rule file applies to, written to its frontmatter; it applies
   * to every file without them.
   */
  readonly paths?: readonly string[];
  /**
   * Former names of the rule, whose installed files sync migrates to it.
   */
  readonly formerly?: readonly string[];
}
