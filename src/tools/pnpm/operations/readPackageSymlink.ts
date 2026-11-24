import { dirname, join } from "node:path";

import { resolve } from "#foundation/filesystem/index";
import { modulesDirectory } from "#tools/pnpm/constants";
import { readSymlinkTarget } from "#tools/pnpm/operations/readSymlinkTarget";
import type { Directory } from "#types/Directory";

/**
 * The symlink `root` installs the package `name` at, with its raw and resolved
 * targets, `undefined` when the path holds no symlink.
 */
export async function readPackageSymlink(root: Directory, name: string) {
  const path = join(root, modulesDirectory, name);

  const target = await readSymlinkTarget(path);

  return {
    path,
    target,
    resolved: target === undefined ? undefined : resolve(dirname(path), target),
  };
}
