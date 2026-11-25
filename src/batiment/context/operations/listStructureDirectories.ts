import { posix } from "node:path";

import { sort, toArray } from "@auaust/toolkit/array";
import { flatMap, unique } from "@auaust/toolkit/iterable";

import {
  escapeGlob,
  toPosixPath,
  type Filesystem,
} from "#foundation/filesystem/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

const ignoredDirectories = ["**/node_modules"];

export async function listStructureDirectories(
  filesystem: Filesystem,
  directory: Directory,
  stops: Directories,
): Promise<string[]> {
  const files = await filesystem.list(directory, {
    skip: [...ignoredDirectories, ...stops.map(escapeGlob)],
  });

  const holding = flatMap(files, (file) => {
    const [
      name,
      ...nested
    ] = posix.relative(toPosixPath(directory), file).split("/");

    return name === undefined || nested.length === 0 ? [] : [name];
  });

  return sort(toArray(unique(holding)));
}
