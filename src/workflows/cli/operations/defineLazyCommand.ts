import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createCommandDefinition } from "#workflows/cli/operations/createCommandDefinition";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";
import type { CommandParameters } from "#workflows/cli/types/CommandParameters";

type ActionModule<ActionParameters extends unknown[]> =
  | ((...parameters: ActionParameters) => unknown)
  | { default(...parameters: ActionParameters): unknown };

// @debt `configure` is required even for a command adding no arguments or options, so a group's own command passes an identity `configure` and a `parse` returning no parameters
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
