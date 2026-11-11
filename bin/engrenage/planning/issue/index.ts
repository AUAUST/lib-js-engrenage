import { defineGroup } from "#workflows/cli/index";

import check from "#bin/engrenage/planning/issue/check";
import create from "#bin/engrenage/planning/issue/create";

export default defineGroup({
  configure(command) {
    return command.description(
      "Create and check issue drafts, and check published issues.",
    );
  },
  commands: {
    create,
    check,
  },
});
