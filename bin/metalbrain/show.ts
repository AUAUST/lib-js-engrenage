import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Print entries of any record kind as a thin tree of kinds, then categories, the kind read from its ID's namespace, each entry headed by its ID and title with its other fields under it, in argument order within its kind; takes several IDs, printing nothing and naming every unknown ID when one is unknown.",
      )
      .argument("<ids...>", "the entries' IDs, such as `BL-3fa9c1 FR-08d2e7`");
  },
  action() {
    return import("#bin/metalbrain/actions/show");
  },
  parse(ids) {
    return [ids];
  },
});
