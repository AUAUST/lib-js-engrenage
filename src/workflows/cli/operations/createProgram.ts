import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { commandRegistration } from "#workflows/cli/constants";
import { addDebugOption } from "#workflows/cli/operations/addDebugOption";
import { forwardingCommands } from "#workflows/cli/operations/forwardingCommands";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

function addDebugOptions(command: CommandUnknownOpts) {
  if (forwardingCommands.has(command)) {
    return;
  }

  addDebugOption(command);

  for (const subcommand of command.commands) {
    addDebugOptions(subcommand);
  }
}

export function createProgram(
  name: string,
  definition: CommandDefinition,
): Command {
  const program = new Command(name);

  definition[commandRegistration](program);
  addDebugOptions(program);

  return program;
}
