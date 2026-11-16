import { declareSection, type OutputOf } from "#foundation/options/index";
import { sourceSchema } from "#project/environments/config/schemas/sourceSchema";
import type { ConfigResolver } from "#project/config/index";

export const sourceOptionsSection = declareSection({
  declaration: sourceSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<OutputOf<typeof sourceSchema>> {
    return sourceSchema.resolve(
      input,
      { tool: await config.resolve("build.tool") },
      "src",
    );
  },
});
