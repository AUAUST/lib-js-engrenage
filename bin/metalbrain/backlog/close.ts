import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove a resolved or obsolete backlog entry, or one a GitHub issue now tracks in full; closing a category's last entry deletes that category.",
      )
      .argument("<id>", "the entry's ID, as `YYMMDD-xxxx`");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/close");
  },
});
