import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { configureCommand } from "#nexus/cli/operations/configureCommand";
import { createGroupDefinition } from "#nexus/cli/operations/createGroupDefinition";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { GroupEntry } from "#nexus/cli/types/GroupEntry";

/**
 * Defines a command group registering `commands` under their names and aliases,
 * `configure` and `command` applying to the group itself, and a help command
 * loading the extensions of the commands it describes when the group has no
 * command of its own.
 *
 * @pure
 */
export function defineGroup({
  configure,
  commands,
  command,
}: {
  configure?(command: Command): CommandUnknownOpts;
  commands: Readonly<Record<string, GroupEntry>>;
  command?: CommandDefinition;
}): CommandDefinition {
  return createGroupDefinition({
    declare: (
      configure &&
      ((group) => {
        configureCommand(group, configure);
      })
    ),
    commands,
    command,
  });
}
