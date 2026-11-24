import { basename } from "node:path/posix";

import { iterable } from "@auaust/toolkit";
import { flatMap, map } from "@auaust/toolkit/array";
import { freeze, getOwn } from "@auaust/toolkit/object";

import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import { createPackageJson } from "#project/package/index";
import { directoryPlaceholder } from "#project/workspaces/constants";
import type { ExpectedWorkspaces } from "#batiment/context/index";
import type { OutputOf } from "#foundation/options/index";
import type { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
import type { ResolvedWorkspace } from "#project/workspaces/types/ResolvedWorkspace";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/types/ResolvedWorkspaceGroup";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export async function resolveWorkspaces({
  root,
  filesystem,
  options,
  typescriptFiles,
  entryGlob,
  expected,
}: {
  root: Directory;
  filesystem: Filesystem;
  options: OutputOf<typeof workspacesSchema>;
  typescriptFiles: Globs;
  entryGlob: Glob;
  expected: readonly ExpectedWorkspaces[];
}): Promise<readonly ResolvedWorkspaceGroup[]> {
  const matched = map(expected, ({ glob, dirs, missing }) => {
    const option = getOwn(options, glob);

    if (option === undefined) {
      throw new Error(
        `Discovery expected workspaces at ${glob}, which no workspaces option declares`,
      );
    }

    return {
      glob,
      option,
      dirs,
      missing,
    };
  });

  const names = new Map<Directory, string>();

  for (const { option, dirs } of matched) {
    for (const dir of dirs) {
      names.set(
        dir,
        option.name.split(directoryPlaceholder).join(basename(dir)),
      );
    }
  }

  async function describe(dir: Directory): Promise<ResolvedWorkspace> {
    const packageJson = `${dir}/package.json`;

    const [content, entries] = await Promise.all([
      filesystem.read(packageJson),
      filesystem.glob(`${dir}/${entryGlob}`),
    ]);

    const dependencies = createPackageJson({
      root,
      path: packageJson,
      content,
    }).optional.dependencies;

    return freeze({
      dir,
      name: names.get(dir) ?? "",
      packageJson,
      entry: entries[0],
      globs: filesIn(dir, typescriptFiles),
      dependencies: names
        .entries()
        .filter(([other, name]) => {
          return other !== dir && (dependencies ?? []).includes(name);
        })
        .map(([other]) => other)
        .toArray(),
    });
  }

  return freeze(
    await Promise.all(
      iterable.map(matched, async ({ glob, option, dirs, missing }) => {
        const { purpose, generated, discovered } = option;

        return freeze({
          glob,
          active: dirs.length > 0,
          ...(purpose === undefined ? {} : { purpose }),
          dirs,
          missing,
          generated,
          discovered,
          globs: flatMap(dirs, (dir) => filesIn(dir, typescriptFiles)),
          workspaces: await Promise.all(iterable.map(dirs, describe)),
        });
      }),
    ),
  );
}
