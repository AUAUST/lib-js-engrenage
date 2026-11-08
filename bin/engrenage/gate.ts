import { Option } from "@commander-js/extra-typings";

import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { runGate, runMessageGate } from "#workflows/gate/index";
import { formatGateEntry } from "#workflows/gate/utils/formatGateEntry";

export const gate = defineLegacyCommand((command) => {
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
    .addOption(
      new Option(
        "--message <file>",
        "check only the commit message stored in a file",
      ).conflicts(["staged", "worktree", "everyone"]),
    )
    .action(async ({ worktree, everyone, message }) => {
      const { failures, warnings } =
        message === undefined
          ? await runGate(await loadValidatedConfig(), {
              mode: worktree === true ? "worktree" : "staged",
              audience: everyone === true ? "everyone" : "agents",
            })
          : await runMessageGate(message);

      for (const warning of warnings) {
        console.warn(formatGateEntry(warning));
      }

      for (const failure of failures) {
        console.error(formatGateEntry(failure));
      }

      if (failures.length > 0) {
        process.exitCode = 1;
      }
    });
});
