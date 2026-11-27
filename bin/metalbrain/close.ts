import { argument, collectListArgument, command } from "#nexus/cli/index";

export default command({
  name: "close",
  description: "Remove entries of any record kind, none when an ID is unknown.",
  arguments: [
    argument({
      name: "ids",
      description: "the entries' IDs of any kinds, comma- or space-separated",
      variadic: true,
      reduce: collectListArgument,
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/close");
  },
});
