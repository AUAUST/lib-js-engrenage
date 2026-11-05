import { syncIgnoreFile } from "#foundation/blocks/index";
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
import type { ProjectConfig } from "#project/config/index";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";

export function syncGitignoreFile(
  config: ProjectConfig & { git: ResolvedGit },
) {
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
