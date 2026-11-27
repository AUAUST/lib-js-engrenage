import { defineLogGroup, search } from "#bin/metalbrain/logs/index";
import { argument, command } from "#nexus/cli/index";

import agents from "#bin/metalbrain/agents/index";
import backlog from "#bin/metalbrain/backlog/index";
import github from "#bin/metalbrain/github/index";
import hook from "#bin/metalbrain/hook/index";
import planning from "#bin/metalbrain/planning/index";

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
    command({
      name: "show",
      description: "Print entries of any record kind in full.",
      arguments: [
        argument({
          name: "ids",
          description: "the entries' IDs of any kinds",
          variadic: true,
          separator: ",",
        }),
      ],
      action() {
        return import("#bin/metalbrain/actions/show");
      },
    }),
    command({
      name: "close",
      description: "Remove entries of any record kind, none when an ID is unknown.",
      arguments: [
        argument({
          name: "ids",
          description: "the entries' IDs of any kinds",
          variadic: true,
          separator: ",",
        }),
      ],
      action() {
        return import("#bin/metalbrain/actions/close");
      },
    }),
    command({
      name: "debt",
      description: "List the @debt markers of the project.",
      action() {
        return import("#bin/metalbrain/actions/debt");
      },
    }),
    hook,
  ],
});
