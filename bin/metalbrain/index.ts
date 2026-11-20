import { defineGroup } from "#workflows/cli/index";

import hook from "#bin/metalbrain/hook/index";

export default defineGroup({
  configure(command) {
    return command.description(
      "Record what agents do, starting with their tool calls, under the project's stats.",
    );
  },
  commands: {
    hook,
  },
});
