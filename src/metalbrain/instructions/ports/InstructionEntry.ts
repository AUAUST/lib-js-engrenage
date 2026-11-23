import type { RuleEntry } from "#metalbrain/instructions/ports/RuleEntry";
import type { SectionEntry } from "#metalbrain/instructions/ports/SectionEntry";
import type { SkillEntry } from "#metalbrain/instructions/ports/SkillEntry";

/**
 * An entry of the instruction registry, which built-ins pre-register and
 * extensions extend.
 */
export type InstructionEntry = SectionEntry | RuleEntry | SkillEntry;
