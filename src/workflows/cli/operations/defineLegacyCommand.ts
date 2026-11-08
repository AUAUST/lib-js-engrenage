import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { addDebugOption } from "#workflows/cli/operations/addDebugOption";
import type { LegacyCommandDefinition } from "#workflows/cli/types/LegacyCommandDefinition";

// @debt the existing-option check guards against registering --debug twice when nested definitions both pass through defineLegacyCommand, instead of one owner registering it once
function addDebugOptions(command: CommandUnknownOpts) {
  if (!command.options.some(({ long }) => long === "--debug")) {
    addDebugOption(command);
  }

  for (const subcommand of command.commands) {
    addDebugOptions(subcommand);
  }
}

// @debt the definer bin keeps until its commands move to `defineCommand` and `defineLazyCommand` (#328)
export function defineLegacyCommand(
  definition: LegacyCommandDefinition,
): LegacyCommandDefinition {
  return (command) => {
    const defined = definition(command);

    addDebugOptions(defined);

    return defined;
  };
}
