import { gateCache } from "#workflows/gate/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "workflows/gate",
  owns: {
    files: {
      "cache.gate": {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const cache = await config.resolve("cache");

          return { directory: cache.for(gateCache) };
        },
      },
    },
  },
} satisfies Extension;
