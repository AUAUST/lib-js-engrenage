import { freeze } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export function resolveCodeEnvironment({
  active,
  dirs,
  generated,
  discovered,
  typescriptFiles,
}: {
  active: boolean;
  dirs: Directories;
  generated: Globs;
  discovered: Globs;
  typescriptFiles: Globs;
}) {
  return freeze({
    active,
    dirs,
    generated,
    discovered,
    globs: filesIn(dirs, typescriptFiles),
  });
}
