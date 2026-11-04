import { syncIgnoreFile } from "#foundation/blocks/operations/syncIgnoreFile";
import {
  defaultIgnores,
  editorIgnores,
  envIgnores,
  javascriptIgnores,
  lockfileIgnores,
  logIgnores,
  osIgnores,
} from "#tools/git/constants";
import { createProjectIgnores } from "#tools/git/utils/createProjectIgnores";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

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
