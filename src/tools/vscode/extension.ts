import { extensionsFile, settingsFile } from "#tools/vscode/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns `.vscode/settings.json`, `.vscode/extensions.json` and the `vscode` config
 * key, and syncs both files.
 */
export default {
  name: "tools/vscode",
  owns: {
    files: {
      "vscode.settings": {
        title: "VS Code",
        locate(): FileLocation {
          return { file: settingsFile };
        },
      },
      "vscode.extensions": {
        title: "VS Code",
        locate(): FileLocation {
          return { file: extensionsFile };
        },
      },
    },
    keys: {
      vscode: {
        input: "vscode",
        load() {
          return import("#tools/vscode/config/sections/vscodeSection");
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
        load() {
          return import("#tools/vscode/setup/syncVscodeFiles");
        },
      },
    ],
  },
} satisfies Extension;
