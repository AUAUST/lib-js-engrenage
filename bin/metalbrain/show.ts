import { argument, command } from "#nexus/cli/index";

export default command({
  name: "show",
  description: "Print entries of any record kind in full.",
  arguments: [
    argument({
      name: "ids",
      description: "the entries' IDs of any kinds",
      variadic: true,
      separator: ",",
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/show");
  },
});
