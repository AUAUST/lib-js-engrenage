import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove an entry once a backlog entry, an issue or a change takes it up, or once it no longer holds; closing the last entry deletes the file.",
      )
      .argument("<id>", "the entry's ID, as `YYMMDD-xxxx`");
  },
  action() {
    return import("#bin/metalbrain/logs/actions/close");
  },
  parse(id, _options, command) {
    return [command.parent?.name() ?? "", id];
  },
});
