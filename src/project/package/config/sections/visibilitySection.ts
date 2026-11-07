import { declareSection, type Resolver } from "#foundation/options/index";
import { visibilitySchema } from "#project/package/config/schemas/visibilitySchema";
import { packageJsonSection } from "#project/package/config/sections/packageJsonSection";
import { resolveVisibility } from "#project/package/operations/resolveVisibility";
import type { ConfigContext } from "#project/config/index";

export const visibilitySection = declareSection({
  name: "visibility",
  declaration: visibilitySchema,
  async resolve(input, config: Resolver<ConfigContext>) {
    return resolveVisibility(
      visibilitySchema.resolve(input, undefined, "visibility"),
      await config.resolve(packageJsonSection),
    );
  },
});
