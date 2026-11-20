import { defineGroup } from "#workflows/cli/index";

import map from "#bin/engrenage/batiment/map";

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
