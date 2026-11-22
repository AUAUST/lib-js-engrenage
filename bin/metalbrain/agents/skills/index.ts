import { defineGroup, defineLazyCommand } from "#workflows/cli/index";

import add from "#bin/metalbrain/agents/skills/add";

export default defineGroup({
  configure(command) {
    return command.description("Select and install shared agent skills.");
  },
  commands: {
    add,
  },
  command: defineLazyCommand({
    action() {
      return import("#bin/metalbrain/agents/skills/actions/add");
    },
  }),
});
