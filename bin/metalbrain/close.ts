import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Remove entries of any record kind, the kind read from each ID's namespace; takes several IDs, finding every entry before removing any, so one unknown ID removes nothing and every unknown ID is named.",
      )
      .argument("<ids...>", "the entries' IDs, such as `BL-3fa9c1 FR-08d2e7`");
  },
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids) {
    return [ids];
  },
});
