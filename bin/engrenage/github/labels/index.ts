import { defineGroup } from "#workflows/cli/index";

import prune from "#bin/engrenage/github/labels/prune";
import sync from "#bin/engrenage/github/labels/sync";

export default defineGroup({
  configure(command) {
    return command.description(
      "Sync the current repository's labels with the config.",
    );
  },
  commands: {
    sync,
    prune,
  },
});
