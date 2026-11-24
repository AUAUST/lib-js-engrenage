import { freeze } from "@auaust/toolkit/object";

import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import { listPlacementGlobs } from "#project/environments/operations/listPlacementGlobs";
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

  const globs = await listPlacementGlobs(config, dirs);

  return freeze({
    active,
    dirs,
    generated: option.generated,
    discovered: option.discovered,
    globs,
  });
}
