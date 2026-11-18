import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { commandRegistration } from "#workflows/cli/constants";
import { addRunOptions } from "#workflows/cli/operations/addRunOptions";
import { forwardingCommands } from "#workflows/cli/operations/forwardingCommands";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

function addAllRunOptions(command: CommandUnknownOpts) {
  if (forwardingCommands.has(command)) {
    return;
  }

  addRunOptions(command);

  for (const subcommand of command.commands) {
    addAllRunOptions(subcommand);
  }
}

// @debt the root definition's `commandExtension` never runs, since only `defineGroup` applies extensions before parsing; tests wrap a command in a group to reach its extended options
export function createProgram(
  name: string,
  definition: CommandDefinition,
): Command {
  const program = new Command(name);

  definition[commandRegistration](program);
  addAllRunOptions(program);

  return program;
}
