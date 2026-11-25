import { defineChainedCommand } from "#workflows/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command.description(
      "Append an entry with a new ID, the kind's namespace then 6 hex characters, and print the ID; writes nothing when the entry would break the file schema or exceed the log entry word cap.",
    );
  },
  extend() {
    return import("#bin/metalbrain/logs/actions/fieldOptions");
  },
  action() {
    return import("#bin/metalbrain/logs/actions/add");
  },
  parse(_options, command) {
    return [command.parent?.name() ?? "", command.opts()];
  },
});
