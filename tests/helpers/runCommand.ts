import { Command } from "@commander-js/extra-typings";

import type { CommandDefinition } from "#support/commander/types/CommandDefinition";

export async function runCommand(
  definition: CommandDefinition,
  ...args: string[]
) {
  await definition(new Command()).parseAsync(args, {
    from: "user",
  });
}
