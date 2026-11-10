import { jscpd } from "#tools/jscpd/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/jscpd",
  when: {
    installed: jscpd,
  },
  owns: {
    files: {
      "cache.jscpd": {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const cache = await config.resolve("cache");

          return { directory: cache.for(jscpd) };
        },
      },
    },
  },
  contributes: {
    "gate.steps": [
      // @debt duplicated code only warns until the project's existing clones are cleaned up; it should then fail the gate like the other checks
      {
        name: jscpd,
        stage: "warnings",
        audience: "agents",
        async load() {
          const {
            warnClones,
          } = await import("#tools/jscpd/operations/warnClones");

          return warnClones;
        },
      },
    ],
  },
} satisfies Extension;
