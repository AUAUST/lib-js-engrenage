import { syncTsconfigFiles } from "#project/tsconfig/setup/syncTsconfigFiles";
import { syncWorkspaceFiles } from "#project/workspaces/setup/syncWorkspaceFiles";
import {
  syncAgents,
  syncClaudeSettings,
  syncCodexFiles,
} from "#tools/agents/index";
import { syncChangesetConfig } from "#tools/changesets/index";
import { syncGitignoreFile } from "#tools/git/index";
import { syncWorkflowFiles } from "#tools/github/index";
import { syncWorkspaceFile } from "#tools/pnpm/index";
import { syncPrettierignoreFile } from "#tools/prettier/index";
import { syncAliases, syncEnvFile } from "#tools/typescript/index";
import { syncVscodeFiles } from "#tools/vscode/index";
import { syncPackageJson } from "#workflows/sync/setup/syncPackageJson";
import { defineSyncTarget } from "#workflows/sync/utils/defineSyncTarget";

// Targets run in declaration order: those that produce a file other targets read from the config come first.
export const syncTargets = {
  tsconfig: defineSyncTarget(syncTsconfigFiles),
  aliases: defineSyncTarget(syncAliases),
  agents: defineSyncTarget(syncAgents),
  changesets: defineSyncTarget(syncChangesetConfig),
  claude: defineSyncTarget(syncClaudeSettings, {
    settings: "create .claude/settings.json when it is missing",
  }),
  codex: defineSyncTarget(syncCodexFiles, {
    hooks: "create .codex/hooks.json when it is missing",
  }),
  gitignore: defineSyncTarget(syncGitignoreFile),
  globals: defineSyncTarget(syncEnvFile),
  package: defineSyncTarget(syncPackageJson),
  pnpm: defineSyncTarget(syncWorkspaceFile),
  prettierignore: defineSyncTarget(syncPrettierignoreFile),
  vscode: defineSyncTarget(syncVscodeFiles, {
    settings: "create .vscode/settings.json when it is missing",
    extensions: "create .vscode/extensions.json when it is missing",
  }),
  workflows: defineSyncTarget(syncWorkflowFiles),
  workspaces: defineSyncTarget(syncWorkspaceFiles),
};
