import { defineGroup, defineLazyCommand } from "#nexus/cli/index";

import add from "#bin/metalbrain/agents/rules/add";

export default defineGroup({
  configure(command) {
    return command.description("Select and install shared agent rules.");
  },
  commands: {
    add,
  },
  command: defineLazyCommand({
    action() {
      return import("#bin/metalbrain/agents/rules/actions/add");
    },
  }),
});
