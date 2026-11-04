import { upgrade } from "#bin/engrenage/pnpm/upgrade";
import { defineCommand } from "#cli/operations/defineCommand";
import { registerSubcommands } from "#cli/operations/registerSubcommands";

export const pnpm = defineCommand((command) => {
  return registerSubcommands(
    command.description("Manage the pnpm version of the project."),
    {
      upgrade,
    },
  );
});
