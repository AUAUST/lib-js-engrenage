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
   * The output scenario a run invoking the command or one below it prints for
   * when `--output` names none, instead of the detected one.
   */
  readonly scenario?: string;
  /**
   * Whether a run may chain an invocation of the command with others through
   * `--next`; `false` also makes every command below the group unchainable.
   */
  readonly chainable: boolean;
  action?(): Promise<unknown>;
  parse?(...parameters: unknown[]): readonly unknown[];
}
