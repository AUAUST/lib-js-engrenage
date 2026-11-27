import { argument, command } from "#nexus/cli/index";

export default command({
  name: "create",
  description: "Create an empty backlog category.",
  arguments: [
    argument({
      name: "category",
      description: "lowercase words joined by dashes",
    }),
    argument({
      name: "purpose",
      description: "the product or behavior the category owns",
    }),
  ],
  action() {
    return import("#bin/metalbrain/backlog/actions/create");
  },
});
