import { readlink } from "node:fs/promises";

import { get } from "@auaust/toolkit/object";

import { isMissingError } from "#foundation/filesystem/index";

/**
 * The raw target of the symlink at `path`, `undefined` when the path
 * holds no symlink.
 */
export async function readSymlinkTarget(
  path: string,
): Promise<string | undefined> {
  try {
    return await readlink(path);
  } catch (error) {
    if (isMissingError(error) || get(error, "code") === "EINVAL") {
      return;
    }

    throw error;
  }
}
