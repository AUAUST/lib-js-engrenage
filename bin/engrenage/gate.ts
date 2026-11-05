import { Option } from "@commander-js/extra-typings";

import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { runGate } from "#workflows/gate/index";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

export const gate = defineCommand((command) => {
  return command
    .addOption(
      new Option(
        "--staged",
        "fix and check the staged files, and stage the fixes (default)",
      ).conflicts("worktree"),
    )
    .addOption(
      new Option(
        "--worktree",
        "fix and check the changes against HEAD and the untracked files",
      ).conflicts("staged"),
    )
    .action(async ({ worktree }) => {
      const config = await loadConfig();

      const failures = await runGate(config, {
        mode: worktree === true ? "worktree" : "staged",
      });

      for (const { step, output } of failures) {
        console.error(`${step}\n${output.trimEnd()}\n`);
      }

      if (failures.length > 0) {
        process.exitCode = 1;
      }
    });
});
