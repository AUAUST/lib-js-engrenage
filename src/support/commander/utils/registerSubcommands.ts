import type { CommandDefinition } from "#support/commander/types/CommandDefinition";
import { entries } from "@auaust/toolkit/object";
import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

export function registerSubcommands<Parent extends CommandUnknownOpts>(
  parent: Parent,
  definitions: Record<string, CommandDefinition>,
): Parent {
  for (const [name, define] of entries(definitions)) {
    parent.addCommand(define(new Command(name)));
  }

  return parent;
}
