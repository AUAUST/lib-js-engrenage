import { vitest } from "#tools/vitest/constants";
import type { Extension } from "#project/config/index";

export default {
  name: "tools/vitest",
  when: {
    installed: vitest,
  },
  contributes: {
    "gate.steps": [
      {
        name: "vitest",
        stage: "checks",
        audience: "agents",
        async load() {
          const {
            runGateTests,
          } = await import("#tools/vitest/operations/runGateTests");

          return runGateTests;
        },
      },
    ],
  },
} satisfies Extension;
