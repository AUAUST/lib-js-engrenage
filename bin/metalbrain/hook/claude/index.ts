import { command } from "#nexus/cli/index";

import postToolUse from "#bin/metalbrain/hook/claude/postToolUse";
import preToolUse from "#bin/metalbrain/hook/claude/preToolUse";
import stop from "#bin/metalbrain/hook/claude/stop";
import subagentStart from "#bin/metalbrain/hook/claude/subagentStart";
import subagentStop from "#bin/metalbrain/hook/claude/subagentStop";
import thoroughness from "#bin/metalbrain/hook/claude/thoroughness";

export default command({
  name: "claude",
  description: "Run the metalbrain Claude Code hooks.",
  subcommands: [
    preToolUse,
    postToolUse,
    subagentStart,
    stop,
    subagentStop,
    thoroughness,
  ],
});
