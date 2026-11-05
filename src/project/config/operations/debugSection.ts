import { declareSection } from "#foundation/options/index";
import { debugSchema } from "#project/config/config/schemas/debugSchema";
import { isDebugEnvironment } from "#project/config/operations/isDebugEnvironment";

export const debugSection = declareSection({
  name: "debug",
  declaration: debugSchema,
  resolve(input) {
    return (
      debugSchema.resolve(input, undefined, "debug") || isDebugEnvironment()
    );
  },
});
