import type { InstructionEntry } from "#metalbrain/instructions/ports/InstructionEntry";

/**
 * An instruction registry entry a host contributes, with the root of the package
 * shipping its Markdown body.
 */
export interface ContributedInstruction {
  readonly entry: InstructionEntry;
  readonly origin: URL;
}
