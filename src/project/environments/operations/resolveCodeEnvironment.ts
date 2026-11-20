import { freeze } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { hasUnignoredFile } from "#project/environments/operations/hasUnignoredFile";
import type { ConfigResolver } from "#project/config/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export async function resolveCodeEnvironment({
  dirs,
  generated,
  discovered,
  typescriptFiles,
  config,
}: {
  dirs: Directories;
  generated: Globs;
  discovered: Globs;
  typescriptFiles: Globs;
  config: ConfigResolver;
}) {
  return freeze({
    active: await hasUnignoredFile(config, { dirs }),
    dirs,
    generated,
    discovered,
    globs: filesIn(dirs, typescriptFiles),
  });
}
