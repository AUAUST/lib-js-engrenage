import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `cache` config key and the uncommitted cache directory it resolves.
 */
export default {
  name: "project/cache",
  owns: {
    keys: {
      cache: {
        input: "cache",
        async load() {
          const {
            cacheSection,
          } = await import("#project/cache/config/sections/cacheSection");

          return cacheSection;
        },
      },
    },
    files: {
      cache: {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const { dir } = await config.resolve("cache");

          return { directory: dir };
        },
      },
    },
  },
} satisfies Extension;
