import {
  command,
  defineGroup,
  type CommandDeclaration,
  type CommandDefinition,
} from "#nexus/cli/index";
import { runDefinition } from "#tests/utils/runDefinition";

export function runCommand(
  name: string,
  definition: CommandDefinition | CommandDeclaration,
  ...args: string[]
): ReturnType<typeof runDefinition> {
  return runDefinition(
    "kind" in definition
      ? command({ name: "program", subcommands: [definition] })
      : defineGroup({
          commands: { [name]: definition },
        }),
    name,
    ...args,
  );
}
