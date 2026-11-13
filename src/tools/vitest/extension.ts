import { vitest } from "#tools/vitest/constants";
import type { Extension } from "#project/config/index";

// @debt the extension owns no config key, so its options come only from definer arguments
/**
 * Built-in Vitest extension, active when `vitest` is installed: runs the tests
 * in the agents' gate.
 */
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
