import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { entries, freeze } from "@auaust/toolkit/object";

import {
  commandExtension,
  commandRegistration,
} from "#workflows/cli/constants";
import { configureCommand } from "#workflows/cli/operations/configureCommand";
import { forwardingCommands } from "#workflows/cli/operations/forwardingCommands";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

type GroupEntry =
  | CommandDefinition
  | {
      readonly command: CommandDefinition;
      readonly aliases: readonly string[];
    };

type Extensions = ReadonlyMap<CommandUnknownOpts, () => Promise<void>>;

// @debt the help command joins `forwardingCommands` only so `createProgram` gives it no --debug option, keeping its listing `help [command]`: the definition contract could state which commands take no --debug option instead
function createHelpCommand(
  command: CommandUnknownOpts,
  extensions: Extensions,
): CommandUnknownOpts {
  const help = new Command("help")
    .argument("[command]")
    .description("display help for command")
    .action(async (name) => {
      if (name === undefined) {
        command.help();
      }

      const subcommand = command.commands.find((candidate) => {
        return candidate.name() === name || candidate.aliases().includes(name);
      });

      if (subcommand === undefined) {
        command.help({ error: true });
      }

      await extensions.get(subcommand)?.();

      subcommand.help();
    });

  forwardingCommands.add(help);

  return help;
}

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

      const extensions = new Map<CommandUnknownOpts, () => Promise<void>>();

      for (const [name, entry] of entries(commands)) {
        const { command: definition, aliases = [] } =
          "command" in entry ? entry : { command: entry };

        const subcommand = new Command(name).aliases(aliases);

        definition[commandRegistration](subcommand);
        command.addCommand(subcommand);

        const extend = definition[commandExtension];

        if (extend !== undefined) {
          extensions.set(subcommand, () => extend(subcommand));
        }
      }

      command.hook(
        "preSubcommand",
        (_group, subcommand): Promise<void> | undefined => {
          return extensions.get(subcommand)?.();
        },
      );

      if (own === undefined) {
        command.helpCommand(false);
        command.addCommand(createHelpCommand(command, extensions));
      }

      own?.[commandRegistration](command);
    },
  });
}
