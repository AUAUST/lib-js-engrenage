import { declareSection } from "#foundation/options/index";
import { presetSchema } from "#project/presets/index";

export const presetSection = declareSection({
  name: "preset",
  declaration: presetSchema,
  resolve(input) {
    return presetSchema.resolve(input, undefined, "preset");
  },
});
