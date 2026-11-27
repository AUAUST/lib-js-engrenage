import { defineLogGroup, search } from "#bin/metalbrain/logs/index";
import { argument, command, type CommandDeclaration } from "#nexus/cli/index";

import agents from "#bin/metalbrain/agents/index";
import backlog from "#bin/metalbrain/backlog/index";
import github from "#bin/metalbrain/github/index";
import planning from "#bin/metalbrain/planning/index";

// @debt each log group restates its kind's `taps`, since importing the kinds here would load them for every command; a test checks they agree
const builtins: readonly CommandDeclaration[] = [
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
];

export default builtins;
