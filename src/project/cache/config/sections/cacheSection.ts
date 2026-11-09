import { freeze } from "@auaust/toolkit/object";

import { resolveWithin } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { cacheSchema } from "#project/cache/config/schemas/cacheSchema";
import type { ResolvedCache } from "#project/cache/types/ResolvedCache";
import type { ConfigResolver } from "#project/config/index";
import type { PackageName } from "#types/PackageName";

export const cacheSection = declareSection({
  declaration: cacheSchema,
  resolve(input, config: ConfigResolver): ResolvedCache {
    const { root } = config.context;

    const { dir } = cacheSchema.resolve(input, { root }, "cache");

    return freeze({
      dir,
      for(packageName: PackageName) {
        return resolveWithin(root, dir, packageName);
      },
    });
  },
});
