import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import {
  ensureAnyOf,
  ensureIncludes,
  hasOption,
} from "#foundation/processes/index";
import { createTsconfig } from "#project/tsconfig/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

const buildOptions = ["--build", "-b"];

async function isSolution(
  config: LoadedConfig,
  project: File,
): Promise<boolean> {
  const { references } = await createTsconfig({
    root: config.context.root,
    path: project,
    filesystem: config.context.filesystem,
  });

  return isNotEmpty(references);
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

  const builds = hasOption(resolved, buildOptions);

  if (!builds && (await isSolution(config, project))) {
    resolved.unshift("--build", project);
  } else if (!builds) {
    ensureAnyOf(resolved, ["--project", "-p"], ["--project", project]);
  }

  ensureIncludes(resolved, "--noEmit");

  return resolved;
}
