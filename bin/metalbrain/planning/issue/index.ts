import { defineGroup } from "#nexus/cli/index";

import check from "#bin/metalbrain/planning/issue/check";
import claim from "#bin/metalbrain/planning/issue/claim";
import create from "#bin/metalbrain/planning/issue/create";
import publish from "#bin/metalbrain/planning/issue/publish";
import release from "#bin/metalbrain/planning/issue/release";

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
