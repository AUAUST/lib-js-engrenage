import type { Extension } from "#project/config/index";

/**
 * Owns the `debug` config key, read from the `debug` input.
 */
export default {
  name: "workflows/cli",
  owns: {
    keys: {
      debug: {
        input: "debug",
        async load() {
          const {
            debugSection,
          } = await import("#workflows/cli/config/sections/debugSection");

          return debugSection;
        },
      },
    },
  },
} satisfies Extension;
