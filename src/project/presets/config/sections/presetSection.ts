import { declareSection } from "#foundation/options/index";
import { selectEntry, type ConfigResolver } from "#project/config/index";
import { presetSchema } from "#project/presets/config/schemas/presetSchema";
import type { PresetEntry } from "#project/presets/ports/PresetEntry";

export const presetSection = declareSection({
  declaration: presetSchema,
  async resolve(input, config: ConfigResolver): Promise<PresetEntry | false> {
    const name = presetSchema.resolve(input, undefined, "preset");

    if (name === undefined) {
      return false;
    }

    return selectEntry(config, "presets", { key: "preset", name });
  },
});
