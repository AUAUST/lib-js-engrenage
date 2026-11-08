import { defineGroup, defineLazyCommand } from "#workflows/cli/index";

import add from "#bin/engrenage/agents/skills/add";

export default defineGroup({
  configure(command) {
    return command.description("Select and install shared agent skills.");
  },
  commands: {
    add,
  },
  command: defineLazyCommand({
    configure(command) {
      return command;
    },
    action() {
      return import("#bin/engrenage/agents/skills/actions/add");
    },
    parse() {
      return [];
    },
  }),
});
