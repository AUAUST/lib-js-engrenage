import { defineGroup } from "#nexus/cli/index";

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
