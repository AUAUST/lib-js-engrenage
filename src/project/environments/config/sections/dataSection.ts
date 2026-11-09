import { isNotEmpty } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { findDirectories } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";
import { resolveEnvironmentDirs } from "#project/environments/operations/resolveEnvironmentDirs";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedData } from "#project/environments/types/ResolvedData";

export const dataSection = declareSection({
  declaration: dataSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedData> {
    const option = dataSchema.resolve(input, undefined, "data");

    const dirs = await resolveEnvironmentDirs(config, "data", option.dirs);

    return freeze({
      active: isNotEmpty(
        await findDirectories(config.context.filesystem, dirs),
      ),
      dirs,
      exports: option.exports,
    });
  },
});
