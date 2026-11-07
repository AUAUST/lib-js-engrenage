import { declareSection } from "#foundation/options/index";
import { sourceSchema } from "#project/environments/config/schemas/sourceSchema";

export const sourceOptionsSection = declareSection({
  name: "src",
  declaration: sourceSchema,
  resolve(input) {
    return sourceSchema.resolve(input, undefined, "src");
  },
});
