import type { Extension } from "#project/config/index";

/**
 * Owns the `generators` config key; runs the generators first in every gate
 * run but the Git hook's.
 */
export default {
  name: "project/generators",
  owns: {
    keys: {
      generators: {
        input: "generators",
        async load() {
          const {
            generatorsSection,
          } = await import("#project/generators/config/sections/generatorsSection");

          return generatorsSection;
        },
      },
    },
  },
  contributes: {
    "gate.steps": [
      {
        name: "generators",
        stage: "generate",
        audience: "agents",
        async load() {
          const {
            regenerateChanged,
          } = await import("#project/generators/operations/regenerateChanged");

          return regenerateChanged;
        },
        check: {
          async load() {
            const {
              regenerateAll,
            } = await import("#project/generators/operations/regenerateAll");

            return regenerateAll;
          },
        },
      },
    ],
  },
} satisfies Extension;
