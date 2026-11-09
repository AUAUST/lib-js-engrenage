import { syncDoneEntry, syncTargetEntry } from "#project/sync/constants";
import type { Extension } from "#project/config/index";
import type { SyncStage } from "#project/sync/ports/SyncStage";

export default {
  name: "project/sync",
  owns: {
    slots: {
      "sync.targets": {
        stages: ["write", "check"] satisfies readonly SyncStage[],
        edges: { kinds: ["files", "parts"] },
        entry: syncTargetEntry,
      },
      "sync.done": {
        kind: "hook",
        entry: syncDoneEntry,
      },
    },
  },
} satisfies Extension;
