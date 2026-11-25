import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Move a backlog entry, its ID kept, to the end of another category, so references to it stay valid; moving a category's last entry deletes that category.",
      )
      .argument("<id>", "the entry's ID, as `BL-xxxxxx`")
      .argument("<category>", "an existing category's name");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/move");
  },
});
