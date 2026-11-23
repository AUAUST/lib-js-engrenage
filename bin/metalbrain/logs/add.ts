import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Append an entry with a new ID, `YYMMDD-xxxx` from the creation day, and print the ID; writes nothing when the entry would break the file schema or exceed the log entry word cap.",
    );
  },
  extend() {
    return import("#bin/metalbrain/logs/actions/addOptions");
  },
  action() {
    return import("#bin/metalbrain/logs/actions/add");
  },
  parse(_options, command) {
    return [command.parent?.name() ?? "", command.opts()];
  },
});
