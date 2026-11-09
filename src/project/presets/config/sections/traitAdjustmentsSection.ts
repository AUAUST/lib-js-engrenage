import { declareSection } from "#foundation/options/index";
import { traitsSchema } from "#project/presets/config/schemas/traitsSchema";
import type { ResolvedTraitAdjustments } from "#project/presets/types/ResolvedTraitAdjustments";

export const traitAdjustmentsSection = declareSection({
  declaration: traitsSchema,
  resolve(input): ResolvedTraitAdjustments {
    return traitsSchema.resolve(input, undefined, "traits");
  },
});
