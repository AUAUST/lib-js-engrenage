import { declareSection } from "#foundation/options/index";
import { resolveTraits } from "#project/presets/utils/resolveTraits";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedTraits } from "#project/presets/types/ResolvedTraits";

export const traitsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedTraits> {
    const preset = await config.resolve("preset");

    return resolveTraits(
      preset === false ? [] : preset.traits,
      await config.resolve("traits.adjustments"),
    );
  },
});
