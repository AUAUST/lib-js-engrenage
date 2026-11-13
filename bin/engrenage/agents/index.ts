import { defineGroup } from "#workflows/cli/index";

import check from "#bin/engrenage/agents/check";
import claude from "#bin/engrenage/agents/claude/index";
import codex from "#bin/engrenage/agents/codex/index";
import rules from "#bin/engrenage/agents/rules/index";
import skills from "#bin/engrenage/agents/skills/index";
import stats from "#bin/engrenage/agents/stats";

export default defineGroup({
  configure(command) {
    return command.description("Integrate project tools with coding agents.");
  },
  commands: {
    check,
    claude,
    codex,
    rules,
    skills,
    stats,
  },
});
