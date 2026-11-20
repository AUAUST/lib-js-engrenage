import { defineGroup } from "#workflows/cli/index";

import PostToolUse from "#bin/metalbrain/hook/claude/postToolUse";
import PreToolUse from "#bin/metalbrain/hook/claude/preToolUse";

export default defineGroup({
  configure(command) {
    return command.description("Run the metalbrain Claude Code hooks.");
  },
  commands: {
    PreToolUse,
    PostToolUse,
  },
});
