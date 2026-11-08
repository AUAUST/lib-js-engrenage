import {
  syncAgents,
  syncClaudeSettings,
  syncCodexFiles,
} from "#tools/agents/index";
import { syncChangesetConfig } from "#tools/changesets/index";
import { syncGitignoreFile } from "#tools/git/index";
import { syncWorkflowFiles } from "#tools/github/index";
import { syncLefthookConfig } from "#tools/lefthook/index";
import { syncWorkspaceFile } from "#tools/pnpm/index";
import { syncPrettierignoreFile } from "#tools/prettier/index";
import {
  syncAliases,
  syncEnvFile,
  syncTsconfigFiles,
  syncWorkspaceFiles,
} from "#tools/typescript/index";
import { syncVscodeFiles } from "#tools/vscode/index";
import { checkPublishing } from "#workflows/sync/setup/checkPublishing";
import { syncPackageJson } from "#workflows/sync/setup/syncPackageJson";
import { defineSyncTarget } from "#workflows/sync/utils/defineSyncTarget";
import type { syncTargetFlags } from "#workflows/sync/constants";
import type { SyncTarget } from "#workflows/sync/types/SyncTarget";
import type { SyncTargetName } from "#workflows/sync/types/SyncTargetName";

// Targets run in declaration order: those that produce a file other targets read from the config come first.
export const syncTargets = {
  tsconfig: defineSyncTarget(syncTsconfigFiles),
  aliases: defineSyncTarget(syncAliases),
  agents: defineSyncTarget(syncAgents),
  changesets: defineSyncTarget(syncChangesetConfig),
  claude: defineSyncTarget(syncClaudeSettings),
  codex: defineSyncTarget(syncCodexFiles),
  gitignore: defineSyncTarget(syncGitignoreFile),
  globals: defineSyncTarget(syncEnvFile),
  lefthook: defineSyncTarget(syncLefthookConfig),
  package: defineSyncTarget(syncPackageJson),
  pnpm: defineSyncTarget(syncWorkspaceFile),
  prettierignore: defineSyncTarget(syncPrettierignoreFile),
  vscode: defineSyncTarget(syncVscodeFiles),
  workflows: defineSyncTarget(syncWorkflowFiles),
  workspaces: defineSyncTarget(syncWorkspaceFiles),
  publishing: defineSyncTarget(checkPublishing),
} satisfies {
  readonly [Name in SyncTargetName]: SyncTarget<
    keyof (typeof syncTargetFlags)[Name] & string
  >;
};
