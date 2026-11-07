/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#workflows/cli/operations/defineCommand";

export const apis = defineCommand((command) => {
  return command
    .description(
      "Generate the src.apis declaration groups from the lib.dom.d.ts of TypeScript.",
    )
    .argument("[groups...]", "groups to generate (all by default)")
    .option("--check", "report outdated groups without writing them", false)
    .action(async (groups, { check }) => {
      const { loadValidatedConfig } =
        await import("#workflows/config/operations/loadValidatedConfig");

      const { generateApiDeclarations } =
        await import("#scripts/codegen/operations/generateApiDeclarations");

      const { settleChanges } =
        await import("#workflows/cli/operations/settleChanges");

      const config = await loadValidatedConfig();

      await generateApiDeclarations(config, groups);

      await settleChanges(config, {
        check,
      });
    });
});
