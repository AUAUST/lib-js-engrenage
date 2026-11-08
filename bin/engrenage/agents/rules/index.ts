import { defineGroup, defineLazyCommand } from "#workflows/cli/index";

import add from "#bin/engrenage/agents/rules/add";

export default defineGroup({
  configure(command) {
    return command.description("Select and install shared agent rules.");
  },
  commands: {
    add,
  },
  command: defineLazyCommand({
    configure(command) {
      return command;
    },
    action() {
      return import("#bin/engrenage/agents/rules/actions/add");
    },
    parse() {
      return [];
    },
  }),
});
