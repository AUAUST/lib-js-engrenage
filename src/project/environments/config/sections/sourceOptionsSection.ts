import { declareSection, type OutputOf } from "#foundation/options/index";
import { sourceSchema } from "#project/environments/config/schemas/sourceSchema";
import type { ConfigResolver } from "#project/config/index";

export const sourceOptionsSection = declareSection({
  declaration: sourceSchema,
  resolve(input, config: ConfigResolver): OutputOf<typeof sourceSchema> {
    return sourceSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "src",
    );
  },
});
