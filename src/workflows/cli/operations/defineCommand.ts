import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { addDebugOption } from "#workflows/cli/operations/addDebugOption";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

// @debt the existing-option check guards against registering --debug twice when nested definitions both pass through defineCommand, instead of one owner registering it once
function addDebugOptions(command: CommandUnknownOpts) {
  if (!command.options.some(({ long }) => long === "--debug")) {
    addDebugOption(command);
  }

  for (const subcommand of command.commands) {
    addDebugOptions(subcommand);
  }
}

export function defineCommand(
  definition: CommandDefinition,
): CommandDefinition {
  return (command) => {
    const defined = definition(command);

    addDebugOptions(defined);

    return defined;
  };
}
