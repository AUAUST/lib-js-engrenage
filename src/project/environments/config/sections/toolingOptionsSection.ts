import { declareSection, type OutputOf } from "#foundation/options/index";
import { toolingSchema } from "#project/environments/config/schemas/toolingSchema";

export const toolingOptionsSection = declareSection({
  name: "tooling",
  declaration: toolingSchema,
  resolve(input): OutputOf<typeof toolingSchema> {
    return toolingSchema.resolve(input, undefined, "tooling");
  },
});
