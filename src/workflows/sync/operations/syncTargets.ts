import { syncPackageJson } from "#project/package/setup/syncPackageJson";
import { syncTsconfigFiles } from "#project/tsconfig/setup/syncTsconfigFiles";
import { syncClaudeSettings } from "#tools/agents/claude/setup/syncClaudeSettings";
import { syncCodexFiles } from "#tools/agents/codex/setup/syncCodexFiles";
import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import { syncChangesetConfig } from "#tools/changesets/setup/syncChangesetConfig";
import { syncGitignoreFile } from "#tools/git/setup/syncGitignoreFile";
import { syncWorkflowFiles } from "#tools/github/setup/syncWorkflowFiles";
import { syncPrettierignoreFile } from "#tools/prettier/setup/syncPrettierignoreFile";
import { syncAliases } from "#tools/typescript/setup/syncAliases";
import { syncEnvFile } from "#tools/typescript/setup/syncEnvFile";
import { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
import { defineSyncTarget } from "#workflows/sync/utils/defineSyncTarget";

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
