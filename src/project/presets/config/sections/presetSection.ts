import { declareSection, type OutputOf } from "#foundation/options/index";
import { presetSchema } from "#project/presets/config/schemas/presetSchema";

export const presetSection = declareSection({
  name: "preset",
  declaration: presetSchema,
  resolve(input): OutputOf<typeof presetSchema> {
    return presetSchema.resolve(input, undefined, "preset");
  },
});
