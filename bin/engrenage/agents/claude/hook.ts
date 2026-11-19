import { Argument } from "@commander-js/extra-typings";

import { defineCommand } from "#workflows/cli/index";

// @debt remove once consumers have synced past the release introducing engrenage-hook
export default defineCommand({
  configure(command) {
    return command
      .description(
        "Legacy hook command of settings synced before engrenage-hook: runs no check.",
      )
      .addArgument(new Argument("[check]", "the check the settings name"));
  },
  action() {
    process.stdout.write(
      `${JSON.stringify({
        systemMessage: "engrenage agents claude hook is replaced by engrenage-hook, so its checks are off: run pnpm engrenage sync, then restart the session",
      })}\n`,
    );
  },
});
