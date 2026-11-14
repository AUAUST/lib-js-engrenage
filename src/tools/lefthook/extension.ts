import { lefthookFile } from "#tools/lefthook/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns `lefthook.yml` and syncs it.
 */
export default {
  name: "tools/lefthook",
  owns: {
    files: {
      "lefthook.yml": {
        title: "Lefthook",
        locate(): FileLocation {
          return { file: lefthookFile };
        },
      },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: "lefthook",
        stage: "write",
        reads: ["gitignore"],
        async load() {
          const {
            syncLefthookConfig,
          } = await import("#tools/lefthook/setup/syncLefthookConfig");

          return syncLefthookConfig;
        },
      },
    ],
  },
} satisfies Extension;
