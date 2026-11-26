import { defineGroup } from "#nexus/cli/index";

import check from "#bin/metalbrain/planning/walk/check";

export default defineGroup({
  configure(command) {
    return command.description("Check a walked issue tree.");
  },
  commands: {
    check,
  },
});
