import { defineLogGroup } from "#bin/metalbrain/logs/index";
import { command } from "#nexus/cli/index";

import agents from "#bin/metalbrain/agents/index";
import backlog from "#bin/metalbrain/backlog/index";
import close from "#bin/metalbrain/close";
import debt from "#bin/metalbrain/debt";
import github from "#bin/metalbrain/github/index";
import hook from "#bin/metalbrain/hook/index";
import planning from "#bin/metalbrain/planning/index";
import search from "#bin/metalbrain/search";
import show from "#bin/metalbrain/show";

// @debt each log group restates its kind's `taps`, since importing the kinds here would load them into the hook's module graph; a test checks they agree
export default command({
  name: "metalbrain",
  description: "Run agent tooling: dispatch, planning, GitHub metadata, records and hooks.",
  subcommands: [
    agents,
    planning,
    github,
    backlog,
    defineLogGroup({ name: "friction", taps: true }),
    defineLogGroup({ name: "discarded", taps: true }),
    defineLogGroup({ name: "pending", taps: false }),
    defineLogGroup({ name: "missing", taps: true }),
    search,
    show,
    close,
    debt,
    hook,
  ],
});
