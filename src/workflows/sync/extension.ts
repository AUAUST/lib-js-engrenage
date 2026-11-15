import type { Extension } from "#project/config/index";

/**
 * Contributes the agents' `sync --check` gate step and the sync targets writing
 * `package.json`, then checking its publishing.
 */
export default {
  name: "workflows/sync",
  contributes: {
    "gate.steps": [
      {
        name: "sync --check",
        stage: "checks",
        audience: "agents",
        load() {
          return import("#workflows/sync/operations/runSyncCheck");
        },
      },
    ],
    "sync.targets": [
      {
        name: "package",
        stage: "write",
        reads: ["tsconfig"],
        produces: ["package.json"],
        load() {
          return import("#workflows/sync/setup/syncPackageJson");
        },
      },
      {
        name: "publishing",
        stage: "check",
        reads: ["package.json"],
        load() {
          return import("#workflows/sync/setup/checkPublishing");
        },
      },
    ],
  },
} satisfies Extension;
