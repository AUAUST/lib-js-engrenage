import { Option } from "@commander-js/extra-typings";

import { defineChainedCommand } from "#workflows/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command
      .description(
        "Remove a new entry recording what another does, and tap the kept one.",
      )
      .argument("<new-id>", "the entry to remove")
      .argument("<kept-id>", "the entry to keep and tap")
      .addOption(
        new Option(
          "--note <text>",
          "the tap's note, on one line; defaults to the removed entry's title or subject",
        ),
      );
  },
  action() {
    return import("#bin/metalbrain/actions/merge");
  },
  parse(removed, kept, options, command) {
    return [removed, kept, options.note, command.parent?.name() ?? ""];
  },
});
