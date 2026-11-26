import { isNonEmptyArray } from "@auaust/toolkit/array";

import { ensureIncludes, hasOption } from "#foundation/processes/index";
import { createTsconfig } from "#project/tsconfig/index";
import {
  tscBuildOptions,
  tscProjectOptions,
} from "#tools/typescript/constants";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

function withNoEmit(args: string[]): string[] {
  ensureIncludes(args, "--noEmit");

  return args;
}

/**
 * The arguments of each `tsc` run checking `project`: one `--project` run per
 * project it references, each against its own build info so it checks the files
 * it imports from the others, or one for `project` itself when it references
 * none; `args` naming a project run alone, as given.
 */
export async function resolveTscProjectArguments(
  config: LoadedConfig,
  args: readonly string[],
  project: File | undefined,
): Promise<string[][]> {
  if (project === undefined) {
    throw new Error(`No tsconfig found in ${config.context.root}`);
  }

  if (hasOption(args, [...tscBuildOptions, ...tscProjectOptions])) {
    return [withNoEmit([...args])];
  }

  const { references } = await createTsconfig({
    root: config.context.root,
    path: project,
    filesystem: config.context.filesystem,
  });

  const projects = isNonEmptyArray(references) ? references : [project];

  return projects.map((checked) => {
    return withNoEmit(["--project", checked, ...args]);
  });
}
