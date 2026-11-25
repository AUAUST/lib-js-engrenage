import { defineGroup } from "#workflows/cli/index";

import agents from "#bin/metalbrain/agents/index";
import backlog from "#bin/metalbrain/backlog/index";
import close from "#bin/metalbrain/close";
import debt from "#bin/metalbrain/debt";
import github from "#bin/metalbrain/github/index";
import hook from "#bin/metalbrain/hook/index";
import logs from "#bin/metalbrain/logs/index";
import planning from "#bin/metalbrain/planning/index";
import search from "#bin/metalbrain/search";
import show from "#bin/metalbrain/show";

export default defineGroup({
  configure(command) {
    return command.description(
      "Run agent tooling: dispatch, planning, GitHub metadata, records and hooks.",
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
    search,
    show,
    close,
    debt,
    hook,
  },
});
