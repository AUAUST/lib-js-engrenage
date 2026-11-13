import {
  syncDoneEntry,
  syncStages,
  syncTargetEntry,
} from "#project/sync/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `sync.targets` slot, ordered by stage then by the files and parts
 * its targets read and produce, and the `sync.done` hook, emitted once every
 * selected target ran.
 */
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
