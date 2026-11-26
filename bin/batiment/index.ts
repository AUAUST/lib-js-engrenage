// @debt builds on engrenage's `workflows/cli` helpers until they move to nexus (BL-4e55ba)
import { defineGroup } from "#workflows/cli/index";

import map from "#bin/batiment/map";

export default defineGroup({
  configure(command) {
    return command.description(
      "Walk the project structure and report how batiment classifies it.",
    );
  },
  commands: {
    map,
  },
});
