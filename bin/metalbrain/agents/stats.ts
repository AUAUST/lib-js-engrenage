import { argument, command, option } from "#nexus/cli/index";

export default command({
  name: "stats",
  description: "Report the recorded agent runs of a session by role and by agent, with token counts weighted into units: the current Claude session by default, else the latest recorded one.",
  arguments: [
    argument({
      name: "session",
      description: "session id",
      optional: true,
    }),
  ],
  options: [
    option({
      name: "all",
      type: "boolean",
      description: "aggregate the runs of every session by role, model and day",
      default: false,
    }),
    option({
      name: "since",
      type: "string",
      placeholder: "date",
      description: "aggregate the runs started on or after this date by role, model and day",
    }),
    option({
      name: "outcome",
      type: "boolean",
      description: "aggregate the runs of every session, or those since --since, by hand-back outcome and by role with outcome",
      default: false,
    }),
  ],
  action() {
    return import("#bin/metalbrain/agents/actions/stats");
  },
});
