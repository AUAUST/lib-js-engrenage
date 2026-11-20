import { defineGroup } from "#workflows/cli/index";

import claude from "#bin/metalbrain/hook/claude/index";

export default defineGroup({
  configure(command) {
    return command.description(
      "Run the metalbrain agent hooks, reading each runtime's hook payload from stdin.",
    );
  },
  commands: {
    claude,
  },
});
