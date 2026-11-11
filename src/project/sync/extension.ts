import {
  syncDoneEntry,
  syncStages,
  syncTargetEntry,
} from "#project/sync/constants";
import type { Extension } from "#project/config/index";

export default {
  name: "project/sync",
  owns: {
    slots: {
      "sync.targets": {
        stages: syncStages,
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
