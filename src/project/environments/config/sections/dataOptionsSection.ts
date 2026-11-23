import { declareSection, type OutputOf } from "#foundation/options/index";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";
import type { ConfigResolver } from "#project/config/index";

export const dataOptionsSection = declareSection({
  declaration: dataSchema,
  resolve(input, config: ConfigResolver): OutputOf<typeof dataSchema> {
    return dataSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "data",
    );
  },
});
