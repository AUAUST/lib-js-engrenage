import { isNonEmptyArray } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import { findDirectories } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { staticSchema } from "#project/environments/config/schemas/staticSchema";
import { resolveEnvironmentDirs } from "#project/environments/operations/resolveEnvironmentDirs";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedStatic } from "#project/environments/types/ResolvedStatic";

export const staticSection = declareSection({
  declaration: staticSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedStatic> {
    const option = staticSchema.resolve(
      input,
      {
        traits: await config.resolve("traits"),
        reporter: config.context.reporter,
      },
      "static",
    );

    const dirs = await resolveEnvironmentDirs(config, "static", option.dirs);

    return freeze({
      active: isNonEmptyArray(
        await findDirectories(config.context.filesystem, dirs),
      ),
      dirs,
    });
  },
});
