import { Command } from "@commander-js/extra-typings";

import { commandForwarding, commandRegistration } from "#nexus/cli/constants";
import { addRunOptions } from "#nexus/cli/operations/addRunOptions";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";

// @debt the root definition's `commandExtension` never runs, since only `defineGroup` applies extensions before parsing; tests wrap a command in a group to reach its extended options
export function createProgram(
  name: string,
  definition: CommandDefinition,
): Command {
  const program = new Command(name);

  definition[commandRegistration](program);

  if (definition[commandForwarding] !== true) {
    addRunOptions(program);
  }

  return program;
}
