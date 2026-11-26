import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("List the backlog entries.")
      .argument("[category]", "list only this category's entries");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/list");
  },
});
