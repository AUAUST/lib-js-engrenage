import { spawnSync } from "node:child_process";

import { createClaudeSettingsStep } from "#agents/claude/setup/createClaudeSettingsStep";
import { createClaudeStep } from "#agents/claude/setup/createClaudeStep";
import { createCodexHooksStep } from "#agents/codex/setup/createCodexHooksStep";
import { createCodexStep } from "#agents/codex/setup/createCodexStep";
import { createAgentRulesStep } from "#agents/setup/createAgentRulesStep";
import { createAgentsStep } from "#agents/setup/createAgentsStep";
import { createPreferredAgentsStep } from "#agents/setup/createPreferredAgentsStep";
import { runSync } from "#bin/engrenage/sync";
import { createChangesetConfigStep } from "#changesets/setup/createChangesetConfigStep";
import { createBuildToolStep } from "#config/setup/createBuildToolStep";
import { createConfigFileStep } from "#config/setup/createConfigFileStep";
import { createDependencyStep } from "#config/setup/createDependencyStep";
import { createPackageStep } from "#config/setup/createPackageStep";
import { createScriptsStep } from "#config/setup/createScriptsStep";
import { readConfig } from "#config/utils/readConfig";
import { packageJsonFile } from "#constants";
import { createEslintConfigStep } from "#eslint/setup/createEslintConfigStep";
import { createGitignoreStep } from "#git/setup/createGitignoreStep";
import { createWorkflowsStep } from "#github/setup/createWorkflowsStep";
import { createWorkspaceStep } from "#pnpm/setup/createWorkspaceStep";
import { createPrettierignoreStep } from "#prettier/setup/createPrettierignoreStep";
import { createPrettierStep } from "#prettier/setup/createPrettierStep";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { reportSyncResults } from "#support/commander/utils/reportSyncResults";
import { settleChanges } from "#support/commander/utils/settleChanges";
import { createPrompter } from "#support/scaffold/utils/createPrompter";
import { runSteps } from "#support/scaffold/utils/runSteps";
import { createTsdownConfigStep } from "#tsdown/setup/createTsdownConfigStep";
import { createDistTsconfigStep } from "#typescript/setup/createDistTsconfigStep";
import { createTsconfigStep } from "#typescript/setup/createTsconfigStep";
import { createViteConfigStep } from "#vite/setup/createViteConfigStep";
import { createVitestConfigStep } from "#vitest/setup/createVitestConfigStep";
import { createVitestStep } from "#vitest/setup/createVitestStep";
import { createVscodeExtensionsStep } from "#vscode/setup/createVscodeExtensionsStep";
import { createVscodeSettingsStep } from "#vscode/setup/createVscodeSettingsStep";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Invocation } from "#support/scaffold/types/Invocation";
import type { Prompter } from "#support/scaffold/types/Prompter";
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

async function readPackage(
  prompter: Prompter,
): Promise<ResolvedConfig | undefined> {
  const config = await readConfig(process.cwd(), {
    searchParents: false,
  });

  if (config.packageJsonPath !== undefined) {
    return config;
  }

  const starts = await prompter.confirm(
    `No ${packageJsonFile} in ${config.root}. Start a new package here?`,
  );

  if (!starts) {
    return;
  }

  invokeCommand(config.root, {
    command: "pnpm",
    args: ["init", "--bare"],
    interactive: false,
  });

  return readConfig(config.root, {
    searchParents: false,
  });
}

export const init = defineCommand((command) => {
  return command
    .description(
      "Set up engrenage in the project, or add the pieces it is missing.",
    )
    .option("-y, --yes", "accept every step without asking", false)
    .action(async ({ yes }) => {
      const prompter = createPrompter({
        yes,
      });

      const config = await readPackage(prompter);

      if (config === undefined) {
        return;
      }

      const invocations = await runSteps({
        config,
        prompter,
        steps: [
          createPreferredAgentsStep(),
          createConfigFileStep(),
          createPackageStep(),
          createDependencyStep(),
          createWorkspaceStep(),
          createBuildToolStep(),
          createVitestStep(),
          createTsdownConfigStep(),
          createViteConfigStep(),
          createVitestConfigStep(),
          createTsconfigStep(),
          createDistTsconfigStep(),
          createPrettierStep(),
          createPrettierignoreStep(),
          createGitignoreStep(),
          createEslintConfigStep(),
          createAgentsStep(),
          createAgentRulesStep(),
          createClaudeStep(),
          createCodexStep(),
          createCodexHooksStep(),
          createClaudeSettingsStep(),
          createChangesetConfigStep(),
          createWorkflowsStep(),
          createVscodeExtensionsStep(),
          createVscodeSettingsStep(),
          createScriptsStep(),
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

      const installed = await readConfig(config.root, {
        searchParents: false,
      });

      await runSync(installed);

      settleChanges(installed, {
        check: false,
      });
    });
});
