import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandLoader } from "#nexus/cli/types/CommandLoader";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

/**
 * A command whose arguments and options nexus parses, or a group of subcommands.
 */
export interface ParsingCommandDeclaration {
  readonly kind: "parsing";
  readonly name: string;
  readonly aliases: readonly string[];
  readonly description?: string;
  readonly version?: string;
  readonly arguments: readonly ArgumentDeclaration[];
  readonly options: readonly (
    OptionDeclaration | LayerLoader<readonly OptionDeclaration[]>
  )[];
  readonly help: {
    readonly after?: string | LayerLoader<string>;
  };
  /**
   * The group's subcommands and the loaders of those known only once loaded, in
   * the order routing tries them.
   */
  readonly subcommands: readonly (CommandDeclaration | CommandLoader)[];
  readonly printers?: ScenarioPrinters;
  /**
   * Whether a run chains several invocations of the command separated by `--next`,
   * its action receiving them all.
   */
  readonly chain: boolean;
  action?(): Promise<unknown>;
  parse?(...parameters: unknown[]): readonly unknown[];
}
