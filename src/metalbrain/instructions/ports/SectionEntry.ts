import type { InstructionMetadata } from "#metalbrain/instructions/ports/InstructionMetadata";

/**
 * An `AGENTS.md` section of the instruction registry.
 */
export interface SectionEntry extends InstructionMetadata {
  /**
   * Marks the entry as a section, whose body init references from `AGENTS.md`.
   */
  readonly kind: "section";
}
