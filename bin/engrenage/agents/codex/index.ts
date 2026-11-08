import { defineGroup } from "#workflows/cli/index";

import hook from "#bin/engrenage/agents/codex/hook/index";

export default defineGroup({
  configure(command) {
    return command.description("Integrate the project tools with Codex.");
  },
  commands: {
    hook,
  },
});
