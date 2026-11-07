import { declareSection, type Resolver } from "#foundation/options/index";
import { packageJsonSection } from "#project/package/index";
import { aliasesSection } from "#project/structure/config/sections/aliasesSection";
import { createImportResolver } from "#project/structure/utils/createImportResolver";
import type { ConfigContext } from "#project/config/index";

export const importResolverSection = declareSection({
  name: "importResolver",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const [aliases, packageJson] = await Promise.all([
      config.resolve(aliasesSection),
      config.resolve(packageJsonSection),
    ]);

    return createImportResolver({
      root: config.context.root,
      aliases,
      packageName: packageJson.optional.name,
    });
  },
});
