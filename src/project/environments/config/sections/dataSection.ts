import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";
import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedData } from "#project/environments/types/ResolvedData";

export const dataSection = declareSection({
  declaration: dataSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedData> {
    const option = dataSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "data",
    );

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
