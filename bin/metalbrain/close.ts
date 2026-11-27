import { argument, command } from "#nexus/cli/index";

export default command({
  name: "close",
  description: "Remove entries of any record kind, none when an ID is unknown.",
  arguments: [
    argument({
      name: "ids",
      description: "the entries' IDs of any kinds",
      variadic: true,
      separator: ",",
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/close");
  },
});
