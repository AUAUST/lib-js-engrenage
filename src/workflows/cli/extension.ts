import { commandContribution } from "#workflows/cli/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `cli.commands` slot and the `debug` config key, read from
 * the `debug` input.
 */
export default {
  name: "workflows/cli",
  owns: {
    slots: {
      "cli.commands": { entry: commandContribution },
    },
    keys: {
      debug: {
        scope: "project",
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
