import { freeze } from "@auaust/toolkit/object";

import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import { resolveCodeEnvironment } from "#project/environments/operations/resolveCodeEnvironment";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import { listLanguageFiles } from "#project/environments/utils/listLanguageFiles";
import type { ConfigResolver } from "#project/config/index";
import type { Globs } from "#types/Globs";

export async function resolveEnvironment(
  config: ConfigResolver,
  option: {
    generated: Globs;
    discovered: Globs;
  },
  name: string,
) {
  const { dirs, active } = await discoverDeclaredEnvironment(config, name);

  return freeze({
    ...resolveCodeEnvironment({
      ...option,
      dirs,
      active,
      files: listLanguageFiles(await readEnvironmentLanguages(config, name)),
    }),
    tsconfig: await resolveEnvironmentTsconfig(config, name),
  });
}
