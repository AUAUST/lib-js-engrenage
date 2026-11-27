import type { HelpArgument } from "#nexus/cli/types/HelpArgument";
import type { HelpOption } from "#nexus/cli/types/HelpOption";

/**
 * What help states of a command at some of its paths, its loaded layers included.
 */
export interface HelpFacts {
  readonly description?: string;
  readonly aliases: readonly string[];
  readonly arguments: readonly HelpArgument[];
  readonly options: readonly HelpOption[];
  /**
   * The names of its subcommands.
   */
  readonly subcommands: readonly string[];
  /**
   * The text its help states after the rest.
   */
  readonly after?: string;
}
