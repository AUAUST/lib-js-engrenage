import barrels from "#bin/support/codegen/barrels";
import rules from "#bin/support/codegen/rules";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export default defineCommand((command) => {
  return registerSubcommands(
    command.description("Generate sources of the package from its tooling."),
    {
      barrels,
      rules,
    },
  );
});
