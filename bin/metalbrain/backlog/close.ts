import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove backlog entries, none when an ID is unknown; deletes a category left empty.",
      )
      .argument("<ids...>", "the entries' IDs");
  },
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids) {
    return [ids, "backlog"];
  },
});
