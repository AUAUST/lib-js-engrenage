import { basename } from "node:path/posix";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries, freeze } from "@auaust/toolkit/object";

import {
  filesIn,
  findDirectories,
  type Filesystem,
} from "#foundation/filesystem/index";
import { createPackageJson } from "#project/package/index";
import {
  directoryPlaceholder,
  workspaceEntryGlob,
  workspaceTsconfigFile,
} from "#project/workspaces/constants";
import type { OutputOf } from "#foundation/options/index";
import type { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
import type { ResolvedWorkspace } from "#project/workspaces/types/ResolvedWorkspace";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/types/ResolvedWorkspaceGroup";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

async function listDirectories(
  filesystem: Filesystem,
  glob: Glob,
): Promise<Directory[]> {
  return [...(await findDirectories(filesystem, await filesystem.glob(glob)))];
}

export async function resolveWorkspaces({
  root,
  filesystem,
  options,
  typescriptFiles,
}: {
  root: Directory;
  filesystem: Filesystem;
  options: OutputOf<typeof workspacesSchema>;
  typescriptFiles: Globs;
}): Promise<readonly ResolvedWorkspaceGroup[]> {
  const claimed = new Map<Directory, Glob>();

  const listed = await Promise.all(
    map(entries(options), async ([glob, option]) => {
      return {
        glob,
        option,
        dirs: await listDirectories(filesystem, glob),
      };
    }),
  );

  const matched = map(listed, ({ glob, option, dirs }) => {
    for (const dir of dirs) {
      const other = claimed.get(dir);

      if (other !== undefined) {
        throw new Error(
          `The workspace ${dir} is matched by both workspaces.${other} and workspaces.${glob}: give each workspace one glob`,
        );
      }

      claimed.set(dir, glob);
    }

    return {
      glob,
      option,
      dirs,
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
      filesystem.glob(`${dir}/${workspaceEntryGlob}`),
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
      tsconfig: `${dir}/${workspaceTsconfigFile}`,
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
      map(matched, async ({ glob, option, dirs }) => {
        const { generated, discovered, tsconfig } = option;

        return freeze({
          glob,
          active: dirs.length > 0,
          dirs,
          generated,
          discovered,
          globs: flatMap(dirs, (dir) => filesIn(dir, typescriptFiles)),
          tsconfig,
          workspaces: await Promise.all(map(dirs, describe)),
        });
      }),
    ),
  );
}
