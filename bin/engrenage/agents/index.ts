import sync from "#bin/engrenage/agents/sync";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export default defineCommand((command) => {
  return registerSubcommands(
    command.description(
      "Manage agent instructions shared through @auaust/engrenage.",
    ),
    {
      sync,
    },
  );
});
