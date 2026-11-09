import { freeze } from "@auaust/toolkit/object";

import { resolveCodeEnvironment } from "#project/environments/operations/resolveCodeEnvironment";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import type { ConfigResolver } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/index";
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
  key: TsconfigKey,
) {
  const { files } = await config.resolve("typescript.options");

  return freeze({
    ...(await resolveCodeEnvironment({
      ...option,
      typescriptFiles: files,
      filesystem: config.context.filesystem,
    })),
    tsconfig: await resolveEnvironmentTsconfig(config, key),
  });
}
