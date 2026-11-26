import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description("List the entries.");
  },
  extend() {
    return import("#bin/metalbrain/logs/actions/filterOptions");
  },
  action() {
    return import("#bin/metalbrain/logs/actions/list");
  },
  parse(_options, command) {
    return [command.parent?.name() ?? "", command.opts()];
  },
});
