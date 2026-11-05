import { declareSection, type Resolver } from "#foundation/options/index";
import { defineSchema } from "#project/config/config/schemas/defineSchema";
import { packageJsonSection } from "#project/config/operations/packageJsonSection";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ResolvedDefine } from "#project/config/types/ResolvedDefine";

export const defineSection = declareSection({
  name: "define",
  declaration: defineSchema,
  async resolve(
    input,
    config: Resolver<ConfigContext>,
  ): Promise<ResolvedDefine> {
    const { root, configFile, filesystem } = config.context;

    return defineSchema.resolve(
      input,
      {
        root,
        configFile,
        packageJson: await config.resolve(packageJsonSection),
        filesystem,
      },
      "define",
    );
  },
});
