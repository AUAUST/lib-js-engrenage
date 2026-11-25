import { Option } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Record that entries mattered again: a tap at the current UTC time, with an optional one-line note within the log entry word cap, on each entry; takes several IDs, finding every entry before tapping any, so one unknown ID taps nothing and every unknown ID is named. `list` and `search` lines show each entry's tap count, `show` its taps.",
      )
      .argument("<ids...>", "the entries' IDs, as `<namespace>-xxxxxx`")
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
