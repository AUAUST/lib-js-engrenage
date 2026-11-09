import { flatMap } from "@auaust/primitive-kit/arrays";

import { settlePreset, syncIgnoreFile } from "#foundation/blocks/index";
import {
  createResourceIgnores,
  type LoadedConfig,
} from "#project/config/index";
import {
  defaultIgnores,
  editorIgnores,
  envIgnores,
  javascriptIgnores,
  lockfileIgnores,
  logIgnores,
  osIgnores,
} from "#tools/git/constants";
import type { GlobGroup } from "#types/GlobGroup";

async function createUncommittedIgnores(
  config: LoadedConfig,
): Promise<readonly GlobGroup[]> {
  const resources = await config.resolve("resources");

  return createResourceIgnores(resources.list({ committed: false }), {
    covered: flatMap(defaultIgnores, ({ globs }) => globs),
  });
}

export async function syncGitignoreFile(config: LoadedConfig) {
  const [root, filesystem, resolve, resources, project] = await Promise.all([
    config.context.root,
    config.context.filesystem,
    config.context.path,
    config.resolve("resources"),
    settlePreset(createUncommittedIgnores(config)),
  ]);

  await syncIgnoreFile(
    {
      root,
      filesystem,
      resolve,
    },
    {
      path:
        resources.get("gitignore") === undefined
          ? undefined
          : resources.path("gitignore"),
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
