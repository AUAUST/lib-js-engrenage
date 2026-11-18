import { linksFile, lockfile, workspaceFile } from "#tools/pnpm/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the lockfile, `pnpm-workspace.yaml` and the uncommitted record of linked
 * checkouts, syncs the workspace settings and checks the linked symlinks.
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
      "state.links": {
        title: "Linked checkouts",
        committed: false,
        locate(): FileLocation {
          return { file: linksFile };
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
      {
        name: "links",
        stage: "check",
        load() {
          return import("#tools/pnpm/setup/checkLinks");
        },
      },
    ],
  },
} satisfies Extension;
