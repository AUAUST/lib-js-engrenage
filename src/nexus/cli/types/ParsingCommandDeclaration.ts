import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
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
  readonly positionalOptions: boolean;
  readonly arguments: readonly ArgumentDeclaration[];
  readonly options: readonly (
    OptionDeclaration | LayerLoader<readonly OptionDeclaration[]>
  )[];
  readonly help: {
    readonly after?: string | LayerLoader<string>;
  };
  readonly subcommands: readonly CommandDeclaration[];
  readonly printers?: ScenarioPrinters;
  /**
   * Whether a call chains invocations separated by `--next`, its action
   * receiving them all.
   */
  readonly chain: boolean;
  action?(): Promise<unknown>;
  parse?(...parameters: unknown[]): readonly unknown[];
}
