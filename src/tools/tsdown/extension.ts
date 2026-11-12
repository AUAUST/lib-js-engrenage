import { tsdown } from "#tools/tsdown/constants";
import type { Extension, FileLocation } from "#project/config/index";

// @debt the extension owns no config key, so its options come only from definer arguments
export default {
  name: "tools/tsdown",
  when: {
    installed: tsdown,
  },
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
  contributes: {
    "build.tools": [{ name: tsdown, package: tsdown }],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface BuildTools {
      tsdown: true;
    }
  }
}
