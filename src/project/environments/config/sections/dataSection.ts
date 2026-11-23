import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedData } from "#project/environments/types/ResolvedData";

export const dataSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedData> {
    const option = await config.resolve("data.options");

    const { dirs, active } = await discoverDeclaredEnvironment(config, "data", {
      dirs: option.dirs,
      files: [],
    });

    return freeze({
      active,
      dirs,
      exports: option.exports,
    });
  },
});
