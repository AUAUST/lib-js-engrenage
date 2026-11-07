import { apis } from "#scripts/codegen/apis";
import { barrels } from "#scripts/codegen/barrels";
import { config } from "#scripts/codegen/config";
import { editions } from "#scripts/codegen/editions";
import { rules } from "#scripts/codegen/rules";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerSubcommands } from "#workflows/cli/operations/registerSubcommands";

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

export { collectConfigInputs } from "#scripts/codegen/operations/collectConfigInputs";
export { parseEditionLibrary } from "#scripts/codegen/operations/parseEditionLibrary";
export { readEditionCompat } from "#scripts/codegen/operations/readEditionCompat";
export { createApiDeclarationCollector } from "#scripts/codegen/utils/createApiDeclarationCollector";
export { findConfigTypeImports } from "#scripts/codegen/utils/findConfigTypeImports";
