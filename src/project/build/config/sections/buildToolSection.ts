import { declareSection } from "#foundation/options/index";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import { selectEntry, type ConfigResolver } from "#project/config/index";
import type { BuildTool } from "#project/build/ports/BuildTool";

export const buildToolSection = declareSection({
  declaration: buildSchema,
  async resolve(input, config: ConfigResolver): Promise<BuildTool | false> {
    const preset = await config.resolve("preset");

    return selectEntry(config, "build.tools", {
      key: "build.tool",
      name: buildSchema.entries.tool.resolve(
        input?.tool,
        undefined,
        "build.tool",
      ),
      preferred: preset === false ? undefined : preset.prefers?.["build.tools"],
    });
  },
});
