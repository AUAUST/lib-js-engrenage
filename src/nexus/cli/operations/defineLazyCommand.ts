import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createConfiguredDefinition } from "#nexus/cli/operations/createConfiguredDefinition";
import type { Loadable } from "#foundation/modules/index";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { CommandParameters } from "#nexus/cli/types/CommandParameters";
import type { DefaultActionParameters } from "#nexus/cli/types/DefaultActionParameters";
import type { ExtendCommand } from "#nexus/cli/types/ExtendCommand";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

/**
 * Defines a command loading its action through `action` only when it runs, then
 * running it as `defineCommand` would.
 *
 * @pure
 */
export function defineLazyCommand<
  Configured,
  ActionParameters extends unknown[] | [],
>(definition: {
  configure(command: Command): Configured;
  action(): Promise<Loadable<(...parameters: ActionParameters) => unknown>>;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineLazyCommand<Configured>(definition: {
  configure(command: Command): Configured;
  action(): Promise<
    Loadable<
      (...parameters: DefaultActionParameters<NoInfer<Configured>>) => unknown
    >
  >;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
}): CommandDefinition;
export function defineLazyCommand<
  ActionParameters extends unknown[] | [],
>(definition: {
  action(): Promise<Loadable<(...parameters: ActionParameters) => unknown>>;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
  parse(...parameters: CommandParameters<Command>): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineLazyCommand(definition: {
  action(): Promise<
    Loadable<(...parameters: DefaultActionParameters<Command>) => unknown>
  >;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
}): CommandDefinition;
export function defineLazyCommand({
  configure,
  action,
  extend,
  parse,
  printers,
}: {
  configure?(command: Command): CommandUnknownOpts;
  action(): Promise<unknown>;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
  parse?(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createConfiguredDefinition({
    configure,
    load: action,
    extend,
    parse,
    printers,
  });
}
