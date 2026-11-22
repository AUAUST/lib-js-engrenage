import { defineGroup } from "#workflows/cli/index";

import PostToolUse from "#bin/engrenage-hook/claude/postToolUse";
import PreToolUse from "#bin/engrenage-hook/claude/preToolUse";
import Stop from "#bin/engrenage-hook/claude/stop";

export default defineGroup({
  configure(command) {
    return command.description("Run the Claude Code hooks of the project.");
  },
  commands: {
    PreToolUse,
    PostToolUse,
    Stop,
  },
});
