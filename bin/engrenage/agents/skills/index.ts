import { defineGroup } from "#workflows/cli/index";

import add from "#bin/engrenage/agents/skills/add";

export default defineGroup({
  configure(command) {
    return command.description("Select and install shared agent skills.");
  },
  commands: {
    add,
  },
  async action() {
    const { default: select } =
      await import("#bin/engrenage/agents/skills/actions/add");

    await select();
  },
});
