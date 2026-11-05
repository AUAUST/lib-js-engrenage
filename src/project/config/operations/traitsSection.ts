import { declareSection } from "#foundation/options/index";
import { presetSection } from "#project/config/operations/presetSection";
import { traitAdjustmentsSection } from "#project/config/operations/traitAdjustmentsSection";
import { resolveTraits } from "#project/presets/index";

export const traitsSection = declareSection({
  name: "traits",
  async resolve(_input, config) {
    return resolveTraits(
      await config.resolve(presetSection),
      await config.resolve(traitAdjustmentsSection),
    );
  },
});
