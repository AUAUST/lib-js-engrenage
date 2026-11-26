import { declareSection } from "#foundation/options/index";
import { isDebugEnvironment } from "#nexus/cli/index";
import { debugEnvironmentVariable } from "#tools/nexus/constants";
import { debugSchema } from "#workflows/cli/config/schemas/debugSchema";

export const debugSection = declareSection({
  declaration: debugSchema,
  resolve(input): boolean {
    return (
      debugSchema.resolve(input, undefined, "debug") ||
      isDebugEnvironment(debugEnvironmentVariable)
    );
  },
});
