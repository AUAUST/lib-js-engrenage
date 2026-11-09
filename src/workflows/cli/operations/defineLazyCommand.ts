import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createCommandDefinition } from "#workflows/cli/operations/createCommandDefinition";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";
import type { CommandParameters } from "#workflows/cli/types/CommandParameters";
import type { DefaultActionParameters } from "#workflows/cli/types/DefaultActionParameters";
import type { ExtendModule } from "#workflows/cli/types/ExtendModule";

type ActionModule<ActionParameters extends unknown[]> =
  | ((...parameters: ActionParameters) => unknown)
  | { default(...parameters: ActionParameters): unknown };

export function defineLazyCommand<
  Configured,
  ActionParameters extends unknown[] | [],
>(definition: {
  configure(command: Command): Configured;
  action(): Promise<ActionModule<ActionParameters>>;
  extend?(): Promise<ExtendModule>;
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineLazyCommand<Configured>(definition: {
  configure(command: Command): Configured;
  action(): Promise<ActionModule<DefaultActionParameters<NoInfer<Configured>>>>;
  extend?(): Promise<ExtendModule>;
}): CommandDefinition;
export function defineLazyCommand<
  ActionParameters extends unknown[] | [],
>(definition: {
  action(): Promise<ActionModule<ActionParameters>>;
  extend?(): Promise<ExtendModule>;
  parse(...parameters: CommandParameters<Command>): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineLazyCommand(definition: {
  action(): Promise<ActionModule<DefaultActionParameters<Command>>>;
  extend?(): Promise<ExtendModule>;
}): CommandDefinition;
export function defineLazyCommand({
  configure,
  action,
  extend,
  parse,
}: {
  configure?(command: Command): CommandUnknownOpts;
  action(): Promise<unknown>;
  extend?(): Promise<ExtendModule>;
  parse?(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createCommandDefinition({
    configure,
    load: action,
    extend,
    parse,
  });
}
