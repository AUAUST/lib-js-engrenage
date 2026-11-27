import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createConfiguredDefinition } from "#nexus/cli/operations/createConfiguredDefinition";
import type { Loadable } from "#foundation/modules/index";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { CommandParameters } from "#nexus/cli/types/CommandParameters";
import type { DefaultActionParameters } from "#nexus/cli/types/DefaultActionParameters";
import type { ExtendCommand } from "#nexus/cli/types/ExtendCommand";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

/**
 * Defines a command running `action` with the parameters `parse` maps from
 * Commander's, or Commander's own when `configure` declares any, `extend` loading
 * what extends the command before it parses, and `printers` binding the printer
 * it prints through per scenario, the program's printer serving any other; a
 * binding loads only when its scenario resolves.
 *
 * @pure
 */
export function defineCommand<
  Configured,
  ActionParameters extends unknown[] | [],
>(definition: {
  configure(command: Command): Configured;
  action(...parameters: ActionParameters): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineCommand<Configured>(definition: {
  configure(command: Command): Configured;
  action(...parameters: DefaultActionParameters<NoInfer<Configured>>): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
}): CommandDefinition;
export function defineCommand<
  ActionParameters extends unknown[] | [],
>(definition: {
  action(...parameters: ActionParameters): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
  parse(...parameters: CommandParameters<Command>): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineCommand(definition: {
  action(...parameters: DefaultActionParameters<Command>): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
}): CommandDefinition;
export function defineCommand({
  configure,
  action,
  extend,
  parse,
  printers,
}: {
  configure?(command: Command): CommandUnknownOpts;
  action(...parameters: unknown[]): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
  parse?(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createConfiguredDefinition({
    configure,
    load: () => action,
    extend,
    parse,
    printers,
  });
}
