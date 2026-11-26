import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createCommandDefinition } from "#nexus/cli/operations/createCommandDefinition";
import type { Loadable } from "#foundation/modules/index";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { CommandParameters } from "#nexus/cli/types/CommandParameters";
import type { DefaultActionParameters } from "#nexus/cli/types/DefaultActionParameters";
import type { ExtendCommand } from "#nexus/cli/types/ExtendCommand";

export function defineCommand<
  Configured,
  ActionParameters extends unknown[] | [],
>(definition: {
  configure(command: Command): Configured;
  action(...parameters: ActionParameters): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineCommand<Configured>(definition: {
  configure(command: Command): Configured;
  action(...parameters: DefaultActionParameters<NoInfer<Configured>>): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
}): CommandDefinition;
export function defineCommand<
  ActionParameters extends unknown[] | [],
>(definition: {
  action(...parameters: ActionParameters): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
  parse(...parameters: CommandParameters<Command>): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineCommand(definition: {
  action(...parameters: DefaultActionParameters<Command>): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
}): CommandDefinition;
export function defineCommand({
  configure,
  action,
  extend,
  parse,
}: {
  configure?(command: Command): CommandUnknownOpts;
  action(...parameters: unknown[]): unknown;
  extend?(): Promise<Loadable<ExtendCommand>>;
  parse?(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createCommandDefinition({
    configure,
    load: () => action,
    extend,
    parse,
  });
}
