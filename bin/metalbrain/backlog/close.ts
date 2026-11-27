import { argument, collectListArgument, command } from "#nexus/cli/index";

export default command({
  name: "close",
  description: "Remove backlog entries, none when an ID is unknown; deletes a category left empty.",
  arguments: [
    argument({
      name: "ids",
      description: "the entries' IDs, comma- or space-separated",
      variadic: true,
      reduce: collectListArgument,
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/close");
  },
  parse(ids, _invocation) {
    return [ids, "backlog"];
  },
});
