import { createClaudeSettingsStep } from "#agents/claude/setup/createClaudeSettingsStep";
import { createClaudeStep } from "#agents/claude/setup/createClaudeStep";
import { createCodexHooksStep } from "#agents/codex/setup/createCodexHooksStep";
import { createCodexStep } from "#agents/codex/setup/createCodexStep";
import { createAgentRulesStep } from "#agents/setup/createAgentRulesStep";
import { createAgentsStep } from "#agents/setup/createAgentsStep";
import { createBacklogStep } from "#agents/setup/createBacklogStep";
import { createPreferredAgentsStep } from "#agents/setup/createPreferredAgentsStep";
import { createBuildToolStep } from "#build/setup/createBuildToolStep";
import { createChangesetConfigStep } from "#changesets/setup/createChangesetConfigStep";
import { createEslintConfigStep } from "#eslint/setup/createEslintConfigStep";
import { createGitignoreStep } from "#git/setup/createGitignoreStep";
import { createWorkflowsStep } from "#github/setup/createWorkflowsStep";
import { createConfigFileStep } from "#init/setup/createConfigFileStep";
import { createDependencyStep } from "#init/setup/createDependencyStep";
import { createScriptsStep } from "#init/setup/createScriptsStep";
import { createPackageStep } from "#package/setup/createPackageStep";
import { createPnpmStep } from "#pnpm/setup/createPnpmStep";
import { createWorkspaceStep } from "#pnpm/setup/createWorkspaceStep";
import { createPrettierignoreStep } from "#prettier/setup/createPrettierignoreStep";
import { createPrettierStep } from "#prettier/setup/createPrettierStep";
import { createTsdownConfigStep } from "#tsdown/setup/createTsdownConfigStep";
import { createRuntimeDataStep } from "#typescript/setup/createRuntimeDataStep";
import { createSourceEntryStep } from "#typescript/setup/createSourceEntryStep";
import { createTypescriptStep } from "#typescript/setup/createTypescriptStep";
import { createViteConfigStep } from "#vite/setup/createViteConfigStep";
import { createVitestConfigStep } from "#vitest/setup/createVitestConfigStep";
import { createVitestCoverageStep } from "#vitest/setup/createVitestCoverageStep";
import { createVitestStep } from "#vitest/setup/createVitestStep";
import { createVscodeExtensionsStep } from "#vscode/setup/createVscodeExtensionsStep";
import { createVscodeSettingsStep } from "#vscode/setup/createVscodeSettingsStep";
import type { Step } from "#cli/types/Step";

export function listInitSteps(): Step[] {
  return [
    createPreferredAgentsStep(),
    createConfigFileStep(),
    createPackageStep(),
    createDependencyStep(),
    createWorkspaceStep(),
    createPnpmStep(),
    createBuildToolStep(),
    createVitestStep(),
    createVitestCoverageStep(),
    createTsdownConfigStep(),
    createViteConfigStep(),
    createVitestConfigStep(),
    createTypescriptStep(),
    createRuntimeDataStep(),
    createSourceEntryStep(),
    createPrettierStep(),
    createPrettierignoreStep(),
    createGitignoreStep(),
    createEslintConfigStep(),
    createAgentsStep(),
    createAgentRulesStep(),
    createBacklogStep(),
    createClaudeStep(),
    createCodexStep(),
    createCodexHooksStep(),
    createClaudeSettingsStep(),
    createChangesetConfigStep(),
    createWorkflowsStep(),
    createVscodeExtensionsStep(),
    createVscodeSettingsStep(),
    createScriptsStep(),
  ];
}
