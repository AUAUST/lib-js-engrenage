import { defineGroup } from "#workflows/cli/index";

import dispatch from "#bin/engrenage/agents/claude/hook/dispatch";
import git from "#bin/engrenage/agents/claude/hook/git";
import github from "#bin/engrenage/agents/claude/hook/github";
import record from "#bin/engrenage/agents/claude/hook/record";
import stop from "#bin/engrenage/agents/claude/hook/stop";

export default defineGroup({
  configure(command) {
    return command.description("Run the Claude Code hooks of the project.");
  },
  commands: {
    dispatch,
    git,
    github,
    record,
    stop,
  },
});
