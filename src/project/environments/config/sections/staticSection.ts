import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedStatic } from "#project/environments/types/ResolvedStatic";

export const staticSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedStatic> {
    const {
      dirs,
      active,
    } = await discoverDeclaredEnvironment(config, "static");

    return freeze({
      active,
      dirs,
    });
  },
});
