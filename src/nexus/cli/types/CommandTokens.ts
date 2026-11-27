import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";

/**
 * What one command's tokens yield: a request for its help or the version, the
 * subcommand they route to with the tokens after its name, the values given to
 * its own options and its positional arguments.
 */
export interface CommandTokens {
  readonly request?: "help" | "version";
  readonly route?: {
    readonly declaration: CommandDeclaration;
    readonly args: readonly string[];
  };
  readonly given: ReadonlyMap<OptionDeclaration, unknown>;
  readonly positionals: readonly string[];
  /**
   * Whether an unknown option came before any command name, so the tokens route
   * nowhere, as that option's usage error explains.
   */
  readonly blocked: boolean;
}
