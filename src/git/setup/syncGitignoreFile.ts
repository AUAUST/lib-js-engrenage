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

export function syncGitignoreFile(config: ResolvedConfig) {
  syncIgnoreFile(config, {
    path: config.git.gitignore,
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
  });
}
