import { defineGroup } from "#workflows/cli/index";

import check from "#bin/engrenage/planning/issue/check";
import claim from "#bin/engrenage/planning/issue/claim";
import create from "#bin/engrenage/planning/issue/create";
import publish from "#bin/engrenage/planning/issue/publish";
import release from "#bin/engrenage/planning/issue/release";

export default defineGroup({
  configure(command) {
    return command.description(
      "Create, claim, check and publish issue drafts, release stale claims, and check published issues.",
    );
  },
  commands: {
    create,
    claim,
    check,
    publish,
    release,
  },
});
