import type { Loadable } from "#foundation/modules/index";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";

/**
 * A subcommand whose name and aliases are known up front and whose declaration
 * loads only once routing matches one of them, or every subcommand of its group
 * loads; it mounts under its own name and aliases whatever the declaration names.
 */
export interface CommandMount {
  readonly kind: "mount";
  readonly name: string;
  readonly aliases: readonly string[];
  /**
   * Where its declaration loads from, naming it in configuration and load errors.
   */
  readonly origin: string;
  load(): Promise<Loadable<CommandDeclaration>>;
}
