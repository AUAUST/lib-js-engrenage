import { argument, collectListArgument, command } from "#nexus/cli/index";

export default command({
  name: "show",
  description: "Print entries in full.",
  arguments: [
    argument({
      name: "ids",
      description: "the entries' IDs, comma- or space-separated",
      variadic: true,
      reduce: collectListArgument,
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/show");
  },
  parse(ids, { path }) {
    return [ids, path.at(-2) ?? ""];
  },
});
