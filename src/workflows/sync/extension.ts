import type { Extension } from "#project/config/index";

/**
 * The built-in extension contributing the agents' `sync --check` gate step and
 * the sync targets writing `package.json`, then checking its publishing.
 */
export default {
  name: "workflows/sync",
  contributes: {
    "gate.steps": [
      {
        name: "sync --check",
        stage: "checks",
        audience: "agents",
        async load() {
          const {
            runSyncCheck,
          } = await import("#workflows/sync/operations/runSyncCheck");

          return runSyncCheck;
        },
      },
    ],
    "sync.targets": [
      {
        name: "package",
        stage: "write",
        reads: ["tsconfig"],
        produces: ["package.json"],
        async load() {
          const {
            syncPackageJson,
          } = await import("#workflows/sync/setup/syncPackageJson");

          return syncPackageJson;
        },
      },
      {
        name: "publishing",
        stage: "check",
        reads: ["package.json"],
        async load() {
          const {
            checkPublishing,
          } = await import("#workflows/sync/setup/checkPublishing");

          return checkPublishing;
        },
      },
    ],
  },
} satisfies Extension;
