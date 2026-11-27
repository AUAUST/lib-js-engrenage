import type { CommandEntry } from "#nexus/cli/types/CommandEntry";

/**
 * A subcommand a source of a group provides, under its name and aliases, `label`
 * naming the source in configuration errors.
 */
export interface ProvidedEntry {
  /**
   * The entry, or `undefined` for a name the program's own commands reserve.
   */
  readonly entry: CommandEntry | undefined;
  readonly name: string;
  readonly names: readonly string[];
  readonly label: string;
}
