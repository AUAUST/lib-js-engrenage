import { declareSection } from "#foundation/options/index";
import { toolingSchema } from "#project/environments/index";

export const toolingOptionsSection = declareSection({
  name: "tooling",
  declaration: toolingSchema,
  resolve(input) {
    return toolingSchema.resolve(input, undefined, "tooling");
  },
});
