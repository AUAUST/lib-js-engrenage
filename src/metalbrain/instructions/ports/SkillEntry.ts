import type { InstructionMetadata } from "#metalbrain/instructions/ports/InstructionMetadata";
import type { SkillAgent } from "#metalbrain/instructions/ports/SkillAgent";

/**
 * A skill of the instruction registry.
 */
export interface SkillEntry extends InstructionMetadata {
  /**
   * Marks the entry as a skill, whose body and supporting files sync installs in
   * each preferred runtime's skills directory.
   */
  readonly kind: "skill";
  /**
   * Whether only the user or a dispatching skill invokes the skill, or the model
   * also invokes it on its own; implicit without it.
   */
  readonly invocation?: "explicit" | "implicit";
  /**
   * Former names of the skill, whose installed files sync migrates to it.
   */
  readonly formerly?: readonly string[];
  /**
   * The subagent the skill defines; none without it.
   */
  readonly agent?: SkillAgent;
}
