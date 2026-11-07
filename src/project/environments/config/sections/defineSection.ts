import { declareSection, type Resolver } from "#foundation/options/index";
import { defineSchema } from "#project/environments/config/schemas/defineSchema";
import { packageJsonSection } from "#project/package/index";
import type { ConfigContext } from "#project/config/index";
import type { ResolvedDefine } from "#project/environments/types/ResolvedDefine";

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
