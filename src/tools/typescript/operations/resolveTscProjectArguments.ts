import { isNonEmptyArray } from "@auaust/toolkit/array";

import { ensureIncludes, hasOption } from "#foundation/processes/index";
import { createTsconfig } from "#project/tsconfig/index";
import {
  tscBuildOptions,
  tscProjectOptions,
} from "#tools/typescript/constants";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function isSolution(
  config: LoadedConfig,
  project: File,
): Promise<boolean> {
  const { references } = await createTsconfig({
    root: config.context.root,
    path: project,
    filesystem: config.context.filesystem,
  });

  return isNonEmptyArray(references);
}

export async function resolveTscProjectArguments(
  config: LoadedConfig,
  args: readonly string[],
  project: File | undefined,
): Promise<string[]> {
  if (project === undefined) {
    throw new Error(`No tsconfig found in ${config.context.root}`);
  }

  const resolved = [...args];

  // @debt `--build` judges a referenced project up to date by its root files' timestamps only, so a change in a file it imports from another environment (tests importing src) passes unchecked until the project's own files change
  if (!hasOption(resolved, [...tscBuildOptions, ...tscProjectOptions])) {
    const option = (await isSolution(config, project))
      ? "--build"
      : "--project";

    resolved.unshift(option, project);
  }

  ensureIncludes(resolved, "--noEmit");

  return resolved;
}
