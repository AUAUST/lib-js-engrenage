import { readlink } from "node:fs/promises";
import { dirname, join } from "node:path";

import { get } from "@auaust/toolkit/object";

import { isMissingError, resolve } from "#foundation/filesystem/index";
import { modulesDirectory } from "#tools/pnpm/constants";
import type { Directory } from "#types/Directory";

async function readTarget(path: string) {
  try {
    return await readlink(path);
  } catch (error) {
    if (isMissingError(error) || get(error, "code") === "EINVAL") {
      return;
    }

    throw error;
  }
}

/**
 * The symlink `root` installs the package `name` at, with its raw and resolved
 * targets, `undefined` when the path holds no symlink.
 */
export async function readPackageSymlink(root: Directory, name: string) {
  const path = join(root, modulesDirectory, name);

  const target = await readTarget(path);

  return {
    path,
    target,
    resolved: target === undefined ? undefined : resolve(dirname(path), target),
  };
}
