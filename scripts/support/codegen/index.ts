import { apis } from "#scripts/support/codegen/apis";
import { barrels } from "#scripts/support/codegen/barrels";
import { rules } from "#scripts/support/codegen/rules";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export const codegen = defineCommand((command) => {
  const parent = registerSubcommands(
    command
      .description(
        "Generate sources of the package from its tooling, running every generator without a subcommand.",
      )
      .enablePositionalOptions()
      .option("--check", "report outdated files without writing them", false),
    {
      apis,
      rules,
      barrels,
    },
  );

  return parent.action(async ({ check }) => {
    for (const subcommand of parent.commands) {
      await subcommand.parseAsync(check ? ["--check"] : [], {
        from: "user",
      });
    }
  });
});
