import { defineGroup } from "#workflows/cli/index";

import issue from "#bin/engrenage/planning/issue/index";
import walk from "#bin/engrenage/planning/walk/index";

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
