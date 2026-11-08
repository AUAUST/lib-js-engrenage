import { createProgram, type CommandDefinition } from "#workflows/cli/index";

export async function runDefinition(
  definition: CommandDefinition,
  ...args: string[]
) {
  await createProgram("program", definition).parseAsync(args, {
    from: "user",
  });
}
