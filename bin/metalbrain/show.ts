import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Print entries of any record kind as YAML, each under its kind's name, the kind read from its ID's namespace.",
      )
      .argument("<ids...>", "the entries' IDs, such as `BL-3fa9c1 FR-08d2e7`");
  },
  action() {
    return import("#bin/metalbrain/actions/show");
  },
});
