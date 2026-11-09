import { declareSection, type OutputOf } from "#foundation/options/index";
import { typescriptSchema } from "#project/tsconfig/config/schemas/typescriptSchema";

export const typescriptOptionsSection = declareSection({
  name: "typescript",
  declaration: typescriptSchema,
  resolve(input): OutputOf<typeof typescriptSchema> {
    return typescriptSchema.resolve(input, undefined, "typescript");
  },
});
