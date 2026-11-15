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
        load() {
          return import("#workflows/cli/config/sections/debugSection");
        },
      },
    },
  },
} satisfies Extension;
