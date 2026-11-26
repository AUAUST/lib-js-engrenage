import { Option } from "@commander-js/extra-typings";

import { collectListArgument, defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Record that entries mattered again, none when an ID is unknown.",
      )
      .argument(
        "<ids...>",
        "the entries' IDs, comma- or space-separated",
        collectListArgument,
      )
      .addOption(
        new Option("--note <text>", "context the entries lack, on one line"),
      );
  },
  action() {
    return import("#bin/metalbrain/actions/tap");
  },
  parse(ids, options, command) {
    return [ids, options.note, command.parent?.name() ?? ""];
  },
});
