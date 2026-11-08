import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createCommandDefinition } from "#workflows/cli/operations/createCommandDefinition";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";
import type { CommandParameters } from "#workflows/cli/types/CommandParameters";

type ActionModule<ActionParameters extends unknown[]> =
  | ((...parameters: ActionParameters) => unknown)
  | { default(...parameters: ActionParameters): unknown };

export function defineLazyCommand<
  Configured,
  ActionParameters extends unknown[] | [],
>(definition: {
  configure(command: Command): Configured;
  action(): Promise<ActionModule<ActionParameters>>;
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineLazyCommand<Configured>(definition: {
  configure(command: Command): Configured;
  action(): Promise<ActionModule<CommandParameters<NoInfer<Configured>>>>;
}): CommandDefinition;
export function defineLazyCommand({
  configure,
  action,
  parse,
}: {
  configure(command: Command): CommandUnknownOpts;
  action(): Promise<unknown>;
  parse?(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createCommandDefinition({
    configure,
    load: action,
    parse,
  });
}
