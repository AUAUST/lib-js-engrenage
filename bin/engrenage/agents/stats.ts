import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Report the recorded agent runs of a session by role and by agent, with token counts weighted into units: the current Claude session by default, else the latest recorded one.",
      )
      .argument("[session]", "session id")
      .option(
        "--all",
        "aggregate the runs of every session by role, model and day",
        false,
      )
      .option(
        "--since <date>",
        "aggregate the runs started on or after this date by role, model and day",
      )
      .option(
        "--outcome",
        "aggregate the runs of every session, or those since --since, by hand-back outcome and by role and planner mode with outcome",
        false,
      );
  },
  action() {
    return import("#bin/engrenage/agents/actions/stats");
  },
});
