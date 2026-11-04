import { syncClaudeSettings } from "#agents/claude/setup/syncClaudeSettings";
import { syncCodexFiles } from "#agents/codex/setup/syncCodexFiles";
import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
import { syncChangesetConfig } from "#changesets/setup/syncChangesetConfig";
import { syncGitignoreFile } from "#git/setup/syncGitignoreFile";
import { syncWorkflowFiles } from "#github/setup/syncWorkflowFiles";
import { syncPackageJson } from "#package/setup/syncPackageJson";
import { syncPrettierignoreFile } from "#prettier/setup/syncPrettierignoreFile";
import { defineSyncTarget } from "#sync/utils/defineSyncTarget";
import { syncTsconfigFiles } from "#tsconfig/setup/syncTsconfigFiles";
import { syncAliases } from "#typescript/setup/syncAliases";
import { syncEnvFile } from "#typescript/setup/syncEnvFile";
import { syncVscodeFiles } from "#vscode/setup/syncVscodeFiles";

// Targets run in declaration order: those that produce a file other targets read from the config come first.
export const syncTargets = {
  tsconfig: defineSyncTarget(syncTsconfigFiles),
  aliases: defineSyncTarget(syncAliases),
  agents: defineSyncTarget(syncAgentFiles),
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
  prettierignore: defineSyncTarget(syncPrettierignoreFile),
  vscode: defineSyncTarget(syncVscodeFiles, {
    settings: "create .vscode/settings.json when it is missing",
    extensions: "create .vscode/extensions.json when it is missing",
  }),
  workflows: defineSyncTarget(syncWorkflowFiles),
};
