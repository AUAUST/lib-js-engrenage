import { declareSection } from "#foundation/options/index";
import { traitsSchema } from "#project/presets/index";

export const traitAdjustmentsSection = declareSection({
  name: "traits",
  declaration: traitsSchema,
  resolve(input) {
    return traitsSchema.resolve(input, undefined, "traits");
  },
});
