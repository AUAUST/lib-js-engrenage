import { createBuildToolStep } from "#project/build/index";
import { createPackageStep } from "#project/package/index";
import {
  createAgentRulesStep,
  createAgentsStep,
  createBacklogStep,
  createClaudeSettingsStep,
  createClaudeStep,
  createCodexHooksStep,
  createCodexStep,
  createPreferredAgentsStep,
} from "#tools/agents/index";
import { createChangesetConfigStep } from "#tools/changesets/index";
import { createEslintConfigStep } from "#tools/eslint/index";
import { createGitignoreStep } from "#tools/git/index";
import { createWorkflowsStep } from "#tools/github/index";
import { createLefthookStep } from "#tools/lefthook/index";
import { createPnpmStep, createWorkspaceStep } from "#tools/pnpm/index";
import {
  createPrettierignoreStep,
  createPrettierStep,
} from "#tools/prettier/index";
import { createTsdownConfigStep } from "#tools/tsdown/index";
import {
  createRuntimeDataStep,
  createSourceEntryStep,
  createTypescriptStep,
} from "#tools/typescript/index";
import { createViteConfigStep } from "#tools/vite/index";
import {
  createVitestConfigStep,
  createVitestCoverageStep,
  createVitestStep,
} from "#tools/vitest/index";
import {
  createVscodeExtensionsStep,
  createVscodeSettingsStep,
} from "#tools/vscode/index";
import { createConfigFileStep } from "#workflows/init/setup/createConfigFileStep";
import { createDependencyStep } from "#workflows/init/setup/createDependencyStep";
import { createScriptsStep } from "#workflows/init/setup/createScriptsStep";
import type { Step } from "#project/steps/index";

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
    createLefthookStep(),
    createChangesetConfigStep(),
    createWorkflowsStep(),
    createVscodeExtensionsStep(),
    createVscodeSettingsStep(),
    createScriptsStep(),
  ];
}
