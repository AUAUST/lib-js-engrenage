import { argument, command } from "#nexus/cli/index";

export default command({
  name: "move",
  description: "Move a backlog entry to another category, keeping its ID; deletes a category left empty.",
  chain: true,
  arguments: [
    argument({ name: "id", description: "the entry's ID" }),
    argument({ name: "category", description: "an existing category's name" }),
  ],
  action() {
    return import("#bin/metalbrain/backlog/actions/move");
  },
  parse(id, category, _invocation) {
    return [id, category];
  },
});
