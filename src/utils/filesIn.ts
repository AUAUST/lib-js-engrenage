import { flatMap, map, wrap } from "@auaust/primitive-kit/arrays";

import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export function filesIn(
  directories: Directory | Directories,
  files: Glob | Globs,
): Globs {
  return flatMap(wrap(directories), (directory) => {
    return map(wrap(files), (glob) => `${directory}/${glob}`);
  });
}
