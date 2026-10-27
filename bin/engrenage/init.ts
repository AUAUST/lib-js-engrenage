import { spawnSync } from "node:child_process";

import { createAgentsStep } from "#agents/setup/createAgentsStep";
import { createClaudeStep } from "#agents/setup/createClaudeStep";
import { runSync } from "#bin/engrenage/sync";
import { createChangesetConfigStep } from "#changesets/setup/createChangesetConfigStep";
import { createConfigFileStep } from "#config/setup/createConfigFileStep";
import { createDependencyStep } from "#config/setup/createDependencyStep";
import { loadConfig } from "#config/utils/loadConfig";
import { readConfig } from "#config/utils/readConfig";
import { createEslintConfigStep } from "#eslint/setup/createEslintConfigStep";
import { createGitignoreStep } from "#git/setup/createGitignoreStep";
import { createScriptsStep } from "#github/setup/createScriptsStep";
import { createWorkflowsStep } from "#github/setup/createWorkflowsStep";
import { createWorkspaceStep } from "#pnpm/setup/createWorkspaceStep";
import { createPrettierignoreStep } from "#prettier/setup/createPrettierignoreStep";
import { createPrettierStep } from "#prettier/setup/createPrettierStep";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { reportSyncResults } from "#support/commander/utils/reportSyncResults";
import { settleChanges } from "#support/commander/utils/settleChanges";
import { runSteps } from "#support/scaffold/utils/runSteps";
import { createTsdownConfigStep } from "#tsdown/setup/createTsdownConfigStep";
import { createVscodeExtensionsStep } from "#vscode/setup/createVscodeExtensionsStep";
import { createVscodeSettingsStep } from "#vscode/setup/createVscodeSettingsStep";
import type { Invocation } from "#support/scaffold/types/Invocation";
import type { Directory } from "#types/Directory";

function describe({ command, args }: Invocation): string {
  return [command, ...args].join(" ");
}

function invokeCommand(root: Directory, invocation: Invocation) {
  const { status, error } = spawnSync(invocation.command, invocation.args, {
    cwd: root,
    stdio: "inherit",
  });

  if (error !== undefined) {
    throw new Error(`Cannot run ${describe(invocation)}`, {
      cause: error,
    });
  }

  if (status !== 0) {
    throw new Error(`${describe(invocation)} exited with code ${status}`);
  }
}

export default defineCommand((command) => {
  return command
    .description(
      "Set up engrenage in the project, or add the pieces it is missing.",
    )
    .option("-y, --yes", "accept every step without asking", false)
    .action(async ({ yes }) => {
      const config = await loadConfig();

      const invocations = await runSteps({
        config,
        yes,
        steps: [
          createDependencyStep(),
          createWorkspaceStep(),
          createConfigFileStep(),
          createPrettierStep(),
          createPrettierignoreStep(),
          createGitignoreStep(),
          createEslintConfigStep(),
          createTsdownConfigStep(),
          createAgentsStep(),
          createClaudeStep(),
          createChangesetConfigStep(),
          createScriptsStep(),
          createWorkflowsStep(),
          createVscodeExtensionsStep(),
          createVscodeSettingsStep(),
        ],
      });

      if (invocations === undefined) {
        return;
      }

      reportSyncResults(config.filesystem.flush());

      for (const invocation of invocations) {
        if (yes && invocation.interactive) {
          console.info(`Run ${describe(invocation)} to finish the setup.`);
        } else {
          invokeCommand(config.root, invocation);
        }
      }

      const installed = await readConfig(config.root);

      runSync(installed);

      settleChanges(installed, {
        check: false,
      });
    });
});
