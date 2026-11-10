import type { Extension } from "#project/config/index";

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
