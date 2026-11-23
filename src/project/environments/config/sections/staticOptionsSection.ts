import { declareSection, type OutputOf } from "#foundation/options/index";
import { staticSchema } from "#project/environments/config/schemas/staticSchema";
import type { ConfigResolver } from "#project/config/index";

export const staticOptionsSection = declareSection({
  declaration: staticSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<OutputOf<typeof staticSchema>> {
    return staticSchema.resolve(
      input,
      {
        traits: await config.resolve("traits"),
        reporter: config.context.reporter,
      },
      "static",
    );
  },
});
