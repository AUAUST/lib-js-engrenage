import { defineChainedCommand } from "#workflows/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command
      .description(
        "Replace fields of an entry, keeping its ID and other fields; writes nothing when the entry would break the file schema or exceed the log entry word cap.",
      )
      .argument("<id>", "the entry's ID, as `<namespace>-xxxxxx`");
  },
  extend() {
    return import("#bin/metalbrain/logs/actions/fieldOptions");
  },
  action() {
    return import("#bin/metalbrain/logs/actions/update");
  },
  parse(id, _options, command) {
    return [command.parent?.name() ?? "", id, command.opts()];
  },
});
