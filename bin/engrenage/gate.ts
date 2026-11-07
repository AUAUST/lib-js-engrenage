import { Option } from "@commander-js/extra-typings";

import { formatBudgetFinding } from "#tools/agents/utils/formatBudgetFinding";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { runGate } from "#workflows/gate/index";
import { formatGateFailure } from "#workflows/gate/utils/formatGateFailure";

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
    .addOption(
      new Option(
        "--everyone",
        "run only the checks every commit must pass",
      ).conflicts("worktree"),
    )
    .action(async ({ worktree, everyone }) => {
      const config = await loadValidatedConfig();

      const { failures, warnings } = await runGate(config, {
        mode: worktree === true ? "worktree" : "staged",
        audience: everyone === true ? "everyone" : "agents",
      });

      for (const warning of warnings) {
        console.warn(formatBudgetFinding(warning));
      }

      for (const failure of failures) {
        console.error(formatGateFailure(failure));
      }

      if (failures.length > 0) {
        process.exitCode = 1;
      }
    });
});
