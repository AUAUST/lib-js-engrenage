import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Count the entries per subject, flagging recurring subjects.",
    );
  },
  action() {
    return import("#bin/metalbrain/logs/actions/stats");
  },
  parse(_options, command) {
    return [command.parent?.name() ?? ""];
  },
});
