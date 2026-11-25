import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "List the backlog entries as a thin tree of categories under `backlog`, one line each: ID and title.",
      )
      .argument("[category]", "list only this category's entries");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/list");
  },
});
