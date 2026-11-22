import {
  collectArgument,
  collectListArgument,
  defineLazyCommand,
} from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Append an entry with a new ID to `.ai/backlog/<category>.yml` and print the ID; writes nothing when the entry would break the backlog file schema.",
      )
      .argument("<category>", "an existing category's name")
      .argument("<title>", "the claim: the problem or need, stated exactly")
      .option(
        "--sites <sites>",
        "code sites as `<path>:<line>`, comma-separated or repeated",
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
      );
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/add");
  },
});
