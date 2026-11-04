import { defineCommand } from "#cli/utils/defineCommand";
import { registerSubcommands } from "#cli/utils/registerSubcommands";
import { apis } from "#scripts/support/codegen/apis";
import { barrels } from "#scripts/support/codegen/barrels";
import { config } from "#scripts/support/codegen/config";
import { editions } from "#scripts/support/codegen/editions";
import { rules } from "#scripts/support/codegen/rules";

export const codegen = defineCommand((command) => {
  const parent = registerSubcommands(
    command
      .description(
        "Generate sources of the package from its tooling, running every generator without a subcommand.",
      )
      .enablePositionalOptions()
      .option("--check", "report outdated files without writing them", false),
    {
      editions,
      apis,
      config,
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
