import { flatMap } from "@auaust/toolkit/array";

import { settlePreset } from "#foundation/blocks/index";
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
import type { IgnorePresets } from "#types/IgnorePresets";

async function createUncommittedIgnores(
  config: LoadedConfig,
): Promise<readonly GlobGroup[]> {
  const resources = await config.resolve("resources");

  return createResourceIgnores(resources.list({ committed: false }), {
    covered: flatMap(defaultIgnores, ({ globs }) => globs),
  });
}

/**
 * The presets of `.gitignore`'s `@ignore` blocks, the `project` preset listing
 * the uncommitted resources.
 */
export async function createGitignorePresets(
  config: LoadedConfig,
): Promise<IgnorePresets> {
  const project = await settlePreset(createUncommittedIgnores(config));

  return {
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
  };
}
