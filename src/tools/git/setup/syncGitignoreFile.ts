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
import { createProjectIgnores } from "#tools/git/operations/createProjectIgnores";
import type { LoadedConfig } from "#project/config/index";

export async function syncGitignoreFile(config: LoadedConfig) {
  const [root, filesystem, resolve, git, project] = await Promise.all([
    config.context.root,
    config.context.filesystem,
    config.context.path,
    config.resolve("git"),
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
