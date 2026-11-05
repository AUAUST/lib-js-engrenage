import { freeze } from "@auaust/toolkit/object";

import { resolveWithin } from "#foundation/filesystem/index";
import { declareSection, type Resolver } from "#foundation/options/index";
import { cacheSchema } from "#project/config/config/schemas/cacheSchema";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ResolvedCache } from "#project/config/types/ResolvedCache";
import type { PackageName } from "#types/PackageName";

export const cacheSection = declareSection({
  name: "cache",
  declaration: cacheSchema,
  resolve(input, config: Resolver<ConfigContext>): ResolvedCache {
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
