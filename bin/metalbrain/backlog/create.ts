import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Create an empty backlog category.")
      .argument("<category>", "lowercase words joined by dashes")
      .argument("<purpose>", "the product or behavior the category owns");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/create");
  },
});
