import { posix } from "node:path";

import { sort } from "@auaust/toolkit/array";

import { toPosixPath, type Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";

const ignoredDirectories = ["**/node_modules"];

export async function listStructureFilesAtAnyDepth(
  filesystem: Filesystem,
  directory: Directory,
): Promise<string[]> {
  // @debt counts the files of another environment's placement nested in the role directory, which the structure walk stops at
  const files = await filesystem.list(directory, {
    skip: ignoredDirectories,
  });

  return sort(
    files.map((file) => posix.relative(toPosixPath(directory), file)),
  );
}
