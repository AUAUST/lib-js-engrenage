import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "List the entries, one line each: ID, then `<subject>: <…> — <…>`.",
    );
  },
  action() {
    return import("#bin/metalbrain/logs/actions/list");
  },
  parse(_options, command) {
    return [command.parent?.name() ?? ""];
  },
});
