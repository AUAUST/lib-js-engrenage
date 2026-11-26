import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "List the backlog categories with their purposes.",
    );
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/categories");
  },
});
