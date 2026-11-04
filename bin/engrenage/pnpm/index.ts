import { upgrade } from "#bin/engrenage/pnpm/upgrade";
import { defineCommand } from "#cli/utils/defineCommand";
import { registerSubcommands } from "#cli/utils/registerSubcommands";

export const pnpm = defineCommand((command) => {
  return registerSubcommands(
    command.description("Manage the pnpm version of the project."),
    {
      upgrade,
    },
  );
});
