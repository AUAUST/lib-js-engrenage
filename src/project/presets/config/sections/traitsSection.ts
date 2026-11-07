import { declareSection } from "#foundation/options/index";
import { presetSection } from "#project/presets/config/sections/presetSection";
import { traitAdjustmentsSection } from "#project/presets/config/sections/traitAdjustmentsSection";
import { resolveTraits } from "#project/presets/utils/resolveTraits";

export const traitsSection = declareSection({
  name: "traits",
  async resolve(_input, config) {
    return resolveTraits(
      await config.resolve(presetSection),
      await config.resolve(traitAdjustmentsSection),
    );
  },
});
