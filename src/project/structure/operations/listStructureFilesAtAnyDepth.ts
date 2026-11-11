import { posix } from "node:path";

import { sort } from "@auaust/primitive-kit/arrays";

import { toPosixPath, type Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";

const ignoredDirectories = ["**/node_modules"];

export async function listStructureFilesAtAnyDepth(
  filesystem: Filesystem,
  directory: Directory,
): Promise<string[]> {
  const files = await filesystem.list(directory, { skip: ignoredDirectories });

  return sort(
    files.map((file) => posix.relative(toPosixPath(directory), file)),
  );
}
