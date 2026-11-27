import { Command } from "@commander-js/extra-typings";

import { commandForwarding, commandRegistration } from "#nexus/cli/constants";
import { addRunOptions } from "#nexus/cli/operations/addRunOptions";
import { compileCommand } from "#nexus/cli/operations/compileCommand";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";

// @debt the root definition's `commandExtension` never runs, since only a group applies extensions before parsing; tests wrap a command in a group to reach its loaded options
/**
 * Creates the program running a root command declaration under its name.
 */
export function createProgram(declaration: CommandDeclaration): Command {
  const definition = compileCommand(declaration);

  const program = new Command(declaration.name);

  definition[commandRegistration](program);

  if (definition[commandForwarding] !== true) {
    addRunOptions(program);
  }

  return program;
}
