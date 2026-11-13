import { lockfile, workspaceFile } from "#tools/pnpm/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Built-in pnpm extension: owns the lockfile and `pnpm-workspace.yaml`, and syncs
 * the workspace settings.
 */
export default {
  name: "tools/pnpm",
  owns: {
    files: {
      "pnpm-lock.yaml": {
        title: "pnpm",
        formatted: false,
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
        async load() {
          const {
            syncWorkspaceFile,
          } = await import("#tools/pnpm/setup/syncWorkspaceFile");

          return syncWorkspaceFile;
        },
      },
    ],
  },
} satisfies Extension;
