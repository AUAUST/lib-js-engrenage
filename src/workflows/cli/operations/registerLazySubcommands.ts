import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { entries } from "@auaust/toolkit/object";

import type { LazyCommand } from "#workflows/cli/types/LazyCommand";

interface PendingCommand {
  command: Command;
  load: LazyCommand["load"];
}

// @debt `engrenage help <name>` prints the help of a subcommand without loading it, because Commander's help command skips the `preSubcommand` hook; only `<name> --help` shows its options.
export function registerLazySubcommands<Parent extends CommandUnknownOpts>(
  parent: Parent,
  subcommands: Record<string, LazyCommand>,
): Parent {
  const pending = new Map<CommandUnknownOpts, PendingCommand>();

  for (const [name, { description, aliases = [], load }] of entries(
    subcommands,
  )) {
    const command = new Command(name).description(description).aliases(aliases);

    parent.addCommand(command);
    pending.set(command, { command, load });
  }

  parent.hook("preSubcommand", async (_parent, subcommand) => {
    const entry = pending.get(subcommand);

    if (entry === undefined) {
      return;
    }

    pending.delete(subcommand);

    const define = await entry.load();

    if (define(entry.command) !== entry.command) {
      throw new Error(
        `The definition of the ${subcommand.name()} command must configure the command it receives instead of returning another one`,
      );
    }

    // @debt Commander saves the parse state of a subcommand before its `preSubcommand` hook runs, so the state is saved again here once the definition adds its options; it relies on Commander's dispatch order and skips its lone negated option defaults.
    entry.command.saveStateBeforeParse();
  });

  return parent;
}
