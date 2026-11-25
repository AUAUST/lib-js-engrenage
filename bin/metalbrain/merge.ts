import { Option } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Merge a new entry into an existing one recording the same thing: remove the new entry and tap the kept one, which keeps its `created` and receives the removed entry's taps; the tap's note defaults to the removed entry's title or subject.",
      )
      .argument("<new-id>", "the entry to remove, as `<namespace>-xxxxxx`")
      .argument("<kept-id>", "the entry to keep and tap")
      .addOption(
        new Option(
          "--note <text>",
          "the tap's note on one line, instead of the removed entry's title or subject",
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
