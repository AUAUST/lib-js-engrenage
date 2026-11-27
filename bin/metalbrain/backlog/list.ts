import { argument, command } from "#nexus/cli/index";

export default command({
  name: "list",
  description: "List the backlog entries.",
  arguments: [
    argument({
      name: "category",
      description: "list only this category's entries",
      optional: true,
    }),
  ],
  action() {
    return import("#bin/metalbrain/backlog/actions/list");
  },
});
