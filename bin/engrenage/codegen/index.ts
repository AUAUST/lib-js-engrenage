import barrels from "#bin/engrenage/codegen/barrels";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export default defineCommand((command) => {
  return registerSubcommands(
    command.description("Generate code from the project's configuration."),
    {
      barrels,
    },
  );
});
