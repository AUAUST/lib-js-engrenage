import { lockfile, workspaceFile } from "#tools/pnpm/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the lockfile and `pnpm-workspace.yaml`, and syncs the workspace settings.
 */
export default {
  name: "tools/pnpm",
  owns: {
    files: {
      "pnpm-lock.yaml": {
        title: "pnpm",
        generated: true,
        formatted: false,
        diffed: false,
        locate(): FileLocation {
          return { file: lockfile };
        },
      },
      "pnpm-workspace.yaml": {
        title: "pnpm",
        locate(): FileLocation {
          return { file: workspaceFile };
        },
      },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: "pnpm",
        stage: "write",
        load() {
          return import("#tools/pnpm/setup/syncWorkspaceFile");
        },
      },
    ],
  },
} satisfies Extension;
