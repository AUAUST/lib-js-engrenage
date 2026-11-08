import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { entries, freeze } from "@auaust/toolkit/object";

import { commandRegistration } from "#workflows/cli/constants";
import { configureCommand } from "#workflows/cli/operations/configureCommand";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";
import type { CommandParameters } from "#workflows/cli/types/CommandParameters";

type GroupEntry =
  | CommandDefinition
  | {
      readonly command: CommandDefinition;
      readonly aliases: readonly string[];
    };

export function defineGroup<Configured = Command>(definition: {
  configure?(command: Command): Configured;
  commands: Readonly<Record<string, GroupEntry>>;
  action?(...parameters: CommandParameters<NoInfer<Configured>>): unknown;
}): CommandDefinition;
export function defineGroup({
  configure,
  commands,
  action,
}: {
  configure?(command: Command): CommandUnknownOpts;
  commands: Readonly<Record<string, GroupEntry>>;
  action?(...parameters: unknown[]): unknown;
}): CommandDefinition {
  return freeze({
    [commandRegistration](command: Command) {
      const configured =
        configure === undefined
          ? command
          : configureCommand(command, configure);

      for (const [name, entry] of entries(commands)) {
        const { command: definition, aliases = [] } =
          "command" in entry ? entry : { command: entry };

        const subcommand = new Command(name).aliases(aliases);

        definition[commandRegistration](subcommand);
        configured.addCommand(subcommand);
      }

      if (action !== undefined) {
        configured.action(async (...parameters) => {
          await action(...parameters);
        });
      }
    },
  });
}
