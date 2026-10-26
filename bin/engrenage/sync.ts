import { Argument } from "@commander-js/extra-typings";

import { keys } from "@auaust/toolkit/object";

import { syncAgentFiles } from "#agents/utils/syncAgentFiles";
import { syncChangesetConfig } from "#changesets/utils/syncChangesetConfig";
import { loadConfig } from "#config/utils/loadConfig";
import { syncGitignoreFile } from "#git/utils/syncGitignoreFile";
import { syncPrettierignoreFile } from "#prettier/utils/syncPrettierignoreFile";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { reportSyncResults } from "#support/commander/utils/reportSyncResults";
import { syncVscodeFiles } from "#vscode/utils/syncVscodeFiles";

const targets = {
  agents: syncAgentFiles,
  changesets: syncChangesetConfig,
  gitignore: syncGitignoreFile,
  prettierignore: syncPrettierignoreFile,
  vscode: syncVscodeFiles,
};

export default defineCommand((command) => {
  return command
    .description(
      "Sync the project files that engrenage derives from the config.",
    )
    .addArgument(
      new Argument("[targets...]", "targets to sync (all by default)").choices(
        keys(targets),
      ),
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async (selected, { check }) => {
      const config = await loadConfig();

      const names = selected.length === 0 ? keys(targets) : selected;

      for (const name of names) {
        reportSyncResults(
          targets[name]({
            config,
            check,
          }),
        );
      }
    });
});
