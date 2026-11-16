import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { toArray } from "@auaust/toolkit/array";

import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export function filesIn(
  directories: Directory | Directories,
  files: Glob | Globs,
): Globs {
  return flatMap(toArray(directories), (directory) => {
    return map(toArray(files), (glob) => {
      return directory === "." ? glob : `${directory}/${glob}`;
    });
  });
}
