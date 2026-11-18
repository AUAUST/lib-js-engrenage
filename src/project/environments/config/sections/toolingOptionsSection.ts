import { declareSection, type OutputOf } from "#foundation/options/index";
import { toolingSchema } from "#project/environments/config/schemas/toolingSchema";
import type { ConfigResolver } from "#project/config/index";

export const toolingOptionsSection = declareSection({
  declaration: toolingSchema,
  resolve(input, config: ConfigResolver): OutputOf<typeof toolingSchema> {
    return toolingSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "tooling",
    );
  },
});
