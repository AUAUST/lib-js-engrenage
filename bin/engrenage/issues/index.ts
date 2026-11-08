import { defineGroup } from "#workflows/cli/index";

import check from "#bin/engrenage/issues/check";

export default defineGroup({
  configure(command) {
    return command.description(
      "Check GitHub issues against the issue contract.",
    );
  },
  commands: {
    check,
  },
});
