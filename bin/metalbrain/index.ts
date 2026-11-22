import { defineGroup } from "#workflows/cli/index";

import backlog from "#bin/metalbrain/backlog/index";
import hook from "#bin/metalbrain/hook/index";

export default defineGroup({
  configure(command) {
    return command.description(
      "Run the agent commands: the shared backlog, and the hooks recording what agents do.",
    );
  },
  commands: {
    backlog,
    hook,
  },
});
