import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "List each backlog category from the generated `.ai/backlog/index.yml`, one line each: its name, entry count and purpose, the product or behavior it owns. File an entry under the category owning the dependency family or subsystem that must change.",
    );
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/categories");
  },
});
