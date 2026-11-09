import { vitest } from "#tools/vitest/constants";
import type { Extension } from "#project/config/index";

export default {
  name: "tools/vitest",
  when: { installed: vitest },
  contributes: {
    "gate.steps": [
      {
        name: "vitest related",
        stage: "checks",
        audience: "agents",
        async load() {
          const { runRelatedTests } =
            await import("#tools/vitest/operations/runRelatedTests");

          return runRelatedTests;
        },
      },
    ],
  },
} satisfies Extension;
