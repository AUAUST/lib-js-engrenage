import { declareSection } from "#foundation/options/index";
import { typescriptSchema } from "#project/tsconfig/index";

export const typescriptOptionsSection = declareSection({
  name: "typescript",
  declaration: typescriptSchema,
  resolve(input) {
    return typescriptSchema.resolve(input, undefined, "typescript");
  },
});
