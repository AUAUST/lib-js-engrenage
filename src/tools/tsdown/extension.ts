import { tsdown } from "#tools/tsdown/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/tsdown",
  when: { installed: tsdown },
  owns: {
    files: {
      "cache.tsdown": {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const cache = await config.resolve("cache");

          return { directory: cache.for(tsdown) };
        },
      },
    },
  },
} satisfies Extension;
