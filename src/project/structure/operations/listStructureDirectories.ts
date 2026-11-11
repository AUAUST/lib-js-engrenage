import { posix } from "node:path";

import { deduplicate, flatMap, sort } from "@auaust/primitive-kit/arrays";

import { toPosixPath, type Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";

const ignoredDirectories = ["**/node_modules"];

export async function listStructureDirectories(
  filesystem: Filesystem,
  directory: Directory,
): Promise<string[]> {
  const files = await filesystem.list(directory, { skip: ignoredDirectories });

  const holding = flatMap(files, (file) => {
    const [
      name,
      ...nested
    ] = posix.relative(toPosixPath(directory), file).split("/");

    return name === undefined || nested.length === 0 ? [] : [name];
  });

  return sort(deduplicate(holding));
}
