import { vite } from "#tools/vite/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/vite",
  when: { installed: vite },
  owns: {
    files: {
      "cache.vite": {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const cache = await config.resolve("cache");

          return { directory: cache.for(vite) };
        },
      },
    },
  },
} satisfies Extension;
