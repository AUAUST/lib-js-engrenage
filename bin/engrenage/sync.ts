import { Argument } from "@commander-js/extra-typings";

import { keys } from "@auaust/toolkit/object";

import { syncAgentFiles } from "#agents/utils/syncAgentFiles";
import { syncChangesetConfig } from "#changesets/utils/syncChangesetConfig";
import { loadConfig } from "#config/utils/loadConfig";
import { syncGitignoreFile } from "#git/utils/syncGitignoreFile";
import { syncWorkflowFiles } from "#github/utils/syncWorkflowFiles";
import { syncPrettierignoreFile } from "#prettier/utils/syncPrettierignoreFile";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { reportSyncResults } from "#support/commander/utils/reportSyncResults";
import { syncVscodeFiles } from "#vscode/utils/syncVscodeFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

const targets = {
  agents: syncAgentFiles,
  changesets: syncChangesetConfig,
  gitignore: syncGitignoreFile,
  prettierignore: syncPrettierignoreFile,
  vscode: syncVscodeFiles,
  workflows: syncWorkflowFiles,
};

export function runSync({
  config,
  names = keys(targets),
  check = false,
}: {
  config: ResolvedConfig;
  names?: ReadonlyArray<keyof typeof targets>;
  check?: boolean;
}) {
  for (const name of names) {
    reportSyncResults(
      targets[name]({
        config,
        check,
      }),
    );
  }
}

export default defineCommand((command) => {
  return command
    .description(
      "Update the existing project files that engrenage derives from the config. `engrenage init` creates missing ones.",
    )
    .addArgument(
      new Argument("[targets...]", "targets to sync (all by default)").choices(
        keys(targets),
      ),
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async (selected, { check }) => {
      const config = await loadConfig();

      runSync({
        config,
        names: selected.length === 0 ? keys(targets) : selected,
        check,
      });
    });
});
