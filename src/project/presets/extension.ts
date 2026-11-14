import { presetEntry } from "#project/presets/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `preset`, `traits` and `traits.adjustments` keys and the `presets`
 * slot, which takes one active preset, and contributes the `library` preset with
 * the `published` trait.
 */
export default {
  name: "project/presets",
  owns: {
    slots: {
      presets: { cardinality: "one", entry: presetEntry },
    },
    keys: {
      "preset": {
        input: "preset",
        async load() {
          const {
            presetSection,
          } = await import("#project/presets/config/sections/presetSection");

          return presetSection;
        },
      },
      "traits": {
        async load() {
          const {
            traitsSection,
          } = await import("#project/presets/config/sections/traitsSection");

          return traitsSection;
        },
      },
      "traits.adjustments": {
        input: "traits",
        async load() {
          const {
            traitAdjustmentsSection,
          } = await import("#project/presets/config/sections/traitAdjustmentsSection");

          return traitAdjustmentsSection;
        },
      },
    },
  },
  contributes: {
    presets: [{ name: "library", traits: ["published"] }],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface Presets {
      library: true;
    }
  }
}
