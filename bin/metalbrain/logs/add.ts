import { collectListArgument, defineChainedCommand } from "#nexus/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command
      .description("Add an entry and print its ID.")
      .option(
        "--keywords <keywords>",
        "extra terms for the similar-entry search, not stored; comma-separated or repeated",
        collectListArgument,
      );
  },
  extend() {
    return import("#bin/metalbrain/logs/actions/fieldOptions");
  },
  action() {
    return import("#bin/metalbrain/logs/actions/add");
  },
  parse({ keywords = [] }, command) {
    return [command.parent?.name() ?? "", command.opts(), keywords];
  },
});
