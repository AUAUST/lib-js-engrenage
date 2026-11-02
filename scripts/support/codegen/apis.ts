/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#support/commander/utils/defineCommand";

export const apis = defineCommand((command) => {
  return command
    .description(
      "Generate the src.apis declaration groups from the lib.dom.d.ts of TypeScript.",
    )
    .argument("[groups...]", "groups to generate (all by default)")
    .option("--check", "report outdated groups without writing them", false)
    .action(async (groups, { check }) => {
      const { loadConfig } = await import("#config/utils/loadConfig");

      const { syncApiDeclarations } =
        await import("#typescript/utils/syncApiDeclarations");

      const { settleChanges } =
        await import("#support/commander/utils/settleChanges");

      const config = await loadConfig();

      await syncApiDeclarations(config, groups);

      settleChanges(config, {
        check,
      });
    });
});
