import { declareSection, type OutputOf } from "#foundation/options/index";
import { binSchema } from "#project/environments/config/schemas/binSchema";
import { readLayoutContext } from "#project/environments/operations/readLayoutContext";
import type { ConfigResolver } from "#project/config/index";

export const binOptionsSection = declareSection({
  declaration: binSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<OutputOf<typeof binSchema>> {
    return binSchema.resolve(
      input,
      {
        ...(await readLayoutContext(config)),
        runtime: await config.resolve("runtime"),
        reporter: config.context.reporter,
      },
      "bin",
    );
  },
});
