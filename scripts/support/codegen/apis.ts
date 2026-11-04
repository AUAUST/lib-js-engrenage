/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#cli/operations/defineCommand";

export const apis = defineCommand((command) => {
  return command
    .description(
      "Generate the src.apis declaration groups from the lib.dom.d.ts of TypeScript.",
    )
    .argument("[groups...]", "groups to generate (all by default)")
    .option("--check", "report outdated groups without writing them", false)
    .action(async (groups, { check }) => {
      const { loadConfig } = await import("#config/operations/loadConfig");

      const { generateApiDeclarations } =
        await import("#typescript/operations/generateApiDeclarations");

      const { settleChanges } = await import("#cli/operations/settleChanges");

      const config = await loadConfig();

      await generateApiDeclarations(config, groups);

      await settleChanges(config, {
        check,
      });
    });
});
