import { defineGroup, type CommandDefinition } from "#nexus/cli/index";
import { runDefinition } from "#tests/utils/runDefinition";

export function runCommand(
  name: string,
  command: CommandDefinition,
  ...args: string[]
): ReturnType<typeof runDefinition> {
  return runDefinition(
    defineGroup({
      commands: { [name]: command },
    }),
    name,
    ...args,
  );
}
