import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Report the recorded agent runs of a session by role and by agent, with token counts weighted into units: the current Claude session by default, else the latest recorded one.",
      )
      .argument("[session]", "session id");
  },
  action() {
    return import("#bin/engrenage/agents/actions/stats");
  },
});
