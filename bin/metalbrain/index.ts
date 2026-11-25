import { defineGroup } from "#workflows/cli/index";

import agents from "#bin/metalbrain/agents/index";
import backlog from "#bin/metalbrain/backlog/index";
import close from "#bin/metalbrain/close";
import debt from "#bin/metalbrain/debt";
import github from "#bin/metalbrain/github/index";
import hook from "#bin/metalbrain/hook/index";
import logs from "#bin/metalbrain/logs/index";
import planning from "#bin/metalbrain/planning/index";
import show from "#bin/metalbrain/show";

export default defineGroup({
  configure(command) {
    return command.description(
      "Run the agent commands: agent integration, dispatch and runs, issue planning, GitHub metadata, the shared backlog, the friction, discarded, pending and missing logs, entries of any record kind by ID, debt markers, and the hooks recording what agents do.",
    );
  },
  commands: {
    agents,
    planning,
    github,
    backlog,
    friction: logs,
    discarded: logs,
    pending: logs,
    missing: logs,
    show,
    close,
    debt,
    hook,
  },
});
