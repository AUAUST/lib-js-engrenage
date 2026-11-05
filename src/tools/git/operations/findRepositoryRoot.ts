import { dirname, join } from "node:path";

import { pathExists } from "#foundation/filesystem/index";
import { gitDirectory } from "#tools/git/constants";
import type { Directory } from "#types/Directory";

export async function findRepositoryRoot(root: Directory): Promise<Directory> {
  async function search(directory: Directory): Promise<Directory> {
    if (await pathExists(join(directory, gitDirectory))) {
      return directory;
    }

    const parent = dirname(directory);

    return parent === directory ? root : search(parent);
  }

  return search(root);
}
