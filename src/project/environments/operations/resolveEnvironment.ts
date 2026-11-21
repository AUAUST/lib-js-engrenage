import { freeze } from "@auaust/toolkit/object";

import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import { resolveCodeEnvironment } from "#project/environments/operations/resolveCodeEnvironment";
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
  },
  name: string,
) {
  const { files } = await config.resolve("typescript.options");

  const { dirs, active } = await discoverDeclaredEnvironment(config, name, {
    dirs: option.dirs,
    files: [],
  });

  return freeze({
    ...resolveCodeEnvironment({
      ...option,
      dirs,
      active,
      typescriptFiles: files,
    }),
    tsconfig: await resolveEnvironmentTsconfig(config, name),
  });
}
