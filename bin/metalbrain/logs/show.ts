import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Print an entry as YAML.")
      .argument("<id>", "the entry's ID, as `YYMMDD-xxxx`");
  },
  action() {
    return import("#bin/metalbrain/logs/actions/show");
  },
  parse(id, _options, command) {
    return [command.parent?.name() ?? "", id];
  },
});
