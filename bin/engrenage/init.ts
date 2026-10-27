import { spawnSync } from "node:child_process";

import { includes } from "@auaust/primitive-kit/arrays";

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
import { createPrettierignoreStep } from "#prettier/setup/createPrettierignoreStep";
import { createPrettierStep } from "#prettier/setup/createPrettierStep";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { reportSyncResults } from "#support/commander/utils/reportSyncResults";
import { createPackageJson } from "#support/packageJson/utils/createPackageJson";
import { runSteps } from "#support/scaffold/utils/runSteps";
import { createTsdownConfigStep } from "#tsdown/setup/createTsdownConfigStep";
import { createVscodeStep } from "#vscode/setup/createVscodeStep";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Directory } from "#types/Directory";
import type { PackageNames } from "#types/PackageNames";

function hasNewDependencies(
  previous: PackageNames,
  { root, packageJsonPath }: ResolvedConfig,
): boolean {
  const written = createPackageJson({
    root,
    path: packageJsonPath,
  });

  const current = written.optional.dependencies ?? [];

  return current.some((name) => !includes(previous, name));
}

function install(root: Directory) {
  const { status, error } = spawnSync("pnpm", ["install"], {
    cwd: root,
    stdio: "inherit",
  });

  if (error !== undefined) {
    throw new Error("Cannot run pnpm install", {
      cause: error,
    });
  }

  if (status !== 0) {
    throw new Error(`pnpm install exited with code ${status}`);
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

      const dependencies = config.packageJson.optional.dependencies ?? [];

      const results = await runSteps({
        config,
        yes,
        steps: [
          createDependencyStep(),
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
          createVscodeStep(),
        ],
      });

      if (results.length === 0) {
        return;
      }

      reportSyncResults(results);

      if (hasNewDependencies(dependencies, config)) {
        install(config.root);
      }

      runSync({
        config: await readConfig(config.root),
      });
    });
});
