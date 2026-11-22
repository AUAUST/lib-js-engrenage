import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "List the backlog entries, one line each: ID, category and title.",
      )
      .argument("[category]", "list only this category's entries");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/list");
  },
});
