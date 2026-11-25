import {
  collectArgument,
  collectListArgument,
  defineChainedCommand,
} from "#workflows/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command
      .description("Add a backlog entry and print its ID.")
      .argument("<category>", "an existing category's name")
      .argument("<title>", "the problem or need")
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
        "--keywords <keywords>",
        "extra terms for the similar-entry search, not stored; comma-separated or repeated",
        collectListArgument,
      );
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/add");
  },
  parse(category, title, options) {
    return [category, title, options];
  },
});
