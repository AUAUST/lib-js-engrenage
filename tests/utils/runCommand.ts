import { runDefinition } from "#tests/utils/runDefinition";
import { defineGroup, type CommandDefinition } from "#workflows/cli/index";

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
