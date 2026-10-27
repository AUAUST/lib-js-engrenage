import { barrels } from "#scripts/support/codegen/barrels";
import { rules } from "#scripts/support/codegen/rules";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export const codegen = defineCommand((command) => {
  return registerSubcommands(
    command.description("Generate sources of the package from its tooling."),
    {
      barrels,
      rules,
    },
  );
});
