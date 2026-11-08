import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createCommandDefinition } from "#workflows/cli/operations/createCommandDefinition";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";
import type { CommandParameters } from "#workflows/cli/types/CommandParameters";

export function defineCommand<
  Configured,
  ActionParameters extends unknown[] | [],
>(definition: {
  configure(command: Command): Configured;
  action(...parameters: ActionParameters): unknown;
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineCommand<Configured>(definition: {
  configure(command: Command): Configured;
  action(...parameters: CommandParameters<NoInfer<Configured>>): unknown;
}): CommandDefinition;
export function defineCommand({
  configure,
  action,
  parse,
}: {
  configure(command: Command): CommandUnknownOpts;
  action(...parameters: unknown[]): unknown;
  parse?(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createCommandDefinition({
    configure,
    load: () => action,
    parse,
  });
}
