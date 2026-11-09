import type { Extension } from "#project/config/index";

export default {
  name: "tools/lefthook",
  contributes: {
    "sync.targets": [
      {
        name: "lefthook",
        stage: "write",
        reads: ["gitignore"],
        async load() {
          const { syncLefthookConfig } =
            await import("#tools/lefthook/setup/syncLefthookConfig");

          return syncLefthookConfig;
        },
      },
    ],
  },
} satisfies Extension;
