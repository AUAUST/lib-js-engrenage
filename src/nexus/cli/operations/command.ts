import { freeze } from "@auaust/toolkit/object";

import type { Loadable } from "#foundation/modules/index";
import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandInvocation } from "#nexus/cli/types/CommandInvocation";
import type { DeclaredParameters } from "#nexus/cli/types/DeclaredParameters";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

type OptionEntry =
  | OptionDeclaration
  | LayerLoader<readonly OptionDeclaration[]>;

interface CommandInput<
  Arguments extends readonly ArgumentDeclaration[],
  Options extends readonly OptionEntry[],
> {
  readonly name: string;
  readonly aliases?: readonly string[];
  readonly description?: string;
  readonly version?: string;
  readonly arguments?: Arguments;
  readonly options?: Options;
  readonly help?: {
    readonly after?: string | LayerLoader<string>;
  };
  readonly subcommands?: readonly CommandDeclaration[];
  readonly printers?: ScenarioPrinters;
}

/**
 * Declares a command running the action `action` loads, or a group of
 * `subcommands` running it when no subcommand is named. The action receives the
 * parameters `parse` maps from the declared values and the invocation, else the
 * declared values themselves: each argument's, then the options' keyed by name
 * when any is declared. An `options` element is an option, or a loader of the
 * options known only at run time; loaders, those of argument choices and of
 * `help.after` included, run before the command parses or shows its help.
 *
 * With `chain`, a call chains several invocations separated by `--next` arguments
 * before any `--`, and the action receives every invocation's parsed parameters
 * in order once all of them parse.
 *
 * @pure
 */
// @debt a `parse` must name every parameter, the invocation included, since `NoInfer` around its whole parameter tuple keeps TypeScript from accepting a shorter list
// @debt `chain` stays per command until the program chains any command
export function command<
  const Arguments extends readonly ArgumentDeclaration[] = [],
  const Options extends readonly OptionEntry[] = [],
  ActionParameters extends unknown[] | [] = [],
>(
  input: Omit<CommandInput<Arguments, Options>, "subcommands"> & {
    chain: true;
    action(): Promise<
      Loadable<(invocations: readonly ActionParameters[]) => unknown>
    >;
    parse(
      ...parameters: NoInfer<
        [...DeclaredParameters<Arguments, Options>, CommandInvocation]
      >
    ): NoInfer<ActionParameters>;
  },
): ParsingCommandDeclaration;
export function command<
  const Arguments extends readonly ArgumentDeclaration[] = [],
  const Options extends readonly OptionEntry[] = [],
  ActionParameters extends unknown[] | [] = [],
>(
  input: CommandInput<Arguments, Options> & {
    action(): Promise<Loadable<(...parameters: ActionParameters) => unknown>>;
    parse(
      ...parameters: NoInfer<
        [...DeclaredParameters<Arguments, Options>, CommandInvocation]
      >
    ): NoInfer<ActionParameters>;
  },
): ParsingCommandDeclaration;
export function command<
  const Arguments extends readonly ArgumentDeclaration[] = [],
  const Options extends readonly OptionEntry[] = [],
>(
  input: CommandInput<Arguments, Options> & {
    action?(): Promise<
      Loadable<
        (
          ...parameters: NoInfer<DeclaredParameters<Arguments, Options>>
        ) => unknown
      >
    >;
  },
): ParsingCommandDeclaration;
export function command({
  name,
  aliases = [],
  description,
  version,
  arguments: declared = [],
  options = [],
  help = {},
  subcommands = [],
  printers,
  chain = false,
  action,
  parse,
}: CommandInput<readonly ArgumentDeclaration[], readonly OptionEntry[]> & {
  chain?: boolean;
  action?(): Promise<unknown>;
  parse?(...parameters: unknown[]): readonly unknown[];
}): ParsingCommandDeclaration {
  if (action === undefined && subcommands.length === 0) {
    throw new TypeError(
      `The ${name} command declares neither an action nor subcommands`,
    );
  }

  return freeze({
    kind: "parsing",
    name,
    aliases: freeze([...aliases]),
    ...(description !== undefined && { description }),
    ...(version !== undefined && { version }),
    arguments: freeze([...declared]),
    options: freeze([...options]),
    help: freeze({ ...help }),
    subcommands: freeze([...subcommands]),
    ...(printers !== undefined && { printers }),
    chain,
    ...(action !== undefined && { action }),
    ...(parse !== undefined && { parse }),
  });
}
