import { command } from "#nexus/cli/index";

export default command({
  name: "list",
  description: "List the entries.",
  options: [
    () => {
      return import("#bin/metalbrain/logs/actions/filterOptions");
    },
  ],
  action() {
    return import("#bin/metalbrain/logs/actions/list");
  },
  parse(_options, { path, options }) {
    return [path.at(-2) ?? "", options];
  },
});
