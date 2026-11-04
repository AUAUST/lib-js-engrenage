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
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
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
