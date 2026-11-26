import { buildSourcesFile, tsdown } from "#tools/tsdown/constants";
import type { Extension, FileLocation } from "#project/config/index";

// @debt the extension owns no config key, so its options come only from definer arguments
/**
 * Active when `tsdown` is installed; owns its cache and the record of the sources
 * its builds consumed, and registers tsdown as a build tool.
 */
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
      "state.build-sources": {
        title: "Build sources",
        committed: false,
        locate(): FileLocation {
          return { file: buildSourcesFile };
        },
      },
    },
  },
  contributes: {
    "build.tools": [
      {
        name: tsdown,
        package: tsdown,
        outDir: "dist",
        bundled: false,
      },
    ],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface BuildTools {
      tsdown: true;
    }
  }
}
