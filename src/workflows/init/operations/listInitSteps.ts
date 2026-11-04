import { createBuildToolStep } from "#project/build/setup/createBuildToolStep";
import { createPackageStep } from "#project/package/setup/createPackageStep";
import { createClaudeSettingsStep } from "#tools/agents/claude/setup/createClaudeSettingsStep";
import { createClaudeStep } from "#tools/agents/claude/setup/createClaudeStep";
import { createCodexHooksStep } from "#tools/agents/codex/setup/createCodexHooksStep";
import { createCodexStep } from "#tools/agents/codex/setup/createCodexStep";
import { createAgentRulesStep } from "#tools/agents/setup/createAgentRulesStep";
import { createAgentsStep } from "#tools/agents/setup/createAgentsStep";
import { createBacklogStep } from "#tools/agents/setup/createBacklogStep";
import { createPreferredAgentsStep } from "#tools/agents/setup/createPreferredAgentsStep";
import { createChangesetConfigStep } from "#tools/changesets/setup/createChangesetConfigStep";
import { createEslintConfigStep } from "#tools/eslint/setup/createEslintConfigStep";
import { createGitignoreStep } from "#tools/git/setup/createGitignoreStep";
import { createWorkflowsStep } from "#tools/github/setup/createWorkflowsStep";
import { createPnpmStep } from "#tools/pnpm/setup/createPnpmStep";
import { createWorkspaceStep } from "#tools/pnpm/setup/createWorkspaceStep";
import { createPrettierignoreStep } from "#tools/prettier/setup/createPrettierignoreStep";
import { createPrettierStep } from "#tools/prettier/setup/createPrettierStep";
import { createTsdownConfigStep } from "#tools/tsdown/setup/createTsdownConfigStep";
import { createRuntimeDataStep } from "#tools/typescript/setup/createRuntimeDataStep";
import { createSourceEntryStep } from "#tools/typescript/setup/createSourceEntryStep";
import { createTypescriptStep } from "#tools/typescript/setup/createTypescriptStep";
import { createViteConfigStep } from "#tools/vite/setup/createViteConfigStep";
import { createVitestConfigStep } from "#tools/vitest/setup/createVitestConfigStep";
import { createVitestCoverageStep } from "#tools/vitest/setup/createVitestCoverageStep";
import { createVitestStep } from "#tools/vitest/setup/createVitestStep";
import { createVscodeExtensionsStep } from "#tools/vscode/setup/createVscodeExtensionsStep";
import { createVscodeSettingsStep } from "#tools/vscode/setup/createVscodeSettingsStep";
import { createConfigFileStep } from "#workflows/init/setup/createConfigFileStep";
import { createDependencyStep } from "#workflows/init/setup/createDependencyStep";
import { createScriptsStep } from "#workflows/init/setup/createScriptsStep";
import type { Step } from "#workflows/cli/types/Step";

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
