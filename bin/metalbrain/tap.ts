import { argument, command, option } from "#nexus/cli/index";

export default command({
  name: "tap",
  description: "Record that entries mattered again, none when an ID is unknown.",
  arguments: [
    argument({
      name: "ids",
      description: "the entries' IDs",
      variadic: true,
      separator: ",",
    }),
  ],
  options: [
    option({
      name: "note",
      type: "string",
      placeholder: "text",
      description: "context the entries lack, on one line",
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/tap");
  },
  parse(ids, { note }, { path }) {
    return [ids, note, path.at(-2) ?? ""];
  },
});
