import { upgrade } from "#bin/engrenage/pnpm/upgrade";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export const pnpm = defineCommand((command) => {
  return registerSubcommands(
    command.description("Manage the pnpm version of the project."),
    {
      upgrade,
    },
  );
});
