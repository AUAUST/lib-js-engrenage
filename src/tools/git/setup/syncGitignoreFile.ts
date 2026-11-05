import { settlePreset, syncIgnoreFile } from "#foundation/blocks/index";
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
import type { OptionContext } from "#foundation/options/index";
import type { ProjectConfig } from "#project/config/index";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";

export async function syncGitignoreFile(
  config: OptionContext<ProjectConfig & { git: ResolvedGit }>,
) {
  const [root, filesystem, resolve, git, project] = await Promise.all([
    config.get("root"),
    config.get("filesystem"),
    config.get("resolve"),
    config.get("git"),
    settlePreset(createProjectIgnores(config)),
  ]);

  await syncIgnoreFile(
    {
      root,
      filesystem,
      resolve,
    },
    {
      path: await git.gitignore,
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
        project,
      },
    },
  );
}
