import { isNotEmpty } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import {
  filesIn,
  findDirectories,
  type Filesystem,
} from "#foundation/filesystem/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export async function resolveCodeEnvironment({
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
    active: isNotEmpty(await findDirectories(filesystem, dirs)),
    dirs,
    generated,
    discovered,
    defines,
    globs: filesIn(dirs, typescriptFiles),
  });
}
