import { defineChainedCommand } from "#workflows/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command
      .description("Replace fields of an entry.")
      .argument("<id>", "the entry's ID");
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
