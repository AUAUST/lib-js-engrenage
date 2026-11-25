import {
  collectArgument,
  collectListArgument,
  defineChainedCommand,
} from "#workflows/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command
      .description("Replace or remove fields of a backlog entry.")
      .argument("<id>", "the entry's ID")
      .option("--title <title>", "the problem or need")
      .option(
        "--sites <sites>",
        "code sites as `<path>:<line>`, each naming an existing file; comma-separated or repeated",
        collectListArgument,
      )
      .option("--why <text>", "context; repeat for a list", collectArgument)
      .option(
        "--want <text>",
        "expected outcome; repeat for a list",
        collectArgument,
      )
      .option(
        "--done <text>",
        "completion or obsolescence condition; repeat for a list",
        collectArgument,
      )
      .option(
        "--unset <field>",
        "fields to remove: `sites`, `why`, `want` or `done`; comma-separated or repeated",
        collectListArgument,
        [],
      );
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/update");
  },
  parse(id, options) {
    return [id, options];
  },
});
