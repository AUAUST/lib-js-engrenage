import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import { listPlacementGlobs } from "#project/environments/operations/listPlacementGlobs";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedTooling } from "#project/environments/types/ResolvedTooling";

export const toolingSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedTooling> {
    const {
      dirs,
      rootFiles,
      active,
    } = await discoverDeclaredEnvironment(config, "tooling");

    const globs = await listPlacementGlobs(config, dirs);

    return freeze({
      active,
      dirs,
      rootFiles,
      globs: [...rootFiles, ...globs],
    });
  },
});
