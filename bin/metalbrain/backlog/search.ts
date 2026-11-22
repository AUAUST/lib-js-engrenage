import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "List the backlog entries holding a keyword in any field, ID included, ignoring case, one line each: ID, category and title.",
      )
      .argument("<keyword>", "text to find");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/search");
  },
});
