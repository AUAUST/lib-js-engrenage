import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { entries, freeze } from "@auaust/toolkit/object";

import {
  commandExtension,
  commandForwarding,
  commandRegistration,
} from "#nexus/cli/constants";
import { addRunOptions } from "#nexus/cli/operations/addRunOptions";
import { configureCommand } from "#nexus/cli/operations/configureCommand";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";

type GroupEntry =
  | CommandDefinition
  | {
      readonly command: CommandDefinition;
      readonly aliases: readonly string[];
    };

type Extensions = ReadonlyMap<CommandUnknownOpts, () => Promise<void>>;

const helpCommandName = "help";

function describePath(command: CommandUnknownOpts): string {
  const names: string[] = [];

  for (
    let current: CommandUnknownOpts | null = command;
    current !== null;
    current = current.parent
  ) {
    names.unshift(current.name());
  }

  return names.join(" ");
}

function rejectUnknown(command: CommandUnknownOpts, name: string): never {
  return command.error(
    `error: unknown command '${name}' in '${describePath(command)}'`,
    { code: "commander.unknownCommand" },
  );
}

function findCommand(
  command: CommandUnknownOpts,
  name: string,
): CommandUnknownOpts {
  return (
    command.commands.find((candidate) => {
      return candidate.name() === name || candidate.aliases().includes(name);
    }) ?? rejectUnknown(command, name)
  );
}

// @debt a group with its own command mounts no help command, so its commands' extensions stay unloaded in a help reaching them through it
async function showHelp(
  command: CommandUnknownOpts,
  names: readonly string[],
): Promise<never> {
  const [name, ...rest] = names;

  if (name === undefined) {
    return command.help();
  }

  const help = command.commands.find((candidate) => {
    return candidate.name() === helpCommandName;
  });

  if (help === undefined) {
    return showHelp(findCommand(command, name), rest);
  }

  await help.parseAsync(names, { from: "user" });

  throw new Error(`The help of ${describePath(command)} printed nothing`);
}

// @debt reaches a nested group's extensions by parsing that group's own help command, found by name, since each group keeps its extensions to itself
function createHelpCommand(
  command: CommandUnknownOpts,
  extensions: Extensions,
): CommandUnknownOpts {
  return new Command(helpCommandName)
    .argument("[command...]")
    .description("display help for command")
    .action(async ([name, ...rest]) => {
      if (name === undefined) {
        command.help();
      }

      const subcommand = findCommand(command, name);

      await extensions.get(subcommand)?.();

      await showHelp(subcommand, rest);
    });
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
        const {
          command: definition,
          aliases = [],
        } = "command" in entry ? entry : { command: entry };

        const subcommand = new Command(name).aliases(aliases);

        definition[commandRegistration](subcommand);

        if (definition[commandForwarding] !== true) {
          addRunOptions(subcommand);
        }

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
