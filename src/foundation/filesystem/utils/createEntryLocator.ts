import type { Dirent } from "node:fs";

import { memoize } from "@auaust/toolkit/function";

import { joinLocated } from "#foundation/filesystem/utils/joinLocated";
import { relativeWithin } from "#foundation/filesystem/utils/relativeWithin";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * Locates directory entries relative to `root`, resolving each parent
 * directory once.
 */
export function createEntryLocator(root: Directory): (entry: Dirent) => File {
  const locateDirectory = memoize((directory: string) => {
    return relativeWithin(root, directory);
  });

  return function locateEntry({ parentPath, name }: Dirent): File {
    return joinLocated(locateDirectory(parentPath), name);
  };
}
