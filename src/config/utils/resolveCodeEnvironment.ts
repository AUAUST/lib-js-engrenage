import { freeze } from "@auaust/toolkit/object";

import { filesIn } from "#utils/filesIn";
import type { Filesystem } from "#config/types/Filesystem";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export function resolveCodeEnvironment({
  dirs,
  generated,
  discovered,
  defines,
  typescriptFiles,
  filesystem,
}: {
  dirs: Directories;
  generated: Globs;
  discovered: Globs;
  defines: boolean;
  typescriptFiles: Globs;
  filesystem: Filesystem;
}) {
  return freeze({
    active: dirs.some((directory) => filesystem.isDirectory(directory)),
    dirs,
    generated,
    discovered,
    defines,
    globs: filesIn(dirs, typescriptFiles),
  });
}
