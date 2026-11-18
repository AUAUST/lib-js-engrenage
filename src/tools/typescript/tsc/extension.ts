import { typescript } from "#tools/typescript/tsc/constants";
import type { Extension } from "#project/config/index";

/**
 * Active when `typescript` is installed; runs type checking in the agents' gate.
 */
export default {
  name: "tools/typescript/tsc",
  when: {
    installed: typescript,
  },
  contributes: {
    "gate.steps": [
      {
        name: "typecheck",
        stage: "checks",
        audience: "agents",
        load() {
          return import("#tools/typescript/tsc/operations/checkTypes");
        },
        check: {
          load() {
            return import("#tools/typescript/tsc/operations/checkTypes");
          },
        },
      },
    ],
  },
} satisfies Extension;
