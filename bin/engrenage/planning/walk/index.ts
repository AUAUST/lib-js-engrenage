import { defineGroup } from "#workflows/cli/index";

import check from "#bin/engrenage/planning/walk/check";

export default defineGroup({
  configure(command) {
    return command.description("Check a walked issue tree.");
  },
  commands: {
    check,
  },
});
