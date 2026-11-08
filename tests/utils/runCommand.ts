import { Command } from "@commander-js/extra-typings";

import type { LegacyCommandDefinition } from "#workflows/cli/types/LegacyCommandDefinition";

export async function runCommand(
  definition: LegacyCommandDefinition,
  ...args: string[]
) {
  await definition(new Command()).parseAsync(args, {
    from: "user",
  });
}
