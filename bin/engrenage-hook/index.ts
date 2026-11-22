import { defineGroup } from "#workflows/cli/index";

import claude from "#bin/engrenage-hook/claude/index";

export default defineGroup({
  configure(command) {
    return command.description(
      "Run the project's agent hooks, reading each runtime's hook payload from stdin.",
    );
  },
  commands: {
    claude,
  },
});
