import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { gitDirectory } from "#tools/git/constants";
import type { Directory } from "#types/Directory";

export function findRepositoryRoot(root: Directory): Directory {
  function search(directory: Directory): Directory {
    if (existsSync(join(directory, gitDirectory))) {
      return directory;
    }

    const parent = dirname(directory);

    return parent === directory ? root : search(parent);
  }

  return search(root);
}
