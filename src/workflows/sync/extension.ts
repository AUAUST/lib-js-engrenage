import type { Extension } from "#project/config/index";
import type { SyncStage } from "#project/sync/index";
import { syncDoneEntry, syncTargetEntry } from "#workflows/sync/constants";

export default {
  name: "workflows/sync",
  owns: {
    slots: {
      "sync.targets": {
        stages: ["write", "check"] satisfies readonly SyncStage[],
        edges: { kinds: ["files", "parts"] },
        entry: syncTargetEntry,
      },
      "sync.done": { kind: "hook", entry: syncDoneEntry },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: "package",
        stage: "write",
        reads: ["tsconfig"],
        produces: ["package.json"],
        async load() {
          const { syncPackageJson } =
            await import("#workflows/sync/setup/syncPackageJson");

          return syncPackageJson;
        },
      },
      {
        name: "publishing",
        stage: "check",
        reads: ["package.json"],
        async load() {
          const { checkPublishing } =
            await import("#workflows/sync/setup/checkPublishing");

          return checkPublishing;
        },
      },
    ],
  },
} satisfies Extension;
