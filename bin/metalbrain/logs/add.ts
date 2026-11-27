import { command, option } from "#nexus/cli/index";

export default command({
  name: "add",
  description: "Add an entry and print its ID.",
  chain: true,
  options: [
    option({
      name: "keywords",
      type: "string",
      placeholder: "keywords",
      description: "extra terms for the similar-entry search, not stored",
      multiple: true,
      separator: ",",
    }),
    () => {
      return import("#bin/metalbrain/logs/actions/fieldOptions");
    },
  ],
  action() {
    return import("#bin/metalbrain/logs/actions/add");
  },
  parse({ keywords = [] }, { path, options }) {
    return [path.at(-2) ?? "", options, keywords];
  },
});
