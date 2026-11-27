import { command } from "#nexus/cli/index";

export default command({
  name: "categories",
  description: "List the backlog categories with their purposes.",
  action() {
    return import("#bin/metalbrain/backlog/actions/categories");
  },
});
