import { join, relative } from "node:path";

import { entries } from "@auaust/toolkit/object";
import { isString } from "@auaust/toolkit/string";

import { executablesDirectory, modulesDirectory } from "#tools/pnpm/constants";
import type { PackageManifest } from "#tools/pnpm/types/PackageManifest";
import type { Directory } from "#types/Directory";

/**
 * The executables `root` installs for the package `name` declaring `bin`, each a
 * path in `node_modules/.bin` and the relative target reaching its file through
 * the package's symlink, so it runs whatever the symlink points at.
 */
export function listExecutableLinks(
  root: Directory,
  { name, bin }: PackageManifest,
): { path: string; target: string }[] {
  const executables = bin === undefined
    ? []
    : isString(bin)
      ? [[name.replace(/^@[^/]+\//u, ""), bin] as const]
      : entries(bin);

  const directory = join(root, executablesDirectory);

  return executables.map(([executable, file]) => {
    return {
      path: join(directory, executable),
      target: relative(directory, join(root, modulesDirectory, name, file)),
    };
  });
}
