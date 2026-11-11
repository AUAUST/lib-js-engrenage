import { defineGroup } from "#workflows/cli/index";

import fetch from "#bin/engrenage/github/fetch";

export default defineGroup({
  configure(command) {
    return command.description(
      "Snapshot GitHub metadata of the registered repositories.",
    );
  },
  commands: {
    fetch,
  },
});
