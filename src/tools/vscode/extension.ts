import type { Extension } from "#project/config/index";

export default {
  name: "tools/vscode",
  owns: {
    keys: {
      vscode: {
        input: "vscode",
        async load() {
          const {
            vscodeSection,
          } = await import("#tools/vscode/config/sections/vscodeSection");

          return vscodeSection;
        },
      },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: "vscode",
        stage: "write",
        flags: {
          settings: "create .vscode/settings.json when it is missing",
          extensions: "create .vscode/extensions.json when it is missing",
        },
        async load() {
          const {
            syncVscodeFiles,
          } = await import("#tools/vscode/setup/syncVscodeFiles");

          return syncVscodeFiles;
        },
      },
    ],
  },
} satisfies Extension;
