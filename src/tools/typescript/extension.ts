import { typescript } from "#tools/typescript/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/typescript",
  owns: {
    files: {
      "cache.typescript": {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const cache = await config.resolve("cache");

          return { directory: cache.for(typescript) };
        },
      },
    },
    parts: { "package.json#imports": true },
  },
} satisfies Extension;
