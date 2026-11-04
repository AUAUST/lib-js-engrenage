import { upgrade } from "#bin/engrenage/pnpm/upgrade";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerSubcommands } from "#workflows/cli/operations/registerSubcommands";

export const pnpm = defineCommand((command) => {
  return registerSubcommands(
    command.description("Manage the pnpm version of the project."),
    {
      upgrade,
    },
  );
});
