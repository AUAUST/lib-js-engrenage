import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Write `.ai/backlog/<category>.yml` with its purpose and no entries, and list it in the backlog index; refuses an existing category.",
      )
      .argument(
        "<category>",
        "the category's name: the dependency family or subsystem it owns, in lowercase words joined by dashes",
      )
      .argument("<purpose>", "the product or behavior the category owns");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/create");
  },
});
