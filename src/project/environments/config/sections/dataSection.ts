import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";
import { hasUnignoredFile } from "#project/environments/operations/hasUnignoredFile";
import { resolveEnvironmentDirs } from "#project/environments/operations/resolveEnvironmentDirs";
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

    const dirs = await resolveEnvironmentDirs(config, "data", option.dirs);

    return freeze({
      active: await hasUnignoredFile(config, { dirs }),
      dirs,
      exports: option.exports,
    });
  },
});
