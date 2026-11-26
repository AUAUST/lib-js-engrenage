import { defineGroup } from "#nexus/cli/index";

import issue from "#bin/metalbrain/planning/issue/index";
import walk from "#bin/metalbrain/planning/walk/index";

export default defineGroup({
  configure(command) {
    return command.description(
      "Draft, publish and walk planned GitHub issues.",
    );
  },
  commands: {
    issue,
    walk,
  },
});
