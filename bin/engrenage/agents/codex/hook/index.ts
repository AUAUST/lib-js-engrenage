import { defineGroup } from "#workflows/cli/index";

import dispatch from "#bin/engrenage/agents/codex/hook/dispatch";
import github from "#bin/engrenage/agents/codex/hook/github";
import stop from "#bin/engrenage/agents/codex/hook/stop";

export default defineGroup({
  configure(command) {
    return command.description("Run the Codex hooks of the project.");
  },
  commands: {
    dispatch,
    stop,
    github,
  },
});
