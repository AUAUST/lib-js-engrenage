import { declareSection, type OutputOf } from "#foundation/options/index";
import { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";
import { readLayoutContext } from "#project/environments/operations/readLayoutContext";
import type { ConfigResolver } from "#project/config/index";

export const scriptsOptionsSection = declareSection({
  declaration: scriptsSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<OutputOf<typeof scriptsSchema>> {
    return scriptsSchema.resolve(
      input,
      {
        ...(await readLayoutContext(config)),
        reporter: config.context.reporter,
      },
      "scripts",
    );
  },
});
