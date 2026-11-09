import { declareSection } from "#foundation/options/index";
import { createImportResolver } from "#project/structure/utils/createImportResolver";
import type { ConfigResolver } from "#project/config/index";

export const importResolverSection = declareSection({
  name: "importResolver",
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<ReturnType<typeof createImportResolver>> {
    const [aliases, packageJson] = await Promise.all([
      config.resolve("aliases"),
      config.resolve("packageJson"),
    ]);

    return createImportResolver({
      root: config.context.root,
      aliases,
      packageName: packageJson.optional.name,
    });
  },
});
