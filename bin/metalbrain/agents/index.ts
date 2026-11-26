import { defineGroup } from "#nexus/cli/index";

import check from "#bin/metalbrain/agents/check";
import dispatch from "#bin/metalbrain/agents/dispatch";
import rules from "#bin/metalbrain/agents/rules/index";
import skills from "#bin/metalbrain/agents/skills/index";
import stats from "#bin/metalbrain/agents/stats";

export default defineGroup({
  configure(command) {
    return command.description(
      "Check agent integration, dispatch agents, report their runs and install shared rules and skills.",
    );
  },
  commands: {
    check,
    dispatch,
    rules,
    skills,
    stats,
  },
});
