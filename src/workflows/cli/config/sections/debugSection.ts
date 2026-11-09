import { declareSection } from "#foundation/options/index";
import { debugSchema } from "#workflows/cli/config/schemas/debugSchema";
import { isDebugEnvironment } from "#workflows/cli/operations/isDebugEnvironment";

export const debugSection = declareSection({
  name: "debug",
  declaration: debugSchema,
  resolve(input): boolean {
    return (
      debugSchema.resolve(input, undefined, "debug") || isDebugEnvironment()
    );
  },
});
