import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { entries, freeze } from "@auaust/toolkit/object";

import { commandRegistration } from "#workflows/cli/constants";
import { configureCommand } from "#workflows/cli/operations/configureCommand";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

type GroupEntry =
  | CommandDefinition
  | {
      readonly command: CommandDefinition;
      readonly aliases: readonly string[];
    };

export function defineGroup({
  configure,
  commands,
  command: own,
}: {
  configure?(command: Command): CommandUnknownOpts;
  commands: Readonly<Record<string, GroupEntry>>;
  command?: CommandDefinition;
}): CommandDefinition {
  return freeze({
    [commandRegistration](command: Command) {
      if (configure !== undefined) {
        configureCommand(command, configure);
      }

      for (const [name, entry] of entries(commands)) {
        const { command: definition, aliases = [] } =
          "command" in entry ? entry : { command: entry };

        const subcommand = new Command(name).aliases(aliases);

        definition[commandRegistration](subcommand);
        command.addCommand(subcommand);
      }

      own?.[commandRegistration](command);
    },
  });
}
