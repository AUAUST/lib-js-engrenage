import { declareSection } from "#foundation/options/index";
import { defineSchema } from "#project/environments/config/schemas/defineSchema";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedDefine } from "#project/environments/types/ResolvedDefine";

export const defineSection = declareSection({
  declaration: defineSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedDefine> {
    const { root, configFile, filesystem } = config.context;

    return defineSchema.resolve(
      input,
      {
        root,
        configFile,
        packageJson: await config.resolve("packageJson"),
        filesystem,
      },
      "define",
    );
  },
});
