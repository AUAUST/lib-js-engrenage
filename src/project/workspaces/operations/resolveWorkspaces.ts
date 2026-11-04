import { basename } from "node:path/posix";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries, freeze } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/utils/filesIn";
import { createPackageJson } from "#project/package/operations/createPackageJson";
import {
  directoryPlaceholder,
  workspaceEntryGlob,
  workspaceTsconfigFile,
} from "#project/workspaces/constants";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { OutputOf } from "#foundation/options/types/OutputOf";
import type { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
import type { ResolvedWorkspace } from "#project/workspaces/types/ResolvedWorkspace";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/types/ResolvedWorkspaceGroup";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

function listDirectories(filesystem: Filesystem, glob: Glob): Directory[] {
  return filesystem.glob(glob).filter((path) => filesystem.isDirectory(path));
}

export function resolveWorkspaces({
  root,
  filesystem,
  options,
  typescriptFiles,
}: {
  root: Directory;
  filesystem: Filesystem;
  options: OutputOf<typeof workspacesSchema>;
  typescriptFiles: Globs;
}): readonly ResolvedWorkspaceGroup[] {
  const claimed = new Map<Directory, Glob>();

  const matched = map(entries(options), ([glob, option]) => {
    const dirs = listDirectories(filesystem, glob);

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

  function describe(dir: Directory): ResolvedWorkspace {
    const packageJson = `${dir}/package.json`;

    const dependencies = createPackageJson({
      root,
      path: packageJson,
      content: filesystem.read(packageJson),
    }).optional.dependencies;

    return freeze({
      dir,
      name: names.get(dir) ?? "",
      packageJson,
      tsconfig: `${dir}/${workspaceTsconfigFile}`,
      entry: filesystem.glob(`${dir}/${workspaceEntryGlob}`)[0],
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
    map(matched, ({ glob, option, dirs }) => {
      const { generated, discovered, tsconfig } = option;

      return freeze({
        glob,
        active: dirs.length > 0,
        dirs,
        generated,
        discovered,
        globs: flatMap(dirs, (dir) => filesIn(dir, typescriptFiles)),
        tsconfig,
        workspaces: map(dirs, describe),
      });
    }),
  );
}
