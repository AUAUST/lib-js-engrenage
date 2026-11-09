import { jscpd } from "#tools/jscpd/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/jscpd",
  when: { installed: jscpd },
  owns: {
    files: {
      "cache.jscpd": {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const cache = await config.resolve("cache");

          return { directory: cache.for(jscpd) };
        },
      },
    },
  },
} satisfies Extension;
