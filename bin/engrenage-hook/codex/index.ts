import { defineGroup } from "#workflows/cli/index";

import PreToolUse from "#bin/engrenage-hook/codex/preToolUse";
import SubagentStop from "#bin/engrenage-hook/codex/subagentStop";

export default defineGroup({
  configure(command) {
    return command.description("Run the Codex hooks of the project.");
  },
  commands: {
    PreToolUse,
    SubagentStop,
  },
});
