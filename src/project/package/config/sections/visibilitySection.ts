import { declareSection } from "#foundation/options/index";
import { visibilitySchema } from "#project/package/config/schemas/visibilitySchema";
import { resolveVisibility } from "#project/package/operations/resolveVisibility";
import type { ConfigResolver } from "#project/config/index";
import type { Visibility } from "#project/package/types/Visibility";

export const visibilitySection = declareSection({
  name: "visibility",
  declaration: visibilitySchema,
  async resolve(input, config: ConfigResolver): Promise<Visibility> {
    return resolveVisibility(
      visibilitySchema.resolve(input, undefined, "visibility"),
      await config.resolve("packageJson"),
    );
  },
});
