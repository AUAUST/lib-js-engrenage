import { defineGroup } from "#workflows/cli/index";

import PostToolUse from "#bin/metalbrain/hook/claude/postToolUse";
import PreToolUse from "#bin/metalbrain/hook/claude/preToolUse";
import Stop from "#bin/metalbrain/hook/claude/stop";
import SubagentStart from "#bin/metalbrain/hook/claude/subagentStart";
import SubagentStop from "#bin/metalbrain/hook/claude/subagentStop";
import thoroughness from "#bin/metalbrain/hook/claude/thoroughness";

export default defineGroup({
  configure(command) {
    return command.description("Run the metalbrain Claude Code hooks.");
  },
  commands: {
    PreToolUse,
    PostToolUse,
    SubagentStart,
    Stop,
    SubagentStop,
    thoroughness,
  },
});
