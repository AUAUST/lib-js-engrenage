import { defineGroup } from "#workflows/cli/index";

import agents from "#bin/metalbrain/agents/index";
import backlog from "#bin/metalbrain/backlog/index";
import github from "#bin/metalbrain/github/index";
import hook from "#bin/metalbrain/hook/index";
import planning from "#bin/metalbrain/planning/index";

export default defineGroup({
  configure(command) {
    return command.description(
      "Run the agent commands: agent integration, dispatch and runs, issue planning, GitHub metadata, the shared backlog, and the hooks recording what agents do.",
    );
  },
  commands: {
    agents,
    planning,
    github,
    backlog,
    hook,
  },
});
