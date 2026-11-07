import { declareSection } from "#foundation/options/index";
import { presetSchema } from "#project/presets/config/schemas/presetSchema";

export const presetSection = declareSection({
  name: "preset",
  declaration: presetSchema,
  resolve(input) {
    return presetSchema.resolve(input, undefined, "preset");
  },
});
