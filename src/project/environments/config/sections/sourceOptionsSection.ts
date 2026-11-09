import { declareSection, type OutputOf } from "#foundation/options/index";
import { sourceSchema } from "#project/environments/config/schemas/sourceSchema";

export const sourceOptionsSection = declareSection({
  declaration: sourceSchema,
  resolve(input): OutputOf<typeof sourceSchema> {
    return sourceSchema.resolve(input, undefined, "src");
  },
});
