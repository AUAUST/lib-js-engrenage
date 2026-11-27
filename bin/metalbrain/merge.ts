import { argument, command, option } from "#nexus/cli/index";

export default command({
  name: "merge",
  description: "Remove a new entry recording what another does, and tap the kept one.",
  chain: true,
  arguments: [
    argument({ name: "new-id", description: "the entry to remove" }),
    argument({ name: "kept-id", description: "the entry to keep and tap" }),
  ],
  options: [
    option({
      name: "note",
      type: "string",
      placeholder: "text",
      description: "the tap's note, on one line; defaults to the removed entry's title or subject",
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/merge");
  },
  parse(removed, kept, { note }, { path }) {
    return [removed, kept, note, path.at(-2) ?? ""];
  },
});
