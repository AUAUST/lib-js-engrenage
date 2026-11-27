import { argument, command } from "#nexus/cli/index";

export default command({
  name: "update",
  description: "Replace fields of an entry.",
  chain: true,
  arguments: [argument({ name: "id", description: "the entry's ID" })],
  options: [
    () => {
      return import("#bin/metalbrain/logs/actions/fieldOptions");
    },
  ],
  action() {
    return import("#bin/metalbrain/logs/actions/update");
  },
  parse(id, _options, { path, options }) {
    return [path.at(-2) ?? "", id, options];
  },
});
