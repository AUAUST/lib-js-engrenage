import type { Extension } from "#project/config/index";

export default {
  name: "project/cache",
  owns: {
    keys: {
      cache: {
        input: "cache",
        async load() {
          const { cacheSection } =
            await import("#project/cache/config/sections/cacheSection");

          return cacheSection;
        },
      },
    },
  },
} satisfies Extension;
