import { gateCache, gateStepEntry } from "#workflows/gate/constants";
import type { Extension, FileLocation } from "#project/config/index";
import type { GateStage } from "#project/gate/index";

export default {
  name: "workflows/gate",
  owns: {
    files: {
      "cache.gate": {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const cache = await config.resolve("cache");

          return { directory: cache.for(gateCache) };
        },
      },
    },
    slots: {
      "gate.steps": {
        stages: [
          "fixes",
          "checks",
          "commands",
          "warnings",
        ] satisfies readonly GateStage[],
        entry: gateStepEntry,
      },
    },
  },
} satisfies Extension;
