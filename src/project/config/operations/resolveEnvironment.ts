import { freeze } from "@auaust/toolkit/object";

import { resolveEnvironmentTsconfig } from "#project/config/operations/resolveEnvironmentTsconfig";
import { typescriptOptionsSection } from "#project/config/operations/typescriptOptionsSection";
import { resolveCodeEnvironment } from "#project/environments/index";
import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { TsconfigKey } from "#project/tsconfig/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export async function resolveEnvironment(
  config: Resolver<ConfigContext>,
  option: {
    dirs: Directories;
    generated: Globs;
    discovered: Globs;
    defines: boolean;
  },
  key: TsconfigKey,
) {
  const { files } = await config.resolve(typescriptOptionsSection);

  return freeze({
    ...(await resolveCodeEnvironment({
      ...option,
      typescriptFiles: files,
      filesystem: config.context.filesystem,
    })),
    tsconfig: await resolveEnvironmentTsconfig(config, key),
  });
}
