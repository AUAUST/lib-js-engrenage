import { presetEntry } from "#project/presets/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `preset`, `traits` and `traits.adjustments` keys and the `presets`
 * slot, which takes one active preset, and contributes the `library` preset
 * with the `published` trait.
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
        load() {
          return import("#project/presets/config/sections/presetSection");
        },
      },
      "traits": {
        load() {
          return import("#project/presets/config/sections/traitsSection");
        },
      },
      "traits.adjustments": {
        input: "traits",
        load() {
          return import("#project/presets/config/sections/traitAdjustmentsSection");
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
