import {
  blockSyntaxEntry,
  syncDoneEntry,
  syncStages,
  syncTargetEntry,
} from "#project/sync/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `sync.targets` slot, ordered by stage then by the files and parts its
 * targets read and produce, and the `sync.done` hook, emitted once every selected
 * target ran and their staged changes are formatted, and the `blocks.syntaxes`
 * slot, read by the `blocks` target filling every directive's blocks.
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
      "blocks.syntaxes": {
        entry: blockSyntaxEntry,
      },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: "blocks",
        stage: "fill",
        async load() {
          const {
            syncDirectiveBlocks,
          } = await import("#project/sync/setup/syncDirectiveBlocks");

          return syncDirectiveBlocks;
        },
      },
    ],
  },
} satisfies Extension;
