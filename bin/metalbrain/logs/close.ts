import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove entries once a backlog entry, an issue or a change takes them up, or once they no longer hold; takes several IDs, finding every entry before removing any, so one unknown ID removes nothing and every unknown ID is named. Closing the last entry deletes the file.",
      )
      .argument("<ids...>", "the entries' IDs, as `<namespace>-xxxxxx`");
  },
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids, _options, command) {
    return [ids, command.parent?.name() ?? ""];
  },
});
