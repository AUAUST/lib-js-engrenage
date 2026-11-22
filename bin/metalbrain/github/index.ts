import { defineGroup } from "#workflows/cli/index";

import fetch from "#bin/metalbrain/github/fetch";
import labels from "#bin/metalbrain/github/labels/index";

export default defineGroup({
  configure(command) {
    return command.description(
      "Snapshot GitHub metadata and sync the current repository's labels.",
    );
  },
  commands: {
    fetch,
    labels,
  },
});
