import type { InstructionEntry } from "#metalbrain/instructions/ports/InstructionEntry";
import type { File } from "#types/File";

/**
 * An instruction registry entry resolved to its Markdown body: the file,
 * its package specifier, whether its condition holds and whether a host
 * contributed it.
 */
export interface RegisteredInstruction<
  Entry extends InstructionEntry = InstructionEntry,
> {
  readonly entry: Entry;
  readonly source: File;
  readonly reference: string;
  readonly active: boolean;
  readonly contributed: boolean;
}
