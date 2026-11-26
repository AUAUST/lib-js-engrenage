import { declareSection } from "#foundation/options/index";
import { debugSchema } from "#workflows/cli/config/schemas/debugSchema";

export const debugSection = declareSection({
  declaration: debugSchema,
  resolve(input): boolean {
    return debugSchema.resolve(input, undefined, "debug");
  },
});
