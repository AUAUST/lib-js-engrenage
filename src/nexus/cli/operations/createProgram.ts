import { Command } from "@commander-js/extra-typings";

import { isString } from "@auaust/toolkit";

import { commandForwarding, commandRegistration } from "#nexus/cli/constants";
import { addRunOptions } from "#nexus/cli/operations/addRunOptions";
import { compileCommand } from "#nexus/cli/operations/compileCommand";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";

// @debt the root definition's `commandExtension` never runs, since only a group applies extensions before parsing; tests wrap a command in a group to reach its extended options
/**
 * Creates the program running a root command declaration under its name, or a
 * definition under `name`.
 */
export function createProgram(declaration: CommandDeclaration): Command;
export function createProgram(
  name: string,
  definition: CommandDefinition,
): Command;
export function createProgram(
  ...[root, defined]:
    | [declaration: CommandDeclaration]
    | [name: string, definition: CommandDefinition]
): Command {
  const [
    name,
    definition,
  ] = isString(root) ? [root, defined] : [root.name, compileCommand(root)];

  if (definition === undefined) {
    throw new TypeError(`The ${name} program has no definition`);
  }

  const program = new Command(name);

  definition[commandRegistration](program);

  if (definition[commandForwarding] !== true) {
    addRunOptions(program);
  }

  return program;
}
