import { freeze } from "@auaust/toolkit/object";

import { resolveCodeEnvironment } from "#project/environments/operations/resolveCodeEnvironment";
import { resolveEnvironmentDirs } from "#project/environments/operations/resolveEnvironmentDirs";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import type { ConfigResolver } from "#project/config/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export async function resolveEnvironment(
  config: ConfigResolver,
  option: {
    dirs: Directories;
    generated: Globs;
    discovered: Globs;
    defines: boolean;
  },
  name: string,
) {
  const { files } = await config.resolve("typescript.options");

  return freeze({
    ...(await resolveCodeEnvironment({
      ...option,
      dirs: await resolveEnvironmentDirs(config, name, option.dirs),
      typescriptFiles: files,
      filesystem: config.context.filesystem,
    })),
    tsconfig: await resolveEnvironmentTsconfig(config, name),
  });
}
