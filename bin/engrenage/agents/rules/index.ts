import { defineGroup } from "#workflows/cli/index";

import add from "#bin/engrenage/agents/rules/add";

export default defineGroup({
  configure(command) {
    return command.description("Select and install shared agent rules.");
  },
  commands: {
    add,
  },
  async action() {
    const { default: select } =
      await import("#bin/engrenage/agents/rules/actions/add");

    await select();
  },
});
