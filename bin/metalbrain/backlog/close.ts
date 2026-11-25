import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove resolved or obsolete backlog entries, or ones a GitHub issue now tracks in full; takes several IDs, finding every entry before removing any, so one unknown ID removes nothing and every unknown ID is named. Closing a category's last entry deletes that category.",
      )
      .argument("<ids...>", "the entries' IDs, as `BL-xxxxxx`");
  },
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids) {
    return [ids, "backlog"];
  },
});
