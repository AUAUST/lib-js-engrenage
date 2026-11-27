import { command, type CommandDeclaration } from "#nexus/cli/index";
import { runDefinition } from "#tests/utils/runDefinition";

export function runCommand(
  name: string,
  declaration: CommandDeclaration,
  ...args: string[]
): ReturnType<typeof runDefinition> {
  return runDefinition(
    command({ name: "program", subcommands: [declaration] }),
    name,
    ...args,
  );
}
