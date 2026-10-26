import {
  defaultIgnores,
  editorIgnores,
  envIgnores,
  javascriptIgnores,
  lockfileIgnores,
  logIgnores,
  osIgnores,
} from "#git/constants";
import { createProjectIgnores } from "#git/utils/createProjectIgnores";
import { syncIgnoreFile } from "#utils/syncIgnoreFile";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { SyncResults } from "#types/SyncResults";

export function syncGitignoreFile({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): SyncResults {
  return syncIgnoreFile({
    root: config.root,
    path: config.gitignorePath,
    presets: {
      javascript() {
        return [javascriptIgnores];
      },
      lockfiles() {
        return [lockfileIgnores];
      },
      os() {
        return [osIgnores];
      },
      env() {
        return [envIgnores];
      },
      logs() {
        return [logIgnores];
      },
      editors() {
        return [editorIgnores];
      },
      defaults: () => defaultIgnores,
      project: () => createProjectIgnores(config),
    },
    check,
  });
}
