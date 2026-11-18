import { declareSection, type OutputOf } from "#foundation/options/index";
import { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";
import type { ConfigResolver } from "#project/config/index";

export const scriptsOptionsSection = declareSection({
  declaration: scriptsSchema,
  resolve(input, config: ConfigResolver): OutputOf<typeof scriptsSchema> {
    return scriptsSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "scripts",
    );
  },
});
