import { defineGroup } from "#workflows/cli/index";

import upgrade from "#bin/engrenage/pnpm/upgrade";

export default defineGroup({
  configure(command) {
    return command.description("Manage the pnpm version of the project.");
  },
  commands: {
    upgrade,
  },
});
